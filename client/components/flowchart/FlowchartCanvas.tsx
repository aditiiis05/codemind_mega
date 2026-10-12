// client/components/flowchart/FlowchartCanvas.tsx
// High-performance interactive Flowchart Canvas with smooth zoom, pan, curved SVG edges, decision branches, minimap, and node selection

'use client';

import React, { useRef, useState, useEffect, useCallback, useImperativeHandle, forwardRef } from 'react';

// Public API exposed via ref
export interface FlowchartCanvasHandle {
  fitToScreen: () => void;
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
  // Track whether we've done the initial fit
  const hasFitRef = useRef(false);

  // Fit graph to container — waits for container to have real dimensions
  const fitGraph = useCallback(() => {
    if (!containerRef.current || nodes.length === 0) return;
    const container = containerRef.current;
    const cW = container.clientWidth;
    const cH = container.clientHeight;
    if (cW < 50 || cH < 50) return; // container not ready yet

    const b = bounds || {
      minX: Math.min(...nodes.map(n => n.x || 0)),
      minY: Math.min(...nodes.map(n => n.y || 0)),
      maxX: Math.max(...nodes.map(n => (n.x || 0) + (n.width || 200))),
      maxY: Math.max(...nodes.map(n => (n.y || 0) + (n.height || 70))),
      width: 800,
      height: 600
    };

    const graphW = Math.max(b.maxX - b.minX, 1);
    const graphH = Math.max(b.maxY - b.minY, 1);

    const PAD = 60;
    const scaleX = (cW - PAD * 2) / graphW;
    const scaleY = (cH - PAD * 2) / graphH;
    // Use scaleX only so wide graphs fit horizontally; clamp to sensible range
    const newZoom = Math.min(Math.max(0.35, Math.min(scaleX, scaleY)), 1.2);

    onZoomChange(newZoom);

    const graphCenterX = (b.minX + b.maxX) / 2;
    const graphCenterY = (b.minY + b.maxY) / 2;
    setPan({
      x: cW / 2 - graphCenterX * newZoom,
      y: Math.max(30, cH / 2 - graphCenterY * newZoom)
    });
  }, [bounds, nodes, onZoomChange]);

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

    // Also try immediately in case it's already sized
    if (!hasFitRef.current && nodes.length > 0) {
      hasFitRef.current = true;
      fitGraph();
    }

    return () => observer.disconnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes.length, fitGraph]);

  // Expose fitToScreen to parent via ref
  useImperativeHandle(ref, () => ({
    fitToScreen: () => {
      hasFitRef.current = false;
      fitGraph();
    }
  }), [fitGraph]);

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

  // Drag to pan
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Left click only
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

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
    let startY = sY + sHeight;

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
      <div
        className="absolute top-0 left-0 origin-top-left transition-transform duration-75"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`
        }}
      >
        {/* SVG Layer for Edges, Paths, and Arrow Markers */}
        <svg
          className="absolute top-0 left-0 pointer-events-none"
          style={{
            width: (bounds?.width || 2500) + 1000,
            height: (bounds?.height || 2500) + 1000,
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
              <path d="M 0 1 L 9 5 L 0 9 z" fill="#64748b" />
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
              <path d="M 0 1 L 9 5 L 0 9 z" fill="#34d399" />
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
              <path d="M 0 1 L 9 5 L 0 9 z" fill="#f87171" />
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
              <path d="M 0 1 L 9 5 L 0 9 z" fill="#c084fc" />
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
              <path d="M 0 1 L 9 5 L 0 9 z" fill="#22d3ee" />
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
              <path d="M 0 1 L 9 5 L 0 9 z" fill="#818cf8" />
            </marker>
          </defs>

          {/* Render All Edges */}
          {edges.map((edge) => {
            const edgeCalc = calculateEdgePath(edge);
            if (!edgeCalc) return null;
            const style = getEdgeStyle(edge);

            return (
              <g key={edge.id} className="transition-opacity duration-200">
                <path
                  d={edgeCalc.path}
                  fill="none"
                  stroke={style.color}
                  strokeWidth={style.strokeWidth}
                  strokeDasharray={style.dash}
                  markerEnd={style.marker}
                  className="transition-all"
                />

                {/* Edge Label (e.g. YES, NO, CALLS, IMPORTS) */}
                {edge.label && (
                  <g transform={`translate(${edgeCalc.midX}, ${edgeCalc.midY})`}>
                    <rect
                      x={-28}
                      y={-12}
                      width={56}
                      height={24}
                      rx={5}
                      fill="#0d1117"
                      stroke={style.color}
                      strokeWidth={1.5}
                    />
                    <text
                      x={0}
                      y={4}
                      textAnchor="middle"
                      fill={style.color}
                      fontSize="11px"
                      fontWeight="bold"
                      fontFamily="'Monaco','Menlo','monospace'"
                    >
                      {edge.label}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>

        {/* HTML Node Elements */}
        {nodes.map((node) => {
          const isSelected = selectedNodeId === node.id;
          const isHighlighted = highlightedNodeId === node.id;
          const searchMatch = isMatch(node);

          return (
            <div
              key={node.id}
              className="absolute transition-transform duration-100"
              style={{
                left: node.x || 0,
                top: node.y || 0,
                width: node.width || 200,
                height: node.height || 70
              }}
            >
              <FlowNode
                node={node}
                isSelected={isSelected}
                isSearchMatch={searchMatch}
                isHighlighted={isHighlighted}
                onClick={onNodeClick}
              />
            </div>
          );
        })}
      </div>

      {/* Floating Minimap */}
      {showMinimap && nodes.length > 0 && (
        <div className="absolute bottom-3 right-3 w-44 h-32 bg-[#161b22]/90 border border-[#30363d] rounded-lg shadow-xl backdrop-blur-md p-1.5 overflow-hidden pointer-events-auto z-40">
          <div className="text-[9px] font-mono text-[#7d8590] uppercase tracking-wider mb-1 flex justify-between items-center px-1">
            <span>Minimap</span>
            <span className="text-[8px] text-[#58a6ff]">{nodes.length} nodes</span>
          </div>

          <div className="relative w-full h-[88px] bg-[#0d1117]/80 rounded border border-[#30363d]/50 overflow-hidden">
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
                  {nodes.map(n => {
                    const nx = ((n.x || 0) - b.minX) * miniScale + 6;
                    const ny = ((n.y || 0) - b.minY) * miniScale + 6;
                    const dotColor =
                      n.type === 'START'
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
