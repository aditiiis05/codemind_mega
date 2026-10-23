'use client';

import { FolderOpen, Folder, File, ChevronRight, ChevronDown, FileCode, FileJson, FileText, GitBranch } from 'lucide-react';

export interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'directory';
  children?: FileNode[];
  icon?: string;
}

interface ExplorerViewProps {
  files: FileNode[];
  expandedDirs: Record<string, boolean>;
  onFileClick: (file: FileNode) => void;
  onDirToggle: (path: string) => void;
  selectedFile: FileNode | null;
}

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
  const indent = depth * 12;

  return (
    <div>
      <div
        className={`flex items-center gap-1.5 py-[3px] pr-2 cursor-pointer select-none rounded-md transition-colors duration-100 ${
          isSelected
            ? 'bg-[#1f6feb]/20 text-[#58a6ff] font-medium border-l-2 border-[#58a6ff]'
            : 'text-[#c9d1d9] hover:bg-[#21262d]/70 border-l-2 border-transparent'
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
            {getFileIcon(file.name)}
          </>
        )}

        <span className="text-[13px] truncate leading-tight">{file.name}</span>
      </div>

      {/* Render children when expanded */}
      {isDirectory && isExpanded && file.children && file.children.length > 0 && (
        <div>
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

      {/* Loading state for empty expanded directories */}
      {isDirectory && isExpanded && (!file.children || file.children.length === 0) && (
        <div
          className="text-[#858585] text-[12px] py-1"
          style={{ paddingLeft: `${8 + indent + 26}px` }}
        >
          Loading...
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
    </div>
  );
}
