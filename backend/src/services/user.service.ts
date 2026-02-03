/**
 * User Service
 * Business logic for user management
 */

import { query, getById, paginate, softDelete } from '../utils/database';
import { User, UpdateUserDTO, UserPublic } from '../models/User';
import { sanitizeUser } from '../utils/sanitization';

/**
 * Get user by ID
 */
export async function getUserById(id: string): Promise<UserPublic | null> {
  const user = await getById<User>('users', id);
  return user ? sanitizeUser(user) : null;
}

/**
 * Get user by username
 */
export async function getUserByUsername(username: string): Promise<UserPublic | null> {
  const result = await query<User>(
    'SELECT * FROM users WHERE username = $1 AND deleted_at IS NULL',
    [username]
  );
  return result.rows[0] ? sanitizeUser(result.rows[0]) : null;
}

/**
 * Update user
 */
export async function updateUser(
  id: string,
  data: UpdateUserDTO
): Promise<UserPublic> {
  const updates: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  if (data.display_name !== undefined) {
    updates.push(`display_name = $${paramIndex++}`);
    values.push(data.display_name);
  }

  if (data.avatar !== undefined) {
    updates.push(`avatar = $${paramIndex++}`);
    values.push(data.avatar);
  }

  if (data.bio !== undefined) {
    updates.push(`bio = $${paramIndex++}`);
    values.push(data.bio);
  }

  if (data.location !== undefined) {
    updates.push(`location = $${paramIndex++}`);
    values.push(data.location);
  }

  if (updates.length === 0) {
    throw new Error('No fields to update');
  }

  values.push(id);

  const result = await query<User>(
    `UPDATE users SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
     WHERE id = $${paramIndex} AND deleted_at IS NULL
     RETURNING *`,
    values
  );

  if (result.rows.length === 0) {
    throw new Error('User not found');
  }

  return sanitizeUser(result.rows[0]);
}

/**
 * Delete user (soft delete)
 */
export async function deleteUser(id: string): Promise<boolean> {
  return softDelete('users', id);
}

/**
 * List users with pagination
 */
export async function listUsers(
  page: number = 1,
  limit: number = 20
): Promise<{ data: UserPublic[]; total: number; page: number; limit: number }> {
  const result = await paginate<User>('users', page, limit);
  
  return {
    ...result,
    data: result.data.map(sanitizeUser),
  };
}

/**
 * Search users by username
 */
export async function searchUsers(
  searchTerm: string,
  page: number = 1,
  limit: number = 20
): Promise<{ data: UserPublic[]; total: number; page: number; limit: number }> {
  const result = await paginate<User>(
    'users',
    page,
    limit,
    'created_at DESC',
    'username ILIKE $1 AND deleted_at IS NULL',
    [`%${searchTerm}%`]
  );
  
  return {
    ...result,
    data: result.data.map(sanitizeUser),
  };
}
