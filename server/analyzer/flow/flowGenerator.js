// server/analyzer/flow/flowGenerator.js
// Translates Common Intermediate Representation (IR) into deterministic Flowchart Nodes and Edges

const { createFlowNode, resetNodeCounter } = require('./flowNode');
const { createFlowEdge, resetEdgeCounter } = require('./flowEdge');
const { IR_TYPES } = require('../ir/irTypes');

/**
 * Generates flowchart graph from Common IR representation
 * @param {Object} options
 * @param {Array<Object>} options.irNodes - IR statements array
 * @param {string} options.fileName - Source file name
 * @param {string} [options.functionName] - Optional function to focus on
 * @param {Array<Object>} [options.functions] - Detected function definitions
 * @returns {{ nodes: Array, edges: Array }} Flowchart graph
 */
function generateFlowchartFromIR({
  irNodes = [],
  fileName = 'main.py',
  functionName = null,
  functions = []
}) {
  resetNodeCounter();
  resetEdgeCounter();

  const nodes = [];
  const edges = [];

  // Determine starting line and ending line
  const firstLine = irNodes[0]?.lineStart || 1;
  const lastLine = irNodes[irNodes.length - 1]?.lineEnd || 1;

  // Filter for specific function if requested
  let activeIR = irNodes;
  let startLabel = 'START';

  if (functionName && functionName !== 'all') {
    const targetFunc = functions.find(f => f.name === functionName);
    if (targetFunc && Array.isArray(targetFunc.body) && targetFunc.body.length > 0) {
      activeIR = targetFunc.body;
      startLabel = `START: ${functionName}()`;
    }
  }

  // Handle empty code file
  if (!activeIR || activeIR.length === 0) {
    const startNode = createFlowNode({
      id: 'start',
      type: 'start',
      label: startLabel,
      file: fileName,
      lineStart: 1,
      lineEnd: 1
    });

    const emptyNode = createFlowNode({
      id: 'node_empty',
      type: 'process',
      label: 'Empty file / No execution statements',
      file: fileName,
      lineStart: 1,
      lineEnd: 1
    });

    const endNode = createFlowNode({
      id: 'end',
      type: 'end',
      label: 'END',
      file: fileName,
      lineStart: 1,
      lineEnd: 1
    });

    edges.push(createFlowEdge({ source: 'start', target: 'node_empty' }));
    edges.push(createFlowEdge({ source: 'node_empty', target: 'end' }));

    return {
      nodes: [startNode, emptyNode, endNode],
      edges
    };
  }

  // 1. Create START node
  const startNode = createFlowNode({
    id: 'start',
    type: 'start',
    label: startLabel,
    file: fileName,
    lineStart: firstLine,
    lineEnd: firstLine
  });
  nodes.push(startNode);

  // 2. Create END node
  const endNode = createFlowNode({
    id: 'end',
    type: 'end',
    label: 'END',
    file: fileName,
    lineStart: lastLine,
    lineEnd: lastLine
  });

  /**
   * Recursive IR Sequence Translator
   * @param {Array<Object>} sequence - Array of IR nodes
   * @param {Array<{ id: string, label?: string }>} incoming - Array of previous node IDs to connect from
   * @param {Object} loopContext - Context for break and continue
   * @returns {Array<{ id: string, label?: string }>} - Exit node IDs to connect to subsequent statements
   */
  function translateSequence(sequence, incoming, loopContext = null) {
    let currentIncoming = incoming;

    for (let idx = 0; idx < sequence.length; idx++) {
      const item = sequence[idx];
      if (!item) continue;

      switch (item.type) {
        // --- PROCESS / STATEMENT ---
        case IR_TYPES.PROCESS: {
          const procNode = createFlowNode({
            type: 'process',
            label: item.label,
            file: fileName,
            lineStart: item.lineStart,
            lineEnd: item.lineEnd
          });
          nodes.push(procNode);

          currentIncoming.forEach(inc => {
            edges.push(createFlowEdge({
              source: inc.id,
              target: procNode.id,
              label: inc.label || null
            }));
          });

          currentIncoming = [{ id: procNode.id }];
          break;
        }

        // --- INPUT ---
        case IR_TYPES.INPUT: {
          const inNode = createFlowNode({
            type: 'input',
            label: item.expression,
            file: fileName,
            lineStart: item.lineStart,
            lineEnd: item.lineEnd
          });
          nodes.push(inNode);

          currentIncoming.forEach(inc => {
            edges.push(createFlowEdge({
              source: inc.id,
              target: inNode.id,
              label: inc.label || null
            }));
          });

          currentIncoming = [{ id: inNode.id }];
          break;
        }

        // --- OUTPUT ---
        case IR_TYPES.OUTPUT: {
          const outNode = createFlowNode({
            type: 'output',
            label: item.expression,
            file: fileName,
            lineStart: item.lineStart,
            lineEnd: item.lineEnd
          });
          nodes.push(outNode);

          currentIncoming.forEach(inc => {
            edges.push(createFlowEdge({
              source: inc.id,
              target: outNode.id,
              label: inc.label || null
            }));
          });

          currentIncoming = [{ id: outNode.id }];
          break;
        }

        // --- FUNCTION CALL ---
        case IR_TYPES.FUNCTION_CALL: {
          const callNode = createFlowNode({
            type: 'function',
            label: item.label,
            file: fileName,
            lineStart: item.lineStart,
            lineEnd: item.lineEnd
          });
          nodes.push(callNode);

          currentIncoming.forEach(inc => {
            edges.push(createFlowEdge({
              source: inc.id,
              target: callNode.id,
              label: inc.label || 'CALLS'
            }));
          });

          currentIncoming = [{ id: callNode.id }];
          break;
        }

        // --- FUNCTION DEFINITION ---
        case IR_TYPES.FUNCTION_DEF: {
          const funcDefNode = createFlowNode({
            type: 'function',
            label: `${item.name}(${item.params.join(', ')})`,
            file: fileName,
            lineStart: item.lineStart,
            lineEnd: item.lineEnd
          });
          nodes.push(funcDefNode);

          currentIncoming.forEach(inc => {
            edges.push(createFlowEdge({
              source: inc.id,
              target: funcDefNode.id,
              label: inc.label || null
            }));
          });

          currentIncoming = [{ id: funcDefNode.id }];
          break;
        }

        // --- DECISION (IF / ELSE IF / ELSE) ---
        case IR_TYPES.DECISION: {
          const decisionNode = createFlowNode({
            type: 'decision',
            label: `${item.condition}?`,
            file: fileName,
            lineStart: item.lineStart,
            lineEnd: item.lineEnd
          });
          nodes.push(decisionNode);

          currentIncoming.forEach(inc => {
            edges.push(createFlowEdge({
              source: inc.id,
              target: decisionNode.id,
              label: inc.label || null
            }));
          });

          // Translate TRUE branch (YES)
          const trueExits = translateSequence(
            item.trueBranch || [],
            [{ id: decisionNode.id, label: 'YES' }],
            loopContext
          );

          // Translate FALSE branch (NO)
          let falseExits = [];
          if (Array.isArray(item.falseBranch) && item.falseBranch.length > 0) {
            falseExits = translateSequence(
              item.falseBranch,
              [{ id: decisionNode.id, label: 'NO' }],
              loopContext
            );
          } else {
            // No else block: NO branch passes directly to downstream merge
            falseExits = [{ id: decisionNode.id, label: 'NO' }];
          }

          // Next statement receives both branch exits
          currentIncoming = [...trueExits, ...falseExits];
          break;
        }

        // --- LOOP (FOR / WHILE / DO_WHILE) ---
        case IR_TYPES.LOOP: {
          if (item.loopType === 'for' && item.forInit) {
            // --- Decomposed FOR loop ---
            // 1. Init node
            const initNode = createFlowNode({
              type: 'process',
              label: item.forInit,
              file: fileName,
              lineStart: item.lineStart,
              lineEnd: item.lineStart
            });
            nodes.push(initNode);
            currentIncoming.forEach(inc => {
              edges.push(createFlowEdge({
                source: inc.id,
                target: initNode.id,
                label: inc.label || null
              }));
            });

            // 2. Condition (loop) node
            const loopCondLabel = item.forCond || item.condition;
            const loopCondNode = createFlowNode({
              type: 'loop',
              label: loopCondLabel,
              file: fileName,
              lineStart: item.lineStart,
              lineEnd: item.lineEnd
            });
            nodes.push(loopCondNode);
            edges.push(createFlowEdge({ source: initNode.id, target: loopCondNode.id }));

            // Track break exits
            const breakExits = [];
            const currentLoopCtx = { loopNodeId: loopCondNode.id, breakExits };

            // 3. Body nodes
            const bodyExits = translateSequence(
              item.body || [],
              [{ id: loopCondNode.id, label: 'YES' }],
              currentLoopCtx
            );

            // 4. Update node at end of body
            if (item.forUpdate) {
              const updateNode = createFlowNode({
                type: 'process',
                label: item.forUpdate,
                file: fileName,
                lineStart: item.lineEnd,
                lineEnd: item.lineEnd
              });
              nodes.push(updateNode);
              bodyExits.forEach(bExit => {
                edges.push(createFlowEdge({ source: bExit.id, target: updateNode.id, label: bExit.label || null }));
              });
              // Loop update back to condition
              edges.push(createFlowEdge({ source: updateNode.id, target: loopCondNode.id, label: 'LOOP', type: 'LOOP' }));
            } else {
              // No update: loop body exits back to condition directly
              bodyExits.forEach(bExit => {
                edges.push(createFlowEdge({ source: bExit.id, target: loopCondNode.id, label: 'LOOP', type: 'LOOP' }));
              });
            }

            // Exit from condition (NO) goes downstream
            currentIncoming = [
              { id: loopCondNode.id, label: 'NO' },
              ...breakExits
            ];
          } else {
            // --- WHILE / DO_WHILE ---
            const loopNode = createFlowNode({
              type: 'loop',
              label: item.condition,
              file: fileName,
              lineStart: item.lineStart,
              lineEnd: item.lineEnd
            });
            nodes.push(loopNode);

            currentIncoming.forEach(inc => {
              edges.push(createFlowEdge({
                source: inc.id,
                target: loopNode.id,
                label: inc.label || null
              }));
            });

            const breakExits = [];
            const currentLoopCtx = { loopNodeId: loopNode.id, breakExits };

            const bodyExits = translateSequence(
              item.body || [],
              [{ id: loopNode.id, label: 'YES' }],
              currentLoopCtx
            );

            bodyExits.forEach(bExit => {
              edges.push(createFlowEdge({
                source: bExit.id,
                target: loopNode.id,
                label: 'LOOP',
                type: 'LOOP'
              }));
            });

            currentIncoming = [
              { id: loopNode.id, label: 'NO' },
              ...breakExits
            ];
          }
          break;
        }

        // --- BREAK ---
        case IR_TYPES.BREAK: {
          const breakNode = createFlowNode({
            type: 'process',
            label: 'break',
            file: fileName,
            lineStart: item.lineStart,
            lineEnd: item.lineEnd
          });
          nodes.push(breakNode);

          currentIncoming.forEach(inc => {
            edges.push(createFlowEdge({
              source: inc.id,
              target: breakNode.id,
              label: inc.label || null
            }));
          });

          if (loopContext && loopContext.breakExits) {
            loopContext.breakExits.push({ id: breakNode.id });
          }
          currentIncoming = [];
          break;
        }

        // --- CONTINUE ---
        case IR_TYPES.CONTINUE: {
          const contNode = createFlowNode({
            type: 'process',
            label: 'continue',
            file: fileName,
            lineStart: item.lineStart,
            lineEnd: item.lineEnd
          });
          nodes.push(contNode);

          currentIncoming.forEach(inc => {
            edges.push(createFlowEdge({
              source: inc.id,
              target: contNode.id,
              label: inc.label || null
            }));
          });

          if (loopContext && loopContext.loopNodeId) {
            edges.push(createFlowEdge({
              source: contNode.id,
              target: loopContext.loopNodeId,
              label: 'LOOP',
              type: 'LOOP'
            }));
          }
          currentIncoming = [];
          break;
        }

        // --- RETURN ---
        case IR_TYPES.RETURN: {
          const returnNode = createFlowNode({
            type: 'return',
            label: `return ${item.value || ''}`.trim(),
            file: fileName,
            lineStart: item.lineStart,
            lineEnd: item.lineEnd
          });
          nodes.push(returnNode);

          currentIncoming.forEach(inc => {
            edges.push(createFlowEdge({
              source: inc.id,
              target: returnNode.id,
              label: inc.label || null
            }));
          });

          // Route return directly to END
          edges.push(createFlowEdge({
            source: returnNode.id,
            target: 'end',
            label: 'RETURN',
            type: 'RETURN'
          }));

          currentIncoming = [];
          break;
        }

        // --- THROW / ERROR ---
        case IR_TYPES.THROW: {
          const throwNode = createFlowNode({
            type: 'error',
            label: `throw ${item.expression}`,
            file: fileName,
            lineStart: item.lineStart,
            lineEnd: item.lineEnd
          });
          nodes.push(throwNode);

          currentIncoming.forEach(inc => {
            edges.push(createFlowEdge({
              source: inc.id,
              target: throwNode.id,
              label: inc.label || 'ERROR'
            }));
          });

          edges.push(createFlowEdge({
            source: throwNode.id,
            target: 'end',
            label: 'ERROR',
            type: 'ERROR'
          }));

          currentIncoming = [];
          break;
        }

        // --- SWITCH / CASE ---
        case IR_TYPES.SWITCH: {
          const switchNode = createFlowNode({
            type: 'decision',
            label: `switch(${item.discriminant})`,
            file: fileName,
            lineStart: item.lineStart,
            lineEnd: item.lineEnd
          });
          nodes.push(switchNode);

          currentIncoming.forEach(inc => {
            edges.push(createFlowEdge({
              source: inc.id,
              target: switchNode.id,
              label: inc.label || null
            }));
          });

          const caseExits = [];

          (item.cases || []).forEach(caseItem => {
            // Each case branch hangs off the switch decision node
            const caseExitsLocal = translateSequence(
              caseItem.body || [],
              [{ id: switchNode.id, label: caseItem.label }],
              loopContext
            );
            caseExits.push(...caseExitsLocal);
          });

          // If no default case, the switch can fall through directly
          const hasDefault = (item.cases || []).some(c => c.label === 'case default');
          if (!hasDefault) {
            caseExits.push({ id: switchNode.id, label: 'default' });
          }

          currentIncoming = caseExits;
          break;
        }

        // --- TRY / CATCH ---
        case IR_TYPES.TRY_CATCH: {
          const tryExits = translateSequence(
            item.tryBlock || [],
            currentIncoming,
            loopContext
          );

          let catchExits = [];
          if (Array.isArray(item.catchBlocks)) {
            item.catchBlocks.forEach(cb => {
              const catchNode = createFlowNode({
                type: 'error',
                label: `catch (${cb.param})`,
                file: fileName,
                lineStart: item.lineStart,
                lineEnd: item.lineEnd
              });
              nodes.push(catchNode);

              // Connect from try block on error
              edges.push(createFlowEdge({
                source: tryExits[0]?.id || 'start',
                target: catchNode.id,
                label: 'ERROR',
                type: 'ERROR'
              }));

              const cExits = translateSequence(
                cb.body || [],
                [{ id: catchNode.id }],
                loopContext
              );
              catchExits.push(...cExits);
            });
          }

          let finallyExits = [];
          if (Array.isArray(item.finallyBlock) && item.finallyBlock.length > 0) {
            finallyExits = translateSequence(
              item.finallyBlock,
              [...tryExits, ...catchExits],
              loopContext
            );
            currentIncoming = finallyExits;
          } else {
            currentIncoming = [...tryExits, ...catchExits];
          }
          break;
        }

        default:
          break;
      }
    }

    return currentIncoming;
  }

  // Translate all statements starting from START node
  const finalExits = translateSequence(activeIR, [{ id: 'start' }]);

  // Connect remaining open paths to END node
  finalExits.forEach(exit => {
    edges.push(createFlowEdge({
      source: exit.id,
      target: 'end',
      label: exit.label || null
    }));
  });

  nodes.push(endNode);

  return { nodes, edges };
}

module.exports = {
  generateFlowchartFromIR
};
