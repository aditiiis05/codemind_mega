'use client';

// client/components/ai/AISuggestionsPanel.tsx
// AI code suggestion + repo analysis panel.
// POSTs to /api/ai/complete for code suggestions.
// Repo analysis is triggered via the onAnalyzeRepo callback (state lives in page.tsx).
// Shows a diff preview modal before applying a suggestion to the editor.

import { useState } from 'react';
import axios from 'axios';
import { Loader2, AlertCircle, Sparkles, CheckCircle, X, Eye } from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

interface AISuggestionsPanelProps {
  code?: string | null;
  language?: string | null;
  fileName?: string | null;
  onApplySuggestion?: (suggestion: string) => void;
  // Repo analysis — state and trigger live in page.tsx
  onAnalyzeRepo?: () => void;
  isAnalyzing?: boolean;
  analysisResult?: string;
  repoAvailable?: boolean;
}

// ── Diff Preview Modal ──────────────────────────────────────────────────────
interface DiffPreviewModalProps {
  currentCode: string;
  suggestion: string;
  onConfirm: () => void;
  onCancel: () => void;
}

function DiffPreviewModal({ currentCode, suggestion, onConfirm, onCancel }: DiffPreviewModalProps) {
  // Show the current file tail + the appended suggestion so the user can see exactly what changes
  const currentLines = currentCode.split('\n');
  const previewLines = suggestion.split('\n');
  // Show up to 8 lines of existing file context before the appended block
  const contextLines = currentLines.slice(Math.max(0, currentLines.length - 8));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div
        className="w-[540px] max-w-[95vw] max-h-[80vh] flex flex-col rounded-lg bg-[#161b22] border border-[#30363d] shadow-2xl overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="diff-preview-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#1c2128] border-b border-[#30363d] shrink-0">
          <div className="flex items-center gap-2">
            <Eye size={14} className="text-[#2f81f7]" />
            <span id="diff-preview-title" className="text-[12px] font-semibold text-[#e6edf3]">
              Preview Change
            </span>
          </div>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Cancel"
            className="p-1 rounded hover:bg-[#21262d] text-[#8b949e] hover:text-[#e6edf3] transition-colors"
          >
            <X size={13} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 min-h-0">
          <p className="text-[11px] text-[#8b949e] mb-3">
            The following lines will be appended to the end of the current file.
            Review the change before confirming.
          </p>

          {/* Context from existing file (greyed) */}
          {contextLines.length > 0 && (
            <div className="mb-0">
              <p className="text-[10px] uppercase tracking-widest text-[#8b949e] font-semibold mb-1">
                Existing file (last {contextLines.length} lines)
              </p>
              <pre className="bg-[#0d1117] border border-[#30363d] rounded-t text-[10px] font-mono text-[#6e7681] p-3 overflow-x-auto whitespace-pre-wrap break-words">
                {contextLines.map((line, i) => (
                  <span key={i} className="block">
                    {line || ' '}
                  </span>
                ))}
              </pre>
            </div>
          )}

          {/* New lines (green) */}
          <div>
            <p className="text-[10px] uppercase tracking-widest text-[#3fb950] font-semibold mt-3 mb-1">
              Appended suggestion (+{previewLines.length} lines)
            </p>
            <pre className="bg-[#0d1117] border border-[#3fb950]/40 rounded-b text-[10px] font-mono p-3 overflow-x-auto whitespace-pre-wrap break-words">
              {previewLines.map((line, i) => (
                <span key={i} className="block text-[#3fb950]">
                  +{' '}{line}
                </span>
              ))}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-4 py-3 bg-[#1c2128] border-t border-[#30363d] shrink-0">
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1.5 rounded text-[11px] font-semibold transition-colors bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-[#e6edf3]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-3 py-1.5 rounded text-[11px] font-semibold transition-colors bg-[#238636] hover:bg-[#2ea043] border border-[#238636] text-white"
          >
            Apply to Editor
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main component ──────────────────────────────────────────────────────────

export default function AISuggestionsPanel({
  code = null,
  language = null,
  fileName = null,
  onApplySuggestion,
  onAnalyzeRepo,
  isAnalyzing = false,
  analysisResult = '',
  repoAvailable = false,
}: AISuggestionsPanelProps) {
  const [suggestion, setSuggestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [applied, setApplied] = useState(false);
  // Diff preview modal state
  const [showDiffPreview, setShowDiffPreview] = useState(false);

  const hasCode = Boolean(code?.trim());

  const handleSuggest = async () => {
    if (!hasCode) {
      setError('No code loaded. Open a file first.');
      return;
    }
    setIsLoading(true);
    setError('');
    setSuggestion('');
    setShowSuggestion(false);
    setApplied(false);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/ai/complete`,
        { code, language },
        { timeout: 45000 }
      );
      const result: string =
        response.data?.suggestion ||
        response.data?.completion ||
        '';
      if (!result.trim()) {
        setError('AI returned an empty suggestion. Try again.');
        return;
      }
      setSuggestion(result);
      setShowSuggestion(true);
    } catch (err: unknown) {
      const e = err as {
        code?: string;
        message?: string;
        response?: { status?: number; data?: { message?: string; error?: string } };
      };
      if (e.code === 'ERR_NETWORK' || e.code === 'ECONNREFUSED') {
        setError('Backend server not running on port 4000. Start the server and try again.');
      } else if (e.response?.status === 400) {
        setError(e.response.data?.error || e.response.data?.message || 'Bad request to AI service.');
      } else if (e.code === 'ECONNABORTED') {
        setError('Request timed out. The AI service may be overloaded — try again.');
      } else {
        setError(
          e.response?.data?.error ||
            e.response?.data?.message ||
            e.message ||
            'Failed to get AI suggestion.'
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Opens the diff preview modal rather than applying directly
  const handleApplyClick = () => {
    if (!suggestion || !onApplySuggestion) return;
    setShowDiffPreview(true);
  };

  // Called when the user confirms the diff preview
  const handleConfirmApply = () => {
    if (!suggestion || !onApplySuggestion) return;
    onApplySuggestion(suggestion);
    setApplied(true);
    setShowDiffPreview(false);
  };

  const handleCancelDiff = () => {
    setShowDiffPreview(false);
  };

  const handleDismiss = () => {
    setSuggestion('');
    setShowSuggestion(false);
    setError('');
    setApplied(false);
    setShowDiffPreview(false);
  };

  return (
    <div className="flex flex-col h-full bg-[#0d1117] text-[#e6edf3] text-xs overflow-hidden">
      {/* Diff preview modal (rendered outside normal flow to overlay the full UI) */}
      {showDiffPreview && (
        <DiffPreviewModal
          currentCode={code ?? ''}
          suggestion={suggestion}
          onConfirm={handleConfirmApply}
          onCancel={handleCancelDiff}
        />
      )}

      {/* ── Get Suggestion section ── */}
      <div className="px-3 pt-3 pb-2 shrink-0 border-b border-[#30363d]">
        <p className="text-[10px] uppercase tracking-widest text-[#8b949e] font-semibold mb-2">
          Code Suggestion
        </p>

        {/* Context pill */}
        {fileName && (
          <div className="mb-2 flex items-center gap-1.5 text-[#8b949e]">
            <span className="font-mono text-[10px] bg-[#161b22] border border-[#30363d] rounded px-1.5 py-0.5 truncate max-w-full">
              {fileName}
            </span>
          </div>
        )}

        {!hasCode && !isLoading && (
          <p className="text-[#8b949e] text-[11px] mb-2">
            Open a file in the editor to get AI suggestions.
          </p>
        )}

        {/* Error banner */}
        {error && (
          <div className="mb-2 flex items-start gap-2 p-2.5 rounded bg-[#da3633]/10 border border-[#da3633]/40 text-[#f85149]">
            <AlertCircle size={13} className="shrink-0 mt-0.5" />
            <span className="flex-1 break-words">{error}</span>
            <button
              type="button"
              onClick={() => setError('')}
              aria-label="Dismiss error"
              className="shrink-0 p-0.5 hover:text-white transition-colors"
            >
              <X size={11} />
            </button>
          </div>
        )}

        {/* Get Suggestion button */}
        <button
          type="button"
          onClick={handleSuggest}
          disabled={!hasCode || isLoading}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded text-[11px] font-semibold transition-colors bg-[#2f81f7] hover:bg-[#388bfd] border border-[#2f81f7] text-white disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 size={12} className="animate-spin" />
              Getting suggestion…
            </>
          ) : (
            <>
              <Sparkles size={12} />
              Get AI Suggestion
            </>
          )}
        </button>
      </div>

      {/* ── Suggestion card ── */}
      {showSuggestion && suggestion && (
        <div className="mx-3 mt-3 shrink-0">
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-[10px] uppercase tracking-widest text-[#8b949e] font-semibold">
              Suggestion
            </p>
            {applied && (
              <span className="flex items-center gap-1 text-[#3fb950] text-[10px]">
                <CheckCircle size={11} />
                Applied
              </span>
            )}
          </div>
          <pre className="bg-[#0d1117] border border-[#30363d] text-[#c9d1d9] font-mono text-[11px] p-3 rounded overflow-x-auto whitespace-pre-wrap break-words max-h-48 overflow-y-auto">
            {suggestion}
          </pre>
          <div className="flex gap-2 mt-2">
            {/* "Apply to Editor" opens diff preview, not a direct mutation */}
            <button
              type="button"
              onClick={handleApplyClick}
              disabled={applied || !onApplySuggestion}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded text-[11px] font-semibold transition-colors bg-[#238636] hover:bg-[#2ea043] border border-[#238636] text-white disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Eye size={11} />
              {applied ? 'Applied' : 'Review & Apply…'}
            </button>
            <button
              type="button"
              onClick={handleDismiss}
              className="px-3 py-1.5 rounded text-[11px] font-semibold transition-colors bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-[#e6edf3]"
            >
              Dismiss
            </button>
          </div>
          <p className="mt-1.5 text-[10px] text-[#8b949e]">
            Click &ldquo;Review &amp; Apply&rdquo; to preview the diff before the file is modified.
          </p>
        </div>
      )}

      {/* ── Repo Analysis section ── */}
      <div className="px-3 pt-3 pb-2 mt-2 shrink-0 border-t border-[#30363d]">
        <p className="text-[10px] uppercase tracking-widest text-[#8b949e] font-semibold mb-2">
          Repository Analysis
        </p>

        {!repoAvailable && (
          <p className="text-[#8b949e] text-[11px] mb-2">
            Load a repository to run analysis.
          </p>
        )}

        <button
          type="button"
          onClick={onAnalyzeRepo}
          disabled={isAnalyzing || !repoAvailable || !onAnalyzeRepo}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded text-[11px] font-semibold transition-colors bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-[#e6edf3] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isAnalyzing ? (
            <>
              <Loader2 size={12} className="animate-spin" />
              Analyzing Repository…
            </>
          ) : (
            <>
              <Sparkles size={12} />
              Run AI Repository Analysis
            </>
          )}
        </button>
      </div>

      {/* ── Analysis result (scrollable) ── */}
      {(analysisResult || isAnalyzing) && (
        <div className="flex-1 min-h-0 overflow-y-auto px-3 pb-3">
          <p className="text-[10px] uppercase tracking-widest text-[#8b949e] font-semibold mb-2 mt-1">
            Analysis Result
          </p>
          {isAnalyzing && !analysisResult ? (
            <div className="flex items-center gap-2 text-[#58a6ff]">
              <Loader2 size={12} className="animate-spin" />
              <span>Analyzing…</span>
            </div>
          ) : (
            <pre className="text-[11px] whitespace-pre-wrap text-[#c9d1d9] leading-relaxed bg-[#161b22] border border-[#30363d] rounded p-3">
              {analysisResult || 'No analysis result yet.'}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}
