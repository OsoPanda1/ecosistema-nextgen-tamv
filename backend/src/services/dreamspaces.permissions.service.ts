/**
 * DreamSpaces Permissions Service
 */

import pool from '../config/database';

export interface DreamspacePermissionInput {
  dreamspaceId: string;
  userId: string;
  role: 'viewer' | 'editor' | 'guardian';
  grantedBy: string;
}

export interface DreamspacePermission extends DreamspacePermissionInput {
  id: string;
  createdAt: string;
}

export async function grantDreamspacePermission(
  input: DreamspacePermissionInput
): Promise<DreamspacePermission> {
  const result = await pool.query<DreamspacePermission>(
    `INSERT INTO dreamspace_permissions (dreamspace_id, user_id, role, granted_by)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (dreamspace_id, user_id)
     DO UPDATE SET role = EXCLUDED.role, granted_by = EXCLUDED.granted_by, updated_at = NOW()
     RETURNING id, dreamspace_id as "dreamspaceId", user_id as "userId", role, granted_by as "grantedBy",
       created_at as "createdAt"`,
    [input.dreamspaceId, input.userId, input.role, input.grantedBy]
  );

  return result.rows[0];
}

export async function listDreamspacePermissions(
  dreamspaceId: string
): Promise<DreamspacePermission[]> {
  const result = await pool.query<DreamspacePermission>(
    `SELECT id, dreamspace_id as "dreamspaceId", user_id as "userId", role, granted_by as "grantedBy",
      created_at as "createdAt"
     FROM dreamspace_permissions
     WHERE dreamspace_id = $1
     ORDER BY created_at DESC`,
    [dreamspaceId]
  );

  return result.rows;
}

export async function revokeDreamspacePermission(
  dreamspaceId: string,
  userId: string
): Promise<void> {
  await pool.query(
    `DELETE FROM dreamspace_permissions WHERE dreamspace_id = $1 AND user_id = $2`,
    [dreamspaceId, userId]
  );
}

export async function getDreamspacePermission(
  dreamspaceId: string,
  userId: string
): Promise<DreamspacePermission | null> {
  const result = await pool.query<DreamspacePermission>(
    `SELECT id, dreamspace_id as "dreamspaceId", user_id as "userId", role, granted_by as "grantedBy",
      created_at as "createdAt"
     FROM dreamspace_permissions
     WHERE dreamspace_id = $1 AND user_id = $2`,
    [dreamspaceId, userId]
  );

  return result.rows[0] || null;
}
