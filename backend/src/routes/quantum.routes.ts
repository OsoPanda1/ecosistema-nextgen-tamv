/**
 * Quantum Computing Routes
 * API endpoints for quantum computing operations in TAMV Online
 */

import { Router } from 'express';
import * as quantumController from '../controllers/quantum.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validation.middleware';
import {
  createCircuitSchema,
  addGateSchema,
  executeCircuitSchema,
  quantumProcessingSchema,
  quantumEncryptionSchema,
  quantumMLSchema,
} from '../utils/validation';

const router = Router();

/**
 * GET /api/v1/quantum/health
 * Check quantum engine health
 */
router.get('/health', quantumController.healthCheck);

/**
 * POST /api/v1/quantum/circuits
 * Create a new quantum circuit
 */
router.post(
  '/circuits',
  authMiddleware,
  validateBody(createCircuitSchema),
  quantumController.createCircuitHandler
);

/**
 * GET /api/v1/quantum/circuits/:id
 * Get quantum circuit by ID
 */
router.get('/circuits/:id', authMiddleware, quantumController.getCircuitHandler);

/**
 * POST /api/v1/quantum/circuits/:id/gates
 * Add a quantum gate to a circuit
 */
router.post(
  '/circuits/:id/gates',
  authMiddleware,
  validateBody(addGateSchema),
  quantumController.addGateHandler
);

/**
 * POST /api/v1/quantum/circuits/:id/execute
 * Execute a quantum circuit
 */
router.post(
  '/circuits/:id/execute',
  authMiddleware,
  validateBody(executeCircuitSchema),
  quantumController.executeCircuitHandler
);

/**
 * GET /api/v1/quantum/results/:id
 * Get quantum execution result by ID
 */
router.get('/results/:id', authMiddleware, quantumController.getResultHandler);

/**
 * POST /api/v1/quantum/process
 * Quantum-enhanced data processing
 */
router.post(
  '/process',
  authMiddleware,
  validateBody(quantumProcessingSchema),
  quantumController.quantumProcessingHandler
);

/**
 * POST /api/v1/quantum/encrypt
 * Quantum-enhanced encryption
 */
router.post(
  '/encrypt',
  authMiddleware,
  validateBody(quantumEncryptionSchema),
  quantumController.quantumEncryptHandler
);

/**
 * POST /api/v1/quantum/decrypt
 * Quantum-enhanced decryption
 */
router.post(
  '/decrypt',
  authMiddleware,
  validateBody(quantumEncryptionSchema),
  quantumController.quantumDecryptHandler
);

/**
 * GET /api/v1/quantum/random
 * Quantum random number generation
 */
router.get('/random', authMiddleware, quantumController.quantumRandomHandler);

/**
 * POST /api/v1/quantum/ml/predict
 * Quantum-enhanced machine learning prediction
 */
router.post(
  '/ml/predict',
  authMiddleware,
  validateBody(quantumMLSchema),
  quantumController.quantumMLPredictHandler
);

/**
 * GET /api/v1/quantum/stats
 * Get quantum engine statistics
 */
router.get('/stats', authMiddleware, quantumController.getQuantumStatsHandler);

export default router;
