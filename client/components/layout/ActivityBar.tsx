'use client';

<<<<<<< HEAD
import React from 'react';
import {
  Files,
  Search,
  GitBranch,
  Network,
  Play,
  Puzzle,
  Sparkles,
  Settings,
  User,
  Code2
} from 'lucide-react';
import Link from 'next/link';

export interface ActivityBarProps {
  activeView: string;
  isAIOpen?: boolean;
  onViewChange: (view: string) => void;
  onOpenSettings?: () => void;
  userLogin?: string;
}

interface ActivityItem {
  id: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  badge?: string | number;
}

const mainActivities: ActivityItem[] = [
  { id: 'explorer', icon: Files, label: 'Explorer (Ctrl+Shift+E)' },
  { id: 'search', icon: Search, label: 'Search (Ctrl+Shift+F)' },
  { id: 'git', icon: GitBranch, label: 'Source Control (Ctrl+Shift+G)', badge: 1 },
  { id: 'visualization', icon: Network, label: 'Flowchart & Architecture (Ctrl+Shift+M)' },
  { id: 'ai', icon: Sparkles, label: 'AI Assistant (Ctrl+Shift+I)' },
  { id: 'debug', icon: Play, label: 'Run and Debug (Ctrl+Shift+D)' },
  { id: 'extensions', icon: Puzzle, label: 'Extensions (Ctrl+Shift+X)' },
];

