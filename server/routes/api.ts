import { Router, Request, Response } from 'express';
import { db } from '../services/db.ts';
import { ragService } from '../services/rag.ts';
import { graphEngine } from '../services/graph.ts';
import { evaluationEngine } from '../services/evaluation.ts';
import { ChatMessage, GoldenTestCase } from '../../src/types/index.ts';

const router = Router();

// -------------------------------------------------------------
// Health Check
// -------------------------------------------------------------
router.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'InsureGraph AI Backend',
    documentsCount: db.documents.size,
    chunksCount: db.chunks.size,
    graphNodesCount: db.graphEntities.size,
    goldenTestCasesCount: db.goldenTestCases.size,
    evaluationRunsCount: db.evaluationRuns.length,
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY)
  });
});

// -------------------------------------------------------------
// Dashboard Metrics
// -------------------------------------------------------------
router.get('/dashboard/metrics', (req: Request, res: Response) => {
  const metrics = db.getDashboardMetrics();
  res.json(metrics);
});

// -------------------------------------------------------------
// Document Intelligence
// -------------------------------------------------------------
router.get('/documents', (req: Request, res: Response) => {
  const docs = Array.from(db.documents.values());
  res.json(docs);
});

router.get('/documents/:id', (req: Request, res: Response) => {
  const doc = db.documents.get(req.params.id);
  if (!doc) {
    return res.status(404).json({ error: 'Document not found' });
  }
  const chunks = Array.from(db.chunks.values()).filter(c => c.documentId === req.params.id);
  res.json({ document: doc, chunks });
});

router.delete('/documents/:id', (req: Request, res: Response) => {
  const doc = db.documents.get(req.params.id);
  if (!doc) {
    return res.status(404).json({ error: 'Document not found' });
  }

  // Delete chunks
  const chunkKeysToDelete: string[] = [];
  for (const [key, chunk] of db.chunks.entries()) {
    if (chunk.documentId === req.params.id) {
      chunkKeysToDelete.push(key);
    }
  }
  for (const k of chunkKeysToDelete) {
    db.chunks.delete(k);
  }

  db.documents.delete(req.params.id);
  res.json({ success: true, deletedDocumentId: req.params.id, deletedChunksCount: chunkKeysToDelete.length });
});

router.post('/documents/upload', (req: Request, res: Response) => {
  const { name, content, category, policyType, version } = req.body;
  if (!name || !content) {
    return res.status(400).json({ error: 'Missing required document name or text content.' });
  }

  const id = `doc-custom-${Date.now()}`;
  const raw = {
    id,
    name,
    category: category || 'health',
    policyType: policyType || 'Custom Policy Schedule',
    version: version || 'v1.0-custom',
    summary: content.slice(0, 180) + '...',
    content
  };

  const doc = db.ingestRawDocument(raw);

  // Auto-extract into Knowledge Graph
  graphEngine.extractFromPolicy(doc.id, doc.name, content);

  res.status(201).json({
    document: doc,
    message: 'Document successfully ingested, chunked, and synchronized with vector store & knowledge graph.'
  });
});

router.post('/documents/:id/process', (req: Request, res: Response) => {
  const doc = db.documents.get(req.params.id);
  if (!doc) {
    return res.status(404).json({ error: 'Document not found' });
  }

  // Find all chunks
  const docChunks = Array.from(db.chunks.values()).filter(c => c.documentId === req.params.id);
  const combinedText = docChunks.map(c => c.text).join('\n\n');

  // Re-run extraction
  graphEngine.extractFromPolicy(doc.id, doc.name, combinedText);

  doc.status = 'indexed';
  res.json({
    success: true,
    documentId: doc.id,
    chunksProcessed: docChunks.length,
    message: 'Re-indexed vectors and updated knowledge graph relationships.'
  });
});

// -------------------------------------------------------------
// AI Assistant (RAG Pipeline)
// -------------------------------------------------------------
router.post('/chat/query', async (req: Request, res: Response) => {
  const { query, topK = 3, sessionId = 'default-session' } = req.body;
  if (!query || typeof query !== 'string') {
    return res.status(400).json({ error: 'Query string is required.' });
  }

  try {
    const result = await ragService.answerQuestion(query, Number(topK) || 3);

    const userMessage: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      sessionId,
      role: 'user',
      content: query,
      timestamp: new Date().toISOString()
    };
    db.chatMessages.push(userMessage);

    const assistantMessage: ChatMessage = {
      id: `msg-asst-${Date.now() + 1}`,
      sessionId,
      role: 'assistant',
      content: result.answer,
      timestamp: new Date().toISOString(),
      sources: result.sources,
      confidence: result.confidence,
      retrievalLatencyMs: result.retrievalLatencyMs,
      generationLatencyMs: result.generationLatencyMs
    };
    db.chatMessages.push(assistantMessage);

    res.json(assistantMessage);
  } catch (err: any) {
    console.error('Error in chat query:', err);
    res.status(500).json({ error: err.message || 'Internal error processing RAG query.' });
  }
});

