// client/components/flowchart/FlowchartModal.tsx
// Fullscreen overlay modal wrapping FlowchartPanel
'use client';

import React, { useEffect } from 'react';
import { X, Network } from 'lucide-react';
import FlowchartPanel from './FlowchartPanel';
import { FlowNode } from '@/types/flowchart';

interface FlowchartModalProps {
  isOpen: boolean;
  onClose: () => void;
  code: string | null;
  fileName: string | null;
  language: string | null;
  repoFiles?: Array<{
    path: string;
    name: string;
    content?: string;
    language?: string;
    size?: number;
  }>;
  owner?: string;
  repo?: string;
  cursorLine?: number | null;
  cursorEndLine?: number | null;
  onNavigateToCode?: (file: string, lineStart: number, lineEnd?: number) => void;
  onNodeSelect?: (node: FlowNode | null) => void;
}

export default function FlowchartModal({
  isOpen,
  onClose,
  code,
  fileName,
  language,
  repoFiles = [],
  owner = '',
  repo = '',
  cursorLine = null,
  cursorEndLine = null,
  onNavigateToCode,
  onNodeSelect,
}: FlowchartModalProps) {
  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  // Prevent body scroll while open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex flex-col bg-black/70 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Code Flowchart — Full View"
    >
      {/* Modal chrome header */}
      <div className="h-10 px-4 bg-[#252526] border-b border-[#2b2b2b] flex items-center justify-between shrink-0 select-none">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-[#1e1e1e] border border-[#3c3c3c] flex items-center justify-center shrink-0">
            <Network size={12} className="text-[#007acc]" />
          </div>
          <span className="text-xs font-semibold text-white tracking-wide">Code Flowchart</span>
          {fileName && (
            <span className="text-[10px] font-mono text-[#858585] bg-[#1e1e1e] border border-[#3c3c3c] px-2 py-0.5 rounded truncate max-w-[240px]">
              {fileName}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-[#858585] hidden sm:inline">
            Press{' '}
            <kbd className="px-1 py-0.5 bg-[#1e1e1e] border border-[#3c3c3c] rounded text-[10px] font-mono text-[#cccccc]">
              Esc
            </kbd>{' '}
            to close
          </span>
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#3c3c3c] hover:bg-[#505050] text-white text-xs font-medium transition-colors cursor-pointer"
            title="Close modal (Esc)"
            aria-label="Close flowchart modal"
          >
            <X size={12} />
            <span>Close</span>
          </button>
        </div>
      </div>

      {/* Panel body — flex-1 so it fills the rest of the overlay */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <FlowchartPanel
          code={code}
          fileName={fileName}
          language={language}
          repoFiles={repoFiles}
          owner={owner}
          repo={repo}
          cursorLine={cursorLine}
          cursorEndLine={cursorEndLine}
          onNavigateToCode={onNavigateToCode}
          onNodeSelect={onNodeSelect}
        />
      </div>
    </div>
  );
}
