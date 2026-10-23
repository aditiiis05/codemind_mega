'use client';

import React, { useState } from 'react';
import { X, ChevronDown, ChevronUp, Terminal, AlertCircle, FileText, Bug } from 'lucide-react';

interface PanelProps {
  isOpen?: boolean;
  onClose?: () => void;
}

type BottomTab = 'problems' | 'output' | 'debug' | 'terminal';

export default function Panel({ onClose }: PanelProps) {
  const [activeTab, setActiveTab] = useState<BottomTab>('terminal');
  const [isCollapsed, setIsCollapsed] = useState(true);

  const tabs: Array<{ id: BottomTab; label: string; icon: React.ReactNode; badge?: string }> = [
    { id: 'problems', label: 'Problems', icon: <AlertCircle size={12} />, badge: '0' },
    { id: 'output', label: 'Output', icon: <FileText size={12} /> },
    { id: 'debug', label: 'Debug Console', icon: <Bug size={12} /> },
    { id: 'terminal', label: 'Terminal', icon: <Terminal size={12} /> },
  ];

  return (
    <div
      className={`shrink-0 bg-[#161b22] border-t border-[#30363d] flex flex-col transition-all duration-200 select-none ${
        isCollapsed ? 'h-7' : 'h-40'
      }`}
    >
      {/* ── Panel Header Bar ── */}
      <div className="h-7 flex items-center justify-between px-3 bg-[#1c2128] border-b border-[#30363d]/60 shrink-0">
        <div className="flex items-center gap-1 h-full">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id);
                  if (isCollapsed) setIsCollapsed(false);
                }}
                className={`flex items-center gap-1.5 px-2.5 h-full text-[11px] font-medium transition-colors border-b-2 ${
                  isActive && !isCollapsed
                    ? 'text-[#58a6ff] border-[#1f6feb] bg-[#161b22]'
                    : 'text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#21262d] border-transparent'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="px-1 py-0.2 rounded-full text-[9px] bg-[#21262d] text-[#8b949e] border border-[#30363d]">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setIsCollapsed((prev) => !prev)}
            aria-label={isCollapsed ? 'Expand panel' : 'Collapse panel'}
            title={isCollapsed ? 'Expand panel' : 'Collapse panel'}
            className="p-1 text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#21262d] rounded transition-colors"
          >
            {isCollapsed ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close panel"
              title="Close panel"
              className="p-1 text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#21262d] rounded transition-colors"
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* ── Panel Content Body (hidden when collapsed) ── */}
      {!isCollapsed && (
        <div className="flex-1 overflow-y-auto p-3 text-xs font-mono bg-[#0d1117] text-[#c9d1d9] min-h-0">
          {activeTab === 'problems' && (
            <div className="flex items-center justify-center h-full text-[#8b949e] text-center">
              <div>
                <AlertCircle size={20} className="mx-auto mb-1 text-[#3fb950]" />
                <p className="text-[11px]">No problems have been detected in the workspace.</p>
              </div>
            </div>
          )}

          {activeTab === 'output' && (
            <div className="space-y-1 text-[11px] leading-relaxed text-[#8b949e]">
              <p className="text-[#3fb950]">[CodeMind] Language Server initialized.</p>
              <p>[CodeMind] Real-time AST parser ready.</p>
              <p>[CodeMind] AI assistant telemetry active.</p>
              <p>[CodeMind] Control flow graph engine standing by.</p>
            </div>
          )}

          {activeTab === 'debug' && (
            <div className="flex items-center justify-center h-full text-[#8b949e] text-center">
              <p className="text-[11px]">Debugger is idle. Set a breakpoint or run project analysis.</p>
            </div>
          )}

          {activeTab === 'terminal' && (
            <div className="space-y-1 text-[11px] leading-relaxed">
              <p className="text-[#8b949e]">CodeMind.AI Embedded Terminal [Version 1.0.0]</p>
              <p className="text-[#8b949e]">(c) CodeMind AI Corporation. All rights reserved.</p>
              <div className="flex items-center gap-1.5 pt-2 text-[#58a6ff]">
                <span>codemind@ide:~/workspace$</span>
                <span className="w-1.5 h-3.5 bg-[#58a6ff] animate-pulse inline-block" />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
