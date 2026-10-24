'use client';

// client/components/ai/CodeExplanationPanel.tsx
<<<<<<< HEAD
// Visual Studio style code explanation panel.
// Flat dark aesthetics, language & depth toggles, copy button.
=======
// Text-only code explanation panel.
// Calls explainCode() from explainApi.ts. Supports EN/HI languages and
// concise/detailed explanation modes. Includes a copy button.
>>>>>>> 1fedef5cdf2fa8631c20411f700509b8bbdcb0e2

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

<<<<<<< HEAD
=======
/** Slice an inclusive 1-based line range out of a code string. */
>>>>>>> 1fedef5cdf2fa8631c20411f700509b8bbdcb0e2
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

<<<<<<< HEAD
=======
  // ── Context resolution ──────────────────────────────────────────────────
  // Empty string text is treated as "no selection" — falls through to selectedNode/file.
>>>>>>> 1fedef5cdf2fa8631c20411f700509b8bbdcb0e2
  const resolved = useMemo(() => {
    if (editorSelection?.text?.trim()) {
      return {
        resolvedCode: editorSelection.text,
        startLine: editorSelection.lineStart,
        endLine: editorSelection.lineEnd,
<<<<<<< HEAD
      };
    }
    if (editorSelection?.lineStart && code) {
      const sliced = sliceCodeFromLines(code, editorSelection.lineStart, editorSelection.lineEnd);
      if (sliced.trim()) {
        return {
          resolvedCode: sliced,
          startLine: editorSelection.lineStart,
          endLine: editorSelection.lineEnd,
        };
      }
    }
    if (selectedNode) {
      if (selectedNode.lineStart && code) {
        const sliced = sliceCodeFromLines(code, selectedNode.lineStart, selectedNode.lineEnd);
        if (sliced.trim()) {
          return {
            resolvedCode: sliced,
            startLine: selectedNode.lineStart,
            endLine: selectedNode.lineEnd,
          };
        }
      }
      return {
        resolvedCode: selectedNode.label,
        startLine: selectedNode.lineStart,
        endLine: selectedNode.lineEnd,
=======
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
>>>>>>> 1fedef5cdf2fa8631c20411f700509b8bbdcb0e2
      };
    }
    if (code?.trim()) {
      return {
        resolvedCode: code,
        startLine: undefined,
        endLine: undefined,
<<<<<<< HEAD
=======
        source: 'file' as const,
>>>>>>> 1fedef5cdf2fa8631c20411f700509b8bbdcb0e2
      };
    }
    return null;
  }, [editorSelection, selectedNode, code]);

<<<<<<< HEAD
  const hasContext = Boolean(resolved?.resolvedCode?.trim());

  useEffect(() => {
    setExplanation('');
    setError(null);
  }, [resolved?.resolvedCode, explainLanguage, detail]);

  const handleExplain = async () => {
    if (!resolved?.resolvedCode?.trim()) return;

=======
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
>>>>>>> 1fedef5cdf2fa8631c20411f700509b8bbdcb0e2
    setIsLoading(true);
    setError(null);
    setExplanation('');

    try {
<<<<<<< HEAD
      const result = await explainCode({
        code: resolved.resolvedCode,
        language: language || 'plaintext',
        filePath: currentFile || 'code',
        explainLanguage,
        nodeLabel: selectedNode?.label,
        nodeType: selectedNode?.type,
        startLine: resolved.startLine,
        endLine: resolved.endLine,
      });

      if (!result.explanation || !result.explanation.trim()) {
        setError('No explanation was returned by the service.');
        return;
      }
      setExplanation(result.explanation);
    } catch (err: unknown) {
      const e = err as {
        status?: number;
        code?: string;
        message?: string;
      };
      if (e.status === 408 || e.code === 'ECONNABORTED') {
        setError('Request timed out. Please try a smaller snippet or concise mode.');
      } else if (e.status === 400) {
        setError('Bad request. Please verify the selected code snippet.');
      } else {
        setError(e.message || 'Failed to generate explanation.');
      }
=======
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
>>>>>>> 1fedef5cdf2fa8631c20411f700509b8bbdcb0e2
    } finally {
      setIsLoading(false);
    }
  };

<<<<<<< HEAD
=======
  // ── Copy handler ────────────────────────────────────────────────────────
