// client/components/flowchart/NodeDetailPanel.tsx
<<<<<<< HEAD
// Integrated IDE Bottom Terminal Panel for Flowchart Nodes.
// Resizable, non-overlapping bottom dock with Node Inspector, Code Preview,
// Flow & Branches analysis, and Agentic Tutor AI reasoning.

'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  X,
  FileCode,
  MapPin,
  ArrowRight,
  ArrowLeft,
  GitBranch,
  RotateCw,
  Code2,
  AlertTriangle,
  ArrowDownToLine,
  ArrowUpFromLine,
  Cpu,
  CornerDownLeft,
  Play,
  Square,
  Sparkles,
  Loader2,
  Bot,
  Terminal,
  AlertCircle,
  Maximize2,
  Minimize2,
  ArrowUp,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Layers
=======
// Slide-in detail panel shown when a flowchart node is clicked.
// Displays: type, readable explanation, source code, file, lines, edges,
// and an integrated Agentic Tutor panel for interactive, evidence-grounded tutoring.

'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  X, FileCode, MapPin, ArrowRight, ArrowLeft,
  GitBranch, RotateCw, Code2, AlertTriangle,
  ArrowDownToLine, ArrowUpFromLine, Cpu, CornerDownLeft,
  Play, Square, Sparkles, Send, Loader2, Bot,
  Terminal, AlertCircle
>>>>>>> 1fedef5cdf2fa8631c20411f700509b8bbdcb0e2
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { FlowNode, FlowEdge } from '@/types/flowchart';
import { askTutor, TutorEvidence } from '@/services/tutorApi';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  toolsUsed?: string[];
  evidence?: TutorEvidence[];
  timestamp: Date;
}

interface NodeDetailPanelProps {
  node: FlowNode | null;
  allEdges: FlowEdge[];
  allNodes: FlowNode[];
  code?: string | null;
  fileName?: string | null;
  language?: string | null;
  sessionId?: string | null;
  onClose: () => void;
  onNavigateToCode?: (file: string, lineStart: number, lineEnd?: number) => void;
<<<<<<< HEAD
  onSelectNode?: (node: FlowNode) => void;
}

type TerminalTab = 'details' | 'code' | 'flow' | 'tutor';

// ─── Type Metadata & Styles ──────────────────────────────────────────────────

