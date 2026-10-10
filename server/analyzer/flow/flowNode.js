// server/analyzer/flow/flowNode.js
// Factory for creating standardized Flowchart nodes with source line numbers

let nodeCounter = 1;

function resetNodeCounter() {
  nodeCounter = 1;
}

function nextNodeId(prefix = 'node') {
  return `${prefix}_${nodeCounter++}`;
}

/**
 * Creates a flowchart node with line mappings
 * @param {Object} options
 * @param {string} options.type - 'start' | 'end' | 'process' | 'decision' | 'input' | 'output' | 'function' | 'loop' | 'return' | 'error'
 * @param {string} options.label - Display text
 * @param {string} options.file - Filename or relative path
 * @param {number} [options.lineStart=1] - Starting line
 * @param {number} [options.lineEnd=1] - Ending line
 * @param {string} [options.id] - Optional custom ID
 * @returns {Object} FlowNode
 */
function createFlowNode({
  type = 'process',
  label = '',
  file = 'main.py',
  lineStart = 1,
  lineEnd = 1,
  id = null,
  data = {}
}) {
  return {
    id: id || nextNodeId('node'),
    type: type.toLowerCase(),
    label: label.trim(),
    file,
    lineStart: lineStart || 1,
    lineEnd: lineEnd || lineStart || 1,
    data
  };
}

module.exports = {
  createFlowNode,
  resetNodeCounter,
  nextNodeId
};
