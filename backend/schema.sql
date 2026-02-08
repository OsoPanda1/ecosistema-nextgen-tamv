-- TAMV Database Schema
-- PostgreSQL 16+

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  username VARCHAR(50) UNIQUE NOT NULL,
  avatar VARCHAR(500),
  bio TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Posts table
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  media_url VARCHAR(500),
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Likes table
CREATE TABLE IF NOT EXISTS likes (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (user_id, post_id)
);

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Follows table
CREATE TABLE IF NOT EXISTS follows (
  follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- BookPI entries table
CREATE TABLE IF NOT EXISTS bookpi_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  narrative TEXT NOT NULL,
  context JSONB DEFAULT '{}'::jsonb,
  visibility VARCHAR(20) DEFAULT 'internal',
  created_at TIMESTAMP DEFAULT NOW()
);

-- EOCT evaluations table
CREATE TABLE IF NOT EXISTS eoct_evaluations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
  subject_type VARCHAR(100) NOT NULL,
  subject_id UUID,
  score NUMERIC(4, 3) NOT NULL,
  verdict VARCHAR(20) NOT NULL,
  risk_level VARCHAR(20) DEFAULT 'low',
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Isabella decisions table
CREATE TABLE IF NOT EXISTS isabella_decisions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
  prompt TEXT NOT NULL,
  response TEXT NOT NULL,
  ethics_score NUMERIC(4, 3) NOT NULL,
  context JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT NOW()
);

-- XR events table
CREATE TABLE IF NOT EXISTS xr_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
  event_type VARCHAR(100) NOT NULL,
  payload JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT NOW()
);

-- DreamSpaces table
CREATE TABLE IF NOT EXISTS dreamspaces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  access_level VARCHAR(20) NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT NOW(),
  CHECK (access_level IN ('public', 'private', 'guardian'))
);

-- DreamSpaces permissions table
CREATE TABLE IF NOT EXISTS dreamspace_permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dreamspace_id UUID NOT NULL REFERENCES dreamspaces(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  role VARCHAR(20) NOT NULL,
  granted_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (dreamspace_id, user_id)
);

-- Economy ledger table
CREATE TABLE IF NOT EXISTS economy_ledger (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount NUMERIC(18, 4) NOT NULL,
  currency VARCHAR(20) NOT NULL,
  entry_type VARCHAR(20) NOT NULL,
  reference VARCHAR(255),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Token balances table
CREATE TABLE IF NOT EXISTS token_balances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_type VARCHAR(50) NOT NULL,
  balance NUMERIC(18, 4) NOT NULL DEFAULT 0,
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (user_id, token_type)
);

-- Memberships table
CREATE TABLE IF NOT EXISTS memberships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tier VARCHAR(20) NOT NULL,
  status VARCHAR(20) NOT NULL,
  started_at TIMESTAMP DEFAULT NOW(),
  ends_at TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_likes_post_id ON likes(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_follows_follower ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON follows(following_id);
CREATE INDEX IF NOT EXISTS idx_bookpi_entries_actor_id ON bookpi_entries(actor_id);
CREATE INDEX IF NOT EXISTS idx_bookpi_entries_created_at ON bookpi_entries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_eoct_evaluations_actor_id ON eoct_evaluations(actor_id);
CREATE INDEX IF NOT EXISTS idx_isabella_decisions_actor_id ON isabella_decisions(actor_id);
CREATE INDEX IF NOT EXISTS idx_xr_events_actor_id ON xr_events(actor_id);
CREATE INDEX IF NOT EXISTS idx_dreamspaces_owner_id ON dreamspaces(owner_id);
CREATE INDEX IF NOT EXISTS idx_dreamspace_permissions_space ON dreamspace_permissions(dreamspace_id);
CREATE INDEX IF NOT EXISTS idx_dreamspace_permissions_user ON dreamspace_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_economy_ledger_user_id ON economy_ledger(user_id);
CREATE INDEX IF NOT EXISTS idx_token_balances_user_id ON token_balances(user_id);
CREATE INDEX IF NOT EXISTS idx_memberships_user_id ON memberships(user_id);

-- Updated-at trigger helper
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_timestamp_dreamspace_permissions ON dreamspace_permissions;
CREATE TRIGGER set_timestamp_dreamspace_permissions
BEFORE UPDATE ON dreamspace_permissions
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

DROP TRIGGER IF EXISTS set_timestamp_token_balances ON token_balances;
CREATE TRIGGER set_timestamp_token_balances
BEFORE UPDATE ON token_balances
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

-- Seed data for testing
INSERT INTO users (email, password_hash, username, avatar) VALUES
  ('demo@tamv.com', '$2b$10$rQZ5YqZ5YqZ5YqZ5YqZ5YeZ5YqZ5YqZ5YqZ5YqZ5YqZ5YqZ5YqZ5Y', 'demo_user', 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo'),
  ('test@tamv.com', '$2b$10$rQZ5YqZ5YqZ5YqZ5YqZ5YeZ5YqZ5YqZ5YqZ5YqZ5YqZ5YqZ5YqZ5Y', 'test_user', 'https://api.dicebear.com/7.x/avataaars/svg?seed=test')
ON CONFLICT DO NOTHING;

-- Seed posts
INSERT INTO posts (user_id, content) VALUES
  ((SELECT id FROM users WHERE username = 'demo_user'), 'Welcome to TAMV! 🚀 This is the future of social networking.'),
  ((SELECT id FROM users WHERE username = 'test_user'), 'Testing the new TAMV platform. Looks amazing! 🎉')
ON CONFLICT DO NOTHING;
