import { Pinecone } from '@pinecone-database/pinecone';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

async function testPineconeConnection() {
  console.log('\n🔍 Testing Pinecone & OpenAI Configuration...\n');

  // Check environment variables
  console.log('Environment Variables:');
  console.log('✓ PINECONE_API_KEY:', process.env.PINECONE_API_KEY ? '✓ Set' : '✗ Missing');
  console.log('✓ PINECONE_INDEX_NAME:', process.env.PINECONE_INDEX_NAME || 'nkiru-faqs (default)');
  console.log('✓ OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? '✓ Set' : '✗ Missing');
  console.log('✓ OPENAI_MODEL:', process.env.OPENAI_MODEL || 'text-embedding-3-small (default)');
  console.log('  (Note: Pinecone v6+ uses serverless - no environment parameter needed)');
  console.log('');

  // Test OpenAI
  try {
    console.log('🤖 Testing OpenAI Connection...');
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const response = await openai.embeddings.create({
      model: process.env.OPENAI_MODEL || 'text-embedding-3-small',
      input: 'test',
      dimensions: 1024,
    });

    console.log('✅ OpenAI: Connected successfully');
    console.log(`   Generated embedding with ${response.data[0].embedding.length} dimensions`);
  } catch (error: any) {
    console.error('❌ OpenAI: Connection failed');
    console.error('   Error:', error.message);
    if (error.code) console.error('   Code:', error.code);
    if (error.status) console.error('   Status:', error.status);
  }

  console.log('');

  // Test Pinecone
  try {
    console.log('📍 Testing Pinecone Connection...');
    // Pinecone v6+ - no environment parameter needed (serverless)
    const pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY || '',
    });

    console.log('   Fetching index list...');
    const indexList = await pinecone.listIndexes();
    const indexes = indexList.indexes || [];
    console.log('✅ Pinecone: Connected successfully');
    console.log(`   Available indexes:`, indexes.map((i: any) => i.name).join(', ') || 'None');

    const indexName = process.env.PINECONE_INDEX_NAME || 'nkiru-faqs';
    const indexExists = indexes.some((i: any) => i.name === indexName);

    if (indexExists) {
      console.log(`✅ Index "${indexName}" exists`);

      // Try to get index stats
      const index = pinecone.index(indexName);
      const stats = await index.describeIndexStats();
      console.log(`   Index stats:`, {
        dimensions: stats.dimension,
        totalVectors: stats.totalRecordCount,
        namespaces: Object.keys(stats.namespaces || {}),
      });
    } else {
      console.log(`❌ Index "${indexName}" does NOT exist`);
      console.log(`   Available indexes: ${indexes.map((i: any) => i.name).join(', ') || 'None'}`);
      console.log(`\n   You need to create the index first:`);
      console.log(`   1. Go to https://app.pinecone.io/`);
      console.log(`   2. Create a serverless index with name: "${indexName}"`);
      console.log(`   3. Set dimensions to: 1024`);
      console.log(`   4. Choose metric: cosine`);
      console.log(`   5. Choose cloud provider and region (e.g., AWS us-east-1)`);
    }
  } catch (error: any) {
    console.error('❌ Pinecone: Connection failed');
    console.error('   Error:', error.message);
    console.error('   Name:', error.name);
    if (error.cause) {
      console.error('   Cause:', error.cause);
    }
    if (error.code) console.error('   Code:', error.code);
    if (error.status) console.error('   Status:', error.status);

    // Additional debugging
    console.error('\n   Possible causes:');
    console.error('   1. Invalid API key');
    console.error("   2. API key doesn't have proper permissions");
    console.error('   3. Network/firewall issues');
    console.error('   4. Wrong Pinecone environment');
  }

  console.log('\n');
}

testPineconeConnection().catch(console.error);
