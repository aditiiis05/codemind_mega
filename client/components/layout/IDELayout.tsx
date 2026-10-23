'use client';

import {
  useState,
  useRef,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import StatusBar from './StatusBar';
import Panel from './Panel';
import EditorTabs, { type EditorTab } from './EditorTabs';
import AIAssistantPanel from '../ai/AIAssistantPanel';
import ExplorerView, { type FileNode } from '../views/ExplorerView';
import type { FlowNode } from '@/types/flowchart';
import type { EditorSelection } from '@/types/voice';
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Bot,
  Loader2,
} from 'lucide-react';

interface IDELayoutProps {
  children?: ReactNode;
  tabs?: EditorTab[];
  activeTabId?: string;
  onTabClick?: (tabId: string) => void;
  onTabClose?: (tabId: string) => void;

  analysisPanel?: {
    content: string;
    isAnalyzing?: boolean;
    onClose: () => void;
  };

  files?: FileNode[];
  expandedDirs?: Record<string, boolean>;
  onFileClick?: (file: FileNode) => void;
  onDirToggle?: (path: string) => void;
  selectedFile?: FileNode | null;
  /** When true, shows a skeleton loader in the file explorer instead of an empty tree */
  isTreeLoading?: boolean;

  visualizationContent?: ReactNode;

  selectedFlowNode?: FlowNode | null;
  editorSelection?: EditorSelection | null;
  code?: string | null;
  fileName?: string | null;
  language?: string | null;
  sessionId?: string | null;
  onClearSelectedNode?: () => void;
  onNavigateToCode?: (
    file: string,
    lineStart: number,
    lineEnd?: number
  ) => void;
  onApplySuggestion?: (suggestion: string) => void;
  onAnalyzeRepo?: () => void;
  isAnalyzing?: boolean;
  analysisResult?: string;
  repoAvailable?: boolean;

  statusBarProps?: {
    line?: number;
    column?: number;
    language?: string;
    branch?: string;
    aiStatus?: 'idle' | 'processing' | 'ready';
  };
}

