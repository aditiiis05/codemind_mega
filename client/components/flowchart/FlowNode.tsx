// client/components/flowchart/FlowNode.tsx
// Rich interactive Node component for Flowcharts and Project Graphs
// Visually distinguishes node types using shapes, geometry, icons, and badges

'use client';

import React from 'react';
import {
  Play,
  Square,
  Cpu,
  HelpCircle,
  RotateCw,
  Code2,
  ArrowDownToLine,
  ArrowUpFromLine,
  CornerDownLeft,
  AlertTriangle,
  FileCode2,
  ExternalLink
} from 'lucide-react';
import { FlowNode as FlowNodeType } from '@/types/flowchart';

interface FlowNodeProps {
  node: FlowNodeType;
  isSelected?: boolean;
  isSearchMatch?: boolean;
  isHighlighted?: boolean;
  onClick?: (node: FlowNodeType) => void;
  onDoubleClick?: (node: FlowNodeType) => void;
}

export default function FlowNode({
  node,
  isSelected = false,
  isSearchMatch = false,
  isHighlighted = false,
  onClick,
  onDoubleClick
}: FlowNodeProps) {
  const { type, label, lineStart, lineEnd, file } = node;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick?.(node);
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDoubleClick?.(node);
  };

  // Base selection and highlight styling
  const stateClasses = isSelected
    ? 'ring-2 ring-[#0ea5e9] shadow-[0_0_20px_rgba(14,165,233,0.5)] scale-[1.03] z-30'
    : isSearchMatch
    ? 'ring-2 ring-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.5)] z-20'
    : isHighlighted
    ? 'ring-2 ring-purple-400 shadow-[0_0_15px_rgba(192,132,252,0.4)] z-20'
    : 'hover:border-slate-400 hover:shadow-lg hover:scale-[1.01]';

  // Render specific shapes and appearances based on node type
  switch (type) {
    case 'START':
      return (
        <div
          onClick={handleClick}
          onDoubleClick={handleDoubleClick}
          className={`cursor-pointer px-6 py-2.5 rounded-full bg-linear-to-r from-emerald-950 via-emerald-900 to-emerald-800 border-2 border-emerald-400/80 text-emerald-100 flex items-center justify-center gap-2.5 transition-all duration-200 select-none shadow-md ${stateClasses}`}
          style={{ width: node.width || 160, height: node.height || 50 }}
          title={`Start node (${file || 'current file'}${lineStart ? ` - Line ${lineStart}` : ''})`}
        >
          <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-400/60">
            <Play size={12} className="text-emerald-300 fill-emerald-300 ml-0.5" />
          </div>
          <span className="font-semibold text-xs tracking-wider uppercase truncate">{label || 'START'}</span>
        </div>
      );

    case 'END':
      return (
        <div
          onClick={handleClick}
          onDoubleClick={handleDoubleClick}
          className={`cursor-pointer px-6 py-2.5 rounded-full bg-linear-to-r from-rose-950 via-rose-900 to-rose-800 border-2 border-rose-400/80 text-rose-100 flex items-center justify-center gap-2.5 transition-all duration-200 select-none shadow-md ${stateClasses}`}
          style={{ width: node.width || 160, height: node.height || 50 }}
          title={`End node (${file || 'current file'}${lineStart ? ` - Line ${lineStart}` : ''})`}
        >
          <div className="w-6 h-6 rounded-full bg-rose-500/20 flex items-center justify-center border border-rose-400/60">
            <Square size={10} className="text-rose-300 fill-rose-300" />
          </div>
          <span className="font-semibold text-xs tracking-wider uppercase truncate">{label || 'END'}</span>
        </div>
      );

    case 'DECISION':
      // Diamond / Hexagon shape with prominent condition badge and YES/NO indicators
      return (
        <div
          onClick={handleClick}
          onDoubleClick={handleDoubleClick}
          className={`cursor-pointer relative bg-[#1c1917] border-2 border-amber-500/90 text-amber-100 p-3 rounded-xl transition-all duration-200 select-none flex flex-col justify-between shadow-lg ${stateClasses}`}
          style={{
            width: node.width || 230,
            height: node.height || 95,
            clipPath: 'polygon(12% 0%, 88% 0%, 100% 50%, 88% 100%, 12% 100%, 0% 50%)'
          }}
          title={`Decision node: ${label}${lineStart ? ` (Line ${lineStart})` : ''}`}
        >
          {/* Header Badge */}
          <div className="flex items-center justify-between px-3 pt-0.5">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-400 uppercase tracking-wider">
              <HelpCircle size={12} className="text-amber-400" />
              <span>CONDITION</span>
            </div>
            {lineStart && (
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-950/80 text-amber-300 border border-amber-600/40">
                L{lineStart}
              </span>
            )}
          </div>

          {/* Condition Content */}
          <div className="px-3 text-center">
            <span className="font-mono text-xs font-semibold text-amber-200 line-clamp-2">
              {label}
            </span>
          </div>

          {/* Branch Hints */}
          <div className="flex justify-between items-center px-4 pb-0.5 text-[9px] font-bold">
            <span className="text-emerald-400 font-mono">↙ YES</span>
            <span className="text-rose-400 font-mono">NO ↘</span>
          </div>
        </div>
      );

    case 'LOOP':
      return (
        <div
          onClick={handleClick}
          onDoubleClick={handleDoubleClick}
          className={`cursor-pointer relative bg-linear-to-r from-[#1e1b4b] to-[#172554] border-2 border-indigo-400 text-indigo-100 p-3 rounded-lg transition-all duration-200 select-none flex flex-col justify-between shadow-md ${stateClasses}`}
          style={{ width: node.width || 210, height: node.height || 75 }}
          title={`Loop: ${label}${lineStart ? ` (Line ${lineStart})` : ''}`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-300 uppercase tracking-wider">
              <RotateCw size={12} className="text-indigo-400 animate-spin-slow" />
              <span>LOOP</span>
            </div>
            {lineStart && (
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-indigo-950 text-indigo-300 border border-indigo-600/40">
                L{lineStart}
              </span>
            )}
          </div>
          <div className="font-mono text-xs text-indigo-200 truncate font-medium">
            {label}
          </div>
          <div className="text-[9px] text-indigo-400 font-mono">
            ↻ Iterates until complete
          </div>
        </div>
      );

    case 'FUNCTION':
      return (
        <div
          onClick={handleClick}
          onDoubleClick={handleDoubleClick}
          className={`cursor-pointer relative bg-linear-to-r from-[#2e1065] to-[#1e1b4b] border-2 border-purple-400 text-purple-100 p-3 rounded-lg transition-all duration-200 select-none flex flex-col justify-between shadow-md ${stateClasses}`}
          style={{ width: node.width || 230, height: node.height || 80 }}
          title={`Function: ${label}${lineStart ? ` (Line ${lineStart}${lineEnd ? `-${lineEnd}` : ''})` : ''}`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-purple-300 uppercase tracking-wider">
              <Code2 size={13} className="text-purple-400" />
              <span>FUNCTION</span>
            </div>
            {lineStart && (
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-purple-950 text-purple-300 border border-purple-600/40">
                L{lineStart}{lineEnd && lineEnd !== lineStart ? `-${lineEnd}` : ''}
              </span>
            )}
          </div>
          <div className="font-mono text-xs text-purple-200 font-semibold truncate">
            {/* Strip any leading language keywords like "def " that leaked through */}
            {label.replace(/^def\s+/, '')}
          </div>
          <div className="flex items-center justify-between text-[10px] text-purple-400">
            <span className="truncate">{node.file ? node.file.split('/').pop()?.split('\\').pop() : ''}</span>
            <ExternalLink size={10} className="shrink-0" />
          </div>
        </div>
      );

    case 'INPUT':
      return (
        <div
          onClick={handleClick}
          onDoubleClick={handleDoubleClick}
          className={`cursor-pointer relative bg-[#042f2e] border-2 border-teal-400/80 text-teal-100 p-2.5 rounded-lg transition-all duration-200 select-none flex flex-col justify-between shadow-md ${stateClasses}`}
          style={{
            width: node.width || 210,
            height: node.height || 70,
            transform: 'skewX(-4deg)'
          }}
          title={`Input: ${label}`}
        >
          <div style={{ transform: 'skewX(4deg)' }} className="flex flex-col h-full justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-[10px] font-bold text-teal-300 uppercase">
                <ArrowDownToLine size={11} className="text-teal-400" />
                <span>INPUT</span>
              </div>
              {lineStart && <span className="text-[10px] font-mono text-teal-400">L{lineStart}</span>}
            </div>
            <div className="font-mono text-xs text-teal-200 truncate">{label}</div>
          </div>
        </div>
      );

    case 'OUTPUT':
      return (
        <div
          onClick={handleClick}
          onDoubleClick={handleDoubleClick}
          className={`cursor-pointer relative bg-[#082f49] border-2 border-sky-400/80 text-sky-100 p-2.5 rounded-lg transition-all duration-200 select-none flex flex-col justify-between shadow-md ${stateClasses}`}
          style={{
            width: node.width || 210,
            height: node.height || 70,
            transform: 'skewX(-4deg)'
          }}
          title={`Output: ${label}`}
        >
          <div style={{ transform: 'skewX(4deg)' }} className="flex flex-col h-full justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-[10px] font-bold text-sky-300 uppercase">
                <ArrowUpFromLine size={11} className="text-sky-400" />
                <span>OUTPUT</span>
              </div>
              {lineStart && <span className="text-[10px] font-mono text-sky-400">L{lineStart}</span>}
            </div>
            <div className="font-mono text-xs text-sky-200 truncate">{label}</div>
          </div>
        </div>
      );

    case 'RETURN':
      return (
        <div
          onClick={handleClick}
          onDoubleClick={handleDoubleClick}
          className={`cursor-pointer relative bg-linear-to-r from-emerald-950 to-teal-950 border border-emerald-400 text-emerald-100 px-3 py-2 rounded-lg transition-all duration-200 select-none flex items-center justify-between shadow-md ${stateClasses}`}
          style={{ width: node.width || 180, height: node.height || 60 }}
          title={`Return: ${label}`}
        >
          <div className="flex items-center gap-2 overflow-hidden">
            <CornerDownLeft size={14} className="text-emerald-400 shrink-0" />
            <div className="overflow-hidden">
              <div className="text-[9px] font-bold text-emerald-400 uppercase">RETURN</div>
              <div className="font-mono text-xs text-emerald-200 truncate">{label}</div>
            </div>
          </div>
          {lineStart && <span className="text-[10px] font-mono text-emerald-400 shrink-0">L{lineStart}</span>}
        </div>
      );

    case 'ERROR':
      return (
        <div
          onClick={handleClick}
          onDoubleClick={handleDoubleClick}
          className={`cursor-pointer relative bg-linear-to-r from-red-950 to-orange-950 border-2 border-red-500 text-red-100 p-2.5 rounded-lg transition-all duration-200 select-none flex flex-col justify-between shadow-md ${stateClasses}`}
          style={{ width: node.width || 200, height: node.height || 70 }}
          title={`Error handling: ${label}`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-[10px] font-bold text-red-400 uppercase">
              <AlertTriangle size={12} className="text-red-400" />
              <span>EXCEPTION</span>
            </div>
            {lineStart && <span className="text-[10px] font-mono text-red-400">L{lineStart}</span>}
          </div>
          <div className="font-mono text-xs text-red-200 truncate font-semibold">{label}</div>
        </div>
      );

    case 'FILE':
      return (
        <div
          onClick={handleClick}
          onDoubleClick={handleDoubleClick}
          className={`cursor-pointer relative bg-[#1e293b] border-2 border-cyan-500/80 text-cyan-50 p-3 rounded-xl transition-all duration-200 select-none flex flex-col justify-between shadow-lg ${stateClasses}`}
          style={{ width: node.width || 230, height: node.height || 85 }}
          title={`File: ${file || label}`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-cyan-300 uppercase">
              <FileCode2 size={13} className="text-cyan-400" />
              <span>SOURCE FILE</span>
            </div>
            {node.data?.functionCount !== undefined && (
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-700/40">
                {node.data.functionCount} funcs
              </span>
            )}
          </div>
          <div className="font-mono text-xs font-bold text-cyan-100 truncate">
            {label}
          </div>
          <div className="text-[10px] text-cyan-400/80 truncate">
            {file || ''}
          </div>
        </div>
      );

    case 'PROCESS':
    default:
      return (
        <div
          onClick={handleClick}
          onDoubleClick={handleDoubleClick}
          className={`cursor-pointer relative bg-[#161b22] border border-[#30363d] hover:border-[#58a6ff]/70 text-[#e6edf3] p-2.5 rounded-lg transition-all duration-200 select-none flex flex-col justify-between shadow-md border-l-4 border-l-[#1f6feb] ${stateClasses}`}
          style={{ width: node.width || 220, height: node.height || 72 }}
          title={`Process: ${label}${lineStart ? ` (Line ${lineStart})` : ''}`}
        >
          <div className="flex items-center justify-between text-[10px] text-[#7d8590]">
            <div className="flex items-center gap-1 font-semibold uppercase tracking-wider text-[#58a6ff]">
              <Cpu size={11} className="text-[#58a6ff]" />
              <span>PROCESS</span>
            </div>
            {lineStart && (
              <span className="font-mono px-1.5 py-0.2 rounded bg-[#21262d] text-[#7d8590] border border-[#30363d]">
                L{lineStart}
              </span>
            )}
          </div>
          <div className="font-mono text-xs text-[#e6edf3] font-medium truncate py-1">
            {label}
          </div>
          <div className="text-[9px] text-[#7d8590] truncate">
            {file ? file.split('/').pop() : ''}
          </div>
        </div>
      );
  }
}
