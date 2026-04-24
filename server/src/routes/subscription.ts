import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { query } from '../config/database';
import {
  verifyWebhookAuth,
  handleWebhookEvent,
  syncSubscriberForUser,
} from '../services/revenuecat';
import { PAID_DAILY_FAIR_USE_CAP } from './ai-usage';

const router = Router();

// ─── POST /webhook/revenuecat ───
// Public endpoint, protected by shared-secret Authorization header (or HMAC fallback).
// Uses rawBody captured by the global express.json({ verify }) middleware so
// HMAC signature verification sees the exact bytes RevenueCat signed.
router.post(
  '/webhook/revenuecat',
  async (req: Request, res: Response): Promise<void> => {
    try {
      const rawBody = (req as Request & { rawBody?: string }).rawBody ?? JSON.stringify(req.body);

      if (!verifyWebhookAuth(req, rawBody)) {
        console.warn('RevenueCat webhook: auth failed');
        res.status(401).json({ error: 'Invalid webhook auth' });
        return;
      }

      await handleWebhookEvent(req.body);
      res.status(200).json({ received: true });
    } catch (err) {
      console.error('RevenueCat webhook error:', err);
      res.status(500).json({ error: 'Webhook processing failed' });
    }
  }
);

// ─── GET /api/subscription/status ───
router.get(
  '/api/subscription/status',
  authenticate,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user!.userId;

      const result = await query(
        `SELECT
           subscription_status,
           subscription_product_id,
           subscription_expires_at,
           will_renew,
           revenuecat_app_user_id,
           trial_used_count,
           trial_limit,
           plan_type,
           updated_at
         FROM users WHERE id = $1`,
        [userId]
      );

      if (result.rows.length === 0) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      const user = result.rows[0] as {
        subscription_status: string;
        subscription_product_id: string | null;
        subscription_expires_at: Date | null;
        will_renew: boolean;
        revenuecat_app_user_id: string | null;
        trial_used_count: number;
        trial_limit: number;
        plan_type: string;
        updated_at: Date;
      };

      // Today's fair-use count (paid users only).
      let paidUsedToday = 0;
      if (user.subscription_status === 'active' || user.subscription_status === 'in_grace') {
        const usageResult = await query(
          `SELECT count FROM paid_daily_usage
             WHERE user_id = $1 AND usage_date = CURRENT_DATE`,
          [userId]
        );
        paidUsedToday =
          usageResult.rows.length > 0 ? (usageResult.rows[0] as { count: number }).count : 0;
      }

      res.json({
        subscriptionStatus: user.subscription_status,
        subscriptionProductId: user.subscription_product_id,
        subscriptionExpiresAt: user.subscription_expires_at,
        willRenew: user.will_renew,
        revenuecatAppUserId: user.revenuecat_app_user_id,
        trialUsed: user.trial_used_count,
        trialLimit: user.trial_limit,
        paidUsedToday,
        paidDailyCap: PAID_DAILY_FAIR_USE_CAP,
        planType: user.plan_type, // legacy — for older clients
        updatedAt: user.updated_at,
      });
    } catch (err) {
      console.error('Subscription status error:', err);
      res.status(500).json({ error: 'Failed to get subscription status' });
    }
  }
);

// ─── POST /api/subscription/sync ───
// Called by the client right after a purchase / restore.
// Server-auth'd — client cannot impersonate another user.
// The server derives the RevenueCat app_user_id from the authenticated userId
// (and any prior binding). No client-supplied hint is accepted.
router.post(
  '/api/subscription/sync',
  authenticate,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user!.userId;

      const snapshot = await syncSubscriberForUser(userId);

      res.json({
        subscriptionStatus: snapshot.status,
        subscriptionProductId: snapshot.productId,
        subscriptionExpiresAt: snapshot.expiresAt,
        willRenew: snapshot.willRenew,
      });
    } catch (err) {
      console.error('Subscription sync error:', err);
      const msg = err instanceof Error ? err.message : 'Sync failed';
      res.status(500).json({ error: msg });
    }
  }
);

export default router;
