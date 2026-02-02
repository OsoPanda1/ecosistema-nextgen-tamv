/**
 * CGIFTS TAMV - REST API Endpoints
 * Comprehensive API for CGIFTS with XR 3D effects and blockchain integration
 */

import express from 'express';
import { body, param, query, validationResult } from 'express-validator';
import rateLimit from 'express-rate-limit';
import { CGIFTSCore } from '../cgifts-core.js';
import { CGIFTS_CATALOG } from '../cgifts-core.js';

const router = express.Router();

// Rate limiting
const giftRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 gifts per minute
  message: { error: 'Too many gifts sent. Please wait before sending more.' }
});

const auctionRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 auction actions per minute
  message: { error: 'Too many auction actions. Please wait.' }
});

// Initialize CGIFTS Core
let cgiftsCore;

/**
 * Initialize CGIFTS API
 */
export async function initializeCGIFTSAPI(config = {}) {
  cgiftsCore = new CGIFTSCore(config);
  await cgiftsCore.initialize();
  console.log('CGIFTS API initialized');
}

/**
 * Validation middleware
 */
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request data',
        details: errors.array()
      }
    });
  }
  next();
};

/**
 * Authentication middleware (placeholder)
 */
const authenticate = (req, res, next) => {
  // TODO: Implement proper JWT authentication
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication required'
      }
    });
  }
  
  // Mock user for now
  req.user = {
    id: 'user_123',
    username: 'testuser',
    displayName: 'Test User'
  };
  
  next();
};

/**
 * Error handling middleware
 */
const handleError = (error, req, res, next) => {
  console.error('CGIFTS API Error:', error);
  
  if (error.name === 'CGIFTSError') {
    return res.status(error.statusCode).json({
      success: false,
      error: {
        code: error.code,
        message: error.message,
        details: error.metadata
      }
    });
  }
  
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred'
    }
  });
};

// =============================================================================
// GIFT ENDPOINTS
// =============================================================================

/**
 * GET /api/cgifts/gifts
 * Get all available gifts with filtering and pagination
 */
