import { nkiruClient } from './nkiruClient';
import { logger } from '../../utils/logger';
import { query } from '../../config/database';

export interface NKIRUFAQ {
  _id: string;
  clientId: string;
  question: string;
  answer: string;
  createdAt: string;
  updatedAt: string;
}

export class FAQService {
  /**
   * Fetch FAQs from NKIRU API
   */
  async fetchFAQs(): Promise<NKIRUFAQ[]> {
    try {
      const faqs = await nkiruClient.get<NKIRUFAQ[]>('/faq');
      logger.info('Fetched FAQs from NKIRU', { count: faqs.length });
      return faqs;
    } catch (error) {
      logger.error('Failed to fetch FAQs from NKIRU', { error });
      throw error;
    }
  }

  /**
   * Sync FAQs from NKIRU and store in database
   */
  async syncFAQs(): Promise<void> {
    try {
      const faqs = await this.fetchFAQs();
      const { ragService } = require('../rag/ragService');
      const { prisma } = require('../../config/database');

      for (const faq of faqs) {
        // 1. Update PostgreSQL using Prisma Client
        await prisma.nKIRUFaq.upsert({
          where: { nkiruFaqId: faq._id },
          update: {
            question: faq.question,
            answer: faq.answer,
            lastSyncedAt: new Date(),
          },
          create: {
            nkiruFaqId: faq._id,
            clientId: faq.clientId,
            question: faq.question,
            answer: faq.answer,
            lastSyncedAt: new Date(),
          },
        });

        // 2. Update Pinecone (RAG)
        await ragService.ingestFAQ(faq._id, faq.clientId, faq.question, faq.answer);
      }

      logger.info('Synced FAQs to database and RAG', { count: faqs.length });
    } catch (error) {
      logger.error('Failed to sync FAQs', { error });
      throw error;
    }
  }

  /**
   * Get cached FAQs from database
   */
  async getCachedFAQs(clientId?: string): Promise<NKIRUFAQ[]> {
    try {
      let sql =
        'SELECT nkiru_faq_id as _id, client_id as clientId, question, answer, created_at as createdAt, updated_at as updatedAt FROM nkiru_faqs';
      let params: any[] = [];

      if (clientId) {
        sql += ' WHERE client_id = $1';
        params.push(clientId);
      }

      sql += ' ORDER BY updated_at DESC';

      const result = await query(sql, params);
      return result as NKIRUFAQ[];
    } catch (error) {
      logger.error('Failed to get cached FAQs', { error });
      throw error;
    }
  }
}

export const faqService = new FAQService();
