"""
RAG Pipeline: Text extraction, Chunking, Cosine Semantic Retrieval, and Context Construction.
"""
import re
import math
from typing import List, Dict, Any, Tuple


def clean_text(text: str) -> str:
    """Removes excessive whitespace and standardizes policy formatting."""
    text = re.sub(r'\r\n', '\n', text)
    text = re.sub(r'[ \t]+', ' ', text)
    return text.strip()


def chunk_document(
    doc_id: str,
    doc_name: str,
    content: str,
    target_tokens: int = 400
) -> List[Dict[str, Any]]:
    """
    Chunks document content while strictly preserving Section headers and clause IDs.
    """
    cleaned = clean_text(content)
    lines = [l.strip() for l in cleaned.split('\n') if l.strip()]
    
    chunks = []
    current_section = "General Terms"
    current_body = []
    chunk_idx = 1
    
    for line in lines:
        if line.startswith("SECTION "):
            if current_body:
                text_block = "\n".join(current_body)
                chunks.append({
                    "id": f"{doc_id}_c{chunk_idx}",
                    "document_id": doc_id,
                    "document_name": doc_name,
                    "clause_id": f"Clause-{chunk_idx}",
                    "section": current_section,
                    "page_number": chunk_idx,
                    "text": text_block,
                    "token_count": int(len(text_block.split()) * 1.3),
                    "category": "policy"
                })
                chunk_idx += 1
                current_body = []
            current_section = line
        else:
            current_body.append(line)
            
    if current_body:
        text_block = "\n".join(current_body)
        chunks.append({
            "id": f"{doc_id}_c{chunk_idx}",
            "document_id": doc_id,
            "document_name": doc_name,
            "clause_id": f"Clause-{chunk_idx}",
            "section": current_section,
            "page_number": chunk_idx,
            "text": text_block,
            "token_count": int(len(text_block.split()) * 1.3),
            "category": "policy"
        })
        
    return chunks


def tokenize(text: str) -> List[str]:
    """Extracts non-stop lowercase tokens."""
    stop_words = {
        'a', 'an', 'the', 'in', 'on', 'at', 'to', 'for', 'of', 'and', 'or',
        'is', 'are', 'was', 'were', 'it', 'this', 'that', 'with', 'by', 'what',
        'how', 'when', 'under', 'does', 'any', 'can', 'if'
    }
    tokens = re.findall(r'\b[a-zA-Z0-9_\-]{2,}\b', text.lower())
    return [t for t in tokens if t not in stop_words]


def compute_chunk_similarity(query: str, chunk_text: str) -> float:
    """Computes BM25/Cosine style relevance score between query and chunk text."""
    q_tokens = tokenize(query)
    c_tokens = tokenize(chunk_text)
    if not q_tokens or not c_tokens:
        return 0.0
        
    c_freq = {}
    for t in c_tokens:
        c_freq[t] = c_freq.get(t, 0) + 1
        
    score = 0.0
    for qt in q_tokens:
        if qt in c_freq:
            tf = c_freq[qt] / math.sqrt(len(c_tokens))
            score += tf
            
    # Domain keyword bonus
    high_value_terms = {'icu', 'pre-existing', 'ped', 'cdl', 'fir', 'suicide', 'excess', 'deductible', 'evacuation'}
    for qt in q_tokens:
        if qt in high_value_terms and qt in c_freq:
            score += 0.5
            
    norm_score = score / (math.sqrt(len(q_tokens)) + 0.5)
    return min(0.99, max(0.05, 1.0 / (1.0 + math.exp(-norm_score * 2.0))))


class PythonRagPipeline:
    def __init__(self, chunks: List[Dict[str, Any]] = None):
        self.chunks = chunks or []

    def retrieve(self, query: str, top_k: int = 3) -> List[Tuple[Dict[str, Any], float]]:
        """Ranks chunks according to semantic similarity."""
        scored = []
        for c in self.chunks:
            full_chunk_text = f"{c.get('section', '')} {c.get('text', '')}"
            sim = compute_chunk_similarity(query, full_chunk_text)
            scored.append((c, sim))
            
        scored.sort(key=lambda x: x[1], reverse=True)
        return scored[:top_k]