>>>>>>> 1fedef5cdf2fa8631c20411f700509b8bbdcb0e2
  const handleCopy = async () => {
    if (!explanation) return;
    try {
      await navigator.clipboard.writeText(explanation);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
<<<<<<< HEAD
      // ignore
=======
      // clipboard write failed silently
>>>>>>> 1fedef5cdf2fa8631c20411f700509b8bbdcb0e2
    }
  };

  return (
<<<<<<< HEAD
    <div className="flex flex-col h-full bg-[#1e1e1e] text-[#cccccc] text-xs overflow-hidden">
      {/* ── Controls Section ── */}
      <div className="p-3 shrink-0 border-b border-[#2b2b2b] bg-[#252526] space-y-3">
        {/* Language Selection */}
        <div>
          <p className="text-[10px] uppercase tracking-wider text-[#858585] font-semibold mb-1.5">
            Explanation Language
          </p>
          <div className="flex items-center gap-2">
            <Languages size={13} className="text-[#007acc] shrink-0" />
            <div className="flex bg-[#1e1e1e] border border-[#3c3c3c] rounded p-0.5 gap-1">
=======
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
>>>>>>> 1fedef5cdf2fa8631c20411f700509b8bbdcb0e2
              <button
                type="button"
                onClick={() => setExplainLanguage('en')}
                aria-pressed={explainLanguage === 'en'}
<<<<<<< HEAD
                className={`px-3 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                  explainLanguage === 'en'
                    ? 'bg-[#0e639c] text-white'
                    : 'text-[#858585] hover:text-white hover:bg-[#2a2d2e]'
=======
                aria-label="Explain in English"
                className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                  explainLanguage === 'en'
                    ? 'bg-[#1f6feb] text-white'
                    : 'text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#21262d]'
>>>>>>> 1fedef5cdf2fa8631c20411f700509b8bbdcb0e2
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setExplainLanguage('hi')}
                aria-pressed={explainLanguage === 'hi'}
<<<<<<< HEAD
                className={`px-3 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                  explainLanguage === 'hi'
                    ? 'bg-[#0e639c] text-white'
                    : 'text-[#858585] hover:text-white hover:bg-[#2a2d2e]'
=======
                aria-label="Explain in Hindi"
                className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                  explainLanguage === 'hi'
                    ? 'bg-[#1f6feb] text-white'
                    : 'text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#21262d]'
>>>>>>> 1fedef5cdf2fa8631c20411f700509b8bbdcb0e2
                }`}
              >
                हिन्दी
              </button>
            </div>
          </div>
        </div>

<<<<<<< HEAD
        {/* Detail Level */}
        <div>
          <p className="text-[10px] uppercase tracking-wider text-[#858585] font-semibold mb-1.5">
            Depth & Detail
          </p>
          <div className="flex bg-[#1e1e1e] border border-[#3c3c3c] rounded p-0.5 gap-1 w-fit">
=======
        {/* Detail toggle */}
        <div>
          <p className="text-[10px] uppercase tracking-widest text-[#8b949e] font-semibold mb-1.5">
            Detail level
          </p>
          <div className="flex bg-[#0d1117] border border-[#30363d] rounded p-0.5 w-fit">
>>>>>>> 1fedef5cdf2fa8631c20411f700509b8bbdcb0e2
            <button
              type="button"
              onClick={() => setDetail('concise')}
              aria-pressed={detail === 'concise'}
<<<<<<< HEAD
              className={`px-3 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                detail === 'concise'
                  ? 'bg-[#0e639c] text-white'
                  : 'text-[#858585] hover:text-white hover:bg-[#2a2d2e]'
=======
              className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                detail === 'concise'
                  ? 'bg-[#1f6feb] text-white'
                  : 'text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#21262d]'
>>>>>>> 1fedef5cdf2fa8631c20411f700509b8bbdcb0e2
              }`}
            >
              Concise
            </button>
            <button
              type="button"
              onClick={() => setDetail('detailed')}
              aria-pressed={detail === 'detailed'}
<<<<<<< HEAD
              className={`px-3 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                detail === 'detailed'
                  ? 'bg-[#0e639c] text-white'
                  : 'text-[#858585] hover:text-white hover:bg-[#2a2d2e]'
              }`}
            >
              Detailed Breakdown
=======
              className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                detail === 'detailed'
                  ? 'bg-[#1f6feb] text-white'
                  : 'text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#21262d]'
              }`}
            >
              Detailed
>>>>>>> 1fedef5cdf2fa8631c20411f700509b8bbdcb0e2
            </button>
          </div>
        </div>

