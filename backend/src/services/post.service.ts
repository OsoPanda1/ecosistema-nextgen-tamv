/**
 * Post Service
 * Business logic for post management
 */

import { query } from '../utils/database';
import { Post, CreatePostDTO, UpdatePostDTO, PostWithUser } from '../models/Post';

/**
 * Create a new post
 */
export async function createPost(data: CreatePostDTO): Promise<PostWithUser> {
  const result = await query<Post>(
    `INSERT INTO posts (user_id, content, media_urls, visibility)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [data.user_id, data.content, data.media_urls || [], data.visibility || 'public']
  );

  const post = result.rows[0];
  return getPostWithUser(post.id);
}

/**
 * Get post by ID with user information
 */
export async function getPostById(id: string): Promise<PostWithUser | null> {
  return getPostWithUser(id);
}

/**
 * Get post with user information
 */
async function getPostWithUser(postId: string): Promise<PostWithUser> {
  const result = await query<PostWithUser>(
    `SELECT p.*, u.username, u.display_name, u.avatar
     FROM posts p
     JOIN users u ON p.user_id = u.id
     WHERE p.id = $1 AND p.deleted_at IS NULL`,
    [postId]
  );

  if (result.rows.length === 0) {
    throw new Error('Post not found');
  }

  return result.rows[0];
}

/**
 * Update post
 */
export async function updatePost(
  id: string,
  userId: string,
  data: UpdatePostDTO
): Promise<PostWithUser> {
  const updates: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  if (data.content !== undefined) {
    updates.push(`content = $${paramIndex++}`);
    values.push(data.content);
  }

  if (data.media_urls !== undefined) {
    updates.push(`media_urls = $${paramIndex++}`);
    values.push(data.media_urls);
  }

  if (data.visibility !== undefined) {
    updates.push(`visibility = $${paramIndex++}`);
    values.push(data.visibility);
  }

  if (updates.length === 0) {
    throw new Error('No fields to update');
  }

  values.push(id, userId);

  const result = await query<Post>(
    `UPDATE posts SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
     WHERE id = $${paramIndex} AND user_id = $${paramIndex + 1} AND deleted_at IS NULL
     RETURNING *`,
    values
  );

  if (result.rows.length === 0) {
    throw new Error('Post not found or unauthorized');
  }

  return getPostWithUser(id);
}

/**
 * Delete post (soft delete)
 */
export async function deletePost(id: string, userId: string): Promise<boolean> {
  const result = await query(
    `UPDATE posts SET deleted_at = CURRENT_TIMESTAMP
     WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL`,
    [id, userId]
  );

  return (result.rowCount || 0) > 0;
}

/**
 * List posts with pagination
 */
export async function listPosts(
  page: number = 1,
  limit: number = 20,
  userId?: string
): Promise<{ data: PostWithUser[]; total: number; page: number; limit: number }> {
  const offset = (page - 1) * limit;

  let whereClause = "WHERE p.deleted_at IS NULL AND p.visibility = 'public'";
  const params: any[] = [];

  if (userId) {
    whereClause = 'WHERE p.deleted_at IS NULL AND p.user_id = $1';
    params.push(userId);
  }

  // Get total count
  const countResult = await query<{ count: string }>(
    `SELECT COUNT(*) as count FROM posts p ${whereClause}`,
    params
  );
  const total = parseInt(countResult.rows[0].count);

  // Get paginated data
  const dataResult = await query<PostWithUser>(
    `SELECT p.*, u.username, u.display_name, u.avatar
     FROM posts p
     JOIN users u ON p.user_id = u.id
     ${whereClause}
     ORDER BY p.created_at DESC
     LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, limit, offset]
  );

  return {
    data: dataResult.rows,
    total,
    page,
    limit,
  };
}

/**
 * Get personalized feed
 */
export async function getFeed(
  userId: string,
  page: number = 1,
  limit: number = 20
): Promise<{ data: PostWithUser[]; total: number; page: number; limit: number }> {
  const offset = (page - 1) * limit;

  // For now, return all public posts
  // TODO: Implement following logic
  const countResult = await query<{ count: string }>(
    `SELECT COUNT(*) as count FROM posts p
     WHERE p.deleted_at IS NULL AND p.visibility = 'public'`
  );
  const total = parseInt(countResult.rows[0].count);

  const dataResult = await query<PostWithUser>(
    `SELECT p.*, u.username, u.display_name, u.avatar
     FROM posts p
     JOIN users u ON p.user_id = u.id
     WHERE p.deleted_at IS NULL AND p.visibility = 'public'
     ORDER BY p.created_at DESC
     LIMIT $1 OFFSET $2`,
    [limit, offset]
  );

  return {
    data: dataResult.rows,
    total,
    page,
    limit,
  };
}
