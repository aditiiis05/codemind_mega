'use client';

// client/components/ai/AIAssistantPanel.tsx
<<<<<<< HEAD
// Visual Studio style AI Assistant panel (Chat | Suggest | Explain | Voice).
// Styled to official VS Code Dark+ guidelines with no AI color gradients.

import { useState } from 'react';
import { MessageSquare, Sparkles, BookOpen, Volume2, ChevronRight, MoreHorizontal } from 'lucide-react';
=======
// Unified 4-tab AI Assistant panel (Chat | Suggest | Explain | Voice).
// Wraps AIChatView, AISuggestionsPanel, CodeExplanationPanel, and VoiceExplanation.
// No changes are made to any of those child components.

import { useState } from 'react';
import { MessageSquare, Sparkles, BookOpen, Volume2 } from 'lucide-react';
>>>>>>> 1fedef5cdf2fa8631c20411f700509b8bbdcb0e2
import AIChatView from '../views/AIChatView';
import VoiceExplanation from '../voice/VoiceExplanation';
import AISuggestionsPanel from './AISuggestionsPanel';
import CodeExplanationPanel from './CodeExplanationPanel';
import { FlowNode } from '@/types/flowchart';
import { EditorSelection } from '@/types/voice';

<<<<<<< HEAD
export interface AIAssistantPanelProps {
=======
interface AIAssistantPanelProps {
  // Shared context
>>>>>>> 1fedef5cdf2fa8631c20411f700509b8bbdcb0e2
  editorSelection?: EditorSelection | null;
  currentFile?: string | null;
  code?: string | null;
  language?: string | null;
  selectedNode?: FlowNode | null;
<<<<<<< HEAD
  sessionId?: string | null;
  onClearSelectedNode?: () => void;
  onNavigateToCode?: (file: string, lineStart: number, lineEnd?: number) => void;
=======

  // Chat tab
  sessionId?: string | null;
  onClearSelectedNode?: () => void;
  onNavigateToCode?: (file: string, lineStart: number, lineEnd?: number) => void;

  // Suggestions tab
>>>>>>> 1fedef5cdf2fa8631c20411f700509b8bbdcb0e2
  onApplySuggestion?: (suggestion: string) => void;
  onAnalyzeRepo?: () => void;
  isAnalyzing?: boolean;
  analysisResult?: string;
  repoAvailable?: boolean;
<<<<<<< HEAD
  onClose?: () => void;
=======
>>>>>>> 1fedef5cdf2fa8631c20411f700509b8bbdcb0e2
}

type Tab = 'chat' | 'suggest' | 'explain' | 'voice';

<<<<<<< HEAD
const TABS: { id: Tab; label: string; icon: React.ComponentType<{ size?: number; className?: string }> }[] = [
  { id: 'chat', label: 'Chat', icon: MessageSquare },
  { id: 'suggest', label: 'Suggest', icon: Sparkles },
  { id: 'explain', label: 'Explain', icon: BookOpen },
  { id: 'voice', label: 'Voice', icon: Volume2 },
=======
const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'chat', label: 'Chat', icon: <MessageSquare size={12} /> },
  { id: 'suggest', label: 'Suggest', icon: <Sparkles size={12} /> },
  { id: 'explain', label: 'Explain', icon: <BookOpen size={12} /> },
  { id: 'voice', label: 'Voice', icon: <Volume2 size={12} /> },
>>>>>>> 1fedef5cdf2fa8631c20411f700509b8bbdcb0e2
];

