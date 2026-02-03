-- Migration: Create msr_events table (Metaverse Sovereign Registry)
-- Created: 2026-02-03

CREATE TABLE IF NOT EXISTS msr_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  payload JSONB NOT NULL,
  hash TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_msr_events_actor_id ON msr_events(actor_id);
CREATE INDEX idx_msr_events_action ON msr_events(action);
CREATE INDEX idx_msr_events_created_at ON msr_events(created_at DESC);
CREATE INDEX idx_msr_events_hash ON msr_events(hash);

-- Rollback
-- DROP TABLE IF EXISTS msr_events CASCADE;
