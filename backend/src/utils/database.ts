/**
 * Database Utilities
 * Query helpers and transaction support
 */

import pool from '../config/database';
import { PoolClient, QueryResult } from 'pg';

/**
 * Execute a parameterized query
 * Prevents SQL injection by using prepared statements
 */
export async function query<T = any>(
  text: string,
  params?: any[]
): Promise<QueryResult<T>> {
  const start = Date.now();
  try {
    const result = await pool.query<T>(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: result.rowCount });
    return result;
  } catch (error) {
    console.error('Query error', { text, error });
    throw error;
  }
}

/**
 * Execute a transaction
 * Automatically handles BEGIN, COMMIT, and ROLLBACK
 */
export async function transaction<T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Get a single row by ID
 */
export async function getById<T = any>(
  table: string,
  id: string
): Promise<T | null> {
  const result = await query<T>(
    `SELECT * FROM ${table} WHERE id = $1 AND deleted_at IS NULL`,
    [id]
  );
  return result.rows[0] || null;
}

/**
 * Get paginated results
 */
export async function paginate<T = any>(
  table: string,
  page: number = 1,
  limit: number = 20,
  orderBy: string = 'created_at DESC',
  where?: string,
  params?: any[]
): Promise<{ data: T[]; total: number; page: number; limit: number }> {
  const offset = (page - 1) * limit;
  
  const whereClause = where ? `WHERE ${where}` : 'WHERE deleted_at IS NULL';
  
  // Get total count
  const countResult = await query<{ count: string }>(
    `SELECT COUNT(*) as count FROM ${table} ${whereClause}`,
    params
  );
  const total = parseInt(countResult.rows[0].count);
  
  // Get paginated data
  const dataResult = await query<T>(
    `SELECT * FROM ${table} ${whereClause} ORDER BY ${orderBy} LIMIT $${(params?.length || 0) + 1} OFFSET $${(params?.length || 0) + 2}`,
    [...(params || []), limit, offset]
  );
  
  return {
    data: dataResult.rows,
    total,
    page,
    limit,
  };
}

/**
 * Soft delete a record
 */
export async function softDelete(
  table: string,
  id: string
): Promise<boolean> {
  const result = await query(
    `UPDATE ${table} SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1 AND deleted_at IS NULL`,
    [id]
  );
  return (result.rowCount || 0) > 0;
}

/**
 * Check if a record exists
 */
export async function exists(
  table: string,
  column: string,
  value: any
): Promise<boolean> {
  const result = await query<{ exists: boolean }>(
    `SELECT EXISTS(SELECT 1 FROM ${table} WHERE ${column} = $1 AND deleted_at IS NULL)`,
    [value]
  );
  return result.rows[0].exists;
}
