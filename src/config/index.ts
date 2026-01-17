import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // Server
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',

  // Retell AI
  retell: {
    apiKey: process.env.RETELL_API_KEY || '',
    assistantId: process.env.RETELL_ASSISTANT_ID || '',
  },

  // NKIRU API
  nkiru: {
    baseUrl: process.env.NKIRU_API_BASE_URL || 'https://stage-api.withnkiru.com',
    apiKey: process.env.NKIRU_API_KEY || '',
  },

  // Database
  database: {
    url: process.env.DATABASE_URL || '',
  },

  // Pinecone (RAG) - v6+ supports serverless, no environment needed
  pinecone: {
    apiKey: process.env.PINECONE_API_KEY || '',
    indexName: process.env.PINECONE_INDEX_NAME || 'nkiru-faqs',
  },

  // OpenAI (Embeddings)
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
    model: process.env.OPENAI_MODEL || 'text-embedding-3-small',
  },

  // Webhook
  webhook: {
    secret: process.env.WEBHOOK_SECRET || '',
    url: process.env.WEBHOOK_URL || '',
  },

  // FAQ Sync
  faqSync: {
    enabled: process.env.FAQ_SYNC_ENABLED === 'true',
    intervalHours: parseInt(process.env.FAQ_SYNC_INTERVAL_HOURS || '24', 10),
  },

  // Logging
  logLevel: process.env.LOG_LEVEL || 'info',
};

// Validate required configuration
const requiredConfig = [
  { key: 'RETELL_API_KEY', value: config.retell.apiKey },
  { key: 'NKIRU_API_KEY', value: config.nkiru.apiKey },
  { key: 'DATABASE_URL', value: config.database.url },
];

if (config.nodeEnv === 'production') {
  requiredConfig.forEach(({ key, value }) => {
    if (!value) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
  });
}
