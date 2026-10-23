'use client';

// client/components/ai/CodeExplanationPanel.tsx
// Text-only code explanation panel.
// Calls explainCode() from explainApi.ts. Supports EN/HI languages and
// concise/detailed explanation modes. Includes a copy button.

import { useState, useMemo, useEffect } from 'react';
import { Loader2, AlertCircle, Copy, Check, Languages } from 'lucide-react';
import { explainCode } from '@/services/explainApi';
import { EditorSelection, ExplainLanguage } from '@/types/voice';
import { FlowNode } from '@/types/flowchart';

interface CodeExplanationPanelProps {
  editorSelection?: EditorSelection | null;
  currentFile?: string | null;
  code?: string | null;
  language?: string | null;
  selectedNode?: FlowNode | null;
}

type Detail = 'concise' | 'detailed';

/** Slice an inclusive 1-based line range out of a code string. */
function sliceCodeFromLines(
  code: string | null | undefined,
  lineStart?: number,
  lineEnd?: number
): string {
  if (!code || !lineStart) return '';
  const lines = code.split('\n');
  const startIdx = Math.max(0, lineStart - 1);
  const end = lineEnd || lineStart;
  const endIdx = Math.min(lines.length, end);
  if (startIdx >= endIdx) return '';
  return lines.slice(startIdx, endIdx).join('\n');
}

