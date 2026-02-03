-- Migration: Create likes table
-- Created: 2026-02-03

CREATE TABLE IF NOT EXISTS likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(post_id, user_id) -- Prevent duplicate likes
);

-- Indexes
CREATE INDEX idx_likes_post_id ON likes(post_id);
CREATE INDEX idx_likes_user_id ON likes(user_id);
CREATE INDEX idx_likes_created_at ON likes(created_at DESC);

-- Trigger to increment post like_count
CREATE OR REPLACE FUNCTION increment_post_like_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE posts SET like_count = like_count + 1 WHERE id = NEW.post_id;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER increment_like_count AFTER INSERT ON likes
  FOR EACH ROW EXECUTE FUNCTION increment_post_like_count();

-- Trigger to decrement post like_count
CREATE OR REPLACE FUNCTION decrement_post_like_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE posts SET like_count = like_count - 1 WHERE id = OLD.post_id;
  RETURN OLD;
END;
$$ language 'plpgsql';

CREATE TRIGGER decrement_like_count AFTER DELETE ON likes
  FOR EACH ROW EXECUTE FUNCTION decrement_post_like_count();

-- Rollback
-- DROP TRIGGER IF EXISTS decrement_like_count ON likes;
-- DROP TRIGGER IF EXISTS increment_like_count ON likes;
-- DROP FUNCTION IF EXISTS decrement_post_like_count();
-- DROP FUNCTION IF EXISTS increment_post_like_count();
-- DROP TABLE IF EXISTS likes CASCADE;
