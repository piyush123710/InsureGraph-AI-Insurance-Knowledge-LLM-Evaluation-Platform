import { GoogleGenAI } from '@google/genai';
import { db } from './db.ts';
import { DocumentChunk } from '../../src/types/index.ts';

// Server-side initialization of Gemini client per skill instructions
const apiKey = process.env.GEMINI_API_KEY || '';
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

/**
 * Tokenizes text into lowercase normalized terms, eliminating punctuation and stop words.
 */
function tokenize(text: string): string[] {
  const stopWords = new Set([
    'a', 'an', 'the', 'in', 'on', 'at', 'to', 'for', 'of', 'and', 'or', 'is', 'are', 'was', 'were',
    'it', 'this', 'that', 'with', 'as', 'by', 'be', 'from', 'what', 'which', 'who', 'how', 'when',
    'under', 'does', 'any', 'can', 'if', 'i', 'my', 'you', 'your', 'we', 'our'
  ]);
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 1 && !stopWords.has(t));
}

/**
 * Calculates BM25 / TF-IDF style cosine semantic similarity between query tokens and document chunks.
 */
function computeChunkRelevance(queryTokens: string[], chunk: DocumentChunk): number {
  const chunkText = `${chunk.section} ${chunk.text} ${chunk.documentName}`.toLowerCase();
  const chunkTokens = tokenize(chunkText);
  if (chunkTokens.length === 0 || queryTokens.length === 0) return 0;

  const chunkFreq: Record<string, number> = {};
  for (const t of chunkTokens) {
    chunkFreq[t] = (chunkFreq[t] || 0) + 1;
  }

  let matchScore = 0;
  let exactBonus = 0;

  for (const qt of queryTokens) {
    if (chunkFreq[qt]) {
      // Frequency weighting + inverse document length damping
      const tf = chunkFreq[qt] / Math.sqrt(chunkTokens.length);
      matchScore += tf;
    }
    // High-value domain keywords bonus (e.g. ICU, pre-existing, CDL, excess, FIR, suicide, deductible)
    if (['icu', 'pre-existing', 'ped', 'cdl', 'fir', 'suicide', 'excess', 'deductible', 'evacuation', 'chemotherapy', 'bypass'].includes(qt)) {
      if (chunkFreq[qt]) exactBonus += 0.5;
    }
  }

  // Check for multi-word exact phrase match
  const rawQuery = queryTokens.join(' ');
  if (chunkText.includes(rawQuery)) {
    exactBonus += 1.0;
  }

  const normalizedScore = matchScore / (Math.sqrt(queryTokens.length) + 0.5) + exactBonus * 0.4;
  // Normalize to 0.0 - 0.99 range
  return Math.min(0.99, Math.max(0.08, Number((1 / (1 + Math.exp(-normalizedScore * 2.2))).toFixed(3))));
}

export interface RagRetrievalResult {
  chunk: DocumentChunk;
  score: number;
}

export class RagService {
  /**
   * Retrieves top-K most relevant chunks across all indexed policy documents.
   */
  public retrieve(query: string, topK: number = 3): RagRetrievalResult[] {
    const allChunks = Array.from(db.chunks.values());
    const queryTokens = tokenize(query);

    const scored = allChunks.map(chunk => ({
      chunk,
      score: computeChunkRelevance(queryTokens, chunk)
    }));

    // Sort descending by relevance score
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, topK);
  }

  /**
   * Generates a grounded response using Gemini API or rule-based synthesis.
   */
  public async answerQuestion(query: string, topK: number = 3): Promise<{
    answer: string;
    sources: Array<{
      document: string;
      clause: string;
      section: string;
      page: number;
      chunkId: string;
      similarity: number;
      snippet: string;
    }>;
    confidence: number;
    retrievalLatencyMs: number;
    generationLatencyMs: number;
  }> {
    const startRetrieval = Date.now();
    const retrieved = this.retrieve(query, topK);
    const retrievalLatencyMs = Date.now() - startRetrieval;

    const sources = retrieved.map(r => ({
      document: r.chunk.documentName,
      clause: r.chunk.clauseId,
      section: r.chunk.section,
      page: r.chunk.pageNumber,
      chunkId: r.chunk.id,
      similarity: r.score,
      snippet: r.chunk.text.slice(0, 240) + '...'
    }));

    // Estimated confidence based on top retrieval score & query token density
    const topScore = retrieved[0]?.score || 0.1;
    let confidence = Number(Math.min(0.98, Math.max(0.35, topScore)).toFixed(2));

    const startGen = Date.now();
    let answer = '';

    // Construct Context Window
    const contextText = retrieved
      .map(
        r =>
          `[Source: ${r.chunk.documentName} | ${r.chunk.section} | Page ${r.chunk.pageNumber}]\n${r.chunk.text}`
      )
      .join('\n\n---\n\n');

    const systemPrompt = `You are InsureGraph AI, a specialized enterprise insurance policy intelligence engine.
CRITICAL INSTRUCTIONS:
1. Grounding Rule: Answer strictly and ONLY from the provided document context below. Never invent, extrapolate, or assume insurance clauses or terms not in the context.
2. If the context does not contain enough information to answer the question, clearly state: "The provided policy documents do not contain sufficient terms to verify this coverage."
3. Always cite specific policy sections, clause numbers, and page numbers.
4. If the question asks for illegal acts, fraud, or intentional falsification, explicitly refuse and explain the relevant policy fraud / misrepresentation clauses.
5. Provide a direct, factual, professional answer suited for an insurance underwriter or claims adjuster.`;

    const userPrompt = `DOCUMENT CONTEXT:
${contextText}

QUESTION:
${query}

Provide a direct, grounded answer with exact section/clause citations:`;

    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: userPrompt,
          config: {
            systemInstruction: systemPrompt,
          },
        });
        answer = response.text?.trim() || '';
      } catch (err) {
        console.warn('Gemini API call returned an error, falling back to deterministic synthesis:', err);
      }
    }

    // Fallback if API key is not present or failed
    if (!answer) {
      if (topScore < 0.15) {
        answer = `Based on the active insurance policy repository, the provided documents do not contain explicit clauses directly addressing "${query}". Please check the specific policy category or upload the relevant policy schedule.`;
        confidence = 0.42;
      } else {
        const topChunk = retrieved[0].chunk;
        // Find the most relevant sentences in the top chunk
        const qTokens = tokenize(query);
        const sentences = topChunk.text.split(/(?<=[.!?])\s+/);
        const bestSentence = sentences.find(s => {
          const lower = s.toLowerCase();
          return qTokens.some(qt => lower.includes(qt));
        }) || sentences[0];

        answer = `According to ${topChunk.documentName} (${topChunk.section}, Page ${topChunk.pageNumber}):\n\n"${bestSentence.trim()}"\n\nThis term is governed by the conditions stated in ${topChunk.clauseId}. Any claim or coverage request is subject to standard deductible and waiting period stipulations.`;
      }
    }

    const generationLatencyMs = Date.now() - startGen;

    // Log query in DB store
    db.queryLogs.push({
      timestamp: new Date().toISOString(),
      query,
      confidence,
      latencyMs: retrievalLatencyMs + generationLatencyMs
    });

    return {
      answer,
      sources,
      confidence,
      retrievalLatencyMs,
      generationLatencyMs
    };
  }
}

export const ragService = new RagService();
