// client/components/flowchart/NodeDetailPanel.tsx
// Slide-in detail panel shown when a flowchart node is clicked.
// Displays: type, readable explanation, source code, file, lines, edges.

'use client';

import React from 'react';
import {
  X, FileCode, MapPin, ArrowRight, ArrowLeft,
  GitBranch, RotateCw, Code2, AlertTriangle,
  ArrowDownToLine, ArrowUpFromLine, Cpu, CornerDownLeft,
  Play, Square
} from 'lucide-react';
import { FlowNode, FlowEdge } from '@/types/flowchart';

interface NodeDetailPanelProps {
  node: FlowNode | null;
  allEdges: FlowEdge[];
  allNodes: FlowNode[];
  onClose: () => void;
  onNavigateToCode?: (file: string, lineStart: number, lineEnd?: number) => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TYPE_META: Record<string, { icon: React.ReactNode; color: string; bg: string; explanation: string }> = {
  START:    { icon: <Play size={14} />,              color: '#34d399', bg: '#064e3b', explanation: 'Entry point of the program or function.' },
  END:      { icon: <Square size={12} />,            color: '#f87171', bg: '#450a0a', explanation: 'Program or function exits here.' },
  PROCESS:  { icon: <Cpu size={14} />,               color: '#58a6ff', bg: '#0c1a2e', explanation: 'A statement that performs an action — declaration, assignment, or expression.' },
  DECISION: { icon: <GitBranch size={14} />,         color: '#f59e0b', bg: '#1c1207', explanation: 'A conditional branch. The program follows different paths based on the outcome.' },
  LOOP:     { icon: <RotateCw size={14} />,          color: '#818cf8', bg: '#1e1b4b', explanation: 'A loop that repeats its body while the condition is true.' },
  FUNCTION: { icon: <Code2 size={14} />,             color: '#c084fc', bg: '#2e1065', explanation: 'A function or method declaration. Click to view its internal flow.' },
  INPUT:    { icon: <ArrowDownToLine size={14} />,   color: '#2dd4bf', bg: '#042f2e', explanation: 'Reads data from the user or an external source.' },
  OUTPUT:   { icon: <ArrowUpFromLine size={14} />,   color: '#38bdf8', bg: '#082f49', explanation: 'Writes or displays data to the user or an output stream.' },
  RETURN:   { icon: <CornerDownLeft size={14} />,    color: '#4ade80', bg: '#052e16', explanation: 'Returns a value and exits the current function.' },
  ERROR:    { icon: <AlertTriangle size={14} />,     color: '#f87171', bg: '#450a0a', explanation: 'Exception handling — catches or throws an error.' },
  FILE:     { icon: <FileCode size={14} />,          color: '#22d3ee', bg: '#164e63', explanation: 'A source file in the project.' },
};

function getTypeMeta(type: string) {
  return TYPE_META[type] ?? TYPE_META['PROCESS'];
}

function cleanLabel(label: string): string {
  return label.replace(/^def\s+/, '').replace(/\?$/, '').trim();
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function NodeDetailPanel({
  node,
  allEdges,
  allNodes,
  onClose,
  onNavigateToCode
}: NodeDetailPanelProps) {
  if (!node) return null;

  const meta = getTypeMeta(node.type);
  const label = cleanLabel(node.label || '');
  const lineLabel = node.lineStart
    ? (node.lineEnd && node.lineEnd !== node.lineStart
        ? `${node.lineStart} – ${node.lineEnd}`
        : `${node.lineStart}`)
    : null;

  // Collect incoming / outgoing edges
  const incoming = allEdges.filter(e => e.target === node.id);
  const outgoing = allEdges.filter(e => e.source === node.id);

  const getNodeLabel = (id: string) =>
    allNodes.find(n => n.id === id)?.label?.replace(/^def\s+/, '') ?? id;

  // Extra details for specific node types
  const isDecision = node.type === 'DECISION';
  const isLoop     = node.type === 'LOOP';
  const isFunc     = node.type === 'FUNCTION';

  const yesBranch = outgoing.find(e => e.label === 'YES');
  const noBranch  = outgoing.find(e => e.label === 'NO');

  return (
    <div
      className="absolute right-0 top-0 h-full w-[300px] z-50 flex flex-col
                 bg-[#161b22] border-l border-[#30363d] shadow-2xl overflow-hidden"
      style={{ borderLeft: `3px solid ${meta.color}` }}
    >
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#30363d]"
           style={{ backgroundColor: meta.bg }}>
        <div className="flex items-center gap-2">
          <span style={{ color: meta.color }}>{meta.icon}</span>
          <span className="text-sm font-bold uppercase tracking-wider"
                style={{ color: meta.color }}>
            {node.type}
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded text-[#7d8590] hover:text-white hover:bg-[#30363d]
                     transition-colors"
          aria-label="Close details"
        >
          <X size={14} />
        </button>
      </div>

      {/* ── Scrollable body ── */}
      <div className="flex-1 overflow-y-auto text-sm">

        {/* Type explanation */}
        <div className="px-4 py-3 border-b border-[#30363d]/50 bg-[#0d1117]/40">
          <p className="text-[12px] text-[#8b949e] leading-relaxed">{meta.explanation}</p>
        </div>

        {/* Label / Statement */}
        <div className="px-4 py-3 border-b border-[#30363d]/50">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-[#7d8590] mb-1.5">
            {node.type === 'DECISION' ? 'Condition' : node.type === 'LOOP' ? 'Loop Condition' : 'Statement'}
          </div>
          <pre className="text-[12px] font-mono text-[#e6edf3] bg-[#0d1117] rounded-md
                          px-3 py-2 overflow-x-auto border border-[#30363d] leading-relaxed
                          whitespace-pre-wrap break-words">
            {label}
          </pre>
        </div>

        {/* Decision branches */}
        {isDecision && (yesBranch || noBranch) && (
          <div className="px-4 py-3 border-b border-[#30363d]/50">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-[#7d8590] mb-2">
              Branches
            </div>
            {yesBranch && (
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/40
                                 px-2 py-0.5 rounded border border-emerald-800/40">YES</span>
                <ArrowRight size={11} className="text-[#7d8590]" />
                <span className="text-[12px] font-mono text-[#c9d1d9] truncate">
                  {truncate(getNodeLabel(yesBranch.target), 28)}
                </span>
              </div>
            )}
            {noBranch && (
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-rose-400 bg-rose-950/40
                                 px-2 py-0.5 rounded border border-rose-800/40">NO</span>
                <ArrowRight size={11} className="text-[#7d8590]" />
                <span className="text-[12px] font-mono text-[#c9d1d9] truncate">
                  {truncate(getNodeLabel(noBranch.target), 28)}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Source location */}
        {(node.file || lineLabel) && (
          <div className="px-4 py-3 border-b border-[#30363d]/50">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-[#7d8590] mb-2">
              Source Location
            </div>
            {node.file && (
              <div className="flex items-center gap-2 mb-1">
                <FileCode size={12} className="text-[#7d8590] shrink-0" />
                <span className="text-[12px] font-mono text-[#58a6ff] truncate">{node.file}</span>
              </div>
            )}
            {lineLabel && (
              <div className="flex items-center gap-2">
                <MapPin size={12} className="text-[#7d8590] shrink-0" />
                <span className="text-[12px] text-[#c9d1d9]">Line {lineLabel}</span>
              </div>
            )}
            {node.file && node.lineStart && onNavigateToCode && (
              <button
                onClick={() => onNavigateToCode(node.file!, node.lineStart!, node.lineEnd)}
                className="mt-2 w-full text-[11px] font-semibold px-3 py-1.5 rounded
                           bg-[#1f6feb]/15 hover:bg-[#1f6feb]/30 text-[#58a6ff]
                           border border-[#1f6feb]/30 transition-colors flex items-center
                           justify-center gap-1.5"
              >
                <MapPin size={11} />
                Jump to Source
              </button>
            )}
          </div>
        )}

        {/* Connections */}
        {incoming.length > 0 && (
          <div className="px-4 py-3 border-b border-[#30363d]/50">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-[#7d8590] mb-2">
              Incoming ({incoming.length})
            </div>
            <div className="space-y-1">
              {incoming.slice(0, 5).map(e => (
                <div key={e.id} className="flex items-center gap-2">
                  <ArrowLeft size={10} className="text-[#7d8590] shrink-0" />
                  {e.label && (
                    <span className="text-[9px] font-bold px-1.5 rounded"
                          style={{ color: edgeLabelColor(e.label), backgroundColor: `${edgeLabelColor(e.label)}22` }}>
                      {e.label}
                    </span>
                  )}
                  <span className="text-[11px] font-mono text-[#8b949e] truncate">
                    {truncate(getNodeLabel(e.source), 24)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {outgoing.length > 0 && (
          <div className="px-4 py-3 border-b border-[#30363d]/50">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-[#7d8590] mb-2">
              Outgoing ({outgoing.length})
            </div>
            <div className="space-y-1">
              {outgoing.slice(0, 5).map(e => (
                <div key={e.id} className="flex items-center gap-2">
                  <ArrowRight size={10} className="text-[#7d8590] shrink-0" />
                  {e.label && (
                    <span className="text-[9px] font-bold px-1.5 rounded"
                          style={{ color: edgeLabelColor(e.label), backgroundColor: `${edgeLabelColor(e.label)}22` }}>
                      {e.label}
                    </span>
                  )}
                  <span className="text-[11px] font-mono text-[#8b949e] truncate">
                    {truncate(getNodeLabel(e.target), 24)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Node ID (debug) */}
        <div className="px-4 py-2">
          <span className="text-[10px] text-[#484f58] font-mono">id: {node.id}</span>
        </div>
      </div>
    </div>
  );
}

function truncate(s: string, max: number) {
  if (!s) return '';
  return s.length > max ? s.substring(0, max - 1) + '…' : s;
}

function edgeLabelColor(label: string): string {
  if (label === 'YES')    return '#34d399';
  if (label === 'NO')     return '#f87171';
  if (label === 'LOOP')   return '#818cf8';
  if (label === 'RETURN') return '#4ade80';
  if (label === 'ERROR')  return '#f87171';
  if (label === 'CALLS')  return '#c084fc';
  return '#7d8590';
}
