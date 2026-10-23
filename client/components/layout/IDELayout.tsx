'use client';

import { useState, useRef, useCallback, ReactNode } from 'react';
import StatusBar from './StatusBar';
import Panel from './Panel';
import EditorTabs, { EditorTab } from './EditorTabs';
import AIChatView from '../views/AIChatView';
import VoiceExplanation from '../voice/VoiceExplanation';
import ExplorerView, { FileNode } from '../views/ExplorerView';
import { FlowNode } from '@/types/flowchart';
import { EditorSelection } from '@/types/voice';
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Bot
} from 'lucide-react';

interface IDELayoutProps {
  // ── CENTER: editor ──────────────────────────────────────────
  children?: ReactNode;
  tabs?: EditorTab[];
  activeTabId?: string;
  onTabClick?: (tabId: string) => void;
  onTabClose?: (tabId: string) => void;

  // ── ANALYSIS panel ─────────────────────────────────────────
  analysisPanel?: {
    content: string;
    isAnalyzing?: boolean;
    onClose: () => void;
  };

  // ── LEFT: file explorer (tree) ──────────────────────────────
  files?: FileNode[];
  expandedDirs?: Record<string, boolean>;
  onFileClick?: (file: FileNode) => void;
  onDirToggle?: (path: string) => void;
  selectedFile?: FileNode | null;

  // ── LEFT: visualization (flowchart / mindmap) ───────────────
  visualizationContent?: ReactNode;

  // ── RIGHT: AI assistant ─────────────────────────────────────
  selectedFlowNode?: FlowNode | null;
  editorSelection?: EditorSelection | null;
  code?: string | null;
  fileName?: string | null;
  language?: string | null;
  sessionId?: string | null;
  onClearSelectedNode?: () => void;
  onNavigateToCode?: (file: string, lineStart: number, lineEnd?: number) => void;

  // ── STATUS BAR ──────────────────────────────────────────────
  statusBarProps?: {
    line?: number;
    column?: number;
    language?: string;
    branch?: string;
    aiStatus?: 'idle' | 'processing' | 'ready';
  };

  // ── LEGACY prop kept for backward-compat (not used internally) ──
  onGenerateVisualization?: (node: FileNode, type: 'flowchart' | 'mindmap') => void;
}

