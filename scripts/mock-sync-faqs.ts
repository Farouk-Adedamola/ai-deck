import { ragService } from '../src/services/rag/ragService';
import { prisma } from '../src/config/database';
import { logger } from '../src/utils/logger';

const MOCK_FAQS = [
  {
    _id: 'mock_faq_1',
    clientId: '68a30d1f2b9087134a75db48',
    question: 'How much for your Delivery',
    answer:
      'Base cost is $50 per 20kg of goods. For goods above 100pounds kindly reach out to us for a price',
  },
  {
    _id: 'mock_faq_2',
    clientId: '68a30d1f2b9087134a75db48',
    question: 'Can proxzes swim',
    answer: 'Proxzes are marine officiers so yes',
  },
  {
    _id: 'mock_faq_3',
    clientId: '68a30d1f2b9087134a75db48',
    question: 'My credentials is not working',
    answer: 'Kindly restart your system',
  },
];

async function mockSync() {
  logger.info('Starting Mock FAQ Sync...');

  try {
    for (const faq of MOCK_FAQS) {
      // 1. Update PostgreSQL using Prisma Client (Type-safe and handles UUIDs)
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
      logger.info(`Synced FAQ: ${faq.question}`);
    }

    logger.info('Mock FAQ Sync complete. Your AI can now answer these questions!');
  } catch (error) {
    logger.error('Mock Sync failed', { error });
    process.exit(1);
  }
}

mockSync();
