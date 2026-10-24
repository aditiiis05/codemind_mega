'use client';

<<<<<<< HEAD
import React from 'react';
import {
  X,
  Plus,
  Play,
  Sparkles,
  ChevronRight,
  Code,
  FileCode2,
  FileJson,
  FileText,
  GitBranch,
  File,
  Split
} from 'lucide-react';
=======
import { X, FileCode } from 'lucide-react';
>>>>>>> 1fedef5cdf2fa8631c20411f700509b8bbdcb0e2

export interface EditorTab {
  id: string;
  name: string;
  language?: string;
  isDirty?: boolean;
}

interface EditorTabsProps {
  tabs: EditorTab[];
  activeTabId: string;
  onTabClick: (tabId: string) => void;
  onTabClose: (tabId: string) => void;
<<<<<<< HEAD
  onNewTab?: () => void;
  onRunCode?: () => void;
  onTriggerAISuggestion?: () => void;
  onRunAIAnalysis?: () => void;
  isAILoading?: boolean;
}

function getTabIcon(filename: string) {
  const ext = filename.split('.').pop()?.toLowerCase() ?? '';
  if (['tsx', 'jsx'].includes(ext)) {
    return <Code size={13} className="text-[#388bfd] shrink-0" />;
  }
  if (['ts', 'js'].includes(ext)) {
    return <FileCode2 size={13} className="text-[#f1e05a] shrink-0" />;
  }
  if (ext === 'py') {
    return <FileCode2 size={13} className="text-[#3572A5] shrink-0" />;
  }
  if (ext === 'json') {
    return <FileJson size={13} className="text-[#cbcb41] shrink-0" />;
  }
  if (['md', 'txt'].includes(ext)) {
    return <FileText size={13} className="text-[#969696] shrink-0" />;
  }
  if (filename === '.gitignore') {
    return <GitBranch size={13} className="text-[#f34f29] shrink-0" />;
  }
  return <File size={13} className="text-[#969696] shrink-0" />;
=======
>>>>>>> 1fedef5cdf2fa8631c20411f700509b8bbdcb0e2
}

