// ═══════════════════════════════════════════════════════════════
// RevenueCat: Snapshot-based subscription sync
// ═══════════════════════════════════════════════════════════════
// Every webhook triggers a full pull of the subscriber's current
// state from RevenueCat's REST API. DB stores that snapshot verbatim.
// ═══════════════════════════════════════════════════════════════

import crypto from 'crypto';
import { query } from '../config/database';

const RC_ENTITLEMENT_PAID = 'paid';
const RC_API_BASE = 'https://api.revenuecat.com/v1';

interface RevenueCatEvent {
  id?: string;
  type: string;
  app_user_id: string;
  original_app_user_id?: string;
  aliases?: string[];
  transferred_from?: string[];
  transferred_to?: string[];
  entitlement_ids?: string[];
  product_id?: string;
}

interface RevenueCatWebhookBody {
  api_version: string;
  event: RevenueCatEvent;
}

interface RcEntitlement {
  expires_date: string | null;
  grace_period_expires_date?: string | null;
  product_identifier: string;
  unsubscribe_detected_at?: string | null;
  billing_issues_detected_at?: string | null;
}

interface RcSubscriberResponse {
  subscriber: {
    original_app_user_id: string;
    entitlements: Record<string, RcEntitlement>;
    subscriptions: Record<string, {
      expires_date: string | null;
      product_identifier?: string;
      unsubscribe_detected_at?: string | null;
      billing_issues_detected_at?: string | null;
      grace_period_expires_date?: string | null;
      refunded_at?: string | null;
    }>;
    first_seen?: string;
  };
}

// ─── Webhook auth verification ────────────────────────────────
export function verifyWebhookAuth(
  req: { headers: Record<string, string | string[] | undefined> },
  rawBody: string
): boolean {
  const authHeaderSecret = process.env.REVENUECAT_WEBHOOK_AUTHORIZATION;
  const hmacSecret = process.env.REVENUECAT_WEBHOOK_SECRET;

  if (authHeaderSecret) {
    const got = req.headers.authorization;
    const gotStr = typeof got === 'string' ? got : '';
    if (gotStr.length === 0) return false;
    const expected = authHeaderSecret.startsWith('Bearer ')
      ? authHeaderSecret
      : `Bearer ${authHeaderSecret}`;
    const a = Buffer.from(gotStr);
    const b = Buffer.from(expected);
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  }

  if (hmacSecret) {
    const sig = req.headers['x-revenuecat-signature'];
    const sigStr = typeof sig === 'string' ? sig : '';
    if (!sigStr) return false;
    const expected = crypto.createHmac('sha256', hmacSecret).update(rawBody).digest('hex');
    const a = Buffer.from(sigStr);
    const b = Buffer.from(expected);
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  }

  console.error('RevenueCat webhook: neither AUTHORIZATION nor HMAC secret configured');
  return false;
}

// ─── RevenueCat REST: pull current subscriber ─────────────────
async function fetchSubscriber(appUserId: string): Promise<RcSubscriberResponse | null> {
  const secretKey = process.env.REVENUECAT_SECRET_KEY;
  if (!secretKey) {
    console.error('REVENUECAT_SECRET_KEY not configured; cannot pull subscriber');
    return null;
  }

  const url = `${RC_API_BASE}/subscribers/${encodeURIComponent(appUserId)}`;
  const resp = await fetch(url, {
    headers: {
      Authorization: `Bearer ${secretKey}`,
      Accept: 'application/json',
    },
  });

  if (resp.status === 404) return null;
  if (!resp.ok) {
    throw new Error(`RevenueCat subscriber fetch failed: ${resp.status} ${resp.statusText}`);
  }

  return (await resp.json()) as RcSubscriberResponse;
}

interface SubscriptionSnapshot {
  status: 'free' | 'active' | 'in_grace' | 'expired' | 'refunded';
  productId: string | null;
  expiresAt: string | null;
  willRenew: boolean;
}

function deriveSnapshot(sub: RcSubscriberResponse | null): SubscriptionSnapshot {
  if (!sub) return { status: 'free', productId: null, expiresAt: null, willRenew: false };

  const entitlement = sub.subscriber.entitlements[RC_ENTITLEMENT_PAID];
  if (!entitlement) {
    return { status: 'free', productId: null, expiresAt: null, willRenew: false };
  }

  const now = Date.now();
  const expMs = entitlement.expires_date ? Date.parse(entitlement.expires_date) : null;
  const graceMs = entitlement.grace_period_expires_date
    ? Date.parse(entitlement.grace_period_expires_date)
    : null;
  const productId = entitlement.product_identifier;

  const subscription = sub.subscriber.subscriptions[productId];
  const willRenew = !entitlement.unsubscribe_detected_at && !subscription?.unsubscribe_detected_at;
  const isRefunded = Boolean(subscription?.refunded_at);

  if (isRefunded) {
    return { status: 'refunded', productId, expiresAt: entitlement.expires_date, willRenew: false };
  }

  // Grace period takes priority if still in future (RC sets this when retry is pending).
  if (graceMs !== null && graceMs > now) {
    return {
      status: 'in_grace',
      productId,
      expiresAt: entitlement.grace_period_expires_date!,
      willRenew,
    };
  }
  if (expMs !== null && expMs > now) {
    return {
      status: 'active',
      productId,
      expiresAt: entitlement.expires_date,
      willRenew,
    };
  }
  return {
    status: 'expired',
    productId,
    expiresAt: entitlement.expires_date,
    willRenew: false,
  };
}

