// ═══════════════════════════════════════════════════════════════
// AI Usage: Trial Counter + Fair-Use + Atomic Idempotent Ledger
// ═══════════════════════════════════════════════════════════════
// Design:
//   reserveAiCall: in a single transaction, insert a ledger row
//     (UNIQUE on user_id, idempotency_key). If the row is new, atomically
//     bump trial_used_count (free) or paid_daily_usage (paid). If the
//     row already exists, treat as duplicate retry:
//       - consumed → return cached response (caller must short-circuit)
//       - reserved/failed → 409 reject (caller should retry with new key)
//     idempotency_key is user-scoped (UNIQUE(user_id, key)) to prevent
//     key-theft attacks.
// ═══════════════════════════════════════════════════════════════

import pool from '../config/database';
import { query } from '../config/database';

// ─── Model ────────────────────────────────────────────────────
const MODEL_HAIKU = 'claude-haiku-4-5-20251001';
// const MODEL_SONNET = 'claude-sonnet-4-20250514'; // kept for easy restoration
// const MODEL_OPUS   = 'claude-opus-4-20250514';

export function selectModel(_planType?: string): string {
  return MODEL_HAIKU;
}

// ─── Fair-use cap for paid (unlimited) users ──────────────────
export const PAID_DAILY_FAIR_USE_CAP = 100;

// ─── Reservation outcome ──────────────────────────────────────
export type ReserveOutcome =
  | { kind: 'new'; trialUsed: number; trialLimit: number; remaining: number; subscriptionStatus: string }
  | { kind: 'replay'; cachedResponse: unknown; trialUsed: number; trialLimit: number; remaining: number; subscriptionStatus: string }
  | { kind: 'in_flight'; trialUsed: number; trialLimit: number; remaining: number; subscriptionStatus: string }
  | { kind: 'blocked'; reason: 'trial_exhausted' | 'paid_cap_reached'; trialUsed: number; trialLimit: number; subscriptionStatus: string };

interface UserRow {
  id: string;
  trial_used_count: number;
  trial_limit: number;
  subscription_status: string;
}

interface LedgerRow {
  status: 'reserved' | 'consumed' | 'failed';
  response_payload: unknown;
}

/**
 * Atomically reserve one AI call. Transaction-safe.
 */
