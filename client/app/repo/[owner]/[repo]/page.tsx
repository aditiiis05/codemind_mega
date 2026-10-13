'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { Code, File as FileIcon, FileText, FileImage, Sparkles, Loader2, AlertCircle, Network } from 'lucide-react';
import CodeEditor from '@/components/CodeEditor';
import IDELayout from '@/components/layout/IDELayout';
import MindMapView from '@/components/views/MindMapView'; // <--- IMPORTED VISUALIZER
import FlowchartPanel from '@/components/flowchart/FlowchartPanel';
import { FileNode } from '@/components/views/ExplorerView';
import { EditorTab } from '@/components/layout/EditorTabs';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

interface GitHubFile {
  name: string;
  path: string;
  sha: string;
  size: number;
  url: string;
  html_url: string;
  git_url: string;
  download_url: string | null;
  type: 'file' | 'dir';
  content?: string;
  encoding?: string;
  _links: {
    self: string;
    git: string;
    html: string;
  };
}

// Use shared `FileNode` and `EditorTab` types from components

export default function RepoPage() {
  const params = useParams();
  const router = useRouter();
  const { owner, repo } = params as { owner: string; repo: string };

  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState('');
  // allFiles accumulates every fetched GitHubFile across all directory expansions
  const [allFiles, setAllFiles] = useState<GitHubFile[]>([]);
  // repoContent holds only the CURRENT directory level shown in the explorer
  const [repoContent, setRepoContent] = useState<GitHubFile[]>([]);
  const [expandedDirs, setExpandedDirs] = useState<Record<string, boolean>>({});
  const [dirContents, setDirContents] = useState<Record<string, GitHubFile[]>>({});
  const [selectedFile, setSelectedFile] = useState<GitHubFile | null>(null);
  const [fileContent, setFileContent] = useState('');
  const [isLoadingFile, setIsLoadingFile] = useState(false);
  const [streamingAnalysis, setStreamingAnalysis] = useState('');
  const [visualizationTrigger, setVisualizationTrigger] = useState<{ type: 'flowchart' | 'mindmap' | null; timestamp?: number }>({ type: null });

  // Flowchart & Code Navigation States
  const [highlightRange, setHighlightRange] = useState<{ lineStart: number; lineEnd: number; source?: string } | null>(null);
  const [cursorLine, setCursorLine] = useState<number | null>(null);
  const [cursorEndLine, setCursorEndLine] = useState<number | null>(null);
  const [rightPanelWidth, setRightPanelWidth] = useState<number>(540);
  const [activeRightTab, setActiveRightTab] = useState<'flowchart' | 'mindmap'>('flowchart');

  const getFileExtension = (filename: string) => {
    return filename.split('.').pop()?.toLowerCase() || '';
  };

  const getLanguage = (filename: string): string => {
    const ext = getFileExtension(filename);
    const languageMap: Record<string, string> = {
      'js': 'javascript',
      'ts': 'typescript',
      'py': 'python',
      'md': 'markdown',
      'json': 'json',
      'html': 'html',
      'css': 'css',
      'jsx': 'javascript',
      'tsx': 'typescript',
      'java': 'java',
      'cpp': 'cpp',
      'c': 'c',
      'cs': 'csharp',
      'php': 'php',
      'rb': 'ruby',
      'go': 'go',
      'rs': 'rust',
    };
    return languageMap[ext] || 'plaintext';
  };

  const analyzeRepository = async () => {
    if (!repoContent.length) {
      setError('No repository content available to analyze');
      return;
    }

    setIsAnalyzing(true);
    setError('');
    setStreamingAnalysis('');

    try {
      const githubToken = localStorage.getItem('github_token');
      if (!githubToken) {
        throw new Error('GitHub authentication required. Please sign in with GitHub.');
      }

      // Recursively walk the repository tree (limited) to collect files
      const fetchAllRepoFiles = async () => {
        const collected: GitHubFile[] = [];
        const queue: GitHubFile[] = [...repoContent];
        const headers = {
          'Authorization': `token ${githubToken}`,
          'Accept': 'application/vnd.github.v3+json'
        };

        while (queue.length && collected.length < 1000) {
          const item = queue.shift();
          if (!item) break;

          if (item.type === 'file') {
            collected.push(item);
            continue;
          }

          // item.type === 'dir' -> fetch its contents
          try {
            const res = await axios.get(
              `https://api.github.com/repos/${owner}/${repo}/contents/${item.path}`,
              { headers, timeout: 30000 }
            );

            if (Array.isArray(res.data)) {
              for (const child of res.data) {
                // normalize minimal shape to GitHubFile
                queue.push(child as GitHubFile);
              }
            }
          } catch (err) {
            console.warn(`[Analysis] Failed to fetch directory ${item.path}:`, err);
          }
        }

        return collected;
      };

      const allFiles = await fetchAllRepoFiles();

      const importantFiles = allFiles
        .filter(file => file.type === 'file' && (
          file.name.endsWith('.js') ||
          file.name.endsWith('.ts') ||
          file.name.endsWith('.py') ||
          file.name.endsWith('.java') ||
          file.name === 'package.json' ||
          file.name === 'requirements.txt' ||
          file.name.toLowerCase() === 'readme.md'
        ))
        .slice(0, 10);

      if (importantFiles.length === 0) {
        setError('No supported files found for analysis');
        setIsAnalyzing(false);
        return;
      }

      console.log(`[Analysis] Analyzing ${importantFiles.length} important files...`);

      const BATCH_SIZE = 2;
      const filesWithContent = [];

      for (let i = 0; i < importantFiles.length; i += BATCH_SIZE) {
        const batch = importantFiles.slice(i, i + BATCH_SIZE);
        const batchResults = await Promise.all(
          batch.map(async (file) => {
            try {
              const response = await axios.get(
                `https://api.github.com/repos/${owner}/${repo}/contents/${file.path}`,
                {
                  headers: {
                    'Authorization': `token ${githubToken}`,
                    'Accept': 'application/vnd.github.v3.raw'
                  },
                  responseType: 'text',
                  timeout: 10000
                }
              );

              return {
                path: file.path,
                name: file.name,
                content: response.data || '',
                language: getFileExtension(file.name) || 'text',
                size: file.size || 0
              };
            } catch (error) {
              console.error(`[Analysis] Error fetching ${file.path}:`, error);
              return null;
            }
          })
        );

        filesWithContent.push(...batchResults.filter(Boolean));

        if (i + BATCH_SIZE < importantFiles.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      if (filesWithContent.length === 0) {
        throw new Error('Failed to fetch any file contents for analysis');
      }

      const response = await fetch(`${API_BASE_URL}/api/ai/analyze-repo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${githubToken}`
        },
        body: JSON.stringify({
          files: filesWithContent,
          owner,
          repo
        })
      });

      if (!response.ok) {
        throw new Error(`Analysis failed: ${response.statusText}`);
      }
      
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Analysis failed');
      }

      setStreamingAnalysis(
  typeof data.analysis === 'string'
    ? data.analysis.trim()
    : JSON.stringify(data.analysis, null, 2)
);

    } catch (err: any) {
      const errorMessage = err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Failed to analyze repository';
      console.error('[Analysis Error]', errorMessage);
      setError(`Analysis failed: ${errorMessage}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const fetchRepoContent = useCallback(async (path: string = '') => {
    if (!owner || !repo) return;
    try {
      if (!path) setIsLoading(true);
      setError('');
      const githubToken = localStorage.getItem('github_token');
      if (!githubToken) {
        throw new Error('GitHub authentication required. Please sign in with GitHub.');
      }

      console.log(`[Repo] Fetching repository content for path: "${path}"`);

      const response = await axios.get(
        `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
        {
          headers: {
            'Authorization': `token ${githubToken}`,
            'Accept': 'application/vnd.github.v3+json',
          },
          timeout: 10000
        }
      );

      if (!response.data) {
        throw new Error('No data received from GitHub API');
      }

      const items: GitHubFile[] = Array.isArray(response.data) ? response.data : [response.data];

      if (!path) {
        // Root level — set as the base repo content
        setRepoContent(items);
        setAllFiles(items);
      } else {
        // Sub-directory — store under its path key
        setDirContents(prev => ({ ...prev, [path]: items }));
        // Also accumulate into allFiles for project analysis
        setAllFiles(prev => {
          const existingPaths = new Set(prev.map(f => f.path));
          const newItems = items.filter(f => !existingPaths.has(f.path));
          return [...prev, ...newItems];
        });
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load repository content';
      console.error('[Repo Error]', errorMessage);
      setError(`Error: ${errorMessage}`);

      if (err.response?.status === 401) {
        localStorage.removeItem('github_token');
        router.push('/');
      }
    } finally {
      setIsLoading(false);
    }
  }, [owner, repo, router]);

  useEffect(() => {
    fetchRepoContent('');
  }, [fetchRepoContent]);

  const fetchFileContent = useCallback(async (file: GitHubFile) => {
    // Set selected file immediately so the editor panel appears with a loading state
    setSelectedFile(file);
    setFileContent('// Loading...');
    setCursorEndLine(null);

    try {
      setIsLoadingFile(true);
      setError('');
      const githubToken = localStorage.getItem('github_token');
      if (!githubToken) {
        throw new Error('GitHub authentication required');
      }

      const response = await axios.get(
        `https://api.github.com/repos/${owner}/${repo}/contents/${file.path}`,
        {
          headers: {
            'Authorization': `token ${githubToken}`,
            'Accept': 'application/vnd.github.v3+json',
          },
          timeout: 10000
        }
      );

      if (response.data.size > 1024 * 100) {
        setFileContent(`// File is too large to display (${(response.data.size / 1024).toFixed(1)}KB)`);
        return;
      }

      if (response.data.content && response.data.encoding === 'base64') {
        const decodedContent = atob(response.data.content.replace(/\n/g, ''));
        setFileContent(decodedContent);
      } else {
        setFileContent('// Unable to decode file content');
      }
    } catch (err: any) {
      console.error('[File Error]', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load file content';
      setError(`Error: ${errorMessage}`);
      setFileContent(`// Error loading file: ${errorMessage}`);
    } finally {
      setIsLoadingFile(false);
    }
  }, [owner, repo]);

  const handleItemClick = useCallback((item: GitHubFile) => {
    if (item.type === 'dir') {
      const isExpanded = expandedDirs[item.path];
      setExpandedDirs(prev => ({
        ...prev,
        [item.path]: !isExpanded
      }));
      // Only fetch if not already loaded
      if (!isExpanded && !dirContents[item.path]) {
        fetchRepoContent(item.path);
      }
    } else {
      fetchFileContent(item);
    }
  }, [expandedDirs, dirContents, fetchRepoContent, fetchFileContent]);

  // Code-to-flowchart navigation: click node -> open file & scroll to line
  const handleNavigateToCode = useCallback(async (targetFilePath: string, lineStart: number, lineEnd?: number) => {
    const cleanTarget = targetFilePath.replace(/\\/g, '/');
    const isCurrent = selectedFile && (
      selectedFile.path === cleanTarget ||
      selectedFile.name === cleanTarget ||
      cleanTarget.endsWith(selectedFile.name) ||
      selectedFile.path.endsWith(cleanTarget)
    );

    if (!isCurrent) {
      // Search in all accumulated files (root + subdirs)
      const matchingFile = allFiles.find(
        f => f.path === cleanTarget ||
             f.name === cleanTarget ||
             f.path.endsWith('/' + cleanTarget) ||
             cleanTarget.endsWith(f.name)
      );

      if (matchingFile) {
        await fetchFileContent(matchingFile);
      }
    }

    setHighlightRange({
      lineStart,
      lineEnd: lineEnd || lineStart,
      source: 'flowchart'
    });
  }, [selectedFile, allFiles, fetchFileContent]);

  const convertToFileNodes = (rootFiles: GitHubFile[]): FileNode[] => {
    // Recursively build a nested FileNode tree
    function buildNodes(items: GitHubFile[]): FileNode[] {
      return items.map(file => {
        const node: FileNode = {
          id: file.path,
          name: file.name,
          type: file.type === 'dir' ? 'directory' : 'file'
        };
        if (file.type === 'dir' && expandedDirs[file.path] && dirContents[file.path]) {
          node.children = buildNodes(dirContents[file.path]);
        }
        return node;
      });
    }
    return buildNodes(rootFiles);
  };

  const convertFileToNode = (file: GitHubFile | null): FileNode | null => {
    if (!file) return null;
    return {
      id: file.path, // Use path instead of sha - paths are unique within a repo tree
      name: file.name,
      type: file.type === 'dir' ? 'directory' : 'file'
    };
  };

  const handleFileNodeClick = (node: FileNode) => {
    // Search all accumulated files (root + any loaded subdirectories)
    const githubFile = allFiles.find(f => f.path === node.id);
    if (githubFile) {
      handleItemClick(githubFile);
    }
  };

  const handleDirToggle = (nodeId: string) => {
    const dir = allFiles.find(f => f.path === nodeId && f.type === 'dir');
    if (dir) {
      const isExpanded = expandedDirs[dir.path];
      setExpandedDirs(prev => ({
        ...prev,
        [dir.path]: !isExpanded
      }));
      if (!isExpanded && !dirContents[dir.path]) {
        fetchRepoContent(dir.path);
      }
    }
  };

  const handleGenerateVisualization = (node: FileNode, type: 'flowchart' | 'mindmap') => {
    // Find the GitHub file in all accumulated files
    const githubFile = allFiles.find(f => f.path === node.id);
    if (githubFile && githubFile.type === 'file') {
      // Ensure file is selected and content is loaded
      if (!selectedFile || selectedFile.path !== githubFile.path) {
        handleItemClick(githubFile);
      }
      // Trigger visualization generation after a short delay to ensure content is loaded
      setTimeout(() => {
        setVisualizationTrigger({ type, timestamp: Date.now() });
      }, 300);
    }
  };

  const tabs: EditorTab[] = selectedFile ? [{
    id: selectedFile.path, // Use path instead of sha for consistency
    name: selectedFile.name,
    isDirty: false
  }] : [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0d1117]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#2f81f7] animate-spin mx-auto mb-4" />
          <p className="text-[#7d8590]">Loading repository...</p>
        </div>
      </div>
    );
  }

  return (
    <IDELayout
      files={convertToFileNodes(repoContent)}
      expandedDirs={expandedDirs}
      onFileClick={handleFileNodeClick}
      onDirToggle={handleDirToggle}
      selectedFile={convertFileToNode(selectedFile)}
      tabs={tabs}
      activeTabId={selectedFile?.path || ''}
      onTabClick={() => { }}
      onTabClose={() => {
        setSelectedFile(null);
        setFileContent('');
      }}
      onGenerateVisualization={handleGenerateVisualization}
      statusBarProps={{
        language: selectedFile ? getLanguage(selectedFile.name) : 'plaintext',
        branch: 'main',
        aiStatus: isAnalyzing ? 'processing' : 'ready'
      }}
      analysisPanel={streamingAnalysis || isAnalyzing ? {
        content: streamingAnalysis,
        isAnalyzing: isAnalyzing,
        onClose: () => {
          setStreamingAnalysis('');
          setIsAnalyzing(false);
        }
      } : undefined}
    >
      <div className="h-full flex flex-col overflow-hidden">
        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-500/20 border border-red-500/50 rounded text-red-300 text-sm m-4 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* AI Analysis Button Bar */}
        <div className="p-2 border-b border-[#30363d] bg-[#1c2128]">
          <button
            onClick={analyzeRepository}
            disabled={isAnalyzing || repoContent.length === 0}
            className="w-full px-4 py-1.5 bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-600 text-white rounded flex items-center justify-center gap-2 transition-all font-semibold text-xs uppercase tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAnalyzing ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Analyzing Repository...
              </>
            ) : (
              <>
                <Sparkles size={14} />
                Run AI Repository Analysis
              </>
            )}
          </button>
        </div>

        {/* --- SPLIT VIEW AREA (Editor + Flowchart/Visualizer) --- */}
        <div className="flex-1 flex flex-row overflow-hidden relative">
          
          {/* LEFT: Code Editor */}
          <div className="flex-1 flex flex-col border-r border-[#30363d] min-w-0">
            {selectedFile ? (
              <CodeEditor
                code={fileContent}
                language={getLanguage(selectedFile.name)}
                height="100%"
                onChange={(newContent) => {
                  setFileContent(newContent || '');
                  if (highlightRange) setHighlightRange(null);
                }}
                readOnly={false}
                highlightRange={highlightRange}
                onCursorChange={(line) => setCursorLine(line)}
                onSelectionChange={(start, end) => { setCursorLine(start); setCursorEndLine(end); }}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-center flex-col opacity-50">
                <Code className="w-16 h-16 text-[#7d8590] mb-4" />
                <p className="text-[#7d8590]">No file selected</p>
                <p className="text-xs text-[#7d8590] mt-1">Select a file from the repository explorer</p>
              </div>
            )}
          </div>

          {/* RIGHT: Flowchart & Code Visualization Panel */}
          <div
            className="shrink-0 bg-[#0d1117] flex flex-col border-l border-[#30363d] transition-all duration-150"
            style={{ width: `${rightPanelWidth}px` }}
          >
            {/* View Switcher Header (Interactive Flowchart vs Mind Map) */}
            <div className="flex items-center justify-between px-2.5 py-1.5 bg-[#161b22] border-b border-[#30363d] select-none">
              {/* Tab buttons */}
              <div className="flex items-center gap-0.5 bg-[#0d1117] p-0.5 rounded-md border border-[#30363d]/70">
                <button
                  onClick={() => setActiveRightTab('flowchart')}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                    activeRightTab === 'flowchart'
                      ? 'bg-[#1f6feb] text-white'
                      : 'text-[#7d8590] hover:text-[#c9d1d9] hover:bg-[#21262d]'
                  }`}
                >
                  <Network size={12} />
                  <span>Flowchart</span>
                </button>
                <button
                  onClick={() => setActiveRightTab('mindmap')}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                    activeRightTab === 'mindmap'
                      ? 'bg-[#21262d] text-white border border-[#30363d]'
                      : 'text-[#7d8590] hover:text-[#c9d1d9] hover:bg-[#21262d]'
                  }`}
                >
                  <span>Mind Map</span>
                </button>
              </div>

              {/* Width Presets */}
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-[#484f58] font-medium mr-0.5">Width</span>
                {([
                  { w: 420, label: 'S' },
                  { w: 560, label: 'M' },
                  { w: 740, label: 'L' },
                ] as const).map(({ w, label }) => (
                  <button
                    key={w}
                    onClick={() => setRightPanelWidth(w)}
                    className={`w-6 h-6 flex items-center justify-center rounded text-[10px] font-bold transition-colors ${
                      rightPanelWidth === w
                        ? 'bg-[#30363d] text-white'
                        : 'text-[#7d8590] hover:text-[#c9d1d9] hover:bg-[#21262d]'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Panel Body */}
            <div className="flex-1 overflow-hidden">
              {activeRightTab === 'flowchart' ? (
                <FlowchartPanel
                  code={selectedFile ? fileContent : null}
                  fileName={selectedFile?.name || null}
                  language={selectedFile ? getLanguage(selectedFile.name) : null}
                  repoFiles={repoContent}
                  owner={owner}
                  repo={repo}
                  cursorLine={cursorLine}
                  cursorEndLine={cursorEndLine}
                  onNavigateToCode={handleNavigateToCode}
                />
              ) : (
                <MindMapView
                  selectedFileContent={selectedFile ? fileContent : null}
                  triggerGeneration={visualizationTrigger}
                  fileName={selectedFile?.name || null}
                  language={selectedFile ? getLanguage(selectedFile.name) : null}
                />
              )}
            </div>
          </div>

        </div>
      </div>
    </IDELayout>
  );
}



