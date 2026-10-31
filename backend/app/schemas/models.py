"""
Pydantic Schemas and Domain Models for InsureGraph AI Backend.
"""
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


class DocumentMetadata(BaseModel):
    id: str
    name: str
    category: str
    size: int
    status: str = "indexed"
    chunk_count: int
    token_count: int
    policy_type: str
    version: str


class DocumentChunkSchema(BaseModel):
    id: str
    document_id: str
    document_name: str
    clause_id: str
    section: str
    page_number: int
    text: str
    token_count: int
    category: str


class RagQueryRequest(BaseModel):
    query: str
    top_k: int = 3
    session_id: str = "default-session"


class SourceCitation(BaseModel):
    document: str
    clause: str
    section: str
    page: int
    chunk_id: str
    similarity: float
    snippet: str


class RagQueryResponse(BaseModel):
    answer: str
    sources: List[SourceCitation]
    confidence: float
    retrieval_latency_ms: int
    generation_latency_ms: int


class GraphEntitySchema(BaseModel):
    id: str
    name: str
    type: str
    description: str
    properties: Dict[str, Any] = Field(default_factory=dict)
    degree: Optional[int] = None
    pagerank: Optional[float] = None


class GraphRelationshipSchema(BaseModel):
    id: str
    source: str
    target: str
    type: str
    properties: Dict[str, Any] = Field(default_factory=dict)


class GoldenTestCaseSchema(BaseModel):
    id: str
    question: str
    expected_answer: str
    expected_context: str
    relevant_document: str
    relevant_chunks: List[str]
    category: str
    difficulty: str


class EvaluationRunRequest(BaseModel):
    test_case_ids: Optional[List[str]] = None
    k_value: int = 3
    dataset_name: str = "Production Golden Benchmark"
