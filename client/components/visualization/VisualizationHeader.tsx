// client/components/visualization/VisualizationHeader.tsx
'use client';

import React from 'react';
import { GitBranch, Activity, Maximize2, Minimize2, Expand } from 'lucide-react';

interface VisualizationHeaderProps {
  activeTab: 'flowchart' | 'mindmap';
  onTabChange: (tab: 'flowchart' | 'mindmap') => void;
  fileName?: string | null;
  onRefresh?: () => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
  onOpenFullView?: () => void;
}

export default function VisualizationHeader({
  activeTab,
  onTabChange,
  isFullscreen = false,
  onToggleFullscreen,
  onOpenFullView,
}: VisualizationHeaderProps) {
  return (
    <div className="h-[38px] px-3 bg-[#1e1e1e] border-b border-[#2b2b2b] flex items-center justify-between shrink-0 select-none">
      {/* Tabs */}
      <div className="flex items-center gap-0.5">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'flowchart'}
          onClick={() => onTabChange('flowchart')}
          className={`flex items-center gap-1.5 px-3 h-[38px] text-[12px] font-medium border-b-2 transition-colors cursor-pointer ${
            activeTab === 'flowchart'
              ? 'text-white border-[#007acc]'
              : 'text-[#858585] border-transparent hover:text-[#cccccc]'
          }`}
        >
          <GitBranch size={13} />
          <span>Flowchart</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'mindmap'}
          onClick={() => onTabChange('mindmap')}
          className={`flex items-center gap-1.5 px-3 h-[38px] text-[12px] font-medium border-b-2 transition-colors cursor-pointer ${
            activeTab === 'mindmap'
              ? 'text-white border-[#007acc]'
              : 'text-[#858585] border-transparent hover:text-[#cccccc]'
          }`}
        >
          <Activity size={13} />
          <span>Mind Map</span>
        </button>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-1">
        {onOpenFullView && activeTab === 'flowchart' && (
          <button
            type="button"
            onClick={onOpenFullView}
            title="Open in Full View"
            className="p-1.5 rounded text-[#858585] hover:text-white hover:bg-[#2a2d2e] transition-colors cursor-pointer"
          >
            <Expand size={13} />
          </button>
        )}
        {onToggleFullscreen && (
          <button
            type="button"
            onClick={onToggleFullscreen}
            title={isFullscreen ? 'Exit Full Screen (Esc)' : 'Full Screen'}
            className="p-1.5 rounded text-[#858585] hover:text-white hover:bg-[#2a2d2e] transition-colors cursor-pointer"
          >
            {isFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
          </button>
        )}
      </div>
    </div>
  );
}
