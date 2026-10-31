"""
Automated Unit Tests for InsureGraph AI:
- RAG Chunking & Similarity Ranking
- Precision@K, Recall@K, F1 Score
- Brier Score Calibration & Binning
- Knowledge Graph BFS Shortest Path & Degree Centrality
"""
import unittest
import sys
import os

# Add parent directory to sys.path so backend modules can be imported
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.app.rag.pipeline import (
    clean_text,
    chunk_document,
    compute_chunk_similarity,
    PythonRagPipeline
)
from backend.app.evaluation.evaluator import (
    calculate_precision_at_k,
    calculate_recall_at_k,
    calculate_f1_score,
    calculate_brier_score,
    compute_calibration_bins
)
from backend.app.knowledge_graph.graph_engine import PythonKnowledgeGraph


class TestRAGPipeline(unittest.TestCase):
    def setUp(self):
        self.sample_policy = (
            "SECTION 1: COVERAGE AGREEMENT\n"
            "1.1 Inpatient Hospitalization: Pays eligible room and board expenses up to $500,000.\n"
            "1.2 ICU Daily Cap: Daily Intensive Care Unit charges are capped at $2,500 per day.\n"
            "SECTION 2: EXCLUSIONS\n"
            "2.1 Cosmetic Surgery: Cosmetic operations are excluded unless post trauma.\n"
            "2.2 Pre-existing Diseases: Excluded for the first 24 months of coverage.\n"
        )

    def test_clean_text(self):
        dirty = "  SECTION 1:    COVERAGE\r\n\r\nClause 1.1   pays expenses.  "
        cleaned = clean_text(dirty)
        self.assertEqual(cleaned, "SECTION 1: COVERAGE\n\nClause 1.1 pays expenses.")

    def test_chunking_preserves_sections(self):
        chunks = chunk_document("doc-test", "Test Policy.pdf", self.sample_policy)
        self.assertEqual(len(chunks), 2)
        self.assertEqual(chunks[0]["section"], "SECTION 1: COVERAGE AGREEMENT")
        self.assertEqual(chunks[1]["section"], "SECTION 2: EXCLUSIONS")
        self.assertIn("ICU", chunks[0]["text"])
        self.assertIn("Cosmetic", chunks[1]["text"])

    def test_semantic_similarity_ranking(self):
        chunks = chunk_document("doc-test", "Test Policy.pdf", self.sample_policy)
        rag = PythonRagPipeline(chunks)
        results = rag.retrieve("What is the daily ICU limit?", top_k=2)
        self.assertGreater(len(results), 0)
        top_chunk, score = results[0]
        self.assertEqual(top_chunk["section"], "SECTION 1: COVERAGE AGREEMENT")
        self.assertGreater(score, 0.5)


class TestEvaluationEngine(unittest.TestCase):
    def test_precision_at_k(self):
        retrieved = ["chunk_1", "chunk_2", "chunk_3"]
        ground_truth = ["chunk_1", "chunk_3", "chunk_5"]
        # 2 out of 3 retrieved are relevant -> Precision = 2/3 = 0.6667
        precision = calculate_precision_at_k(retrieved, ground_truth)
        self.assertAlmostEqual(precision, 0.6667, places=3)

    def test_recall_at_k(self):
        retrieved = ["chunk_1", "chunk_2", "chunk_3"]
        ground_truth = ["chunk_1", "chunk_3", "chunk_5", "chunk_6"]
        # 2 out of 4 relevant were retrieved -> Recall = 2/4 = 0.5
        recall = calculate_recall_at_k(retrieved, ground_truth)
        self.assertEqual(recall, 0.5)

    def test_f1_score(self):
        precision = 0.8
        recall = 0.8
        f1 = calculate_f1_score(precision, recall)
        self.assertEqual(f1, 0.8)

    def test_f1_score_zero_division(self):
        f1 = calculate_f1_score(0.0, 0.0)
        self.assertEqual(f1, 0.0)

    def test_brier_score_calibration(self):
        # Perfect forecasts: predictions match outcomes exactly -> Brier = 0.0
        preds = [1.0, 0.0, 1.0, 0.0]
        outs = [1.0, 0.0, 1.0, 0.0]
        self.assertEqual(calculate_brier_score(preds, outs), 0.0)

        # Imperfect forecasts:
        # (0.8 - 1.0)^2 = 0.04
        # (0.2 - 0.0)^2 = 0.04
        # Avg = 0.04
        self.assertAlmostEqual(calculate_brier_score([0.8, 0.2], [1.0, 0.0]), 0.04)

    def test_calibration_binning(self):
        preds = [0.15, 0.35, 0.55, 0.75, 0.95]
        outs = [0.0, 0.0, 1.0, 1.0, 1.0]
        bins = compute_calibration_bins(preds, outs, num_bins=5)
        self.assertEqual(len(bins), 5)
        self.assertEqual(bins[4]["count"], 1)
        self.assertEqual(bins[4]["avg_accuracy"], 1.0)


class TestKnowledgeGraph(unittest.TestCase):
    def setUp(self):
        self.kg = PythonKnowledgeGraph()
        self.kg.add_node("cust-01", "Eleanor Vance", "Customer", "Policyholder")
        self.kg.add_node("pol-01", "Health Policy", "Insurance Policy", "Medical plan")
        self.kg.add_node("cov-01", "Inpatient Care", "Coverage", "Hospital benefit")
        self.kg.add_node("clm-01", "Claim #881", "Claim", "Appendectomy claim")

        self.kg.add_edge("e1", "cust-01", "pol-01", "CUSTOMER_OWNS_POLICY")
        self.kg.add_edge("e2", "pol-01", "cov-01", "POLICY_PROVIDES_COVERAGE")
        self.kg.add_edge("e3", "cust-01", "clm-01", "CUSTOMER_SUBMITS_CLAIM")

    def test_degree_centrality(self):
        centrality = self.kg.calculate_degree_centrality()
        # cust-01 has 2 edges, pol-01 has 2 edges, cov-01 has 1 edge, clm-01 has 1 edge. Total nodes = 4.
        # Deg centrality = deg / (4 - 1) = deg / 3
        self.assertAlmostEqual(centrality["cust-01"], 2 / 3, places=3)
        self.assertAlmostEqual(centrality["clm-01"], 1 / 3, places=3)

    def test_bfs_shortest_path(self):
        # Path from clm-01 to cov-01:
        # clm-01 -> cust-01 -> pol-01 -> cov-01 (length = 3 hops)
        path = self.kg.find_shortest_path("clm-01", "cov-01")
        self.assertIsNotNone(path)
        self.assertEqual(path["length"], 3)
        node_names = [n["name"] for n in path["nodes"]]
        self.assertEqual(node_names, ["Claim #881", "Eleanor Vance", "Health Policy", "Inpatient Care"])


if __name__ == '__main__':
    unittest.main()