router.get('/chat/history', (req: Request, res: Response) => {
  res.json(db.chatMessages);
});

router.delete('/chat/history', (req: Request, res: Response) => {
  db.chatMessages = [];
  res.json({ success: true, message: 'Chat history cleared.' });
});

// -------------------------------------------------------------
// Knowledge Graph
// -------------------------------------------------------------
router.get('/knowledge-graph', (req: Request, res: Response) => {
  const data = graphEngine.getGraphData();
  res.json(data);
});

router.get('/knowledge-graph/entity/:id', (req: Request, res: Response) => {
  const details = graphEngine.getEntityDetails(req.params.id);
  if (!details.entity) {
    return res.status(404).json({ error: 'Graph entity not found' });
  }
  res.json(details);
});

router.post('/knowledge-graph/search', (req: Request, res: Response) => {
  const { keyword = '', typeFilter = 'all' } = req.body;
  const results = graphEngine.searchEntities(keyword, typeFilter);
  res.json(results);
});

router.post('/knowledge-graph/traverse', (req: Request, res: Response) => {
  const { sourceId, targetId } = req.body;
  if (!sourceId || !targetId) {
    return res.status(400).json({ error: 'sourceId and targetId are required for traversal.' });
  }
  const path = graphEngine.findPath(sourceId, targetId);
  if (!path) {
    return res.status(404).json({ error: 'No connection path found between selected entities.' });
  }
  res.json(path);
});

// -------------------------------------------------------------
// Evaluation Lab & Golden Datasets
// -------------------------------------------------------------
router.get('/evaluation/datasets', (req: Request, res: Response) => {
  const testCases = Array.from(db.goldenTestCases.values());
  const categoryCounts: Record<string, number> = {};
  const difficultyCounts: Record<string, number> = {};

  for (const tc of testCases) {
    categoryCounts[tc.category] = (categoryCounts[tc.category] || 0) + 1;
    difficultyCounts[tc.difficulty] = (difficultyCounts[tc.difficulty] || 0) + 1;
  }

  res.json({
    total: testCases.length,
    testCases,
    categoryCounts,
    difficultyCounts
  });
});

router.post('/evaluation/datasets', (req: Request, res: Response) => {
  const { testCase } = req.body;
  if (!testCase || !testCase.question || !testCase.expectedAnswer) {
    return res.status(400).json({ error: 'Test case question and expectedAnswer are required.' });
  }

  const id = testCase.id || `gtc-custom-${Date.now()}`;
  const newCase: GoldenTestCase = {
    id,
    question: testCase.question,
    expectedAnswer: testCase.expectedAnswer,
    expectedContext: testCase.expectedContext || '',
    relevantDocument: testCase.relevantDocument || 'Custom Document',
    relevantChunks: testCase.relevantChunks || [],
    category: testCase.category || 'coverage',
    difficulty: testCase.difficulty || 'Medium'
  };

  db.goldenTestCases.set(id, newCase);
  res.status(201).json(newCase);
});

router.put('/evaluation/datasets/:id', (req: Request, res: Response) => {
  const existing = db.goldenTestCases.get(req.params.id);
  if (!existing) {
    return res.status(404).json({ error: 'Test case not found' });
  }

  const updated: GoldenTestCase = {
    ...existing,
    ...req.body
  };
  db.goldenTestCases.set(req.params.id, updated);
  res.json(updated);
});

router.delete('/evaluation/datasets/:id', (req: Request, res: Response) => {
  if (!db.goldenTestCases.has(req.params.id)) {
    return res.status(404).json({ error: 'Test case not found' });
  }
  db.goldenTestCases.delete(req.params.id);
  res.json({ success: true, deletedId: req.params.id });
});

router.post('/evaluation/run', async (req: Request, res: Response) => {
  const { testCaseIds, kValue = 3, datasetName = 'Insurance Golden Benchmark' } = req.body;
  try {
    const run = await evaluationEngine.executeEvaluationRun(testCaseIds, Number(kValue) || 3, datasetName);
    res.json(run);
  } catch (err: any) {
    console.error('Evaluation run error:', err);
    res.status(500).json({ error: err.message || 'Error executing evaluation run.' });
  }
});

router.get('/evaluation/history', (req: Request, res: Response) => {
  res.json(db.evaluationRuns);
});

router.get('/evaluation/results/:id', (req: Request, res: Response) => {
  const run = db.evaluationRuns.find(r => r.id === req.params.id);
  if (!run) {
    return res.status(404).json({ error: 'Evaluation run not found.' });
  }
  res.json(run);
});

export default router;
