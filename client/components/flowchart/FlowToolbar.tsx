// client/components/flowchart/FlowToolbar.tsx
'use client';

import React from 'react';
import {
  FileCode, Code2, FolderGit2,
  ZoomIn, ZoomOut, Maximize2,
  Search, X, Map, RefreshCw,
  Network, Loader2
} from 'lucide-react';
import { FlowchartViewMode, GraphLevel } from '@/types/flowchart';

interface FlowToolbarProps {
  viewMode: FlowchartViewMode;
  onViewModeChange: (mode: FlowchartViewMode) => void;
  functions?: string[];
  selectedFunction?: string | null;
  onSelectFunction?: (funcName: string) => void;
  graphLevel?: GraphLevel;
  onGraphLevelChange?: (level: GraphLevel) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitToScreen: () => void;
  onResetZoom: () => void;
  showMinimap: boolean;
  onToggleMinimap: () => void;
  onRefresh: () => void;
  isAnalyzing?: boolean;
  fileName?: string | null;
}

export default function FlowToolbar({
  viewMode, onViewModeChange,
  functions = [], selectedFunction = null, onSelectFunction,
  graphLevel = 'combined', onGraphLevelChange,
  searchQuery, onSearchChange,
  zoom, onZoomIn, onZoomOut, onFitToScreen, onResetZoom,
  showMinimap, onToggleMinimap,
  onRefresh, isAnalyzing = false,
  fileName
}: FlowToolbarProps) {
  return (
    <div className="flex flex-col bg-[#161b22] border-b border-[#30363d] select-none">

      {/* ── Row 1: title / file + view tabs + zoom ── */}
      <div className="flex items-center gap-2 px-2.5 py-1.5 border-b border-[#30363d]/40">

        {/* Brand */}
        <div className="flex items-center gap-1.5 shrink-0">
          <Network size={12} className="text-[#58a6ff]" />
          {fileName ? (
            <span className="text-[10px] font-mono text-[#58a6ff] bg-[#1f6feb]/10 border border-[#1f6feb]/25 px-1.5 py-0.5 rounded max-w-[110px] truncate">
              {fileName}
            </span>
          ) : (
            <span className="text-[11px] font-semibold text-[#484f58]">Flowchart</span>
          )}
          {isAnalyzing && (
            <Loader2 size={10} className="animate-spin text-[#58a6ff]" />
          )}
        </div>

        {/* Divider */}
        <div className="w-px h-4 bg-[#30363d]/60 shrink-0" />

        {/* View tabs */}
        <div className="flex items-center gap-0.5 bg-[#0d1117] p-0.5 rounded border border-[#30363d]/70">
          {([
            { id: 'file'     as const, label: 'File',     icon: <FileCode    size={11} />, color: '#1f6feb' },
            { id: 'function' as const, label: 'Function', icon: <Code2       size={11} />, color: '#8957e5' },
            { id: 'project'  as const, label: 'Project',  icon: <FolderGit2  size={11} />, color: '#238636' },
          ]).map(tab => (
            <button
              key={tab.id}
              onClick={() => onViewModeChange(tab.id)}
              className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                viewMode === tab.id
                  ? 'text-white'
                  : 'text-[#7d8590] hover:text-[#c9d1d9] hover:bg-[#21262d]'
              }`}
              style={viewMode === tab.id ? { backgroundColor: tab.color } : {}}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.id === 'function' && functions.length > 0 && (
                <span className="ml-0.5 px-1 rounded-full text-[9px] bg-white/20">{functions.length}</span>
              )}
            </button>
          ))}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Zoom group */}
        <div className="flex items-center gap-0.5 bg-[#0d1117] px-0.5 py-0.5 rounded border border-[#30363d]/70">
          <button onClick={onZoomOut} title="Zoom out"
            className="p-1 text-[#7d8590] hover:text-[#c9d1d9] hover:bg-[#21262d] rounded transition-colors">
            <ZoomOut size={12} />
          </button>
          <button onClick={onResetZoom} title="Reset zoom"
            className="min-w-[36px] text-center py-0.5 text-[10px] font-mono text-[#7d8590] hover:text-[#c9d1d9] hover:bg-[#21262d] rounded transition-colors">
            {Math.round(zoom * 100)}%
          </button>
          <button onClick={onZoomIn} title="Zoom in"
            className="p-1 text-[#7d8590] hover:text-[#c9d1d9] hover:bg-[#21262d] rounded transition-colors">
            <ZoomIn size={12} />
          </button>
          <div className="w-px h-3 bg-[#30363d] mx-0.5" />
          <button onClick={onFitToScreen} title="Fit to screen"
            className="p-1 text-[#7d8590] hover:text-[#c9d1d9] hover:bg-[#21262d] rounded transition-colors">
            <Maximize2 size={12} />
          </button>
          <button onClick={onToggleMinimap} title="Toggle minimap"
            className={`p-1 rounded transition-colors ${showMinimap ? 'text-[#58a6ff] bg-[#1f6feb]/15' : 'text-[#7d8590] hover:text-[#c9d1d9] hover:bg-[#21262d]'}`}>
            <Map size={12} />
          </button>
          <button onClick={onRefresh} disabled={isAnalyzing} title="Refresh"
            className="p-1 text-[#7d8590] hover:text-[#c9d1d9] hover:bg-[#21262d] rounded transition-colors disabled:opacity-40">
            <RefreshCw size={12} className={isAnalyzing ? 'animate-spin text-[#58a6ff]' : ''} />
          </button>
        </div>
      </div>

      {/* ── Row 2: context + search ── */}
      <div className="flex items-center gap-2 px-2.5 py-1.5">

        {/* Context: function selector or project levels */}
        <div className="flex items-center gap-1.5 text-[11px] min-w-0 flex-1">

          {viewMode === 'file' && (
            <span className="text-[#484f58] text-[10px]">Interactive Source Flowchart</span>
          )}

          {viewMode === 'function' && (
            <>
              <span className="text-[#484f58] shrink-0">fn:</span>
              <select
                value={selectedFunction || 'all'}
                onChange={e => onSelectFunction?.(e.target.value)}
                className="bg-[#0d1117] border border-[#30363d] text-[#c9d1d9] text-[11px] rounded px-1.5 py-0.5 focus:border-[#8957e5]/60 focus:outline-none cursor-pointer min-w-0 max-w-[130px] truncate"
              >
                <option value="all">All Functions</option>
                {functions.map(fn => <option key={fn} value={fn}>{fn}()</option>)}
              </select>
            </>
          )}

          {viewMode === 'project' && (
            <>
              <span className="text-[#484f58] shrink-0">Level:</span>
              <div className="flex items-center gap-0.5 bg-[#0d1117] p-0.5 rounded border border-[#30363d]/70">
                {(['file', 'function', 'combined'] as const).map(lvl => (
                  <button key={lvl} onClick={() => onGraphLevelChange?.(lvl)}
                    className={`px-1.5 py-0.5 text-[10px] rounded capitalize transition-colors ${
                      graphLevel === lvl ? 'bg-[#238636] text-white' : 'text-[#7d8590] hover:text-[#c9d1d9]'
                    }`}>
                    {lvl}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Search */}
        <div className="relative shrink-0 w-[160px]">
          <Search size={11} className="absolute left-2 top-1/2 -translate-y-1/2 text-[#484f58]" />
          <input
            type="text"
            placeholder="Search nodes…"
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            className="w-full bg-[#0d1117] border border-[#30363d] rounded pl-6 pr-5 py-0.5 text-[11px] text-[#c9d1d9] placeholder-[#484f58] focus:border-[#58a6ff]/50 focus:outline-none transition-colors"
          />
          {searchQuery && (
            <button onClick={() => onSearchChange('')}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[#484f58] hover:text-[#c9d1d9]">
              <X size={11} />
            </button>
          )}
        </div>
      </div>

    </div>
  );
}
