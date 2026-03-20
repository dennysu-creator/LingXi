// ═══════════════════════════════════════
// AI Usage Limits & Tracking
// ═══════════════════════════════════════

import { query } from '../config/database';

// ═══════════════════════════════════════
// Model Constants
// ═══════════════════════════════════════

const MODEL_HAIKU = 'claude-haiku-4-5-20251001';
const MODEL_SONNET = 'claude-sonnet-4-20250514';
const MODEL_OPUS = 'claude-opus-4-20250514';

// ═══════════════════════════════════════
// Daily Usage Limits
// ═══════════════════════════════════════

// TODO: 上線前恢復正式限制 — free: 1/day, member: 5/day, pet-message: free=3/member=20
// 正式值備份: free={face-reading:1, feng-shui:1, fortune:1, outfit:1, divination:1, pet-message:3}
//            member={face-reading:5, feng-shui:5, fortune:5, outfit:5, divination:5, pet-message:20}
export const USAGE_LIMITS: Record<string, Record<string, number>> = {
  free: {
    'face-reading': -1,
    'feng-shui': -1,
    fortune: -1,
    outfit: -1,
    divination: -1,
    'pet-message': -1,
  },
  member: {
    'face-reading': -1,
    'feng-shui': -1,
    fortune: -1,
    outfit: -1,
    divination: -1,
    'pet-message': -1,
  },
  supreme: {
    'face-reading': -1,
    'feng-shui': -1,
    fortune: -1,
    outfit: -1,
    divination: -1,
    'pet-message': -1,
  },
};

export async function checkUsageAllowed(
  userId: string,
  planType: string,
  feature: string
): Promise<{ allowed: boolean; remaining: number }> {
  const limits = USAGE_LIMITS[planType] || USAGE_LIMITS['free']!;
  const limit = limits[feature] ?? 1;

  if (limit === -1) {
    return { allowed: true, remaining: -1 };
  }

  const result = await query(
    `SELECT count FROM daily_usage
     WHERE user_id = $1 AND usage_date = CURRENT_DATE AND feature = $2`,
    [userId, feature]
  );

  const currentCount = result.rows.length > 0 ? (result.rows[0] as { count: number }).count : 0;

  if (currentCount >= limit) {
    return { allowed: false, remaining: 0 };
  }

  return { allowed: true, remaining: limit - currentCount };
}

export async function incrementUsage(
  userId: string,
  feature: string
): Promise<void> {
  await query(
    `INSERT INTO daily_usage (user_id, usage_date, feature, count)
     VALUES ($1, CURRENT_DATE, $2, 1)
     ON CONFLICT (user_id, usage_date, feature)
     DO UPDATE SET count = daily_usage.count + 1`,
    [userId, feature]
  );
}

export function selectModel(planType: string): string {
  if (planType === 'supreme') return MODEL_OPUS;
  if (planType === 'member') return MODEL_SONNET;
  return MODEL_HAIKU;
}

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