export default function EditorTabs({
  tabs,
  activeTabId,
  onTabClick,
<<<<<<< HEAD
  onTabClose,
  onNewTab,
  onRunCode,
  onTriggerAISuggestion,
  onRunAIAnalysis,
  isAILoading = false,
}: EditorTabsProps) {
  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];
  const breadcrumbParts = activeTab?.id ? activeTab.id.split('/').filter(Boolean) : [activeTab?.name || 'untitled.tsx'];

  return (
    <div className="flex flex-col shrink-0 select-none bg-[#252526] border-b border-[#1e1e1e]">
      {/* ── Top Tabs Row (Exact VS Code 35px height) ── */}
      <div className="h-[35px] flex items-center justify-between gap-0 overflow-x-auto scrollbar-none">
        <div className="flex items-center h-full min-w-0">
          {tabs.map((tab) => {
            const isActive = activeTabId === tab.id;
            return (
              <div
                key={tab.id}
                onClick={() => onTabClick(tab.id)}
                className={`group relative flex items-center gap-2 h-full px-3 text-[12px] font-sans transition-colors cursor-pointer border-r border-[#1e1e1e] ${
                  isActive
                    ? 'bg-[#1e1e1e] text-[#ffffff] font-normal border-t-2 border-t-[#007acc]'
                    : 'bg-[#2d2d2d] text-[#969696] hover:text-[#ffffff] hover:bg-[#2d2d2d]'
                }`}
                title={tab.name}
              >
                {getTabIcon(tab.name)}
                <span className="max-w-[140px] truncate">{tab.name}</span>

                {/* Dirty indicator dot */}
                {tab.isDirty && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ffffff] group-hover:hidden" />
                )}

                {/* Close Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onTabClose(tab.id);
                  }}
                  className="p-0.5 rounded-[2px] text-[#969696] hover:text-[#ffffff] hover:bg-[#333333] transition-colors ml-0.5"
                  aria-label={`Close ${tab.name}`}
                >
                  <X size={13} />
                </button>
              </div>
            );
          })}

          {onNewTab && (
            <button
              onClick={onNewTab}
              className="p-1 text-[#969696] hover:text-[#ffffff] hover:bg-[#333333] rounded-[2px] ml-1 transition-colors cursor-pointer"
              title="New File"
            >
              <Plus size={14} />
            </button>
          )}
        </div>

        {/* ── Right Quick Actions: + RUN AI ANALYSIS Button ── */}
        <div className="flex items-center gap-2 pr-3">
          {(onRunAIAnalysis || onTriggerAISuggestion) && (
            <button
              onClick={onRunAIAnalysis || onTriggerAISuggestion}
              disabled={isAILoading}
              className="flex items-center gap-1.5 px-3 py-1 bg-[#1f6feb]/15 hover:bg-[#1f6feb]/25 border border-[#388bfd]/60 text-[#388bfd] hover:text-[#75beff] rounded text-[11px] font-semibold tracking-wider transition-colors disabled:opacity-50 cursor-pointer"
              title="Run AI Analysis on project"
            >
              <Sparkles size={11} className={isAILoading ? 'animate-spin' : ''} />
              <span>{isAILoading ? 'ANALYZING...' : '+ RUN AI ANALYSIS'}</span>
            </button>
          )}

          {onRunCode && (
            <button
              onClick={onRunCode}
              className="p-1.5 text-[#969696] hover:text-[#ffffff] hover:bg-[#333333] rounded-[2px] transition-colors cursor-pointer"
              title="Run Code (F5)"
            >
              <Play size={13} className="text-[#89d185] fill-[#89d185]" />
            </button>
          )}

          <button
            type="button"
            className="p-1.5 text-[#969696] hover:text-[#ffffff] hover:bg-[#333333] rounded-[2px] transition-colors cursor-pointer"
            title="Split Editor Right"
          >
            <Split size={13} />
          </button>
        </div>
      </div>

      {/* ── Breadcrumb Bar (Exact VS Code 22px height) ── */}
      <div className="h-[22px] px-3 bg-[#1e1e1e] border-t border-[#252526] flex items-center text-[11px] text-[#858585] gap-1 overflow-x-auto scrollbar-none font-sans">
        {breadcrumbParts.map((part, idx) => (
          <React.Fragment key={idx}>
            {idx > 0 && <ChevronRight size={11} className="text-[#6e7681] shrink-0" />}
            <span
              className={`hover:text-[#cccccc] cursor-pointer transition-colors truncate max-w-[150px] ${
                idx === breadcrumbParts.length - 1 ? 'text-[#cccccc] font-medium' : ''
              }`}
            >
              {part}
            </span>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
=======
  onTabClose
}: EditorTabsProps) {
  return (
    <div className="h-9 bg-[#161b22] border-b border-[#30363d] flex items-center gap-0.5 px-2 overflow-x-auto select-none shrink-0 scrollbar-none">
      <style jsx>{`
        div::-webkit-scrollbar {
          height: 3px;
        }
        div::-webkit-scrollbar-track {
          background: #161b22;
        }
        div::-webkit-scrollbar-thumb {
          background: #30363d;
          border-radius: 2px;
        }
        div::-webkit-scrollbar-thumb:hover {
          background: #484f58;
        }
      `}</style>

      {tabs.map((tab) => {
        const isActive = activeTabId === tab.id;
        return (
          <div
            key={tab.id}
            onClick={() => onTabClick(tab.id)}
            className={`group relative flex items-center gap-2 h-full px-3 text-xs font-mono transition-colors cursor-pointer border-r border-[#21262d] ${
              isActive
                ? 'bg-[#0d1117] text-[#e6edf3] font-medium border-t-2 border-t-[#38bdf8]'
                : 'bg-transparent text-[#8b949e] hover:bg-[#21262d]/60 hover:text-[#c9d1d9] border-t-2 border-t-transparent'
            }`}
            title={tab.name}
          >
            <FileCode
              className={`w-3.5 h-3.5 shrink-0 ${
                isActive ? 'text-[#38bdf8]' : 'text-[#8b949e] group-hover:text-[#c9d1d9]'
              }`}
            />
            <span className="max-w-[140px] truncate">{tab.name}</span>

            {tab.isDirty && (
              <span
                className="w-2 h-2 rounded-full bg-[#38bdf8] shrink-0 animate-pulse"
                title="Unsaved changes"
              />
            )}

            <button
              onClick={(e) => {
                e.stopPropagation();
                onTabClose(tab.id);
              }}
              className="p-0.5 rounded text-[#8b949e] opacity-0 group-hover:opacity-100 hover:bg-[#30363d] hover:text-[#f85149] transition-all ml-1"
              aria-label={`Close ${tab.name}`}
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

>>>>>>> 1fedef5cdf2fa8631c20411f700509b8bbdcb0e2