export default function ActivityBar({
  activeView,
  isAIOpen = false,
  onViewChange,
  onOpenSettings,
  userLogin,
}: ActivityBarProps) {
  return (
    <aside
      className="w-[48px] shrink-0 bg-[#181818] border-r border-[#2b2b2b] flex flex-col items-center py-1 select-none z-30 justify-between h-full"
      aria-label="Activity Bar"
    >
      {/* ── Top Section: Logo & Main Navigation ── */}
      <div className="w-full flex flex-col items-center">
        {/* Visual Studio / Code Icon */}
        <Link
          href="/"
          title="CodeMind.AI IDE"
          className="w-[48px] h-[40px] flex items-center justify-center text-[#007acc] hover:text-[#1177bb] transition-colors"
        >
          <Code2 size={22} className="stroke-[2.2]" />
        </Link>

        {/* Navigation Items */}
        <nav className="flex flex-col items-center w-full" aria-label="Views">
          {mainActivities.map(({ id, icon: Icon, label, badge }) => {
            const isActive = id === 'ai' ? (isAIOpen || activeView === 'ai') : activeView === id;
            return (
              <div key={id} className="relative group w-full flex justify-center">
                <button
                  type="button"
                  onClick={() => onViewChange(id)}
                  className={`relative w-[48px] h-[46px] flex items-center justify-center transition-colors cursor-pointer ${
                    isActive
                      ? 'text-[#ffffff] bg-transparent'
                      : 'text-[#858585] hover:text-[#ffffff]'
                  }`}
                  aria-label={label}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {/* Narrow active-view indicator */}
                  {isActive && (
                    <span className="absolute left-0 top-0 bottom-0 w-[2px] bg-[#007acc]" />
                  )}
                  <Icon size={20} className="stroke-[1.7]" />

                  {/* Badge */}
                  {badge !== undefined && (
                    <span className="absolute top-2 right-2 min-w-[14px] h-[14px] px-1 bg-[#007acc] text-white rounded-full text-[9px] font-mono font-bold flex items-center justify-center">
                      {badge}
                    </span>
                  )}
                </button>

                {/* VS Code Native Style Tooltip */}
                <div
                  role="tooltip"
                  className="absolute left-[52px] top-1/2 -translate-y-1/2 hidden group-hover:flex items-center px-2 py-1 rounded-[2px] bg-[#252526] border border-[#454545] text-[11px] text-[#cccccc] shadow-md whitespace-nowrap pointer-events-none z-50 font-normal"
                >
                  {label}
                </div>
              </div>
            );
          })}
        </nav>
      </div>

      {/* ── Bottom Section: Profile & Settings ── */}
      <div className="flex flex-col items-center w-full pb-1 border-t border-[#2b2b2b]">
        {/* User Account / Profile */}
        <div className="relative group w-full flex justify-center">
          <button
            type="button"
            className="w-[48px] h-[44px] flex items-center justify-center text-[#858585] hover:text-[#ffffff] transition-colors cursor-pointer"
            aria-label="Accounts"
          >
            <User size={19} className="stroke-[1.7]" />
          </button>
          <div
            role="tooltip"
            className="absolute left-[52px] top-1/2 -translate-y-1/2 hidden group-hover:flex items-center px-2 py-1 rounded-[2px] bg-[#252526] border border-[#454545] text-[11px] text-[#cccccc] shadow-md whitespace-nowrap pointer-events-none z-50 font-normal"
          >
            Accounts ({userLogin || 'GitHub User'})
          </div>
        </div>

        {/* Settings Gear Button */}
        <div className="relative group w-full flex justify-center">
          <button
            type="button"
            onClick={() => {
              if (onOpenSettings) onOpenSettings();
              else onViewChange('settings');
            }}
            className={`w-[48px] h-[44px] flex items-center justify-center transition-colors cursor-pointer ${
              activeView === 'settings'
                ? 'text-[#ffffff]'
                : 'text-[#858585] hover:text-[#ffffff]'
            }`}
            aria-label="Settings"
          >
            {activeView === 'settings' && (
              <span className="absolute left-0 top-0 bottom-0 w-[2px] bg-[#007acc]" />
            )}
            <Settings size={19} className="stroke-[1.7]" />
          </button>
          <div
            role="tooltip"
            className="absolute left-[52px] top-1/2 -translate-y-1/2 hidden group-hover:flex items-center px-2 py-1 rounded-[2px] bg-[#252526] border border-[#454545] text-[11px] text-[#cccccc] shadow-md whitespace-nowrap pointer-events-none z-50 font-normal"
          >
            Settings (Ctrl+,)
          </div>
        </div>
      </div>
    </aside>
=======
import { FileText, Search, GitBranch, Zap, Settings, MoreHorizontal, Network } from 'lucide-react';

interface ActivityBarProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

const activities = [
  { id: 'explorer', icon: FileText, label: 'Explorer', color: 'text-blue-400' },
  { id: 'search', icon: Search, label: 'Search', color: 'text-green-400' },
  { id: 'git', icon: GitBranch, label: 'Source Control', color: 'text-purple-400' },
  { id: 'mindmap', icon: Network, label: 'Flowchart', color: 'text-cyan-400' },
  { id: 'ai', icon: Zap, label: 'AI Assistant', color: 'text-orange-400' },
];

export default function ActivityBar({ activeView, onViewChange }: ActivityBarProps) {
  return (
    <div className="w-14 bg-gradient-to-b from-[#2d2d30] to-[#1e1e1e] border-r border-[#3e3e42]/50 flex flex-col items-center py-4 gap-4 shadow-lg relative z-20">
      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }

        .activity-icon {
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
          padding: 8px;
          border-radius: 6px;
          position: relative;
        }

        .activity-icon:hover {
          background: rgba(255, 255, 255, 0.08);
          transform: scale(1.1);
        }

        .activity-icon.active {
          background: rgba(14, 165, 233, 0.15);
          box-shadow: inset 0 0 0 2px rgba(14, 165, 233, 0.5), 0 0 15px rgba(14, 165, 233, 0.3);
        }

        .activity-icon.active::before {
          content: '';
          position: absolute;
          left: -8px;
          top: 50%;
          transform: translateY(-50%);
          width: 3px;
          height: 24px;
          background: linear-gradient(to bottom, #0ea5e9, transparent);
          border-radius: 3px;
        }

        .tooltip {
          position: absolute;
          left: full;
          background: rgba(0, 0, 0, 0.9);
          color: white;
          padding: 6px 8px;
          border-radius: 4px;
          font-size: 12px;
          white-space: nowrap;
          pointer-events: none;
          opacity: 0;
          transform: translateX(10px);
          transition: all 0.2s ease;
          z-index: 50;
        }

        .activity-icon:hover .tooltip {
          opacity: 1;
          transform: translateX(16px);
        }
      `}</style>

      <div className="flex flex-col gap-2">
        {activities.map(({ id, icon: Icon, label }) => (
          <div key={id} className="relative group">
            <button
              onClick={() => onViewChange(id)}
              className={`activity-icon ${activeView === id ? 'active' : ''}`}
              aria-label={label}
            >
              <Icon size={20} className={activeView === id ? 'text-[#0ea5e9]' : 'text-[#cccccc] group-hover:text-white'} />
              <div className="tooltip">{label}</div>
            </button>
          </div>
        ))}
      </div>

      <div className="flex-1" />

      <div className="flex flex-col gap-2">
        <button
          onClick={() => {}}
          className="activity-icon hover:bg-[#3e3e42]/50"
          aria-label="More"
        >
          <MoreHorizontal size={20} className="text-[#858585] hover:text-[#cccccc]" />
          <div className="tooltip">More</div>
        </button>

        <button
          onClick={() => {}}
          className="activity-icon hover:bg-[#3e3e42]/50"
          aria-label="Settings"
        >
          <Settings size={20} className="text-[#858585] hover:text-[#cccccc]" />
          <div className="tooltip">Settings</div>
        </button>
      </div>
    </div>
>>>>>>> 1fedef5cdf2fa8631c20411f700509b8bbdcb0e2
  );
}
