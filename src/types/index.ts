export interface InsuranceDocument {
  id: string;
  name: string;
  category: 'health' | 'motor' | 'life' | 'property' | 'travel';
  size: number;
  uploadedAt: string;
  status: 'indexed' | 'processing' | 'error';
  chunkCount: number;
  tokenCount: number;
  policyType: string;
  version: string;
  summary: string;
}

export interface DocumentChunk {
  id: string;
  documentId: string;
  documentName: string;
  clauseId: string;
  section: string;
  pageNumber: number;
  text: string;
  tokenCount: number;
  embeddingVector?: number[];
  category: string;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  sources?: Array<{
    document: string;
    clause: string;
    section: string;
    page: number;
    chunkId: string;
    similarity: number;
    snippet: string;
  }>;
  confidence?: number;
  retrievalLatencyMs?: number;
  generationLatencyMs?: number;
  evalScores?: {
    faithfulness?: number;
    answerRelevance?: number;
  };
}

export interface GraphEntity {
  id: string;
  name: string;
  type:
    | 'Customer'
    | 'Insurance Policy'
    | 'Insurance Provider'
    | 'Coverage'
    | 'Claim'
    | 'Medical Treatment'
    | 'Vehicle'
    | 'Premium'
    | 'Exclusion';
  description: string;
  properties: Record<string, any>;
  degree?: number;
  pagerank?: number;
}

export interface GraphRelationship {
  id: string;
  source: string;
  target: string;
  type:
    | 'CUSTOMER_OWNS_POLICY'
    | 'POLICY_PROVIDES_COVERAGE'
    | 'POLICY_HAS_EXCLUSION'
    | 'CUSTOMER_SUBMITS_CLAIM'
    | 'CLAIM_RELATES_TO_POLICY'
    | 'COVERAGE_INCLUDES_TREATMENT'
    | 'POLICY_HAS_PREMIUM'
    | 'POLICY_ISSUED_BY_PROVIDER'
    | 'CLAIM_INVOLVES_TREATMENT'
    | 'CLAIM_INVOLVES_VEHICLE';
  properties?: Record<string, any>;
}

export interface GoldenTestCase {
  id: string;
  question: string;
  expectedAnswer: string;
  expectedContext: string;
  relevantDocument: string;
  relevantChunks: string[];
  category: 'coverage' | 'exclusions' | 'deductibles_limits' | 'claim_procedures' | 'edge_cases_adversarial';
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Adversarial';
}

export interface EvaluationItemResult {
  testCaseId: string;
  question: string;
  expectedAnswer: string;
  actualAnswer: string;
  retrievedChunks: string[];
  expectedChunks: string[];
  precisionAtK: number;
  recallAtK: number;
  f1Score: number;
  faithfulness: number;
  answerRelevance: number;
  contextPrecision: number;
  contextRecall: number;
  predictedConfidence: number;
  actualCorrectness: number;
  brierError: number;
  llmJudge: {
    accuracy: number;
    relevance: number;
    faithfulness: number;
    hallucinationDetected: boolean;
    reasoning: string;
  };
  latencyMs: number;
  passed: boolean;
}

export interface EvaluationRun {
  id: string;
  runAt: string;
  datasetName: string;
  totalCases: number;
  kValue: number;
  metrics: {
    precisionAtK: number;
    recallAtK: number;
    f1Score: number;
    faithfulness: number;
    answerRelevance: number;
    contextPrecision: number;
    contextRecall: number;
    brierScore: number;
    avgLatencyMs: number;
    passRate: number;
  };
  calibration: {
    bins: Array<{
      confidenceRange: string;
      avgConfidence: number;
      avgAccuracy: number;
      count: number;
    }>;
    overconfidenceCount: number;
    underconfidenceCount: number;
  };
  results: EvaluationItemResult[];
}

export interface DashboardMetrics {
  totalDocuments: number;
  totalProcessedDocuments: number;
  totalAiQueries: number;
  averageResponseTimeMs: number;
  averageRetrievalPrecision: number;
  averageFaithfulnessScore: number;
  totalEvaluationRuns: number;
  recentActivity: Array<{
    id: string;
    type: 'document' | 'query' | 'evaluation';
    title: string;
    detail: string;
    timestamp: string;
  }>;
  recentEvaluationRuns: Array<{
    id: string;
    runAt: string;
    f1Score: number;
    faithfulness: number;
    precisionAtK: number;
    recallAtK: number;
    passRate: number;
  }>;
  queryVolumeTrends: Array<{
    date: string;
    queries: number;
    avgConfidence: number;
  }>;
  ragPerformanceTrends: Array<{
    metric: string;
    baseline: number;
    current: number;
    target: number;
  }>;
}
