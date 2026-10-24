'use client';

<<<<<<< HEAD
import React from 'react';
import { GitBranch, XCircle, AlertTriangle, RefreshCw } from 'lucide-react';
=======
import { Zap } from 'lucide-react';
>>>>>>> 1fedef5cdf2fa8631c20411f700509b8bbdcb0e2

interface StatusBarProps {
  line?: number;
  column?: number;
  language?: string;
  branch?: string;
  aiStatus?: 'idle' | 'processing' | 'ready';
<<<<<<< HEAD
  errorCount?: number;
  warningCount?: number;
  encoding?: string;
  indentation?: string;
=======
>>>>>>> 1fedef5cdf2fa8631c20411f700509b8bbdcb0e2
}

export default function StatusBar({
  line = 1,
  column = 1,
<<<<<<< HEAD
  language = 'TypeScript',
  branch = 'main',
  aiStatus = 'ready',
  errorCount = 0,
  warningCount = 0,
  encoding = 'UTF-8',
}: StatusBarProps) {
  const displayLang = language.charAt(0).toUpperCase() + language.slice(1);

  return (
    <footer
      className="h-[22px] shrink-0 bg-[#007acc] text-[#ffffff] flex items-center justify-between px-2 text-[12px] select-none z-20 font-sans"
      aria-label="Status Bar"
    >
      {/* ── Left Status Items ── */}
      <div className="flex items-center h-full gap-0.5">
        {/* Remote / Git Branch */}
        <button
          type="button"
          className="inline-flex items-center gap-1.5 px-2 h-full hover:bg-[#1f8ad2] transition-colors cursor-pointer"
          title={`Git: ${branch}`}
        >
          <GitBranch size={13} />
          <span className="font-medium text-[11.5px]">{branch}*</span>
        </button>

        {/* Synchronize indicator */}
        <button
          type="button"
          className="inline-flex items-center px-1.5 h-full hover:bg-[#1f8ad2] transition-colors cursor-pointer"
          title="Synchronize Changes"
        >
          <RefreshCw size={11} />
        </button>

        {/* Errors & Warnings count */}
        <button
          type="button"
          className="inline-flex items-center gap-2 px-2 h-full hover:bg-[#1f8ad2] transition-colors cursor-pointer text-[11.5px]"
          title={`${errorCount} errors, ${warningCount} warnings`}
        >
          <span className="inline-flex items-center gap-1">
            <XCircle size={12} />
            <span>{errorCount}</span>
          </span>
          <span className="inline-flex items-center gap-1">
            <AlertTriangle size={12} />
            <span>{warningCount}</span>
          </span>
        </button>

        {/* AI Copilot Status */}
        <button
          type="button"
          className="inline-flex items-center gap-1.5 px-2 h-full hover:bg-[#1f8ad2] transition-colors cursor-pointer text-[11.5px]"
          title="CodeMind AI: Ready"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#ffffff]" />
          <span>CodeMind {aiStatus === 'processing' ? 'Working...' : 'AI'}</span>
        </button>
      </div>

      {/* ── Right Status Items ── */}
      <div className="flex items-center h-full text-[11.5px] gap-0.5">
        <button
          type="button"
          className="inline-flex items-center px-2 h-full hover:bg-[#1f8ad2] transition-colors cursor-pointer"
          title="Go to Line/Column"
        >
          Ln {line || 14}, Col {column || 21}
        </button>

        <button
          type="button"
          className="inline-flex items-center px-2 h-full hover:bg-[#1f8ad2] transition-colors cursor-pointer"
          title="Select Encoding"
        >
          {encoding || 'UTF-8'}
        </button>

        <button
          type="button"
          className="inline-flex items-center px-2 h-full hover:bg-[#1f8ad2] transition-colors cursor-pointer"
          title="Select Language Mode"
        >
          {displayLang.toLowerCase().includes('type') ? 'TypeScript JSX' : displayLang}
        </button>

        <button
          type="button"
          className="inline-flex items-center gap-1.5 px-2.5 h-full hover:bg-[#1f8ad2] transition-colors cursor-pointer font-medium uppercase tracking-wider text-[11px]"
          title="AI Assistant Status"
        >
          <span className="text-[12px]">✦</span>
          <span>{aiStatus === 'processing' ? 'AI THINKING...' : 'AI READY'}</span>
        </button>
      </div>
    </footer>
=======
  language = 'typescript',
  branch = 'main',
  aiStatus = 'ready'
}: StatusBarProps) {
  return (
    <div className="h-7 shrink-0 bg-gradient-to-r from-[#007acc]/30 via-[#1e1e1e] to-[#1e1e1e] border-t border-[#3e3e42]/50 flex items-center px-4 gap-6 text-[11px] shadow-lg">
      <style jsx>{`
        .status-item {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 0 8px;
          cursor: pointer;
          border-radius: 3px;
          transition: all 0.2s ease;
          color: #858585;
        }

        .status-item:hover {
          background: rgba(255, 255, 255, 0.08);
          color: #cccccc;
        }

        .status-item.active {
          color: #0ea5e9;
          background: rgba(14, 165, 233, 0.1);
        }

        .status-indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          display: inline-block;
        }

        .status-indicator.idle {
          background-color: #858585;
        }

        .status-indicator.processing {
          background-color: #fbbf24;
          animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        .status-indicator.ready {
          background-color: #34d399;
          box-shadow: 0 0 8px rgba(52, 211, 153, 0.5);
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        .divider {
          width: 1px;
          height: 16px;
          background: rgba(255, 255, 255, 0.1);
        }

        .status-text {
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          font-weight: 500;
        }
      `}</style>

      <div className="status-item">
        <div className={`status-indicator ${aiStatus}`} />
        <span className="status-text">
          {aiStatus === 'idle' && 'AI Ready'}
          {aiStatus === 'processing' && 'AI Processing...'}
          {aiStatus === 'ready' && 'AI Active'}
        </span>
      </div>

      <div className="divider" />

      <div className="status-item">
        <span className="status-text">Ln {line}</span>
      </div>

      <div className="status-item">
        <span className="status-text">Col {column}</span>
      </div>

      <div className="divider" />

      <div className="status-item active">
        <span className="status-text uppercase">{language}</span>
      </div>

      <div className="flex-1" />

      <div className="status-item">
        <span className="status-text">🌿 {branch}</span>
      </div>

      <div className="divider" />

      <div className="status-item">
        <Zap size={12} />
        <span className="status-text">1.5s</span>
      </div>
    </div>
>>>>>>> 1fedef5cdf2fa8631c20411f700509b8bbdcb0e2
  );
}
