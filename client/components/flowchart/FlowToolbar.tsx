// client/components/flowchart/FlowToolbar.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  FileCode,
  Code2,
  FolderGit2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Search,
  X,
  Map,
  RefreshCw,
  ChevronDown,
  Check,
  Filter,
  SlidersHorizontal,
  Loader2
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
}

export default function FlowToolbar({
  viewMode,
  onViewModeChange,
  functions = [],
  selectedFunction = null,
  onSelectFunction,
  graphLevel = 'combined',
  onGraphLevelChange,
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
  fileName, // eslint-disable-line @typescript-eslint/no-unused-vars
  detailLevel = 'standard',
  onDetailLevelChange,
  activeFilter = 'ALL',
  onFilterChange,
  counts = { all: 0 }
}: FlowToolbarProps) {
  // Dropdown open states
  const [viewDropdownOpen, setViewDropdownOpen] = useState(false);
  const [detailDropdownOpen, setDetailDropdownOpen] = useState(false);
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);

  // Refs for click outside handling
  const viewRef = useRef<HTMLDivElement>(null);
  const detailRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (viewRef.current && !viewRef.current.contains(event.target as Node)) {
        setViewDropdownOpen(false);
      }
      if (detailRef.current && !detailRef.current.contains(event.target as Node)) {
        setDetailDropdownOpen(false);
      }
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setFilterDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // View mode definitions
  const viewOptions: Array<{
    id: FlowchartViewMode;
    label: string;
    description: string;
    icon: React.ReactNode;
  }> = [
    {
      id: 'file',
      label: 'File',
      description: 'Control flow of active file',
      icon: <FileCode size={13} className="text-[#58a6ff]" />
    },
    {
      id: 'function',
      label: 'Function',
      description: 'Isolate specific function execution',
      icon: <Code2 size={13} className="text-[#a371f7]" />
    },
    {
      id: 'project',
      label: 'Project',
      description: 'Inter-file dependencies & architecture',
      icon: <FolderGit2 size={13} className="text-[#3fb950]" />
    }
  ];

  // Detail level definitions
  const detailOptions: Array<{
    id: 'overview' | 'standard' | 'detailed';
    label: string;
    description: string;
  }> = [
    {
      id: 'overview',
      label: 'Overview',
      description: 'Major control structures only (Entry, Decisions, Loops)'
    },
    {
      id: 'standard',
      label: 'Standard',
      description: 'Full control flow graph (default)'
    },
    {
      id: 'detailed',
      label: 'Detailed',
      description: 'All nodes including minor statements'
    }
  ];

  // Filter definitions based on viewMode
  const isProjectMode = viewMode === 'project';
  const filterOptions: Array<{ id: FlowFilter; label: string; count?: number }> = isProjectMode
    ? [
        { id: 'ALL', label: 'All', count: counts.all },
        { id: 'FILES', label: 'Files', count: counts.files },
        { id: 'FUNCTIONS', label: 'Functions', count: counts.functions },
        { id: 'CALLS', label: 'Calls', count: counts.calls },
        { id: 'DEPENDENCIES', label: 'Dependencies', count: counts.dependencies }
      ]
    : [
        { id: 'ALL', label: 'All', count: counts.all },
        { id: 'DECISIONS', label: 'Decisions', count: counts.decisions },
        { id: 'LOOPS', label: 'Loops', count: counts.loops },
        { id: 'FUNCTIONS', label: 'Functions', count: counts.functions },
        { id: 'CALLS', label: 'Calls', count: counts.calls }
      ];

  const currentViewLabel =
    viewOptions.find(o => o.id === viewMode)?.label || 'File';
  const currentDetailLabel =
    detailOptions.find(o => o.id === detailLevel)?.label || 'Standard';
  const currentFilterLabel =
    filterOptions.find(o => o.id === activeFilter)?.label || 'All';

  return (
    <div className="flex flex-col bg-[#161b22] border-b border-[#30363d] select-none text-xs">
      {/* ── ROW 1: View Selection, Detail, and Filters Dropdowns ── */}
      <div className="flex items-center gap-1.5 px-3 py-1.5 border-b border-[#30363d]/50 flex-wrap">

        {/* 1. View Dropdown */}
        <div className="relative shrink-0" ref={viewRef}>
          <button
            type="button"
            onClick={() => {
              setViewDropdownOpen(prev => !prev);
              setDetailDropdownOpen(false);
              setFilterDropdownOpen(false);
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-[#e6edf3] font-medium text-[11px] transition-colors focus:outline-none focus:border-[#58a6ff]/60"
            title="Switch flowchart view mode"
            aria-expanded={viewDropdownOpen}
          >
            {viewMode === 'file' && <FileCode size={12} className="text-[#58a6ff]" />}
            {viewMode === 'function' && <Code2 size={12} className="text-[#a371f7]" />}
            {viewMode === 'project' && <FolderGit2 size={12} className="text-[#3fb950]" />}
            <span>View: <strong className="font-semibold text-white">{currentViewLabel}</strong></span>
            <ChevronDown size={11} className={`text-[#8b949e] transition-transform ${viewDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {viewDropdownOpen && (
            <div className="absolute left-0 top-full mt-1 w-52 bg-[#1c2128] border border-[#30363d] rounded-md shadow-xl py-1 z-50 text-[11px]">
              <div className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#8b949e] border-b border-[#30363d]/40 mb-1">
                Graph Scope
              </div>
              {viewOptions.map(option => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => {
                    onViewModeChange(option.id);
                    setViewDropdownOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 text-left hover:bg-[#21262d] transition-colors ${
                    viewMode === option.id ? 'text-[#58a6ff] bg-[#1f6feb]/10 font-semibold' : 'text-[#c9d1d9]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {option.icon}
                    <div>
                      <div className="font-medium">{option.label} Flow</div>
                      <div className="text-[10px] text-[#8b949e] font-normal">{option.description}</div>
                    </div>
                  </div>
                  {viewMode === option.id && <Check size={13} className="text-[#58a6ff] shrink-0" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Function selector when viewMode is 'function' */}
        {viewMode === 'function' && (
          <div className="flex items-center gap-1 bg-[#0d1117] border border-[#30363d] rounded px-1.5 py-0.5 shrink-0">
            <span className="text-[10px] text-[#8b949e] font-mono">fn:</span>
            <select
              value={selectedFunction || 'all'}
              onChange={e => onSelectFunction?.(e.target.value)}
              className="bg-transparent text-[#e6edf3] text-[11px] focus:outline-none cursor-pointer max-w-[110px] truncate"
            >
              <option value="all" className="bg-[#1c2128]">All Functions</option>
              {functions.map(fn => (
                <option key={fn} value={fn} className="bg-[#1c2128]">
                  {fn}()
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Project Level selector when viewMode is 'project' */}
        {viewMode === 'project' && onGraphLevelChange && (
          <div className="flex items-center gap-0.5 bg-[#0d1117] p-0.5 rounded border border-[#30363d] shrink-0">
            {(['file', 'function', 'combined'] as const).map(lvl => (
              <button
                key={lvl}
                type="button"
                onClick={() => onGraphLevelChange(lvl)}
                className={`px-1.5 py-0.5 text-[10px] rounded capitalize transition-colors font-medium ${
                  graphLevel === lvl
                    ? 'bg-[#238636] text-white shadow-sm'
                    : 'text-[#8b949e] hover:text-[#e6edf3]'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        )}

        {/* 2. Detail Dropdown (for File and Function modes) */}
        {viewMode !== 'project' && onDetailLevelChange && (
          <div className="relative shrink-0" ref={detailRef}>
            <button
              type="button"
              onClick={() => {
                setDetailDropdownOpen(prev => !prev);
                setViewDropdownOpen(false);
                setFilterDropdownOpen(false);
              }}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-[#e6edf3] font-medium text-[11px] transition-colors focus:outline-none focus:border-[#58a6ff]/60"
              title="Change graph detail level"
              aria-expanded={detailDropdownOpen}
            >
              <SlidersHorizontal size={11} className="text-[#8b949e]" />
              <span>Detail: <strong className="font-semibold text-white">{currentDetailLabel}</strong></span>
              <ChevronDown size={11} className={`text-[#8b949e] transition-transform ${detailDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {detailDropdownOpen && (
              <div className="absolute left-0 top-full mt-1 w-56 bg-[#1c2128] border border-[#30363d] rounded-md shadow-xl py-1 z-50 text-[11px]">
                <div className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#8b949e] border-b border-[#30363d]/40 mb-1">
                  Detail Level
                </div>
                {detailOptions.map(option => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => {
                      onDetailLevelChange(option.id);
                      setDetailDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 text-left hover:bg-[#21262d] transition-colors ${
                      detailLevel === option.id ? 'text-[#58a6ff] bg-[#1f6feb]/10 font-semibold' : 'text-[#c9d1d9]'
                    }`}
                  >
                    <div>
                      <div className="font-medium">{option.label}</div>
                      <div className="text-[10px] text-[#8b949e] font-normal">{option.description}</div>
                    </div>
                    {detailLevel === option.id && <Check size={13} className="text-[#58a6ff] shrink-0 ml-2" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 3. Filters Dropdown */}
        {onFilterChange && (
          <div className="relative shrink-0" ref={filterRef}>
            <button
              type="button"
              onClick={() => {
                setFilterDropdownOpen(prev => !prev);
                setViewDropdownOpen(false);
                setDetailDropdownOpen(false);
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded border text-[11px] font-medium transition-colors focus:outline-none ${
                activeFilter !== 'ALL'
                  ? 'bg-[#1f6feb]/15 border-[#1f6feb]/50 text-[#58a6ff]'
                  : 'bg-[#21262d] hover:bg-[#30363d] border-[#30363d] text-[#e6edf3]'
              }`}
              title="Filter flowchart nodes"
              aria-expanded={filterDropdownOpen}
            >
              <Filter size={11} className={activeFilter !== 'ALL' ? 'text-[#58a6ff]' : 'text-[#8b949e]'} />
              <span>
                Filters
                {activeFilter !== 'ALL' ? `: ` : ''}
                {activeFilter !== 'ALL' && <strong className="font-semibold text-white">{currentFilterLabel}</strong>}
              </span>
              <ChevronDown size={11} className={`text-[#8b949e] transition-transform ${filterDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {filterDropdownOpen && (
              <div className="absolute left-0 top-full mt-1 w-48 bg-[#1c2128] border border-[#30363d] rounded-md shadow-xl py-1 z-50 text-[11px]">
                <div className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#8b949e] border-b border-[#30363d]/40 mb-1 flex items-center justify-between">
                  <span>Filter Nodes</span>
                  {activeFilter !== 'ALL' && (
                    <button
                      type="button"
                      onClick={() => {
                        onFilterChange('ALL');
                        setFilterDropdownOpen(false);
                      }}
                      className="text-[10px] text-[#58a6ff] hover:underline"
                    >
                      Reset
                    </button>
                  )}
                </div>
                {filterOptions.map(option => {
                  const isActive = activeFilter === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => {
                        onFilterChange(option.id);
                        setFilterDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 text-left hover:bg-[#21262d] transition-colors ${
                        isActive ? 'text-[#58a6ff] bg-[#1f6feb]/10 font-semibold' : 'text-[#c9d1d9]'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span>{option.label}</span>
                        {option.count !== undefined && option.count > 0 && (
                          <span
                            className={`px-1.5 py-0.2 rounded-full text-[9px] ${
                              isActive ? 'bg-[#1f6feb] text-white' : 'bg-[#0d1117] text-[#8b949e] border border-[#30363d]'
                            }`}
                          >
                            {option.count}
                          </span>
                        )}
                      </div>
                      {isActive && <Check size={13} className="text-[#58a6ff] shrink-0" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Loading Spinner indicator if analyzing */}
        {isAnalyzing && (
          <div className="flex items-center gap-1 text-[11px] text-[#58a6ff] ml-auto">
            <Loader2 size={12} className="animate-spin text-[#58a6ff]" />
            <span className="text-[10px]">Analyzing…</span>
          </div>
        )}
      </div>

      {/* ── ROW 2: Search and Graph Controls ── */}
      <div className="flex items-center gap-2 px-3 py-1.5">

        {/* Compact Search Field */}
        <div className="relative flex-1 min-w-[110px]">
          <Search size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#8b949e]" />
          <input
            type="text"
            placeholder="Search nodes…"
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            className="w-full bg-[#0d1117] border border-[#30363d] rounded pl-7 pr-6 py-1 text-xs text-[#c9d1d9] placeholder-[#7d8590] focus:border-[#58a6ff] focus:outline-none transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[#8b949e] hover:text-[#e6edf3]"
              title="Clear search"
            >
              <X size={11} />
            </button>
          )}
        </div>

        {/* Zoom and Screen Controls Group */}
        <div className="flex items-center gap-0.5 bg-[#0d1117] p-0.5 rounded border border-[#30363d] shrink-0">
          <button
            type="button"
            onClick={onZoomOut}
            title="Zoom out"
            aria-label="Zoom out"
            className="p-1 text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#21262d] rounded transition-colors"
          >
            <ZoomOut size={12} />
          </button>

          <button
            type="button"
            onClick={onResetZoom}
            title="Reset zoom to 100%"
            aria-label="Reset zoom"
            className="min-w-[34px] px-1 text-center py-0.5 text-[10px] font-mono text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#21262d] rounded transition-colors"
          >
            {Math.round(zoom * 100)}%
          </button>

          <button
            type="button"
            onClick={onZoomIn}
            title="Zoom in"
            aria-label="Zoom in"
            className="p-1 text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#21262d] rounded transition-colors"
          >
            <ZoomIn size={12} />
          </button>

          <div className="w-px h-3 bg-[#30363d] mx-0.5" />

          <button
            type="button"
            onClick={onFitToScreen}
            title="Fit to view"
            aria-label="Fit to view"
            className="p-1 text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#21262d] rounded transition-colors"
          >
            <Maximize2 size={12} />
          </button>

          <button
            type="button"
            onClick={onToggleMinimap}
            title="Toggle minimap"
            aria-label="Toggle minimap"
            className={`p-1 rounded transition-colors ${
              showMinimap ? 'text-[#58a6ff] bg-[#1f6feb]/15' : 'text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#21262d]'
            }`}
          >
            <Map size={12} />
          </button>

          <button
            type="button"
            onClick={onRefresh}
            disabled={isAnalyzing}
            title="Refresh flowchart"
            aria-label="Refresh flowchart"
            className="p-1 text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#21262d] rounded transition-colors disabled:opacity-40"
          >
            <RefreshCw size={12} className={isAnalyzing ? 'animate-spin text-[#58a6ff]' : ''} />
          </button>
        </div>

      </div>
    </div>
  );
}
