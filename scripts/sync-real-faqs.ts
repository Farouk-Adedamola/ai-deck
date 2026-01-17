import { faqService } from '../src/services/nkiru/faqService';
import { logger } from '../src/utils/logger';
import { config } from '../src/config';

/**
 * Real FAQ Sync Script
 * This fetches FAQs from NKIRU's API and syncs to:
 * 1. PostgreSQL (for caching)
 * 2. Pinecone (for RAG search)
 */

async function syncRealFAQs() {
    logger.info('='.repeat(60));
    logger.info('Starting Real FAQ Sync from NKIRU API');
    logger.info('='.repeat(60));
    logger.info('');

    // Validate configuration
    if (!config.nkiru.apiKey) {
        logger.error('❌ NKIRU_API_KEY is not set in .env file');
        logger.info('Please add: NKIRU_API_KEY=your_api_key_here');
        process.exit(1);
    }

    if (!config.nkiru.baseUrl) {
        logger.error('❌ NKIRU_API_BASE_URL is not set in .env file');
        logger.info('Please add: NKIRU_API_BASE_URL=https://stage-api.withnkiru.com');
        process.exit(1);
    }

    logger.info(`📡 NKIRU API Base URL: ${config.nkiru.baseUrl}`);
    logger.info(`🔑 API Key: ${config.nkiru.apiKey.substring(0, 10)}...`);
    logger.info('');

    try {
        // Fetch and sync FAQs
        logger.info('📥 Fetching FAQs from NKIRU API...');
        await faqService.syncFAQs();

        logger.info('');
        logger.info('='.repeat(60));
        logger.info('✅ FAQ Sync Complete!');
        logger.info('='.repeat(60));
        logger.info('');
        logger.info('Your AI assistant can now answer questions from NKIRU FAQs');
        logger.info('');
        logger.info('Next steps:');
        logger.info('1. Start your server: pnpm dev');
        logger.info('2. Test search: curl -X POST http://localhost:7720/api/v1/nkiru/tools/search-knowledge-base \\');
        logger.info('   -H "Content-Type: application/json" \\');
        logger.info('   -d \'{"query": "your question here"}\'');
        logger.info('');

        process.exit(0);
    } catch (error: any) {
        logger.error('');
        logger.error('='.repeat(60));
        logger.error('❌ FAQ Sync Failed');
        logger.error('='.repeat(60));
        logger.error('');

        if (error.response) {
            // API error response
            logger.error(`HTTP Status: ${error.response.status}`);
            logger.error(`Response: ${JSON.stringify(error.response.data, null, 2)}`);
            logger.error('');

            if (error.response.status === 401) {
                logger.error('🔒 Authentication failed. Please check:');
                logger.error('   - Your NKIRU_API_KEY is correct');
                logger.error('   - Your API key has not expired');
                logger.error('   - You have access to the NKIRU FAQ API');
            } else if (error.response.status === 404) {
                logger.error('🔍 FAQ endpoint not found. Please check:');
                logger.error('   - NKIRU_API_BASE_URL is correct');
                logger.error('   - The /faq endpoint exists in NKIRU API');
                logger.error('   - You have the correct API version');
            } else if (error.response.status === 403) {
                logger.error('🚫 Access forbidden. Please check:');
                logger.error('   - Your API key has permission to access FAQs');
                logger.error('   - Your account is active');
            }
        } else if (error.request) {
            // Network error
            logger.error('🌐 Network error. Could not reach NKIRU API.');
            logger.error('Please check:');
            logger.error('   - Your internet connection');
            logger.error('   - NKIRU API is not blocked by firewall');
            logger.error(`   - Base URL is correct: ${config.nkiru.baseUrl}`);
        } else {
            // Other error
            logger.error('Error:', error.message);
        }

        logger.error('');
        logger.error('For help, check:');
        logger.error('   - docs/NKIRU_FAQ_SYNC.md');
        logger.error('   - NKIRU API documentation');
        logger.error('');

        process.exit(1);
    }
}

// Run the sync
syncRealFAQs();
