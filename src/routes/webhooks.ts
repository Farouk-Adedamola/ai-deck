import { Router } from 'express';
import { asyncHandler } from '../utils/errors';
import { prisma } from '../config/database';
import { logger } from '../utils/logger';
import { config } from '../config';
import crypto from 'crypto';

const router: Router = Router();

/**
 * Verify Retell AI Webhook Signature
 */
const verifySignature = (payload: string, signature: string, secret: string): boolean => {
  const expectedSignature = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  return expectedSignature === signature;
};

// Retell AI webhook endpoint
router.post(
  '/retell',
  asyncHandler(async (req, res) => {
    const signature = req.headers['x-retell-signature'] as string;
    const webhookSecret = config.webhook.secret;

    // Signature verification (if secret is configured)
    if (webhookSecret && signature) {
      const payload = JSON.stringify(req.body);
      const isValid = verifySignature(payload, signature, webhookSecret);

      if (!isValid) {
        logger.warn('Invalid webhook signature received');
        return res.status(401).json({ error: 'Invalid signature' });
      }
    }

    const { event, call_id, call } = req.body;
    logger.info(`Received Retell webhook event: ${event}`, { call_id });

    // Ensure we have a call_id to work with
    if (!call_id) {
      return res.status(400).json({ error: 'Missing call_id' });
    }

    try {
      // 1. Handle specific events
      switch (event) {
        case 'call_started':
          await prisma.call.upsert({
            where: { retellCallId: call_id },
            update: {
              status: 'ongoing',
              startedAt: call?.start_timestamp ? new Date(call.start_timestamp) : new Date(),
              assistantId: call?.agent_id || call?.assistant_id,
              phoneNumber: call?.user_phone_number || call?.from_number || call?.to_number,
              direction: call?.direction || 'inbound',
            },
            create: {
              retellCallId: call_id,
              status: 'ongoing',
              startedAt: call?.start_timestamp ? new Date(call.start_timestamp) : new Date(),
              assistantId: call?.agent_id || call?.assistant_id,
              phoneNumber: call?.user_phone_number || call?.from_number || call?.to_number,
              direction: call?.direction || 'inbound',
            },
          });
          break;

        case 'call_ended':
          await prisma.call.update({
            where: { retellCallId: call_id },
            data: {
              status: 'completed',
              endedAt: call?.end_timestamp ? new Date(call.end_timestamp) : new Date(),
              duration: call?.duration_ms ? Math.floor(call.duration_ms / 1000) : undefined,
              recordingUrl: call?.recording_url,
              transcript: call?.transcript,
              summary: call?.call_summary,
            },
          });
          break;

        case 'call_analyzed':
          await prisma.call.update({
            where: { retellCallId: call_id },
            data: {
              summary: call?.call_summary || call?.analysis?.summary,
              transcript: call?.transcript,
            },
          });
          break;

        default:
          logger.debug(`Unhandled Retell event type: ${event}`);
      }

      // 2. Always log the event to CallEvent table
      const dbCall = await prisma.call.findUnique({ where: { retellCallId: call_id } });
      if (dbCall) {
        await prisma.callEvent.create({
          data: {
            callId: dbCall.id,
            eventType: event,
            eventData: req.body,
          },
        });
      }
    } catch (error) {
      logger.error('Error processing Retell webhook', { error, event, call_id });
      // We still return 200 to Retell to avoid retries if it's a processing error
    }

    // Acknowledge webhook immediately
    res.status(200).json({ received: true });
    return;
  })
);

export default router;
