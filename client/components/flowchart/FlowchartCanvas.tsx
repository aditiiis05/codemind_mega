// client/components/flowchart/FlowchartCanvas.tsx
// High-performance interactive Flowchart Canvas with draggable nodes, real-time edge connections,
// smooth zoom, pan, curved SVG edges, decision branches, minimap, and node selection

'use client';

import React, { useRef, useState, useEffect, useCallback, useMemo, useImperativeHandle, forwardRef } from 'react';

// Public API exposed via ref
export interface FlowchartCanvasHandle {
  fitToScreen: () => void;
  resetLayout: () => void;
  centerNode: (nodeId: string) => void;
  downloadPNG: (exportFileName?: string) => Promise<void>;
  zoomToCenter: (newZoom: number) => void;
}
import { FlowNode as FlowNodeType, FlowEdge as FlowEdgeType } from '@/types/flowchart';
import FlowNode from './FlowNode';
import { NODE_COLORS } from './nodeColors';

interface FlowchartCanvasProps {
  nodes: FlowNodeType[];
  edges: FlowEdgeType[];
  bounds?: {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
    width: number;
    height: number;
  };
  selectedNodeId?: string | null;
  highlightedNodeId?: string | null;
  searchQuery?: string;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  showMinimap?: boolean;
  onNodeClick?: (node: FlowNodeType) => void;
  onResetLayout?: () => void;
  onDownloadError?: (msg: string) => void;
}

// Helper: draw a rounded rectangle path (works on all browsers)
function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

