import express, { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { query } from '../config/database';
import { verifyWebhookSignature, handleWebhookEvent } from '../services/revenuecat';

const router = Router();

// ─── POST /webhook/revenuecat ───
// No auth required - webhook signature verification instead
router.post('/webhook/revenuecat', express.raw({ type: 'application/json' }), async (req: Request, res: Response): Promise<void> => {
  try {
    const rawBody = typeof req.body === 'string' ? req.body : Buffer.isBuffer(req.body) ? req.body.toString('utf8') : JSON.stringify(req.body);
    const signature = req.headers['x-revenuecat-signature'] as string | undefined;

    const isValid = verifyWebhookSignature(rawBody, signature);
    if (!isValid) {
      console.warn('RevenueCat webhook: invalid signature');
      res.status(401).json({ error: 'Invalid webhook signature' });
      return;
    }

    const parsedBody = Buffer.isBuffer(req.body) ? JSON.parse(req.body.toString('utf8')) : req.body;
    await handleWebhookEvent(parsedBody);

    res.status(200).json({ received: true });
  } catch (err) {
    console.error('RevenueCat webhook error:', err);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// ─── GET /api/subscription/status ───
router.get('/api/subscription/status', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;

    const result = await query(
      'SELECT plan_type, revenuecat_id, updated_at FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const user = result.rows[0]!;

    const usageResult = await query(
      `SELECT feature, count FROM daily_usage
       WHERE user_id = $1 AND usage_date = CURRENT_DATE`,
      [userId]
    );

    const dailyUsage: Record<string, number> = {};
    for (const row of usageResult.rows) {
      const r = row as { feature: string; count: number };
      dailyUsage[r.feature] = r.count;
    }

    res.json({
      planType: user.plan_type,
      revenuecatId: user.revenuecat_id,
      updatedAt: user.updated_at,
      dailyUsage,
    });
  } catch (err) {
    console.error('Subscription status error:', err);
    res.status(500).json({ error: 'Failed to get subscription status' });
  }
});

export default router;
