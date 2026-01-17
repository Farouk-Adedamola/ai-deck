import { ragService } from '../src/services/rag/ragService';

async function testSearch() {
  console.log('\n🔍 Testing RAG Search...\n');

  const queries = [
    'How much does delivery cost?',
    'Delivery pricing',
    'Can proxzes swim',
    'My login is not working',
  ];

  for (const query of queries) {
    console.log(`\n📝 Query: "${query}"`);
    console.log('─'.repeat(50));

    try {
      const results = await ragService.searchKnowledgeBase(
        query,
        '68a30d1f2b9087134a75db48',
        5 // Get top 5 results
      );

      if (results.length === 0) {
        console.log('❌ No results found');
      } else {
        results.forEach((result, index) => {
          console.log(`\n${index + 1}. Score: ${result.score?.toFixed(3)}`);
          console.log(`   Question: ${result.question}`);
          console.log(`   Answer: ${result.answer}`);
        });
      }
    } catch (error: any) {
      console.error(`❌ Error: ${error.message}`);
    }
  }

  console.log('\n');
}

testSearch().catch(console.error);