router.get('/gifts', [
  query('category').optional().isIn(['LIGHT', 'EPIC', 'LEGENDARY', 'ULTRA']),
  query('minPrice').optional().isFloat({ min: 0 }),
  query('maxPrice').optional().isFloat({ min: 0 }),
  query('search').optional().isString(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  validateRequest
], async (req, res, next) => {
  try {
    const { category, minPrice, maxPrice, search, page = 1, limit = 20 } = req.query;
    
    let gifts = [];
    
    // Collect all gifts from catalog
    for (const cat of Object.values(CGIFTS_CATALOG)) {
      gifts.push(...cat.gifts);
    }
    
    // Apply filters
    if (category) {
      gifts = gifts.filter(gift => {
        const giftCategory = Object.keys(CGIFTS_CATALOG).find(key =>
          CGIFTS_CATALOG[key].gifts.some(g => g.id === gift.id)
        );
        return giftCategory === category;
      });
    }
    
    if (minPrice) {
      gifts = gifts.filter(gift => gift.price >= parseFloat(minPrice));
    }
    
    if (maxPrice) {
      gifts = gifts.filter(gift => gift.price <= parseFloat(maxPrice));
    }
    
    if (search) {
      const searchLower = search.toLowerCase();
      gifts = gifts.filter(gift => 
        gift.name.toLowerCase().includes(searchLower) ||
        gift.description?.toLowerCase().includes(searchLower)
      );
    }
    
    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedGifts = gifts.slice(startIndex, endIndex);
    
    res.json({
      success: true,
      data: {
        gifts: paginatedGifts,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: gifts.length,
          totalPages: Math.ceil(gifts.length / limit),
          hasNext: endIndex < gifts.length,
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/cgifts/gifts/:id
 * Get specific gift by ID
 */
router.get('/gifts/:id', [
  param('id').isString().notEmpty(),
  validateRequest
], async (req, res, next) => {
  try {
    const { id } = req.params;
    const gift = cgiftsCore.findGiftById(id);
    
    if (!gift) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'GIFT_NOT_FOUND',
          message: `Gift with ID ${id} not found`
        }
      });
    }
    
    res.json({
      success: true,
      data: gift
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/cgifts/gifts/trending
 * Get trending gifts
 */
router.get('/gifts/trending', [
  query('limit').optional().isInt({ min: 1, max: 50 }),
  validateRequest
], async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;
    const stats = cgiftsCore.getGiftStatistics();
    const trending = stats.popularGifts.slice(0, parseInt(limit));
    
    res.json({
      success: true,
      data: trending
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/cgifts/gifts/send
 * Send a gift to another user
 */
router.post('/gifts/send', [
  authenticate,
  giftRateLimit,
  body('giftId').isString().notEmpty(),
  body('recipientId').isString().notEmpty(),
  body('roomId').optional().isString(),
  body('message').optional().isString().isLength({ max: 500 }),
  body('position').optional().isObject(),
  body('position.x').optional().isFloat(),
  body('position.y').optional().isFloat(),
  body('position.z').optional().isFloat(),
  body('intensity').optional().isFloat({ min: 0, max: 2 }),
  validateRequest
], async (req, res, next) => {
  try {
    const { giftId, recipientId, roomId, message, position, intensity } = req.body;
    const sender = req.user;
    
    // Validate gift exists
    const gift = cgiftsCore.findGiftById(giftId);
    if (!gift) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'GIFT_NOT_FOUND',
          message: `Gift with ID ${giftId} not found`
        }
      });
    }
    
    // Send gift
    const transaction = await cgiftsCore.sendGift(giftId, sender.id, recipientId, {
      roomId,
      message,
      position: position ? new THREE.Vector3(position.x, position.y, position.z) : undefined,
      intensity
    });
    
    res.json({
      success: true,
      data: transaction
    });
  } catch (error) {
    next(error);
  }
});

// =============================================================================
// AUCTION ENDPOINTS
// =============================================================================

/**
 * GET /api/cgifts/auctions
 * Get active auctions
 */
router.get('/auctions', [
  query('status').optional().isIn(['active', 'completed', 'cancelled']),
  query('giftId').optional().isString(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  validateRequest
], async (req, res, next) => {
  try {
    const { status, giftId, page = 1, limit = 20 } = req.query;
    
    let auctions = Array.from(cgiftsCore.auctionSystem.activeAuctions.values());
    
    // Apply filters
    if (status) {
      auctions = auctions.filter(auction => {
        if (status === 'active') return Date.now() < auction.endTime;
        if (status === 'completed') return Date.now() >= auction.endTime;
        return false;
      });
    }
    
    if (giftId) {
      auctions = auctions.filter(auction => auction.giftId === giftId);
    }
    
    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedAuctions = auctions.slice(startIndex, endIndex);
    
    res.json({
      success: true,
      data: {
        auctions: paginatedAuctions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: auctions.length,
          totalPages: Math.ceil(auctions.length / limit),
          hasNext: endIndex < auctions.length,
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/cgifts/auctions/:id
 * Get specific auction by ID
 */
router.get('/auctions/:id', [
  param('id').isString().notEmpty(),
  validateRequest
], async (req, res, next) => {
  try {
    const { id } = req.params;
    const auction = cgiftsCore.auctionSystem.activeAuctions.get(id);
    
    if (!auction) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'AUCTION_NOT_FOUND',
          message: `Auction with ID ${id} not found`
        }
      });
    }
    
    res.json({
      success: true,
      data: auction
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/cgifts/auctions
 * Create a new auction (Mini Anubis Ultra only)
 */
router.post('/auctions', [
  authenticate,
  auctionRateLimit,
  body('giftId').isString().notEmpty(),
  body('startingBid').isFloat({ min: 1 }),
  body('duration').isInt({ min: 3600000, max: 604800000 }), // 1 hour to 1 week
  body('description').optional().isString().isLength({ max: 1000 }),
  validateRequest
], async (req, res, next) => {
  try {
    const { giftId, startingBid, duration, description } = req.body;
    const creator = req.user;
    
    // Validate gift exists and is auctionable
    const gift = cgiftsCore.findGiftById(giftId);
    if (!gift) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'GIFT_NOT_FOUND',
          message: `Gift with ID ${giftId} not found`
        }
      });
    }
    
    if (!gift.auction) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'GIFT_NOT_AUCTIONABLE',
          message: 'This gift cannot be auctioned'
        }
      });
    }
    
    // Create auction
    const auction = await cgiftsCore.auctionSystem.createAuction(giftId, startingBid, duration);
    auction.creator = creator.id;
    auction.description = description;
    
    res.json({
      success: true,
      data: auction
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/cgifts/auctions/:id/bid
 * Place a bid on an auction
 */
router.post('/auctions/:id/bid', [
  authenticate,
  auctionRateLimit,
  param('id').isString().notEmpty(),
  body('amount').isFloat({ min: 1 }),
  validateRequest
], async (req, res, next) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;
    const bidder = req.user;
    
    const auction = await cgiftsCore.auctionSystem.placeBid(id, bidder.id, amount);
    
    res.json({
      success: true,
      data: auction
    });
  } catch (error) {
    next(error);
  }
});

// =============================================================================
// USER ENDPOINTS
// =============================================================================

/**
 * GET /api/cgifts/users/me
 * Get current user profile
 */
router.get('/users/me', [
  authenticate
], async (req, res, next) => {
  try {
    const user = req.user;
    
    // TODO: Fetch full user data from database
    const userData = {
      ...user,
      statistics: {
        giftsSent: cgiftsCore.giftHistory.filter(g => g.sender === user.id).length,
        giftsReceived: cgiftsCore.giftHistory.filter(g => g.recipient === user.id).length,
        totalSpent: cgiftsCore.giftHistory
          .filter(g => g.sender === user.id)
          .reduce((sum, g) => {
            const gift = cgiftsCore.findGiftById(g.giftId);
            return sum + (gift ? gift.price : 0);
          }, 0)
      }
    };
    
    res.json({
      success: true,
      data: userData
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/cgifts/users/me/transactions
 * Get user's gift transactions
 */
router.get('/users/me/transactions', [
  authenticate,
  query('type').optional().isIn(['sent', 'received', 'all']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  validateRequest
], async (req, res, next) => {
  try {
    const { type = 'all', page = 1, limit = 20 } = req.query;
    const user = req.user;
    
    let transactions = cgiftsCore.giftHistory;
    
    // Filter by type
    if (type === 'sent') {
      transactions = transactions.filter(t => t.sender === user.id);
    } else if (type === 'received') {
      transactions = transactions.filter(t => t.recipient === user.id);
    } else {
      transactions = transactions.filter(t => t.sender === user.id || t.recipient === user.id);
    }
    
    // Sort by timestamp (newest first)
    transactions.sort((a, b) => b.timestamp - a.timestamp);
    
    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedTransactions = transactions.slice(startIndex, endIndex);
    
    res.json({
      success: true,
      data: {
        transactions: paginatedTransactions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: transactions.length,
          totalPages: Math.ceil(transactions.length / limit),
          hasNext: endIndex < transactions.length,
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/cgifts/users/me/recommendations
 * Get gift recommendations for user
 */
router.get('/users/me/recommendations', [
  authenticate,
  query('recipientId').optional().isString(),
  query('roomId').optional().isString(),
  query('limit').optional().isInt({ min: 1, max: 20 }),
  validateRequest
], async (req, res, next) => {
  try {
    const { recipientId, roomId, limit = 5 } = req.query;
    const user = req.user;
    
    const recommendations = await cgiftsCore.getGiftRecommendations(user.id, recipientId, {
      roomId,
      limit: parseInt(limit)
    });
    
    res.json({
      success: true,
      data: recommendations
    });
  } catch (error) {
    next(error);
  }
});

// =============================================================================
// ANALYTICS ENDPOINTS
// =============================================================================

/**
 * GET /api/cgifts/analytics/overview
 * Get general analytics overview
 */
router.get('/analytics/overview', [
  authenticate,
  query('timeframe').optional().isIn(['hour', 'day', 'week', 'month']),
  validateRequest
], async (req, res, next) => {
  try {
    const { timeframe = 'day' } = req.query;
    const stats = cgiftsCore.getGiftStatistics();
    
    // TODO: Implement proper time-based analytics
    const analytics = {
      timeframe,
      totalGifts: stats.totalGiftsSent,
      totalValue: stats.totalValue,
      activeEffects: stats.activeEffects,
      activeAuctions: stats.activeAuctions,
      popularGifts: stats.popularGifts,
      generatedAt: new Date().toISOString()
    };
    
    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    next(error);
  }
});

// =============================================================================
// WEBSOCKET ENDPOINTS
// =============================================================================

/**
 * WebSocket connection handler
 */
export function setupWebSocket(io) {
  io.on('connection', (socket) => {
    console.log('CGIFTS WebSocket connected:', socket.id);
    
    // Join room
    socket.on('join_room', (roomId) => {
      socket.join(roomId);
      socket.to(roomId).emit('user_joined', { userId: socket.userId });
    });
    
    // Leave room
    socket.on('leave_room', (roomId) => {
      socket.leave(roomId);
      socket.to(roomId).emit('user_left', { userId: socket.userId });
    });
    
    // Handle gift events
    socket.on('gift_sent', (data) => {
      socket.to(data.roomId).emit('gift_received', data);
    });
    
    // Handle auction events
    socket.on('bid_placed', (data) => {
      socket.to(`auction_${data.auctionId}`).emit('auction_updated', data);
    });
    
    socket.on('disconnect', () => {
      console.log('CGIFTS WebSocket disconnected:', socket.id);
    });
  });
  
  // Subscribe to CGIFTS events
  cgiftsCore.subscribe((eventType, data) => {
    switch (eventType) {
      case 'gift_sent':
        if (data.roomId) {
          io.to(data.roomId).emit('gift_sent', data);
        }
        break;
      case 'bid_placed':
        io.to(`auction_${data.auction.id}`).emit('bid_placed', data);
        break;
    }
  });
}

// Apply error handling middleware
router.use(handleError);

export default router;