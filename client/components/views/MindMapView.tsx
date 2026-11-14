'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Search,
  X,
  ZoomIn,
  ZoomOut,
  Maximize2,
  ChevronDown,
  RefreshCw,
  FileCode,
  AlertCircle,
  Loader2,
  Brain,
  Download,
  GitFork,
  Radio
} from 'lucide-react';
import MermaidChart, { MermaidChartHandle } from '../MermaidChart';
import { analyzeFile } from '@/services/flowchartApi';

interface MindMapViewProps {
  selectedFileContent?: string | null;
  triggerGeneration?: { type: 'flowchart' | 'mindmap' | null; timestamp?: number };
  fileName?: string | null;
  language?: string | null;
}

export default function MindMapView({
  selectedFileContent = null,
  triggerGeneration,
  fileName,
  language
}: MindMapViewProps) {
  const [mermaidCode, setMermaidCode] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mind map controls
  const [searchQuery, setSearchQuery] = useState('');
  const [zoom, setZoom] = useState(1.0);
  const [viewMode, setViewMode] = useState<'tree' | 'radial'>('tree');
  const [moreOptionsOpen, setMoreOptionsOpen] = useState(false);

  const mermaidChartRef = useRef<MermaidChartHandle>(null);
  const moreOptionsRef = useRef<HTMLDivElement>(null);

  // Close more options dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (moreOptionsRef.current && !moreOptionsRef.current.contains(event.target as Node)) {
        setMoreOptionsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Generate mind map diagram from flowchart data — no AI needed, works offline
  const handleGenerateMindMap = useCallback(async () => {
    if (!selectedFileContent || !fileName) return;

    setIsLoading(true);
    setError(null);
    setMermaidCode('');

    try {
      const ext = fileName.split('.').pop()?.toLowerCase() || 'js';
      const langMap: Record<string, string> = {
        js: 'javascript', jsx: 'javascript', ts: 'typescript', tsx: 'typescript',
        py: 'python', java: 'java', go: 'go', rs: 'rust', cs: 'csharp',
        rb: 'ruby', php: 'php', cpp: 'cpp', c: 'c',
      };
      const lang = langMap[ext] || 'javascript';

      const result = await analyzeFile({ code: selectedFileContent, language: lang, fileName });

      const baseName = fileName.split('/').pop()?.replace(/\.[^.]+$/, '') || fileName;
      const sanitize = (s: string) => s.replace(/[`"()[\]{}<>]/g, '').trim().slice(0, 48) || 'node';

      const functions = result.nodes.filter(n => n.type === 'FUNCTION');
      const decisions = result.nodes.filter(n => n.type === 'DECISION');
      const loops = result.nodes.filter(n => n.type === 'LOOP');
      const processes = result.nodes.filter(n => n.type === 'PROCESS').slice(0, 6);
      const returns = result.nodes.filter(n => n.type === 'RETURN');

      const lines: string[] = ['mindmap', `  root((**${sanitize(baseName)}**))`];

      if (functions.length > 0) {
        lines.push('    Functions');
        functions.slice(0, 8).forEach(n => lines.push(`      ${sanitize(n.label)}`));
      }
      if (decisions.length > 0) {
        lines.push('    Decisions');
        decisions.slice(0, 6).forEach(n => lines.push(`      ${sanitize(n.label)}`));
      }
      if (loops.length > 0) {
        lines.push('    Loops');
        loops.slice(0, 4).forEach(n => lines.push(`      ${sanitize(n.label)}`));
      }
      if (processes.length > 0) {
        lines.push('    Statements');
        processes.forEach(n => lines.push(`      ${sanitize(n.label)}`));
      }
      if (returns.length > 0) {
        lines.push('    Returns');
        returns.slice(0, 4).forEach(n => lines.push(`      ${sanitize(n.label)}`));
      }

      setMermaidCode(lines.join('\n'));
    } catch (err: unknown) {
      console.error('[MindMapView] Error generating diagram:', err);
      const baseName = fileName.split('/').pop() || fileName;
      const fnLines = selectedFileContent.split('\n')
        .filter(l => /function\s+\w+|def\s+\w+|class\s+\w+/.test(l))
        .slice(0, 8)
        .map(l => `      ${l.trim().slice(0, 40).replace(/[`"()[\]{}<>]/g, '')}`);
      setMermaidCode([
        'mindmap',
        `  root((${baseName}))`,
        '    Structure',
        ...(fnLines.length ? fnLines : ['      open file to analyze']),
      ].join('\n'));
      if (err instanceof Error && !err.message.includes('network')) {
        setError(`Could not analyze: ${err.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  }, [selectedFileContent, fileName]);

  // Reset state when selected file changes and auto-generate if content is available
  useEffect(() => {
    setError(null);
    setSearchQuery('');
    setZoom(1.0);
    if (selectedFileContent && fileName) {
      handleGenerateMindMap();
    } else {
      setMermaidCode('');
    }
  }, [fileName, selectedFileContent, handleGenerateMindMap]);

  // Handle external trigger for generation
  useEffect(() => {
    if (triggerGeneration?.type === 'mindmap' && selectedFileContent && triggerGeneration.timestamp) {
      handleGenerateMindMap();
    }
  }, [triggerGeneration?.timestamp, handleGenerateMindMap, selectedFileContent]);

  // Estimate node count from mermaid code
  const nodeCount = React.useMemo(() => {
    if (!mermaidCode) return 0;
    const lines = mermaidCode.split('\n').filter(l => l.trim().length > 0 && !l.trim().startsWith('mindmap') && !l.trim().startsWith('graph'));
    return Math.max(lines.length, 1);
  }, [mermaidCode]);

  // Zoom handlers
  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.15, 2.5));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.15, 0.4));
  const handleResetZoom = () => setZoom(1.0);
  const handleFitToView = () => setZoom(1.0);

  // Export handlers
  const handleExport = (format: 'png' | 'svg' | 'pdf') => {
    setMoreOptionsOpen(false);
    mermaidChartRef.current?.exportChart(format);
  };

  return (
    <div className="h-full flex flex-col bg-[#1e1e1e] text-[#cccccc] overflow-hidden select-none text-xs">
      {/* ── Mind Map Toolbar ── */}
      <div className="flex items-center justify-between gap-1.5 px-3 py-1.5 bg-[#252526] border-b border-[#2b2b2b] shrink-0 flex-wrap">
        {/* Search nodes */}
        <div className="relative flex-1 max-w-[200px]">
          <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#858585]" />
          <input
            type="text"
            placeholder="Search nodes…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            disabled={!mermaidCode}
            className="w-full bg-[#1e1e1e] border border-[#3c3c3c] focus:border-[#007acc] rounded pl-7 pr-6 py-1 text-xs text-white placeholder-[#858585] focus:outline-none transition-colors font-mono disabled:opacity-40"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[#858585] hover:text-white cursor-pointer"
              title="Clear search"
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* View Mode Toggle: Tree vs Radial */}
        <div className="flex items-center gap-1 bg-[#1e1e1e] p-0.5 rounded border border-[#3c3c3c]">
          <button
            onClick={() => setViewMode('tree')}
            className={`px-2 py-0.5 rounded text-[10.5px] font-medium transition-colors flex items-center gap-1 cursor-pointer ${
              viewMode === 'tree' ? 'bg-[#007acc] text-white' : 'text-[#858585] hover:text-white'
            }`}
            title="Tree Hierarchy View"
          >
            <GitFork size={11} />
            <span>Tree</span>
          </button>
          <button
            onClick={() => setViewMode('radial')}
            className={`px-2 py-0.5 rounded text-[10.5px] font-medium transition-colors flex items-center gap-1 cursor-pointer ${
              viewMode === 'radial' ? 'bg-[#007acc] text-white' : 'text-[#858585] hover:text-white'
            }`}
            title="Radial Flow View"
          >
            <Radio size={11} />
            <span>Radial</span>
          </button>
        </div>

        {/* Node Count Indicator */}
        {mermaidCode && (
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1e1e1e] border border-[#3c3c3c] text-[#858585]">
            {nodeCount} nodes
          </span>
        )}

        {/* Zoom controls */}
        <div className="flex items-center gap-0.5 bg-[#1e1e1e] p-0.5 rounded border border-[#3c3c3c] shrink-0">
          <button
            type="button"
            onClick={handleZoomOut}
            title="Zoom out"
            disabled={!mermaidCode}
            className="p-1 text-[#858585] hover:text-white rounded transition-colors disabled:opacity-40 cursor-pointer"
          >
            <ZoomOut size={12} />
          </button>

          <button
            type="button"
            onClick={handleResetZoom}
            title="Reset zoom to 100%"
            disabled={!mermaidCode}
            className="min-w-[32px] px-1 text-center py-0.5 text-[10px] font-mono text-[#858585] hover:text-white rounded transition-colors disabled:opacity-40"
          >
            {Math.round(zoom * 100)}%
          </button>

          <button
            type="button"
            onClick={handleZoomIn}
            title="Zoom in"
            disabled={!mermaidCode}
            className="p-1 text-[#858585] hover:text-white rounded transition-colors disabled:opacity-40 cursor-pointer"
          >
            <ZoomIn size={12} />
          </button>

          <div className="w-px h-3 bg-[#3c3c3c] mx-0.5" />

          <button
            type="button"
            onClick={handleFitToView}
            title="Fit to view"
            disabled={!mermaidCode}
            className="p-1 text-[#858585] hover:text-white rounded transition-colors disabled:opacity-40 cursor-pointer"
          >
            <Maximize2 size={12} />
          </button>
        </div>

        {/* Options Dropdown */}
        <div className="relative shrink-0" ref={moreOptionsRef}>
          <button
            type="button"
            onClick={() => setMoreOptionsOpen(prev => !prev)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#1e1e1e] hover:bg-[#2a2d2e] border border-[#3c3c3c] text-[#cccccc] font-medium text-[11px] transition-colors cursor-pointer"
          >
            <span>Options</span>
            <ChevronDown size={11} className={`text-[#858585] transition-transform ${moreOptionsOpen ? 'rotate-180' : ''}`} />
          </button>

          {moreOptionsOpen && (
            <div className="absolute right-0 top-full mt-1 w-44 bg-[#252526] border border-[#3c3c3c] rounded shadow-xl py-1 z-50 text-xs">
              <button
                type="button"
                onClick={() => {
                  setMoreOptionsOpen(false);
                  handleGenerateMindMap();
                }}
                disabled={!selectedFileContent || isLoading}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-left hover:bg-[#2a2d2e] text-[#cccccc] hover:text-white transition-colors disabled:opacity-40 cursor-pointer"
              >
                <RefreshCw size={12} className={isLoading ? 'animate-spin text-[#007acc]' : 'text-[#858585]'} />
                <span>Regenerate Map</span>
              </button>

              <div className="border-t border-[#3c3c3c] my-1" />

              <button
                type="button"
                onClick={() => handleExport('svg')}
                disabled={!mermaidCode}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-left hover:bg-[#2a2d2e] text-[#cccccc] hover:text-white transition-colors disabled:opacity-40 cursor-pointer"
              >
                <Download size={12} className="text-[#858585]" />
                <span>Export SVG</span>
              </button>

              <button
                type="button"
                onClick={() => handleExport('png')}
                disabled={!mermaidCode}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-left hover:bg-[#2a2d2e] text-[#cccccc] hover:text-white transition-colors disabled:opacity-40 cursor-pointer"
              >
                <Download size={12} className="text-[#858585]" />
                <span>Export PNG</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Mind Map Canvas ── */}
      <div className="flex-1 relative overflow-hidden bg-[#1e1e1e]">
        {isLoading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-[#858585] gap-3">
            <Loader2 size={28} className="text-[#007acc] animate-spin" />
            <div>
              <p className="text-sm font-semibold text-white">Generating Mind Map</p>
              <p className="text-xs text-[#858585] mt-1">Analyzing code architecture, classes, and hierarchy with AI…</p>
            </div>
          </div>
        ) : error ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
            <div className="p-3 rounded-lg bg-[#5a1d1d]/40 text-[#f48771] mb-3 border border-[#f48771]/30">
              <AlertCircle size={24} />
            </div>
            <h3 className="text-sm font-bold text-[#f48771] mb-1">Mind Map Generation Failed</h3>
            <p className="text-xs text-[#858585] max-w-md mb-4">{error}</p>
            <button
              type="button"
              onClick={handleGenerateMindMap}
              className="flex items-center gap-2 px-3 py-1.5 bg-[#0e639c] hover:bg-[#1177bb] text-white rounded text-xs font-semibold transition-colors cursor-pointer"
            >
              <RefreshCw size={12} />
              <span>Retry Generation</span>
            </button>
          </div>
        ) : mermaidCode ? (
          <div className="w-full h-full overflow-auto ide-scrollbar">
            <MermaidChart
              ref={mermaidChartRef}
              chart={mermaidCode}
              zoom={zoom}
              searchQuery={searchQuery}
              hideExportBar={true}
            />
          </div>
        ) : selectedFileContent ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-[#858585]">
            <div className="p-3 bg-[#252526] rounded-lg border border-[#3c3c3c] mb-3">
              <Brain size={28} className="text-[#007acc]" />
            </div>
            <h3 className="text-sm font-semibold text-white mb-1">Code Architecture Mind Map</h3>
            <p className="text-xs text-[#858585] max-w-sm mb-4">
              Generate an interactive hierarchical mind map of {fileName || 'current file'} to visualize classes, functions, and dependencies.
            </p>
            <button
              type="button"
              onClick={handleGenerateMindMap}
              className="flex items-center gap-2 px-3 py-1.5 bg-[#0e639c] hover:bg-[#1177bb] text-white rounded text-xs font-semibold transition-colors cursor-pointer"
            >
              <Brain size={13} />
              <span>Generate Mind Map</span>
            </button>
          </div>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-[#858585]">
            <FileCode size={32} className="text-[#3c3c3c] mb-2" />
            <p className="text-sm font-semibold text-white">No File Selected</p>
            <p className="text-xs text-[#858585] max-w-xs mt-1">
              Select a file from the repository explorer on the left to generate its architecture mind map.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
