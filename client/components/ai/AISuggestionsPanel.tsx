'use client';

// client/components/ai/AISuggestionsPanel.tsx
<<<<<<< HEAD
// Visual Studio style AI code suggestion + repo analysis panel.
// Flat dark aesthetics, standard buttons, diff preview modal.
=======
// AI code suggestion + repo analysis panel.
// POSTs to /api/ai/complete for code suggestions.
// Repo analysis is triggered via the onAnalyzeRepo callback (state lives in page.tsx).
// Shows a diff preview modal before applying a suggestion to the editor.
>>>>>>> 1fedef5cdf2fa8631c20411f700509b8bbdcb0e2

import { useState } from 'react';
import axios from 'axios';
import { Loader2, AlertCircle, Sparkles, CheckCircle, X, Eye } from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

interface AISuggestionsPanelProps {
  code?: string | null;
  language?: string | null;
  fileName?: string | null;
  onApplySuggestion?: (suggestion: string) => void;
<<<<<<< HEAD
=======
  // Repo analysis — state and trigger live in page.tsx
>>>>>>> 1fedef5cdf2fa8631c20411f700509b8bbdcb0e2
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
<<<<<<< HEAD
  const currentLines = currentCode.split('\n');
  const previewLines = suggestion.split('\n');
  const contextLines = currentLines.slice(Math.max(0, currentLines.length - 8));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75">
      <div
        className="w-[520px] max-w-[95vw] max-h-[80vh] flex flex-col rounded bg-[#252526] border border-[#3c3c3c] shadow-2xl overflow-hidden font-sans"
=======
  // Show the current file tail + the appended suggestion so the user can see exactly what changes
  const currentLines = currentCode.split('\n');
  const previewLines = suggestion.split('\n');
  // Show up to 8 lines of existing file context before the appended block
  const contextLines = currentLines.slice(Math.max(0, currentLines.length - 8));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div
        className="w-[540px] max-w-[95vw] max-h-[80vh] flex flex-col rounded-lg bg-[#161b22] border border-[#30363d] shadow-2xl overflow-hidden"
>>>>>>> 1fedef5cdf2fa8631c20411f700509b8bbdcb0e2
        role="dialog"
        aria-modal="true"
        aria-labelledby="diff-preview-title"
      >
        {/* Header */}
<<<<<<< HEAD
        <div className="flex items-center justify-between px-3 py-2 bg-[#323233] border-b border-[#2b2b2b] shrink-0">
          <div className="flex items-center gap-2">
            <Eye size={13} className="text-[#007acc]" />
            <span id="diff-preview-title" className="text-xs font-semibold text-[#ffffff]">
              Review Code Changes
=======
        <div className="flex items-center justify-between px-4 py-3 bg-[#1c2128] border-b border-[#30363d] shrink-0">
          <div className="flex items-center gap-2">
            <Eye size={14} className="text-[#2f81f7]" />
            <span id="diff-preview-title" className="text-[12px] font-semibold text-[#e6edf3]">
              Preview Change
>>>>>>> 1fedef5cdf2fa8631c20411f700509b8bbdcb0e2
            </span>
          </div>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Cancel"
<<<<<<< HEAD
            className="p-1 rounded hover:bg-[#3c3c3c] text-[#858585] hover:text-[#ffffff] transition-colors cursor-pointer"
=======
            className="p-1 rounded hover:bg-[#21262d] text-[#8b949e] hover:text-[#e6edf3] transition-colors"
>>>>>>> 1fedef5cdf2fa8631c20411f700509b8bbdcb0e2
          >
            <X size={13} />
          </button>
        </div>

        {/* Body */}
<<<<<<< HEAD
        <div className="flex-1 overflow-y-auto p-3 min-h-0 text-xs">
          <p className="text-[11px] text-[#858585] mb-2">
            Review the code diff below before applying the changes to the active file.
          </p>

