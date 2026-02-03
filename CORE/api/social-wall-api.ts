/**
 * TAMV Social Wall API
 * REST endpoints para muro global, superlikes, insignias y DreamSpaces
 * 
 * Integración: Express.js + TypeScript + PostgreSQL + Redis
 */

import express from 'express';
import { body, param, query, validationResult } from 'express-validator';
import {
  Post,
  Comment,
  CommentBadge,
  WalletState,
  TamvProduct,
  DreamspaceUploadPayload,
  FeedContext,
  giveTachido,
  giveTadehuev,
  applyBadgeToComment,
  stakeTgnOnPostByAuthor,
  stakeTgnOnPostByCommunity,
  buyTamvProduct,
  buildGlobalWallFeed,
  createDreamspacePost,
  createComment,
  registerShare,
  getRenderablePostForViewer,
  sortCommentsForDisplay,
} from '../ai/tamv-social-wall.js';

const router = express.Router();

// ============================================================================
// MIDDLEWARE DE VALIDACIÓN Y AUTENTICACIÓN
// ============================================================================

interface AuthenticatedRequest extends express.Request {
  userId?: string;
  userWallet?: WalletState;
  isGuardian?: boolean;
}

// Middleware de autenticación (s