export default function AIAssistantPanel({
  editorSelection = null,
  currentFile = null,
  code = null,
  language = null,
  selectedNode = null,
  sessionId = null,
  onClearSelectedNode = () => {},
  onNavigateToCode,
  onApplySuggestion = () => {},
  onAnalyzeRepo = () => {},
  isAnalyzing = false,
  analysisResult = '',
  repoAvailable = false,
<<<<<<< HEAD
  onClose,
=======
>>>>>>> 1fedef5cdf2fa8631c20411f700509b8bbdcb0e2
}: AIAssistantPanelProps) {
  const [activeTab, setActiveTab] = useState<Tab>('chat');

  return (
<<<<<<< HEAD
    <div className="flex flex-col h-full bg-[#1e1e1e] text-[#cccccc] overflow-hidden select-none">
      {/* ── VS Code Style Panel Header: ✦ CHAT ── */}
      <div className="h-[35px] px-3.5 border-b border-[#2b2b2b] bg-[#1e1e1e] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="text-[#388bfd]" />
          <span className="text-xs font-bold uppercase tracking-wider text-[#e0e0e0]">
            CHAT
          </span>
        </div>

        <div className="flex items-center gap-1 text-[#858585]">
          <button
            className="p-1 rounded hover:text-white hover:bg-[#2a2d2e] transition-colors cursor-pointer"
            title="More Options..."
          >
            <MoreHorizontal size={14} />
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded text-[#858585] hover:text-white hover:bg-[#2a2d2e] transition-colors cursor-pointer"
              title="Collapse Assistant"
              aria-label="Collapse Assistant"
            >
              <ChevronRight size={14} />
            </button>
          )}
        </div>
      </div>

      {/* ── VS Code Style Tab Bar (Flat with Active Border-Bottom) ── */}
      <div className="h-[32px] px-2 border-b border-[#2b2b2b] bg-[#252526] flex items-center shrink-0">
        <div className="flex items-center gap-1 w-full" role="tablist">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                onClick={() => setActiveTab(tab.id)}
                aria-selected={isActive}
                className={`flex-1 h-[32px] flex items-center justify-center gap-1.5 px-2 text-xs font-medium transition-colors cursor-pointer relative ${
                  isActive
                    ? 'text-white border-b-2 border-[#007acc] font-semibold bg-[#1e1e1e]/40'
                    : 'text-[#858585] hover:text-[#cccccc] hover:bg-[#2a2d2e]/50'
                }`}
              >
                <Icon size={13} className={isActive ? 'text-[#007acc]' : 'text-[#858585]'} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Context hint banner when in Voice tab ── */}
      {activeTab === 'voice' && (currentFile || selectedNode) && (
        <div className="text-[11px] text-[#858585] px-3 py-1.5 shrink-0 border-b border-[#2b2b2b] bg-[#1e1e1e] flex items-center justify-between">
          <span className="truncate">
            {selectedNode
              ? `Node: ${selectedNode.label}`
              : `File: ${currentFile?.split('/').pop()?.split('\\').pop() ?? currentFile}`}
          </span>
          <span className="text-[#75beff] text-[10px] font-mono">
            TTS Engine
          </span>
        </div>
      )}

      {/* ── Active Tab Content Body ── */}
      <div className="flex-1 overflow-hidden min-h-0 bg-[#1e1e1e]">
=======
    <div className="flex flex-col h-full overflow-hidden select-none">
      {/* ── Segmented Tab bar ── */}
      <div className="p-2 border-b border-[#30363d] bg-[#161b22] shrink-0">
        <div className="grid grid-cols-4 p-0.5 bg-[#0d1117] rounded-md border border-[#30363d] gap-0.5" role="tablist">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              onClick={() => setActiveTab(tab.id)}
              aria-selected={activeTab === tab.id}
              className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded text-xs font-semibold transition-all duration-150 ${
                activeTab === tab.id
                  ? 'bg-[#1f6feb] text-white shadow-sm ring-1 ring-[#58a6ff]/40'
                  : 'text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#21262d]'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Fix 2: Context hint below tab bar when on Voice tab */}
      {activeTab === 'voice' && (currentFile || selectedNode) && (
        <p className="text-[10px] text-[#8b949e] px-3 pt-1 pb-1 shrink-0 border-b border-[#21262d] bg-[#161b22]">
          {selectedNode
            ? `Node: ${selectedNode.label}`
            : `Explaining: ${currentFile?.split('/').pop()?.split('\\').pop() ?? currentFile}`
          }
        </p>
      )}

      {/* ── Tab content ── */}
      <div className="flex-1 overflow-hidden min-h-0">
>>>>>>> 1fedef5cdf2fa8631c20411f700509b8bbdcb0e2
        {activeTab === 'chat' && (
          <AIChatView
            selectedNode={selectedNode}
            code={code}
            fileName={currentFile}
            language={language}
            sessionId={sessionId}
            onClearSelectedNode={onClearSelectedNode}
            onNavigateToCode={onNavigateToCode}
          />
        )}

        {activeTab === 'suggest' && (
<<<<<<< HEAD
          <div className="h-full overflow-y-auto ide-scrollbar bg-[#1e1e1e]">
            <AISuggestionsPanel
              code={code}
              language={language}
              fileName={currentFile}
              onApplySuggestion={onApplySuggestion}
              onAnalyzeRepo={onAnalyzeRepo}
              isAnalyzing={isAnalyzing}
              analysisResult={analysisResult}
              repoAvailable={repoAvailable}
            />
          </div>
        )}

        {activeTab === 'explain' && (
          <div className="h-full overflow-y-auto ide-scrollbar bg-[#1e1e1e]">
            <CodeExplanationPanel
              editorSelection={editorSelection}
              currentFile={currentFile}
              code={code}
              language={language}
              selectedNode={selectedNode}
            />
          </div>
        )}

        {activeTab === 'voice' && (
          <div className="h-full overflow-y-auto ide-scrollbar bg-[#1e1e1e]">
            <VoiceExplanation
              editorSelection={editorSelection}
              currentFile={currentFile}
              code={code}
              language={language}
              selectedNode={selectedNode}
            />
          </div>
=======
          <AISuggestionsPanel
            code={code}
            language={language}
            fileName={currentFile}
            onApplySuggestion={onApplySuggestion}
            onAnalyzeRepo={onAnalyzeRepo}
            isAnalyzing={isAnalyzing}
            analysisResult={analysisResult}
            repoAvailable={repoAvailable}
          />
        )}

        {activeTab === 'explain' && (
          <CodeExplanationPanel
            editorSelection={editorSelection}
            currentFile={currentFile}
            code={code}
            language={language}
            selectedNode={selectedNode}
          />
        )}

        {activeTab === 'voice' && (
          <VoiceExplanation
            selectedNode={selectedNode}
            editorSelection={editorSelection}
            currentFile={currentFile}
            code={code}
            language={language}
          />
>>>>>>> 1fedef5cdf2fa8631c20411f700509b8bbdcb0e2
        )}
      </div>
    </div>
  );
}
