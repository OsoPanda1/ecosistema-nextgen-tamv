-- Migration: Create identities table
-- Created: 2026-02-03

CREATE TABLE IF NOT EXISTS identities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  dignity_score INTEGER NOT NULL DEFAULT 100,
  reputation INTEGER NOT NULL DEFAULT 0,
  immutable_username BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_identities_user_id ON identities(user_id);
CREATE INDEX idx_identities_dignity_score ON identities(dignity_score DESC);
CREATE INDEX idx_identities_reputation ON identities(reputation DESC);

-- Trigger to update updated_at
CREATE TRIGGER update_identities_updated_at BEFORE UPDATE ON identities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Rollback
-- DROP TRIGGER IF EXISTS update_identities_updated_at ON identities;
-- DROP TABLE IF EXISTS identities CASCADE;