          {/* Context from existing file */}
          {contextLines.length > 0 && (
            <div className="mb-2">
              <p className="text-[10px] uppercase tracking-wider text-[#858585] font-semibold mb-1">
                Context (last {contextLines.length} lines)
              </p>
              <pre className="bg-[#1e1e1e] border border-[#3c3c3c] rounded text-[11px] font-mono text-[#858585] p-2.5 overflow-x-auto whitespace-pre-wrap break-words leading-relaxed">
                {contextLines.map((line, i) => (
                  <span key={i} className="block">
                    {'  '}{line || ' '}
=======
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
>>>>>>> 1fedef5cdf2fa8631c20411f700509b8bbdcb0e2
                  </span>
                ))}
              </pre>
            </div>
          )}

          {/* New lines (green) */}
          <div>
<<<<<<< HEAD
            <p className="text-[10px] uppercase tracking-wider text-[#73c991] font-semibold mb-1">
              Appended Changes (+{previewLines.length} lines)
            </p>
            <pre className="bg-[#1e1e1e] border border-[#73c991]/40 rounded text-[11px] font-mono p-2.5 overflow-x-auto whitespace-pre-wrap break-words leading-relaxed">
              {previewLines.map((line, i) => (
                <span key={i} className="block text-[#73c991]">
                  + {line}
=======
            <p className="text-[10px] uppercase tracking-widest text-[#3fb950] font-semibold mt-3 mb-1">
              Appended suggestion (+{previewLines.length} lines)
            </p>
            <pre className="bg-[#0d1117] border border-[#3fb950]/40 rounded-b text-[10px] font-mono p-3 overflow-x-auto whitespace-pre-wrap break-words">
              {previewLines.map((line, i) => (
                <span key={i} className="block text-[#3fb950]">
                  +{' '}{line}
>>>>>>> 1fedef5cdf2fa8631c20411f700509b8bbdcb0e2
                </span>
              ))}
            </pre>
          </div>
        </div>

        {/* Footer */}
<<<<<<< HEAD
        <div className="flex items-center justify-end gap-2 px-3 py-2 bg-[#252526] border-t border-[#3c3c3c] shrink-0">
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1 rounded text-xs font-medium transition-colors bg-[#2d2d2d] hover:bg-[#383838] border border-[#3c3c3c] text-[#cccccc] cursor-pointer"
=======
        <div className="flex items-center justify-end gap-2 px-4 py-3 bg-[#1c2128] border-t border-[#30363d] shrink-0">
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1.5 rounded text-[11px] font-semibold transition-colors bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-[#e6edf3]"
>>>>>>> 1fedef5cdf2fa8631c20411f700509b8bbdcb0e2
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
<<<<<<< HEAD
            className="px-3 py-1 rounded text-xs font-medium transition-colors bg-[#0e639c] hover:bg-[#1177bb] text-white cursor-pointer"
          >
            Apply Changes
=======
            className="px-3 py-1.5 rounded text-[11px] font-semibold transition-colors bg-[#238636] hover:bg-[#2ea043] border border-[#238636] text-white"
          >
            Apply to Editor
>>>>>>> 1fedef5cdf2fa8631c20411f700509b8bbdcb0e2
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
<<<<<<< HEAD
=======
  // Diff preview modal state
>>>>>>> 1fedef5cdf2fa8631c20411f700509b8bbdcb0e2
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
<<<<<<< HEAD
        response?: { data?: { error?: string } };
      };
      if (e.code === 'ECONNABORTED') {
        setError('Request timed out. Please try again.');
      } else if (e.response?.data?.error) {
        setError(e.response.data.error);
      } else {
        setError(e.message || 'Failed to get suggestion.');
=======
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
>>>>>>> 1fedef5cdf2fa8631c20411f700509b8bbdcb0e2
      }
    } finally {
      setIsLoading(false);
    }
  };

<<<<<<< HEAD
  const handleApplyClick = () => {
    if (!suggestion) return;
    setShowDiffPreview(true);
  };

  const handleConfirmApply = () => {
    if (suggestion && onApplySuggestion) {
      onApplySuggestion(suggestion);
      setApplied(true);
    }
=======
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
>>>>>>> 1fedef5cdf2fa8631c20411f700509b8bbdcb0e2
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
<<<<<<< HEAD
    <div className="flex flex-col h-full bg-[#1e1e1e] text-[#cccccc] text-xs overflow-hidden">
      {/* Diff preview modal */}
=======
    <div className="flex flex-col h-full bg-[#0d1117] text-[#e6edf3] text-xs overflow-hidden">
      {/* Diff preview modal (rendered outside normal flow to overlay the full UI) */}
>>>>>>> 1fedef5cdf2fa8631c20411f700509b8bbdcb0e2
      {showDiffPreview && (
        <DiffPreviewModal
          currentCode={code ?? ''}
          suggestion={suggestion}
          onConfirm={handleConfirmApply}
          onCancel={handleCancelDiff}
        />
      )}

<<<<<<< HEAD
      {/* ── Get Suggestion Section ── */}
      <div className="p-3 shrink-0 border-b border-[#2b2b2b] bg-[#252526]">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] uppercase tracking-wider text-[#858585] font-semibold">
            Code Completion & Suggestion
          </p>
          {fileName && (
            <span className="font-mono text-[10px] bg-[#1e1e1e] border border-[#3c3c3c] text-[#9cdcfe] px-1.5 py-0.5 rounded truncate max-w-[180px]">
              {fileName}
            </span>
          )}
        </div>

        {!hasCode && !isLoading && (
          <p className="text-[#858585] text-xs mb-2">
            Open a file in the Monaco editor to generate context-aware suggestions.
=======
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
>>>>>>> 1fedef5cdf2fa8631c20411f700509b8bbdcb0e2
          </p>
        )}

        {/* Error banner */}
        {error && (
<<<<<<< HEAD
          <div className="mb-2 flex items-start gap-2 p-2 rounded bg-[#5a1d1d]/40 border border-[#f14c4c]/40 text-[#f14c4c] text-xs">
=======
          <div className="mb-2 flex items-start gap-2 p-2.5 rounded bg-[#da3633]/10 border border-[#da3633]/40 text-[#f85149]">
>>>>>>> 1fedef5cdf2fa8631c20411f700509b8bbdcb0e2
            <AlertCircle size={13} className="shrink-0 mt-0.5" />
            <span className="flex-1 break-words">{error}</span>
            <button
              type="button"
              onClick={() => setError('')}
              aria-label="Dismiss error"
<<<<<<< HEAD
              className="shrink-0 p-0.5 hover:text-white transition-colors cursor-pointer"
            >
              <X size={12} />
=======
              className="shrink-0 p-0.5 hover:text-white transition-colors"
            >
              <X size={11} />
>>>>>>> 1fedef5cdf2fa8631c20411f700509b8bbdcb0e2
            </button>
          </div>
        )}

        {/* Get Suggestion button */}
        <button
          type="button"
          onClick={handleSuggest}
          disabled={!hasCode || isLoading}
<<<<<<< HEAD
          className="w-full h-[32px] flex items-center justify-center gap-2 px-3 rounded text-xs font-medium transition-colors bg-[#0e639c] hover:bg-[#1177bb] text-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          {isLoading ? (
            <>
              <Loader2 size={13} className="animate-spin text-white" />
              <span>Generating Suggestion...</span>
            </>
          ) : (
            <>
              <Sparkles size={13} />
              <span>Generate AI Suggestion</span>
=======
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
>>>>>>> 1fedef5cdf2fa8631c20411f700509b8bbdcb0e2
            </>
          )}
        </button>
      </div>

<<<<<<< HEAD
      {/* ── Suggestion Card ── */}
      {showSuggestion && suggestion && (
        <div className="m-3 p-3 bg-[#252526] border border-[#3c3c3c] rounded shrink-0">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] uppercase tracking-wider text-[#858585] font-semibold">
              Suggested Code
            </p>
            {applied && (
              <span className="flex items-center gap-1 text-[#73c991] text-[11px] font-semibold">
                <CheckCircle size={12} />
                Applied to Editor
              </span>
            )}
          </div>
          <pre className="bg-[#1e1e1e] border border-[#3c3c3c] text-[#9cdcfe] font-mono text-[11px] p-2.5 rounded overflow-x-auto whitespace-pre-wrap break-words max-h-48 overflow-y-auto ide-scrollbar leading-relaxed">
            {suggestion}
          </pre>
          <div className="flex gap-2 mt-2.5">
=======
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
>>>>>>> 1fedef5cdf2fa8631c20411f700509b8bbdcb0e2
            <button
              type="button"
              onClick={handleApplyClick}
              disabled={applied || !onApplySuggestion}
<<<<<<< HEAD
              className="flex-1 h-[28px] flex items-center justify-center gap-1.5 px-3 rounded text-xs font-medium transition-colors bg-[#0e639c] hover:bg-[#1177bb] text-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <Eye size={12} />
              <span>{applied ? 'Applied' : 'Review & Apply Diff'}</span>
=======
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded text-[11px] font-semibold transition-colors bg-[#238636] hover:bg-[#2ea043] border border-[#238636] text-white disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Eye size={11} />
              {applied ? 'Applied' : 'Review & Apply…'}
>>>>>>> 1fedef5cdf2fa8631c20411f700509b8bbdcb0e2
            </button>
            <button
              type="button"
              onClick={handleDismiss}
<<<<<<< HEAD
              className="h-[28px] px-3 rounded text-xs font-medium transition-colors bg-[#2d2d2d] hover:bg-[#383838] border border-[#3c3c3c] text-[#cccccc] hover:text-white cursor-pointer"
=======
              className="px-3 py-1.5 rounded text-[11px] font-semibold transition-colors bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-[#e6edf3]"
>>>>>>> 1fedef5cdf2fa8631c20411f700509b8bbdcb0e2
            >
              Dismiss
            </button>
          </div>
<<<<<<< HEAD
        </div>
      )}

      {/* ── Repo Analysis Section ── */}
      <div className="p-3 shrink-0 border-t border-[#2b2b2b] bg-[#252526]">
        <p className="text-[10px] uppercase tracking-wider text-[#858585] font-semibold mb-1.5">
          Workspace Repository Analysis
        </p>

        {!repoAvailable && (
          <p className="text-[#858585] text-xs mb-2">
            Open a workspace repository to analyze architecture, dependencies, and imports.
=======
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
>>>>>>> 1fedef5cdf2fa8631c20411f700509b8bbdcb0e2
          </p>
        )}

        <button
          type="button"
          onClick={onAnalyzeRepo}
          disabled={isAnalyzing || !repoAvailable || !onAnalyzeRepo}
<<<<<<< HEAD
          className="w-full h-[32px] flex items-center justify-center gap-2 px-3 rounded text-xs font-medium transition-colors bg-[#2d2d2d] hover:bg-[#383838] border border-[#3c3c3c] text-[#cccccc] hover:text-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          {isAnalyzing ? (
            <>
              <Loader2 size={13} className="animate-spin text-[#007acc]" />
              <span>Analyzing Architecture...</span>
            </>
          ) : (
            <>
              <Sparkles size={13} className="text-[#007acc]" />
              <span>Run Repository Deep Analysis</span>
=======
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
>>>>>>> 1fedef5cdf2fa8631c20411f700509b8bbdcb0e2
            </>
          )}
        </button>
      </div>

      {/* ── Analysis result (scrollable) ── */}
      {(analysisResult || isAnalyzing) && (
<<<<<<< HEAD
        <div className="flex-1 min-h-0 overflow-y-auto p-3 ide-scrollbar">
          <p className="text-[10px] uppercase tracking-wider text-[#858585] font-semibold mb-1.5">
            Architecture Report
          </p>
          {isAnalyzing && !analysisResult ? (
            <div className="flex items-center gap-2 text-[#007acc] text-xs">
              <Loader2 size={13} className="animate-spin" />
              <span>Scanning project structure and building graph...</span>
            </div>
          ) : (
            <pre className="text-xs whitespace-pre-wrap text-[#cccccc] leading-relaxed bg-[#252526] border border-[#3c3c3c] rounded p-3 font-mono">
              {analysisResult || 'No analysis result available.'}
=======
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
>>>>>>> 1fedef5cdf2fa8631c20411f700509b8bbdcb0e2
            </pre>
          )}
        </div>
      )}
    </div>
  );
}
