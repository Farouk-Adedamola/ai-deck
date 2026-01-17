import { Pinecone } from '@pinecone-database/pinecone';
import OpenAI from 'openai';
import { config } from '../../config';
import { logger } from '../../utils/logger';

export class RAGService {
  private pinecone: Pinecone;
  private openai: OpenAI;
  private indexName: string;

  constructor() {
    // Pinecone v6+ doesn't require environment parameter (supports serverless)
    this.pinecone = new Pinecone({
      apiKey: config.pinecone.apiKey,
    });
    this.openai = new OpenAI({
      apiKey: config.openai.apiKey,
    });
    this.indexName = config.pinecone.indexName;
  }

  /**
   * Generate embedding for text
   */
  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await this.openai.embeddings.create({
        model: config.openai.model,
        input: text,
        dimensions: 1024, // Match Pinecone index dimensions (1024)
      });
      return response.data[0].embedding;
    } catch (error) {
      logger.error('Failed to generate embedding', { error });
      throw error;
    }
  }

  /**
   * Ingest FAQ into Pinecone
   */
  async ingestFAQ(
    faqId: string,
    clientId: string,
    question: string,
    answer: string
  ): Promise<void> {
    try {
      const embedding = await this.generateEmbedding(`Question: ${question}\nAnswer: ${answer}`);
      const index = this.pinecone.index(this.indexName);

      await index.upsert([
        {
          id: faqId,
          values: embedding,
          metadata: {
            clientId,
            question,
            answer,
            type: 'faq',
          },
        },
      ]);

      logger.info('Ingested FAQ into Pinecone', { faqId, clientId });
    } catch (error) {
      logger.error('Failed to ingest FAQ', { error, faqId });
      throw error;
    }
  }

  /**
   * Search knowledge base
   */
  async searchKnowledgeBase(query: string, clientId?: string, topK: number = 3): Promise<any[]> {
    try {
      const queryEmbedding = await this.generateEmbedding(query);
      const index = this.pinecone.index(this.indexName);

      const filter = clientId ? { clientId: { $eq: clientId } } : undefined;

      const results = await index.query({
        vector: queryEmbedding,
        topK,
        includeMetadata: true,
        filter,
      });

      logger.info('RAG search completed', {
        query,
        clientId,
        resultsCount: results.matches.length,
      });

      return results.matches
        .filter(match => (match.score || 0) > 0.5) // Confidence threshold (0.5 = reasonable similarity)
        .map(match => ({
          id: match.id,
          score: match.score,
          question: match.metadata?.question,
          answer: match.metadata?.answer,
        }));
    } catch (error) {
      logger.error('Failed to search knowledge base', { error, query });
      throw error;
    }
  }
}

export const ragService = new RAGService();
