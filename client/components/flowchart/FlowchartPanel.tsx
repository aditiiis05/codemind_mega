// client/components/flowchart/FlowchartPanel.tsx
// Main Flowchart Panel integrating File Flow, Function Flow, Project Flow, real-time debounce,
// automatic layout, and bidirectional Code ↔ Flowchart navigation

'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  AlertCircle,
  Loader2,
  FileCode,
  FolderGit2,
  RefreshCw
} from 'lucide-react';
import {
  FlowNode,
  FlowchartViewMode,
  GraphLevel,
  FlowFilter,
  FlowchartResponse,
  ProjectGraphResponse
} from '@/types/flowchart';
import { analyzeFile, analyzeProject, analyzeSelection } from '@/services/flowchartApi';
import { layoutControlFlowGraph } from './flowLayout';
import FlowToolbar from './FlowToolbar';
import FlowFilters from './FlowFilters';
import FlowLegend from './FlowLegend';
import FlowchartCanvas, { FlowchartCanvasHandle } from './FlowchartCanvas';
import NodeDetailPanel from './NodeDetailPanel';
import ProjectGraph from './ProjectGraph';

interface FlowchartPanelProps {
  code: string | null;
  fileName: string | null;
  language: string | null;
  repoFiles?: Array<{
    path: string;
    name: string;
    content?: string;
    language?: string;
    size?: number;
  }>;
  owner?: string;
  repo?: string;
  cursorLine?: number | null;
  cursorEndLine?: number | null;
  onNavigateToCode?: (file: string, lineStart: number, lineEnd?: number) => void;
}

