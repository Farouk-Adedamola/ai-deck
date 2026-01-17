// Prisma Client will be available after running `pnpm install` (which runs `prisma generate` via postinstall)
// If you see an error, run: pnpm prisma generate
import { PrismaClient } from '@prisma/client';
import { config } from './index';
import { logger } from '../utils/logger';

// Initialize Prisma Client
const prisma = new PrismaClient({
  log: config.nodeEnv === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

export { prisma };

/**
 * Initialize database connection
 */
export async function initializeDatabase(): Promise<void> {
  try {
    // Test connection
    await prisma.$connect();
    await prisma.$queryRaw`SELECT 1`;
    logger.info('Database connection established');

    // Note: With Prisma, table creation is handled via migrations
    // Run `pnpm prisma migrate dev` to create tables
    // Or use `pnpm db:push` to sync schema without migrations
  } catch (error) {
    logger.error('Failed to initialize database', { error });
    throw error;
  }
}

/**
 * Legacy compatibility function - wraps Prisma queries
 * @deprecated Use prisma client directly instead
 */
export async function query(text: string, params?: unknown[]): Promise<unknown> {
  // For raw SQL queries, use Prisma's $queryRawUnsafe
  // Note: $queryRawUnsafe takes SQL string first, then parameters as spread
  if (params && params.length > 0) {
    return prisma.$queryRawUnsafe(text, ...(params as []));
  }
  return prisma.$queryRawUnsafe(text);
}

/**
 * Legacy compatibility function - returns Prisma client transaction
 * @deprecated Use prisma.$transaction() directly instead
 */
export async function getClient(): Promise<PrismaClient> {
  return prisma;
}

// Export Prisma models for type safety
// Note: These types will be available after running `pnpm prisma generate` or `pnpm install`
export type { Call, CallEvent, NKIRUFaq, ServiceConfig } from '@prisma/client';
