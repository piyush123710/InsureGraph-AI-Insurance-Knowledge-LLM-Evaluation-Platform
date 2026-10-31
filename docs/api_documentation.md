# InsureGraph AI – REST API Specification

## Base URL
- Production / Development: `http://localhost:3000/api`

---

## 1. System Health & Dashboard

### `GET /api/health`
Returns health status, active memory collections, and Gemini configuration status.
- **Response `200 OK`**:
```json
{
  "status": "healthy",
  "service": "InsureGraph AI Backend",
  "documentsCount": 5,
  "chunksCount": 19,
  "graphNodesCount": 28,
  "goldenTestCasesCount": 52,
  "evaluationRunsCount": 2,
  "geminiConfigured": true
}
```

### `GET /api/dashboard/metrics`
Returns aggregated analytics, query volume trends, and baseline comparisons.

---

## 2. Document Intelligence

### `GET /api/documents`
List all indexed policy documents.

### `POST /api/documents/upload`
Ingests a new policy document, triggers semantic chunking, and maps entities into the Knowledge Graph.
- **Request Body**:
```json
{
  "name": "Commercial Cargo Marine Policy 2026.pdf",
  "category": "motor",
  "policyType": "Marine Cargo Transit",
  "content": "SECTION 1: COVERAGE..."
}
```

### `DELETE /api/documents/:id`
Deletes a document and purges all associated chunk vectors from memory.

---

## 3. Grounded RAG Assistant

### `POST /api/chat/query`
Executes vector retrieval, prompt grounding, and Gemini response generation.
- **Request Body**:
```json
{
  "query": "What is the daily ICU limit under Premier Health Shield?",
  "topK": 3
}
```
- **Response `200 OK`**:
```json
{
  "id": "msg-asst-1742081290",
  "role": "assistant",
  "content": "Under Section 2.3 of the Premier Health Shield Policy 2026, daily Intensive Care Unit (ICU) charges are capped at $2,500 per day.",
  "confidence": 0.96,
  "sources": [
    {
      "document": "Premier Health Shield Policy 2026.pdf",
      "clause": "Clause-2",
      "section": "SECTION 2: DEDUCTIBLES, CO-PAYMENTS & LIMITS",
      "page": 2,
      "similarity": 0.94,
      "snippet": "2.3 ICU Sub-Limit: Daily Intensive Care Unit charges are capped at $2,500 per day..."
    }
  ],
  "retrievalLatencyMs": 24,
  "generationLatencyMs": 380
}
```

---

## 4. Knowledge Graph

### `GET /api/knowledge-graph`
Returns nodes, edges, degree centralities, and graph density statistics.

### `POST /api/knowledge-graph/traverse`
Finds the shortest path between two entities via Breadth-First Search (BFS).
- **Request Body**:
```json
{
  "sourceId": "cust-eleanor",
  "targetId": "med-appendectomy"
}
```

---

## 5. Evaluation Lab & Golden Datasets

### `GET /api/evaluation/datasets`
Lists all golden test cases with category counts.

### `POST /api/evaluation/run`
Triggers an automated evaluation run across golden test cases.
- **Request Body**:
```json
{
  "kValue": 3,
  "datasetName": "Production Golden Benchmark"
}
```
