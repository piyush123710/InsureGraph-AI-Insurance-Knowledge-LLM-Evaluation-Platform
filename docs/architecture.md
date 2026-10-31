# InsureGraph AI – System Architecture Documentation

## Executive Overview
**InsureGraph AI** is a production-grade enterprise intelligence and evaluation platform designed for insurance underwriting, policy analysis, multi-relational knowledge graph exploration, and rigorous LLM-as-a-Judge benchmarking.

---

## 1. High-Level Architecture Topology

```
+-------------------------------------------------------------+
|                      Client Layer                           |
|        React 19 + TypeScript + Vite + Tailwind CSS          |
|  - Executive Overview Dashboard (KPIs, Recharts Trends)     |
|  - Document Intelligence (Ingestion, Semantic Chunking)     |
|  - Grounded RAG Assistant (Clause Citations, Confidence)    |
|  - Knowledge Graph (SVG Topology, Degree Centrality, BFS)   |
|  - LLM Evaluation Lab (Precision@K, Faithfulness, Brier)    |
|  - Golden Dataset Manager (52 Ground-Truth Test Cases)      |
|  - Interactive REST API Playground                          |
+-------------------------------------------------------------+
                              |
                              | REST / JSON
                              v
+-------------------------------------------------------------+
|                     Application Server                      |
|                  Node.js / Express + TSX                    |
|             (Port 3000 Dev Middleware / SSR)               |
+-------------------------------------------------------------+
        |                     |                     |
        v                     v                     v
+---------------+     +---------------+     +-----------------+
|   RAG Engine  |     |Knowledge Graph|     |Evaluation Engine|
| Vector Store  |     |  NetworkX /   |     | Precision@K, F1 |
| BM25 + Cosine |     | BFS Traversal |     | Brier Score     |
+---------------+     +---------------+     +-----------------+
        \                     |                     /
         \                    v                    /
          +-------> Gemini 3.8 Flash LLM <--------+
                    (User-Agent: aistudio-build)
```

---

## 2. Core Subsystems

### A. Document Intelligence & Chunking Pipeline
1. **Text Extraction & Sanitation**: Standardizes formatting, cleans extraneous whitespace, and isolates section headers.
2. **Preservation of Structural Integrity**: Rather than naïve character slicing, chunking breaks on natural section demarcations (`SECTION 1`, `SECTION 2`) while tracking clause identifiers and page numbers.
3. **Vector Embeddings & Semantic Indexing**: Generates dense representations indexed for fast cosine similarity and token-weighted retrieval.

### B. Grounded RAG Pipeline
1. **Query Normalization**: Strips stop words and extracts high-leverage insurance keywords (`ICU`, `PED`, `CDL`, `FIR`, `excess`, `deductible`).
2. **Dense + Lexical Hybrid Retrieval**: Ranks chunks based on semantic term frequency and inverse chunk length weighting.
3. **Strict Grounding Rules**: Prompts instruct the model never to extrapolate policy terms, refuse prompt injections, cite specific page/section clauses, and declare insufficient context when clauses are absent.
4. **Citation Extraction**: Emits structured source objects with document name, clause ID, section, page number, and similarity score.

### C. Knowledge Graph Engine
1. **Ontology Types**:
   - Entities: `Customer`, `Insurance Policy`, `Insurance Provider`, `Coverage`, `Claim`, `Medical Treatment`, `Vehicle`, `Premium`, `Exclusion`.
   - Relationships: `CUSTOMER_OWNS_POLICY`, `POLICY_PROVIDES_COVERAGE`, `POLICY_HAS_EXCLUSION`, `CUSTOMER_SUBMITS_CLAIM`, `CLAIM_RELATES_TO_POLICY`, `COVERAGE_INCLUDES_TREATMENT`, `POLICY_HAS_PREMIUM`, `POLICY_ISSUED_BY_PROVIDER`.
2. **Graph Analytics**: Calculates normalized degree centrality $C_D(v) = \frac{\text{deg}(v)}{N - 1}$ and PageRank approximations.
3. **Traversal Algorithms**: Breadth-First Search (BFS) pathfinder computes shortest path sequences between disparate insurance entities.

### D. LLM Evaluation Harness
1. **Golden Benchmark Dataset**: 52 ground truth test cases across 5 categories and 4 difficulty tiers.
2. **Precision@K & Recall@K**: Evaluates exact chunk retrieval recall against ground truth IDs.
3. **LLM-as-a-Judge**: Implements independent judge evaluation returning structured scores for accuracy, relevance, faithfulness, and hallucination detection.
4. **Probability Calibration**: Evaluates Brier score $BS = \frac{1}{N}\sum (f_i - o_i)^2$ and bins predictions into decile reliability diagrams.
