/**
 * TAMVAI-Isabella API Server
 * Sovereign AI Infrastructure - OpenAI-Compatible Endpoints
 * 
 * Features:
 * - OpenAI-compatible REST API
 * - Isabella Core cognitive orchestration
 * - TGN governance integration
 * - Multi-tenant support with quotas
 * - Complete audit trail for AI Act/GDPR compliance
 * - Ethical guardrails and explainability
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
require('dotenv').config();

const { IsabellaCore } = require('./isabella-core');
const { TGNGovernance } = require('./tgn-governance');
const { AuthMiddleware } = require('./middleware/auth');
const { QuotaManager } = require('./middleware/quota');
const { AuditLogger } = require('./middleware/audit');

const app = express();
const PORT = process.env.TAMVAI_PORT || 7000;

// Initialize core systems
let isabellaCore;
let tgnGovernance;
let quotaManager;
let auditLogger;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['*'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(morgan('combined'));

// Rate limiting per tenant
const createRateLimiter = (windowMs, max) => rateLimit({
  windowMs,
  max,
  keyGenerator: (req) => req.tenant?.id || req.ip,
  handler: (req, res) => {
    res.status(429).json({
      error: {
        message: 'Rate limit exceeded',
        type: 'rate_limit_error',
        code: 'rate_limit_exceeded'
      }
    });
  }
});

// Apply rate limiting
app.use('/v1/chat/completions', createRateLimiter(60000, 60)); // 60 req/min
app.use('/v1/completions', createRateLimiter(60000, 60));
app.use('/v1/embeddings', createRateLimiter(60000, 100));

// Initialize systems
async function initializeSystems() {
  try {
    console.log('Initializing TAMVAI-Isabella systems...');
    
    isabellaCore = new IsabellaCore({
      modelBackend: process.env.MODEL_BACKEND || 'ollama',
      modelName: process.env.MODEL_NAME || 'llama3.1:8b',
      ethicalMode: process.env.ETHICAL_MODE || 'strict',
      explanationLevel: process.env.EXPLANATION_LEVEL || 'detailed'
    });
    
    tgnGovernance = new TGNGovernance({
      enabled: process.env.TGN_ENABLED !== 'false',
      governanceEndpoint: process.env.TGN_ENDPOINT
    });
    
    quotaManager = new QuotaManager({
      redisUrl: process.env.REDIS_URL,
      defaultQuota: parseInt(process.env.DEFAULT_QUOTA || '10000')
    });
    
    auditLogger = new AuditLogger({
      bookpiEndpoint: process.env.BOOKPI_ENDPOINT,
      enabled: process.env.AUDIT_ENABLED !== 'false'
    });
    
    await isabellaCore.initialize();
    await tgnGovernance.initialize();
    await quotaManager.initialize();
    await auditLogger.initialize();
    
    console.log('✅ TAMVAI-Isabella initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize TAMVAI-Isabella:', error);
    throw error;
  }
}

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'tamvai-isabella',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    components: {
      isabella: isabellaCore?.isReady() || false,
      tgn: tgnGovernance?.isReady() || false,
      quota: quotaManager?.isReady() || false,
      audit: auditLogger?.isReady() || false
    }
  });
});

// List available models
app.get('/v1/models', AuthMiddleware, async (req, res) => {
  try {
    const models = await isabellaCore.listAvailableModels();
    
    res.json({
      object: 'list',
      data: models.map(model => ({
        id: model.id,
        object: 'model',
        created: model.created,
        owned_by: 'tamv',
        permission: [],
        root: model.id,
        parent: null
      }))
    });
  } catch (error) {
    console.error('Error listing models:', error);
    res.status(500).json({
      error: {
        message: 'Failed to list models',
        type: 'internal_error',
        code: 'model_list_error'
      }
    });
  }
});

// Chat completions endpoint
app.post('/v1/chat/completions',
  AuthMiddleware,
  QuotaManager.checkQuota,
  [
    body('model').notEmpty().withMessage('Model is required'),
    body('messages').isArray({ min: 1 }).withMessage('Messages must be a non-empty array'),
    body('messages.*.role').isIn(['system', 'user', 'assistant']).withMessage('Invalid message role'),
    body('messages.*.content').notEmpty().withMessage('Message content is required'),
    body('temperature').optional().isFloat({ min: 0, max: 2 }),
    body('max_tokens').optional().isInt({ min: 1, max: 32000 }),
    body('stream').optional().isBoolean()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: {
          message: 'Invalid request parameters',
          type: 'invalid_request_error',
          code: 'validation_error',
          details: errors.array()
        }
      });
    }

    const {
      model,
      messages,
      temperature = 0.7,
      max_tokens = 2000,
      top_p = 1.0,
      frequency_penalty = 0,
      presence_penalty = 0,
      stream = false,
      user
    } = req.body;

    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const startTime = Date.now();

    try {
      // Build request context
      const context = {
        requestId,
        tenant: req.tenant,
        user: req.user,
        jurisdiction: req.tenant?.jurisdiction || 'EU',
        safetyProfile: req.tenant?.safetyProfile || 'standard',
        contextScope: req.tenant?.contextScope || ['public_docs'],
        dataUsage: req.tenant?.dataUsage || 'no_training'
      };

      // Log request for audit
      await auditLogger.logRequest({
        requestId,
        tenantId: req.tenant.id,
        userId: req.user?.id,
        endpoint: '/v1/chat/completions',
        model,
        messageCount: messages.length,
        parameters: { temperature, max_tokens, top_p }
      });

      // Process through Isabella Core
      const response = await isabellaCore.processChatCompletion({
        model,
        messages,
        temperature,
        max_tokens,
        top_p,
        frequency_penalty,
        presence_penalty,
        stream,
        context
      });

      // Handle streaming response
      if (stream) {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        for await (const chunk of response.stream) {
          const data = {
            id: requestId,
            object: 'chat.completion.chunk',
            created: Math.floor(startTime / 1000),
            model: model,
            choices: [{
              index: 0,
              delta: chunk.delta,
              finish_reason: chunk.finish_reason || null
            }]
          };
          
          res.write(`data: ${JSON.stringify(data)}\n\n`);
        }
        
        res.write('data: [DONE]\n\n');
        res.end();
      } else {
        // Non-streaming response
        const completionResponse = {
          id: requestId,
          object: 'chat.completion',
          created: Math.floor(startTime / 1000),
          model: model,
          choices: [{
            index: 0,
            message: {
              role: 'assistant',
              content: response.content
            },
            finish_reason: response.finish_reason || 'stop'
          }],
          usage: {
            prompt_tokens: response.usage.prompt_tokens,
            completion_tokens: response.usage.completion_tokens,
            total_tokens: response.usage.total_tokens
          },
          // Isabella-specific metadata
          isabella_metadata: {
            ethical_check: response.ethical_check,
            risk_score: response.risk_score,
            explanation_level: context.safetyProfile,
            processing_time_ms: Date.now() - startTime,
            model_backend: response.model_backend
          }
        };

        // Update quota
        await quotaManager.updateUsage(req.tenant.id, response.usage.total_tokens);

        // Log response for audit
        await auditLogger.logResponse({
          requestId,
          tenantId: req.tenant.id,
          statusCode: 200,
          tokensUsed: response.usage.total_tokens,
          processingTime: Date.now() - startTime,
          ethicalCheck: response.ethical_check
        });

        res.json(completionResponse);
      }
    } catch (error) {
      console.error('Chat completion error:', error);
      
      await auditLogger.logError({
        requestId,
        tenantId: req.tenant?.id,
        error: error.message,
        stack: error.stack
      });

      res.status(error.statusCode || 500).json({
        error: {
          message: error.message || 'Internal server error',
          type: error.type || 'internal_error',
          code: error.code || 'processing_error'
        }
      });
    }
  }
);

// Text completions endpoint
app.post('/v1/completions',
  AuthMiddleware,
  QuotaManager.checkQuota,
  [
    body('model').notEmpty().withMessage('Model is required'),
    body('prompt').notEmpty().withMessage('Prompt is required'),
    body('temperature').optional().isFloat({ min: 0, max: 2 }),
    body('max_tokens').optional().isInt({ min: 1, max: 32000 })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: {
          message: 'Invalid request parameters',
          type: 'invalid_request_error',
          code: 'validation_error',
          details: errors.array()
        }
      });
    }

    const {
      model,
      prompt,
      temperature = 0.7,
      max_tokens = 2000,
      top_p = 1.0,
      stream = false
    } = req.body;

    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const startTime = Date.now();

    try {
      const context = {
        requestId,
        tenant: req.tenant,
        user: req.user,
        jurisdiction: req.tenant?.jurisdiction || 'EU',
        safetyProfile: req.tenant?.safetyProfile || 'standard'
      };

      await auditLogger.logRequest({
        requestId,
        tenantId: req.tenant.id,
        endpoint: '/v1/completions',
        model,
        promptLength: prompt.length
      });

      const response = await isabellaCore.processCompletion({
        model,
        prompt,
        temperature,
        max_tokens,
        top_p,
        stream,
        context
      });

      if (stream) {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        for await (const chunk of response.stream) {
          const data = {
            id: requestId,
            object: 'text_completion',
            created: Math.floor(startTime / 1000),
            model: model,
            choices: [{
              text: chunk.text,
              index: 0,
              finish_reason: chunk.finish_reason || null
            }]
          };
          
          res.write(`data: ${JSON.stringify(data)}\n\n`);
        }
        
        res.write('data: [DONE]\n\n');
        res.end();
      } else {
        const completionResponse = {
          id: requestId,
          object: 'text_completion',
          created: Math.floor(startTime / 1000),
          model: model,
          choices: [{
            text: response.text,
            index: 0,
            finish_reason: response.finish_reason || 'stop'
          }],
          usage: {
            prompt_tokens: response.usage.prompt_tokens,
            completion_tokens: response.usage.completion_tokens,
            total_tokens: response.usage.total_tokens
          }
        };

        await quotaManager.updateUsage(req.tenant.id, response.usage.total_tokens);
        await auditLogger.logResponse({
          requestId,
          tenantId: req.tenant.id,
          statusCode: 200,
          tokensUsed: response.usage.total_tokens
        });

        res.json(completionResponse);
      }
    } catch (error) {
      console.error('Completion error:', error);
      
      await auditLogger.logError({
        requestId,
        tenantId: req.tenant?.id,
        error: error.message
      });

      res.status(error.statusCode || 500).json({
        error: {
          message: error.message || 'Internal server error',
          type: error.type || 'internal_error',
          code: error.code || 'processing_error'
        }
      });
    }
  }
);

// Embeddings endpoint
app.post('/v1/embeddings',
  AuthMiddleware,
  QuotaManager.checkQuota,
  [
    body('model').notEmpty().withMessage('Model is required'),
    body('input').custom((value) => {
      if (typeof value === 'string' || Array.isArray(value)) {
        return true;
      }
      throw new Error('Input must be a string or array of strings');
    })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: {
          message: 'Invalid request parameters',
          type: 'invalid_request_error',
          code: 'validation_error',
          details: errors.array()
        }
      });
    }

    const { model, input } = req.body;
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const startTime = Date.now();

    try {
      const inputs = Array.isArray(input) ? input : [input];
      
      await auditLogger.logRequest({
        requestId,
        tenantId: req.tenant.id,
        endpoint: '/v1/embeddings',
        model,
        inputCount: inputs.length
      });

      const response = await isabellaCore.generateEmbeddings({
        model,
        inputs,
        context: {
          requestId,
          tenant: req.tenant,
          user: req.user
        }
      });

      const embeddingResponse = {
        object: 'list',
        data: response.embeddings.map((embedding, index) => ({
          object: 'embedding',
          embedding: embedding,
          index: index
        })),
        model: model,
        usage: {
          prompt_tokens: response.usage.prompt_tokens,
          total_tokens: response.usage.total_tokens
        }
      };

      await quotaManager.updateUsage(req.tenant.id, response.usage.total_tokens);
      await auditLogger.logResponse({
        requestId,
        tenantId: req.tenant.id,
        statusCode: 200,
        tokensUsed: response.usage.total_tokens
      });

      res.json(embeddingResponse);
    } catch (error) {
      console.error('Embeddings error:', error);
      
      await auditLogger.logError({
        requestId,
        tenantId: req.tenant?.id,
        error: error.message
      });

      res.status(error.statusCode || 500).json({
        error: {
          message: error.message || 'Internal server error',
          type: error.type || 'internal_error',
          code: error.code || 'embedding_error'
        }
      });
    }
  }
);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: {
      message: 'Internal server error',
      type: 'internal_error',
      code: 'unhandled_error'
    }
  });
});

// Start server
async function startServer() {
  try {
    await initializeSystems();
    
    app.listen(PORT, () => {
      console.log(`🚀 TAMVAI-Isabella API running on port ${PORT}`);
      console.log(`📡 Health check: http://localhost:${PORT}/health`);
      console.log(`🤖 Models endpoint: http://localhost:${PORT}/v1/models`);
      console.log(`💬 Chat completions: http://localhost:${PORT}/v1/chat/completions`);
      console.log(`📝 Completions: http://localhost:${PORT}/v1/completions`);
      console.log(`🔢 Embeddings: http://localhost:${PORT}/v1/embeddings`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  await isabellaCore?.shutdown();
  await tgnGovernance?.shutdown();
  await quotaManager?.shutdown();
  await auditLogger?.shutdown();
  process.exit(0);
});

// Start the server
if (require.main === module) {
  startServer();
}

module.exports = { app, initializeSystems };