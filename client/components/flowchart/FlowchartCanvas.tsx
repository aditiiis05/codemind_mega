// client/components/flowchart/FlowchartCanvas.tsx
// High-performance interactive Flowchart Canvas with draggable nodes, real-time edge connections,
// smooth zoom, pan, curved SVG edges, decision branches, minimap, and node selection

'use client';

import React, { useRef, useState, useEffect, useCallback, useMemo, useImperativeHandle, forwardRef } from 'react';

// Named canvg import (ESM v4 async API)
import { Canvg } from 'canvg';

// Public API exposed via ref
export interface FlowchartCanvasHandle {
  fitToScreen: () => void;
  resetLayout: () => void;
  centerNode: (nodeId: string) => void;
  downloadPNG: (exportFileName?: string) => Promise<void>;
}
import { FlowNode as FlowNodeType, FlowEdge as FlowEdgeType } from '@/types/flowchart';
import FlowNode from './FlowNode';

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
    onNodeClick
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

  // Download the entire diagram as a PNG image
  const downloadPNG = useCallback(async (exportFileName?: string) => {
    const innerEl = innerContainerRef.current;
    const svgEl = svgRef.current;
    if (!innerEl || !svgEl || effectiveNodes.length === 0) return;

    const pad = 40;
    const minX = Math.min(...effectiveNodes.map(n => n.x ?? 0)) - pad;
    const minY = Math.min(...effectiveNodes.map(n => n.y ?? 0)) - pad;
    const maxX = Math.max(...effectiveNodes.map(n => (n.x ?? 0) + (n.width ?? 200))) + pad;
    const maxY = Math.max(...effectiveNodes.map(n => (n.y ?? 0) + (n.height ?? 70))) + pad;
    const diagW = maxX - minX;
    const diagH = maxY - minY;

    const SCALE = 2;
    const offscreen = document.createElement('canvas');
    offscreen.width = diagW * SCALE;
    offscreen.height = diagH * SCALE;
    const ctx = offscreen.getContext('2d');
    if (!ctx) return;

    // Background fill
    ctx.fillStyle = '#1e1e1e';
    ctx.fillRect(0, 0, offscreen.width, offscreen.height);

    // Dot-grid background
    const DOT_SPACING = 20 * SCALE;
    ctx.fillStyle = 'rgba(255,255,255,0.07)';
    for (let gx = ((-minX * SCALE) % DOT_SPACING + DOT_SPACING) % DOT_SPACING; gx < offscreen.width; gx += DOT_SPACING) {
      for (let gy = ((-minY * SCALE) % DOT_SPACING + DOT_SPACING) % DOT_SPACING; gy < offscreen.height; gy += DOT_SPACING) {
        ctx.beginPath();
        ctx.arc(gx, gy, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Temporarily remove pan/zoom transform so SVG coordinates are in layout space
    const savedTransform = innerEl.style.transform;
    innerEl.style.transform = 'none';

    // Serialize SVG and render via canvg
    const svgClone = svgEl.cloneNode(true) as SVGSVGElement;
    svgClone.setAttribute('viewBox', `${minX} ${minY} ${diagW} ${diagH}`);
    svgClone.setAttribute('width', String(diagW));
    svgClone.setAttribute('height', String(diagH));
    const svgString = new XMLSerializer().serializeToString(svgClone);

    try {
      ctx.save();
      ctx.scale(SCALE, SCALE);
      const canvgInstance = await Canvg.from(ctx, svgString, {
        ignoreMouse: true,
        ignoreAnimation: true,
        enableRedraw: false,
      });
      await canvgInstance.render();
      ctx.restore();
    } catch {
      // canvg failed — SVG layer won't render but nodes will still be drawn below
      ctx.restore();
    }

    // Restore transform
    innerEl.style.transform = savedTransform;

    // Node color scheme matching FlowNode component
    const NODE_COLORS: Record<string, { border: string; bg: string; text: string }> = {
      START:    { border: '#34d399', bg: '#064e3b', text: '#ffffff' },
      END:      { border: '#f87171', bg: '#450a0a', text: '#ffffff' },
      PROCESS:  { border: '#58a6ff', bg: '#0c1a2e', text: '#cccccc' },
      DECISION: { border: '#f59e0b', bg: '#1c1207', text: '#ffffff' },
      LOOP:     { border: '#818cf8', bg: '#1e1b4b', text: '#cccccc' },
      FUNCTION: { border: '#c084fc', bg: '#2e1065', text: '#cccccc' },
      INPUT:    { border: '#2dd4bf', bg: '#042f2e', text: '#cccccc' },
      OUTPUT:   { border: '#38bdf8', bg: '#082f49', text: '#cccccc' },
      RETURN:   { border: '#4ade80', bg: '#052e16', text: '#cccccc' },
      ERROR:    { border: '#f87171', bg: '#450a0a', text: '#cccccc' },
      FILE:     { border: '#22d3ee', bg: '#164e63', text: '#cccccc' },
    };

    ctx.save();
    ctx.scale(SCALE, SCALE);
    for (const node of effectiveNodes) {
      const nx = (node.x ?? 0) - minX;
      const ny = (node.y ?? 0) - minY;
      const nw = node.width ?? 200;
      const nh = node.height ?? 70;
      const colors = NODE_COLORS[node.type] ?? NODE_COLORS['PROCESS'];

      // Background rect
      ctx.fillStyle = colors.bg;
      roundRect(ctx, nx, ny, nw, nh, 6);
      ctx.fill();

      // Border
      ctx.strokeStyle = colors.border;
      ctx.lineWidth = 1.5;
      roundRect(ctx, nx, ny, nw, nh, 6);
      ctx.stroke();

      // Type badge pill
      ctx.fillStyle = colors.border + '33';
      roundRect(ctx, nx + 6, ny + 6, 54, 14, 3);
      ctx.fill();
      ctx.fillStyle = colors.border;
      ctx.font = 'bold 8px monospace';
      ctx.fillText(node.type, nx + 10, ny + 17);

      // Label text
      ctx.fillStyle = colors.text;
      ctx.font = '11px monospace';
      const maxChars = Math.floor(nw / 7.5);
      const labelStr = node.label.length > maxChars
        ? node.label.slice(0, maxChars - 1) + '…'
        : node.label;
      ctx.fillText(labelStr, nx + 10, ny + nh / 2 + 4);
    }
    ctx.restore();

    // Trigger browser download
    offscreen.toBlob((blob) => {
      if (!blob) return;
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
  }, [effectiveNodes]);

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
  }), [fitGraph, resetLayout, centerNode, downloadPNG]);

  // Mouse wheel zoom & pan
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();

    if (e.ctrlKey || e.metaKey) {
      // Zoom
      const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
      const newZoom = Math.min(Math.max(0.2, zoom * zoomFactor), 2.5);
      onZoomChange(newZoom);
    } else {
      // Pan
      setPan(prev => ({
        x: prev.x - e.deltaX,
        y: prev.y - e.deltaY
      }));
    }
  };

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
      onWheel={handleWheel}
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
