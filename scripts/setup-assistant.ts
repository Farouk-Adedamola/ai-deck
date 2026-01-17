import { retellClient } from '../src/services/retell/retellClient';
import { faqService } from '../src/services/nkiru/faqService';
import { config } from '../src/config';
import { logger } from '../src/utils/logger';

async function setupAssistant() {
  const assistantId = config.retell.assistantId;

  // Sync FAQs to RAG before setting up assistant
  logger.info('Syncing FAQs to RAG index...');
  try {
    await faqService.syncFAQs();
    logger.info('FAQ Sync complete');
  } catch (error) {
    logger.error('Initial FAQ sync failed, continuing...', { error });
  }

  const baseConfig = {
    agent_name: 'NKIRU RAG Based Voice Assistant',
    language: 'en-US',
    system_prompt: `
      ## ROLE
      You are NKIRU, a highly professional and empathetic AI Voice Assistant for customer support. Your goal is to resolve inquiries accurately using the provided tools and provide a seamless experience for Nigerian customers.

      ## PERSONALITY & TONE
      - **Professional yet Warm**: Sound like a helpful corporate assistant who understands the local context.
      - **Nigerian Nuance**: Use subtle Nigerian English markers (e.g., "Alright," "I understand you," "Please hold on while I check that") to sound natural, but avoid heavy slang unless the customer uses it first.
      - **Concise**: Keep responses short and optimized for voice. Avoid long lists.

      ## OPERATIONAL GUIDELINES
      1. **Knowledge Search**: For ANY factual question about services, pricing, or policies, you MUST use the 'search_knowledge_base' tool. Do NOT answer from your general knowledge.
         - If the search returns an answer, summarize it clearly for the customer.
         - If the search returns "No information found," apologize and offer to create a support ticket.

      2. **Human Handoff (Ticket Creation)**: You cannot transfer to a live person directly, but you can create a high-priority support ticket. Use the 'create_support_ticket' tool if:
         - The customer specifically asks to "speak to a human" or "talk to an agent."
         - You cannot find the answer in the knowledge base after searching.
         - The customer is expressing high frustration.

      3. **Clarification**: If a customer's request is vague, ask one clarifying question before taking action.

      ## CONSTRAINTS
      - NEVER make up information not found in the tools.
      - NEVER mention that you are a "Language Model" or "AI" unless explicitly asked.
      - If a customer provides a phone number, repeat it back to ensure accuracy.

      ## FLOW EXAMPLE
      Customer: "How much is your premium plan?"
      NKIRU: "Let me check that for you. [Calls search_knowledge_base] The premium plan is 5,000 Naira per month. Would you like to know more about the features?"
    `,
  };

  const toolDefinitions = [
    {
      type: 'function',
      name: 'search_knowledge_base',
      url: `${config.webhook.url.replace('/webhooks/retell', '/api/v1/nkiru/tools/search-knowledge-base')}`,
      description:
        'Searches the NKIRU FAQ knowledge base for answers to customer questions about products, services, pricing, and policies.',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'The customer query or question to search for.',
          },
        },
        required: ['query'],
      },
    },
    {
      type: 'function',
      name: 'create_support_ticket',
      url: `${config.webhook.url.replace('/webhooks/retell', '/api/v1/nkiru/tools/create-support-ticket')}`,
      description:
        'Creates a support ticket in the NKIRU platform for human follow-up when the AI cannot answer a question or when the customer requests a human.',
      parameters: {
        type: 'object',
        properties: {
          customer_name: {
            type: 'string',
            description: 'Full name of the customer.',
          },
          email: {
            type: 'string',
            description: 'Email address of the customer.',
          },
          subject: {
            type: 'string',
            description: 'Short summary of the issue.',
          },
          description: {
            type: 'string',
            description: 'Detailed description of the problem or the call transcript.',
          },
          priority: {
            type: 'string',
            enum: ['low', 'medium', 'high', 'urgent'],
            description: 'Priority of the ticket.',
          },
        },
        required: ['customer_name', 'subject', 'description'],
      },
    },
  ];

  try {
    if (assistantId) {
      logger.info(`Updating existing assistant: ${assistantId}`);
      await retellClient.updateAssistant(assistantId, {
        ...baseConfig,
        functions: toolDefinitions,
      });
      logger.info('Assistant updated successfully with tools');
    } else {
      logger.info('Creating new assistant...');
      const createConfig = {
        ...baseConfig,
        response_engine: {
          type: 'retell-llm',
          llm_id: 'llm_your_id_here', // UPDATE THIS IN YOUR DASHBOARD OR HERE
        },
        functions: toolDefinitions,
      };
      const newAssistant = await retellClient.createAssistant(createConfig);
      logger.info('Assistant created successfully with tools', { agent_id: newAssistant.agent_id });
      console.log(
        `\nIMPORTANT: Update your .env file with RETELL_ASSISTANT_ID=${newAssistant.agent_id}\n`
      );
    }
  } catch (error) {
    logger.error('Failed to setup assistant', { error });
    process.exit(1);
  }
}

// Run the setup
setupAssistant();
