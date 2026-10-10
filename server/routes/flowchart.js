// server/routes/flowchart.js
// Backend route for individual source code flowchart analysis
// Delegates to the AST → IR → FlowGenerator pipeline in server/analyzer/

const express = require('express');
const router = express.Router();
const { analyzeCodeFlowchart } = require('../analyzer/analyzerService');
const { detectLanguage, isLanguageSupported } = require('../analyzer/languageDetector');

/**
 * Normalise node types from lowercase (IR) to UPPERCASE (client expects)
 * The IR pipeline uses lowercase ('start', 'end', 'decision', ...)
 * The client FlowNode types use UPPERCASE ('START', 'END', 'DECISION', ...)
 */
function normalizeNodes(nodes) {
  return nodes.map(n => ({
    ...n,
    type: (n.type || 'process').toUpperCase()
  }));
}

/**
 * Normalise edge types similarly
 */
function normalizeEdges(edges) {
  return edges.map(e => ({
    ...e,
    type: e.type ? e.type.toUpperCase() : 'DEFAULT',
    label: e.label ? e.label.toUpperCase() : undefined
  }));
}

/**
 * POST /api/flowchart/analyze
 *
 * Request body:
 *   { code: string, language?: string, fileName?: string, functionName?: string }
 *
 * Response:
 *   {
 *     success: true,
 *     fileName, language, functions, activeFunction,
 *     nodes: FlowNode[], edges: FlowEdge[],
 *     metadata: { nodeCount, edgeCount, functionCount, conditions, loops, parserEngine }
 *   }
 */
router.post('/analyze', async (req, res) => {
  const { code, language: langHint, fileName = 'file', functionName = null } = req.body;

  // Validate input
  if (typeof code !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Invalid request: "code" must be a string.'
    });
  }

  // Allow empty code — returns a minimal START → (empty) → END graph
  try {
    // Detect language if not provided
    const detectedLang = langHint
      ? langHint.toLowerCase()
      : detectLanguage(fileName, code);

    // Reject clearly unsupported languages up front
    if (!isLanguageSupported(detectedLang)) {
      return res.status(422).json({
        success: false,
        error: 'Unsupported language',
        details: `Language "${detectedLang}" is not supported. Supported: python, javascript, typescript, java.`
      });
    }

    // Run the full AST → IR → Flowchart pipeline
    const result = analyzeCodeFlowchart({
      code,
      language: detectedLang,
      fileName,
      functionName
    });

    // analyzeCodeFlowchart may return { success: false } for its own reasons
    if (!result.success) {
      return res.status(422).json(result);
    }

    // Normalize node/edge types to UPPERCASE for the React client
    const normalizedNodes = normalizeNodes(result.nodes);
    const normalizedEdges = normalizeEdges(result.edges);

    return res.json({
      success: true,
      fileName,
      language: result.language || detectedLang,
      functions: result.metadata?.functions || [],
      activeFunction: functionName || null,
      nodes: normalizedNodes,
      edges: normalizedEdges,
      metadata: {
        nodeCount: normalizedNodes.length,
        edgeCount: normalizedEdges.length,
        functionCount: (result.metadata?.functions || []).length,
        conditions: result.metadata?.conditions || 0,
        loops: result.metadata?.loops || 0,
        classes: result.metadata?.classes || [],
        parserEngine: result.metadata?.parserEngine || 'ast-adapter'
      }
    });
  } catch (error) {
    console.error('[Flowchart API Error]:', error);
    return res.status(500).json({
      success: false,
      error: 'Unable to parse source code',
      details: error.message
    });
  }
});

module.exports = router;