export async function reserveAiCall(
  userId: string,
  feature: string,
  idempotencyKey: string
): Promise<ReserveOutcome> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1) Lock the user row to serialize concurrent reservations.
    const userRes = await client.query(
      `SELECT id, trial_used_count, trial_limit, subscription_status
         FROM users WHERE id = $1 FOR UPDATE`,
      [userId]
    );
    if (userRes.rows.length === 0) {
      await client.query('ROLLBACK');
      throw new Error('User not found');
    }
    const user = userRes.rows[0] as UserRow;
    const isPaid = user.subscription_status === 'active' || user.subscription_status === 'in_grace';

    // 2) Check for prior ledger entry with same (user_id, idempotency_key).
    const prior = await client.query(
      `SELECT status, response_payload FROM trial_consumptions
         WHERE user_id = $1 AND idempotency_key = $2`,
      [userId, idempotencyKey]
    );
    if (prior.rows.length > 0) {
      const row = prior.rows[0] as LedgerRow;
      await client.query('ROLLBACK');
      if (row.status === 'consumed') {
        return {
          kind: 'replay',
          cachedResponse: row.response_payload,
          trialUsed: user.trial_used_count,
          trialLimit: user.trial_limit,
          remaining: isPaid ? -1 : Math.max(0, user.trial_limit - user.trial_used_count),
          subscriptionStatus: user.subscription_status,
        };
      }
      if (row.status === 'reserved') {
        return {
          kind: 'in_flight',
          trialUsed: user.trial_used_count,
          trialLimit: user.trial_limit,
          remaining: isPaid ? -1 : Math.max(0, user.trial_limit - user.trial_used_count),
          subscriptionStatus: user.subscription_status,
        };
      }
      // Failed: let caller retry with a new key. Treat as in_flight so 409 is returned.
      return {
        kind: 'in_flight',
        trialUsed: user.trial_used_count,
        trialLimit: user.trial_limit,
        remaining: isPaid ? -1 : Math.max(0, user.trial_limit - user.trial_used_count),
        subscriptionStatus: user.subscription_status,
      };
    }

    // 3) Enforce limits.
    if (isPaid) {
      // Fair-use cap check: INSERT or UPDATE only if still under cap.
      const dailyRes = await client.query(
        `INSERT INTO paid_daily_usage (user_id, usage_date, count)
           VALUES ($1, CURRENT_DATE, 1)
         ON CONFLICT (user_id, usage_date)
         DO UPDATE SET count = paid_daily_usage.count + 1
           WHERE paid_daily_usage.count < $2
         RETURNING count`,
        [userId, PAID_DAILY_FAIR_USE_CAP]
      );
      if (dailyRes.rows.length === 0) {
        await client.query('ROLLBACK');
        return {
          kind: 'blocked',
          reason: 'paid_cap_reached',
          trialUsed: user.trial_used_count,
          trialLimit: user.trial_limit,
          subscriptionStatus: user.subscription_status,
        };
      }
    } else {
      // Free user: atomic trial increment with guard.
      const bump = await client.query(
        `UPDATE users
           SET trial_used_count = trial_used_count + 1,
               updated_at = NOW()
         WHERE id = $1
           AND subscription_status NOT IN ('active','in_grace')
           AND trial_used_count < trial_limit
         RETURNING trial_used_count`,
        [userId]
      );
      if (bump.rows.length === 0) {
        await client.query('ROLLBACK');
        return {
          kind: 'blocked',
          reason: 'trial_exhausted',
          trialUsed: user.trial_used_count,
          trialLimit: user.trial_limit,
          subscriptionStatus: user.subscription_status,
        };
      }
      user.trial_used_count = (bump.rows[0] as { trial_used_count: number }).trial_used_count;
    }

    // 4) Insert ledger entry (must succeed since UNIQUE and we checked above).
    await client.query(
      `INSERT INTO trial_consumptions (user_id, idempotency_key, feature, status)
         VALUES ($1, $2, $3, 'reserved')`,
      [userId, idempotencyKey, feature]
    );

    await client.query('COMMIT');
    return {
      kind: 'new',
      trialUsed: user.trial_used_count,
      trialLimit: user.trial_limit,
      remaining: isPaid ? -1 : Math.max(0, user.trial_limit - user.trial_used_count),
      subscriptionStatus: user.subscription_status,
    };
  } catch (err) {
    try {
      await client.query('ROLLBACK');
    } catch {
      // ignore
    }
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Mark reservation consumed and cache the response so retries replay it.
 */
export async function commitAiCall(
  userId: string,
  idempotencyKey: string,
  responsePayload: unknown
): Promise<void> {
  await query(
    `UPDATE trial_consumptions
       SET status = 'consumed',
           completed_at = NOW(),
           response_payload = $3
     WHERE user_id = $1
       AND idempotency_key = $2
       AND status = 'reserved'`,
    [userId, idempotencyKey, JSON.stringify(responsePayload)]
  );
}

/**
 * Refund a reserved call that failed upstream (Claude error, etc.).
 * For free users, decrements trial_used_count. For paid users, decrements fair-use.
 * Both operations are inside one transaction.
 */
export async function refundAiCall(userId: string, idempotencyKey: string): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const ledger = await client.query(
      `UPDATE trial_consumptions
         SET status = 'failed',
             completed_at = NOW()
       WHERE user_id = $1
         AND idempotency_key = $2
         AND status = 'reserved'
       RETURNING id`,
      [userId, idempotencyKey]
    );
    if (ledger.rows.length === 0) {
      await client.query('ROLLBACK');
      return;
    }

    // Determine which counter to decrement.
    const userRes = await client.query(
      `SELECT subscription_status FROM users WHERE id = $1`,
      [userId]
    );
    if (userRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return;
    }
    const sub = (userRes.rows[0] as { subscription_status: string }).subscription_status;
    const isPaid = sub === 'active' || sub === 'in_grace';

    if (isPaid) {
      await client.query(
        `UPDATE paid_daily_usage
           SET count = GREATEST(0, count - 1)
         WHERE user_id = $1 AND usage_date = CURRENT_DATE`,
        [userId]
      );
    } else {
      await client.query(
        `UPDATE users
           SET trial_used_count = GREATEST(0, trial_used_count - 1),
               updated_at = NOW()
         WHERE id = $1`,
        [userId]
      );
    }

    await client.query('COMMIT');
  } catch (err) {
    try {
      await client.query('ROLLBACK');
    } catch {
      // ignore
    }
    throw err;
  } finally {
    client.release();
  }
}

// ─── Utility: save chat message (unchanged behavior) ──────────
export async function saveMessage(
  userId: string,
  role: string,
  content: string,
  feature: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  await query(
    `INSERT INTO messages (user_id, role, content, feature, metadata)
       VALUES ($1, $2, $3, $4, $5)`,
    [userId, role, content, feature, JSON.stringify(metadata || {})]
  );
}
