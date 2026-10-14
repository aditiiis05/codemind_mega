'use client';

import { Send, Loader, Copy, Bot, Terminal, MapPin, Sparkles, X } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// @ts-expect-error - react-syntax-highlighter does not provide types in this project
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
// @ts-expect-error - style file does not provide types in this project
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';

import axios from 'axios';
import { FlowNode } from '@/types/flowchart';
import { askTutor, TutorEvidence } from '@/services/tutorApi';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  toolsUsed?: string[];
  evidence?: TutorEvidence[];
  timestamp: Date;
}

interface AIChatViewProps {
  selectedNode?: FlowNode | null;
  code?: string | null;
  fileName?: string | null;
  language?: string | null;
  sessionId?: string | null;
  onClearSelectedNode?: () => void;
  onNavigateToCode?: (file: string, lineStart: number, lineEnd?: number) => void;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

export default function AIChatView({
  selectedNode = null,
  code = '',
  fileName = 'main.py',
  language = 'python',
  sessionId = null,
  onClearSelectedNode,
  onNavigateToCode
}: AIChatViewProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hi! I'm your CodeMind AI assistant. Ask me anything about your code, or select a node in the flowchart to ask specific questions about control flow and program logic.",
      timestamp: new Date(),
    }
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (customText?: string) => {
    const textToSend = (customText || input).trim();
    if (!textToSend || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSend,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const conversationHistory = messages.map(m => ({
        role: m.role,
        content: m.content,
      }));

      // If a node is selected, route through the Agentic Tutor!
      if (selectedNode) {
        const tutorResponse = await askTutor({
          question: textToSend,
          node_id: selectedNode.id,
          session_id: sessionId,
          code: code || '',
          fileName: selectedNode.file || fileName || 'main.py',
          language: language || 'python',
          conversationHistory
        });

        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: tutorResponse.answer || "I couldn't generate an explanation.",
          toolsUsed: tutorResponse.tools_used || [],
          evidence: tutorResponse.evidence || [],
          timestamp: new Date(),
        };

        setMessages(prev => [...prev, assistantMessage]);
      } else {
        // General AI chat
        const response = await axios.post(`${API_BASE_URL}/api/ai/chat`, {
          message: textToSend,
          conversationHistory,
        });

        const assistantText = response.data?.response || "I couldn't generate a response.";

        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: assistantText,
          timestamp: new Date(),
        };

        setMessages(prev => [...prev, assistantMessage]);
      }

    } catch (_err) { // eslint-disable-line @typescript-eslint/no-unused-vars
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString() + 3,
          role: 'assistant',
          content: "❗ AI service error. Please make sure the backend server and Ollama are running.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] text-[#cccccc] text-xs">
      {/* Selected Node Context Banner */}
      {selectedNode && (
        <div className="px-3 py-2 bg-[#161b22] border-b border-[#30363d] flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 overflow-hidden">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 animate-pulse" />
            <span className="font-semibold text-[#58a6ff] shrink-0">Selected Node:</span>
            <span className="font-mono text-[#c9d1d9] truncate">
              {selectedNode.id} ({selectedNode.type})
            </span>
          </div>
          {onClearSelectedNode && (
            <button
              onClick={onClearSelectedNode}
              className="p-1 hover:text-white text-[#7d8590]"
              title="Clear node selection"
            >
              <X size={12} />
            </button>
          )}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`p-2.5 rounded-lg leading-relaxed ${
              m.role === 'user'
                ? 'bg-[#007acc]/20 border border-[#007acc]/40 text-[#ffffff] ml-4'
                : 'bg-[#252526] border border-[#3c3c3c] text-[#cccccc] mr-2'
            }`}
          >
            <div className="flex items-center justify-between mb-1 text-[10px] text-[#888888]">
              <span className="font-semibold flex items-center gap-1">
                {m.role === 'user' ? 'You' : <><Bot size={11} className="text-[#007acc]" /> CodeMind AI</>}
              </span>
              <span>{m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>

            <div className="prose prose-invert prose-xs max-w-none text-[#cccccc] break-words">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  code({ inline, className, children, ...props }: any) {
                    const match = /language-(\w+)/.exec(className || '');
                    const codeString = String(children).replace(/\n$/, '');

                    return !inline && match ? (
                      <div className="relative my-2">
                        <button
                          onClick={() => copyToClipboard(codeString)}
                          className="absolute right-2 top-2 p-1 rounded bg-[#333333] hover:bg-[#444444] text-[#aaaaaa]"
                          title="Copy Code"
                        >
                          <Copy size={11} />
                        </button>
                        <SyntaxHighlighter
                          style={oneDark}
                          language={match[1]}
                          PreTag="div"
                          customStyle={{
                            margin: 0,
                            borderRadius: '6px',
                            background: '#161b22',
                            fontSize: '11px',
                          }}
                          {...props}
                        >
                          {codeString}
                        </SyntaxHighlighter>
                      </div>
                    ) : (
                      <code className="bg-[#2d2d2d] px-1 py-0.5 rounded font-mono text-[11px]" {...props}>
                        {children}
                      </code>
                    );
                  },
                }}
              >
                {m.content}
              </ReactMarkdown>
            </div>

            {/* Tools used pill badges */}
            {m.toolsUsed && m.toolsUsed.length > 0 && (
              <div className="mt-2 pt-1.5 border-t border-[#3c3c3c] flex flex-wrap items-center gap-1">
                <span className="text-[9px] uppercase tracking-wider text-[#888888] font-semibold">Tools:</span>
                {m.toolsUsed.map((tool) => (
                  <span
                    key={tool}
                    className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#1e1e1e] text-[#58a6ff] border border-[#3c3c3c] flex items-center gap-1"
                  >
                    <Terminal size={9} />
                    {tool}
                  </span>
                ))}
              </div>
            )}

            {/* Evidence citations */}
            {m.evidence && m.evidence.length > 0 && (
              <div className="mt-1.5 space-y-1">
                {m.evidence.map((ev, i) => (
                  ev.lineStart ? (
                    <button
                      key={i}
                      onClick={() => onNavigateToCode && onNavigateToCode(fileName || 'main.py', ev.lineStart!, ev.lineEnd || ev.lineStart!)}
                      className="text-[10px] text-[#58a6ff] hover:underline flex items-center gap-1 bg-[#1f6feb]/10 px-1.5 py-0.5 rounded border border-[#1f6feb]/20"
                    >
                      <MapPin size={10} />
                      <span>Line {ev.lineStart}{ev.lineEnd && ev.lineEnd !== ev.lineStart ? `–${ev.lineEnd}` : ''}</span>
                    </button>
                  ) : null
                ))}
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="p-2.5 bg-[#252526] border border-[#3c3c3c] rounded text-xs flex items-center gap-2 text-[#007acc]">
            <Loader size={13} className="animate-spin" />
            <span>{selectedNode ? 'Agentic Tutor reasoning with graph tools...' : 'AI thinking...'}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested quick chip if node is selected */}
      {selectedNode && (
        <div className="px-3 py-1.5 border-t border-[#3c3c3c] bg-[#161b22] flex items-center gap-1.5 overflow-x-auto">
          <Sparkles size={11} className="text-[#f59e0b] shrink-0" />
          <button
            onClick={() => handleSend(`Explain node ${selectedNode.id}: why does this step exist in the control flow?`)}
            disabled={isLoading}
            className="text-[10px] text-[#58a6ff] hover:bg-[#21262d] px-2 py-0.5 rounded border border-[#30363d] truncate disabled:opacity-50"
          >
            Explain {selectedNode.id}
          </button>
          {selectedNode.type === 'DECISION' && (
            <button
              onClick={() => handleSend(`Why does condition ${selectedNode.id} have two branches?`)}
              disabled={isLoading}
              className="text-[10px] text-[#58a6ff] hover:bg-[#21262d] px-2 py-0.5 rounded border border-[#30363d] truncate disabled:opacity-50"
            >
              Why 2 branches?
            </button>
          )}
        </div>
      )}

      {/* Input */}
      <div className="p-2.5 border-t border-[#3c3c3c] bg-[#1e1e1e] flex gap-1.5">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder={selectedNode ? `Ask about node ${selectedNode.id}...` : "Ask AI assistant..."}
          disabled={isLoading}
          className="flex-1 bg-[#2d2d2d] border border-[#3c3c3c] rounded px-2.5 py-1.5 text-xs text-[#ffffff] focus:outline-none focus:border-[#007acc] placeholder-[#888888]"
        />
        <button
          onClick={() => handleSend()}
          disabled={isLoading || !input.trim()}
          className="px-3 py-1.5 bg-[#007acc] hover:bg-[#0098ff] disabled:opacity-50 text-white rounded transition-colors flex items-center justify-center shrink-0"
        >
          <Send size={13} />
        </button>
      </div>
    </div>
  );
}
