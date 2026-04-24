-- ═══════════════════════════════════════════════════════════════
-- LingXi (靈犀) Database Schema
-- PostgreSQL (Cloud SQL)
-- ═══════════════════════════════════════════════════════════════
-- Canonical schema for fresh dev DB bootstrap.
-- For existing DBs, apply migrations in order from src/db/migrations/.
-- ═══════════════════════════════════════════════════════════════

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE,
  password_hash VARCHAR(255),
  apple_id VARCHAR(255) UNIQUE,
  name VARCHAR(100) NOT NULL,
  birth_year INT NOT NULL,
  birth_month INT NOT NULL,
  birth_day INT NOT NULL,
  birth_hour INT DEFAULT 11,
  calendar_type VARCHAR(10) DEFAULT 'solar',
  gender VARCHAR(10) DEFAULT 'male',
  destiny_data JSONB DEFAULT '{}',
  plan_type VARCHAR(20) DEFAULT 'free',           -- legacy dual-read column
  revenuecat_id VARCHAR(255),                     -- legacy
  revenuecat_app_user_id VARCHAR(128),            -- canonical RC identifier
  -- Trial state:
  trial_used_count INT NOT NULL DEFAULT 0,
  trial_limit INT NOT NULL DEFAULT 3,
  -- Subscription snapshot (source-of-truth cached from RevenueCat):
  subscription_status VARCHAR(20) NOT NULL DEFAULT 'free',
    -- 'free' | 'active' | 'in_grace' | 'expired' | 'refunded'
  subscription_product_id VARCHAR(64),
  subscription_expires_at TIMESTAMPTZ,
  will_renew BOOLEAN DEFAULT FALSE,
  language VARCHAR(10) DEFAULT 'zh-TW',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE UNIQUE INDEX uq_users_rc_app_user_id
  ON users(revenuecat_app_user_id)
  WHERE revenuecat_app_user_id IS NOT NULL;
CREATE INDEX idx_users_sub_status ON users(subscription_status);

CREATE TABLE pets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  pet_id VARCHAR(50) NOT NULL,
  name VARCHAR(100) NOT NULL,
  creature VARCHAR(100),
  element VARCHAR(10),
  solar_term VARCHAR(50),
  season VARCHAR(10),
  zodiac VARCHAR(50),
  personality TEXT,
  emoji VARCHAR(10),
  level INT DEFAULT 1,
  exp INT DEFAULT 0,
  exp_to_next INT DEFAULT 100,
  evolution INT DEFAULT 1,
  power INT DEFAULT 50,
  affinity INT DEFAULT 50,
  wisdom INT DEFAULT 50,
  mood VARCHAR(20) DEFAULT 'happy',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Legacy daily_usage (kept for analytics during rollout) ────
CREATE TABLE daily_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  usage_date DATE NOT NULL DEFAULT CURRENT_DATE,
  feature VARCHAR(30) NOT NULL,
  count INT DEFAULT 0,
  UNIQUE(user_id, usage_date, feature)
);
CREATE INDEX idx_daily_usage_user_date ON daily_usage(user_id, usage_date);

-- ─── Trial consumption ledger (atomic + idempotent, user-scoped) ──
CREATE TABLE trial_consumptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  idempotency_key VARCHAR(128) NOT NULL,
  feature VARCHAR(32) NOT NULL,
  status VARCHAR(16) NOT NULL CHECK (status IN ('reserved','consumed','failed')),
  response_payload JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  UNIQUE(user_id, idempotency_key)
);
CREATE INDEX idx_trial_consumptions_user ON trial_consumptions(user_id, created_at DESC);
CREATE INDEX idx_trial_consumptions_status ON trial_consumptions(status);

-- ─── Paid-plan fair-use daily counter ──────────────────────────
CREATE TABLE paid_daily_usage (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  usage_date DATE NOT NULL DEFAULT CURRENT_DATE,
  count INT NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, usage_date)
);
CREATE INDEX idx_paid_daily_usage_date ON paid_daily_usage(usage_date);

-- ─── Webhook event idempotency ─────────────────────────────────
CREATE TABLE webhook_events (
  event_id VARCHAR(128) PRIMARY KEY,
  event_type VARCHAR(64),
  received_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  raw_body JSONB
);

-- ─── Device fingerprint analytics (weak signal, not blocking) ──
CREATE TABLE device_fingerprints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_key_hash VARCHAR(128) NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  platform VARCHAR(16),
  first_seen_at TIMESTAMPTZ DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ DEFAULT NOW(),
  abuse_score INT DEFAULT 0,
  UNIQUE(device_key_hash, user_id)
);
CREATE INDEX idx_device_fingerprints_hash ON device_fingerprints(device_key_hash);

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL,
  content TEXT NOT NULL,
  feature VARCHAR(30),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_messages_user ON messages(user_id, created_at DESC);
