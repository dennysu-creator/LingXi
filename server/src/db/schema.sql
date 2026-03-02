-- ═══════════════════════════════════════
-- LingXi (靈犀) Database Schema
-- PostgreSQL (Cloud SQL)
-- ═══════════════════════════════════════

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
  plan_type VARCHAR(20) DEFAULT 'free',
  revenuecat_id VARCHAR(255),
  language VARCHAR(10) DEFAULT 'zh-TW',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

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

CREATE TABLE daily_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  usage_date DATE NOT NULL DEFAULT CURRENT_DATE,
  feature VARCHAR(30) NOT NULL,
  count INT DEFAULT 0,
  UNIQUE(user_id, usage_date, feature)
);

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL,
  content TEXT NOT NULL,
  feature VARCHAR(30),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_daily_usage_user_date ON daily_usage(user_id, usage_date);
CREATE INDEX idx_messages_user ON messages(user_id, created_at DESC);
