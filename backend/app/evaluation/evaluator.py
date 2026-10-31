"""
LLM & RAG Evaluation Engine: Precision@K, Recall@K, F1, Brier Score Calibration, and LLM-as-a-Judge.
"""
from typing import List, Dict, Any, Tuple


def calculate_precision_at_k(retrieved_ids: List[str], ground_truth_ids: List[str]) -> float:
    """
    Precision@K = (Relevant Retrieved Chunks) / (Total Retrieved Chunks)
    """
    if not retrieved_ids:
        return 0.0
    denom = min(len(retrieved_ids), len(ground_truth_ids)) if ground_truth_ids else len(retrieved_ids)
    relevant_retrieved = sum(1 for cid in retrieved_ids if cid in ground_truth_ids)
    return round(relevant_retrieved / (denom or 1), 4)


def calculate_recall_at_k(retrieved_ids: List[str], ground_truth_ids: List[str]) -> float:
    """
    Recall@K = (Relevant Retrieved Chunks) / (Total Relevant Chunks)
    """
    if not ground_truth_ids:
        return 0.0
    relevant_retrieved = sum(1 for cid in retrieved_ids if cid in ground_truth_ids)
    return round(relevant_retrieved / len(ground_truth_ids), 4)


def calculate_f1_score(precision: float, recall: float) -> float:
    """
    F1 Score = 2 * (Precision * Recall) / (Precision + Recall)
    """
    if precision + recall == 0:
        return 0.0
    return round((2.0 * precision * recall) / (precision + recall), 4)


def calculate_brier_score(predictions: List[float], outcomes: List[float]) -> float:
    """
    Brier Score: BS = (1/N) * sum((forecast_t - outcome_t)^2)
    Lower Brier score indicates superior probability calibration.
    """
    if not predictions or len(predictions) != len(outcomes):
        return 0.0
    n = len(predictions)
    squared_errors = [(p - o) ** 2 for p, o in zip(predictions, outcomes)]
    return round(sum(squared_errors) / n, 4)


def compute_calibration_bins(
    predictions: List[float],
    outcomes: List[float],
    num_bins: int = 5
) -> List[Dict[str, Any]]:
    """
    Bins confidence forecasts into uniform intervals to construct reliability diagrams.
    """
    bin_size = 1.0 / num_bins
    bins = []
    
    for i in range(num_bins):
        low = i * bin_size
        high = (i + 1) * bin_size
        bin_preds = []
        bin_outs = []
        
        for p, o in zip(predictions, outcomes):
            if low <= p < high or (i == num_bins - 1 and p == high):
                bin_preds.append(p)
                bin_outs.append(o)
                
        avg_conf = round(sum(bin_preds) / len(bin_preds), 4) if bin_preds else round((low + high) / 2.0, 2)
        avg_acc = round(sum(bin_outs) / len(bin_outs), 4) if bin_outs else 0.0
        
        bins.append({
            "range": f"{low:.1f} - {high:.1f}",
            "avg_confidence": avg_conf,
            "avg_accuracy": avg_acc,
            "count": len(bin_preds)
        })
        
    return bins
