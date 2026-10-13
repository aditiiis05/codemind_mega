// client/services/flowchartApi.ts
// Service layer for CodeMind.AI flowchart and project graph analysis APIs

import axios from 'axios';
import {
  FlowchartResponse,
  ProjectGraphResponse,
  SelectionAnalysisParams
} from '@/types/flowchart';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

export interface AnalyzeFileParams {
  code: string;
  language: string;
  fileName: string;
  functionName?: string | null;
}

export interface AnalyzeProjectParams {
  files: Array<{
    path: string;
    content?: string;
    name?: string;
    language?: string;
    size?: number;
  }>;
  owner?: string;
  repo?: string;
}

/**
 * Request flowchart analysis for a single file or function from the backend
 * POST /api/flowchart/analyze
 */
export async function analyzeFile(params: AnalyzeFileParams): Promise<FlowchartResponse> {
  const { code, language, fileName, functionName } = params;

  try {
    const response = await axios.post<FlowchartResponse>(
      `${API_BASE_URL}/api/flowchart/analyze`,
      {
        code,
        language,
        fileName,
        functionName: functionName || null
      },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 25000
      }
    );

    if (response.data && response.data.success) {
      return response.data;
    }

    throw new Error(response.data?.error || 'Invalid response from flowchart backend');
  } catch (err: any) {
    console.error('[flowchartApi.analyzeFile] Error:', err);
    const message =
      err.response?.data?.error ||
      err.response?.data?.details ||
      (err.code === 'ERR_NETWORK'
        ? 'Cannot reach backend server at ' + API_BASE_URL + '. Is server running on port 4000?'
        : err.message || 'Unable to generate flowchart. Please check the source code.');

    throw new Error(message);
  }
}

/**
 * Request project-level graph analysis for repository files from the backend
 * POST /api/project/analyze
 */
export async function analyzeProject(params: AnalyzeProjectParams): Promise<ProjectGraphResponse> {
  const { files, owner, repo } = params;

  try {
    const response = await axios.post<ProjectGraphResponse>(
      `${API_BASE_URL}/api/project/analyze`,
      {
        files,
        owner,
        repo
      },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 45000
      }
    );

    if (response.data && response.data.success) {
      return response.data;
    }

    throw new Error(response.data?.error || 'Invalid response from project analysis backend');
  } catch (err: any) {
    console.error('[flowchartApi.analyzeProject] Error:', err);
    const message =
      err.response?.data?.error ||
      err.response?.data?.details ||
      (err.code === 'ERR_NETWORK'
        ? 'Cannot reach backend server at ' + API_BASE_URL + '. Is server running on port 4000?'
        : err.message || 'Unable to analyze project graph. Please verify repository files.');

    throw new Error(message);
  }
}

/**
 * Request selection-aware flowchart from the backend.
 * POST /api/flowchart/analyze/selection
 */
export async function analyzeSelection(params: SelectionAnalysisParams): Promise<FlowchartResponse> {
  const { code, language, startLine, endLine, detail = 'standard', filePath } = params;

  try {
    const response = await axios.post<FlowchartResponse>(
      `${API_BASE_URL}/api/flowchart/analyze/selection`,
      { code, language, startLine, endLine, detail, filePath: filePath || null },
      { headers: { 'Content-Type': 'application/json' }, timeout: 15000 }
    );

    if (response.data && response.data.success) {
      return response.data;
    }
    throw new Error(response.data?.error || 'Invalid response from selection analysis backend');
  } catch (err: unknown) {
    const axiosErr = err as { response?: { data?: { error?: string; details?: string } }; code?: string; message?: string };
    const message =
      axiosErr.response?.data?.error ||
      axiosErr.response?.data?.details ||
      (axiosErr.code === 'ERR_NETWORK'
        ? 'Cannot reach backend server at ' + API_BASE_URL + '. Is server running on port 4000?'
        : axiosErr.message || 'Unable to analyze selection.');
    throw new Error(message);
  }
}
