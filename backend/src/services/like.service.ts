/**
 * Like Service
 * Business logic for post likes
 */

import { query } from '../utils/database';
import { Like, CreateLikeDTO } from '../models/Like';

/**
 * Like a post
 */
export async function likePost(data: CreateLikeDTO): Promise<Like> {
  try {
    const result = await query<Like>(
      `INSERT INTO likes (post_id, user_id)
       VALUES ($1, $2)
       RETURNING *`,
      [data.post_id, data.user_id]
    );

    return result.rows[0];
  } catch (error: any) {
    // Handle duplicate like (unique constraint violation)
    if (error.code === '23505') {
      throw new Error('Post already liked');
    }
    throw error;
  }
}

/**
 * Unlike a post
 */
export async function unlikePost(postId: string, userId: string): Promise<boolean> {
  const result = await query(
    'DELETE FROM likes WHERE post_id = $1 AND user_id = $2',
    [postId, userId]
  );

  return (result.rowCount || 0) > 0;
}

/**
 * Check if user has liked a post
 */
export async function hasUserLikedPost(postId: string, userId: string): Promise<boolean> {
  const result = await query<{ exists: boolean }>(
    'SELECT EXISTS(SELECT 1 FROM likes WHERE post_id = $1 AND user_id = $2)',
    [postId, userId]
  );

  return result.rows[0].exists;
}

/**
 * Get post likes count
 */
export async function getPostLikesCount(postId: string): Promise<number> {
  const result = await query<{ count: string }>(
    'SELECT COUNT(*) as count FROM likes WHERE post_id = $1',
    [postId]
  );

  return parseInt(result.rows[0].count);
}
