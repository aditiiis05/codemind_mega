'use client';

import React from 'react';
import { GitBranch, Activity, Network } from 'lucide-react';

interface VisualizationHeaderProps {
  activeTab: 'flowchart' | 'mindmap';
  onTabChange: (tab: 'flowchart' | 'mindmap') => void;
  fileName?: string | null;
}

export default function VisualizationHeader({
  activeTab,
  onTabChange,
  fileName,
}: VisualizationHeaderProps) {
  return (
    <div className="flex flex-col bg-[#161b22] border-b border-[#30363d] shrink-0 select-none">
      {/* Title Bar */}
      <div className="flex items-center justify-between px-3 pt-2.5 pb-2">
        <div className="flex items-center gap-2 min-w-0">
          <Network size={14} className="text-[#58a6ff] shrink-0" />
          <h2 className="text-[11px] uppercase tracking-wider font-bold text-[#e6edf3] truncate">
            CODE VISUALIZATION
          </h2>
        </div>
        {fileName && (
          <span
            className="text-[10px] font-mono text-[#58a6ff] bg-[#1f6feb]/10 border border-[#1f6feb]/25 px-1.5 py-0.5 rounded truncate max-w-[140px] shrink-0"
            title={fileName}
          >
            {fileName}
          </span>
        )}
      </div>

      {/* Segmented Control (Flowchart | Mind Map) */}
      <div className="px-3 pb-2.5">
        <div
          role="tablist"
          aria-label="Code visualization modes"
          className="grid grid-cols-2 p-1 bg-[#0d1117] rounded-lg border border-[#30363d] gap-1 shadow-inner"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'flowchart'}
            onClick={() => onTabChange('flowchart')}
            className={`flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-md text-xs font-semibold transition-all duration-150 ${
              activeTab === 'flowchart'
                ? 'bg-[#1f6feb] text-white shadow-sm ring-1 ring-[#58a6ff]/40'
                : 'text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#21262d]'
            }`}
          >
            <GitBranch size={13} className={activeTab === 'flowchart' ? 'text-white' : 'text-[#8b949e]'} />
            <span>Flowchart</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'mindmap'}
            onClick={() => onTabChange('mindmap')}
            className={`flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-md text-xs font-semibold transition-all duration-150 ${
              activeTab === 'mindmap'
                ? 'bg-[#1f6feb] text-white shadow-sm ring-1 ring-[#58a6ff]/40'
                : 'text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#21262d]'
            }`}
          >
            <Activity size={13} className={activeTab === 'mindmap' ? 'text-white' : 'text-[#8b949e]'} />
            <span>Mind Map</span>
          </button>
        </div>
      </div>
    </div>
  );
}
