// client/components/flowchart/FlowchartPanel.tsx
<<<<<<< HEAD
// Main Flowchart Panel integrating File Flow, Function Flow, Project Architecture,
// real-time AST debounce, non-overlapping bottom IDE terminal dock, and bidirectional Code ↔ Flowchart navigation
=======
// Main Flowchart Panel integrating File Flow, Function Flow, Project Flow, real-time debounce,
// automatic layout, and bidirectional Code ↔ Flowchart navigation
>>>>>>> 1fedef5cdf2fa8631c20411f700509b8bbdcb0e2

'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  AlertCircle,
  Loader2,
<<<<<<< HEAD
  FolderGit2,
  RefreshCw,
  Minimize2,
  Network
=======
  FileCode,
  FolderGit2,
  RefreshCw
>>>>>>> 1fedef5cdf2fa8631c20411f700509b8bbdcb0e2
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
  onNodeSelect?: (node: FlowNode | null) => void;
<<<<<<< HEAD
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

const DEFAULT_FLOW_DATA: FlowchartResponse = {
  success: true,
  sessionId: 'default_sess',
  fileName: 'CodeEditor.tsx',
  language: 'typescript',
  functions: ['CodeEditor', 'analyzeCodeTokens', 'handleExecute'],
  activeFunction: null,
  nodes: [
    { id: 'start', type: 'START', label: 'START', file: 'CodeEditor.tsx', lineStart: 1, lineEnd: 1, data: {} },
    { id: 'fn_editor', type: 'FUNCTION', label: 'export default function CodeEditor()', file: 'CodeEditor.tsx', lineStart: 4, lineEnd: 35, data: {} },
    { id: 'proc_state', type: 'PROCESS', label: 'const [cursorLine, setCursorLine] = useState(1)', file: 'CodeEditor.tsx', lineStart: 5, lineEnd: 7, data: {} },
    { id: 'dec_syntax', type: 'DECISION', label: 'tokens.length > 0 ?', file: 'CodeEditor.tsx', lineStart: 10, lineEnd: 14, data: {} },
    { id: 'proc_ast', type: 'PROCESS', label: 'analyzeCodeTokens(code)', file: 'CodeEditor.tsx', lineStart: 11, lineEnd: 13, data: {} },
    { id: 'proc_fallback', type: 'PROCESS', label: 'emitDefaultTokens()', file: 'CodeEditor.tsx', lineStart: 13, lineEnd: 14, data: {} },
    { id: 'proc_render', type: 'PROCESS', label: 'renderMonacoEditor()', file: 'CodeEditor.tsx', lineStart: 17, lineEnd: 25, data: {} },
    { id: 'ret_view', type: 'RETURN', label: 'return <IDELayout />', file: 'CodeEditor.tsx', lineStart: 27, lineEnd: 33, data: {} },
    { id: 'end', type: 'END', label: 'END', file: 'CodeEditor.tsx', lineStart: 35, lineEnd: 35, data: {} }
  ],
  edges: [
    { id: 'e1', source: 'start', target: 'fn_editor', type: 'FLOW' },
    { id: 'e2', source: 'fn_editor', target: 'proc_state', type: 'FLOW' },
    { id: 'e3', source: 'proc_state', target: 'dec_syntax', type: 'FLOW' },
    { id: 'e4', source: 'dec_syntax', target: 'proc_ast', label: 'YES', type: 'YES' },
    { id: 'e5', source: 'dec_syntax', target: 'proc_fallback', label: 'NO', type: 'NO' },
    { id: 'e6', source: 'proc_ast', target: 'proc_render', type: 'FLOW' },
    { id: 'e7', source: 'proc_fallback', target: 'proc_render', type: 'FLOW' },
    { id: 'e8', source: 'proc_render', target: 'ret_view', type: 'FLOW' },
    { id: 'e9', source: 'ret_view', target: 'end', type: 'FLOW' }
  ]
};

=======
}

