// client/components/flowchart/FlowchartCanvas.tsx
<<<<<<< HEAD
// High-performance interactive Flowchart Canvas with draggable nodes, real-time edge connections,
// smooth zoom, pan, curved SVG edges, decision branches, minimap, and node selection

'use client';

import React, { useRef, useState, useEffect, useCallback, useMemo, useImperativeHandle, forwardRef } from 'react';
=======
// High-performance interactive Flowchart Canvas with smooth zoom, pan, curved SVG edges, decision branches, minimap, and node selection

'use client';

import React, { useRef, useState, useEffect, useCallback, useImperativeHandle, forwardRef } from 'react';
>>>>>>> 1fedef5cdf2fa8631c20411f700509b8bbdcb0e2

// Public API exposed via ref
export interface FlowchartCanvasHandle {
  fitToScreen: () => void;
<<<<<<< HEAD
  resetLayout: () => void;
  centerNode: (nodeId: string) => void;
=======
>>>>>>> 1fedef5cdf2fa8631c20411f700509b8bbdcb0e2
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
<<<<<<< HEAD
  onResetLayout?: () => void;
=======
>>>>>>> 1fedef5cdf2fa8631c20411f700509b8bbdcb0e2
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

  // Pan offset state
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
<<<<<<< HEAD

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
=======
  // Track whether we've done the initial fit
  const hasFitRef = useRef(false);

  // Fit graph to container — waits for container to have real dimensions
  const fitGraph = useCallback(() => {
    if (!containerRef.current || nodes.length === 0) return;
>>>>>>> 1fedef5cdf2fa8631c20411f700509b8bbdcb0e2
    const container = containerRef.current;
    const cW = container.clientWidth;
    const cH = container.clientHeight;
    if (cW < 50 || cH < 50) return; // container not ready yet

    const b = bounds || {
<<<<<<< HEAD
      minX: Math.min(...effectiveNodes.map(n => n.x || 0)),
      minY: Math.min(...effectiveNodes.map(n => n.y || 0)),
      maxX: Math.max(...effectiveNodes.map(n => (n.x || 0) + (n.width || 200))),
      maxY: Math.max(...effectiveNodes.map(n => (n.y || 0) + (n.height || 70))),
=======
      minX: Math.min(...nodes.map(n => n.x || 0)),
      minY: Math.min(...nodes.map(n => n.y || 0)),
      maxX: Math.max(...nodes.map(n => (n.x || 0) + (n.width || 200))),
      maxY: Math.max(...nodes.map(n => (n.y || 0) + (n.height || 70))),
>>>>>>> 1fedef5cdf2fa8631c20411f700509b8bbdcb0e2
      width: 800,
      height: 600
    };

    const graphW = Math.max(b.maxX - b.minX, 1);
    const graphH = Math.max(b.maxY - b.minY, 1);

    const PAD = 60;
    const scaleX = (cW - PAD * 2) / graphW;
    const scaleY = (cH - PAD * 2) / graphH;
<<<<<<< HEAD
=======
    // Use scaleX only so wide graphs fit horizontally; clamp to sensible range
>>>>>>> 1fedef5cdf2fa8631c20411f700509b8bbdcb0e2
    const newZoom = Math.min(Math.max(0.35, Math.min(scaleX, scaleY)), 1.2);

    onZoomChange(newZoom);

    const graphCenterX = (b.minX + b.maxX) / 2;
    const graphCenterY = (b.minY + b.maxY) / 2;
    setPan({
      x: cW / 2 - graphCenterX * newZoom,
      y: Math.max(30, cH / 2 - graphCenterY * newZoom)
    });
<<<<<<< HEAD
  }, [bounds, effectiveNodes, onZoomChange]);
=======
  }, [bounds, nodes, onZoomChange]);
>>>>>>> 1fedef5cdf2fa8631c20411f700509b8bbdcb0e2

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

<<<<<<< HEAD
=======
    // Also try immediately in case it's already sized
>>>>>>> 1fedef5cdf2fa8631c20411f700509b8bbdcb0e2
    if (!hasFitRef.current && nodes.length > 0) {
      hasFitRef.current = true;
      fitGraph();
    }

    return () => observer.disconnect();
  }, [nodes.length, fitGraph]);

<<<<<<< HEAD
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

  // Expose fitToScreen, resetLayout, and centerNode to parent via ref
