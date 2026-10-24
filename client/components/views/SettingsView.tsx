'use client';

<<<<<<< HEAD
import React from 'react';
import {
  Palette,
  Type,
  Eye,
  Bot,
  Bell,
  Github,
  Info,
  Check,
  ChevronDown
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { ThemeName } from '@/lib/theme';

const THEMES: Array<{ id: ThemeName; name: string; previewBg: string; previewAccent: string }> = [
  { id: 'darkPlus', name: 'Dark+ (default)', previewBg: '#1e1e1e', previewAccent: '#007acc' },
  { id: 'monokai', name: 'Monokai', previewBg: '#272822', previewAccent: '#fd971f' },
  { id: 'githubDark', name: 'GitHub Dark', previewBg: '#0d1117', previewAccent: '#58a6ff' },
  { id: 'oneDark', name: 'One Dark Pro', previewBg: '#282c34', previewAccent: '#61afef' },
  { id: 'dracula', name: 'Dracula', previewBg: '#282a36', previewAccent: '#bd93f9' },
];

export default function SettingsView() {
  const {
    themeName,
    setThemeName,
    fontSize,
    setFontSize,
    lineNumbers,
    setLineNumbers,
    minimap,
    setMinimap,
    aiModel,
    setAiModel,
    notifications,
    setNotifications,
  } = useTheme();

  return (
    <div className="h-full flex flex-col bg-[#252526] text-[#cccccc] select-none text-xs">
      {/* ── Header ── */}
      <div className="h-[35px] px-3 border-b border-[#2b2b2b] flex items-center justify-between shrink-0">
        <span className="text-[11px] uppercase tracking-wider font-semibold text-[#858585]">
          SETTINGS
        </span>
      </div>

      {/* ── Settings Content Body ── */}
      <div className="flex-1 overflow-y-auto ide-scrollbar p-3 space-y-4">
        {/* 1. THEME SELECTOR */}
        <section className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
            <Palette size={14} className="text-[#007acc]" />
            <span>Color Theme</span>
          </div>
          <p className="text-[11px] text-[#858585]">
            Select one of the five documented VS Code themes:
          </p>
          <div className="space-y-1">
            {THEMES.map((t) => {
              const isSelected = themeName === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setThemeName(t.id)}
                  className={`w-full p-2 rounded flex items-center justify-between border transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-[#1e1e1e] border-[#007acc] text-white shadow-sm'
                      : 'bg-[#1e1e1e]/60 border-[#3c3c3c] text-[#cccccc] hover:bg-[#2a2d2e]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-white/20"
                      style={{ backgroundColor: t.previewBg }}
                    />
                    <span className="font-medium text-xs">{t.name}</span>
                  </div>
                  {isSelected && <Check size={14} className="text-[#007acc]" />}
                </button>
              );
            })}
          </div>
        </section>

        {/* 2. FONT SIZE & EDITOR DISPLAY */}
        <section className="space-y-2 pt-2 border-t border-[#2b2b2b]">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
            <Type size={14} className="text-[#007acc]" />
            <span>Editor Typography</span>
          </div>

          <div className="flex items-center justify-between p-2 rounded bg-[#1e1e1e] border border-[#3c3c3c]">
            <div>
              <div className="font-medium">Font Size</div>
              <div className="text-[11px] text-[#858585]">Controls editor font in pixels</div>
            </div>
            <div className="flex items-center gap-1">
              {[12, 13, 14, 16].map((size) => (
                <button
                  key={size}
                  onClick={() => setFontSize(size)}
                  className={`px-2 py-0.5 rounded text-xs font-mono transition-colors cursor-pointer ${
                    fontSize === size
                      ? 'bg-[#007acc] text-white font-bold'
                      : 'bg-[#252526] text-[#858585] hover:text-white'
                  }`}
                >
                  {size}px
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between p-2 rounded bg-[#1e1e1e] border border-[#3c3c3c]">
            <div>
              <div className="font-medium">Line Numbers</div>
              <div className="text-[11px] text-[#858585]">Display line numbers in editor gutter</div>
            </div>
            <div className="flex items-center gap-1">
              {(['on', 'off', 'relative'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setLineNumbers(mode)}
                  className={`px-2 py-0.5 rounded text-xs font-mono capitalize transition-colors cursor-pointer ${
                    lineNumbers === mode
                      ? 'bg-[#007acc] text-white font-bold'
                      : 'bg-[#252526] text-[#858585] hover:text-white'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between p-2 rounded bg-[#1e1e1e] border border-[#3c3c3c]">
            <div>
              <div className="font-medium">Minimap</div>
              <div className="text-[11px] text-[#858585]">Shows miniature code overview</div>
            </div>
            <button
              onClick={() => setMinimap(!minimap)}
              className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                minimap ? 'bg-[#007acc]' : 'bg-[#3c3c3c]'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                  minimap ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </section>

        {/* 3. AI CONFIGURATION */}
        <section className="space-y-2 pt-2 border-t border-[#2b2b2b]">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
            <Bot size={14} className="text-[#007acc]" />
            <span>AI Assistant Engine</span>
          </div>

          <div className="p-2 rounded bg-[#1e1e1e] border border-[#3c3c3c] space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-[#858585]">Model:</span>
              <select
                value={aiModel}
                onChange={(e) => setAiModel(e.target.value)}
                className="bg-[#252526] border border-[#3c3c3c] text-white rounded px-2 py-0.5 focus:outline-none font-mono text-[11px]"
              >
                <option value="claude-3-7-sonnet">Claude 3.7 Sonnet (Hybrid)</option>
                <option value="gpt-4o">OpenAI GPT-4o</option>
                <option value="deepseek-r1">Ollama DeepSeek-R1 (Local)</option>
                <option value="codemind-v2">CodeMind Neural Core v2</option>
              </select>
            </div>
            <div className="flex justify-between items-center text-[11px] text-[#858585]">
              <span>API Gateway:</span>
              <span className="text-[#73c991] font-mono">http://localhost:4000</span>
            </div>
          </div>
        </section>

        {/* 4. NOTIFICATIONS */}
        <section className="space-y-2 pt-2 border-t border-[#2b2b2b]">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
            <Bell size={14} className="text-[#007acc]" />
            <span>Notifications</span>
          </div>

          <div className="flex items-center justify-between p-2 rounded bg-[#1e1e1e] border border-[#3c3c3c]">
            <div>
              <div className="font-medium">System Toast Alerts</div>
              <div className="text-[11px] text-[#858585]">Notify on git sync & linter diagnostics</div>
            </div>
            <button
              onClick={() => setNotifications(!notifications)}
              className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                notifications ? 'bg-[#007acc]' : 'bg-[#3c3c3c]'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                  notifications ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </section>

        {/* 5. GITHUB CONNECTION STATUS */}
        <section className="space-y-2 pt-2 border-t border-[#2b2b2b]">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
            <Github size={14} className="text-[#007acc]" />
            <span>GitHub Connection</span>
          </div>

          <div className="p-2.5 rounded bg-[#1e1e1e] border border-[#3c3c3c] space-y-1 font-mono text-[11px]">
            <div className="flex justify-between items-center">
              <span className="text-[#858585]">Status:</span>
              <span className="text-[#73c991] font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#73c991]" />
                Connected
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#858585]">OAuth Scope:</span>
              <span className="text-[#cccccc]">repo, read:user</span>
            </div>
          </div>
        </section>

        {/* 6. SYSTEM INFORMATION */}
        <section className="space-y-2 pt-2 border-t border-[#2b2b2b]">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
            <Info size={14} className="text-[#007acc]" />
            <span>System Information</span>
          </div>

          <div className="p-2.5 rounded bg-[#1e1e1e] border border-[#3c3c3c] font-mono text-[11px] space-y-1 text-[#858585]">
            <div className="flex justify-between">
              <span>CodeMind IDE:</span>
              <span className="text-white">v2.4.0</span>
            </div>
            <div className="flex justify-between">
              <span>Framework:</span>
              <span className="text-white">Next.js 15 (App Router)</span>
            </div>
            <div className="flex justify-between">
              <span>Monaco Editor:</span>
              <span className="text-white">v0.44.0</span>
            </div>
            <div className="flex justify-between">
              <span>Platform:</span>
              <span className="text-white">macOS / Darwin</span>
            </div>
          </div>
        </section>
=======
import { Palette, Volume2, Bell, Eye } from 'lucide-react';
import { useState } from 'react';

export default function SettingsView() {
  const [theme, setTheme] = useState('dark');
  const [fontSize, setFontSize] = useState(12);
  const [notifications, setNotifications] = useState(true);
  const [minimap, setMinimap] = useState(true);

  return (
    <div className="h-full flex flex-col bg-[#252526] overflow-hidden">
      <style jsx>{`
        .settings-content {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
        }

        .settings-content::-webkit-scrollbar {
          width: 8px;
        }

        .settings-content::-webkit-scrollbar-track {
          background: transparent;
        }

        .settings-content::-webkit-scrollbar-thumb {
          background: rgba(128, 128, 128, 0.3);
          border-radius: 4px;
        }

        .settings-content::-webkit-scrollbar-thumb:hover {
          background: rgba(128, 128, 128, 0.5);
        }

        .settings-section {
          margin-bottom: 24px;
        }

        .section-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #0ea5e9;
          margin-bottom: 12px;
          padding-bottom: 8px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .setting-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px;
          margin-bottom: 8px;
          border-radius: 4px;
          background: rgba(255, 255, 255, 0.02);
          transition: all 0.2s ease;
        }

        .setting-item:hover {
          background: rgba(255, 255, 255, 0.05);
        }

        .setting-label {
          display: flex;
          flex-direction: column;
          gap: 2px;
          font-size: 12px;
          color: #cccccc;
        }

        .setting-description {
          font-size: 11px;
          color: #858585;
        }

        .toggle-switch {
          position: relative;
          width: 36px;
          height: 20px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s ease;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .toggle-switch.active {
          background: #0ea5e9;
          border-color: #0ea5e9;
        }

        .toggle-switch::after {
          content: '';
          position: absolute;
          top: 2px;
          left: 2px;
          width: 16px;
          height: 16px;
          background: white;
          border-radius: 50%;
          transition: all 0.2s ease;
        }

        .toggle-switch.active::after {
          transform: translateX(16px);
        }

        .select-control {
          padding: 6px 10px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 4px;
          color: #cccccc;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .select-control:hover {
          border-color: #0ea5e9;
          background: rgba(14, 165, 233, 0.1);
        }

        .slider {
          width: 80px;
          height: 4px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 2px;
          outline: none;
          cursor: pointer;
        }

        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 12px;
          height: 12px;
          background: #0ea5e9;
          border-radius: 50%;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .slider::-webkit-slider-thumb:hover {
          transform: scale(1.2);
          box-shadow: 0 0 8px rgba(14, 165, 233, 0.5);
        }

        .slider-value {
          font-size: 11px;
          color: #858585;
          min-width: 30px;
          text-align: right;
        }
      `}</style>

      <div className="settings-content">
        <div className="settings-section">
          <div className="section-title">
            <Palette size={14} />
            Appearance
          </div>
          <div className="setting-item">
            <div className="setting-label">
              <span>Theme</span>
              <span className="setting-description">Choose color scheme</span>
            </div>
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="select-control"
            >
              <option value="dark">Dark</option>
              <option value="light">Light</option>
              <option value="auto">Auto</option>
            </select>
          </div>

          <div className="setting-item">
            <div className="setting-label">
              <span>Font Size</span>
              <span className="setting-description">Editor font size in pixels</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="range"
                min="10"
                max="18"
                value={fontSize}
                onChange={(e) => setFontSize(parseInt(e.target.value))}
                className="slider"
              />
              <span className="slider-value">{fontSize}px</span>
            </div>
          </div>

          <div className="setting-item">
            <div className="setting-label">
              <span>Minimap</span>
              <span className="setting-description">Show code minimap</span>
            </div>
            <button
              onClick={() => setMinimap(!minimap)}
              className={`toggle-switch ${minimap ? 'active' : ''}`}
            />
          </div>
        </div>

        <div className="settings-section">
          <div className="section-title">
            <Bell size={14} />
            Notifications
          </div>
          <div className="setting-item">
            <div className="setting-label">
              <span>Enable Notifications</span>
              <span className="setting-description">Show desktop notifications</span>
            </div>
            <button
              onClick={() => setNotifications(!notifications)}
              className={`toggle-switch ${notifications ? 'active' : ''}`}
            />
          </div>
        </div>

        <div className="settings-section">
          <div className="section-title">
            <Volume2 size={14} />
            Sound
          </div>
          <div className="setting-item">
            <div className="setting-label">
              <span>Sound Effects</span>
              <span className="setting-description">Play UI sounds</span>
            </div>
            <button className="toggle-switch active" />
          </div>
        </div>

        <div className="settings-section">
          <div className="section-title">
            <Eye size={14} />
            Editor
          </div>
          <div className="setting-item">
            <div className="setting-label">
              <span>Word Wrap</span>
              <span className="setting-description">Wrap long lines</span>
            </div>
            <button className="toggle-switch active" />
          </div>
          <div className="setting-item">
            <div className="setting-label">
              <span>Line Numbers</span>
              <span className="setting-description">Show line numbers</span>
            </div>
            <button className="toggle-switch active" />
          </div>
        </div>
>>>>>>> 1fedef5cdf2fa8631c20411f700509b8bbdcb0e2
      </div>
    </div>
  );
}
