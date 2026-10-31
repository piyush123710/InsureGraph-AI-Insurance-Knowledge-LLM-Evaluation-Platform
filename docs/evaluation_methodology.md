# InsureGraph AI – Evaluation Methodology & Benchmark Formulation

## 1. Evaluation Philosophy
Retrieval-Augmented Generation (RAG) in regulated domains like insurance requires quantifiable, reproducible benchmarks rather than subjective "eye tests". InsureGraph AI implements a dual-stage evaluation framework:
1. **Retrieval Layer Evaluation** (Precision@K, Recall@K, F1-Score, Context Precision, Context Recall).
2. **Generation Layer Evaluation** (Faithfulness, Answer Relevance, Factual Correctness, LLM-as-a-Judge hallucination checks, and Brier Score Confidence Calibration).

---

## 2. Mathematical Formulations

### A. Precision@K
Quantifies the precision of the top-$K$ retrieved chunks against annotated relevant chunks:
$$\text{Precision@K} = \frac{|\text{Retrieved Chunks} \cap \text{Ground Truth Chunks}|}{K}$$

### B. Recall@K
Quantifies whether all necessary policy clauses were retrieved in the top-$K$:
$$\text{Recall@K} = \frac{|\text{Retrieved Chunks} \cap \text{Ground Truth Chunks}|}{|\text{Ground Truth Chunks}|}$$

### C. F1 Score
Harmonic balance between precision and recall:
$$\text{F1} = 2 \times \frac{\text{Precision@K} \times \text{Recall@K}}{\text{Precision@K} + \text{Recall@K}}$$

### D. Context Precision
Penalizes relevant chunks that appear low in the retrieved order:
$$\text{Context Precision} = \frac{1}{|R|} \sum_{k=1}^K \text{Precision@}k \times \mathbb{I}(\text{Chunk}_k \in \text{Relevant})$$

### E. Faithfulness
Measures whether every claim made in the generated answer can be mathematically derived or inferred from the retrieved context. Answers introducing unverified policy limits receive low faithfulness scores.

### F. Brier Score & Confidence Calibration
Measures the accuracy of probabilistic forecasts:
$$\text{Brier Score} = \frac{1}{N} \sum_{i=1}^N (f_i - o_i)^2$$
Where:
- $f_i \in [0, 1]$ is the predicted model confidence.
- $o_i \in \{0, 1\}$ is the actual binary verification outcome (1 if passed, 0 if failed).

A calibrated system achieves a Brier Score approaching $0.00$. The platform bins confidence predictions into uniform intervals $[0, 0.2), [0.2, 0.4), \dots, [0.8, 1.0]$ to generate reliability diagrams that highlight overconfidence and underconfidence.

---

## 3. LLM-as-a-Judge Protocol
The system employs `gemini-3.8-flash` as an independent adjudicator with strict structured output constraints:
```json
{
  "accuracy": 0.95,
  "relevance": 0.92,
  "faithfulness": 0.96,
  "hallucination_detected": false,
  "reasoning": "The answer aligns with Section 2.3 ICU sub-limit without introducing extraneous clauses."
}
```
### Limitations:
- The judge prompt is calibrated to be conservative; adversarial prompts attempting fraud are marked as passed only when the assistant issues a compliant refusal.
- Judge scores are an automated proxy, supplemented by deterministic token overlap and golden test case annotations.
