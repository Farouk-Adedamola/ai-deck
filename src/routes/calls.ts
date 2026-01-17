import { Router } from 'express';
import { asyncHandler } from '../utils/errors';
import { prisma } from '../config/database';
import { retellClient } from '../services/retell/retellClient';
import { logger } from '../utils/logger';
import { config } from '../config';

const router: Router = Router();

// Initiate outbound call
router.post(
  '/outbound',
  asyncHandler(async (req, res) => {
    const { phoneNumber, customerName, customerEmail, assistantId } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({ error: 'Missing phoneNumber' });
    }

    // Use assistantId from request or default from config
    const finalAssistantId = assistantId || config.retell.assistantId;

    if (!finalAssistantId) {
      return res.status(400).json({ error: 'No assistant ID configured or provided' });
    }

    try {
      // 1. Create call in Retell AI
      // Note: adjust parameters based on your Retell phone number setup
      const retellCall = await retellClient.createCall({
        from_number: '', // Usually handled by Retell if not provided, or specify your Retell number
        to_number: phoneNumber,
        assistant_id: finalAssistantId,
      });

      // 2. Create record in our database
      const call = await prisma.call.create({
        data: {
          retellCallId: retellCall.call_id,
          direction: 'outbound',
          phoneNumber,
          customerName,
          customerEmail,
          assistantId: finalAssistantId,
          status: 'initiated',
        },
      });

      res.status(201).json(call);
      return;
    } catch (error) {
      logger.error('Failed to initiate outbound call', { error, phoneNumber });
      res.status(500).json({ error: 'Failed to initiate outbound call' });
      return;
    }
  })
);

// List calls
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { limit = '20', offset = '0', status, direction } = req.query;

    const calls = await prisma.call.findMany({
      where: {
        status: status as string,
        direction: direction as string,
      },
      take: parseInt(limit as string, 10),
      skip: parseInt(offset as string, 10),
      orderBy: { createdAt: 'desc' },
    });

    res.json(calls);
    return;
  })
);

// Get call details
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const call = await prisma.call.findUnique({
      where: { id: req.params.id },
      include: { events: true },
    });

    if (!call) {
      // Try by retellCallId as fallback
      const callByRetellId = await prisma.call.findUnique({
        where: { retellCallId: req.params.id },
        include: { events: true },
      });

      if (!callByRetellId) {
        res.status(404).json({ error: 'Call not found' });
        return;
      }
      res.json(callByRetellId);
      return;
    }

    res.json(call);
    return;
  })
);

// Get transcript
router.get(
  '/:id/transcript',
  asyncHandler(async (req, res) => {
    const call = await prisma.call.findUnique({
      where: { id: req.params.id },
      select: { transcript: true, retellCallId: true },
    });

    if (!call) {
      res.status(404).json({ error: 'Call not found' });
      return;
    }

    res.json({
      id: req.params.id,
      retellCallId: call.retellCallId,
      transcript: call.transcript,
    });
    return;
  })
);

// Get artifacts (recording, transcript, summary)
router.get(
  '/:id/artifacts',
  asyncHandler(async (req, res) => {
    const call = await prisma.call.findUnique({
      where: { id: req.params.id },
      select: {
        recordingUrl: true,
        transcript: true,
        summary: true,
        retellCallId: true,
      },
    });

    if (!call) {
      res.status(404).json({ error: 'Call not found' });
      return;
    }

    res.json({
      id: req.params.id,
      retellCallId: call.retellCallId,
      recordingUrl: call.recordingUrl,
      transcript: call.transcript,
      summary: call.summary,
    });
    return;
  })
);

export default router;
