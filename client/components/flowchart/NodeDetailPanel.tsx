// client/components/flowchart/NodeDetailPanel.tsx
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

export default function NodeDetailPanel({
  node,
  allEdges,
  allNodes,
  code = '',
  fileName = 'main.py',
  language = 'python',
  sessionId = null,
  onClose,
  onNavigateToCode
}: NodeDetailPanelProps) {
  const [activeTab, setActiveTab] = useState<'info' | 'tutor'>('tutor');
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Reset or initialize tutor greeting when node changes
  useEffect(() => {
    if (!node) return;
    setMessages([
      {
        id: `init_${node.id}`,
        role: 'assistant',
        content: `👋 I'm your **Agentic Tutor**! I can inspect node \`${node.id}\` (\`${cleanLabel(node.label)}\`), examine its branches, trace execution, and explain why the code behaves this way.`,
        timestamp: new Date()
      }
    ]);
    setError(null);
  }, [node?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!node) return null;

  const meta = getTypeMeta(node.type);
  const label = cleanLabel(node.label || '');
  const lineLabel = node.lineStart
    ? (node.lineEnd && node.lineEnd !== node.lineStart
        ? `${node.lineStart} – ${node.lineEnd}`
        : `${node.lineStart}`)
    : null;

  // Collect incoming / outgoing edges
  const incoming = allEdges.filter(e => e.target === node.id);
  const outgoing = allEdges.filter(e => e.source === node.id);

  const getNodeLabel = (id: string) =>
    allNodes.find(n => n.id === id)?.label?.replace(/^def\s+/, '') ?? id;

  const isDecision = node.type === 'DECISION';
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
      ];
    }
    if (node.type === 'FUNCTION') {
      return [
        'What functions call this?',
        'Explain what this function does',
        'Show function call relationships'
      ];
    }
    return [
      'Explain what this statement does',
      'How does control flow reach this node?',
      'Trace code execution'
    ];
  };

  // Submit question to Agentic Tutor API
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
      console.error('[NodeDetailPanel Tutor Error]:', err);
      const errText = err instanceof Error ? err.message : 'Unable to connect to tutor service.';
      setError(errText);
      setMessages(prev => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          role: 'assistant',
          content: `⚠️ **Tutor Service Notice**: ${errText}\n\nMake sure the CodeMind backend is running on port 4000 and Ollama is configured.`,
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
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
    </div>
  );
}
