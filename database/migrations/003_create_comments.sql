-- Migration: Create comments table
-- Created: 2026-02-03

CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Indexes
CREATE INDEX idx_comments_post_id ON comments(post_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);
CREATE INDEX idx_comments_parent_comment_id ON comments(parent_comment_id);
CREATE INDEX idx_comments_created_at ON comments(created_at DESC);
CREATE INDEX idx_comments_deleted_at ON comments(deleted_at) WHERE deleted_at IS NULL;

-- Trigger to update updated_at
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger to increment post comment_count
CREATE OR REPLACE FUNCTION increment_post_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE posts SET comment_count = comment_count + 1 WHERE id = NEW.post_id;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER increment_comment_count AFTER INSERT ON comments
  FOR EACH ROW EXECUTE FUNCTION increment_post_comment_count();

-- Trigger to decrement post comment_count
CREATE OR REPLACE FUNCTION decrement_post_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE posts SET comment_count = comment_count - 1 WHERE id = OLD.post_id;
  RETURN OLD;
END;
$$ language 'plpgsql';

CREATE TRIGGER decrement_comment_count AFTER DELETE ON comments
  FOR EACH ROW EXECUTE FUNCTION decrement_post_comment_count();

-- Rollback
-- DROP TRIGGER IF EXISTS decrement_comment_count ON comments;
-- DROP TRIGGER IF EXISTS increment_comment_count ON comments;
-- DROP TRIGGER IF EXISTS update_comments_updated_at ON comments;
-- DROP FUNCTION IF EXISTS decrement_post_comment_count();
-- DROP FUNCTION IF EXISTS increment_post_comment_count();
-- DROP TABLE IF EXISTS comments CASCADE;
