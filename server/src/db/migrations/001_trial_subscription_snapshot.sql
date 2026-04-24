-- ═══════════════════════════════════════════════════════════════
-- 001: Trial Counter + Subscription Snapshot System
-- ═══════════════════════════════════════════════════════════════
-- Additive only — Expand/Contract migration strategy.
-- Does NOT drop plan_type or daily_usage; dual-read during rollout.
-- ═══════════════════════════════════════════════════════════════

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── users: trial counter + subscription snapshot ──────────────
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS trial_used_count INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS trial_limit INT NOT NULL DEFAULT 3,
  ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(20) NOT NULL DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS subscription_product_id VARCHAR(64),
  ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS will_renew BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS revenuecat_app_user_id VARCHAR(128);

-- subscription_status values: 'free' | 'active' | 'in_grace' | 'expired' | 'refunded'
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'users_subscription_status_chk') THEN
    ALTER TABLE users ADD CONSTRAINT users_subscription_status_chk
      CHECK (subscription_status IN ('free','active','in_grace','expired','refunded'));
  END IF;
END $$;

-- Only one row per RC app_user_id (prevents webhook from hitting multiple rows).
CREATE UNIQUE INDEX IF NOT EXISTS uq_users_rc_app_user_id
  ON users(revenuecat_app_user_id)
  WHERE revenuecat_app_user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_sub_status ON users(subscription_status);

-- ─── trial_consumptions: user-scoped idempotent ledger ─────────
CREATE TABLE IF NOT EXISTS trial_consumptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  idempotency_key VARCHAR(128) NOT NULL,
  feature VARCHAR(32) NOT NULL,
  status VARCHAR(16) NOT NULL,  -- 'reserved' | 'consumed' | 'failed'
  response_payload JSONB,        -- cached response for idempotent replay
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  UNIQUE(user_id, idempotency_key),
  CHECK (status IN ('reserved','consumed','failed'))
);

CREATE INDEX IF NOT EXISTS idx_trial_consumptions_user ON trial_consumptions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_trial_consumptions_status ON trial_consumptions(status);

-- ─── webhook_events: dedupe RC webhook retries ─────────────────
CREATE TABLE IF NOT EXISTS webhook_events (
  event_id VARCHAR(128) PRIMARY KEY,
  event_type VARCHAR(64),
  received_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ, -- NULL until successful processing; retries allowed
  raw_body JSONB
);

-- ─── paid_daily_usage: fair-use tracking for unlimited plans ───
CREATE TABLE IF NOT EXISTS paid_daily_usage (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  usage_date DATE NOT NULL DEFAULT CURRENT_DATE,
  count INT NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, usage_date)
);

CREATE INDEX IF NOT EXISTS idx_paid_daily_usage_date ON paid_daily_usage(usage_date);

-- ─── device_fingerprints: weak signal for abuse analytics ──────
CREATE TABLE IF NOT EXISTS device_fingerprints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_key_hash VARCHAR(128) NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  platform VARCHAR(16),
  first_seen_at TIMESTAMPTZ DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ DEFAULT NOW(),
  abuse_score INT DEFAULT 0,
  UNIQUE(device_key_hash, user_id)
);

CREATE INDEX IF NOT EXISTS idx_device_fingerprints_hash ON device_fingerprints(device_key_hash);

-- ─── Backfill: map legacy plan_type → subscription_status ──────
UPDATE users
SET subscription_status = 'active'
WHERE plan_type IN ('member', 'supreme')
  AND subscription_status = 'free';
