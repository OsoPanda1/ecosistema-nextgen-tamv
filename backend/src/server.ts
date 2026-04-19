/**
 * TAMV Backend Server
 * Main Express application
 */

import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import pool from './config/database';

// Routes
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import postRoutes from './routes/post.routes';
import feedRoutes from './routes/feed.routes';
import identityRoutes from './routes/identity.routes';
import msrRoutes from './routes/msr.routes';
import governanceRoutes from './routes/governance.routes';
import protocolRoutes from './routes/protocol.routes';
import bookpiRoutes from './routes/bookpi.routes';
import eoctRoutes from './routes/eoct.routes';
import isabellaRoutes from './routes/isabella.routes';
import xrRoutes from './routes/xr.routes';
import dreamspacesRoutes from './routes/dreamspaces.routes';
import economyRoutes from './routes/economy.routes';
import quantumRoutes from './routes/quantum.routes';
import quantumProtocolRoutes from './routes/quantum-protocol.routes';

// Middleware
import { errorHandler, notFoundHandler } from './middleware/error.middleware';

const app: Application = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
  })
);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/posts', postRoutes);
app.use('/api/v1/feed', feedRoutes);
app.use('/api/v1/identity', identityRoutes);
app.use('/api/v1/msr', msrRoutes);
app.use('/api/v1/governance', governanceRoutes);
app.use('/api/v1/protocols', protocolRoutes);
app.use('/api/v1/bookpi', bookpiRoutes);
app.use('/api/v1/eoct', eoctRoutes);
app.use('/api/v1/isabella', isabellaRoutes);
app.use('/api/v1/xr', xrRoutes);
app.use('/api/v1/dreamspaces', dreamspacesRoutes);
app.use('/api/v1/economy', economyRoutes);
app.use('/api/v1/quantum', quantumRoutes);
app.use('/api/v1/quantum-protocol', quantumProtocolRoutes);

// 404 handler
app.use(notFoundHandler);

// Error handler
app.use(errorHandler);

// Start server
async function startServer() {
  try {
    // Test database connection
    await pool.query('SELECT NOW()');
    console.log('✅ Database connection established');

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 API: http://localhost:${PORT}/api/v1`);
      console.log(`💚 Health: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  await pool.end();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully...');
  await pool.end();
  process.exit(0);
});

startServer();

export default app;
