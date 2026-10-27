// client/components/flowchart/nodeColors.ts
// Single source of truth for node color scheme.
// Imported by FlowNode.tsx (rendering) and FlowchartCanvas.tsx (PNG export).

export interface NodeColorScheme {
  border: string;
  bg: string;
  text: string;
}

export const NODE_COLORS: Record<string, NodeColorScheme> = {
  START:    { border: '#34d399', bg: '#064e3b', text: '#ffffff' },
  END:      { border: '#f87171', bg: '#450a0a', text: '#ffffff' },
  PROCESS:  { border: '#58a6ff', bg: '#0c1a2e', text: '#cccccc' },
  DECISION: { border: '#f59e0b', bg: '#1c1207', text: '#ffffff' },
  LOOP:     { border: '#818cf8', bg: '#1e1b4b', text: '#cccccc' },
  FUNCTION: { border: '#c084fc', bg: '#2e1065', text: '#cccccc' },
  INPUT:    { border: '#2dd4bf', bg: '#042f2e', text: '#cccccc' },
  OUTPUT:   { border: '#38bdf8', bg: '#082f49', text: '#cccccc' },
  RETURN:   { border: '#4ade80', bg: '#052e16', text: '#cccccc' },
  ERROR:    { border: '#f87171', bg: '#450a0a', text: '#cccccc' },
  FILE:     { border: '#22d3ee', bg: '#164e63', text: '#cccccc' },
};

export function getNodeColors(type: string): NodeColorScheme {
  return NODE_COLORS[type] ?? NODE_COLORS['PROCESS'];
}
