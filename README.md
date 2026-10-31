# InsureGraph AI – Intelligent Insurance Knowledge & Evaluation Platform

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.0-61dafb.svg)](https://react.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110-009688.svg)](https://fastapi.tiangolo.com/)
[![Gemini 3.8 Flash](https://img.shields.io/badge/GenAI-Gemini%203.8%20Flash-4285F4.svg)](https://ai.google.dev/)
[![Knowledge Graph](https://img.shields.io/badge/NetworkX-Graph%20BFS-orange.svg)](https://networkx.org/)

InsureGraph AI is an enterprise-grade Generative AI platform for insurance underwriters, claims adjusters, and AI engineers. The platform combines:
1. **Document Intelligence**: Upload, chunk, and embed insurance policies (Health, Commercial Motor, Term Life, Commercial Property & BI, Global Travel).
2. **Grounded RAG Assistant**: Vector retrieval with strict anti-hallucination constraints and source citations (section, clause, page).
3. **Insurance Knowledge Graph**: Multi-relational ontology connecting customers, policies, coverages, claims, medical treatments, vehicles, premiums, and exclusions with BFS path traversal and degree centrality.
4. **LLM Evaluation Lab**: Precision@K, Recall@K, F1-Score, Faithfulness, Context Precision, Answer Relevance, Brier Score confidence calibration, and Gemini LLM-as-a-Judge.
5. **Golden Benchmark Dataset**: 52 ground truth test cases across 5 categories and 4 difficulty tiers.
6. **REST API Playground**: Swagger/OpenAPI style interactive testing workbench.

---

## 🚀 Quick Start

### 1. Installation
```bash
# Clone the repository
git clone https://github.com/your-username/InsureGraph-AI.git
cd InsureGraph-AI

# Install frontend & server dependencies
npm install

# (Optional) Install Python dependencies
pip install -r requirements.txt
```

### 2. Configure Environment
Create a `.env` file from `.env.example`:
```env
GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
PORT=3000
```

### 3. Launch Development Server
```bash
npm run dev
```
Visit `http://localhost:3000` to access the full-stack InsureGraph AI SaaS dashboard.

---

## 🧪 Automated Testing

InsureGraph AI includes automated Python unit tests covering RAG chunking, similarity retrieval, Precision@K, Recall@K, F1, Brier score calibration, and Knowledge Graph BFS traversal:

```bash
# Run the automated Python test suite
python3 -m unittest discover tests
```

---

## 📊 Evaluation Lab Metrics

| Metric | Target | Description |
| :--- | :--- | :--- |
| **Precision@K** | $\ge 0.90$ | Fraction of retrieved chunks that are relevant |
| **Recall@K** | $\ge 0.85$ | Fraction of all necessary policy clauses retrieved |
| **F1-Score** | $\ge 0.88$ | Harmonic balance between Precision and Recall |
| **Faithfulness** | $\ge 0.92$ | Factual support strictly derived from retrieved context |
| **Answer Relevance** | $\ge 0.90$ | Directness in answering user prompt without extraneous filler |
| **Brier Score** | $\le 0.08$ | Probability calibration error (lower is better) |

---

## 📂 Repository Structure

```
InsureGraph-AI/
├── src/
│   ├── components/         # Sidebar, Header, Toast notification system
│   ├── pages/              # Overview, Documents, Chat, Graph, Evaluation, Datasets, Playground, Settings
│   └── types/              # TypeScript domain schemas
├── server/
│   ├── data/               # Sample policies, 52-case golden dataset, graph ontology
│   ├── routes/             # REST API endpoints (/api/documents, /api/chat, /api/evaluation, etc.)
│   └── services/           # RAG vector engine, Graph traversal, Evaluation harness, DB store
├── backend/
│   ├── app/
│   │   ├── main.py         # FastAPI application entry point
│   │   ├── rag/            # Python RAG chunking & vector search
│   │   ├── knowledge_graph/# NetworkX graph engine & BFS path traversal
│   │   ├── evaluation/     # Precision@K, Recall@K, F1, Brier Score
│   │   └── schemas/        # Pydantic models
├── tests/
│   └── test_insuregraph.py # Automated unittest test suite
├── docs/
│   ├── architecture.md
│   ├── evaluation_methodology.md
│   └── api_documentation.md
├── requirements.txt
└── server.ts               # Production-ready Express server
```
