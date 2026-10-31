import {
  InsuranceDocument,
  DocumentChunk,
  ChatMessage,
  GraphEntity,
  GraphRelationship,
  GoldenTestCase,
  EvaluationRun,
  DashboardMetrics
} from '../../src/types/index.ts';
import { SAMPLE_DOCUMENTS, RawSampleDoc } from '../data/sample_documents.ts';
import { INITIAL_GOLDEN_DATASET } from '../data/golden_dataset.ts';
import { INITIAL_GRAPH_ENTITIES, INITIAL_GRAPH_RELATIONSHIPS } from '../data/knowledge_graph.ts';

class DatabaseStore {
  public documents: Map<string, InsuranceDocument> = new Map();
  public chunks: Map<string, DocumentChunk> = new Map();
  public chatMessages: ChatMessage[] = [];
  public graphEntities: Map<string, GraphEntity> = new Map();
  public graphRelationships: Map<string, GraphRelationship> = new Map();
  public goldenTestCases: Map<string, GoldenTestCase> = new Map();
  public evaluationRuns: EvaluationRun[] = [];
  public queryLogs: Array<{ timestamp: string; latencyMs: number; confidence: number; query: string }> = [];

  constructor() {
    this.seedInitialData();
  }

  public seedInitialData() {
    // 1. Seed Documents & Chunks
    for (const raw of SAMPLE_DOCUMENTS) {
      this.ingestRawDocument(raw);
    }

    // 2. Seed Golden Test Cases
    for (const tc of INITIAL_GOLDEN_DATASET) {
      this.goldenTestCases.set(tc.id, { ...tc });
    }

    // 3. Seed Graph
    for (const ent of INITIAL_GRAPH_ENTITIES) {
      this.graphEntities.set(ent.id, { ...ent });
    }
    for (const rel of INITIAL_GRAPH_RELATIONSHIPS) {
      this.graphRelationships.set(rel.id, { ...rel });
    }

    // 4. Seed a baseline Evaluation Run so the evaluation dashboard has historical data
    this.seedBaselineEvaluation();
  }

  public ingestRawDocument(raw: RawSampleDoc): InsuranceDocument {
    const lines = raw.content.trim().split('\n').filter(l => l.trim().length > 0);
    const sections: Array<{ title: string; body: string }> = [];
    let currentTitle = 'Introduction';
    let currentBody: string[] = [];

    for (const line of lines) {
      if (line.startsWith('SECTION ')) {
        if (currentBody.length > 0) {
          sections.push({ title: currentTitle, body: currentBody.join('\n') });
          currentBody = [];
        }
        currentTitle = line.trim();
      } else {
        currentBody.push(line.trim());
      }
    }
    if (currentBody.length > 0) {
      sections.push({ title: currentTitle, body: currentBody.join('\n') });
    }

    let chunkIndex = 1;
    const createdChunks: DocumentChunk[] = [];
    for (const sec of sections) {
      const chunkId = `${raw.id}_c${chunkIndex}`;
      const chunk: DocumentChunk = {
        id: chunkId,
        documentId: raw.id,
        documentName: raw.name,
        clauseId: `Clause-${chunkIndex}`,
        section: sec.title,
        pageNumber: chunkIndex,
        text: sec.body,
        tokenCount: Math.round(sec.body.split(/\s+/).length * 1.3),
        category: raw.category
      };
      this.chunks.set(chunkId, chunk);
      createdChunks.push(chunk);
      chunkIndex++;
    }

    const totalTokens = createdChunks.reduce((acc, c) => acc + c.tokenCount, 0);
    const doc: InsuranceDocument = {
      id: raw.id,
      name: raw.name,
      category: raw.category,
      size: raw.content.length,
      uploadedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      status: 'indexed',
      chunkCount: createdChunks.length,
      tokenCount: totalTokens,
      policyType: raw.policyType,
      version: raw.version,
      summary: raw.summary
    };

    this.documents.set(raw.id, doc);
    return doc;
  }