// ─── Upsert snapshot to DB ────────────────────────────────────
async function upsertSubscriberSnapshot(
  appUserId: string,
  snapshot: SubscriptionSnapshot
): Promise<string | null> {
  const legacyPlan =
    snapshot.status === 'active' || snapshot.status === 'in_grace' ? 'paid' : 'free';

  const res = await query(
    `UPDATE users
        SET subscription_status      = $1,
            subscription_product_id  = $2,
            subscription_expires_at  = $3::timestamptz,
            will_renew               = $4,
            revenuecat_app_user_id   = COALESCE(revenuecat_app_user_id, $5),
            revenuecat_id            = COALESCE(revenuecat_id, $5),
            plan_type                = $6,
            updated_at               = NOW()
      WHERE revenuecat_app_user_id = $5 OR id::text = $5 OR revenuecat_id = $5
      RETURNING id`,
    [
      snapshot.status,
      snapshot.productId,
      snapshot.expiresAt,
      snapshot.willRenew,
      appUserId,
      legacyPlan,
    ]
  );
  if (res.rows.length > 0) {
    return (res.rows[0] as { id: string }).id;
  }
  console.warn(`RC snapshot upsert: no user matched for app_user_id=${appUserId}`);
  return null;
}

// ─── Event idempotency ────────────────────────────────────────
async function markEventProcessed(eventId: string, eventType: string, rawBody: unknown): Promise<void> {
  await query(
    `INSERT INTO webhook_events (event_id, event_type, processed_at, raw_body)
       VALUES ($1, $2, NOW(), $3)
     ON CONFLICT (event_id) DO UPDATE
       SET processed_at = EXCLUDED.processed_at,
           event_type   = EXCLUDED.event_type`,
    [eventId, eventType, JSON.stringify(rawBody)]
  );
}

async function isEventAlreadyProcessed(eventId: string): Promise<boolean> {
  const res = await query(
    `SELECT processed_at FROM webhook_events
       WHERE event_id = $1 AND processed_at IS NOT NULL LIMIT 1`,
    [eventId]
  );
  return res.rows.length > 0;
}

// ─── Public: handle webhook ───────────────────────────────────
export async function handleWebhookEvent(body: RevenueCatWebhookBody): Promise<void> {
  const { event } = body;

  // Reject events without a stable id; prevents replay attacks that
  // forge "new" events on each hit.
  if (!event.id) {
    console.warn('RC webhook: rejecting event without id', event.type);
    return;
  }

  if (await isEventAlreadyProcessed(event.id)) {
    console.log(`RC webhook: duplicate event ${event.id}, skipping`);
    return;
  }

  const appUserId = event.app_user_id;

  // TRANSFER: fetch EACH distinct user's current state rather than
  // copy the snapshot across. transferred_from should go free; transferred_to
  // gets the entitlement.
  if (event.type === 'TRANSFER') {
    const ids = new Set<string>();
    ids.add(appUserId);
    for (const id of event.transferred_from || []) ids.add(id);
    for (const id of event.transferred_to || []) ids.add(id);
    for (const id of event.aliases || []) ids.add(id);
    for (const id of Array.from(ids)) {
      const sub = await fetchSubscriber(id);
      const snap = deriveSnapshot(sub);
      await upsertSubscriberSnapshot(id, snap);
    }
    await markEventProcessed(event.id, event.type, body);
    return;
  }

  // Non-TRANSFER: fetch the acting user's snapshot; apply only to that user
  // (and if present, original_app_user_id as an alias of the same identity).
  const subscriber = await fetchSubscriber(appUserId);
  const snapshot = deriveSnapshot(subscriber);

  await upsertSubscriberSnapshot(appUserId, snapshot);
  if (event.original_app_user_id && event.original_app_user_id !== appUserId) {
    // original_app_user_id refers to the same subscriber identity.
    await upsertSubscriberSnapshot(event.original_app_user_id, snapshot);
  }

  // Only mark processed on SUCCESS — otherwise RC retries are allowed.
  await markEventProcessed(event.id, event.type, body);

  console.log(
    `RC snapshot applied: app_user_id=${appUserId} status=${snapshot.status} product=${snapshot.productId ?? 'none'}`
  );
}

// ─── Public: client-triggered sync ────────────────────────────
// Server-side only uses the authenticated userId. No client hint is accepted.
// We query RC using multiple candidate identifiers (userId + any stored
// revenuecat_app_user_id) and require the RC subscriber to list userId in
// its original_app_user_id or aliases to prevent spoofing.
export async function syncSubscriberForUser(userId: string): Promise<SubscriptionSnapshot> {
  // Fetch the user's existing RC app_user_id binding (if any) so we can
  // query RC whether they're logged in as userId or as a prior alias.
  const urow = await query(
    `SELECT revenuecat_app_user_id FROM users WHERE id = $1`,
    [userId]
  );
  const storedRcId =
    urow.rows.length > 0
      ? (urow.rows[0] as { revenuecat_app_user_id: string | null }).revenuecat_app_user_id
      : null;

  const tryIds: string[] = [userId];
  if (storedRcId && storedRcId !== userId) tryIds.push(storedRcId);

  for (const id of tryIds) {
    const subscriber = await fetchSubscriber(id);
    if (!subscriber) continue;

    // Verify the subscriber identity actually corresponds to our user.
    const original = subscriber.subscriber.original_app_user_id;
    const owns =
      original === userId ||
      original === storedRcId ||
      id === userId ||
      id === storedRcId;
    if (!owns) {
      console.warn(`sync: RC subscriber ${id} does not belong to user ${userId}; ignoring`);
      continue;
    }

    const snapshot = deriveSnapshot(subscriber);
    await upsertSubscriberSnapshot(userId, snapshot);
    return snapshot;
  }

  // No match — return free, but do not alter DB (may already be paid via webhook).
  return { status: 'free', productId: null, expiresAt: null, willRenew: false };
}
