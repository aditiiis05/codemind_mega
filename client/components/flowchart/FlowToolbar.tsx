// client/components/flowchart/FlowToolbar.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  RotateCcw,
  Search,
  X,
  Map,
  RefreshCw,
  ChevronDown,
  Check,
  Filter,
  SlidersHorizontal,
  Loader2,
  Scan,
} from 'lucide-react';
import { FlowchartViewMode, GraphLevel, FlowFilter } from '@/types/flowchart';

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
  detailLevel?: 'overview' | 'standard' | 'detailed';
  onDetailLevelChange?: (level: 'overview' | 'standard' | 'detailed') => void;
  activeFilter?: FlowFilter;
  onFilterChange?: (filter: FlowFilter) => void;
  counts?: {
    all: number;
    decisions?: number;
    loops?: number;
    functions?: number;
    calls?: number;
    files?: number;
    dependencies?: number;
  };
  onResetLayout?: () => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
  onToggleLegend?: () => void;
  isLegendOpen?: boolean;
}

export default function FlowToolbar({
  viewMode,
  onViewModeChange: _onViewModeChange,
  functions = [],
  selectedFunction = null,
  onSelectFunction,
  graphLevel: _graphLevel,
  onGraphLevelChange: _onGraphLevelChange,
  searchQuery,
  onSearchChange,
  zoom,
  onZoomIn,
  onZoomOut,
  onFitToScreen,
  onResetZoom,
  showMinimap,
  onToggleMinimap,
  onRefresh,
  isAnalyzing = false,
  fileName: _fileName,
  detailLevel = 'standard',
  onDetailLevelChange,
  activeFilter = 'ALL',
  onFilterChange,
  counts = { all: 0 },
  onResetLayout,
  isFullscreen = false,
  onToggleFullscreen,
  onToggleLegend: _onToggleLegend,
  isLegendOpen: _isLegendOpen,
}: FlowToolbarProps) {
  const [detailOpen, setDetailOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [fnOpen, setFnOpen] = useState(false);

  const detailRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);
  const fnRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (detailRef.current && !detailRef.current.contains(e.target as Node)) setDetailOpen(false);
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) setFilterOpen(false);
      if (fnRef.current && !fnRef.current.contains(e.target as Node)) setFnOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const detailOptions = [
    { id: 'overview' as const, label: 'Overview', desc: 'Major structures only' },
    { id: 'standard' as const, label: 'Standard', desc: 'Balanced control flow' },
    { id: 'detailed' as const, label: 'Detailed', desc: 'All nodes including minor ops' },
  ];

  const isProject = viewMode === 'project';
  const filterOptions = isProject
    ? [
        { id: 'ALL' as FlowFilter, label: 'All', count: counts.all },
        { id: 'FILES' as FlowFilter, label: 'Files', count: counts.files },
        { id: 'FUNCTIONS' as FlowFilter, label: 'Functions', count: counts.functions },
        { id: 'CALLS' as FlowFilter, label: 'Calls', count: counts.calls },
      ]
    : [
        { id: 'ALL' as FlowFilter, label: 'All', count: counts.all },
        { id: 'DECISIONS' as FlowFilter, label: 'Decisions', count: counts.decisions },
        { id: 'LOOPS' as FlowFilter, label: 'Loops', count: counts.loops },
        { id: 'FUNCTIONS' as FlowFilter, label: 'Functions', count: counts.functions },
        { id: 'CALLS' as FlowFilter, label: 'Calls', count: counts.calls },
      ];

  const currentDetail = detailOptions.find(o => o.id === detailLevel)?.label ?? 'Standard';
  const currentFilter = filterOptions.find(o => o.id === activeFilter)?.label ?? 'All';

  /* ── Shared dropdown button style ── */
  const dropBtn = (active: boolean) =>
    `flex items-center gap-1 px-2 h-[24px] rounded border text-[11px] font-medium transition-colors cursor-pointer ${
      active
        ? 'bg-[#094771] border-[#007acc] text-white'
        : 'bg-[#2d2d2d] border-[#3c3c3c] text-[#cccccc] hover:border-[#555] hover:text-white'
    }`;

  return (
    <div className="flex items-center gap-2 px-3 h-[36px] bg-[#252526] border-b border-[#2b2b2b] select-none shrink-0">

      {/* ── Left: dropdowns ── */}
      <div className="flex items-center gap-1.5">

        {/* Detail Level */}
        {onDetailLevelChange && !isProject && (
          <div className="relative" ref={detailRef}>
            <button
              type="button"
              onClick={() => { setDetailOpen(p => !p); setFilterOpen(false); }}
              className={dropBtn(false)}
              title="Graph detail level"
            >
              <SlidersHorizontal size={11} className="text-[#007acc]" />
              <span className="text-[#858585]">Detail:</span>
              <span className="text-white font-semibold">{currentDetail}</span>
              <ChevronDown size={10} className={`text-[#858585] transition-transform ${detailOpen ? 'rotate-180' : ''}`} />
            </button>

            {detailOpen && (
              <div className="absolute left-0 top-full mt-1 w-52 bg-[#252526] border border-[#3c3c3c] rounded shadow-xl py-1 z-50">
                {detailOptions.map(o => (
                  <button
                    key={o.id}
                    type="button"
                    onClick={() => { onDetailLevelChange(o.id); setDetailOpen(false); }}
                    className={`w-full flex items-center justify-between px-3 py-1.5 text-left hover:bg-[#2a2d2e] cursor-pointer ${
                      detailLevel === o.id ? 'text-[#75beff] bg-[#094771]/20' : 'text-[#cccccc]'
                    }`}
                  >
                    <div>
                      <div className="text-[11px] font-semibold">{o.label}</div>
                      <div className="text-[10px] text-[#858585]">{o.desc}</div>
                    </div>
                    {detailLevel === o.id && <Check size={12} className="text-[#75beff] shrink-0" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Filter */}
        {onFilterChange && (
          <div className="relative" ref={filterRef}>
            <button
              type="button"
              onClick={() => { setFilterOpen(p => !p); setDetailOpen(false); }}
              className={dropBtn(activeFilter !== 'ALL')}
              title="Filter nodes"
            >
              <Filter size={11} className={activeFilter !== 'ALL' ? 'text-[#75beff]' : 'text-[#858585]'} />
              <span className="text-[#858585]">Filter:</span>
              <span className="text-white font-semibold">{currentFilter}</span>
              <ChevronDown size={10} className={`text-[#858585] transition-transform ${filterOpen ? 'rotate-180' : ''}`} />
            </button>

            {filterOpen && (
              <div className="absolute left-0 top-full mt-1 w-44 bg-[#252526] border border-[#3c3c3c] rounded shadow-xl py-1 z-50">
                {filterOptions.map(o => (
                  <button
                    key={o.id}
                    type="button"
                    onClick={() => { onFilterChange(o.id); setFilterOpen(false); }}
                    className={`w-full flex items-center justify-between px-3 py-1.5 text-left hover:bg-[#2a2d2e] text-[11px] cursor-pointer ${
                      activeFilter === o.id ? 'text-[#75beff] bg-[#094771]/20 font-semibold' : 'text-[#cccccc]'
                    }`}
                  >
                    <span>{o.label}</span>
                    <div className="flex items-center gap-1.5">
                      {o.count !== undefined && o.count > 0 && (
                        <span className="text-[9px] font-mono text-[#858585]">{o.count}</span>
                      )}
                      {activeFilter === o.id && <Check size={11} className="text-[#75beff]" />}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Function selector */}
        {viewMode === 'function' && (
          <div className="relative" ref={fnRef}>
            <button
              type="button"
              onClick={() => setFnOpen(p => !p)}
              className={dropBtn(false)}
              title="Select function"
            >
              <span className="text-[10px] text-[#73c991] font-mono font-bold">fn:</span>
              <span className="font-mono truncate max-w-[100px]">
                {selectedFunction || 'All'}
              </span>
              <ChevronDown size={10} className={`text-[#858585] transition-transform ${fnOpen ? 'rotate-180' : ''}`} />
            </button>

            {fnOpen && (
              <div className="absolute left-0 top-full mt-1 w-44 bg-[#252526] border border-[#3c3c3c] rounded shadow-xl py-1 z-50 max-h-52 overflow-y-auto">
                <button
                  type="button"
                  onClick={() => { onSelectFunction?.('all'); setFnOpen(false); }}
                  className={`w-full flex items-center justify-between px-3 py-1.5 text-left hover:bg-[#2a2d2e] text-[11px] cursor-pointer ${
                    !selectedFunction || selectedFunction === 'all' ? 'text-[#75beff] font-semibold' : 'text-[#cccccc]'
                  }`}
                >
                  All Functions
                  {(!selectedFunction || selectedFunction === 'all') && <Check size={11} />}
                </button>
                {functions.map(fn => (
                  <button
                    key={fn}
                    type="button"
                    onClick={() => { onSelectFunction?.(fn); setFnOpen(false); }}
                    className={`w-full flex items-center justify-between px-3 py-1.5 text-left font-mono hover:bg-[#2a2d2e] text-[11px] cursor-pointer truncate ${
                      selectedFunction === fn ? 'text-[#75beff] font-semibold' : 'text-[#cccccc]'
                    }`}
                  >
                    <span className="truncate">{fn}()</span>
                    {selectedFunction === fn && <Check size={11} className="shrink-0" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Center: Search ── */}
      <div className="relative flex-1 min-w-[120px] max-w-[220px]">
        <Search size={11} className="absolute left-2 top-1/2 -translate-y-1/2 text-[#858585] pointer-events-none" />
        <input
          type="text"
          placeholder="Search nodes…"
          value={searchQuery}
          onChange={e => onSearchChange(e.target.value)}
          className="w-full h-[24px] bg-[#1e1e1e] border border-[#3c3c3c] rounded pl-6 pr-6 text-[11px] text-[#cccccc] placeholder-[#555] focus:border-[#007acc] focus:outline-none transition-colors"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[#858585] hover:text-white cursor-pointer"
          >
            <X size={11} />
          </button>
        )}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* ── Right: Zoom + controls ── */}
      <div className="flex items-center gap-0.5">

        {/* Analyzing indicator */}
        {isAnalyzing && (
          <span className="flex items-center gap-1 mr-1 text-[11px] text-[#007acc]">
            <Loader2 size={11} className="animate-spin" />
            <span className="hidden sm:inline">Analyzing…</span>
          </span>
        )}

        {/* Zoom controls */}
        <div className="flex items-center gap-0 bg-[#1e1e1e] border border-[#3c3c3c] rounded overflow-hidden">
          <button
            type="button"
            onClick={onZoomOut}
            title="Zoom out"
            className="px-1.5 h-[24px] text-[#858585] hover:text-white hover:bg-[#2a2d2e] transition-colors cursor-pointer"
          >
            <ZoomOut size={12} />
          </button>

          <button
            type="button"
            onClick={onResetZoom}
            title="Reset zoom"
            className="px-1.5 h-[24px] min-w-[36px] text-center text-[10px] font-mono text-[#cccccc] hover:text-white hover:bg-[#2a2d2e] transition-colors cursor-pointer border-x border-[#3c3c3c]"
          >
            {Math.round(zoom * 100)}%
          </button>

          <button
            type="button"
            onClick={onZoomIn}
            title="Zoom in"
            className="px-1.5 h-[24px] text-[#858585] hover:text-white hover:bg-[#2a2d2e] transition-colors cursor-pointer"
          >
            <ZoomIn size={12} />
          </button>
        </div>

        {/* Fit to screen */}
        <button
          type="button"
          onClick={onFitToScreen}
          title="Fit to screen"
          className="ml-0.5 p-1 h-[24px] w-[24px] flex items-center justify-center text-[#858585] hover:text-white hover:bg-[#2a2d2e] rounded transition-colors cursor-pointer"
        >
          <Scan size={12} />
        </button>

        {/* Reset layout */}
        {onResetLayout && (
          <button
            type="button"
            onClick={onResetLayout}
            title="Reset layout"
            className="p-1 h-[24px] w-[24px] flex items-center justify-center text-[#858585] hover:text-white hover:bg-[#2a2d2e] rounded transition-colors cursor-pointer"
          >
            <RotateCcw size={12} />
          </button>
        )}

        {/* Minimap */}
        <button
          type="button"
          onClick={onToggleMinimap}
          title={showMinimap ? 'Hide minimap' : 'Show minimap'}
          className={`p-1 h-[24px] w-[24px] flex items-center justify-center rounded transition-colors cursor-pointer ${
            showMinimap ? 'text-white bg-[#0e639c]' : 'text-[#858585] hover:text-white hover:bg-[#2a2d2e]'
          }`}
        >
          <Map size={12} />
        </button>

        {/* Refresh */}
        <button
          type="button"
          onClick={onRefresh}
          disabled={isAnalyzing}
          title="Refresh"
          className="p-1 h-[24px] w-[24px] flex items-center justify-center text-[#858585] hover:text-white hover:bg-[#2a2d2e] rounded transition-colors disabled:opacity-40 cursor-pointer"
        >
          <RefreshCw size={12} className={isAnalyzing ? 'animate-spin text-[#007acc]' : ''} />
        </button>

        {/* Fullscreen */}
        {onToggleFullscreen && (
          <button
            type="button"
            onClick={onToggleFullscreen}
            title={isFullscreen ? 'Exit fullscreen (Esc)' : 'Fullscreen'}
            className={`p-1 h-[24px] w-[24px] flex items-center justify-center rounded transition-colors cursor-pointer ${
              isFullscreen
                ? 'text-[#007acc] bg-[#1e1e1e] border border-[#007acc]'
                : 'text-[#858585] hover:text-white hover:bg-[#2a2d2e]'
            }`}
          >
            {isFullscreen ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
          </button>
        )}
      </div>
    </div>
  );
}