  private seedBaselineEvaluation() {
    const initialCases = INITIAL_GOLDEN_DATASET.slice(0, 20);
    const results = initialCases.map((tc, idx) => {
      const precision = idx % 5 === 0 ? 0.8 : 1.0;
      const recall = idx % 6 === 0 ? 0.75 : 1.0;
      const f1 = (2 * precision * recall) / (precision + recall);
      const conf = 0.82 + (idx % 15) * 0.01;
      const pass = f1 >= 0.75;
      return {
        testCaseId: tc.id,
        question: tc.question,
        expectedAnswer: tc.expectedAnswer,
        actualAnswer: tc.expectedAnswer,
        retrievedChunks: tc.relevantChunks,
        expectedChunks: tc.relevantChunks,
        precisionAtK: precision,
        recallAtK: recall,
        f1Score: Number(f1.toFixed(3)),
        faithfulness: 0.94,
        answerRelevance: 0.92,
        contextPrecision: 0.95,
        contextRecall: 0.91,
        predictedConfidence: Number(conf.toFixed(2)),
        actualCorrectness: pass ? 1.0 : 0.0,
        brierError: Number(Math.pow(conf - (pass ? 1.0 : 0.0), 2).toFixed(4)),
        llmJudge: {
          accuracy: 0.93,
          relevance: 0.95,
          faithfulness: 0.96,
          hallucinationDetected: false,
          reasoning: 'RAG context directly substantiates every factual proposition without extraneous extrapolation.'
        },
        latencyMs: 380 + (idx % 8) * 45,
        passed: pass
      };
    });

    const avgP = results.reduce((acc, r) => acc + r.precisionAtK, 0) / results.length;
    const avgR = results.reduce((acc, r) => acc + r.recallAtK, 0) / results.length;
    const avgF1 = results.reduce((acc, r) => acc + r.f1Score, 0) / results.length;
    const avgFaith = results.reduce((acc, r) => acc + r.faithfulness, 0) / results.length;
    const avgRel = results.reduce((acc, r) => acc + r.answerRelevance, 0) / results.length;
    const avgCP = results.reduce((acc, r) => acc + r.contextPrecision, 0) / results.length;
    const avgCR = results.reduce((acc, r) => acc + r.contextRecall, 0) / results.length;
    const brier = results.reduce((acc, r) => acc + r.brierError, 0) / results.length;
    const avgLat = results.reduce((acc, r) => acc + r.latencyMs, 0) / results.length;
    const passes = results.filter(r => r.passed).length;

    const run: EvaluationRun = {
      id: 'eval-run-benchmark-01',
      runAt: new Date(Date.now() - 3600000 * 4).toISOString(),
      datasetName: 'Synthetic Insurance Baseline v1',
      totalCases: results.length,
      kValue: 3,
      metrics: {
        precisionAtK: Number(avgP.toFixed(3)),
        recallAtK: Number(avgR.toFixed(3)),
        f1Score: Number(avgF1.toFixed(3)),
        faithfulness: Number(avgFaith.toFixed(3)),
        answerRelevance: Number(avgRel.toFixed(3)),
        contextPrecision: Number(avgCP.toFixed(3)),
        contextRecall: Number(avgCR.toFixed(3)),
        brierScore: Number(brier.toFixed(4)),
        avgLatencyMs: Math.round(avgLat),
        passRate: Number(((passes / results.length) * 100).toFixed(1))
      },
      calibration: {
        bins: [
          { confidenceRange: '0.0 - 0.2', avgConfidence: 0.15, avgAccuracy: 0.1, count: 0 },
          { confidenceRange: '0.2 - 0.4', avgConfidence: 0.32, avgAccuracy: 0.28, count: 0 },
          { confidenceRange: '0.4 - 0.6', avgConfidence: 0.52, avgAccuracy: 0.55, count: 2 },
          { confidenceRange: '0.6 - 0.8', avgConfidence: 0.74, avgAccuracy: 0.78, count: 5 },
          { confidenceRange: '0.8 - 1.0', avgConfidence: 0.89, avgAccuracy: 0.92, count: 13 }
        ],
        overconfidenceCount: 1,
        underconfidenceCount: 2
      },
      results
    };

    this.evaluationRuns.unshift(run);

    // Initial mock query logs
    const seedQueries = [
      { q: 'What is covered under health policy?', conf: 0.92, lat: 410 },
      { q: 'Does commercial fleet cover windshield damage?', conf: 0.95, lat: 380 },
      { q: 'What is the waiting period for critical illness?', conf: 0.89, lat: 450 },
      { q: 'Is cosmetic surgery covered after an accident?', conf: 0.94, lat: 420 },
      { q: 'What is the travel medical evacuation limit?', conf: 0.97, lat: 390 }
    ];
    for (let i = 0; i < seedQueries.length; i++) {
      this.queryLogs.push({
        timestamp: new Date(Date.now() - 3600000 * (i + 1)).toISOString(),
        query: seedQueries[i].q,
        confidence: seedQueries[i].conf,
        latencyMs: seedQueries[i].lat
      });
    }
  }

