/**
 * Validation Schemas
 * Zod schemas for request validation
 */

import { z } from 'zod';

// User validation schemas
export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be at most 30 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  display_name: z.string().max(100).optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const updateUserSchema = z.object({
  display_name: z.string().max(100).optional(),
  bio: z.string().max(500).optional(),
  location: z.string().max(100).optional(),
  avatar: z.string().url().optional(),
});

// Post validation schemas
export const createPostSchema = z.object({
  content: z.string().min(1, 'Content is required').max(5000, 'Content is too long'),
  media_urls: z.array(z.string().url()).max(10).optional(),
  visibility: z.enum(['public', 'followers', 'private']).optional(),
});

export const updatePostSchema = z.object({
  content: z.string().min(1).max(5000).optional(),
  media_urls: z.array(z.string().url()).max(10).optional(),
  visibility: z.enum(['public', 'followers', 'private']).optional(),
});

// Comment validation schemas
export const createCommentSchema = z.object({
  content: z.string().min(1, 'Content is required').max(1000, 'Content is too long'),
  parent_comment_id: z.string().uuid().optional(),
});

// Pagination validation schema
export const paginationSchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
});

// UUID validation schema
export const uuidSchema = z.object({
  id: z.string().uuid('Invalid ID format'),
});