const FlowchartCanvasInner = (
  {
    nodes,
    edges,
    bounds,
    selectedNodeId,
    highlightedNodeId,
    searchQuery = '',
    zoom,
    onZoomChange,
    showMinimap = true,
    onNodeClick,
    onDownloadError,
  }: FlowchartCanvasProps,
  ref: React.Ref<FlowchartCanvasHandle>
) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const innerContainerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Pan offset state
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Custom node positions for interactive node-graph dragging
  const [customPositions, setCustomPositions] = useState<Record<string, { x: number; y: number }>>({});
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);
  const nodeDragRef = useRef<{
    nodeId: string;
    startMouseX: number;
    startMouseY: number;
    startNodeX: number;
    startNodeY: number;
    hasMoved: boolean;
  } | null>(null);

  // Track whether we've done the initial fit
  const hasFitRef = useRef(false);

  // Reset custom node positions when node count or structure completely changes
  const prevNodeIdsRef = useRef<string>('');
  useEffect(() => {
    const nodeIds = nodes.map(n => n.id).sort().join(',');
    if (nodeIds !== prevNodeIdsRef.current) {
      prevNodeIdsRef.current = nodeIds;
      setCustomPositions({});
    }
  }, [nodes]);

  // Compute effective node list with live custom positions
  const effectiveNodes = useMemo(() => {
    return nodes.map(n => {
      const custom = customPositions[n.id];
      if (custom) {
        return { ...n, x: custom.x, y: custom.y };
      }
      return n;
    });
  }, [nodes, customPositions]);

  // Node position map for quick dynamic edge lookups
  const nodeMap = useMemo(() => {
    const map = new Map<string, FlowNodeType>();
    effectiveNodes.forEach(n => map.set(n.id, n));
    return map;
  }, [effectiveNodes]);

  // Fit graph to container — waits for container to have real dimensions
  const fitGraph = useCallback(() => {
    if (!containerRef.current || effectiveNodes.length === 0) return;
    const container = containerRef.current;
    const cW = container.clientWidth;
    const cH = container.clientHeight;
    if (cW < 50 || cH < 50) return; // container not ready yet

    const b = bounds || {
      minX: Math.min(...effectiveNodes.map(n => n.x || 0)),
      minY: Math.min(...effectiveNodes.map(n => n.y || 0)),
      maxX: Math.max(...effectiveNodes.map(n => (n.x || 0) + (n.width || 200))),
      maxY: Math.max(...effectiveNodes.map(n => (n.y || 0) + (n.height || 70))),
      width: 800,
      height: 600
    };

    const graphW = Math.max(b.maxX - b.minX, 1);
    const graphH = Math.max(b.maxY - b.minY, 1);

    const PAD = 60;
    const scaleX = (cW - PAD * 2) / graphW;
    const scaleY = (cH - PAD * 2) / graphH;
    const newZoom = Math.min(Math.max(0.35, Math.min(scaleX, scaleY)), 1.2);

    onZoomChange(newZoom);

    const graphCenterX = (b.minX + b.maxX) / 2;
    const graphCenterY = (b.minY + b.maxY) / 2;
    setPan({
      x: cW / 2 - graphCenterX * newZoom,
      y: Math.max(30, cH / 2 - graphCenterY * newZoom)
    });
  }, [bounds, effectiveNodes, onZoomChange]);

  // Auto-fit via ResizeObserver so we wait for the container to have real dimensions
  useEffect(() => {
    hasFitRef.current = false;
  }, [nodes.length]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new ResizeObserver(() => {
      if (!hasFitRef.current && nodes.length > 0) {
        hasFitRef.current = true;
        fitGraph();
      }
    });
    observer.observe(el);

    if (!hasFitRef.current && nodes.length > 0) {
      hasFitRef.current = true;
      fitGraph();
    }

    return () => observer.disconnect();
  }, [nodes.length, fitGraph]);

  // Reset layout handler: clear manual dragging offsets
  const resetLayout = useCallback(() => {
    setCustomPositions({});
  }, []);

  // Center on a specific node in viewport
  const centerNode = useCallback((nodeId: string) => {
    if (!containerRef.current) return;
    const target = effectiveNodes.find(n => n.id === nodeId);
    if (!target) return;
    const cW = containerRef.current.clientWidth;
    const cH = containerRef.current.clientHeight;
    const nodeW = target.width || 200;
    const nodeH = target.height || 70;
    const nodeCenterX = (target.x || 0) + nodeW / 2;
    const nodeCenterY = (target.y || 0) + nodeH / 2;
    setPan({
      x: cW / 2 - nodeCenterX * zoom,
      y: cH / 2 - nodeCenterY * zoom
    });
  }, [effectiveNodes, zoom]);

  // Download the entire diagram as a PNG image — pure Canvas 2D (no canvg/SVG serialization)
  const downloadPNG = useCallback(async (exportFileName?: string) => {
    if (effectiveNodes.length === 0) {
      onDownloadError?.('No diagram to export.');
      return;
    }

    const PAD = 60;
    const minX = Math.min(...effectiveNodes.map(n => n.x ?? 0)) - PAD;
    const minY = Math.min(...effectiveNodes.map(n => n.y ?? 0)) - PAD;
    const maxX = Math.max(...effectiveNodes.map(n => (n.x ?? 0) + (n.width ?? 200))) + PAD;
    const maxY = Math.max(...effectiveNodes.map(n => (n.y ?? 0) + (n.height ?? 70))) + PAD;
    const diagW = maxX - minX;
    const diagH = maxY - minY;

    const SCALE = 2; // 2× for retina-quality
    const canvas = document.createElement('canvas');
    canvas.width = diagW * SCALE;
    canvas.height = diagH * SCALE;
    const ctx = canvas.getContext('2d');
    if (!ctx) { onDownloadError?.('Canvas context unavailable.'); return; }

    ctx.scale(SCALE, SCALE);

    // ── Background ──────────────────────────────────────────────────────
    ctx.fillStyle = '#1e1e1e';
    ctx.fillRect(0, 0, diagW, diagH);

    // Subtle dot-grid
    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    const DOT = 20;
    for (let gx = (((-minX) % DOT) + DOT) % DOT; gx < diagW; gx += DOT) {
      for (let gy = (((-minY) % DOT) + DOT) % DOT; gy < diagH; gy += DOT) {
        ctx.beginPath();
        ctx.arc(gx, gy, 1, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Helper: translate layout coords → canvas coords
    const tx = (x: number) => x - minX;
    const ty = (y: number) => y - minY;

    // ── Edges ────────────────────────────────────────────────────────────
    // Build a quick node map for edge path calculation
    const nMap = new Map<string, FlowNodeType>();
    effectiveNodes.forEach(n => nMap.set(n.id, n));

    // Edge color map
    const edgeColor = (edge: FlowEdgeType): string => {
      if (edge.label === 'YES' || edge.type === 'YES') return '#73c991';
      if (edge.label === 'NO'  || edge.type === 'NO')  return '#f14c4c';
      if (edge.label === 'CALLS'   || edge.type === 'CALLS')   return '#b180d7';
      if (edge.label === 'IMPORTS' || edge.type === 'IMPORTS') return '#4fc1ff';
      if (edge.label === 'LOOP'    || edge.type === 'LOOP')    return '#4fc1ff';
      if (edge.label === 'RETURN'  || edge.type === 'RETURN')  return '#73c991';
      return '#555555';
    };

    const isDashed = (edge: FlowEdgeType) =>
      edge.type === 'CALLS' || edge.type === 'LOOP' || edge.type === 'RETURN';

    // Draw arrowhead at (ex, ey) pointing in direction (dx, dy)
    const drawArrow = (ctx: CanvasRenderingContext2D, ex: number, ey: number, dx: number, dy: number, color: string) => {
      const len = Math.hypot(dx, dy);
      if (len === 0) return;
      const ux = dx / len; const uy = dy / len;
      const size = 9;
      ctx.beginPath();
      ctx.moveTo(ex, ey);
      ctx.lineTo(ex - size * ux + size * 0.45 * (-uy), ey - size * uy + size * 0.45 * ux);
      ctx.lineTo(ex - size * ux - size * 0.45 * (-uy), ey - size * uy - size * 0.45 * ux);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
    };

    for (const edge of edges) {
      const src = nMap.get(edge.source);
      const tgt = nMap.get(edge.target);
      if (!src || !tgt) continue;

      const sw = src.width ?? 200; const sh = src.height ?? 70;
      const tw = tgt.width ?? 200; const th = tgt.height ?? 70;
      const sx = src.x ?? 0; const sy = src.y ?? 0;
      const ex2 = tgt.x ?? 0; const ey2 = tgt.y ?? 0;

      const isLoopback = ey2 <= sy;
      const color = edgeColor(edge);

      ctx.strokeStyle = color;
      ctx.lineWidth = 1.8;
      ctx.setLineDash(isDashed(edge) ? [5, 3] : []);

      let x1: number, y1: number, x2: number, y2: number;
      let cp1x: number, cp1y: number, cp2x: number, cp2y: number;

      if (isLoopback) {
        x1 = tx(sx + sw); y1 = ty(sy + sh / 2);
        x2 = tx(ex2 + tw); y2 = ty(ey2 + th / 2);
        const off = Math.max(80, Math.abs(y1 - y2) * 0.4);
        cp1x = x1 + off; cp1y = y1;
        cp2x = x2 + off; cp2y = y2;
      } else {
        x1 = tx(sx + sw / 2); y1 = ty(sy + sh);
        if (src.type === 'DECISION') {
          if (edge.label === 'YES' || edge.type === 'YES') x1 = tx(sx + sw * 0.25);
          else if (edge.label === 'NO' || edge.type === 'NO') x1 = tx(sx + sw * 0.75);
        }
        x2 = tx(ex2 + tw / 2); y2 = ty(ey2);
        const dy = y2 - y1;
        cp1x = x1; cp1y = y1 + dy * 0.45;
        cp2x = x2; cp2y = y2 - dy * 0.45;
      }

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x2, y2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Arrowhead at end
      const tdx = x2 - cp2x; const tdy = y2 - cp2y;
      drawArrow(ctx, x2, y2, tdx, tdy, color);

      // Edge label
      if (edge.label) {
        const midX = (x1 + 3 * cp1x + 3 * cp2x + x2) / 8;
        const midY = (y1 + 3 * cp1y + 3 * cp2y + y2) / 8;
        const lw = 44; const lh = 18;
        ctx.fillStyle = '#252526';
        roundRect(ctx, midX - lw / 2, midY - lh / 2, lw, lh, 4);
        ctx.fill();
        ctx.strokeStyle = '#3c3c3c'; ctx.lineWidth = 1;
        roundRect(ctx, midX - lw / 2, midY - lh / 2, lw, lh, 4);
        ctx.stroke();
        ctx.fillStyle = color;
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(edge.label, midX, midY);
        ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
      }
    }

    // ── Nodes ────────────────────────────────────────────────────────────
    for (const node of effectiveNodes) {
      const nx = tx(node.x ?? 0);
      const ny = ty(node.y ?? 0);
      const nw = node.width ?? 200;
      const nh = node.height ?? 70;
      const colors = NODE_COLORS[node.type] ?? NODE_COLORS['PROCESS'];

      // Shadow
      ctx.shadowColor = colors.border + '40';
      ctx.shadowBlur = 8;

      // Background
      ctx.fillStyle = colors.bg;
      roundRect(ctx, nx, ny, nw, nh, 8);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Border
      ctx.strokeStyle = colors.border;
      ctx.lineWidth = 1.5;
      roundRect(ctx, nx, ny, nw, nh, 8);
      ctx.stroke();

      // Type badge
      const badgeW = Math.min(nw - 12, ctx.measureText(node.type).width + 16);
      ctx.fillStyle = colors.border + '30';
      roundRect(ctx, nx + 8, ny + 7, badgeW, 14, 3);
      ctx.fill();
      ctx.fillStyle = colors.border;
      ctx.font = 'bold 8px monospace';
      ctx.textBaseline = 'middle';
      ctx.fillText(node.type, nx + 12, ny + 14);

      // Label
      ctx.fillStyle = colors.text;
      ctx.font = '11px -apple-system, BlinkMacSystemFont, monospace';
      ctx.textBaseline = 'middle';
      const maxW = nw - 16;
      let labelStr = node.label;
      while (ctx.measureText(labelStr).width > maxW && labelStr.length > 4) {
        labelStr = labelStr.slice(0, -1);
      }
      if (labelStr !== node.label) labelStr = labelStr.slice(0, -1) + '…';
      ctx.fillText(labelStr, nx + 10, ny + nh / 2 + 8);

      // Line number badge (bottom right)
      if (node.lineStart) {
        const lineStr = `Ln ${node.lineStart}`;
        const lw2 = ctx.measureText(lineStr).width + 8;
        ctx.fillStyle = '#1e1e1e';
        roundRect(ctx, nx + nw - lw2 - 4, ny + nh - 16, lw2, 12, 2);
        ctx.fill();
        ctx.fillStyle = '#555555';
        ctx.font = '8px monospace';
        ctx.textBaseline = 'middle';
        ctx.fillText(lineStr, nx + nw - lw2 - 1, ny + nh - 10);
      }

      ctx.textBaseline = 'alphabetic';
    }

    // ── Download ─────────────────────────────────────────────────────────
    canvas.toBlob((blob) => {
      if (!blob) { onDownloadError?.('Failed to generate PNG blob.'); return; }
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const today = new Date().toISOString().slice(0, 10);
      a.href = url;
      a.download = exportFileName ?? `codemind-flowchart-${today}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    }, 'image/png');
  }, [effectiveNodes, edges, onDownloadError]);

  // Expose fitToScreen, resetLayout, centerNode, and downloadPNG to parent via ref
  useImperativeHandle(ref, () => ({
    fitToScreen: () => {
      hasFitRef.current = false;
      fitGraph();
    },
    resetLayout: () => {
      resetLayout();
    },
    centerNode: (nodeId: string) => {
      centerNode(nodeId);
    },
    downloadPNG: (exportFileName?: string) => downloadPNG(exportFileName),
    zoomToCenter: (newZoom: number) => {
      if (!containerRef.current) { onZoomChange(newZoom); return; }
      const cW = containerRef.current.clientWidth;
      const cH = containerRef.current.clientHeight;
      const current = zoomRef.current;
      if (current === 0) { onZoomChange(newZoom); return; }
      const factor = newZoom / current;
      setZoomAndPanRef.current(factor, cW / 2, cH / 2);
    },
  }), [fitGraph, resetLayout, centerNode, downloadPNG, onZoomChange]);

  // Mouse wheel zoom (toward cursor) & pan — handled by native listener above, kept for reference
  // The useCallback below is unused but left for the setZoomAndPan helper

  // Zoom toward a screen point — stored in a ref so the wheel handler always gets the latest version
  const zoomRef = useRef(zoom);
  useEffect(() => { zoomRef.current = zoom; }, [zoom]);

  const setZoomAndPanFn = useCallback((factor: number, screenX: number, screenY: number) => {
    const current = zoomRef.current;
    const newZoom = Math.min(Math.max(0.15, current * factor), 3.0);
    setPan(prev => ({
      x: screenX - (screenX - prev.x) * (newZoom / current),
      y: screenY - (screenY - prev.y) * (newZoom / current),
    }));
    onZoomChange(newZoom);
  }, [onZoomChange]);

  const setZoomAndPanRef = useRef(setZoomAndPanFn);
  useEffect(() => { setZoomAndPanRef.current = setZoomAndPanFn; }, [setZoomAndPanFn]);

  // Attach wheel listener as non-passive so preventDefault works
  // Uses a ref to setZoomAndPan so the [] deps effect always calls the latest implementation
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      if (e.ctrlKey || e.metaKey || (Math.abs(e.deltaY) > 0 && Math.abs(e.deltaY) >= Math.abs(e.deltaX))) {
        const factor = e.deltaY < 0 ? 1.12 : 1 / 1.12;
        setZoomAndPanRef.current(factor, mouseX, mouseY);
      } else {
        setPan(prev => ({ x: prev.x - e.deltaX, y: prev.y - e.deltaY }));
      }
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  // Drag canvas background to pan
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Left click only
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  // Drag individual node to move anywhere on graph
  const handleNodeMouseDown = (e: React.MouseEvent, node: FlowNodeType) => {
    if (e.button !== 0) return;
    e.stopPropagation();

    const currentX = customPositions[node.id]?.x ?? (node.x || 0);
    const currentY = customPositions[node.id]?.y ?? (node.y || 0);

    nodeDragRef.current = {
      nodeId: node.id,
      startMouseX: e.clientX,
      startMouseY: e.clientY,
      startNodeX: currentX,
      startNodeY: currentY,
      hasMoved: false
    };
    setDraggedNodeId(node.id);
  };

  // Window-level dragging handlers for smooth node movement across canvas boundaries
  useEffect(() => {
    const handleWindowMouseMove = (e: MouseEvent) => {
      if (nodeDragRef.current) {
        const { nodeId, startMouseX, startMouseY, startNodeX, startNodeY } = nodeDragRef.current;
        const dx = (e.clientX - startMouseX) / zoom;
        const dy = (e.clientY - startMouseY) / zoom;

        if (Math.hypot(dx, dy) > 3) {
          nodeDragRef.current.hasMoved = true;
        }

        setCustomPositions(prev => ({
          ...prev,
          [nodeId]: {
            x: Math.round(startNodeX + dx),
            y: Math.round(startNodeY + dy)
          }
        }));
        return;
      }

      if (isDragging) {
        setPan({
          x: e.clientX - dragStart.x,
          y: e.clientY - dragStart.y
        });
      }
    };

    const handleWindowMouseUp = () => {
      if (nodeDragRef.current) {
        const { nodeId, hasMoved } = nodeDragRef.current;
        nodeDragRef.current = null;
        setDraggedNodeId(null);

        // If mouse didn't drag significantly, trigger node select / click navigation
        if (!hasMoved) {
          const clicked = effectiveNodes.find(n => n.id === nodeId);
          if (clicked && onNodeClick) {
            onNodeClick(clicked);
          }
        }
        return;
      }

      setIsDragging(false);
    };

    if (draggedNodeId || isDragging) {
      window.addEventListener('mousemove', handleWindowMouseMove);
      window.addEventListener('mouseup', handleWindowMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleWindowMouseMove);
        window.removeEventListener('mouseup', handleWindowMouseUp);
      };
    }
  }, [draggedNodeId, isDragging, dragStart, zoom, effectiveNodes, onNodeClick]);

  // Compute dynamic SVG cubic Bezier path between source and target nodes based on live positions
  const calculateEdgePath = (edge: FlowEdgeType) => {
    const sourceNode = nodeMap.get(edge.source);
    const targetNode = nodeMap.get(edge.target);

    if (!sourceNode || !targetNode) return null;

    const sWidth = sourceNode.width || 200;
    const sHeight = sourceNode.height || 70;
    const tWidth = targetNode.width || 200;
    const tHeight = targetNode.height || 70;

    const sX = sourceNode.x || 0;
    const sY = sourceNode.y || 0;
    const tX = targetNode.x || 0;
    const tY = targetNode.y || 0;

    // Check if it's a loopback edge (target above source or same node)
    const isLoopback = tY <= sY;

    if (isLoopback) {
      // Route around the right side for loops
      const startX = sX + sWidth;
      const startY = sY + sHeight / 2;
      const endX = tX + tWidth;
      const endY = tY + tHeight / 2;
      const curveOffset = Math.max(80, Math.abs(startY - endY) * 0.4);

      const path = `M ${startX} ${startY} C ${startX + curveOffset} ${startY}, ${endX + curveOffset} ${endY}, ${endX} ${endY}`;
      return {
        path,
        midX: Math.max(startX, endX) + curveOffset * 0.6,
        midY: (startY + endY) / 2
      };
    }

    // Normal top-down edge
    let startX = sX + sWidth / 2;
    const startY = sY + sHeight;

    // If source is DECISION, offset YES to left, NO to right
    if (sourceNode.type === 'DECISION') {
      if (edge.label === 'YES' || edge.type === 'YES') {
        startX = sX + sWidth * 0.25;
      } else if (edge.label === 'NO' || edge.type === 'NO') {
        startX = sX + sWidth * 0.75;
      }
    }

    const endX = tX + tWidth / 2;
    const endY = tY;

    const deltaY = endY - startY;
    const cpY1 = startY + deltaY * 0.45;
    const cpY2 = endY - deltaY * 0.45;

    const path = `M ${startX} ${startY} C ${startX} ${cpY1}, ${endX} ${cpY2}, ${endX} ${endY}`;
    return {
      path,
      midX: (startX + endX) / 2,
      midY: (startY + endY) / 2
    };
  };

  // Determine edge color and marker based on edge label/type
  const getEdgeStyle = (edge: FlowEdgeType) => {
    if (edge.label === 'YES' || edge.type === 'YES') {
      return { color: '#73c991', marker: 'url(#arrow-yes)',     strokeWidth: 2.2,  dash: undefined };
    }
    if (edge.label === 'NO' || edge.type === 'NO') {
      return { color: '#f14c4c', marker: 'url(#arrow-no)',      strokeWidth: 2.2,  dash: undefined };
    }
    if (edge.label === 'CALLS' || edge.type === 'CALLS') {
      return { color: '#b180d7', marker: 'url(#arrow-calls)',   strokeWidth: 2.0,  dash: '5,3' };
    }
    if (edge.label === 'IMPORTS' || edge.type === 'IMPORTS') {
      return { color: '#4fc1ff', marker: 'url(#arrow-imports)', strokeWidth: 2.0,  dash: undefined };
    }
    if (edge.label === 'LOOP' || edge.type === 'LOOP') {
      return { color: '#4fc1ff', marker: 'url(#arrow-loop)',    strokeWidth: 2.0,  dash: '5,3' };
    }
    if (edge.label === 'RETURN' || edge.type === 'RETURN') {
      return { color: '#73c991', marker: 'url(#arrow-default)', strokeWidth: 2.0,  dash: '4,3' };
    }
    return { color: '#555555',   marker: 'url(#arrow-default)', strokeWidth: 1.8,  dash: undefined };
  };

  // Search match evaluator
  const isMatch = (node: FlowNodeType): boolean => {
    if (!searchQuery.trim()) return false;
    const q = searchQuery.toLowerCase();
    return !!(
      node.label.toLowerCase().includes(q) ||
      (node.file && node.file.toLowerCase().includes(q)) ||
      (node.functionName && node.functionName.toLowerCase().includes(q))
    );
  };

  return (
    <div
      ref={containerRef}
      onMouseDown={handleCanvasMouseDown}
      className={`relative w-full h-full overflow-hidden bg-[#1e1e1e] select-none ${
        draggedNodeId ? 'cursor-grabbing' : isDragging ? 'cursor-grabbing' : 'cursor-grab'
      }`}
      style={{
        backgroundImage: `radial-gradient(circle, rgba(255, 255, 255, 0.08) 1px, transparent 1px)`,
        backgroundSize: `${20 * zoom}px ${20 * zoom}px`,
        backgroundPosition: `${pan.x}px ${pan.y}px`
      }}
    >
      {/* Zoom / Canvas Transformation Container */}
      <div
        ref={innerContainerRef}
        className="absolute top-0 left-0 origin-top-left transition-transform duration-75"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`
        }}
      >
        {/* Dynamic SVG Layer for Edges, Paths, and Arrow Markers */}
        <svg
          ref={svgRef}
          className="absolute top-0 left-0 pointer-events-none"
          style={{
            width: (bounds?.width || 3000) + 2000,
            height: (bounds?.height || 3000) + 2000,
            overflow: 'visible'
          }}
        >
          <defs>
            {/* Arrow Marker Definitions */}
            <marker
              id="arrow-default"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 9 5 L 0 9 z" fill="#666666" />
            </marker>

            <marker
              id="arrow-yes"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 9 5 L 0 9 z" fill="#73c991" />
            </marker>

            <marker
              id="arrow-no"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 9 5 L 0 9 z" fill="#f14c4c" />
            </marker>

            <marker
              id="arrow-calls"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 9 5 L 0 9 z" fill="#b180d7" />
            </marker>

            <marker
              id="arrow-imports"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 9 5 L 0 9 z" fill="#4fc1ff" />
            </marker>

            <marker
              id="arrow-loop"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 9 5 L 0 9 z" fill="#4fc1ff" />
            </marker>
          </defs>

          {/* Render All Dynamic Edges */}
          {edges.map((edge) => {
            const edgeCalc = calculateEdgePath(edge);
            if (!edgeCalc) return null;
            const style = getEdgeStyle(edge);

            return (
              <g key={edge.id} className="transition-opacity duration-150">
                <path
                  d={edgeCalc.path}
                  fill="none"
                  stroke={style.color}
                  strokeWidth={style.strokeWidth}
                  strokeDasharray={style.dash}
                  markerEnd={style.marker}
                />

                {/* Edge Label (e.g. YES, NO, CALLS, IMPORTS) */}
                {edge.label && (
                  <g transform={`translate(${edgeCalc.midX}, ${edgeCalc.midY})`}>
                    <rect
                      x={-24}
                      y={-10}
                      width={48}
                      height={20}
                      rx={4}
                      fill="#252526"
                      stroke="#3c3c3c"
                      strokeWidth={1}
                    />
                    <text
                      x={0}
                      y={4}
                      textAnchor="middle"
                      fill={style.color}
                      fontSize="10px"
                      fontWeight="bold"
                      fontFamily="'Monaco','Menlo','Consolas',monospace"
                    >
                      {edge.label}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>

        {/* HTML Node Elements with Drag and Drop Support */}
        {effectiveNodes.map((node) => {
          const isSelected = selectedNodeId === node.id;
          const isHighlighted = highlightedNodeId === node.id;
          const searchMatch = isMatch(node);
          const isBeingDragged = draggedNodeId === node.id;

          return (
            <div
              key={node.id}
              onMouseDown={(e) => handleNodeMouseDown(e, node)}
              className={`absolute select-none cursor-grab active:cursor-grabbing transition-shadow ${
                isBeingDragged ? 'z-40 shadow-2xl scale-[1.02] cursor-grabbing opacity-95' : 'z-10 hover:z-20'
              }`}
              style={{
                left: node.x || 0,
                top: node.y || 0,
                width: node.width || 200,
                height: node.height || 70,
                touchAction: 'none'
              }}
            >
              <FlowNode
                node={node}
                isSelected={isSelected}
                isSearchMatch={searchMatch}
                isHighlighted={isHighlighted}
                onClick={() => {}}
              />
            </div>
          );
        })}
      </div>

      {/* Floating Minimap with Visual Studio Dark+ aesthetics */}
      {showMinimap && effectiveNodes.length > 0 && (
        <div className="absolute bottom-3 right-3 w-48 h-36 bg-[#252526] border border-[#3c3c3c] rounded-xl shadow-xl p-2 overflow-hidden pointer-events-auto z-40">
          <div className="text-[9.5px] font-mono text-[#858585] uppercase tracking-wider mb-1.5 flex justify-between items-center px-1">
            <span className="font-semibold text-[#cccccc]">Minimap</span>
            <span className="text-[8.5px] text-[#75beff] bg-[#094771] px-1.5 py-0.2 rounded font-mono">{effectiveNodes.length} nodes</span>
          </div>

          <div className="relative w-full h-[98px] bg-[#1e1e1e] rounded-lg border border-[#3c3c3c] overflow-hidden">
            {/* Miniature node dots */}
            {(() => {
              const b = bounds || { minX: 0, minY: 0, maxX: 1000, maxY: 1000, width: 1000, height: 1000 };
              const mapWidth = 160;
              const mapHeight = 88;
              const scaleX = mapWidth / (b.width || 1000);
              const scaleY = mapHeight / (b.height || 1000);
              const miniScale = Math.min(scaleX, scaleY) * 0.9;

              return (
                <>
                  {effectiveNodes.map(n => {
                    const nx = ((n.x || 0) - b.minX) * miniScale + 6;
                    const ny = ((n.y || 0) - b.minY) * miniScale + 6;
                    const dotColor =
                      n.type === 'START'
                        ? '#73c991'
                        : n.type === 'END'
                        ? '#f14c4c'
                        : n.type === 'DECISION'
                        ? '#cca700'
                        : n.type === 'FUNCTION'
                        ? '#b180d7'
                        : n.type === 'LOOP'
                        ? '#4fc1ff'
                        : '#007acc';

                    return (
                      <div
                        key={n.id}
                        className="absolute rounded-xs"
                        style={{
                          left: nx,
                          top: ny,
                          width: Math.max(3, (n.width || 100) * miniScale * 0.5),
                          height: Math.max(2, (n.height || 50) * miniScale * 0.5),
                          backgroundColor: dotColor,
                          opacity: selectedNodeId === n.id ? 1 : 0.7
                        }}
                      />
                    );
                  })}
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

const FlowchartCanvas = forwardRef<FlowchartCanvasHandle, FlowchartCanvasProps>(FlowchartCanvasInner);
export default FlowchartCanvas;
