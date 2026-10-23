'use client';

// client/components/ai/AIAssistantPanel.tsx
// Unified 4-tab AI Assistant panel (Chat | Suggest | Explain | Voice).
// Wraps AIChatView, AISuggestionsPanel, CodeExplanationPanel, and VoiceExplanation.
// No changes are made to any of those child components.

import { useState } from 'react';
import { MessageSquare, Sparkles, BookOpen, Volume2 } from 'lucide-react';
import AIChatView from '../views/AIChatView';
import VoiceExplanation from '../voice/VoiceExplanation';
import AISuggestionsPanel from './AISuggestionsPanel';
import CodeExplanationPanel from './CodeExplanationPanel';
import { FlowNode } from '@/types/flowchart';
import { EditorSelection } from '@/types/voice';

interface AIAssistantPanelProps {
  // Shared context
  editorSelection?: EditorSelection | null;
  currentFile?: string | null;
  code?: string | null;
  language?: string | null;
  selectedNode?: FlowNode | null;

  // Chat tab
  sessionId?: string | null;
  onClearSelectedNode?: () => void;
  onNavigateToCode?: (file: string, lineStart: number, lineEnd?: number) => void;

  // Suggestions tab
  onApplySuggestion?: (suggestion: string) => void;
  onAnalyzeRepo?: () => void;
  isAnalyzing?: boolean;
  analysisResult?: string;
  repoAvailable?: boolean;
}

type Tab = 'chat' | 'suggest' | 'explain' | 'voice';

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'chat', label: 'Chat', icon: <MessageSquare size={12} /> },
  { id: 'suggest', label: 'Suggest', icon: <Sparkles size={12} /> },
  { id: 'explain', label: 'Explain', icon: <BookOpen size={12} /> },
  { id: 'voice', label: 'Voice', icon: <Volume2 size={12} /> },
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
}: AIAssistantPanelProps) {
  const [activeTab, setActiveTab] = useState<Tab>('chat');

  return (
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
        )}
      </div>
    </div>
  );
}