export default function FlowchartPanel({
  code,
  fileName,
  language,
  repoFiles = [],
  owner = '',
  repo = '',
  cursorLine = null,
  cursorEndLine = null,
  onNavigateToCode
}: FlowchartPanelProps) {
  // View states
  const [viewMode, setViewMode] = useState<FlowchartViewMode>('file');
  const [selectedFunction, setSelectedFunction] = useState<string | null>(null);
  const [graphLevel, setGraphLevel] = useState<GraphLevel>('combined');
  const [filter, setFilter] = useState<FlowFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [zoom, setZoom] = useState(1.0);
  const [showMinimap, setShowMinimap] = useState(true);
  // Detail level: 'overview' | 'standard' | 'detailed'
  const [detailLevel, setDetailLevel] = useState<'overview' | 'standard' | 'detailed'>('standard');

  // Analysis and Data states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileGraphData, setFileGraphData] = useState<FlowchartResponse | null>(null);
  const [projectGraphData, setProjectGraphData] = useState<ProjectGraphResponse | null>(null);

  // Selection mode states
  const [selectionFlowData, setSelectionFlowData] = useState<FlowchartResponse | null>(null);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [isSelectionLoading, setIsSelectionLoading] = useState(false);
  const selectionDebounceRef = useRef<NodeJS.Timeout | null>(null);

  // Selection states
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<FlowNode | null>(null);
  const [showDetailPanel, setShowDetailPanel] = useState(false);
  const [highlightedNodeId, setHighlightedNodeId] = useState<string | null>(null);

  // Debounce timer ref for auto-update
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Request File Flowchart analysis from backend
   */
  const fetchFileFlowchart = useCallback(
    async (codeToAnalyze: string, fName: string, lang: string, funcName: string | null = null) => {
      if (!codeToAnalyze.trim()) {
        setFileGraphData(null);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await analyzeFile({
          code: codeToAnalyze,
          fileName: fName,
          language: lang,
          functionName: funcName
        });

        setFileGraphData(response);
      } catch (err: unknown) {
        console.error('[FlowchartPanel] Analyze error:', err);
        setError(err instanceof Error ? err.message : 'Unable to generate flowchart. Please check the source code.');
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Request Project Flowchart analysis from backend
   */
  const fetchProjectFlowchart = useCallback(async () => {
    if (!repoFiles || repoFiles.length === 0) {
      setError('No repository source files available for project analysis.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await analyzeProject({
        files: repoFiles,
        owner,
        repo
      });

      setProjectGraphData(response);
    } catch (err: unknown) {
      console.error('[FlowchartPanel] Project analyze error:', err);
      setError(err instanceof Error ? err.message : 'Unable to analyze project graph. Please verify repository files.');
    } finally {
      setIsLoading(false);
    }
  }, [repoFiles, owner, repo]);

  /**
   * Auto-update flowchart with debounce (750ms) when code or file changes
   */
  useEffect(() => {
    if (viewMode === 'project') return;

    if (!code || !fileName) {
      setFileGraphData(null);
      return;
    }

    // Clear previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set 750ms debounce
    debounceTimerRef.current = setTimeout(() => {
      fetchFileFlowchart(code, fileName, language || 'plaintext', selectedFunction);
    }, 750);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [code, fileName, language, selectedFunction, viewMode, fetchFileFlowchart]);

  /**
   * Handle switching view mode
   */
  const handleViewModeChange = (mode: FlowchartViewMode) => {
    setViewMode(mode);
    setError(null);
    setFilter('ALL');

    if (mode === 'project' && !projectGraphData) {
      fetchProjectFlowchart();
    } else if (mode === 'file' && selectedFunction) {
      setSelectedFunction(null);
    }
  };

  /**
   * Code to Flowchart interaction:
   * When cursor line in editor moves, find the node encompassing that line and highlight it!
   */
  useEffect(() => {
    if (cursorLine === null || !fileGraphData?.nodes) {
      setHighlightedNodeId(null);
      return;
    }

    const matchedNode = fileGraphData.nodes.find(
      n => n.lineStart && n.lineEnd && cursorLine >= n.lineStart && cursorLine <= n.lineEnd
    );

    if (matchedNode) {
      setHighlightedNodeId(matchedNode.id);
    } else {
      setHighlightedNodeId(null);
    }
  }, [cursorLine, fileGraphData?.nodes]);

  /**
   * Reset selection mode whenever the loaded file changes
   */
  useEffect(() => {
    setIsSelectionMode(false);
    setSelectionFlowData(null);
  }, [code, fileName]);

  /**
   * Debounced selection fetch: when cursor moves on a non-blank line,
   * call analyzeSelection and switch to selection mode.
   */
  useEffect(() => {
    if (cursorLine === null || !code || !language || !fileName) return;
    if (viewMode === 'project') return;

    // Skip blank lines
    const lines = code.split('\n');
    const lineContent = lines[cursorLine - 1];
    if (lineContent === undefined || lineContent.trim() === '') return;

    // Debounce
    if (selectionDebounceRef.current) clearTimeout(selectionDebounceRef.current);
    selectionDebounceRef.current = setTimeout(async () => {
      setIsSelectionLoading(true);
      try {
        const response = await analyzeSelection({
          code,
          language,
          startLine: cursorLine - 1,
          endLine: (cursorEndLine ?? cursorLine) - 1,
          detail: detailLevel,
          filePath: fileName
        });
        if (response.nodes.length > 0) {
          setSelectionFlowData(response);
          setIsSelectionMode(true);
        }
      } catch {
        // Silently fall back to file graph — do not show error
      } finally {
        setIsSelectionLoading(false);
      }
    }, 400);

    return () => {
      if (selectionDebounceRef.current) clearTimeout(selectionDebounceRef.current);
    };
  }, [cursorLine, cursorEndLine, code, fileName, language, detailLevel, viewMode]);

  /**
   * Flowchart to Code interaction:
   * When user clicks a flowchart node, navigate Monaco editor to lineStart!
   */
  const handleNodeClick = (node: FlowNode) => {
    setSelectedNodeId(node.id);
    setSelectedNode(node);
    setShowDetailPanel(true);

    const targetFile = node.file || fileName;
    if (targetFile && node.lineStart && onNavigateToCode) {
      onNavigateToCode(targetFile, node.lineStart, node.lineEnd);
    }
  };

  /**
   * Compute layout for current File / Function flow nodes
   */
  const currentControlFlowLayout = useMemo(() => {
    const activeGraphData = (isSelectionMode && selectionFlowData) ? selectionFlowData : fileGraphData;

    if (!activeGraphData?.nodes) {
      return { nodes: [], edges: [], bounds: { minX: 0, minY: 0, maxX: 600, maxY: 400, width: 600, height: 400 } };
    }

    let nodesToLayout = activeGraphData.nodes;
    let edgesToLayout = activeGraphData.edges;

    // ── Detail level filtering ──────────────────────────────────────────────
    // Overview: only structural nodes (START, END, FUNCTION, DECISION, LOOP)
    // Standard: all except pure PROCESS nodes that are very minor (default)
    // Detailed: everything
    if (detailLevel === 'overview') {
      const keepTypes = new Set(['START', 'END', 'FUNCTION', 'DECISION', 'LOOP', 'ERROR']);
      nodesToLayout = nodesToLayout.filter(n => keepTypes.has(n.type));
    }
    // standard and detailed use all nodes

    // ── Filter bar filtering ────────────────────────────────────────────────
    if (filter !== 'ALL') {
      if (filter === 'DECISIONS') {
        nodesToLayout = nodesToLayout.filter(n => n.type === 'DECISION');
      } else if (filter === 'LOOPS') {
        nodesToLayout = nodesToLayout.filter(n => n.type === 'LOOP');
      } else if (filter === 'FUNCTIONS') {
        nodesToLayout = nodesToLayout.filter(n => n.type === 'FUNCTION');
      }
    }

    // Keep only edges where both source and target are still in the node set
    const visibleIds = new Set(nodesToLayout.map(n => n.id));
    edgesToLayout = edgesToLayout.filter(
      e => visibleIds.has(e.source) && visibleIds.has(e.target)
    );

    return layoutControlFlowGraph(nodesToLayout, edgesToLayout);
  }, [fileGraphData, filter, detailLevel, isSelectionMode, selectionFlowData]);

  /**
   * Counts for filter pills
   */
  const filterCounts = useMemo(() => {
    if (viewMode === 'project') {
      const nodes = projectGraphData?.nodes || [];
      const edges = projectGraphData?.edges || [];
      return {
        all: nodes.length,
        files: nodes.filter(n => n.type === 'FILE').length,
        functions: nodes.filter(n => n.type === 'FUNCTION').length,
        calls: edges.filter(e => e.type === 'CALLS').length,
        dependencies: projectGraphData?.dependencies?.length || 0
      };
    }

    const activeGraphData = (isSelectionMode && selectionFlowData) ? selectionFlowData : fileGraphData;
    const nodes = activeGraphData?.nodes || [];
    return {
      all: nodes.length,
      decisions: nodes.filter(n => n.type === 'DECISION').length,
      loops: nodes.filter(n => n.type === 'LOOP').length,
      functions: nodes.filter(n => n.type === 'FUNCTION').length,
      calls: nodes.filter(n => (n as { isCall?: boolean }).isCall).length
    };
  }, [viewMode, fileGraphData, projectGraphData, isSelectionMode, selectionFlowData]);

  // Canvas ref for fit-to-screen
  const canvasRef = useRef<FlowchartCanvasHandle>(null);

  // Zoom handlers
  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.15, 2.5));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.15, 0.3));
  const handleResetZoom = () => setZoom(1.0);
  const handleFitToScreen = () => canvasRef.current?.fitToScreen();

  return (
    <div className="h-full flex flex-col bg-[#0d1117] text-[#e6edf3] overflow-hidden select-none">

      {/* Flow Toolbar — file name badge shown here */}
      <FlowToolbar
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        functions={fileGraphData?.functions || []}
        selectedFunction={selectedFunction}
        onSelectFunction={(fn) => {
          setSelectedFunction(fn);
          if (code && fileName) {
            fetchFileFlowchart(code, fileName, language || 'plaintext', fn);
          }
        }}
        graphLevel={graphLevel}
        onGraphLevelChange={setGraphLevel}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        zoom={zoom}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onFitToScreen={handleFitToScreen}
        onResetZoom={handleResetZoom}
        showMinimap={showMinimap}
        onToggleMinimap={() => setShowMinimap(prev => !prev)}
        onRefresh={() => {
          if (viewMode === 'project') {
            fetchProjectFlowchart();
          } else if (code && fileName) {
            fetchFileFlowchart(code, fileName, language || 'plaintext', selectedFunction);
          }
        }}
        isAnalyzing={isLoading}
        fileName={fileName}
        detailLevel={detailLevel}
        onDetailLevelChange={setDetailLevel}
      />

      {/* Filter Bar */}
      <FlowFilters
        activeFilter={filter}
        onFilterChange={setFilter}
        counts={filterCounts}
        isProjectMode={viewMode === 'project'}
      />

      {/* Main Canvas Area */}
      <div className="flex-1 relative overflow-hidden">
        {isLoading && !fileGraphData && !projectGraphData ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0d1117] text-[#7d8590] gap-3">
            <Loader2 size={32} className="text-[#58a6ff] animate-spin" />
            <div className="text-center">
              <p className="text-sm font-semibold text-[#e6edf3]">Analyzing code structure...</p>
              <p className="text-xs text-[#7d8590] mt-1">Generating control flow graph and decision nodes</p>
            </div>
          </div>
        ) : error ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-[#0d1117] text-center">
            <div className="p-3 rounded-full bg-red-500/10 text-red-400 mb-3 border border-red-500/30">
              <AlertCircle size={28} />
            </div>
            <h3 className="text-sm font-bold text-red-400 mb-1">Flowchart Generation Notice</h3>
            <p className="text-xs text-[#7d8590] max-w-md mb-4">{error}</p>
            <button
              onClick={() => {
                if (viewMode === 'project') {
                  fetchProjectFlowchart();
                } else if (code && fileName) {
                  fetchFileFlowchart(code, fileName, language || 'plaintext', selectedFunction);
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#21262d] hover:bg-[#30363d] text-[#e6edf3] rounded text-xs font-semibold transition-all border border-[#30363d]"
            >
              <RefreshCw size={13} />
              <span>Retry Analysis</span>
            </button>
          </div>
        ) : viewMode === 'project' ? (
          projectGraphData && projectGraphData.nodes.length > 0 ? (
            <ProjectGraph
              nodes={projectGraphData.nodes}
              edges={projectGraphData.edges}
              graphLevel={graphLevel}
              filter={filter}
              searchQuery={searchQuery}
              zoom={zoom}
              onZoomChange={setZoom}
              selectedNodeId={selectedNodeId}
              onNodeClick={handleNodeClick}
              showMinimap={showMinimap}
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-[#7d8590] p-6 text-center">
              <FolderGit2 size={36} className="text-[#30363d] mb-3" />
              <p className="text-sm font-semibold text-[#e6edf3]">Project Architecture Graph</p>
              <p className="text-xs text-[#7d8590] max-w-sm mt-1">
                Click &quot;Run Project Flow&quot; to inspect inter-file dependencies and cross-module calls.
              </p>
              <button
                onClick={fetchProjectFlowchart}
                className="mt-4 px-3.5 py-1.5 bg-[#238636] hover:bg-[#2ea043] text-white rounded text-xs font-semibold transition-all"
              >
                Analyze Project
              </button>
            </div>
          )
        ) : currentControlFlowLayout.nodes.length > 0 ? (
          <div className="relative w-full h-full">
            {/* Selection mode badge */}
            {isSelectionMode && (
              <div className="absolute top-2 left-2 z-20 flex items-center gap-1.5 bg-[#1f6feb]/20 border border-[#1f6feb]/40 text-[#58a6ff] text-[10px] font-semibold px-2 py-0.5 rounded-full">
                <span>Selection Mode</span>
                <button
                  onClick={() => { setIsSelectionMode(false); setSelectionFlowData(null); }}
                  className="hover:text-white transition-colors"
                  aria-label="Exit selection mode"
                >
                  ×
                </button>
              </div>
            )}
            {/* Selection loading indicator (small spinner, non-blocking) */}
            {isSelectionLoading && (
              <div className="absolute top-2 right-2 z-20">
                <Loader2 size={14} className="text-[#58a6ff] animate-spin" />
              </div>
            )}
            <FlowchartCanvas
              ref={canvasRef}
              nodes={currentControlFlowLayout.nodes}
              edges={currentControlFlowLayout.edges}
              bounds={currentControlFlowLayout.bounds}
              zoom={zoom}
              onZoomChange={setZoom}
              selectedNodeId={selectedNodeId}
              highlightedNodeId={highlightedNodeId}
              searchQuery={searchQuery}
              showMinimap={showMinimap}
              onNodeClick={handleNodeClick}
            />
            {/* Node detail panel — slides in from the right */}
            {showDetailPanel && selectedNode && (
              <NodeDetailPanel
                node={selectedNode}
                allEdges={currentControlFlowLayout.edges}
                allNodes={currentControlFlowLayout.nodes}
                onClose={() => setShowDetailPanel(false)}
                onNavigateToCode={onNavigateToCode}
              />
            )}
          </div>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-[#7d8590] p-6 text-center">
            <FileCode size={36} className="text-[#30363d] mb-3" />
            <p className="text-sm font-semibold text-[#e6edf3]">No Flowchart Available</p>
            <p className="text-xs text-[#7d8590] max-w-xs mt-1">
              Select a file from the repository file tree on the left to view its execution flow.
            </p>
          </div>
        )}
      </div>

      {/* Collapsible Symbol Legend */}
      <FlowLegend />
    </div>
  );
}