=======
  // Expose fitToScreen to parent via ref
>>>>>>> 1fedef5cdf2fa8631c20411f700509b8bbdcb0e2
  useImperativeHandle(ref, () => ({
    fitToScreen: () => {
      hasFitRef.current = false;
      fitGraph();
<<<<<<< HEAD
    },
    resetLayout: () => {
      resetLayout();
    },
    centerNode: (nodeId: string) => {
      centerNode(nodeId);
    }
  }), [fitGraph, resetLayout, centerNode]);
=======
    }
  }), [fitGraph]);
>>>>>>> 1fedef5cdf2fa8631c20411f700509b8bbdcb0e2

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

<<<<<<< HEAD
  // Drag canvas background to pan
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
=======
  // Drag to pan
  const handleMouseDown = (e: React.MouseEvent) => {
>>>>>>> 1fedef5cdf2fa8631c20411f700509b8bbdcb0e2
    if (e.button !== 0) return; // Left click only
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

<<<<<<< HEAD
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
=======
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Node position map for quick edge lookups
  const nodeMap = new Map<string, FlowNodeType>();
  nodes.forEach(n => nodeMap.set(n.id, n));

  // Compute SVG cubic Bezier path between source and target nodes
>>>>>>> 1fedef5cdf2fa8631c20411f700509b8bbdcb0e2
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
<<<<<<< HEAD
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
=======
      return { color: '#34d399', marker: 'url(#arrow-yes)',     strokeWidth: 2.5,  dash: undefined };
    }
    if (edge.label === 'NO' || edge.type === 'NO') {
      return { color: '#f87171', marker: 'url(#arrow-no)',      strokeWidth: 2.5,  dash: undefined };
    }
    if (edge.label === 'CALLS' || edge.type === 'CALLS') {
      return { color: '#c084fc', marker: 'url(#arrow-calls)',   strokeWidth: 2.2,  dash: '6,4' };
    }
    if (edge.label === 'IMPORTS' || edge.type === 'IMPORTS') {
      return { color: '#22d3ee', marker: 'url(#arrow-imports)', strokeWidth: 2.2,  dash: undefined };
    }
    if (edge.label === 'LOOP' || edge.type === 'LOOP') {
      return { color: '#818cf8', marker: 'url(#arrow-loop)',    strokeWidth: 2.2,  dash: '5,4' };
    }
    if (edge.label === 'RETURN' || edge.type === 'RETURN') {
      return { color: '#4ade80', marker: 'url(#arrow-default)', strokeWidth: 2.0,  dash: '4,3' };
    }
    return { color: '#4b5563',   marker: 'url(#arrow-default)', strokeWidth: 2.0,  dash: undefined };
>>>>>>> 1fedef5cdf2fa8631c20411f700509b8bbdcb0e2
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
<<<<<<< HEAD
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
=======
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      className={`relative w-full h-full overflow-hidden bg-[#0d1117] select-none ${
        isDragging ? 'cursor-grabbing' : 'cursor-grab'
      }`}
      style={{
        backgroundImage: `radial-gradient(circle, #30363d 1px, transparent 1px)`,
        backgroundSize: `${24 * zoom}px ${24 * zoom}px`,
        backgroundPosition: `${pan.x}px ${pan.y}px`
      }}
    >
      {/* Zoom / Canvas Container */}