>>>>>>> 1fedef5cdf2fa8631c20411f700509b8bbdcb0e2
export default function FlowchartPanel({
  code,
  fileName,
  language,
  repoFiles = [],
  owner = '',
  repo = '',
  cursorLine = null,
  cursorEndLine = null,
  onNavigateToCode,
<<<<<<< HEAD
  onNodeSelect,
  isFullscreen: externalIsFullscreen,
  onToggleFullscreen: externalOnToggleFullscreen
=======
  onNodeSelect
>>>>>>> 1fedef5cdf2fa8631c20411f700509b8bbdcb0e2
}: FlowchartPanelProps) {
  // View states
  const [viewMode, setViewMode] = useState<FlowchartViewMode>('file');
  const [selectedFunction, setSelectedFunction] = useState<string | null>(null);
  const [graphLevel, setGraphLevel] = useState<GraphLevel>('combined');
  const [filter, setFilter] = useState<FlowFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [zoom, setZoom] = useState(1.0);
  const [showMinimap, setShowMinimap] = useState(true);
<<<<<<< HEAD
  const [showLegend, setShowLegend] = useState(false);
  const [detailLevel, setDetailLevel] = useState<'overview' | 'standard' | 'detailed'>('standard');

  // Fullscreen support: synchronizes with parent or maintains internal state
  const [internalFullscreen, setInternalFullscreen] = useState(false);
  const isFullscreen = externalIsFullscreen !== undefined ? externalIsFullscreen : internalFullscreen;
  const toggleFullscreen = externalOnToggleFullscreen || (() => setInternalFullscreen(prev => !prev));

  // Keyboard shortcut: Esc to exit full screen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        toggleFullscreen();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, toggleFullscreen]);

  // Analysis and Data states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileGraphData, setFileGraphData] = useState<FlowchartResponse | null>(DEFAULT_FLOW_DATA);
=======
  // Detail level: 'overview' | 'standard' | 'detailed'
  const [detailLevel, setDetailLevel] = useState<'overview' | 'standard' | 'detailed'>('standard');

  // Analysis and Data states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileGraphData, setFileGraphData] = useState<FlowchartResponse | null>(null);
>>>>>>> 1fedef5cdf2fa8631c20411f700509b8bbdcb0e2
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

  // Last-analyzed content hash — skip network call when nothing changed
  const lastAnalyzedRef = useRef<{ code: string; fileName: string; fn: string | null } | null>(null);

  /**
   * Request File Flowchart analysis from backend
   */
  const fetchFileFlowchart = useCallback(
    async (codeToAnalyze: string, fName: string, lang: string, funcName: string | null = null) => {
      if (!codeToAnalyze.trim()) {
        setFileGraphData(null);
        return;
      }

      // Skip if nothing changed since the last successful analysis
      const key = { code: codeToAnalyze, fileName: fName, fn: funcName };
      if (
        lastAnalyzedRef.current &&
        lastAnalyzedRef.current.code === key.code &&
        lastAnalyzedRef.current.fileName === key.fileName &&
        lastAnalyzedRef.current.fn === key.fn
      ) {
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

        lastAnalyzedRef.current = key;
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

<<<<<<< HEAD
  // Track first run for immediate analysis
  const isFirstRunRef = useRef(true);

  /**
   * Auto-update flowchart with debounce when code or file changes
=======
  /**
   * Auto-update flowchart with debounce (750ms) when code or file changes
>>>>>>> 1fedef5cdf2fa8631c20411f700509b8bbdcb0e2
   */
  useEffect(() => {
    if (viewMode === 'project') return;

    if (!code || !fileName) {
<<<<<<< HEAD
      return;
    }

=======
      setFileGraphData(null);
      return;
    }

    // Clear previous timer
>>>>>>> 1fedef5cdf2fa8631c20411f700509b8bbdcb0e2
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

<<<<<<< HEAD
    const delay = isFirstRunRef.current ? 50 : 800;
    isFirstRunRef.current = false;

    debounceTimerRef.current = setTimeout(() => {
      fetchFileFlowchart(code, fileName, language || 'plaintext', selectedFunction);
    }, delay);
=======
    // Set 1200ms debounce — avoids re-parsing on every keystroke
    debounceTimerRef.current = setTimeout(() => {
      fetchFileFlowchart(code, fileName, language || 'plaintext', selectedFunction);
    }, 1200);
>>>>>>> 1fedef5cdf2fa8631c20411f700509b8bbdcb0e2

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
<<<<<<< HEAD
   * When cursor line in Monaco moves, find node encompassing that line and highlight it
=======
   * When cursor line in editor moves, find the node encompassing that line and highlight it!
>>>>>>> 1fedef5cdf2fa8631c20411f700509b8bbdcb0e2
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
    lastSelectionLineRef.current = null;
    lastAnalyzedRef.current = null;
  }, [code, fileName]);

<<<<<<< HEAD
  const lastSelectionLineRef = useRef<number | null>(null);

  /**
   * Debounced selection fetch: when cursor moves on a non-blank line, trace selection
=======
  // Track the last cursor line we sent a selection request for
  const lastSelectionLineRef = useRef<number | null>(null);

  /**
   * Debounced selection fetch: when cursor moves on a non-blank line,
   * call analyzeSelection and switch to selection mode.
>>>>>>> 1fedef5cdf2fa8631c20411f700509b8bbdcb0e2
   */
  useEffect(() => {
    if (cursorLine === null || !code || !language || !fileName) return;
    if (viewMode === 'project') return;

<<<<<<< HEAD
    if (lastSelectionLineRef.current === cursorLine) return;

=======
    // Skip if cursor is on the same line as last request
    if (lastSelectionLineRef.current === cursorLine) return;

    // Skip blank lines
>>>>>>> 1fedef5cdf2fa8631c20411f700509b8bbdcb0e2
    const lines = code.split('\n');
    const lineContent = lines[cursorLine - 1];
    if (lineContent === undefined || lineContent.trim() === '') return;

<<<<<<< HEAD
=======
    // Debounce — 800ms so rapid cursor movement doesn't spam the backend
>>>>>>> 1fedef5cdf2fa8631c20411f700509b8bbdcb0e2
    if (selectionDebounceRef.current) clearTimeout(selectionDebounceRef.current);
    selectionDebounceRef.current = setTimeout(async () => {
      lastSelectionLineRef.current = cursorLine;
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
<<<<<<< HEAD
        // Silently fall back to file graph
=======
        // Silently fall back to file graph — do not show error
>>>>>>> 1fedef5cdf2fa8631c20411f700509b8bbdcb0e2
      } finally {
        setIsSelectionLoading(false);
      }
    }, 800);

    return () => {
      if (selectionDebounceRef.current) clearTimeout(selectionDebounceRef.current);
    };
  }, [cursorLine, cursorEndLine, code, fileName, language, detailLevel, viewMode]);

  /**
   * Flowchart to Code interaction:
<<<<<<< HEAD
   * When user clicks a flowchart node, open bottom terminal dock and navigate Monaco editor!
=======
   * When user clicks a flowchart node, navigate Monaco editor to lineStart!
>>>>>>> 1fedef5cdf2fa8631c20411f700509b8bbdcb0e2
   */
  const handleNodeClick = (node: FlowNode) => {
    setSelectedNodeId(node.id);
    setSelectedNode(node);
    setShowDetailPanel(true);
    if (onNodeSelect) {
      onNodeSelect(node);
    }

    const targetFile = node.file || fileName;
    if (targetFile && node.lineStart && onNavigateToCode) {
      onNavigateToCode(targetFile, node.lineStart, node.lineEnd);
    }
  };

  /**
<<<<<<< HEAD
   * Compute layout for File / Function flow nodes
   */
  const currentControlFlowLayout = useMemo(() => {
    const rawData = (isSelectionMode && selectionFlowData) ? selectionFlowData : fileGraphData;
    const activeGraphData = (rawData?.nodes && rawData.nodes.length > 0) ? rawData : DEFAULT_FLOW_DATA;
=======
   * Compute layout for current File / Function flow nodes
   */
  const currentControlFlowLayout = useMemo(() => {
    const activeGraphData = (isSelectionMode && selectionFlowData) ? selectionFlowData : fileGraphData;

    if (!activeGraphData?.nodes) {
      return { nodes: [], edges: [], bounds: { minX: 0, minY: 0, maxX: 600, maxY: 400, width: 600, height: 400 } };
    }
>>>>>>> 1fedef5cdf2fa8631c20411f700509b8bbdcb0e2

    let nodesToLayout = activeGraphData.nodes;
    let edgesToLayout = activeGraphData.edges;

<<<<<<< HEAD
    // Detail level filtering
=======
    // ── Detail level filtering ──────────────────────────────────────────────
    // Overview: only structural nodes (START, END, FUNCTION, DECISION, LOOP)
    // Standard: all except pure PROCESS nodes that are very minor (default)
    // Detailed: everything
>>>>>>> 1fedef5cdf2fa8631c20411f700509b8bbdcb0e2
    if (detailLevel === 'overview') {
      const keepTypes = new Set(['START', 'END', 'FUNCTION', 'DECISION', 'LOOP', 'ERROR']);
      nodesToLayout = nodesToLayout.filter(n => keepTypes.has(n.type));
    }
<<<<<<< HEAD

    // Filter pill filtering
=======
    // standard and detailed use all nodes

    // ── Filter bar filtering ────────────────────────────────────────────────
>>>>>>> 1fedef5cdf2fa8631c20411f700509b8bbdcb0e2
    if (filter !== 'ALL') {
      if (filter === 'DECISIONS') {
        nodesToLayout = nodesToLayout.filter(n => n.type === 'DECISION');
      } else if (filter === 'LOOPS') {
        nodesToLayout = nodesToLayout.filter(n => n.type === 'LOOP');
      } else if (filter === 'FUNCTIONS') {
        nodesToLayout = nodesToLayout.filter(n => n.type === 'FUNCTION');
      }
    }

<<<<<<< HEAD
    // Keep only edges where both source and target are in the visible node set
=======
    // Keep only edges where both source and target are still in the node set
>>>>>>> 1fedef5cdf2fa8631c20411f700509b8bbdcb0e2
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

<<<<<<< HEAD
  // Canvas ref for fit-to-screen & centerNode
=======
  // Canvas ref for fit-to-screen
>>>>>>> 1fedef5cdf2fa8631c20411f700509b8bbdcb0e2
  const canvasRef = useRef<FlowchartCanvasHandle>(null);

  // Zoom handlers
  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.15, 2.5));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.15, 0.3));
  const handleResetZoom = () => setZoom(1.0);
  const handleFitToScreen = () => canvasRef.current?.fitToScreen();

  return (
<<<<<<< HEAD
    <div className={`flex flex-col bg-[#1e1e1e] text-[#cccccc] overflow-hidden select-none relative ${
      isFullscreen ? 'fixed inset-0 z-50 shadow-2xl' : 'h-full'
    }`}>
      {/* Standalone Fullscreen Header (only if not handled by parent container) */}
      {isFullscreen && !externalIsFullscreen && (
        <div className="h-9 px-3.5 bg-[#252526] border-b border-[#2b2b2b] flex items-center justify-between shrink-0 select-none">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-5 h-5 rounded bg-[#1e1e1e] border border-[#3c3c3c] flex items-center justify-center shrink-0">
              <Network size={12} className="text-[#007acc]" />
            </div>
            <span className="text-xs font-semibold text-white tracking-wide">Flowchart Node Graph</span>
            {fileName && (
              <span className="text-[10px] font-mono text-[#858585] bg-[#1e1e1e] border border-[#3c3c3c] px-2 py-0.5 rounded truncate max-w-[200px]">
                {fileName}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2.5">
            <span className="text-[11px] text-[#858585] hidden sm:inline">
              Press <kbd className="px-1 py-0.5 bg-[#1e1e1e] border border-[#3c3c3c] rounded text-[10px] font-mono text-[#cccccc]">Esc</kbd> to exit
            </span>
            <button
              onClick={toggleFullscreen}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#0e639c] hover:bg-[#1177bb] text-white text-xs font-medium transition-colors cursor-pointer"
              title="Exit Full Screen (Esc)"
            >
              <Minimize2 size={12} />
              <span>Exit Full Screen</span>
            </button>
          </div>
        </div>
      )}

      {/* Flow Toolbar — Structured controls with View, Detail, Filters, Zoom, Search */}
=======
    <div className="h-full flex flex-col bg-[#0d1117] text-[#e6edf3] overflow-hidden select-none">

      {/* Flow Toolbar — compact 2-row controls with View, Detail, and Filters dropdowns */}
>>>>>>> 1fedef5cdf2fa8631c20411f700509b8bbdcb0e2
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
        activeFilter={filter}
        onFilterChange={setFilter}
        counts={filterCounts}
<<<<<<< HEAD
        onResetLayout={() => canvasRef.current?.resetLayout()}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
        onToggleLegend={() => setShowLegend(prev => !prev)}
        isLegendOpen={showLegend}
      />

      {/* ── Main Layout: Top Canvas fills available space, Bottom Terminal Docks below (Zero Overlap) ── */}
      <div className="flex-1 min-h-0 flex flex-col w-full h-full overflow-hidden relative bg-[#1e1e1e]">
        {/* Upper Canvas Area: completely free of floating overlays */}
        <div className="flex-1 min-h-0 relative w-full overflow-hidden">
          {error ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-[#1e1e1e] text-center z-30">
              <div className="p-3 rounded-lg bg-[#252526] text-[#f14c4c] mb-3 border border-[#3c3c3c]">
                <AlertCircle size={24} />
              </div>
              <h3 className="text-xs font-semibold text-white mb-1">Flowchart Notice</h3>
              <p className="text-xs text-[#858585] max-w-md mb-4">{error}</p>
              <button
                onClick={() => {
                  if (viewMode === 'project') {
                    fetchProjectFlowchart();
                  } else if (code && fileName) {
                    fetchFileFlowchart(code, fileName, language || 'plaintext', selectedFunction);
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0e639c] hover:bg-[#1177bb] text-white rounded text-xs font-medium transition-colors cursor-pointer"
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
              <div className="absolute inset-0 flex flex-col items-center justify-center text-[#858585] p-6 text-center">
                <div className="w-12 h-12 rounded bg-[#252526] border border-[#3c3c3c] flex items-center justify-center mb-3">
                  <FolderGit2 size={24} className="text-[#007acc]" />
                </div>
                <p className="text-sm font-semibold text-white">Project Architecture Graph</p>
                <p className="text-xs text-[#858585] max-w-sm mt-1">
                  Inspect cross-module calls, inter-file dependencies, and global architecture.
                </p>
                <button
                  onClick={fetchProjectFlowchart}
                  className="mt-3 px-3 py-1.5 bg-[#0e639c] hover:bg-[#1177bb] text-white rounded text-xs font-medium transition-colors cursor-pointer"
                >
                  Analyze Project
                </button>
              </div>
            )
          ) : (
            <div className="w-full h-full relative overflow-hidden">
              {/* Selection mode indicator badge */}
              {isSelectionMode && (
                <div className="absolute top-2 left-2 z-20 flex items-center gap-1.5 bg-[#094771] border border-[#007acc] text-white text-xs font-medium px-2 py-0.5 rounded shadow">
                  <span>Selection Scope</span>
                  <button
                    onClick={() => { setIsSelectionMode(false); setSelectionFlowData(null); }}
                    className="hover:text-white transition-colors ml-1 cursor-pointer font-bold"
                    aria-label="Exit selection mode"
                  >
                    ×
                  </button>
                </div>
              )}

              {/* Selection loading indicator */}
              {isSelectionLoading && (
                <div className="absolute top-2 right-2 z-20 flex items-center gap-1.5 bg-[#252526] border border-[#3c3c3c] px-2 py-0.5 rounded text-xs text-[#007acc] shadow">
                  <Loader2 size={12} className="animate-spin text-[#007acc]" />
                  <span>Tracing selection…</span>
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
            </div>
          )}
        </div>

        {/* Bottom Area: IDE Terminal-style Docked Panel for Selected Node */}
        {showDetailPanel && selectedNode && (
          <NodeDetailPanel
            node={selectedNode}
            allEdges={viewMode === 'project' ? (projectGraphData?.edges || []) : currentControlFlowLayout.edges}
            allNodes={viewMode === 'project' ? (projectGraphData?.nodes || []) : currentControlFlowLayout.nodes}
            code={code}
            fileName={fileName}
            language={language}
            sessionId={fileGraphData?.sessionId}
            onClose={() => {
              setShowDetailPanel(false);
              if (onNodeSelect) onNodeSelect(null);
            }}
            onNavigateToCode={onNavigateToCode}
            onSelectNode={handleNodeClick}
          />
        )}
      </div>

      {/* Floating On-Demand Symbol Legend Popover */}
      <FlowLegend isOpen={showLegend} onClose={() => setShowLegend(false)} />
=======
      />

      {/* Main Canvas Area */}
      <div className="flex-1 min-h-0 relative overflow-hidden">
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
                code={code}
                fileName={fileName}
                language={language}
                sessionId={fileGraphData?.sessionId}
                onClose={() => {
                  setShowDetailPanel(false);
                  if (onNodeSelect) onNodeSelect(null);
                }}
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
>>>>>>> 1fedef5cdf2fa8631c20411f700509b8bbdcb0e2
    </div>
  );
}
