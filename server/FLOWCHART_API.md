# CodeMind.AI — Code Analysis & Flowchart Generation API

## Overview

The Flowchart API analyzes source code **statically** and returns a deterministic, dynamic flowchart as a JSON graph (nodes + edges). Every flowchart is generated fresh from the actual code — nothing is hardcoded or cached.

**Pipeline:**

```
Source Code
    ↓
Language Detection  (file extension + heuristics)
    ↓
AST Adapter         (Python / JavaScript / TypeScript / Java)
    ↓
Common IR           (language-agnostic intermediate representation)
    ↓
Flow Generator      (IR → nodes + edges)
    ↓
JSON Response
```

---

## POST /api/flowchart/analyze

Analyzes a single source file and returns a flowchart graph.

**URL:** `POST http://localhost:4000/api/flowchart/analyze`

---

### Request Body

```json
{
  "code": "<source code string>",
  "language": "python",
  "fileName": "main.py",
  "functionName": null
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `code` | string | ✅ | Source code text to analyze |
| `language` | string | ❌ | Language hint (`python`, `javascript`, `typescript`, `java`). Auto-detected from `fileName` if omitted. |
| `fileName` | string | ❌ | File name (used for language detection and node metadata). Default: `"file"` |
| `functionName` | string\|null | ❌ | If provided, the flowchart zooms into that specific function's body only. |

---

### Successful Response

```json
{
  "success": true,
  "fileName": "main.py",
  "language": "python",
  "functions": ["greet", "calculate"],
  "activeFunction": null,
  "nodes": [
    {
      "id": "start",
      "type": "START",
      "label": "START",
      "file": "main.py",
      "lineStart": 1,
      "lineEnd": 1,
      "data": {}
    },
    {
      "id": "node_1",
      "type": "PROCESS",
      "label": "x = 10",
      "file": "main.py",
      "lineStart": 1,
      "lineEnd": 1,
      "data": {}
    },
    {
      "id": "node_2",
      "type": "DECISION",
      "label": "x > 5?",
      "file": "main.py",
      "lineStart": 2,
      "lineEnd": 2,
      "data": {}
    },
    {
      "id": "node_3",
      "type": "OUTPUT",
      "label": "print(x)",
      "file": "main.py",
      "lineStart": 3,
      "lineEnd": 3,
      "data": {}
    },
    {
      "id": "end",
      "type": "END",
      "label": "END",
      "file": "main.py",
      "lineStart": 3,
      "lineEnd": 3,
      "data": {}
    }
  ],
  "edges": [
    { "id": "edge_1", "source": "start",  "target": "node_1", "type": "DEFAULT" },
    { "id": "edge_2", "source": "node_1", "target": "node_2", "type": "DEFAULT" },
    { "id": "edge_3", "source": "node_2", "target": "node_3", "label": "YES",    "type": "DEFAULT" },
    { "id": "edge_4", "source": "node_2", "target": "end",    "label": "NO",     "type": "DEFAULT" },
    { "id": "edge_5", "source": "node_3", "target": "end",    "type": "DEFAULT" }
  ],
  "metadata": {
    "nodeCount": 5,
    "edgeCount": 5,
    "functionCount": 0,
    "conditions": 1,
    "loops": 0,
    "classes": [],
    "parserEngine": "ast-adapter"
  }
}
```

---

### Error Responses

**Unsupported language (HTTP 422):**
```json
{
  "success": false,
  "error": "Unsupported language",
  "details": "Language \"ruby\" is not supported. Supported: python, javascript, typescript, java."
}
```

**Invalid `code` field (HTTP 400):**
```json
{
  "success": false,
  "error": "Invalid request: \"code\" must be a string."
}
```

**Parse error (HTTP 500):**
```json
{
  "success": false,
  "error": "Unable to parse source code",
  "details": "..."
}
```

---

## Node Types

| Type | Description | Shape in UI |
|---|---|---|
| `START` | Program entry point | Rounded rectangle (green) |
| `END` | Program exit | Rounded rectangle (red) |
| `PROCESS` | Assignment, expression, statement | Rectangle |
| `DECISION` | if / switch condition | Diamond |
| `LOOP` | for / while loop | Parallelogram / hexagon |
| `INPUT` | User input (`input()`, `prompt()`, scanner) | Parallelogram |
| `OUTPUT` | Print/log statement | Parallelogram |
| `FUNCTION` | Function/method definition or call | Subroutine rectangle |
| `RETURN` | return statement | Arrow to END |
| `ERROR` | catch / throw | Red rectangle |

---

## Edge Labels

| Label | Meaning |
|---|---|
| `YES` | True branch of a decision |
| `NO` | False branch of a decision |
| `LOOP` | Loop body / loop-back |
| `RETURN` | Return edge to END |
| `ERROR` | Exception/error path |
| `CALLS` | Function call edge |
| `case X` | Switch/case branch |

---

## Node Schema

Every node has:

```ts
{
  id: string        // unique e.g. "node_3", "start", "end"
  type: string      // see Node Types table (UPPERCASE)
  label: string     // human-readable text from source code
  file: string      // source file name
  lineStart: number // first source line this node maps to
  lineEnd: number   // last source line (same as lineStart for single-line)
  data: object      // extra metadata (reserved)
}
```

---

## Line Mapping

Every node carries `lineStart` / `lineEnd`. The frontend uses these to:
- Highlight a source line when a user clicks a flowchart node
- Highlight a flowchart node when the editor cursor moves to that line

---

## Supported Languages

| Language | Extensions |
|---|---|
| Python | `.py`, `.pyw` |
| JavaScript | `.js`, `.jsx`, `.mjs`, `.cjs` |
| TypeScript | `.ts`, `.tsx`, `.mts`, `.cts` |
| Java | `.java` |

---

## Detected Constructs

- Variable declarations and assignments
- Print/output statements
- Input statements
- `if` / `else if` / `else` (nested)
- `for` loops (nested)
- `while` loops (nested)
- Function declarations
- Function calls
- `return`
- `break`
- `continue`
- `try` / `catch` / `finally`
- `throw` / `raise`
- `switch` / `case` / `default`
- Class definitions (recorded in metadata)

---

## Request Examples

### 1. Simple Python if/else

```bash
curl -X POST http://localhost:4000/api/flowchart/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "code": "age = 20\nif age >= 18:\n    print(\"Adult\")\nelse:\n    print(\"Minor\")",
    "fileName": "age_check.py"
  }'