export default function IDELayout({
  children,
  files = [],
  expandedDirs = {},
  onFileClick = () => {},
  onDirToggle = () => {},
  selectedFile = null,
  tabs = [],
  activeTabId = '',
  onTabClick = () => {},
  onTabClose = () => {},
  analysisPanel,
  statusBarProps = {},
  visualizationContent,
  selectedFlowNode = null,
  editorSelection = null,
  code = '',
  fileName = 'main.py',
  language = 'python',
  sessionId = null,
  onClearSelectedNode = () => {},
  onNavigateToCode,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onGenerateVisualization,
}: IDELayoutProps) {
  // ── Panel width state ──────────────────────────────────────────────────────
  const [leftWidth, setLeftWidth] = useState(380);
  const [rightWidth, setRightWidth] = useState(340);
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);
  const [explorerOpen, setExplorerOpen] = useState(true);

  // ── AI sub-tab ─────────────────────────────────────────────────────────────
  const [aiPanelTab, setAiPanelTab] = useState<'voice' | 'tutor'>('voice');

  // ── Resize drag logic ──────────────────────────────────────────────────────
  const isDraggingRef = useRef(false);

  const startResize = useCallback((side: 'left' | 'right') => {
    if (isDraggingRef.current) return;
    isDraggingRef.current = true;

    const onMove = (e: MouseEvent) => {
      if (side === 'left') {
        setLeftWidth(w => Math.min(520, Math.max(280, w + e.movementX)));
      } else {
        setRightWidth(w => Math.min(480, Math.max(280, w - e.movementX)));
      }
    };

    const onUp = () => {
      isDraggingRef.current = false;
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }, []);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const effectiveLeftWidth = leftCollapsed ? 32 : leftWidth;
  const effectiveRightWidth = rightCollapsed ? 32 : rightWidth;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="h-screen flex flex-col bg-[#0d1117] text-[#e6edf3] overflow-hidden">
      {/* ── BODY ROW ─────────────────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden min-h-0">

        {/* ══════════════════ LEFT PANEL ══════════════════ */}
        <div
          className="flex flex-col bg-[#161b22] border-r border-[#30363d] shrink-0 overflow-hidden"
          style={{ width: effectiveLeftWidth }}
        >
          {leftCollapsed ? (
            /* ── Collapsed strip ── */
            <div className="flex flex-col items-center py-2 gap-3">
              <button
                onClick={() => setLeftCollapsed(false)}
                aria-label="Expand left panel"
                className="p-1.5 rounded hover:bg-[#21262d] text-[#8b949e] hover:text-[#e6edf3] transition-colors"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          ) : (
            /* ── Full left panel ── */
            <>
              {/* Left panel header */}
              <div className="h-9 flex items-center justify-between px-3 bg-[#1c2128] border-b border-[#30363d] shrink-0">
                <span className="text-[11px] uppercase tracking-widest font-semibold text-[#8b949e] select-none">
                  Code Visualization
                </span>
                <button
                  onClick={() => setLeftCollapsed(true)}
                  aria-label="Collapse left panel"
                  className="p-1 rounded hover:bg-[#21262d] text-[#8b949e] hover:text-[#e6edf3] transition-colors"
                >
                  <ChevronLeft size={14} />
                </button>
              </div>

              {/* Explorer section (collapsible) */}
              <div className="shrink-0 border-b border-[#30363d]">
                <button
                  onClick={() => setExplorerOpen(o => !o)}
                  className="w-full h-7 flex items-center gap-1.5 px-3 bg-[#1c2128] hover:bg-[#21262d] transition-colors"
                  aria-expanded={explorerOpen}
                >
                  {explorerOpen
                    ? <ChevronDown size={12} className="text-[#8b949e]" />
                    : <ChevronRight size={12} className="text-[#8b949e]" />}
                  <span className="text-[11px] uppercase tracking-widest font-semibold text-[#8b949e] select-none">
                    Explorer
                  </span>
                </button>
                {explorerOpen && (
                  <div className="overflow-y-auto" style={{ maxHeight: '28vh' }}>
                    <ExplorerView
                      files={files}
                      expandedDirs={expandedDirs}
                      onFileClick={onFileClick}
                      onDirToggle={onDirToggle}
                      selectedFile={selectedFile}
                    />
                  </div>
                )}
              </div>

              {/* Visualization area: takes remaining height */}
              <div className="flex-1 overflow-hidden min-h-0">
                {visualizationContent ?? (
                  <div className="flex items-center justify-center h-full text-center flex-col opacity-50 p-4">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[#8b949e] mb-3">
                      <rect x="3" y="3" width="7" height="7" rx="1" />
                      <rect x="14" y="3" width="7" height="7" rx="1" />
                      <rect x="3" y="14" width="7" height="7" rx="1" />
                      <path d="M17.5 14.5v3m0 3v.01M17.5 17.5h3m-3 0h-3" />
                    </svg>
                    <p className="text-[#8b949e] text-xs">Select a file to generate a flowchart or mind map</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* ══════════════════ LEFT RESIZE HANDLE ══════════════════ */}
        {!leftCollapsed && (
          <div
            className="w-1 bg-[#30363d] hover:bg-[#2f81f7] cursor-col-resize transition-colors shrink-0 select-none"
            onMouseDown={() => startResize('left')}
            role="separator"
            aria-label="Resize left panel"
          />
        )}

        {/* ══════════════════ CENTER PANEL ══════════════════ */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-[400px]">
          {/* Editor Tabs */}
          {tabs.length > 0 && (
            <EditorTabs
              tabs={tabs}
              activeTabId={activeTabId}
              onTabClick={onTabClick}
              onTabClose={onTabClose}
            />
          )}

          {/* Editor area */}
          <div className="flex-1 overflow-hidden min-h-0">
            {children}
          </div>

          {/* Analysis panel */}
          {!!analysisPanel && (
            <div
              className="border-t border-[#30363d] bg-[#0d1117] flex flex-col"
              style={{ minHeight: 130, maxHeight: '45vh' }}
            >
              <div className="flex items-center justify-between px-4 py-2 border-b border-[#30363d] bg-[#1c2128] shrink-0">
                <span className="text-[11px] uppercase tracking-widest font-semibold text-[#8b949e]">
                  AI Analysis
                </span>
                <button
                  onClick={analysisPanel.onClose}
                  className="p-1 rounded hover:bg-[#21262d] text-[#8b949e] hover:text-[#e6edf3] transition-colors"
                  aria-label="Close analysis panel"
                >
                  ✕
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                {analysisPanel.isAnalyzing ? (
                  <span className="text-[#8b949e] text-xs">Analyzing…</span>
                ) : (
                  <pre className="text-xs whitespace-pre-wrap text-[#c9d1d9] leading-relaxed">
                    {analysisPanel.content || 'No analysis returned by model.'}
                  </pre>
                )}
              </div>
            </div>
          )}

          {/* Bottom terminal panel */}
          <Panel />
        </div>

        {/* ══════════════════ RIGHT RESIZE HANDLE ══════════════════ */}
        {!rightCollapsed && (
          <div
            className="w-1 bg-[#30363d] hover:bg-[#2f81f7] cursor-col-resize transition-colors shrink-0 select-none"
            onMouseDown={() => startResize('right')}
            role="separator"
            aria-label="Resize right panel"
          />
        )}

        {/* ══════════════════ RIGHT PANEL (AI ASSISTANT) ══════════════════ */}
        <div
          className="flex flex-col bg-[#161b22] border-l border-[#30363d] shrink-0 overflow-hidden"
          style={{ width: effectiveRightWidth }}
        >
          {rightCollapsed ? (
            /* ── Collapsed strip ── */
            <div className="flex flex-col items-center py-2 gap-3">
              <button
                onClick={() => setRightCollapsed(false)}
                aria-label="Expand AI panel"
                className="p-1.5 rounded hover:bg-[#21262d] text-[#8b949e] hover:text-[#e6edf3] transition-colors"
              >
                <ChevronLeft size={14} />
              </button>
            </div>
          ) : (
            /* ── Full right panel ── */
            <>
              {/* Right panel header */}
              <div className="h-9 flex items-center justify-between px-3 bg-[#1c2128] border-b border-[#30363d] shrink-0">
                <div className="flex items-center gap-2">
                  <Bot size={13} className="text-[#2f81f7]" />
                  <span className="text-[11px] uppercase tracking-widest font-semibold text-[#8b949e] select-none">
                    AI Assistant
                  </span>
                </div>
                <button
                  onClick={() => setRightCollapsed(true)}
                  aria-label="Collapse AI panel"
                  className="p-1 rounded hover:bg-[#21262d] text-[#8b949e] hover:text-[#e6edf3] transition-colors"
                >
                  <ChevronRight size={14} />
                </button>
              </div>

              {/* AI sub-tab bar */}
              <div className="flex border-b border-[#30363d] bg-[#161b22] shrink-0">
                <button
                  type="button"
                  onClick={() => setAiPanelTab('voice')}
                  aria-pressed={aiPanelTab === 'voice'}
                  className={`flex-1 px-3 py-1.5 text-xs font-semibold transition-colors ${
                    aiPanelTab === 'voice'
                      ? 'text-[#e6edf3] border-b-2 border-[#2f81f7] bg-[#0d1117]'
                      : 'text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#21262d] border-b-2 border-transparent'
                  }`}
                >
                  AI Voice Explanation
                </button>
                <button
                  type="button"
                  onClick={() => setAiPanelTab('tutor')}
                  aria-pressed={aiPanelTab === 'tutor'}
                  className={`flex-1 px-3 py-1.5 text-xs font-semibold transition-colors ${
                    aiPanelTab === 'tutor'
                      ? 'text-[#e6edf3] border-b-2 border-[#2f81f7] bg-[#0d1117]'
                      : 'text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#21262d] border-b-2 border-transparent'
                  }`}
                >
                  Agentic Tutor
                </button>
              </div>

              {/* AI content area */}
              <div className="flex-1 overflow-hidden min-h-0">
                {aiPanelTab === 'voice' ? (
                  <VoiceExplanation
                    selectedNode={selectedFlowNode}
                    editorSelection={editorSelection}
                    currentFile={fileName}
                    code={code}
                    language={language}
                  />
                ) : (
                  <AIChatView
                    selectedNode={selectedFlowNode}
                    code={code}
                    fileName={fileName}
                    language={language}
                    sessionId={sessionId}
                    onClearSelectedNode={onClearSelectedNode}
                    onNavigateToCode={onNavigateToCode}
                  />
                )}
              </div>
            </>
          )}
        </div>

      </div>

      {/* ── STATUS BAR ─────────────────────────────────────────────────────── */}
      <StatusBar {...statusBarProps} />
    </div>
  );
}
