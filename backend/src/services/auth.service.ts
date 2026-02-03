/**
 * Authentication Service
 * Business logic for user authentication
 */

import { query, transaction } from '../utils/database';
import { hashPassword, verifyPassword } from '../utils/bcrypt';
import { generateAccessToken, generateRefreshToken, verifyToken } from '../utils/jwt';
import { User, CreateUserDTO } from '../models/User';
import { Session, CreateSessionDTO } from '../models/Session';
import { sanitizeUser } from '../utils/sanitization';

export interface AuthResponse {
  user: Omit<User, 'password_hash'>;
  accessToken: string;
  refreshToken: string;
}

/**
 * Register a new user
 */
export async function register(
  data: CreateUserDTO,
  ipAddress?: string,
  userAgent?: string
): Promise<AuthResponse> {
  return transaction(async (client) => {
    // Check if email already exists
    const emailCheck = await client.query(
      'SELECT id FROM users WHERE email = $1',
      [data.email]
    );
    if (emailCheck.rows.length > 0) {
      throw new Error('Email already registered');
    }

    // Check if username already exists
    const usernameCheck = await client.query(
      'SELECT id FROM users WHERE username = $1',
      [data.username]
    );
    if (usernameCheck.rows.length > 0) {
      throw new Error('Username already taken');
    }

    // Hash password
    const password_hash = await hashPassword(data.password);

    // Create user
    const userResult = await client.query<User>(
      `INSERT INTO users (email, username, password_hash, display_name)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [data.email, data.username, password_hash, data.display_name || data.username]
    );

    const user = userResult.rows[0];

    // Generate tokens
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshToken = generateRefreshToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Create session
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await client.query(
      `INSERT INTO sessions (user_id, token, refresh_token, ip_address, user_agent, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [user.id, accessToken, refreshToken, ipAddress, userAgent, expiresAt]
    );

    return {
      user: sanitizeUser(user),
      accessToken,
      refreshToken,
    };
  });
}

/**
 * Login user
 */
export async function login(
  email: string,
  password: string,
  ipAddress?: string,
  userAgent?: string
): Promise<AuthResponse> {
  // Get user by email
  const result = await query<User>(
    'SELECT * FROM users WHERE email = $1',
    [email]
  );

  if (result.rows.length === 0) {
    throw new Error('Invalid email or password');
  }

  const user = result.rows[0];

  // Verify password
  const isValid = await verifyPassword(password, user.password_hash);
  if (!isValid) {
    throw new Error('Invalid email or password');
  }

  // Generate tokens
  const accessToken = generateAccessToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  const refreshToken = generateRefreshToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  // Create session
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

  await query(
    `INSERT INTO sessions (user_id, token, refresh_token, ip_address, user_agent, expires_at)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [user.id, accessToken, refreshToken, ipAddress, userAgent, expiresAt]
  );

  // Update last login
  await query(
    'UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = $1',
    [user.id]
  );

  return {
    user: sanitizeUser(user),
    accessToken,
    refreshToken,
  };
}

/**
 * Logout user
 */
export async function logout(token: string): Promise<void> {
  await query('DELETE FROM sessions WHERE token = $1', [token]);
}

/**
 * Refresh access token
 */
export async function refreshAccessToken(refreshToken: string): Promise<AuthResponse> {
  // Verify refresh token
  const payload = verifyToken(refreshToken);

  // Check if session exists
  const sessionResult = await query<Session>(
    'SELECT * FROM sessions WHERE refresh_token = $1 AND expires_at > CURRENT_TIMESTAMP',
    [refreshToken]
  );

  if (sessionResult.rows.length === 0) {
    throw new Error('Invalid or expired refresh token');
  }

  // Get user
  const userResult = await query<User>(
    'SELECT * FROM users WHERE id = $1',
    [payload.userId]
  );

  if (userResult.rows.length === 0) {
    throw new Error('User not found');
  }

  const user = userResult.rows[0];

  // Generate new tokens
  const newAccessToken = generateAccessToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  const newRefreshToken = generateRefreshToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  // Update session
  await query(
    'UPDATE sessions SET token = $1, refresh_token = $2 WHERE refresh_token = $3',
    [newAccessToken, newRefreshToken, refreshToken]
  );

  return {
    user: sanitizeUser(user),
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
}
