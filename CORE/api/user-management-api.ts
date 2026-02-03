/**
 * TAMV User Management API
 * Comprehensive user registration, permissions, and profile management
 * 
 * Security: Role-based access control with cryptographic verification
 * Compliance: GDPR-compliant with privacy by design
 * Architecture: RESTful API with OpenAPI 3.0 specification
 */

import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';
import { v4 as uuidv4 } from 'uuid';
import { Pool } from 'pg';
import Redis from 'ioredis';

const router = express.Router();

// Database and cache connections
const db = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

const redis = new Redis(process.env.REDIS_URL);

// Rate limiting for security
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts per window
    message: { error: 'Too many authentication attempts, please try again later' },
    standardHeaders: true,
    legacyHeaders: false
});

const registrationLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // 3 registrations per hour per IP
    message: { error: 'Registration limit exceeded, please try again later' }
});

// Validation schemas
const UserRegistrationSchema = z.object({
    email: z.string().email().max(255),
    username: z.string().min(3).max(50).regex(/^[a-zA-Z0-9_-]+$/),
    password: z.string().min(8).max(128),
    firstName: z.string().min(1).max(100),
    lastName: z.string().min(1).max(100),
    dateOfBirth: z.string().datetime().o