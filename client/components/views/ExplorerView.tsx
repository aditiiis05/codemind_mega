'use client';

<<<<<<< HEAD
import React from 'react';
import {
  FolderOpen,
  Folder,
  ChevronRight,
  ChevronDown,
  FileCode2,
  FileJson,
  FileText,
  FileSpreadsheet,
  GitBranch,
  File,
  Code,
  FileCog
} from 'lucide-react';
=======
import { FolderOpen, Folder, File, ChevronRight, ChevronDown, FileCode, FileJson, FileText, GitBranch } from 'lucide-react';
>>>>>>> 1fedef5cdf2fa8631c20411f700509b8bbdcb0e2

export interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'directory';
  children?: FileNode[];
  icon?: string;
<<<<<<< HEAD
  status?: 'modified' | 'untracked' | 'normal';
=======
>>>>>>> 1fedef5cdf2fa8631c20411f700509b8bbdcb0e2
}

interface ExplorerViewProps {
  files: FileNode[];
  expandedDirs: Record<string, boolean>;
  onFileClick: (file: FileNode) => void;
  onDirToggle: (path: string) => void;
  selectedFile: FileNode | null;
}

<<<<<<< HEAD
// Returns appropriate icon and color for a file based on its extension
function getFileIcon(name: string) {
  const ext = name.split('.').pop()?.toLowerCase() ?? '';
  const iconClass = 'shrink-0 transition-colors';

  if (name === '.gitignore' || ext === 'gitignore') {
    return <GitBranch size={14} className={`text-[#f34f29] ${iconClass}`} />;
  }
  if (['tsx', 'jsx'].includes(ext)) {
    return <Code size={14} className={`text-[#519aba] ${iconClass}`} />;
  }
  if (['ts', 'js'].includes(ext)) {
    return <FileCode2 size={14} className={`text-[#519aba] ${iconClass}`} />;
  }
  if (ext === 'py') {
    return <FileCode2 size={14} className={`text-[#3572A5] ${iconClass}`} />;
  }
  if (ext === 'json') {
    return <FileJson size={14} className={`text-[#cbcb41] ${iconClass}`} />;
  }
  if (['md', 'txt', 'rst'].includes(ext)) {
    return <FileText size={14} className={`text-[#969696] ${iconClass}`} />;
  }
  if (['css', 'scss', 'less'].includes(ext)) {
    return <FileSpreadsheet size={14} className={`text-[#519aba] ${iconClass}`} />;
  }
  if (['config.js', 'config.ts', 'config.json'].some(s => name.endsWith(s))) {
    return <FileCog size={14} className={`text-[#dcb67a] ${iconClass}`} />;
  }
  return <File size={14} className={`text-[#519aba] ${iconClass}`} />;
}

