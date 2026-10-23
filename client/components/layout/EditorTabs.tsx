'use client';

import { X, FileCode } from 'lucide-react';

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
}

export default function EditorTabs({
  tabs,
  activeTabId,
  onTabClick,
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