const TYPE_META: Record<string, { icon: React.ReactNode; color: string; bg: string; explanation: string }> = {
  START:    { icon: <Play size={12} />,              color: '#34d399', bg: '#064e3b', explanation: 'Program or function execution begins here.' },
  END:      { icon: <Square size={11} />,            color: '#f87171', bg: '#450a0a', explanation: 'Execution reaches completion and terminates.' },
  PROCESS:  { icon: <Cpu size={12} />,               color: '#58a6ff', bg: '#0c1a2e', explanation: 'Sequential statement — assignment, calculation, or expression.' },
  DECISION: { icon: <GitBranch size={12} />,         color: '#f59e0b', bg: '#1c1207', explanation: 'Conditional branch evaluating condition into TRUE or FALSE paths.' },
  LOOP:     { icon: <RotateCw size={12} />,          color: '#818cf8', bg: '#1e1b4b', explanation: 'Iteration loop that repeats while continuation condition is met.' },
  FUNCTION: { icon: <Code2 size={12} />,             color: '#c084fc', bg: '#2e1065', explanation: 'Function or method entry declaration.' },
  INPUT:    { icon: <ArrowDownToLine size={12} />,   color: '#2dd4bf', bg: '#042f2e', explanation: 'Reads data from user or external data source.' },
  OUTPUT:   { icon: <ArrowUpFromLine size={12} />,   color: '#38bdf8', bg: '#082f49', explanation: 'Emits output or prints results to console/view.' },
  RETURN:   { icon: <CornerDownLeft size={12} />,    color: '#4ade80', bg: '#052e16', explanation: 'Returns a value and exits the current scope.' },
  ERROR:    { icon: <AlertTriangle size={12} />,     color: '#f87171', bg: '#450a0a', explanation: 'Exception handling — catches or raises an error.' },
  FILE:     { icon: <FileCode size={12} />,          color: '#22d3ee', bg: '#164e63', explanation: 'Source file module in the repository architecture.' },
=======
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TYPE_META: Record<string, { icon: React.ReactNode; color: string; bg: string; explanation: string }> = {
  START:    { icon: <Play size={14} />,              color: '#34d399', bg: '#064e3b', explanation: 'Entry point of the program or function.' },
  END:      { icon: <Square size={12} />,            color: '#f87171', bg: '#450a0a', explanation: 'Program or function exits here.' },
  PROCESS:  { icon: <Cpu size={14} />,               color: '#58a6ff', bg: '#0c1a2e', explanation: 'A statement that performs an action — declaration, assignment, or expression.' },
  DECISION: { icon: <GitBranch size={14} />,         color: '#f59e0b', bg: '#1c1207', explanation: 'A conditional branch. The program follows different paths based on the outcome.' },
  LOOP:     { icon: <RotateCw size={14} />,          color: '#818cf8', bg: '#1e1b4b', explanation: 'A loop that repeats its body while the condition is true.' },
  FUNCTION: { icon: <Code2 size={14} />,             color: '#c084fc', bg: '#2e1065', explanation: 'A function or method declaration. Click to view its internal flow.' },
  INPUT:    { icon: <ArrowDownToLine size={14} />,   color: '#2dd4bf', bg: '#042f2e', explanation: 'Reads data from the user or an external source.' },
  OUTPUT:   { icon: <ArrowUpFromLine size={14} />,   color: '#38bdf8', bg: '#082f49', explanation: 'Writes or displays data to the user or an output stream.' },
  RETURN:   { icon: <CornerDownLeft size={14} />,    color: '#4ade80', bg: '#052e16', explanation: 'Returns a value and exits the current function.' },
  ERROR:    { icon: <AlertTriangle size={14} />,     color: '#f87171', bg: '#450a0a', explanation: 'Exception handling — catches or throws an error.' },
  FILE:     { icon: <FileCode size={14} />,          color: '#22d3ee', bg: '#164e63', explanation: 'A source file in the project.' },
>>>>>>> 1fedef5cdf2fa8631c20411f700509b8bbdcb0e2
};

function getTypeMeta(type: string) {
  return TYPE_META[type] ?? TYPE_META['PROCESS'];
}

function cleanLabel(label: string): string {
  return label.replace(/^def\s+/, '').replace(/\?$/, '').trim();
}

function truncate(s: string, max: number) {
  if (!s) return '';
  return s.length > max ? s.substring(0, max - 1) + '…' : s;
}

<<<<<<< HEAD
=======
function edgeLabelColor(label: string): string {
  if (label === 'YES' || label === 'TRUE')    return '#34d399';
  if (label === 'NO' || label === 'FALSE')     return '#f87171';
  if (label === 'LOOP')   return '#818cf8';
  if (label === 'RETURN') return '#4ade80';
  if (label === 'ERROR')  return '#f87171';
  if (label === 'CALLS')  return '#c084fc';
  return '#7d8590';
}

// ─── Component ────────────────────────────────────────────────────────────────

>>>>>>> 1fedef5cdf2fa8631c20411f700509b8bbdcb0e2
export default function NodeDetailPanel({
  node,
  allEdges,
  allNodes,
  code = '',
  fileName = 'main.py',
  language = 'python',
  sessionId = null,
  onClose,
<<<<<<< HEAD
  onNavigateToCode,
  onSelectNode
}: NodeDetailPanelProps) {
  const [activeTab, setActiveTab] = useState<TerminalTab>('details');
  const [height, setHeight] = useState(240);
  const [isCollapsed, setIsCollapsed] = useState(false);
=======
  onNavigateToCode
}: NodeDetailPanelProps) {
  const [activeTab, setActiveTab] = useState<'info' | 'tutor'>('tutor');
>>>>>>> 1fedef5cdf2fa8631c20411f700509b8bbdcb0e2
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
<<<<<<< HEAD
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const isDraggingRef = useRef(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll tutor chat
  useEffect(() => {
    if (activeTab === 'tutor') {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, activeTab]);

  // Reset or initialize tutor greeting when selected node changes
=======
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Reset or initialize tutor greeting when node changes
>>>>>>> 1fedef5cdf2fa8631c20411f700509b8bbdcb0e2
  useEffect(() => {
    if (!node) return;
    setMessages([
      {
        id: `init_${node.id}`,
        role: 'assistant',
<<<<<<< HEAD
        content: `👋 I'm your **Agentic Tutor**. Inspecting node \`${node.id}\` (\`${cleanLabel(node.label || '')}\`).\nAsk me about execution logic, branch decisions, side effects, or edge cases.`,
=======
        content: `👋 I'm your **Agentic Tutor**! I can inspect node \`${node.id}\` (\`${cleanLabel(node.label)}\`), examine its branches, trace execution, and explain why the code behaves this way.`,
>>>>>>> 1fedef5cdf2fa8631c20411f700509b8bbdcb0e2
        timestamp: new Date()
      }
    ]);
    setError(null);
  }, [node?.id]); // eslint-disable-line react-hooks/exhaustive-deps

<<<<<<< HEAD
  // Mouse drag resizer for top edge of bottom terminal panel
  const startResize = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isDraggingRef.current = true;
    const startY = e.clientY;
    const startH = height;

    const onMove = (moveEvent: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const deltaY = startY - moveEvent.clientY;
      const maxH = Math.min(500, Math.floor(window.innerHeight * 0.6));
      const newH = Math.max(130, Math.min(maxH, startH + deltaY));
      setHeight(newH);
      if (isCollapsed) setIsCollapsed(false);
    };

    const onUp = () => {
      isDraggingRef.current = false;
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }, [height, isCollapsed]);

=======
>>>>>>> 1fedef5cdf2fa8631c20411f700509b8bbdcb0e2
  if (!node) return null;

  const meta = getTypeMeta(node.type);
  const label = cleanLabel(node.label || '');
  const lineLabel = node.lineStart
    ? (node.lineEnd && node.lineEnd !== node.lineStart
<<<<<<< HEAD
        ? `${node.lineStart}–${node.lineEnd}`
        : `${node.lineStart}`)
    : null;

  // Predecessor and successor edges
  const incoming = allEdges.filter(e => e.target === node.id);
  const outgoing = allEdges.filter(e => e.source === node.id);

  const getNodeObj = (id: string) => allNodes.find(n => n.id === id);
=======
        ? `${node.lineStart} – ${node.lineEnd}`
        : `${node.lineStart}`)
    : null;

  // Collect incoming / outgoing edges
  const incoming = allEdges.filter(e => e.target === node.id);
  const outgoing = allEdges.filter(e => e.source === node.id);

>>>>>>> 1fedef5cdf2fa8631c20411f700509b8bbdcb0e2
  const getNodeLabel = (id: string) =>
    allNodes.find(n => n.id === id)?.label?.replace(/^def\s+/, '') ?? id;

  const isDecision = node.type === 'DECISION';
<<<<<<< HEAD
  const isLoop = node.type === 'LOOP';
  const yesBranch = outgoing.find(e => (e.label || '').toUpperCase() === 'YES' || (e.label || '').toUpperCase() === 'TRUE');
  const noBranch  = outgoing.find(e => (e.label || '').toUpperCase() === 'NO' || (e.label || '').toUpperCase() === 'FALSE');

  // Extract source code snippet around node's lineStart..lineEnd
  const codeSnippetLines = useMemo(() => {
    if (!code || !node.lineStart) return null;
    const lines = code.split('\n');
    const start = Math.max(1, node.lineStart - 1);
    const end = Math.min(lines.length, (node.lineEnd || node.lineStart) + 1);
    return lines.slice(start - 1, end).map((text, i) => {
      const lineNum = start + i;
      const isTarget = lineNum >= node.lineStart! && lineNum <= (node.lineEnd || node.lineStart!);
      return { lineNum, text, isTarget };
    });
  }, [code, node.lineStart, node.lineEnd]);

  // Quick inquiry prompts tailored to node type
  const suggestedPrompts = useMemo(() => {
    if (isDecision) {
      return [
        'Why does this condition have two branches?',
        'What conditions trigger the TRUE branch?',
        'What leads to this decision in the flow?'
      ];
    }
    if (isLoop) {
      return [
        'When does this loop terminate?',
        'Explain the loop continuation check',
        'Are there any potential infinite loop risks?'
=======
  const yesBranch = outgoing.find(e => (e.label || '').toUpperCase() === 'YES' || (e.label || '').toUpperCase() === 'TRUE');
  const noBranch  = outgoing.find(e => (e.label || '').toUpperCase() === 'NO' || (e.label || '').toUpperCase() === 'FALSE');

  // Quick prompt recommendations tailored to the selected node
  const getSuggestedPrompts = () => {
    if (isDecision) {
      return [
        'Why does this condition have two branches?',
        'Explain this decision condition',
        'What leads to this decision?'
      ];
    }
    if (node.type === 'LOOP') {
      return [
        'Explain the loop continuation condition',
        'When does this loop terminate?',
        'Trace the loop logic'
>>>>>>> 1fedef5cdf2fa8631c20411f700509b8bbdcb0e2
      ];
    }
    if (node.type === 'FUNCTION') {
      return [
<<<<<<< HEAD
        'What callers invoke this function?',
        'Explain the function signature & logic',
        'Show function dependencies'
=======
        'What functions call this?',
        'Explain what this function does',
        'Show function call relationships'
>>>>>>> 1fedef5cdf2fa8631c20411f700509b8bbdcb0e2
      ];
    }
    return [
      'Explain what this statement does',
<<<<<<< HEAD
      'Trace control flow reaching here',
      'Are there variable side-effects?'
    ];
  }, [isDecision, isLoop, node.type]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

=======
      'How does control flow reach this node?',
      'Trace code execution'
    ];
  };

  // Submit question to Agentic Tutor API
>>>>>>> 1fedef5cdf2fa8631c20411f700509b8bbdcb0e2
  const handleAsk = async (textToAsk?: string) => {
    const q = (textToAsk || question).trim();
    if (!q || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: q,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setQuestion('');
    setIsLoading(true);
    setError(null);

    try {
      const historyPayload = messages.map(m => ({
        role: m.role,
        content: m.content
      }));

      const response = await askTutor({
        question: q,
        node_id: node.id,
        session_id: sessionId,
        code: code || '',
        fileName: node.file || fileName || 'main.py',
        language: language || 'python',
        graph: {
          nodes: allNodes,
          edges: allEdges
        },
        conversationHistory: historyPayload
      });

      const assistantMsg: ChatMessage = {
        id: `asst_${Date.now()}`,
        role: 'assistant',
        content: response.answer || 'No explanation returned.',
        toolsUsed: response.tools_used || [],
        evidence: response.evidence || [],
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: unknown) {
<<<<<<< HEAD
      console.error('[NodeDetailPanel] Tutor error:', err);
=======
      console.error('[NodeDetailPanel Tutor Error]:', err);
>>>>>>> 1fedef5cdf2fa8631c20411f700509b8bbdcb0e2
      const errText = err instanceof Error ? err.message : 'Unable to connect to tutor service.';
      setError(errText);
      setMessages(prev => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          role: 'assistant',
<<<<<<< HEAD
          content: `⚠️ **Tutor Service Notice**: ${errText}\n\nMake sure backend service is active.`,
=======
          content: `⚠️ **Tutor Service Notice**: ${errText}\n\nMake sure the CodeMind backend is running on port 4000 and Ollama is configured.`,
>>>>>>> 1fedef5cdf2fa8631c20411f700509b8bbdcb0e2
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
<<<<<<< HEAD
      className={`w-full bg-[#1e1e1e] border-t border-[#2b2b2b] flex flex-col shrink-0 select-none z-20 relative transition-all duration-150 ${
        isCollapsed ? 'h-[34px]' : ''
      }`}
      style={!isCollapsed ? { height: `${height}px` } : undefined}
    >
      {/* ── Top Drag Handle (Resize bottom panel like IDE terminal) ── */}
      {!isCollapsed && (
        <div
          onMouseDown={startResize}
          className="absolute top-0 left-0 right-0 h-[4px] cursor-row-resize bg-transparent hover:bg-[#007acc] z-30 transition-colors"
          title="Drag up or down to resize bottom panel"
          role="separator"
          aria-label="Resize bottom terminal panel"
        />
      )}

      {/* ── Terminal Header Bar ── */}
      <div className="h-[34px] px-3 bg-[#252526] border-b border-[#2b2b2b] flex items-center justify-between shrink-0 text-xs">
        {/* Left: Terminal prompt icon + Node Type Badge + Tabs */}
        <div className="flex items-center gap-2 overflow-hidden min-w-0">
          {/* Terminal Icon & Type Badge */}
          <div className="flex items-center gap-1.5 shrink-0">
            <Terminal size={13} className="text-[#007acc]" />
            <div
              className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider"
              style={{ backgroundColor: `${meta.color}20`, color: meta.color, border: `1px solid ${meta.color}40` }}
            >
              {meta.icon}
              <span>{node.type}</span>
            </div>
            <span className="text-[10px] font-mono text-[#858585] hidden md:inline truncate max-w-[120px]">
              #{node.id}
            </span>
          </div>

          <div className="w-px h-3.5 bg-[#3c3c3c] mx-1 shrink-0" />

          {/* VS Code Style Terminal Tabs */}
          <div className="flex items-center h-[34px]" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'details'}
              onClick={() => {
                setActiveTab('details');
                if (isCollapsed) setIsCollapsed(false);
              }}
              className={`h-[34px] px-2.5 flex items-center gap-1.5 text-xs font-medium transition-colors cursor-pointer border-b-2 ${
                activeTab === 'details' && !isCollapsed
                  ? 'border-[#007acc] text-white bg-[#1e1e1e]'
                  : 'border-transparent text-[#858585] hover:text-[#cccccc]'
              }`}
            >
              <Cpu size={12} className={activeTab === 'details' ? 'text-[#007acc]' : 'text-[#858585]'} />
              <span>Inspector</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'code'}
              onClick={() => {
                setActiveTab('code');
                if (isCollapsed) setIsCollapsed(false);
              }}
              className={`h-[34px] px-2.5 flex items-center gap-1.5 text-xs font-medium transition-colors cursor-pointer border-b-2 ${
                activeTab === 'code' && !isCollapsed
                  ? 'border-[#007acc] text-white bg-[#1e1e1e]'
                  : 'border-transparent text-[#858585] hover:text-[#cccccc]'
              }`}
            >
              <Code2 size={12} className={activeTab === 'code' ? 'text-[#007acc]' : 'text-[#858585]'} />
              <span>Code</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'flow'}
              onClick={() => {
                setActiveTab('flow');
                if (isCollapsed) setIsCollapsed(false);
              }}
              className={`h-[34px] px-2.5 flex items-center gap-1.5 text-xs font-medium transition-colors cursor-pointer border-b-2 ${
                activeTab === 'flow' && !isCollapsed
                  ? 'border-[#007acc] text-white bg-[#1e1e1e]'
                  : 'border-transparent text-[#858585] hover:text-[#cccccc]'
              }`}
            >
              <GitBranch size={12} className={activeTab === 'flow' ? 'text-[#007acc]' : 'text-[#858585]'} />
              <span>Flow</span>
              {(incoming.length + outgoing.length) > 0 && (
                <span className="px-1 py-0.2 rounded-full text-[9px] font-mono bg-[#1e1e1e] text-[#858585] border border-[#3c3c3c]">
                  {incoming.length + outgoing.length}
                </span>
              )}
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'tutor'}
              onClick={() => {
                setActiveTab('tutor');
                if (isCollapsed) setIsCollapsed(false);
              }}
              className={`h-[34px] px-2.5 flex items-center gap-1.5 text-xs font-medium transition-colors cursor-pointer border-b-2 ${
                activeTab === 'tutor' && !isCollapsed
                  ? 'border-[#007acc] text-white bg-[#1e1e1e]'
                  : 'border-transparent text-[#858585] hover:text-[#cccccc]'
              }`}
            >
              <Bot size={12} className={activeTab === 'tutor' ? 'text-[#007acc]' : 'text-[#858585]'} />
              <span>AI Tutor</span>
            </button>
          </div>
        </div>

        {/* Right: Line Jump Badge, Collapse/Expand & Close Controls */}
        <div className="flex items-center gap-1 shrink-0">
          {lineLabel && onNavigateToCode && (
            <button
              onClick={() => onNavigateToCode(node.file || fileName || 'main.py', node.lineStart!, node.lineEnd || node.lineStart!)}
              className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#1e1e1e] hover:bg-[#2a2d2e] border border-[#3c3c3c] text-[11px] font-mono text-[#007acc] hover:text-[#75beff] transition-colors cursor-pointer mr-1"
              title="Jump to code in editor"
            >
              <MapPin size={10} />
              <span>Ln {lineLabel}</span>
              <ExternalLink size={10} className="ml-0.5 opacity-70" />
            </button>
          )}

          <button
            onClick={() => setIsCollapsed(p => !p)}
            className="p-1 rounded text-[#858585] hover:text-white hover:bg-[#2a2d2e] transition-colors cursor-pointer"
            title={isCollapsed ? 'Expand Panel' : 'Collapse Panel'}
            aria-label="Toggle panel height"
          >
            {isCollapsed ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>

          <button
            onClick={() => setHeight(h => (h > 280 ? 220 : 380))}
            className="p-1 rounded text-[#858585] hover:text-white hover:bg-[#2a2d2e] transition-colors cursor-pointer"
            title={height > 280 ? 'Standard Height' : 'Maximize Height'}
            aria-label="Toggle maximum height"
          >
            {height > 280 ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
          </button>

          <button
            onClick={onClose}
            className="p-1 rounded text-[#858585] hover:text-white hover:bg-[#2a2d2e] transition-colors cursor-pointer"
            title="Close Panel"
            aria-label="Close Panel"
          >
            <X size={13} />
          </button>
        </div>
      </div>

      {/* ── Terminal Body Content ── */}
      {!isCollapsed && (
        <div className="flex-1 min-h-0 overflow-hidden bg-[#1e1e1e] flex flex-col">
          {/* ══════════ TAB 1: NODE INSPECTOR ══════════ */}
          {activeTab === 'details' && (
            <div className="flex-1 flex flex-col sm:flex-row overflow-hidden divide-y sm:divide-y-0 sm:divide-x divide-[#2b2b2b]">
              {/* Left/Main Column: Statement Code & Description */}
              <div className="flex-1 p-3 overflow-y-auto ide-scrollbar space-y-2.5">
                <div>
                  <div className="text-[10px] uppercase font-bold tracking-wider text-[#858585] mb-1 flex items-center justify-between">
                    <span>Node Statement / Expression</span>
                    <button
                      onClick={() => copyToClipboard(label, 'stmt')}
                      className="flex items-center gap-1 text-[10px] text-[#858585] hover:text-white transition-colors cursor-pointer"
                    >
                      {copiedId === 'stmt' ? <Check size={11} className="text-[#3fb950]" /> : <Copy size={11} />}
                      <span>{copiedId === 'stmt' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <pre className="bg-[#181818] border border-[#333333] rounded p-2 text-xs font-mono text-[#e0e0e0] overflow-x-auto whitespace-pre-wrap break-words leading-relaxed max-h-[85px] ide-scrollbar">
                    {label}
                  </pre>
                </div>

                <div className="bg-[#252526] p-2.5 rounded border border-[#333333]">
                  <div className="text-[10px] uppercase font-bold tracking-wider text-[#858585] mb-1">
                    Control Flow Role
                  </div>
                  <p className="text-xs text-[#cccccc] leading-relaxed">
                    {meta.explanation}
                  </p>
                </div>
              </div>

              {/* Right Column: Metadata & Quick Actions */}
              <div className="w-full sm:w-[260px] p-3 overflow-y-auto ide-scrollbar bg-[#212122] flex flex-col justify-between shrink-0 space-y-3">
                <div className="space-y-1.5 text-xs font-mono">
                  <div className="text-[10px] uppercase font-bold tracking-wider text-[#858585] mb-2 font-sans">
                    Properties
                  </div>
                  <div className="flex justify-between py-0.5 border-b border-[#2b2b2b]">
                    <span className="text-[#858585]">Node ID:</span>
                    <span className="text-white truncate max-w-[140px]">{node.id}</span>
                  </div>
                  <div className="flex justify-between py-0.5 border-b border-[#2b2b2b]">
                    <span className="text-[#858585]">Type:</span>
                    <span style={{ color: meta.color }} className="font-bold">{node.type}</span>
                  </div>
                  {lineLabel && (
                    <div className="flex justify-between py-0.5 border-b border-[#2b2b2b]">
                      <span className="text-[#858585]">Lines:</span>
                      <span className="text-[#007acc]">Ln {lineLabel}</span>
                    </div>
                  )}
                  {node.file && (
                    <div className="flex justify-between py-0.5 border-b border-[#2b2b2b]">
                      <span className="text-[#858585]">File:</span>
                      <span className="text-white truncate max-w-[130px]" title={node.file}>
                        {node.file.split('/').pop()}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between py-0.5 border-b border-[#2b2b2b]">
                    <span className="text-[#858585]">Connections:</span>
                    <span className="text-white">{incoming.length} in · {outgoing.length} out</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#2b2b2b] space-y-1.5">
                  {lineLabel && onNavigateToCode && (
                    <button
                      onClick={() => onNavigateToCode(node.file || fileName || 'main.py', node.lineStart!, node.lineEnd || node.lineStart!)}
                      className="w-full py-1.5 px-2 bg-[#252526] hover:bg-[#2e2e30] border border-[#3c3c3c] text-white rounded text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <FileCode size={12} className="text-[#007acc]" />
                      <span>Jump to Editor</span>
                    </button>
                  )}
                  <button
                    onClick={() => setActiveTab('tutor')}
                    className="w-full py-1.5 px-2 bg-[#0e639c] hover:bg-[#1177bb] text-white rounded text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                  >
                    <Bot size={12} />
                    <span>Ask Agentic Tutor</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ══════════ TAB 2: CODE PREVIEW ══════════ */}
          {activeTab === 'code' && (
            <div className="flex-1 flex flex-col p-3 overflow-hidden">
              <div className="flex items-center justify-between pb-2 border-b border-[#2b2b2b] shrink-0 text-xs">
                <div className="flex items-center gap-2">
                  <FileCode size={13} className="text-[#007acc]" />
                  <span className="font-mono text-[#cccccc]">{node.file || fileName || 'Source File'}</span>
                  {lineLabel && <span className="font-mono text-[#007acc]">· Lines {lineLabel}</span>}
                </div>
                {lineLabel && onNavigateToCode && (
                  <button
                    onClick={() => onNavigateToCode(node.file || fileName || 'main.py', node.lineStart!, node.lineEnd || node.lineStart!)}
                    className="flex items-center gap-1 px-2 py-0.5 bg-[#252526] hover:bg-[#2e2e30] border border-[#3c3c3c] text-white rounded text-xs transition-colors cursor-pointer"
                  >
                    <ExternalLink size={11} />
                    <span>Open in Monaco Editor</span>
                  </button>
                )}
              </div>

              <div className="flex-1 overflow-y-auto mt-2 bg-[#181818] border border-[#333333] rounded font-mono text-xs ide-scrollbar">
                {codeSnippetLines ? (
                  <div className="p-2 space-y-0.5">
                    {codeSnippetLines.map(({ lineNum, text, isTarget }) => (
                      <div
                        key={lineNum}
                        className={`flex items-start px-2 py-0.5 rounded ${
                          isTarget ? 'bg-[#094771]/35 border-l-2 border-[#007acc] text-white font-semibold' : 'text-[#858585]'
                        }`}
                      >
                        <span className="w-8 shrink-0 select-none text-right pr-3 text-[#555555] text-[11px]">
                          {lineNum}
                        </span>
                        <span className="whitespace-pre overflow-x-auto text-[#d4d4d4]">
                          {text || ' '}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-[#858585] text-center">
                    <p>Source file content is not loaded in editor.</p>
                    <pre className="mt-2 text-left bg-[#1e1e1e] p-2 rounded text-[#cccccc] inline-block">
                      {label}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ══════════ TAB 3: FLOW & BRANCHES ══════════ */}
          {activeTab === 'flow' && (
            <div className="flex-1 flex flex-col sm:flex-row overflow-hidden divide-y sm:divide-y-0 sm:divide-x divide-[#2b2b2b] p-3 gap-3">
              {/* Decision / Loop Condition Branch Panel */}
              {(isDecision || isLoop) && (
                <div className="w-full sm:w-[280px] bg-[#252526] p-2.5 rounded border border-[#333333] shrink-0 flex flex-col justify-between">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-[#858585] mb-2 flex items-center gap-1.5">
                      <GitBranch size={12} className="text-[#cca700]" />
                      <span>{isDecision ? 'Condition Branch Paths' : 'Loop Iteration'}</span>
                    </div>

                    {isDecision && (
                      <div className="space-y-2 text-xs">
                        {yesBranch ? (
                          <div
                            onClick={() => {
                              const targetNode = getNodeObj(yesBranch.target);
                              if (targetNode && onSelectNode) onSelectNode(targetNode);
                            }}
                            className="p-2 rounded bg-[#064e3b]/30 border border-[#059669]/50 hover:border-[#34d399] cursor-pointer transition-colors group"
                          >
                            <div className="flex items-center justify-between text-[10px] font-bold text-[#34d399] uppercase mb-1">
                              <span>TRUE / YES PATH</span>
                              <ArrowRight size={11} className="group-hover:translate-x-0.5 transition-transform" />
                            </div>
                            <div className="font-mono text-white text-[11px] truncate">
                              {truncate(getNodeLabel(yesBranch.target), 32)}
                            </div>
                          </div>
                        ) : (
                          <div className="text-[11px] text-[#858585] italic">No TRUE branch target</div>
                        )}

                        {noBranch ? (
                          <div
                            onClick={() => {
                              const targetNode = getNodeObj(noBranch.target);
                              if (targetNode && onSelectNode) onSelectNode(targetNode);
                            }}
                            className="p-2 rounded bg-[#450a0a]/30 border border-[#dc2626]/50 hover:border-[#f87171] cursor-pointer transition-colors group"
                          >
                            <div className="flex items-center justify-between text-[10px] font-bold text-[#f87171] uppercase mb-1">
                              <span>FALSE / NO PATH</span>
                              <ArrowRight size={11} className="group-hover:translate-x-0.5 transition-transform" />
                            </div>
                            <div className="font-mono text-white text-[11px] truncate">
                              {truncate(getNodeLabel(noBranch.target), 32)}
                            </div>
                          </div>
                        ) : (
                          <div className="text-[11px] text-[#858585] italic">No FALSE branch target</div>
                        )}
                      </div>
                    )}

                    {isLoop && (
                      <div className="text-xs text-[#cccccc] space-y-2">
                        <div className="p-2 rounded bg-[#1e1b4b]/40 border border-[#818cf8]/40">
                          <span className="text-[10px] font-bold text-[#818cf8] uppercase block mb-1">LOOP CONTINUATION</span>
                          <span className="font-mono text-[11px] text-white">{label}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="text-[10px] text-[#858585] pt-2 border-t border-[#333333]">
                    Click any branch card above to navigate to that node.
                  </div>
                </div>
              )}

              {/* Predecessors & Successors Lists */}
              <div className="flex-1 flex flex-col sm:flex-row gap-3 overflow-hidden">
                {/* Incoming Predecessors */}
                <div className="flex-1 bg-[#212122] p-2.5 rounded border border-[#2b2b2b] flex flex-col min-h-0">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#858585] mb-1.5 flex items-center gap-1 shrink-0">
                    <ArrowLeft size={11} />
                    <span>Incoming Predecessors ({incoming.length})</span>
                  </div>
                  <div className="flex-1 overflow-y-auto ide-scrollbar space-y-1">
                    {incoming.length === 0 ? (
                      <span className="text-xs text-[#6e7681] italic">Root / Entry node (No predecessors)</span>
                    ) : (
                      incoming.map(e => {
                        const srcNode = getNodeObj(e.source);
                        return (
                          <button
                            key={e.id}
                            type="button"
                            onClick={() => srcNode && onSelectNode?.(srcNode)}
                            className="w-full text-left p-1.5 rounded bg-[#181818] hover:bg-[#282828] border border-[#333333] hover:border-[#007acc] text-xs font-mono text-[#cccccc] flex items-center justify-between group transition-colors cursor-pointer"
                          >
                            <div className="truncate flex-1">
                              <span className="text-[#858585] mr-1.5 text-[10px]">from</span>
                              <span className="text-[#75beff] font-semibold">{truncate(getNodeLabel(e.source), 26)}</span>
                            </div>
                            <ArrowRight size={10} className="text-[#858585] group-hover:text-white shrink-0 ml-1" />
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Outgoing Successors */}
                <div className="flex-1 bg-[#212122] p-2.5 rounded border border-[#2b2b2b] flex flex-col min-h-0">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#858585] mb-1.5 flex items-center gap-1 shrink-0">
                    <ArrowRight size={11} />
                    <span>Outgoing Successors ({outgoing.length})</span>
                  </div>
                  <div className="flex-1 overflow-y-auto ide-scrollbar space-y-1">
                    {outgoing.length === 0 ? (
                      <span className="text-xs text-[#6e7681] italic">Leaf / Terminal node (No successors)</span>
                    ) : (
                      outgoing.map(e => {
                        const targetNode = getNodeObj(e.target);
                        return (
                          <button
                            key={e.id}
                            type="button"
                            onClick={() => targetNode && onSelectNode?.(targetNode)}
                            className="w-full text-left p-1.5 rounded bg-[#181818] hover:bg-[#282828] border border-[#333333] hover:border-[#007acc] text-xs font-mono text-[#cccccc] flex items-center justify-between group transition-colors cursor-pointer"
                          >
                            <div className="truncate flex-1 flex items-center gap-1">
                              {e.label && (
                                <span className={`text-[9px] font-bold px-1 rounded ${
                                  e.label === 'YES' ? 'text-[#34d399] bg-[#064e3b]' :
                                  e.label === 'NO' ? 'text-[#f87171] bg-[#450a0a]' : 'text-[#75beff]'
                                }`}>
                                  {e.label}
                                </span>
                              )}
                              <span className="text-[#858585] text-[10px]">to</span>
                              <span className="text-[#75beff] font-semibold">{truncate(getNodeLabel(e.target), 24)}</span>
                            </div>
                            <ArrowRight size={10} className="text-[#858585] group-hover:text-white shrink-0 ml-1" />
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ══════════ TAB 4: AGENTIC TUTOR ══════════ */}
          {activeTab === 'tutor' && (
            <div className="flex-1 flex flex-col sm:flex-row overflow-hidden divide-y sm:divide-y-0 sm:divide-x divide-[#2b2b2b]">
              {/* Left Column: Suggested Prompt Chips */}
              <div className="w-full sm:w-[240px] p-2.5 bg-[#212122] flex flex-col justify-between shrink-0 overflow-y-auto ide-scrollbar">
                <div>
                  <div className="text-[10px] uppercase font-bold tracking-wider text-[#858585] flex items-center gap-1 mb-2">
                    <Sparkles size={11} className="text-[#007acc]" />
                    <span>Suggested Inquiries</span>
                  </div>
                  <div className="space-y-1.5">
                    {suggestedPrompts.map((p, i) => (
                      <button
                        key={i}
                        disabled={isLoading}
                        onClick={() => handleAsk(p)}
                        className="w-full text-left p-1.5 rounded bg-[#181818] hover:bg-[#282828] border border-[#333333] hover:border-[#007acc] text-[11px] text-[#cccccc] hover:text-white transition-colors cursor-pointer flex items-center justify-between group disabled:opacity-50"
                      >
                        <span className="truncate flex-1">{p}</span>
                        <ArrowRight size={10} className="text-[#858585] group-hover:text-white shrink-0 ml-1" />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-[#2b2b2b] text-[10px] text-[#858585]">
                  AI Tutor reasons over active AST and CFG traces.
                </div>
              </div>

              {/* Right Column: Chat History & Input */}
              <div className="flex-1 flex flex-col min-w-0 bg-[#1e1e1e] overflow-hidden">
                <div className="flex-1 overflow-y-auto p-3 space-y-2 ide-scrollbar min-h-0">
                  {messages.map(msg => {
                    const isUser = msg.role === 'user';
                    return (
                      <div
                        key={msg.id}
                        className={`flex items-start gap-2 w-full ${isUser ? 'justify-end' : 'justify-start'}`}
                      >
                        {!isUser && (
                          <div className="w-5 h-5 rounded bg-[#0e639c] text-white flex items-center justify-center shrink-0 mt-0.5">
                            <Bot size={12} />
                          </div>
                        )}
                        <div className={`flex flex-col ${isUser ? 'items-end max-w-[85%]' : 'flex-1 max-w-[92%]'}`}>
                          <div
                            className={`p-2 rounded text-xs leading-relaxed ${
                              isUser
                                ? 'bg-[#0e639c] text-white'
                                : 'bg-[#252526] border border-[#333333] text-[#cccccc]'
                            }`}
                          >
                            <div className="prose prose-invert prose-xs max-w-none break-words select-text">
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {msg.content}
                              </ReactMarkdown>
                            </div>

                            {/* Tools Used badge */}
                            {msg.toolsUsed && msg.toolsUsed.length > 0 && (
                              <div className="mt-1.5 pt-1 border-t border-[#333333] flex items-center gap-1 flex-wrap">
                                <span className="text-[9px] uppercase font-bold text-[#858585]">Tools:</span>
                                {msg.toolsUsed.map(t => (
                                  <span key={t} className="text-[9px] font-mono px-1 py-0.2 bg-[#1e1e1e] text-[#75beff] rounded border border-[#3c3c3c]">
                                    {t}
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* Evidence Citations */}
                            {msg.evidence && msg.evidence.length > 0 && (
                              <div className="mt-1 flex gap-1 flex-wrap">
                                {msg.evidence.map((ev, idx) =>
                                  ev.lineStart ? (
                                    <button
                                      key={idx}
                                      onClick={() => onNavigateToCode?.(node.file || fileName || 'main.py', ev.lineStart!, ev.lineEnd || ev.lineStart!)}
                                      className="text-[10px] text-[#007acc] hover:underline flex items-center gap-0.5 bg-[#1e1e1e] px-1.5 py-0.2 rounded border border-[#3c3c3c] cursor-pointer"
                                    >
                                      <MapPin size={9} />
                                      <span>Line {ev.lineStart}</span>
                                    </button>
                                  ) : null
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {isLoading && (
                    <div className="flex items-center gap-2 p-2 bg-[#252526] border border-[#333333] rounded text-xs text-[#007acc]">
                      <Loader2 size={12} className="animate-spin text-[#007acc]" />
                      <span>Reasoning over control flow graph…</span>
                    </div>
                  )}

                  {error && (
                    <div className="p-2 bg-red-950/30 border border-red-800/40 rounded text-red-300 text-xs flex items-center gap-1.5">
                      <AlertCircle size={12} className="shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div ref={chatBottomRef} />
                </div>

                {/* Input Bar */}
                <div className="p-2 bg-[#252526] border-t border-[#2b2b2b] shrink-0">
                  <form
                    onSubmit={e => {
                      e.preventDefault();
                      handleAsk();
                    }}
                    className="flex items-center gap-1.5 bg-[#1e1e1e] border border-[#3c3c3c] focus-within:border-[#007acc] rounded px-2 py-1 transition-colors"
                  >
                    <input
                      type="text"
                      value={question}
                      onChange={e => setQuestion(e.target.value)}
                      placeholder="Ask tutor about this node (control flow, variables, edge cases)..."
                      disabled={isLoading}
                      className="flex-1 bg-transparent text-xs text-[#cccccc] placeholder-[#6e7681] focus:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={isLoading || !question.trim()}
                      className="w-6 h-6 rounded bg-[#0e639c] hover:bg-[#1177bb] disabled:opacity-40 text-white flex items-center justify-center shrink-0 cursor-pointer transition-colors"
                      aria-label="Send question"
                    >
                      <ArrowUp size={13} />
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
=======
      className="absolute right-0 top-0 h-full w-[360px] sm:w-[390px] z-50 flex flex-col
                 bg-[#161b22] border-l border-[#30363d] shadow-2xl overflow-hidden"
      style={{ borderLeft: `3px solid ${meta.color}` }}
    >
      {/* ── Top Header with Tabs & Close ── */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#30363d]"
           style={{ backgroundColor: meta.bg }}>
        <div className="flex items-center gap-2">
          <span style={{ color: meta.color }}>{meta.icon}</span>
          <span className="text-xs font-bold uppercase tracking-wider"
                style={{ color: meta.color }}>
            {node.type}
          </span>
          <span className="text-[10px] text-[#8b949e] font-mono px-1.5 py-0.5 rounded bg-[#0d1117]/60">
            {node.id}
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded text-[#7d8590] hover:text-white hover:bg-[#30363d]
                     transition-colors"
          aria-label="Close details"
        >
          <X size={14} />
        </button>
      </div>

      {/* ── Sub Navigation Tabs (Tutor vs Graph Details) ── */}
      <div className="flex items-center border-b border-[#30363d] bg-[#0d1117] text-xs">
        <button
          onClick={() => setActiveTab('tutor')}
          className={`flex-1 py-2 flex items-center justify-center gap-1.5 font-semibold transition-colors border-b-2 ${
            activeTab === 'tutor'
              ? 'border-[#58a6ff] text-[#58a6ff] bg-[#161b22]'
              : 'border-transparent text-[#7d8590] hover:text-[#c9d1d9]'
          }`}
        >
          <Bot size={13} />
          <span>Agentic Tutor</span>
        </button>
        <button
          onClick={() => setActiveTab('info')}
          className={`flex-1 py-2 flex items-center justify-center gap-1.5 font-semibold transition-colors border-b-2 ${
            activeTab === 'info'
              ? 'border-[#58a6ff] text-[#58a6ff] bg-[#161b22]'
              : 'border-transparent text-[#7d8590] hover:text-[#c9d1d9]'
          }`}
        >
          <Code2 size={13} />
          <span>Node Details</span>
        </button>
      </div>

      {/* ── Scrollable Body ── */}
      <div className="flex-1 overflow-y-auto flex flex-col">
        {activeTab === 'tutor' ? (
          /* ══════════ AGENTIC TUTOR TAB ══════════ */
          <div className="flex-1 flex flex-col justify-between p-3">
            {/* Messages Thread */}
            <div className="space-y-3 mb-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-2.5 rounded-lg text-xs leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-[#1f6feb]/20 border border-[#1f6feb]/40 text-[#e6edf3] ml-4'
                      : 'bg-[#0d1117] border border-[#30363d] text-[#c9d1d9] mr-2'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1 text-[10px] text-[#7d8590]">
                    <span className="font-semibold flex items-center gap-1">
                      {msg.role === 'user' ? 'Student' : <><Bot size={11} className="text-[#58a6ff]" /> CodeMind Tutor</>}
                    </span>
                    <span>{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>

                  {/* Message Markdown */}
                  <div className="prose prose-invert prose-xs max-w-none text-[#e6edf3] break-words">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.content}
                    </ReactMarkdown>
                  </div>

                  {/* Tools used pill badges */}
                  {msg.toolsUsed && msg.toolsUsed.length > 0 && (
                    <div className="mt-2 pt-1.5 border-t border-[#30363d]/60 flex flex-wrap items-center gap-1">
                      <span className="text-[9px] uppercase tracking-wider text-[#7d8590] font-semibold">Tools:</span>
                      {msg.toolsUsed.map((tool) => (
                        <span
                          key={tool}
                          className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#21262d] text-[#58a6ff] border border-[#30363d] flex items-center gap-1"
                        >
                          <Terminal size={9} />
                          {tool}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Evidence citations */}
                  {msg.evidence && msg.evidence.length > 0 && (
                    <div className="mt-1.5 space-y-1">
                      {msg.evidence.map((ev, i) => (
                        ev.lineStart ? (
                          <button
                            key={i}
                            onClick={() => onNavigateToCode && onNavigateToCode(node.file || fileName || 'main.py', ev.lineStart!, ev.lineEnd || ev.lineStart!)}
                            className="text-[10px] text-[#58a6ff] hover:underline flex items-center gap-1 bg-[#1f6feb]/10 px-1.5 py-0.5 rounded border border-[#1f6feb]/20"
                          >
                            <MapPin size={10} />
                            <span>Jump to evidence: Line {ev.lineStart}{ev.lineEnd && ev.lineEnd !== ev.lineStart ? `–${ev.lineEnd}` : ''}</span>
                          </button>
                        ) : null
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="p-3 bg-[#0d1117] border border-[#30363d] rounded-lg text-xs flex items-center gap-2 text-[#58a6ff]">
                  <Loader2 size={14} className="animate-spin text-[#58a6ff]" />
                  <span>Agentic Tutor inspecting graph & reasoning with tools...</span>
                </div>
              )}

              {error && (
                <div className="p-2 bg-red-950/30 border border-red-800/40 rounded text-red-300 text-xs flex items-center gap-1.5">
                  <AlertCircle size={13} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div ref={chatBottomRef} />
            </div>

            {/* Quick Suggestions & Input */}
            <div className="border-t border-[#30363d] pt-2 mt-auto">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-[#7d8590] mb-1.5 flex items-center gap-1">
                <Sparkles size={10} className="text-[#f59e0b]" />
                <span>Suggested Questions for {node.id}:</span>
              </div>
              <div className="flex flex-wrap gap-1 mb-2">
                {getSuggestedPrompts().map((p, idx) => (
                  <button
                    key={idx}
                    disabled={isLoading}
                    onClick={() => handleAsk(p)}
                    className="text-[10px] text-[#c9d1d9] bg-[#21262d] hover:bg-[#30363d] hover:text-white px-2 py-1 rounded transition-colors border border-[#30363d]/80 text-left disabled:opacity-50"
                  >
                    {p}
                  </button>
                ))}
              </div>

              {/* Chat Input */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAsk();
                }}
                className="flex items-center gap-1.5"
              >
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Ask tutor about this node..."
                  disabled={isLoading}
                  className="flex-1 bg-[#0d1117] border border-[#30363d] rounded px-2.5 py-1.5 text-xs text-[#e6edf3] placeholder-[#7d8590] focus:outline-none focus:border-[#58a6ff]"
                />
                <button
                  type="submit"
                  disabled={isLoading || !question.trim()}
                  className="px-2.5 py-1.5 bg-[#1f6feb] hover:bg-[#388bfd] disabled:opacity-50 text-white rounded transition-colors flex items-center justify-center shrink-0"
                  aria-label="Send message"
                >
                  {isLoading ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                </button>
              </form>
            </div>
          </div>
        ) : (
          /* ══════════ GRAPH NODE DETAILS TAB ══════════ */
          <div className="text-sm">
            {/* Type explanation */}
            <div className="px-4 py-3 border-b border-[#30363d]/50 bg-[#0d1117]/40">
              <p className="text-[12px] text-[#8b949e] leading-relaxed">{meta.explanation}</p>
            </div>

            {/* Label / Statement */}
            <div className="px-4 py-3 border-b border-[#30363d]/50">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-[#7d8590] mb-1.5">
                {node.type === 'DECISION' ? 'Condition' : node.type === 'LOOP' ? 'Loop Condition' : 'Statement'}
              </div>
              <pre className="text-[12px] font-mono text-[#e6edf3] bg-[#0d1117] rounded-md
                              px-3 py-2 overflow-x-auto border border-[#30363d] leading-relaxed
                              whitespace-pre-wrap break-words">
                {label}
              </pre>
            </div>

            {/* Decision branches */}
            {isDecision && (yesBranch || noBranch) && (
              <div className="px-4 py-3 border-b border-[#30363d]/50">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-[#7d8590] mb-2">
                  Branches
                </div>
                {yesBranch && (
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/40
                                     px-2 py-0.5 rounded border border-emerald-800/40">YES</span>
                    <ArrowRight size={11} className="text-[#7d8590]" />
                    <span className="text-[12px] font-mono text-[#c9d1d9] truncate">
                      {truncate(getNodeLabel(yesBranch.target), 28)}
                    </span>
                  </div>
                )}
                {noBranch && (
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-rose-400 bg-rose-950/40
                                     px-2 py-0.5 rounded border border-rose-800/40">NO</span>
                    <ArrowRight size={11} className="text-[#7d8590]" />
                    <span className="text-[12px] font-mono text-[#c9d1d9] truncate">
                      {truncate(getNodeLabel(noBranch.target), 28)}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Source location */}
            {(node.file || lineLabel) && (
              <div className="px-4 py-3 border-b border-[#30363d]/50">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-[#7d8590] mb-2">
                  Source Location
                </div>
                {node.file && (
                  <div className="flex items-center gap-2 mb-1">
                    <FileCode size={12} className="text-[#7d8590] shrink-0" />
                    <span className="text-[12px] font-mono text-[#58a6ff] truncate">{node.file}</span>
                  </div>
                )}
                {lineLabel && (
                  <div className="flex items-center gap-2">
                    <MapPin size={12} className="text-[#7d8590] shrink-0" />
                    <span className="text-[12px] text-[#c9d1d9]">Line {lineLabel}</span>
                  </div>
                )}
                {node.file && node.lineStart && onNavigateToCode && (
                  <button
                    onClick={() => onNavigateToCode(node.file!, node.lineStart!, node.lineEnd)}
                    className="mt-2 w-full text-[11px] font-semibold px-3 py-1.5 rounded
                               bg-[#1f6feb]/15 hover:bg-[#1f6feb]/30 text-[#58a6ff]
                               border border-[#1f6feb]/30 transition-colors flex items-center
                               justify-center gap-1.5"
                  >
                    <MapPin size={11} />
                    Jump to Source
                  </button>
                )}
              </div>
            )}

            {/* Connections */}
            {incoming.length > 0 && (
              <div className="px-4 py-3 border-b border-[#30363d]/50">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-[#7d8590] mb-2">
                  Incoming ({incoming.length})
                </div>
                <div className="space-y-1">
                  {incoming.slice(0, 5).map(e => (
                    <div key={e.id} className="flex items-center gap-2">
                      <ArrowLeft size={10} className="text-[#7d8590] shrink-0" />
                      {e.label && (
                        <span className="text-[9px] font-bold px-1.5 rounded"
                              style={{ color: edgeLabelColor(e.label), backgroundColor: `${edgeLabelColor(e.label)}22` }}>
                          {e.label}
                        </span>
                      )}
                      <span className="text-[11px] font-mono text-[#8b949e] truncate">
                        {truncate(getNodeLabel(e.source), 24)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {outgoing.length > 0 && (
              <div className="px-4 py-3 border-b border-[#30363d]/50">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-[#7d8590] mb-2">
                  Outgoing ({outgoing.length})
                </div>
                <div className="space-y-1">
                  {outgoing.slice(0, 5).map(e => (
                    <div key={e.id} className="flex items-center gap-2">
                      <ArrowRight size={10} className="text-[#7d8590] shrink-0" />
                      {e.label && (
                        <span className="text-[9px] font-bold px-1.5 rounded"
                              style={{ color: edgeLabelColor(e.label), backgroundColor: `${edgeLabelColor(e.label)}22` }}>
                          {e.label}
                        </span>
                      )}
                      <span className="text-[11px] font-mono text-[#8b949e] truncate">
                        {truncate(getNodeLabel(e.target), 24)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Switch to Tutor Button */}
            <div className="p-4">
              <button
                onClick={() => setActiveTab('tutor')}
                className="w-full py-2 bg-gradient-to-r from-purple-600/30 to-blue-600/30 hover:from-purple-600/40 hover:to-blue-600/40 border border-[#58a6ff]/40 text-[#58a6ff] rounded text-xs font-semibold flex items-center justify-center gap-2 transition-all"
              >
                <Bot size={14} />
                Ask Agentic Tutor about this node
              </button>
            </div>
          </div>
        )}
      </div>
>>>>>>> 1fedef5cdf2fa8631c20411f700509b8bbdcb0e2
    </div>
  );
}
