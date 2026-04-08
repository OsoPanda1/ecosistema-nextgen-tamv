/**
 * Quantum Protocol Routes
 * API endpoints for quantum-enhanced protocol operations
 */

import { Router } from 'express';
import * as quantumProtocolController from '../controllers/quantum-protocol.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validation.middleware';
import {
  protocolCommandSchema,
  governanceProposalSchema,
  protocolSimulationSchema,
  protocolOptimizationSchema,
  protocolMonitoringSchema,
} from '../utils/validation';

const router = Router();

/**
 * POST /api/v1/quantum-protocol/execute
 * Execute quantum-enhanced protocol command
 */
router.post(
  '/execute',
  authMiddleware,
  validateBody(protocolCommandSchema),
  quantumProtocolController.executeQuantumProtocolHandler
);

/**
 * POST /api/v1/quantum-protocol/governance
 * Quantum-enhanced governance decision
 */
router.post(
  '/governance',
  authMiddleware,
  validateBody(governanceProposalSchema),
  quantumProtocolController.quantumGovernanceDecisionHandler
);

/**
 * POST /api/v1/quantum-protocol/simulate
 * Quantum protocol simulation
 */
router.post(
  '/simulate',
  authMiddleware,
  validateBody(protocolSimulationSchema),
  quantumProtocolController.simulateQuantumProtocolHandler
);

/**
 * POST /api/v1/quantum-protocol/optimize
 * Quantum protocol optimization
 */
router.post(
  '/optimize',
  authMiddleware,
  validateBody(protocolOptimizationSchema),
  quantumProtocolController.optimizeProtocolQuantumHandler
);

/**
 * POST /api/v1/quantum-protocol/monitor
 * Quantum protocol monitoring
 */
router.post(
  '/monitor',
  authMiddleware,
  validateBody(protocolMonitoringSchema),
  quantumProtocolController.monitorProtocolQuantumHandler
);

/**
 * GET /api/v1/quantum-protocol/health
 * Check quantum protocol system health
 */
router.get('/health', quantumProtocolController.quantumProtocolHealthCheck);

/**
 * GET /api/v1/quantum-protocol/stats
 * Get quantum protocol statistics
 */
router.get('/stats', authMiddleware, quantumProtocolController.getQuantumProtocolStatsHandler);

export default router;
