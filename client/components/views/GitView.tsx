'use client';

<<<<<<< HEAD
import React, { useState } from 'react';
import {
  GitBranch,
  GitCommit,
  Check,
  Plus,
  Minus,
  RotateCcw,
  MoreHorizontal,
  ChevronDown,
  ChevronRight,
  FileCode,
  RefreshCw,
  ArrowDown,
  ArrowUp
} from 'lucide-react';

interface ChangedFile {
  name: string;
  path: string;
  status: 'modified' | 'untracked';
  staged: boolean;
}

const DEFAULT_CHANGED_FILES: ChangedFile[] = [
  { name: 'App.tsx', path: 'src/App.tsx', status: 'modified', staged: false },
  { name: 'NodeDetailPanel.tsx', path: 'components/flowchart/NodeDetailPanel.tsx', status: 'modified', staged: false },
  { name: 'requirements.md', path: '.kiro/specs/requirements.md', status: 'untracked', staged: false },
];

export default function GitView() {
  const [commitMessage, setCommitMessage] = useState('');
  const [files, setFiles] = useState<ChangedFile[]>(DEFAULT_CHANGED_FILES);
  const [stagedExpanded, setStagedExpanded] = useState(true);
  const [changesExpanded, setChangesExpanded] = useState(true);
  const [isCommitting, setIsCommitting] = useState(false);
  const [commitSuccess, setCommitSuccess] = useState(false);

  const stagedFiles = files.filter((f) => f.staged);
  const unstagedFiles = files.filter((f) => !f.staged);

  const toggleStage = (path: string) => {
    setFiles((prev) =>
      prev.map((f) => (f.path === path ? { ...f, staged: !f.staged } : f))
    );
  };

  const stageAll = () => {
    setFiles((prev) => prev.map((f) => ({ ...f, staged: true })));
  };

  const unstageAll = () => {
    setFiles((prev) => prev.map((f) => ({ ...f, staged: false })));
  };

  const handleCommit = () => {
    if (!commitMessage.trim()) return;
    setIsCommitting(true);
    setTimeout(() => {
      setIsCommitting(false);
      setCommitSuccess(true);
      setCommitMessage('');
      // remove staged files
      setFiles((prev) => prev.filter((f) => !f.staged));
      setTimeout(() => setCommitSuccess(false), 3000);
    }, 600);
  };

  return (
    <div className="h-full flex flex-col bg-[#252526] text-[#cccccc] select-none text-xs">
      {/* ── Source Control Header ── */}
      <div className="h-[35px] px-3 border-b border-[#2b2b2b] flex items-center justify-between shrink-0">
        <span className="text-[11px] uppercase tracking-wider font-semibold text-[#858585]">
          SOURCE CONTROL
        </span>

        <div className="flex items-center gap-1 text-[#858585]">
          <button
            onClick={() => stageAll()}
            className="p-1 hover:text-white hover:bg-[#2a2d2e] rounded transition-colors cursor-pointer"
            title="Stage All Changes"
          >
            <Plus size={13} />
          </button>
          <button
            onClick={() => setFiles(DEFAULT_CHANGED_FILES)}
            className="p-1 hover:text-white hover:bg-[#2a2d2e] rounded transition-colors cursor-pointer"
            title="Refresh"
          >
            <RefreshCw size={12} />
          </button>
          <button
            className="p-1 hover:text-white hover:bg-[#2a2d2e] rounded transition-colors cursor-pointer"
            title="More Actions..."
          >
            <MoreHorizontal size={13} />
          </button>
        </div>
      </div>

      {/* ── Branch & Sync Bar ── */}
      <div className="px-3 py-1.5 bg-[#1e1e1e] border-b border-[#2b2b2b] flex items-center justify-between text-[11px] shrink-0">
        <div className="flex items-center gap-1.5 text-white font-mono">
          <GitBranch size={13} className="text-[#007acc]" />
          <span>main*</span>
        </div>
        <div className="flex items-center gap-2 text-[#858585] text-[10px] font-mono">
          <span className="flex items-center gap-0.5"><ArrowDown size={10} /> 0</span>
          <span className="flex items-center gap-0.5"><ArrowUp size={10} /> 0</span>
        </div>
      </div>

      {/* ── Commit Box ── */}
      <div className="p-3 border-b border-[#2b2b2b] shrink-0 space-y-2">
        <textarea
          rows={2}
          value={commitMessage}
          onChange={(e) => setCommitMessage(e.target.value)}
          placeholder="Message (Ctrl+Enter to commit on 'main')"
          onKeyDown={(e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
              handleCommit();
            }
          }}
          className="w-full bg-[#1e1e1e] border border-[#3c3c3c] focus:border-[#007acc] rounded p-2 text-xs text-[#cccccc] placeholder-[#6e7681] focus:outline-none resize-none leading-relaxed font-mono"
        />

        <button
          onClick={handleCommit}
          disabled={!commitMessage.trim() || isCommitting}
          className="w-full py-1.5 bg-[#0e639c] hover:bg-[#1177bb] active:bg-[#0d598a] disabled:opacity-40 text-white rounded text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:cursor-not-allowed shadow-sm"
        >
          {commitSuccess ? (
            <>
              <Check size={13} className="text-[#4ec9b0]" />
              <span>Committed!</span>
            </>
          ) : (
            <>
              <Check size={13} />
              <span>{isCommitting ? 'Committing...' : 'Commit'}</span>
            </>
          )}
        </button>
      </div>

      {/* ── Changes Lists ── */}
      <div className="flex-1 overflow-y-auto ide-scrollbar p-1">
        {/* Staged Changes Section */}
        {stagedFiles.length > 0 && (
          <div className="mb-2">
            <div
              onClick={() => setStagedExpanded((p) => !p)}
              className="flex items-center justify-between px-2 py-1 text-[11px] font-semibold text-[#858585] hover:text-[#cccccc] cursor-pointer hover:bg-[#2a2d2e] rounded group"
            >
              <div className="flex items-center gap-1">
                {stagedExpanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                <span>STAGED CHANGES</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    unstageAll();
                  }}
                  className="p-0.5 hover:text-white rounded opacity-0 group-hover:opacity-100"
                  title="Unstage All"
                >
                  <Minus size={11} />
                </button>
                <span className="text-[10px] font-mono px-1.5 py-0.2 bg-[#3c3c3c] text-white rounded-full">
                  {stagedFiles.length}
                </span>
              </div>
            </div>

            {stagedExpanded && (
              <div className="space-y-0.5 mt-0.5">
                {stagedFiles.map((file) => (
                  <div
                    key={file.path}
                    className="flex items-center gap-2 px-3 py-1 hover:bg-[#2a2d2e] rounded cursor-pointer group text-xs font-mono"
                  >
                    <FileCode size={13} className="text-[#519aba] shrink-0" />
                    <span className="text-white truncate flex-1">{file.name}</span>
                    <span className="text-[10px] text-[#858585] truncate max-w-[80px]">
                      {file.path.split('/').slice(0, -1).join('/')}
                    </span>
                    <button
                      onClick={() => toggleStage(file.path)}
                      className="p-1 text-[#858585] hover:text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Unstage Changes"
                    >
                      <Minus size={11} />
                    </button>
                    <span
                      className={`text-[10px] font-bold font-mono ${
                        file.status === 'modified' ? 'text-[#e2c08d]' : 'text-[#4ec9b0]'
                      }`}
                    >
                      {file.status === 'modified' ? 'M' : 'U'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Changes Section */}
        <div>
          <div
            onClick={() => setChangesExpanded((p) => !p)}
            className="flex items-center justify-between px-2 py-1 text-[11px] font-semibold text-[#858585] hover:text-[#cccccc] cursor-pointer hover:bg-[#2a2d2e] rounded group"
          >
            <div className="flex items-center gap-1">
              {changesExpanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
              <span>CHANGES</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  stageAll();
                }}
                className="p-0.5 hover:text-white rounded opacity-0 group-hover:opacity-100"
                title="Stage All"
              >
                <Plus size={11} />
              </button>
              <span className="text-[10px] font-mono px-1.5 py-0.2 bg-[#3c3c3c] text-white rounded-full">
                {unstagedFiles.length}
              </span>
            </div>
          </div>

          {changesExpanded && (
            <div className="space-y-0.5 mt-0.5">
              {unstagedFiles.map((file) => (
                <div
                  key={file.path}
                  className="flex items-center gap-2 px-3 py-1 hover:bg-[#2a2d2e] rounded cursor-pointer group text-xs font-mono"
                >
                  <FileCode size={13} className="text-[#519aba] shrink-0" />
                  <span className="text-[#cccccc] group-hover:text-white truncate flex-1">
                    {file.name}
                  </span>
                  <span className="text-[10px] text-[#858585] truncate max-w-[80px]">
                    {file.path.split('/').slice(0, -1).join('/')}
                  </span>
                  <button
                    onClick={() => toggleStage(file.path)}
                    className="p-1 text-[#858585] hover:text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Stage Changes"
                  >
                    <Plus size={11} />
                  </button>
                  <span
                    className={`text-[10px] font-bold font-mono ${
                      file.status === 'modified' ? 'text-[#e2c08d]' : 'text-[#4ec9b0]'
                    }`}
                  >
                    {file.status === 'modified' ? 'M' : 'U'}
                  </span>
                </div>
              ))}
            </div>
          )}
=======
import { GitBranch, GitCommit, GitPullRequest } from 'lucide-react';

export default function GitView() {
  return (
    <div className="h-full flex flex-col bg-[#252526] p-3">
      <style jsx>{`
        .git-section {
          margin-bottom: 16px;
        }

        .section-header {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 0;
          margin-bottom: 8px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #858585;
          transition: all 0.2s ease;
        }

        .section-header:hover {
          color: #cccccc;
        }

        .git-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 8px;
          border-radius: 4px;
          font-size: 12px;
          color: #cccccc;
          transition: all 0.2s ease;
          cursor: pointer;
        }

        .git-item:hover {
          background: rgba(255, 255, 255, 0.08);
        }

        .branch-name {
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          color: #0ea5e9;
          font-weight: 500;
        }

        .badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 2px 6px;
          background: rgba(14, 165, 233, 0.2);
          color: #0ea5e9;
          border-radius: 3px;
          font-size: 10px;
          font-weight: 600;
        }
      `}</style>

      <div className="git-section">
        <div className="section-header">
          <GitBranch size={14} />
          Current Branch
        </div>
        <div className="git-item">
          <div className="w-3 h-3 rounded-full bg-[#0ea5e9]" />
          <span className="branch-name">main</span>
          <div className="ml-auto badge">Local</div>
        </div>
      </div>

      <div className="git-section">
        <div className="section-header">
          <GitCommit size={14} />
          Recent Commits
        </div>
        <div className="space-y-2">
          <div className="git-item">
            <span className="text-[#858585]">feat:</span>
            <span>Add IDE enhancements</span>
          </div>
          <div className="git-item">
            <span className="text-[#858585]">fix:</span>
            <span>Update component styling</span>
          </div>
          <div className="git-item">
            <span className="text-[#858585]">docs:</span>
            <span>Update README</span>
          </div>
        </div>
      </div>

      <div className="git-section">
        <div className="section-header">
          <GitPullRequest size={14} />
          Pull Requests
        </div>
        <div className="text-[#858585] text-[12px] px-2 py-4">
          No open pull requests
>>>>>>> 1fedef5cdf2fa8631c20411f700509b8bbdcb0e2
        </div>
      </div>
    </div>
  );
}