export default function CodeExplanationPanel({
  editorSelection = null,
  currentFile = null,
  code = null,
  language = null,
  selectedNode = null,
}: CodeExplanationPanelProps) {
  const [explainLanguage, setExplainLanguage] = useState<ExplainLanguage>('en');
  const [detail, setDetail] = useState<Detail>('concise');
  const [explanation, setExplanation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // ── Context resolution ──────────────────────────────────────────────────
  // Empty string text is treated as "no selection" — falls through to selectedNode/file.
  const resolved = useMemo(() => {
    if (editorSelection?.text?.trim()) {
      return {
        resolvedCode: editorSelection.text,
        startLine: editorSelection.lineStart,
        endLine: editorSelection.lineEnd,
        source: 'selection' as const,
      };
    }
    if (selectedNode && selectedNode.lineStart) {
      const sliced = sliceCodeFromLines(code, selectedNode.lineStart, selectedNode.lineEnd);
      return {
        resolvedCode: sliced || code || '',
        startLine: selectedNode.lineStart,
        endLine: selectedNode.lineEnd,
        source: 'node' as const,
      };
    }
    if (code?.trim()) {
      return {
        resolvedCode: code,
        startLine: undefined,
        endLine: undefined,
        source: 'file' as const,
      };
    }
    return null;
  }, [editorSelection, selectedNode, code]);

  const hasContext = resolved !== null;

  // ── Clear stale explanation when code selection changes ─────────────────
  useEffect(() => {
    setExplanation('');
    setError(null);
    setCopied(false);
  }, [editorSelection?.text, selectedNode?.id]);

  // ── Explain handler ─────────────────────────────────────────────────────
  const handleExplain = async () => {
    if (!resolved) return;
    setIsLoading(true);
    setError(null);
    setExplanation('');

    try {
      const contextHint =
        detail === 'detailed'
          ? 'Give a detailed explanation with examples.'
          : 'Give a concise explanation.';

      const res = await explainCode({
        code: resolved.resolvedCode,
        language: language ?? undefined,
        filePath: currentFile ?? undefined,
        startLine: resolved.startLine,
        endLine: resolved.endLine,
        explainLanguage,
        nodeType: selectedNode?.type,
        nodeLabel: selectedNode?.label,
        context: contextHint,
      });
      setExplanation(res.explanation);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unable to generate explanation.');
    } finally {
      setIsLoading(false);
    }
  };

  // ── Copy handler ────────────────────────────────────────────────────────
  const handleCopy = async () => {
    if (!explanation) return;
    try {
      await navigator.clipboard.writeText(explanation);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard write failed silently
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0d1117] text-[#e6edf3] text-xs overflow-hidden">
      {/* ── Controls section ─────────────────────────────────────────────── */}
      <div className="px-3 pt-3 pb-2 shrink-0 border-b border-[#30363d] space-y-3">

        {/* Language toggle */}
        <div>
          <p className="text-[10px] uppercase tracking-widest text-[#8b949e] font-semibold mb-1.5">
            Language
          </p>
          <div className="flex items-center gap-2">
            <Languages size={12} className="text-[#8b949e] shrink-0" />
            <div className="flex bg-[#0d1117] border border-[#30363d] rounded p-0.5">
              <button
                type="button"
                onClick={() => setExplainLanguage('en')}
                aria-pressed={explainLanguage === 'en'}
                aria-label="Explain in English"
                className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                  explainLanguage === 'en'
                    ? 'bg-[#1f6feb] text-white'
                    : 'text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#21262d]'
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setExplainLanguage('hi')}
                aria-pressed={explainLanguage === 'hi'}
                aria-label="Explain in Hindi"
                className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                  explainLanguage === 'hi'
                    ? 'bg-[#1f6feb] text-white'
                    : 'text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#21262d]'
                }`}
              >
                हिन्दी
              </button>
            </div>
          </div>
        </div>

        {/* Detail toggle */}
        <div>
          <p className="text-[10px] uppercase tracking-widest text-[#8b949e] font-semibold mb-1.5">
            Detail level
          </p>
          <div className="flex bg-[#0d1117] border border-[#30363d] rounded p-0.5 w-fit">
            <button
              type="button"
              onClick={() => setDetail('concise')}
              aria-pressed={detail === 'concise'}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                detail === 'concise'
                  ? 'bg-[#1f6feb] text-white'
                  : 'text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#21262d]'
              }`}
            >
              Concise
            </button>
            <button
              type="button"
              onClick={() => setDetail('detailed')}
              aria-pressed={detail === 'detailed'}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                detail === 'detailed'
                  ? 'bg-[#1f6feb] text-white'
                  : 'text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#21262d]'
              }`}
            >
              Detailed
            </button>
          </div>
        </div>

        {/* Context summary */}
        {resolved && (
          <div className="flex flex-wrap gap-1.5 items-center">
            {currentFile && (
              <span className="font-mono text-[10px] bg-[#161b22] border border-[#30363d] rounded px-1.5 py-0.5 text-[#8b949e] truncate max-w-[12rem]">
                {currentFile}
              </span>
            )}
            {resolved.startLine != null && (
              <span className="text-[10px] bg-[#161b22] border border-[#30363d] rounded px-1.5 py-0.5 text-[#8b949e]">
                L{resolved.startLine}
                {resolved.endLine && resolved.endLine !== resolved.startLine
                  ? `–${resolved.endLine}`
                  : ''}
              </span>
            )}
            {language && (
              <span className="text-[10px] bg-[#161b22] border border-[#30363d] rounded px-1.5 py-0.5 text-[#58a6ff]">
                {language}
              </span>
            )}
            {selectedNode && (
              <span className="text-[10px] bg-[#161b22] border border-[#30363d] rounded px-1.5 py-0.5 text-[#d29922]">
                {selectedNode.type}: {selectedNode.label}
              </span>
            )}
          </div>
        )}

        {/* Explain button */}
        <button
          type="button"
          onClick={handleExplain}
          disabled={!hasContext || isLoading}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded text-[11px] font-semibold transition-colors bg-[#2f81f7] hover:bg-[#388bfd] border border-[#2f81f7] text-white disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 size={12} className="animate-spin" />
              Generating…
            </>
          ) : (
            <>
              <Languages size={12} />
              Explain Code
            </>
          )}
        </button>
      </div>

      {/* ── Explanation area ──────────────────────────────────────────────── */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {/* Empty state */}
        {!hasContext && !isLoading && !explanation && !error && (
          <p className="px-3 py-3 text-[#8b949e]">
            Select code or a flowchart node to explain.
          </p>
        )}

        {/* Loading state */}
        {isLoading && (
          <div className="px-3 py-3 flex items-center gap-2 text-[#58a6ff]">
            <Loader2 size={13} className="animate-spin" />
            <span>Generating explanation…</span>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="mx-3 mt-3 flex items-start gap-2 p-2.5 rounded bg-[#da3633]/10 border border-[#da3633]/40 text-[#f85149]">
            <AlertCircle size={13} className="shrink-0 mt-0.5" />
            <span className="break-words">{error}</span>
          </div>
        )}

        {/* Explanation text */}
        {explanation && !isLoading && (
          <div className="px-3 py-3">
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-[10px] uppercase tracking-widest text-[#8b949e] font-semibold">
                Explanation
              </p>
              <button
                type="button"
                onClick={handleCopy}
                aria-label="Copy explanation"
                className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-[#8b949e] hover:text-[#e6edf3] transition-colors"
              >
                {copied ? (
                  <>
                    <Check size={10} className="text-[#3fb950]" />
                    <span className="text-[#3fb950]">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy size={10} />
                    Copy
                  </>
                )}
              </button>
            </div>
            <pre className="whitespace-pre-wrap break-words text-[#c9d1d9] leading-relaxed p-2.5 rounded bg-[#161b22] border border-[#30363d] text-[11px]">
              {explanation}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
