/**
 * Comment Service
 * Business logic for post comments
 */

import { query, paginate } from '../utils/database';
import { Comment, CreateCommentDTO, UpdateCommentDTO, CommentWithUser } from '../models/Comment';

/**
 * Create a comment
 */
export async function createComment(data: CreateCommentDTO): Promise<CommentWithUser> {
  const result = await query<Comment>(
    `INSERT INTO comments (post_id, user_id, content, parent_comment_id)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [data.post_id, data.user_id, data.content, data.parent_comment_id || null]
  );

  const comment = result.rows[0];
  return getCommentWithUser(comment.id);
}

/**
 * Get comment with user information
 */
async function getCommentWithUser(commentId: string): Promise<CommentWithUser> {
  const result = await query<CommentWithUser>(
    `SELECT c.*, u.username, u.display_name, u.avatar
     FROM comments c
     JOIN users u ON c.user_id = u.id
     WHERE c.id = $1 AND c.deleted_at IS NULL`,
    [commentId]
  );

  if (result.rows.length === 0) {
    throw new Error('Comment not found');
  }

  return result.rows[0];
}

/**
 * Update comment
 */
export async function updateComment(
  id: string,
  userId: string,
  data: UpdateCommentDTO
): Promise<CommentWithUser> {
  const result = await query<Comment>(
    `UPDATE comments SET content = $1, updated_at = CURRENT_TIMESTAMP
     WHERE id = $2 AND user_id = $3 AND deleted_at IS NULL
     RETURNING *`,
    [data.content, id, userId]
  );

  if (result.rows.length === 0) {
    throw new Error('Comment not found or unauthorized');
  }

  return getCommentWithUser(id);
}

/**
 * Delete comment (soft delete)
 */
export async function deleteComment(id: string, userId: string): Promise<boolean> {
  const result = await query(
    `UPDATE comments SET deleted_at = CURRENT_TIMESTAMP
     WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL`,
    [id, userId]
  );

  return (result.rowCount || 0) > 0;
}

/**
 * Get comments for a post
 */
export async function getPostComments(
  postId: string,
  page: number = 1,
  limit: number = 20
): Promise<{ data: CommentWithUser[]; total: number; page: number; limit: number }> {
  const offset = (page - 1) * limit;

  // Get total count
  const countResult = await query<{ count: string }>(
    `SELECT COUNT(*) as count FROM comments
     WHERE post_id = $1 AND deleted_at IS NULL AND parent_comment_id IS NULL`,
    [postId]
  );
  const total = parseInt(countResult.rows[0].count);

  // Get paginated data (only top-level comments)
  const dataResult = await query<CommentWithUser>(
    `SELECT c.*, u.username, u.display_name, u.avatar
     FROM comments c
     JOIN users u ON c.user_id = u.id
     WHERE c.post_id = $1 AND c.deleted_at IS NULL AND c.parent_comment_id IS NULL
     ORDER BY c.created_at DESC
     LIMIT $2 OFFSET $3`,
    [postId, limit, offset]
  );

  return {
    data: dataResult.rows,
    total,
    page,
    limit,
  };
}

/**
 * Get replies to a comment
 */
export async function getCommentReplies(
  commentId: string,
  page: number = 1,
  limit: number = 10
): Promise<{ data: CommentWithUser[]; total: number; page: number; limit: number }> {
  const offset = (page - 1) * limit;

  // Get total count
  const countResult = await query<{ count: string }>(
    `SELECT COUNT(*) as count FROM comments
     WHERE parent_comment_id = $1 AND deleted_at IS NULL`,
    [commentId]
  );
  const total = parseInt(countResult.rows[0].count);

  // Get paginated data
  const dataResult = await query<CommentWithUser>(
    `SELECT c.*, u.username, u.display_name, u.avatar
     FROM comments c
     JOIN users u ON c.user_id = u.id
     WHERE c.parent_comment_id = $1 AND c.deleted_at IS NULL
     ORDER BY c.created_at ASC
     LIMIT $2 OFFSET $3`,
    [commentId, limit, offset]
  );

  return {
    data: dataResult.rows,
    total,
    page,
    limit,
  };
}