export default function IDELayout({
  children,
  files = [],
  expandedDirs = {},
  onFileClick = () => {},
  onDirToggle = () => {},
  selectedFile = null,
  isTreeLoading = false,
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
  onApplySuggestion = () => {},
  onAnalyzeRepo = () => {},
  isAnalyzing = false,
  analysisResult = '',
  repoAvailable = false,
}: IDELayoutProps) {
  const [leftWidth, setLeftWidth] = useState(430);
  const [rightWidth, setRightWidth] = useState(420);
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);
  const [explorerOpen, setExplorerOpen] = useState(true);

  // Adjust panel widths on mount and window resize.
  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;

      if (w >= 1400) {
        setLeftWidth(
          Math.min(520, Math.max(380, Math.round(w * 0.27)))
        );
        setRightWidth(
          Math.min(480, Math.max(360, Math.round(w * 0.26)))
        );
      } else if (w >= 1100) {
        setLeftWidth(380);
        setRightWidth(360);
      } else if (w >= 850) {
        setLeftWidth(340);
        setRightCollapsed(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Panel resize drag logic.
  const isDraggingRef = useRef(false);

  const startResize = useCallback((side: 'left' | 'right') => {
    if (isDraggingRef.current) return;

    isDraggingRef.current = true;

    const onMove = (e: MouseEvent) => {
      const maxW = Math.max(
        480,
        Math.floor(window.innerWidth * 0.38)
      );

      if (side === 'left') {
        setLeftWidth((w) =>
          Math.min(maxW, Math.max(340, w + e.movementX))
        );
      } else {
        setRightWidth((w) =>
          Math.min(maxW, Math.max(340, w - e.movementX))
        );
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

  const effectiveLeftWidth = leftCollapsed ? 32 : leftWidth;
  const effectiveRightWidth = rightCollapsed ? 32 : rightWidth;

  return (
    <div className="h-screen flex flex-col bg-[#0d1117] text-[#e6edf3] overflow-hidden">
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* LEFT PANEL */}
        <div
          className="ide-panel flex flex-col bg-[#161b22] border-r border-[#30363d] shrink-0 overflow-hidden"
          style={{ width: effectiveLeftWidth }}
        >
          {leftCollapsed ? (
            <div className="flex flex-col items-center py-2.5 gap-4 h-full bg-[#161b22]">
              <button
                onClick={() => setLeftCollapsed(false)}
                aria-label="Expand left panel"
                title="Expand Code Visualization"
                className="p-1.5 rounded hover:bg-[#21262d] text-[#8b949e] hover:text-[#58a6ff] transition-colors"
              >
                <ChevronRight size={15} />
              </button>

              <div
                onClick={() => setLeftCollapsed(false)}
                className="text-[10px] uppercase tracking-widest text-[#8b949e] hover:text-[#e6edf3] font-semibold cursor-pointer select-none py-2"
                style={{
                  writingMode: 'vertical-rl',
                  transform: 'rotate(180deg)',
                }}
                title="Click to expand Code Visualization"
              >
                Visualization
              </div>
            </div>
          ) : (
            <>
              {/* EXPLORER */}
              <div className="shrink-0 border-b border-[#30363d] bg-[#1c2128]">
                <div className="h-8 flex items-center justify-between px-2.5">
                  <button
                    onClick={() => setExplorerOpen((o) => !o)}
                    className="flex items-center gap-1.5 text-[11px] uppercase tracking-widest font-semibold text-[#8b949e] hover:text-[#e6edf3] transition-colors select-none"
                    aria-expanded={explorerOpen}
                    title={
                      explorerOpen
                        ? 'Collapse Explorer'
                        : 'Expand Explorer'
                    }
                  >
                    {explorerOpen ? (
                      <ChevronDown
                        size={13}
                        className="text-[#8b949e]"
                      />
                    ) : (
                      <ChevronRight
                        size={13}
                        className="text-[#8b949e]"
                      />
                    )}
                    <span>Explorer</span>
                  </button>

                  <button
                    onClick={() => setLeftCollapsed(true)}
                    aria-label="Collapse left panel"
                    title="Collapse sidebar"
                    className="p-1 rounded hover:bg-[#21262d] text-[#8b949e] hover:text-[#e6edf3] transition-colors"
                  >
                    <ChevronLeft size={14} />
                  </button>
                </div>

                {explorerOpen && (
                  <div
                    className="overflow-y-auto border-t border-[#30363d]/50 bg-[#161b22]"
                    style={{ maxHeight: 'max(120px, 26vh)' }}
                  >
                    {isTreeLoading ? (
                      <div className="flex items-center gap-2 px-3 py-3 text-[#7d8590]">
                        <Loader2 size={13} className="animate-spin text-[#2f81f7] shrink-0" />
                        <span className="text-[11px]">Loading files…</span>
                      </div>
                    ) : (
                      <ExplorerView
                        files={files}
                        expandedDirs={expandedDirs}
                        onFileClick={onFileClick}
                        onDirToggle={onDirToggle}
                        selectedFile={selectedFile}
                      />
                    )}
                  </div>
                )}
              </div>

              {/* FLOWCHART / MIND MAP AREA */}
              <div className="flex-1 overflow-hidden min-h-0">
                {visualizationContent ?? (
                  <div className="flex items-center justify-center h-full text-center flex-col opacity-50 p-4">
                    <svg
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      className="text-[#8b949e] mb-3"
                    >
                      <rect x="3" y="3" width="7" height="7" rx="1" />
                      <rect x="14" y="3" width="7" height="7" rx="1" />
                      <rect x="3" y="14" width="7" height="7" rx="1" />
                      <path d="M17.5 14.5v3m0 3v.01M17.5 17.5h3m-3 0h-3" />
                    </svg>
                    <p className="text-[#8b949e] text-xs">
                      Select a file to generate a flowchart or mind map
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* LEFT RESIZE HANDLE */}
        {!leftCollapsed && (
          <div
            className="w-1 bg-[#30363d] hover:bg-[#2f81f7] cursor-col-resize transition-colors shrink-0 select-none"
            onMouseDown={() => startResize('left')}
            role="separator"
            aria-label="Resize left panel"
          />
        )}

        {/* CENTER EDITOR PANEL */}
        <div className="ide-panel flex-1 flex flex-col overflow-hidden min-w-[400px]">
          {tabs.length > 0 && (
            <EditorTabs
              tabs={tabs}
              activeTabId={activeTabId}
              onTabClick={onTabClick}
              onTabClose={onTabClose}
            />
          )}

          <div className="flex-1 overflow-hidden min-h-0">
            {children}
          </div>

          {/* ANALYSIS PANEL */}
          {analysisPanel && (
            <div
              className="border-t border-[#30363d] bg-[#0d1117] flex flex-col shrink-0"
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
                  <span className="text-[#8b949e] text-xs">
                    Analyzing…
                  </span>
                ) : (
                  <pre className="text-xs whitespace-pre-wrap text-[#c9d1d9] leading-relaxed">
                    {analysisPanel.content ||
                      'No analysis returned by model.'}
                  </pre>
                )}
              </div>
            </div>
          )}

          {/* BOTTOM TERMINAL */}
          <Panel />
        </div>

        {/* RIGHT RESIZE HANDLE */}
        {!rightCollapsed && (
          <div
            className="w-1 bg-[#30363d] hover:bg-[#2f81f7] cursor-col-resize transition-colors shrink-0 select-none"
            onMouseDown={() => startResize('right')}
            role="separator"
            aria-label="Resize right panel"
          />
        )}

        {/* RIGHT AI ASSISTANT PANEL */}
        <div
          className="ide-panel flex flex-col bg-[#161b22] border-l border-[#30363d] shrink-0 overflow-hidden"
          style={{ width: effectiveRightWidth }}
        >
          {rightCollapsed ? (
            <div className="flex flex-col items-center py-2.5 gap-4 h-full bg-[#161b22]">
              <button
                onClick={() => setRightCollapsed(false)}
                aria-label="Expand AI panel"
                title="Expand AI Assistant"
                className="p-1.5 rounded hover:bg-[#21262d] text-[#8b949e] hover:text-[#58a6ff] transition-colors"
              >
                <ChevronLeft size={15} />
              </button>

              <div
                onClick={() => setRightCollapsed(false)}
                className="text-[10px] uppercase tracking-widest text-[#8b949e] hover:text-[#e6edf3] font-semibold cursor-pointer select-none py-2"
                style={{
                  writingMode: 'vertical-rl',
                  transform: 'rotate(180deg)',
                }}
                title="Click to expand AI Assistant"
              >
                AI Assistant
              </div>
            </div>
          ) : (
            <>
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

              <div className="flex-1 overflow-hidden min-h-0">
                <AIAssistantPanel
                  selectedNode={selectedFlowNode}
                  currentFile={fileName}
                  code={code}
                  language={language}
                  editorSelection={editorSelection}
                  sessionId={sessionId}
                  onClearSelectedNode={onClearSelectedNode}
                  onNavigateToCode={onNavigateToCode}
                  onApplySuggestion={onApplySuggestion}
                  onAnalyzeRepo={onAnalyzeRepo}
                  isAnalyzing={isAnalyzing}
                  analysisResult={analysisResult}
                  repoAvailable={repoAvailable}
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* STATUS BAR */}
      <StatusBar {...statusBarProps} />
    </div>
  );
}
