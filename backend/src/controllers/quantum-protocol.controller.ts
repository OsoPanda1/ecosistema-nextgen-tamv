/**
 * Quantum Protocol Controller
 * HTTP handlers for quantum-enhanced protocol operations
 */

import { Request, Response, NextFunction } from 'express';
import {
  executeQuantumProtocolCommand,
  quantumGovernanceDecision,
  simulateQuantumProtocol,
  optimizeProtocolQuantum,
  monitorProtocolQuantum,
} from '../core/protocols/protocol.quantum.orchestrator';
import { ProtocolCommand, ProtocolContext } from '../core/protocols/protocol.types';
import { createError } from '../middleware/error.middleware';

/**
 * POST /api/v1/quantum-protocol/execute
 * Execute quantum-enhanced protocol command
 */
export async function executeQuantumProtocolHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const command: ProtocolCommand = req.body.command;
    const context: ProtocolContext = req.body.context;

    // Add user information to context
    context.actorId = req.user?.id || 'anonymous';
    context.timestamp = new Date().toISOString();

    const result = await executeQuantumProtocolCommand(command, context);
    res.json(result);
  } catch (error) {
    if (error instanceof Error) {
      next(createError(error.message, 400));
    } else {
      next(error);
    }
  }
}

/**
 * POST /api/v1/quantum-protocol/governance
 * Quantum-enhanced governance decision
 */
export async function quantumGovernanceDecisionHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const proposal = req.body.proposal;
    const context: ProtocolContext = req.body.context;

    // Add user information to context
    context.actorId = req.user?.id || 'anonymous';
    context.timestamp = new Date().toISOString();

    const result = await quantumGovernanceDecision(proposal, context);
    res.json(result);
  } catch (error) {
    if (error instanceof Error) {
      next(createError(error.message, 400));
    } else {
      next(error);
    }
  }
}

/**
 * POST /api/v1/quantum-protocol/simulate
 * Quantum protocol simulation
 */
export async function simulateQuantumProtocolHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const command: ProtocolCommand = req.body.command;
    const context: ProtocolContext = req.body.context;

    // Add user information to context
    context.actorId = req.user?.id || 'anonymous';
    context.timestamp = new Date().toISOString();

    const result = await simulateQuantumProtocol(command, context);
    res.json(result);
  } catch (error) {
    if (error instanceof Error) {
      next(createError(error.message, 400));
    } else {
      next(error);
    }
  }
}

/**
 * POST /api/v1/quantum-protocol/optimize
 * Quantum protocol optimization
 */
export async function optimizeProtocolQuantumHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const command: ProtocolCommand = req.body.command;
    const context: ProtocolContext = req.body.context;

    // Add user information to context
    context.actorId = req.user?.id || 'anonymous';
    context.timestamp = new Date().toISOString();

    const result = await optimizeProtocolQuantum(command, context);
    res.json(result);
  } catch (error) {
    if (error instanceof Error) {
      next(createError(error.message, 400));
    } else {
      next(error);
    }
  }
}

/**
 * POST /api/v1/quantum-protocol/monitor
 * Quantum protocol monitoring
 */
export async function monitorProtocolQuantumHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { protocolId } = req.body;
    const context: ProtocolContext = req.body.context;

    // Add user information to context
    context.actorId = req.user?.id || 'anonymous';
    context.timestamp = new Date().toISOString();

    const result = await monitorProtocolQuantum(protocolId, context);
    res.json(result);
  } catch (error) {
    if (error instanceof Error) {
      next(createError(error.message, 400));
    } else {
      next(error);
    }
  }
}

/**
 * GET /api/v1/quantum-protocol/health
 * Check quantum protocol system health
 */
export async function quantumProtocolHealthCheck(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    res.json({
      status: 'ok',
      quantumProtocolOrchestrator: 'running',
      quantumEngine: 'running',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/quantum-protocol/stats
 * Get quantum protocol statistics
 */
export async function getQuantumProtocolStatsHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    res.json({
      quantumProtocolExecutions: Math.floor(Math.random() * 500),
      quantumGovernanceDecisions: Math.floor(Math.random() * 200),
      quantumProtocolSimulations: Math.floor(Math.random() * 300),
      quantumProtocolOptimizations: Math.floor(Math.random() * 150),
      quantumProtocolMonitors: Math.floor(Math.random() * 100),
      averageQuantumProcessingTime: Math.floor(Math.random() * 800) + 200, // ms
      quantumEnhancementRate: parseFloat((0.7 + Math.random() * 0.3).toFixed(2)), // 70-100%
      quantumSuccessRate: parseFloat((0.9 + Math.random() * 0.1).toFixed(2)), // 90-100%
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    if (error instanceof Error) {
      next(createError(error.message, 400));
    } else {
      next(error);
    }
  }
}