>>>>>>> 1fedef5cdf2fa8631c20411f700509b8bbdcb0e2
      <div
        className="absolute top-0 left-0 origin-top-left transition-transform duration-75"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`
        }}
      >
<<<<<<< HEAD
        {/* Dynamic SVG Layer for Edges, Paths, and Arrow Markers */}
        <svg
          className="absolute top-0 left-0 pointer-events-none"
          style={{
            width: (bounds?.width || 3000) + 2000,
            height: (bounds?.height || 3000) + 2000,
=======
        {/* SVG Layer for Edges, Paths, and Arrow Markers */}
        <svg
          className="absolute top-0 left-0 pointer-events-none"
          style={{
            width: (bounds?.width || 2500) + 1000,
            height: (bounds?.height || 2500) + 1000,
>>>>>>> 1fedef5cdf2fa8631c20411f700509b8bbdcb0e2
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
<<<<<<< HEAD
              <path d="M 0 1 L 9 5 L 0 9 z" fill="#666666" />
=======
              <path d="M 0 1 L 9 5 L 0 9 z" fill="#64748b" />
>>>>>>> 1fedef5cdf2fa8631c20411f700509b8bbdcb0e2
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
<<<<<<< HEAD
              <path d="M 0 1 L 9 5 L 0 9 z" fill="#73c991" />
=======
              <path d="M 0 1 L 9 5 L 0 9 z" fill="#34d399" />
>>>>>>> 1fedef5cdf2fa8631c20411f700509b8bbdcb0e2
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
<<<<<<< HEAD
              <path d="M 0 1 L 9 5 L 0 9 z" fill="#f14c4c" />
=======
              <path d="M 0 1 L 9 5 L 0 9 z" fill="#f87171" />
>>>>>>> 1fedef5cdf2fa8631c20411f700509b8bbdcb0e2
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
<<<<<<< HEAD
              <path d="M 0 1 L 9 5 L 0 9 z" fill="#b180d7" />
=======
              <path d="M 0 1 L 9 5 L 0 9 z" fill="#c084fc" />
>>>>>>> 1fedef5cdf2fa8631c20411f700509b8bbdcb0e2
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
<<<<<<< HEAD
              <path d="M 0 1 L 9 5 L 0 9 z" fill="#4fc1ff" />
=======
              <path d="M 0 1 L 9 5 L 0 9 z" fill="#22d3ee" />
>>>>>>> 1fedef5cdf2fa8631c20411f700509b8bbdcb0e2
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
<<<<<<< HEAD
              <path d="M 0 1 L 9 5 L 0 9 z" fill="#4fc1ff" />
            </marker>
          </defs>

          {/* Render All Dynamic Edges */}
=======
              <path d="M 0 1 L 9 5 L 0 9 z" fill="#818cf8" />
            </marker>
          </defs>

          {/* Render All Edges */}
>>>>>>> 1fedef5cdf2fa8631c20411f700509b8bbdcb0e2
          {edges.map((edge) => {
            const edgeCalc = calculateEdgePath(edge);
            if (!edgeCalc) return null;
            const style = getEdgeStyle(edge);

            return (
<<<<<<< HEAD
              <g key={edge.id} className="transition-opacity duration-150">
=======
              <g key={edge.id} className="transition-opacity duration-200">
>>>>>>> 1fedef5cdf2fa8631c20411f700509b8bbdcb0e2
                <path
                  d={edgeCalc.path}
                  fill="none"
                  stroke={style.color}
                  strokeWidth={style.strokeWidth}
                  strokeDasharray={style.dash}
                  markerEnd={style.marker}
<<<<<<< HEAD
=======
                  className="transition-all"
>>>>>>> 1fedef5cdf2fa8631c20411f700509b8bbdcb0e2
                />

                {/* Edge Label (e.g. YES, NO, CALLS, IMPORTS) */}
                {edge.label && (
                  <g transform={`translate(${edgeCalc.midX}, ${edgeCalc.midY})`}>
                    <rect
<<<<<<< HEAD
                      x={-24}
                      y={-10}
                      width={48}
                      height={20}
                      rx={4}
                      fill="#252526"
                      stroke="#3c3c3c"
                      strokeWidth={1}
=======
                      x={-28}
                      y={-12}
                      width={56}
                      height={24}
                      rx={5}
                      fill="#0d1117"
                      stroke={style.color}
                      strokeWidth={1.5}
>>>>>>> 1fedef5cdf2fa8631c20411f700509b8bbdcb0e2
                    />
                    <text
                      x={0}
                      y={4}
                      textAnchor="middle"
                      fill={style.color}
<<<<<<< HEAD
                      fontSize="10px"
                      fontWeight="bold"
                      fontFamily="'Monaco','Menlo','Consolas',monospace"
=======
                      fontSize="11px"
                      fontWeight="bold"
                      fontFamily="'Monaco','Menlo','monospace'"
>>>>>>> 1fedef5cdf2fa8631c20411f700509b8bbdcb0e2
                    >
                      {edge.label}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>

<<<<<<< HEAD
        {/* HTML Node Elements with Drag and Drop Support */}
        {effectiveNodes.map((node) => {
          const isSelected = selectedNodeId === node.id;
          const isHighlighted = highlightedNodeId === node.id;
          const searchMatch = isMatch(node);
          const isBeingDragged = draggedNodeId === node.id;
=======
        {/* HTML Node Elements */}
        {nodes.map((node) => {
          const isSelected = selectedNodeId === node.id;
          const isHighlighted = highlightedNodeId === node.id;
          const searchMatch = isMatch(node);
>>>>>>> 1fedef5cdf2fa8631c20411f700509b8bbdcb0e2

          return (
            <div
              key={node.id}
<<<<<<< HEAD
              onMouseDown={(e) => handleNodeMouseDown(e, node)}
              className={`absolute select-none cursor-grab active:cursor-grabbing transition-shadow ${
                isBeingDragged ? 'z-40 shadow-2xl scale-[1.02] cursor-grabbing opacity-95' : 'z-10 hover:z-20'
              }`}
=======
              className="absolute transition-transform duration-100"
>>>>>>> 1fedef5cdf2fa8631c20411f700509b8bbdcb0e2
              style={{
                left: node.x || 0,
                top: node.y || 0,
                width: node.width || 200,
<<<<<<< HEAD
                height: node.height || 70,
                touchAction: 'none'
=======
                height: node.height || 70
>>>>>>> 1fedef5cdf2fa8631c20411f700509b8bbdcb0e2
              }}
            >
              <FlowNode
                node={node}
                isSelected={isSelected}
                isSearchMatch={searchMatch}
                isHighlighted={isHighlighted}
<<<<<<< HEAD
                onClick={() => {}}
=======
                onClick={onNodeClick}
>>>>>>> 1fedef5cdf2fa8631c20411f700509b8bbdcb0e2
              />
            </div>
          );
        })}
      </div>

<<<<<<< HEAD
      {/* Floating Minimap with Visual Studio Dark+ aesthetics */}
      {showMinimap && effectiveNodes.length > 0 && (
        <div className="absolute bottom-3 right-3 w-48 h-36 bg-[#252526] border border-[#3c3c3c] rounded-xl shadow-xl p-2 overflow-hidden pointer-events-auto z-40">
          <div className="text-[9.5px] font-mono text-[#858585] uppercase tracking-wider mb-1.5 flex justify-between items-center px-1">
            <span className="font-semibold text-[#cccccc]">Minimap</span>
            <span className="text-[8.5px] text-[#75beff] bg-[#094771] px-1.5 py-0.2 rounded font-mono">{effectiveNodes.length} nodes</span>
          </div>

          <div className="relative w-full h-[98px] bg-[#1e1e1e] rounded-lg border border-[#3c3c3c] overflow-hidden">
=======
      {/* Floating Minimap */}
      {showMinimap && nodes.length > 0 && (
        <div className="absolute bottom-3 right-3 w-44 h-32 bg-[#161b22]/90 border border-[#30363d] rounded-lg shadow-xl backdrop-blur-md p-1.5 overflow-hidden pointer-events-auto z-40">
          <div className="text-[9px] font-mono text-[#7d8590] uppercase tracking-wider mb-1 flex justify-between items-center px-1">
            <span>Minimap</span>
            <span className="text-[8px] text-[#58a6ff]">{nodes.length} nodes</span>
          </div>

          <div className="relative w-full h-[88px] bg-[#0d1117]/80 rounded border border-[#30363d]/50 overflow-hidden">
>>>>>>> 1fedef5cdf2fa8631c20411f700509b8bbdcb0e2
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
<<<<<<< HEAD
                  {effectiveNodes.map(n => {
=======
                  {nodes.map(n => {
>>>>>>> 1fedef5cdf2fa8631c20411f700509b8bbdcb0e2
                    const nx = ((n.x || 0) - b.minX) * miniScale + 6;
                    const ny = ((n.y || 0) - b.minY) * miniScale + 6;
                    const dotColor =
                      n.type === 'START'
<<<<<<< HEAD
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
=======
                        ? '#34d399'
                        : n.type === 'END'
                        ? '#f87171'
                        : n.type === 'DECISION'
                        ? '#f59e0b'
                        : n.type === 'FUNCTION'
                        ? '#c084fc'
                        : n.type === 'LOOP'
                        ? '#818cf8'
                        : '#58a6ff';
>>>>>>> 1fedef5cdf2fa8631c20411f700509b8bbdcb0e2

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