```

### 2. JavaScript function + loop

```bash
curl -X POST http://localhost:4000/api/flowchart/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "code": "function sum(n) {\n  let total = 0;\n  for (let i = 0; i <= n; i++) {\n    total += i;\n  }\n  return total;\n}",
    "fileName": "sum.js"
  }'
```

### 3. Zoom into one function

```bash
curl -X POST http://localhost:4000/api/flowchart/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "code": "def add(a, b):\n    return a + b\ndef sub(a, b):\n    return a - b",
    "fileName": "math.py",
    "functionName": "add"
  }'
```

### 4. Java class

```bash
curl -X POST http://localhost:4000/api/flowchart/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "code": "public class Main {\n  public static void main(String[] args) {\n    int x = 10;\n    if (x > 5) {\n      System.out.println(\"big\");\n    }\n  }\n}",
    "fileName": "Main.java",
    "functionName": "main"
  }'
```

### 5. TypeScript with types

```bash
curl -X POST http://localhost:4000/api/flowchart/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "code": "function greet(name: string): void {\n  if (name.length > 0) {\n    console.log(name);\n  }\n}",
    "fileName": "greet.ts"
  }'
```

---

## Frontend Integration

The FlowchartPanel (`client/components/flowchart/FlowchartPanel.tsx`) already integrates with this API via `client/services/flowchartApi.ts`.

**Automatic trigger:** When a file is open in the editor, the panel calls `POST /api/flowchart/analyze` with a 750ms debounce on every code change.

**Code ↔ Flowchart navigation:**
- Clicking a flowchart node calls `onNavigateToCode(file, lineStart, lineEnd)` which scrolls Monaco editor to that line.
- Moving the editor cursor highlights the corresponding flowchart node via `cursorLine` prop.

**Function drill-down:** The toolbar's function dropdown sends a `functionName` parameter to zoom into a specific function's execution flow.

---

## Architecture

```
server/
  index.js                       → Express app, mounts /api/flowchart
  routes/
    flowchart.js                 → POST /api/flowchart/analyze handler
  analyzer/
    analyzerService.js           → Orchestrates the full pipeline
    languageDetector.js          → File extension + heuristic detection
    parserManager.js             → Dispatches to language-specific adapters
    ir/
      irTypes.js                 → Common IR node factories
    ast/
      pythonAdapter.js           → Python → IR (indentation-based parser)
      javascriptAdapter.js       → JavaScript → IR (brace-based parser)
      typescriptAdapter.js       → TypeScript → IR (sanitize TS + JS parser)
      javaAdapter.js             → Java → IR (brace-based parser)
    flow/
      flowNode.js                → FlowNode factory
      flowEdge.js                → FlowEdge factory
      flowGenerator.js           → IR → nodes + edges (recursive translator)
```

---

## Running Tests

```bash
cd server
node test-flowchart.js
```

Expected: **33 passed, 0 failed**

---

## Security Notes

- Source code is **never executed** — only parsed as text.
- The analyzer performs static analysis only.
- Malformed or invalid code is handled gracefully; the server never crashes.
