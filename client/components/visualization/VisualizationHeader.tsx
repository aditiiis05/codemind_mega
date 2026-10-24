<<<<<<< HEAD
// client/components/visualization/VisualizationHeader.tsx
// Sleek, compact single-row header for switching between Flowchart & Mind Map

'use client';

import React from 'react';
import { GitBranch, Activity, FileCode, Maximize2, Minimize2, RefreshCw } from 'lucide-react';
=======
'use client';

import React from 'react';
import { GitBranch, Activity, Network } from 'lucide-react';
>>>>>>> 1fedef5cdf2fa8631c20411f700509b8bbdcb0e2

interface VisualizationHeaderProps {
  activeTab: 'flowchart' | 'mindmap';
  onTabChange: (tab: 'flowchart' | 'mindmap') => void;
  fileName?: string | null;
<<<<<<< HEAD
  onRefresh?: () => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
=======
>>>>>>> 1fedef5cdf2fa8631c20411f700509b8bbdcb0e2
}

export default function VisualizationHeader({
  activeTab,
  onTabChange,
  fileName,
<<<<<<< HEAD
  onRefresh,
  isFullscreen = false,
  onToggleFullscreen,
}: VisualizationHeaderProps) {
  return (
    <div className="h-[36px] px-3 bg-[#252526] border-b border-[#2b2b2b] flex items-center justify-between shrink-0 select-none text-xs">
      {/* Left: Visualization Mode Tabs */}
      <div className="flex items-center gap-1">
        <div
          role="tablist"
          aria-label="Code visualization modes"
          className="flex items-center p-0.5 bg-[#1e1e1e] rounded border border-[#3c3c3c]"
=======
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
>>>>>>> 1fedef5cdf2fa8631c20411f700509b8bbdcb0e2
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'flowchart'}
            onClick={() => onTabChange('flowchart')}
<<<<<<< HEAD
            className={`flex items-center gap-1.5 py-1 px-2.5 rounded text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'flowchart'
                ? 'bg-[#0e639c] text-white shadow-sm'
                : 'text-[#858585] hover:text-[#cccccc] hover:bg-[#2a2d2e]'
            }`}
            title="Interactive Control Flow Graph"
          >
            <GitBranch size={12} className={activeTab === 'flowchart' ? 'text-white' : 'text-[#858585]'} />
            <span>Flowchart</span>
          </button>

=======
            className={`flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-md text-xs font-semibold transition-all duration-150 ${
              activeTab === 'flowchart'
                ? 'bg-[#1f6feb] text-white shadow-sm ring-1 ring-[#58a6ff]/40'
                : 'text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#21262d]'
            }`}
          >
            <GitBranch size={13} className={activeTab === 'flowchart' ? 'text-white' : 'text-[#8b949e]'} />
            <span>Flowchart</span>
          </button>
>>>>>>> 1fedef5cdf2fa8631c20411f700509b8bbdcb0e2
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'mindmap'}
            onClick={() => onTabChange('mindmap')}
<<<<<<< HEAD
            className={`flex items-center gap-1.5 py-1 px-2.5 rounded text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'mindmap'
                ? 'bg-[#0e639c] text-white shadow-sm'
                : 'text-[#858585] hover:text-[#cccccc] hover:bg-[#2a2d2e]'
            }`}
            title="Repository Mind Map & Architecture"
          >
            <Activity size={12} className={activeTab === 'mindmap' ? 'text-white' : 'text-[#858585]'} />
=======
            className={`flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-md text-xs font-semibold transition-all duration-150 ${
              activeTab === 'mindmap'
                ? 'bg-[#1f6feb] text-white shadow-sm ring-1 ring-[#58a6ff]/40'
                : 'text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#21262d]'
            }`}
          >
            <Activity size={13} className={activeTab === 'mindmap' ? 'text-white' : 'text-[#8b949e]'} />
>>>>>>> 1fedef5cdf2fa8631c20411f700509b8bbdcb0e2
            <span>Mind Map</span>
          </button>
        </div>
      </div>
<<<<<<< HEAD

      {/* Center: File badge */}
      {fileName && (
        <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-mono text-[#858585] bg-[#1e1e1e] border border-[#3c3c3c] px-2 py-0.5 rounded max-w-[220px] truncate">
          <FileCode size={11} className="text-[#007acc] shrink-0" />
          <span className="truncate">{fileName}</span>
        </div>
      )}

      {/* Right: Actions */}
      <div className="flex items-center gap-1">
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="p-1 rounded text-[#858585] hover:text-white hover:bg-[#333333] transition-colors cursor-pointer"
            title="Refresh Visualization"
            aria-label="Refresh Visualization"
          >
            <RefreshCw size={13} />
          </button>
        )}

        {onToggleFullscreen && (
          <button
            onClick={onToggleFullscreen}
            className={`p-1 rounded transition-colors cursor-pointer ${
              isFullscreen
                ? 'text-[#007acc] bg-[#1e1e1e] border border-[#007acc]'
                : 'text-[#858585] hover:text-white hover:bg-[#333333]'
            }`}
            title={isFullscreen ? 'Exit Full Screen (Esc)' : 'Full Screen View'}
            aria-label={isFullscreen ? 'Exit Full Screen' : 'Full Screen'}
          >
            {isFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
          </button>
        )}
      </div>
=======
>>>>>>> 1fedef5cdf2fa8631c20411f700509b8bbdcb0e2
    </div>
  );
}