<<<<<<< HEAD
        {/* Context Summary */}
        {resolved && (
          <div className="flex flex-wrap gap-1.5 items-center pt-1">
            {currentFile && (
              <span className="font-mono text-[10px] bg-[#1e1e1e] border border-[#3c3c3c] rounded px-1.5 py-0.5 text-[#9cdcfe] truncate max-w-[12rem]">
=======
        {/* Context summary */}
        {resolved && (
          <div className="flex flex-wrap gap-1.5 items-center">
            {currentFile && (
              <span className="font-mono text-[10px] bg-[#161b22] border border-[#30363d] rounded px-1.5 py-0.5 text-[#8b949e] truncate max-w-[12rem]">
>>>>>>> 1fedef5cdf2fa8631c20411f700509b8bbdcb0e2
                {currentFile}
              </span>
            )}
            {resolved.startLine != null && (
<<<<<<< HEAD
              <span className="text-[10px] bg-[#1e1e1e] border border-[#3c3c3c] rounded px-1.5 py-0.5 text-[#858585]">
=======
              <span className="text-[10px] bg-[#161b22] border border-[#30363d] rounded px-1.5 py-0.5 text-[#8b949e]">
>>>>>>> 1fedef5cdf2fa8631c20411f700509b8bbdcb0e2
                L{resolved.startLine}
                {resolved.endLine && resolved.endLine !== resolved.startLine
                  ? `–${resolved.endLine}`
                  : ''}
              </span>
            )}
            {language && (
<<<<<<< HEAD
              <span className="text-[10px] bg-[#1e1e1e] border border-[#3c3c3c] rounded px-1.5 py-0.5 text-[#75beff]">
                {language}
              </span>
            )}
          </div>
        )}

        {/* Explain Button */}
=======
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
>>>>>>> 1fedef5cdf2fa8631c20411f700509b8bbdcb0e2
        <button
          type="button"
          onClick={handleExplain}
          disabled={!hasContext || isLoading}
<<<<<<< HEAD
          className="w-full h-[32px] flex items-center justify-center gap-2 px-3 rounded text-xs font-medium transition-colors bg-[#0e639c] hover:bg-[#1177bb] text-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          {isLoading ? (
            <>
              <Loader2 size={13} className="animate-spin text-white" />
              <span>Generating Explanation...</span>
            </>
          ) : (
            <>
              <Languages size={13} />
              <span>Explain Selected Code</span>
=======
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
>>>>>>> 1fedef5cdf2fa8631c20411f700509b8bbdcb0e2
            </>
          )}
        </button>
      </div>

<<<<<<< HEAD
      {/* ── Explanation Area ── */}
      <div className="flex-1 min-h-0 overflow-y-auto ide-scrollbar bg-[#1e1e1e]">
        {!hasContext && !isLoading && !explanation && !error && (
          <p className="p-4 text-[#858585] text-center">
            Select code in the editor or click a flowchart node to generate an explanation.
          </p>
        )}

        {isLoading && (
          <div className="p-4 flex items-center gap-2.5 text-[#007acc]">
            <Loader2 size={14} className="animate-spin" />
            <span>Analyzing syntax and generating walkthrough...</span>
          </div>
        )}

        {error && (
          <div className="m-3 flex items-start gap-2 p-2.5 rounded bg-[#5a1d1d]/40 border border-[#f14c4c]/40 text-[#f14c4c]">
            <AlertCircle size={14} className="shrink-0 mt-0.5" />
=======
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
>>>>>>> 1fedef5cdf2fa8631c20411f700509b8bbdcb0e2
            <span className="break-words">{error}</span>
          </div>
        )}

<<<<<<< HEAD
        {explanation && !isLoading && (
          <div className="p-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] uppercase tracking-wider text-[#858585] font-semibold">
                Explanation Result
=======
        {/* Explanation text */}
        {explanation && !isLoading && (
          <div className="px-3 py-3">
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-[10px] uppercase tracking-widest text-[#8b949e] font-semibold">
                Explanation
>>>>>>> 1fedef5cdf2fa8631c20411f700509b8bbdcb0e2
              </p>
              <button
                type="button"
                onClick={handleCopy}
                aria-label="Copy explanation"
<<<<<<< HEAD
                className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs bg-[#252526] hover:bg-[#2a2d2e] border border-[#3c3c3c] text-[#cccccc] hover:text-white transition-colors cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check size={11} className="text-[#73c991]" />
                    <span className="text-[#73c991]">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy size={11} />
                    <span>Copy</span>
=======
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
>>>>>>> 1fedef5cdf2fa8631c20411f700509b8bbdcb0e2
                  </>
                )}
              </button>
            </div>
<<<<<<< HEAD
            <pre className="whitespace-pre-wrap break-words text-[#cccccc] leading-relaxed p-3 rounded bg-[#252526] border border-[#3c3c3c] text-xs font-mono">
=======
            <pre className="whitespace-pre-wrap break-words text-[#c9d1d9] leading-relaxed p-2.5 rounded bg-[#161b22] border border-[#30363d] text-[11px]">
>>>>>>> 1fedef5cdf2fa8631c20411f700509b8bbdcb0e2
              {explanation}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
