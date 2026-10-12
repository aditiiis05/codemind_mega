// client/components/flowchart/FlowNode.tsx
// Professional, readable flowchart nodes with smart labels and clear visual hierarchy

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
  Phone
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

// Derives a short human-readable title from a raw code statement
function deriveTitle(type: string, rawLabel: string): { title: string; code: string } {
  const label = rawLabel.replace(/^def\s+/, '').trim();

  switch (type) {
    case 'DECISION': {
      // Strip trailing ?
      const cond = label.replace(/\?$/, '').trim();
      return { title: 'Check Condition', code: cond };
    }
    case 'LOOP': {
      const cond = label.replace(/^Loop:\s*/i, '').trim();
      return { title: 'Loop', code: cond };
    }
    case 'INPUT': {
      // Detect Scanner / input patterns
      if (/new\s+Scanner/i.test(label))   return { title: 'Initialize Scanner',  code: label };
      if (/nextInt\s*\(/i.test(label))     return { title: 'Read Integer Input',  code: label };
      if (/nextLine\s*\(/i.test(label))    return { title: 'Read String Input',   code: label };
      if (/nextDouble\s*\(/i.test(label))  return { title: 'Read Decimal Input',  code: label };
      if (/input\s*\(/i.test(label))       return { title: 'Read User Input',     code: label };
      if (/prompt\s*\(/i.test(label))      return { title: 'Prompt User',         code: label };
      return { title: 'Read Input', code: label };
    }
    case 'OUTPUT': {
      if (/System\.out\.println/i.test(label)) return { title: 'Print Line',    code: label };
      if (/System\.out\.print/i.test(label))   return { title: 'Print',         code: label };
      if (/console\.log/i.test(label))          return { title: 'Log Output',    code: label };
      if (/print\s*\(/i.test(label))            return { title: 'Print',         code: label };
      return { title: 'Output', code: label };
    }
    case 'RETURN':
      return { title: 'Return', code: label.replace(/^return\s*/i, '').trim() || '' };
    case 'FUNCTION': {
      const name = label.split('(')[0].trim();
      return { title: name || 'Function', code: label };
    }
    case 'ERROR':
      return { title: 'Exception Handler', code: label };
    case 'PROCESS': {
      // Try to derive a natural-language title from common patterns
      if (/^\s*(?:int|long|double|float|char|boolean|String|var|let|const)\s+\w+\s*=/.test(label))
        return { title: 'Declare & Initialize', code: label };
      if (/^\s*\w[\w.]*\s*=\s*/.test(label) && !/[<>]/.test(label))
        return { title: 'Assign Value', code: label };
      if (/^\s*(?:int|long|double|float|char|boolean|String)\s+\w+/.test(label))
        return { title: 'Declare Variable', code: label };
      return { title: 'Statement', code: label };
    }
    default:
      return { title: type, code: label };
  }
}

// Truncate a code string for the node body — show first 60 chars, ellipsis if longer
function truncateCode(code: string, max = 60): string {
  if (!code) return '';
  const s = code.replace(/\s+/g, ' ').trim();
  return s.length > max ? s.substring(0, max - 1) + '…' : s;
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

  const ring = isSelected
    ? 'ring-2 ring-[#0ea5e9] shadow-[0_0_22px_rgba(14,165,233,0.55)] scale-[1.02] z-30'
    : isSearchMatch
    ? 'ring-2 ring-yellow-400 shadow-[0_0_16px_rgba(250,204,21,0.5)] z-20'
    : isHighlighted
    ? 'ring-2 ring-purple-400 shadow-[0_0_16px_rgba(192,132,252,0.45)] z-20'
    : '';

  const lineLabel = lineStart
    ? (lineEnd && lineEnd !== lineStart ? `L${lineStart}–${lineEnd}` : `L${lineStart}`)
    : null;

  // ── START ──────────────────────────────────────────────────────────────────
  if (type === 'START') {
    return (
      <div
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        title={`START  ${file ? '· ' + file : ''}`}
        className={`cursor-pointer flex items-center justify-center gap-3 rounded-full
          bg-gradient-to-r from-emerald-900 to-emerald-800
          border-2 border-emerald-400 text-emerald-50 select-none
          transition-all duration-200 shadow-lg ${ring}`}
        style={{ width: node.width ?? 180, height: node.height ?? 56 }}
      >
        <div className="w-7 h-7 rounded-full bg-emerald-500/25 border border-emerald-400/60
                        flex items-center justify-center shrink-0">
          <Play size={13} className="text-emerald-300 fill-emerald-300 ml-0.5" />
        </div>
        <span className="text-sm font-bold tracking-widest uppercase">{label || 'START'}</span>
      </div>
    );
  }

  // ── END ────────────────────────────────────────────────────────────────────
  if (type === 'END') {
    return (
      <div
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        title="END"
        className={`cursor-pointer flex items-center justify-center gap-3 rounded-full
          bg-gradient-to-r from-rose-900 to-rose-800
          border-2 border-rose-400 text-rose-50 select-none
          transition-all duration-200 shadow-lg ${ring}`}
        style={{ width: node.width ?? 180, height: node.height ?? 56 }}
      >
        <div className="w-7 h-7 rounded-full bg-rose-500/25 border border-rose-400/60
                        flex items-center justify-center shrink-0">
          <Square size={10} className="text-rose-300 fill-rose-300" />
        </div>
        <span className="text-sm font-bold tracking-widest uppercase">{label || 'END'}</span>
      </div>
    );
  }

  // ── DECISION ───────────────────────────────────────────────────────────────
  if (type === 'DECISION') {
    const cond = label.replace(/\?$/, '').trim();
    return (
      <div
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        title={`Condition: ${cond}`}
        className={`cursor-pointer relative flex flex-col justify-center items-center
          bg-amber-950 border-2 border-amber-400 text-amber-50 select-none
          transition-all duration-200 shadow-lg ${ring}`}
        style={{
          width: node.width ?? 260,
          height: node.height ?? 110,
          clipPath: 'polygon(10% 0%, 90% 0%, 100% 50%, 90% 100%, 10% 100%, 0% 50%)',
          padding: '8px 28px'
        }}
      >
        {/* Type badge */}
        <div className="flex items-center gap-1.5 mb-1">
          <HelpCircle size={12} className="text-amber-400 shrink-0" />
          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">Condition</span>
          {lineLabel && (
            <span className="ml-1 text-[9px] font-mono text-amber-500 bg-amber-950/60
                             px-1.5 py-0.5 rounded border border-amber-700/40">
              {lineLabel}
            </span>
          )}
        </div>
        {/* Condition text */}
        <div className="text-sm font-mono font-semibold text-amber-100 text-center leading-snug
                        overflow-hidden" style={{ maxHeight: 40, wordBreak: 'break-word' }}>
          {truncateCode(cond, 52)}
        </div>
        {/* Branch hints */}
        <div className="flex justify-between w-full px-2 mt-1.5 text-[10px] font-bold">
          <span className="text-emerald-400">↙ YES</span>
          <span className="text-rose-400">NO ↘</span>
        </div>
      </div>
    );
  }

  // ── LOOP ───────────────────────────────────────────────────────────────────
  if (type === 'LOOP') {
    const cond = label.replace(/^Loop:\s*/i, '').trim();
    return (
      <div
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        title={`Loop condition: ${cond}`}
        className={`cursor-pointer relative flex flex-col justify-between
          bg-gradient-to-br from-indigo-950 to-blue-950
          border-2 border-indigo-400 text-indigo-50 rounded-xl
          p-3 select-none transition-all duration-200 shadow-lg ${ring}`}
        style={{ width: node.width ?? 240, height: node.height ?? 92 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <RotateCw size={13} className="text-indigo-400 shrink-0" />
            <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-wide">Loop</span>
          </div>
          {lineLabel && (
            <span className="text-[10px] font-mono text-indigo-400 bg-indigo-950/60
                             px-1.5 py-0.5 rounded border border-indigo-700/40">
              {lineLabel}
            </span>
          )}
        </div>
        <div className="text-[13px] font-mono font-semibold text-indigo-100 leading-snug
                        overflow-hidden" style={{ maxHeight: 36 }}>
          {truncateCode(cond, 48)}
        </div>
        <div className="text-[10px] text-indigo-400 flex items-center gap-1">
          <RotateCw size={9} className="shrink-0" />
          <span>Repeats while condition is true</span>
        </div>
      </div>
    );
  }

  // ── FUNCTION ───────────────────────────────────────────────────────────────
  if (type === 'FUNCTION') {
    const { title, code } = deriveTitle('FUNCTION', label);
    return (
      <div
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        title={`Function: ${code}`}
        className={`cursor-pointer relative flex flex-col justify-between
          bg-gradient-to-br from-purple-950 to-violet-950
          border-2 border-purple-400 text-purple-50 rounded-lg
          p-3 select-none transition-all duration-200 shadow-lg ${ring}`}
        style={{ width: node.width ?? 260, height: node.height ?? 90 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Code2 size={13} className="text-purple-400 shrink-0" />
            <span className="text-[11px] font-bold text-purple-300 uppercase tracking-wide">Function</span>
          </div>
          {lineLabel && (
            <span className="text-[10px] font-mono text-purple-400 bg-purple-950/60
                             px-1.5 py-0.5 rounded border border-purple-700/40">
              {lineLabel}
            </span>
          )}
        </div>
        <div className="text-[14px] font-mono font-bold text-purple-100 leading-snug
                        overflow-hidden whitespace-nowrap text-ellipsis">
          {truncateCode(title !== 'Function' ? code : label.replace(/^def\s+/, ''), 44)}
        </div>
        <div className="text-[10px] text-purple-400 truncate">
          {file ? file.split(/[/\\]/).pop() : ''}
        </div>
      </div>
    );
  }

  // ── INPUT ──────────────────────────────────────────────────────────────────
  if (type === 'INPUT') {
    const { title, code } = deriveTitle('INPUT', label);
    return (
      <div
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        title={`Input: ${code}`}
        className={`cursor-pointer relative flex flex-col justify-between
          bg-teal-950 border-2 border-teal-400 text-teal-50
          p-3 select-none transition-all duration-200 shadow-md ${ring}`}
        style={{
          width: node.width ?? 250,
          height: node.height ?? 84,
          borderRadius: '6px 6px 6px 24px'    // parallelogram-like feel
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <ArrowDownToLine size={13} className="text-teal-400 shrink-0" />
            <span className="text-[11px] font-bold text-teal-300 uppercase tracking-wide">{title}</span>
          </div>
          {lineLabel && (
            <span className="text-[10px] font-mono text-teal-400 bg-teal-950/60
                             px-1.5 py-0.5 rounded border border-teal-700/40">
              {lineLabel}
            </span>
          )}
        </div>
        <div className="text-[13px] font-mono text-teal-100 leading-snug overflow-hidden"
             style={{ maxHeight: 36 }}>
          {truncateCode(code, 50)}
        </div>
      </div>
    );
  }

  // ── OUTPUT ─────────────────────────────────────────────────────────────────
  if (type === 'OUTPUT') {
    const { title, code } = deriveTitle('OUTPUT', label);
    return (
      <div
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        title={`Output: ${code}`}
        className={`cursor-pointer relative flex flex-col justify-between
          bg-sky-950 border-2 border-sky-400 text-sky-50
          p-3 select-none transition-all duration-200 shadow-md ${ring}`}
        style={{
          width: node.width ?? 250,
          height: node.height ?? 84,
          borderRadius: '6px 24px 6px 6px'    // mirror of INPUT
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <ArrowUpFromLine size={13} className="text-sky-400 shrink-0" />
            <span className="text-[11px] font-bold text-sky-300 uppercase tracking-wide">{title}</span>
          </div>
          {lineLabel && (
            <span className="text-[10px] font-mono text-sky-400 bg-sky-950/60
                             px-1.5 py-0.5 rounded border border-sky-700/40">
              {lineLabel}
            </span>
          )}
        </div>
        <div className="text-[13px] font-mono text-sky-100 leading-snug overflow-hidden"
             style={{ maxHeight: 36 }}>
          {truncateCode(code, 50)}
        </div>
      </div>
    );
  }

  // ── RETURN ─────────────────────────────────────────────────────────────────
  if (type === 'RETURN') {
    const value = label.replace(/^return\s*/i, '').trim();
    return (
      <div
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        title={`Return: ${value || 'void'}`}
        className={`cursor-pointer relative flex items-center gap-3
          bg-gradient-to-r from-emerald-950 to-teal-950
          border border-emerald-500 text-emerald-50
          px-4 py-3 rounded-lg select-none transition-all duration-200 shadow-md ${ring}`}
        style={{ width: node.width ?? 220, height: node.height ?? 66 }}
      >
        <CornerDownLeft size={16} className="text-emerald-400 shrink-0" />
        <div className="flex-1 overflow-hidden">
          <div className="text-[10px] font-bold text-emerald-500 uppercase tracking-wide">Return</div>
          <div className="text-[13px] font-mono text-emerald-100 truncate font-semibold">
            {value || 'void'}
          </div>
        </div>
        {lineLabel && (
          <span className="text-[10px] font-mono text-emerald-500 shrink-0">{lineLabel}</span>
        )}
      </div>
    );
  }

  // ── ERROR / EXCEPTION ──────────────────────────────────────────────────────
  if (type === 'ERROR') {
    return (
      <div
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        title={`Exception: ${label}`}
        className={`cursor-pointer relative flex flex-col justify-between
          bg-gradient-to-r from-red-950 to-orange-950
          border-2 border-red-500 text-red-50 rounded-lg
          p-3 select-none transition-all duration-200 shadow-md ${ring}`}
        style={{ width: node.width ?? 240, height: node.height ?? 80 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <AlertTriangle size={13} className="text-red-400 shrink-0" />
            <span className="text-[11px] font-bold text-red-300 uppercase tracking-wide">Exception</span>
          </div>
          {lineLabel && (
            <span className="text-[10px] font-mono text-red-400">{lineLabel}</span>
          )}
        </div>
        <div className="text-[13px] font-mono text-red-100 leading-snug overflow-hidden"
             style={{ maxHeight: 36 }}>
          {truncateCode(label, 50)}
        </div>
      </div>
    );
  }

  // ── FILE (project graph) ───────────────────────────────────────────────────
  if (type === 'FILE') {
    return (
      <div
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        title={`File: ${file || label}`}
        className={`cursor-pointer relative flex flex-col justify-between
          bg-slate-900 border-2 border-cyan-500 text-cyan-50 rounded-xl
          p-3 select-none transition-all duration-200 shadow-lg ${ring}`}
        style={{ width: node.width ?? 260, height: node.height ?? 92 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <FileCode2 size={13} className="text-cyan-400 shrink-0" />
            <span className="text-[11px] font-bold text-cyan-300 uppercase tracking-wide">Source File</span>
          </div>
          {node.data?.functionCount !== undefined && (
            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/40
                             px-1.5 py-0.5 rounded border border-cyan-700/40">
              {node.data.functionCount} fn
            </span>
          )}
        </div>
        <div className="text-[14px] font-mono font-bold text-cyan-100 truncate">{label}</div>
        <div className="text-[10px] text-cyan-500 truncate">{file || ''}</div>
      </div>
    );
  }

  // ── PROCESS (default) ──────────────────────────────────────────────────────
  const { title, code } = deriveTitle('PROCESS', label);
  return (
    <div
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      title={`${title}: ${code}`}
      className={`cursor-pointer relative flex flex-col justify-between
        bg-[#161b22] border border-[#30363d]
        text-[#e6edf3] rounded-lg
        p-3 select-none transition-all duration-200 shadow-md
        border-l-4 border-l-[#1f6feb] hover:border-[#58a6ff]/50 ${ring}`}
      style={{ width: node.width ?? 260, height: node.height ?? 84 }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Cpu size={11} className="text-[#58a6ff] shrink-0" />
          <span className="text-[10px] font-bold text-[#58a6ff] uppercase tracking-wide">{title}</span>
        </div>
        {lineLabel && (
          <span className="text-[10px] font-mono text-[#7d8590] bg-[#21262d]
                           px-1.5 py-0.5 rounded border border-[#30363d]">
            {lineLabel}
          </span>
        )}
      </div>
      <div className="text-[13px] font-mono text-[#e6edf3] font-semibold leading-snug
                      overflow-hidden" style={{ maxHeight: 38, wordBreak: 'break-word' }}>
        {truncateCode(code, 55)}
      </div>
    </div>
  );
}