function getFileStatusIndicator(name: string, status?: string) {
  if (status === 'modified' || name === 'App.tsx') {
    return <span className="text-[10px] font-mono font-bold text-[#e2c08d] ml-auto shrink-0 pr-1">M</span>;
  }
  if (status === 'untracked' || name.startsWith('.') || name.includes('spec')) {
    return <span className="text-[10px] font-mono font-bold text-[#73c991] ml-auto shrink-0 pr-1">U</span>;
  }
  return null;
=======
// Returns appropriate icon for a file based on its extension
function getFileIcon(name: string) {
  const ext = name.split('.').pop()?.toLowerCase() ?? '';
  const iconClass = 'shrink-0';
  if (['js', 'jsx', 'ts', 'tsx'].includes(ext))
    return <FileCode size={15} className={`text-[#f0db4f] ${iconClass}`} />;
  if (ext === 'json')
    return <FileJson size={15} className={`text-[#f4a261] ${iconClass}`} />;
  if (['md', 'txt'].includes(ext))
    return <FileText size={15} className={`text-[#94a3b8] ${iconClass}`} />;
  if (ext === 'py')
    return <FileCode size={15} className={`text-[#3b82f6] ${iconClass}`} />;
  if (ext === 'java')
    return <FileCode size={15} className={`text-[#ef4444] ${iconClass}`} />;
  if (['.gitignore', 'gitignore'].includes(ext) || name === '.gitignore')
    return <GitBranch size={15} className={`text-[#f97316] ${iconClass}`} />;
  return <File size={15} className={`text-[#6ba3ff] ${iconClass}`} />;
>>>>>>> 1fedef5cdf2fa8631c20411f700509b8bbdcb0e2
}

function FileTreeItem({
  file,
  depth,
  expandedDirs,
  selectedId,
  onFileClick,
  onDirToggle,
}: {
  file: FileNode;
  depth: number;
  expandedDirs: Record<string, boolean>;
  selectedId: string | null;
  onFileClick: (file: FileNode) => void;
  onDirToggle: (path: string) => void;
}) {
  const isDirectory = file.type === 'directory';
  const isExpanded = isDirectory && !!expandedDirs[file.id];
  const isSelected = selectedId === file.id;
<<<<<<< HEAD
  const indent = depth * 14;

  return (
    <div className="w-full">
      <div
        className={`group relative flex items-center gap-1.5 py-[3px] pr-2 cursor-pointer select-none transition-colors text-xs ${
          isSelected
            ? 'bg-[#094771] text-white font-medium'
            : 'text-[#cccccc] hover:text-white hover:bg-[#2a2d2e]'
=======
  const indent = depth * 12;

  return (
    <div>
      <div
        className={`flex items-center gap-1.5 py-[3px] pr-2 cursor-pointer select-none rounded-md transition-colors duration-100 ${
          isSelected
            ? 'bg-[#1f6feb]/20 text-[#58a6ff] font-medium border-l-2 border-[#58a6ff]'
            : 'text-[#c9d1d9] hover:bg-[#21262d]/70 border-l-2 border-transparent'
>>>>>>> 1fedef5cdf2fa8631c20411f700509b8bbdcb0e2
        }`}
        style={{ paddingLeft: `${8 + indent}px` }}
        onClick={() => {
          if (isDirectory) {
            onDirToggle(file.id);
          } else {
            onFileClick(file);
          }
        }}
      >
<<<<<<< HEAD
        {/* Directory chevron & folder icon */}
        {isDirectory ? (
          <>
            <span className="shrink-0 text-[#858585] group-hover:text-white transition-colors">
              {isExpanded ? (
                <ChevronDown size={13} className="transition-transform" />
              ) : (
                <ChevronRight size={13} className="transition-transform" />
              )}
            </span>
            {isExpanded ? (
              <FolderOpen size={14} className="shrink-0 text-[#dcb67a]" />
            ) : (
              <Folder size={14} className="shrink-0 text-[#dcb67a]" />
            )}
          </>
        ) : (
          <>
            <span className="w-[13px] shrink-0" />
=======
        {/* Expand/collapse chevron for directories */}
        {isDirectory ? (
          <>
            <span className="shrink-0 text-[#858585]">
              {isExpanded
                ? <ChevronDown size={14} />
                : <ChevronRight size={14} />}
            </span>
            {isExpanded
              ? <FolderOpen size={15} className="shrink-0 text-[#dcb939]" />
              : <Folder size={15} className="shrink-0 text-[#dcb939]" />}
          </>
        ) : (
          <>
            <span className="w-[14px] shrink-0" />
>>>>>>> 1fedef5cdf2fa8631c20411f700509b8bbdcb0e2
            {getFileIcon(file.name)}
          </>
        )}

<<<<<<< HEAD
        {/* Filename */}
        <span
          className={`text-[12px] font-mono tracking-tight truncate leading-tight ${
            isSelected
              ? 'text-white font-medium'
              : 'text-[#cccccc] group-hover:text-white'
          }`}
        >
          {file.name}
        </span>

        {/* Status indicator (M / U) */}
        {!isDirectory && getFileStatusIndicator(file.name, file.status)}
      </div>

      {/* Nested children */}
      {isDirectory && isExpanded && file.children && file.children.length > 0 && (
        <div className="relative">
          {/* VS Code classic indent guide */}
          <div
            className="absolute top-0 bottom-0 border-l border-[#3c3c3c]/50 pointer-events-none"
            style={{ left: `${14 + indent}px` }}
          />
=======
        <span className="text-[13px] truncate leading-tight">{file.name}</span>
      </div>

      {/* Render children when expanded */}
      {isDirectory && isExpanded && file.children && file.children.length > 0 && (
        <div>
>>>>>>> 1fedef5cdf2fa8631c20411f700509b8bbdcb0e2
          {file.children.map((child) => (
            <FileTreeItem
              key={child.id}
              file={child}
              depth={depth + 1}
              expandedDirs={expandedDirs}
              selectedId={selectedId}
              onFileClick={onFileClick}
              onDirToggle={onDirToggle}
            />
          ))}
        </div>
      )}

<<<<<<< HEAD
      {/* Empty directory indicator */}
      {isDirectory && isExpanded && (!file.children || file.children.length === 0) && (
        <div
          className="text-[#858585] text-[11px] font-mono py-1"
          style={{ paddingLeft: `${8 + indent + 28}px` }}
        >
          (empty)
=======
      {/* Loading state for empty expanded directories */}
      {isDirectory && isExpanded && (!file.children || file.children.length === 0) && (
        <div
          className="text-[#858585] text-[12px] py-1"
          style={{ paddingLeft: `${8 + indent + 26}px` }}
        >
          Loading...
>>>>>>> 1fedef5cdf2fa8631c20411f700509b8bbdcb0e2
        </div>
      )}
    </div>
  );
}

export default function ExplorerView({
  files,
  expandedDirs,
  onFileClick,
  onDirToggle,
  selectedFile,
}: ExplorerViewProps) {
<<<<<<< HEAD
  if (files.length === 0) {
    return (
      <div className="px-4 py-8 text-[#858585] text-xs font-mono text-center flex flex-col items-center justify-center gap-2">
        <File size={22} className="opacity-40 text-[#519aba]" />
        <p>No files loaded</p>
      </div>
    );
  }

  return (
    <div className="w-full py-1 ide-panel overflow-y-auto ide-scrollbar select-none">
      {files.map((file) => (
        <FileTreeItem
          key={file.id}
          file={file}
          depth={0}
          expandedDirs={expandedDirs}
          selectedId={selectedFile?.id ?? null}
          onFileClick={onFileClick}
          onDirToggle={onDirToggle}
        />
      ))}
=======
  return (
    <div className="flex flex-col h-full overflow-hidden text-[#e6edf3]">
      {/* Repository Files section */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        {/* Section Header */}
        <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-[#8b949e] border-b border-[#30363d] select-none bg-[#161b22]/50">
          Repository Files
        </div>

        {files.length === 0 ? (
          <div className="px-4 py-6 text-[#858585] text-[12px] text-center">
            <File size={24} className="mx-auto mb-2 opacity-40" />
            <p>No files loaded</p>
          </div>
        ) : (
          <div className="py-1">
            {files.map((file) => (
              <FileTreeItem
                key={file.id}
                file={file}
                depth={0}
                expandedDirs={expandedDirs}
                selectedId={selectedFile?.id ?? null}
                onFileClick={onFileClick}
                onDirToggle={onDirToggle}
              />
            ))}
          </div>
        )}
      </div>
>>>>>>> 1fedef5cdf2fa8631c20411f700509b8bbdcb0e2
    </div>
  );
}
