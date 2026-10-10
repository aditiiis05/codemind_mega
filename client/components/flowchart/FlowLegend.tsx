// client/components/flowchart/FlowLegend.tsx
// Legend component explaining node shapes, edge types, and decision branches

'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

export default function FlowLegend() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-t border-[#30363d] bg-[#161b22] text-xs select-none">
      <button
        onClick={() => setIsOpen(prev => !prev)}
        className="w-full flex items-center justify-between px-3 py-1.5 text-[#7d8590] hover:text-[#e6edf3] transition-colors"
      >
        <div className="flex items-center gap-1.5 font-medium">
          <HelpCircle size={13} />
          <span>Flowchart Symbols & Legend</span>
        </div>
        {isOpen ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
      </button>

      {isOpen && (
        <div className="p-3 bg-[#0d1117] grid grid-cols-2 md:grid-cols-4 gap-3 border-t border-[#30363d]/50 text-[11px]">
          {/* Node Types Section */}
          <div className="space-y-1.5">
            <div className="font-semibold text-[#8b949e] uppercase tracking-wider text-[10px]">
              Control Nodes
            </div>
            <div className="flex items-center gap-2 text-[#e6edf3]">
              <span className="w-4 h-2 rounded-full bg-emerald-500 inline-block" />
              <span>START / ENTRY</span>
            </div>
            <div className="flex items-center gap-2 text-[#e6edf3]">
              <span className="w-4 h-2 rounded-full bg-rose-500 inline-block" />
              <span>END / EXIT</span>
            </div>
            <div className="flex items-center gap-2 text-[#e6edf3]">
              <span className="w-3.5 h-3.5 rotate-45 border border-amber-400 bg-amber-950/60 inline-block" />
              <span>DECISION (if / else)</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="font-semibold text-[#8b949e] uppercase tracking-wider text-[10px]">
              Execution Nodes
            </div>
            <div className="flex items-center gap-2 text-[#e6edf3]">
              <span className="w-3.5 h-3 rounded bg-[#21262d] border border-[#58a6ff] inline-block" />
              <span>PROCESS (statement)</span>
            </div>
            <div className="flex items-center gap-2 text-[#e6edf3]">
              <span className="w-3.5 h-3 rounded bg-purple-950 border border-purple-400 inline-block" />
              <span>FUNCTION (def/call)</span>
            </div>
            <div className="flex items-center gap-2 text-[#e6edf3]">
              <span className="w-3.5 h-3 rounded bg-indigo-950 border border-indigo-400 inline-block" />
              <span>LOOP (for / while)</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="font-semibold text-[#8b949e] uppercase tracking-wider text-[10px]">
              I/O & Error
            </div>
            <div className="flex items-center gap-2 text-[#e6edf3]">
              <span className="w-3.5 h-3 skew-x-[-12deg] bg-teal-950 border border-teal-400 inline-block" />
              <span>INPUT / OUTPUT</span>
            </div>
            <div className="flex items-center gap-2 text-[#e6edf3]">
              <span className="w-3.5 h-3 rounded bg-red-950 border border-red-500 inline-block" />
              <span>ERROR / EXCEPTION</span>
            </div>
            <div className="flex items-center gap-2 text-[#e6edf3]">
              <span className="w-3.5 h-3 rounded bg-emerald-950 border border-emerald-400 inline-block" />
              <span>RETURN</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="font-semibold text-[#8b949e] uppercase tracking-wider text-[10px]">
              Edge Branches
            </div>
            <div className="flex items-center gap-2 text-emerald-400">
              <span className="font-mono font-bold text-[10px]">──YES──►</span>
              <span>True condition</span>
            </div>
            <div className="flex items-center gap-2 text-rose-400">
              <span className="font-mono font-bold text-[10px]">──NO───►</span>
              <span>False / Else</span>
            </div>
            <div className="flex items-center gap-2 text-purple-400">
              <span className="font-mono font-bold text-[10px]">─CALLS─►</span>
              <span>Function invocation</span>
            </div>
            <div className="flex items-center gap-2 text-cyan-400">
              <span className="font-mono font-bold text-[10px]">IMPORTS►</span>
              <span>Module dependency</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
