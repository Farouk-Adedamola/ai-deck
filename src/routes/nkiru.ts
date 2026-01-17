import { Router } from 'express';
import { asyncHandler } from '../utils/errors';
import { faqService } from '../services/nkiru/faqService';
import { ticketService } from '../services/nkiru/ticketService';
import { ragService } from '../services/rag/ragService';
import { logger } from '../utils/logger';

const router: Router = Router();

// FAQ sync endpoint
router.post(
  '/faqs/sync',
  asyncHandler(async (_req, res) => {
    await faqService.syncFAQs();
    res.json({ message: 'FAQs synced successfully' });
    return;
  })
);

// Get cached FAQs
router.get(
  '/faqs',
  asyncHandler(async (req, res) => {
    const { clientId } = req.query;
    const faqs = await faqService.getCachedFAQs(clientId as string);
    res.json(faqs);
    return;
  })
);

// Get ticket details
router.get(
  '/tickets/:ticketId',
  asyncHandler(async (req, res) => {
    const ticket = await ticketService.getTicket(req.params.ticketId);
    res.json(ticket);
    return;
  })
);

/**
 * Retell Function Call: search_knowledge_base
 * This is the endpoint Retell AI will hit when it needs to search the knowledge base
 */
router.post(
  '/tools/search-knowledge-base',
  asyncHandler(async (req, res) => {
    const { query, clientId } = req.body;
    logger.info('Tool Call: search_knowledge_base', { query, clientId });

    if (!query) {
      res.status(400).json({ error: 'Missing query' });
      return;
    }

    try {
      const results = await ragService.searchKnowledgeBase(query, clientId);

      if (results.length === 0) {
        res.json({ result: 'No information found in the knowledge base for this query.' });
        return;
      }

      // Format results for the AI
      const context = results
        .map((r, i) => `Result ${i + 1}:\nQuestion: ${r.question}\nAnswer: ${r.answer}`)
        .join('\n\n');

      res.json({ result: context });
    } catch (error) {
      logger.error('Error in search_knowledge_base tool', { error, query });
      res.status(500).json({ error: 'Failed to search knowledge base' });
    }
    return;
  })
);

/**
 * Retell Function Call: create_support_ticket
 * This is the endpoint Retell AI will hit when it needs to create a ticket
 */
router.post(
  '/tools/create-support-ticket',
  asyncHandler(async (req, res) => {
    const { customer_name, email, subject, description, phoneNumber } = req.body;
    logger.info('Tool Call: create_support_ticket', {
      customer_name,
      email,
      subject,
      hasDescription: !!description,
      phoneNumber,
      fullBody: req.body,
    });

    // Validate required fields
    const missingFields: string[] = [];
    if (!customer_name || customer_name.trim() === '') missingFields.push('customer_name');
    if (!email || email.trim() === '') missingFields.push('email');
    if (!phoneNumber || phoneNumber.trim() === '') missingFields.push('phoneNumber');
    if (!subject || subject.trim() === '') missingFields.push('subject');
    if (!description || description.trim() === '') missingFields.push('description');

    if (missingFields.length > 0) {
      const errorMsg = `Missing required fields: ${missingFields.join(', ')}. Please collect all customer information before creating a ticket.`;
      logger.warn('create_support_ticket called with missing fields', {
        missingFields,
        receivedData: req.body,
      });

      res.json({
        result: errorMsg,
        error: 'Missing required customer information',
        required_fields: ['customer_name', 'email', 'phoneNumber', 'subject', 'description'],
      });
      return;
    }

    try {
      const ticket = await ticketService.createTicket({
        customerName: customer_name,
        email: email,
        phoneNumber: phoneNumber,
        subject: subject,
        description: description,
        category: 'voice_call_automation',
      });

      logger.info('Successfully created ticket', {
        ticketId: ticket.ticketId,
        customerName: customer_name,
      });

      res.json({
        result: `Successfully created support ticket ${ticket.ticketId}. Inform the customer that their ticket ID is ${ticket.ticketId} and a member of our team will reach out to them shortly.`,
        ticketId: ticket.ticketId,
      });
    } catch (error) {
      logger.error('Error in create_support_ticket tool', { error, requestBody: req.body });
      res.status(500).json({
        error: 'Failed to create support ticket',
        result: 'I apologize, but I encountered an error creating your support ticket. Please try again or contact our support team directly.',
      });
    }
    return;
  })
);

export default router;