  public getDashboardMetrics(): DashboardMetrics {
    const docs = Array.from(this.documents.values());
    const indexedDocs = docs.filter(d => d.status === 'indexed');
    const latestRun = this.evaluationRuns[0];

    const avgLatency = this.queryLogs.length > 0
      ? Math.round(this.queryLogs.reduce((acc, q) => acc + q.latencyMs, 0) / this.queryLogs.length)
      : 420;

    const avgPrecision = latestRun ? latestRun.metrics.precisionAtK : 0.92;
    const avgFaith = latestRun ? latestRun.metrics.faithfulness : 0.94;

    const recentActivity = [
      {
        id: 'act-1',
        type: 'query' as const,
        title: 'Policy Coverage Query',
        detail: 'Answered "What is covered under ICU sub-limit" with 96% confidence',
        timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString()
      },
      {
        id: 'act-2',
        type: 'evaluation' as const,
        title: 'Evaluation Run Completed',
        detail: `Run benchmark-01 evaluated ${latestRun ? latestRun.totalCases : 20} cases (F1: ${latestRun ? latestRun.metrics.f1Score : 0.91})`,
        timestamp: latestRun ? latestRun.runAt : new Date().toISOString()
      },
      {
        id: 'act-3',
        type: 'document' as const,
        title: 'Vector Store Synchronized',
        detail: `5 policy documents indexed across ${this.chunks.size} semantic chunks`,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
      }
    ];

    const recentRuns = this.evaluationRuns.slice(0, 5).map(r => ({
      id: r.id,
      runAt: r.runAt,
      f1Score: r.metrics.f1Score,
      faithfulness: r.metrics.faithfulness,
      precisionAtK: r.metrics.precisionAtK,
      recallAtK: r.metrics.recallAtK,
      passRate: r.metrics.passRate
    }));

    const queryVolumeTrends = [
      { date: 'Mon', queries: 28, avgConfidence: 0.89 },
      { date: 'Tue', queries: 45, avgConfidence: 0.91 },
      { date: 'Wed', queries: 38, avgConfidence: 0.92 },
      { date: 'Thu', queries: 62, avgConfidence: 0.94 },
      { date: 'Fri', queries: 79, avgConfidence: 0.93 },
      { date: 'Sat', queries: 41, avgConfidence: 0.90 },
      { date: 'Sun', queries: 35, avgConfidence: 0.92 }
    ];

    const ragPerformanceTrends = [
      { metric: 'Precision@K', baseline: 0.78, current: avgPrecision, target: 0.95 },
      { metric: 'Recall@K', baseline: 0.72, current: latestRun ? latestRun.metrics.recallAtK : 0.88, target: 0.92 },
      { metric: 'F1 Score', baseline: 0.75, current: latestRun ? latestRun.metrics.f1Score : 0.90, target: 0.93 },
      { metric: 'Faithfulness', baseline: 0.81, current: avgFaith, target: 0.96 },
      { metric: 'Context Recall', baseline: 0.74, current: latestRun ? latestRun.metrics.contextRecall : 0.89, target: 0.95 }
    ];

    return {
      totalDocuments: docs.length,
      totalProcessedDocuments: indexedDocs.length,
      totalAiQueries: this.queryLogs.length + 142,
      averageResponseTimeMs: avgLatency,
      averageRetrievalPrecision: Number(avgPrecision.toFixed(2)),
      averageFaithfulnessScore: Number(avgFaith.toFixed(2)),
      totalEvaluationRuns: this.evaluationRuns.length,
      recentActivity,
      recentEvaluationRuns: recentRuns,
      queryVolumeTrends,
      ragPerformanceTrends
    };
  }
}

export const db = new DatabaseStore();
