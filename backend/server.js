/**
 * TAMV Backend Server - MVP Funcional
 * Sistema mínimo viable con auth + posts + feed
 */

const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://tamv:tamv123@localhost:5432/tamv',
});

// Auth middleware
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tamv-secret-key');
    const result = await pool.query('SELECT id, email, username, avatar FROM users WHERE id = $1', [
      decoded.userId,
    ]);

    if (!result.rows[0]) return res.status(401).json({ error: 'User not found' });

    req.user = result.rows[0];
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// AUTH ROUTES
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, username } = req.body;

    // Validate
    if (!email || !password || !username) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Insert user
    const result = await pool.query(
      'INSERT INTO users (email, password_hash, username) VALUES ($1, $2, $3) RETURNING id, email, username, avatar, created_at',
      [email, passwordHash, username]
    );

    // Generate token
    const token = jwt.sign(
      { userId: result.rows[0].id },
      process.env.JWT_SECRET || 'tamv-secret-key',
      { expiresIn: '7d' }
    );

    res.json({ user: result.rows[0], token });
  } catch (error) {
    console.error('Register error:', error);
    if (error.code === '23505') {
      res.status(400).json({ error: 'Email or username already exists' });
    } else {
      res.status(500).json({ error: 'Registration failed' });
    }
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (!result.rows[0]) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const valid = await bcrypt.compare(password, result.rows[0].password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { userId: result.rows[0].id },
      process.env.JWT_SECRET || 'tamv-secret-key',
      { expiresIn: '7d' }
    );

    const user = {
      id: result.rows[0].id,
      email: result.rows[0].email,
      username: result.rows[0].username,
      avatar: result.rows[0].avatar,
    };

    res.json({ user, token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// USER ROUTES
app.get('/api/users/me', authMiddleware, (req, res) => {
  res.json(req.user);
});

app.get('/api/users/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, email, username, avatar, created_at FROM users WHERE id = $1',
      [req.params.id]
    );

    if (!result.rows[0]) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// POST ROUTES
app.get('/api/posts/feed', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;

    const result = await pool.query(
      `
      SELECT 
        p.id, p.content, p.media_url, p.likes_count, p.created_at,
        u.id as user_id, u.username, u.avatar
      FROM posts p
      JOIN users u ON p.user_id = u.id
      ORDER BY p.created_at DESC
      LIMIT $1 OFFSET $2
    `,
      [limit, offset]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get feed error:', error);
    res.status(500).json({ error: 'Failed to get feed' });
  }
});

app.post('/api/posts', authMiddleware, async (req, res) => {
  try {
    const { content, media_url } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const result = await pool.query(
      'INSERT INTO posts (user_id, content, media_url) VALUES ($1, $2, $3) RETURNING *',
      [req.user.id, content, media_url || null]
    );

    const post = {
      ...result.rows[0],
      user_id: req.user.id,
      username: req.user.username,
      avatar: req.user.avatar,
    };

    res.json(post);
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

app.post('/api/posts/:id/like', authMiddleware, async (req, res) => {
  try {
    await pool.query('BEGIN');

    // Insert like
    await pool.query(
      'INSERT INTO likes (user_id, post_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [req.user.id, req.params.id]
    );

    // Update count
    await pool.query('UPDATE posts SET likes_count = likes_count + 1 WHERE id = $1', [
      req.params.id,
    ]);

    await pool.query('COMMIT');

    res.json({ success: true });
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Like error:', error);
    res.status(500).json({ error: 'Failed to like post' });
  }
});

app.delete('/api/posts/:id/like', authMiddleware, async (req, res) => {
  try {
    await pool.query('BEGIN');

    // Delete like
    await pool.query('DELETE FROM likes WHERE user_id = $1 AND post_id = $2', [
      req.user.id,
      req.params.id,
    ]);

    // Update count
    await pool.query('UPDATE posts SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = $1', [
      req.params.id,
    ]);

    await pool.query('COMMIT');

    res.json({ success: true });
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Unlike error:', error);
    res.status(500).json({ error: 'Failed to unlike post' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 TAMV Backend running on port ${PORT}`);
  console.log(`📡 Health: http://localhost:${PORT}/health`);
  console.log(`🔐 Auth: http://localhost:${PORT}/api/auth/*`);
  console.log(`📝 Posts: http://localhost:${PORT}/api/posts/*`);
});

module.exports = app;
