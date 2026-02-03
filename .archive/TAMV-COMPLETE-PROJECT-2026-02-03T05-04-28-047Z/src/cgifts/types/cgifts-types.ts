/**
 * CGIFTS TAMV - TypeScript Type Definitions
 * Comprehensive type system for CGIFTS with XR 3D effects
 */

export interface CGIFTSGift {
  id: string;
  name: string;
  price: number;
  currency: 'USD' | 'MXN' | 'MSR';
  effect: string;
  category: 'LIGHT' | 'EPIC' | 'LEGENDARY' | 'ULTRA';
  special?: boolean;
  auction?: boolean;
  limited?: boolean;
  description?: string;
  metadata?: {
    rarity: number;
    effectDuration: number;
    particleCount: number;
    shaderComplexity: 'low' | 'medium' | 'high' | 'ultra';
  };
}

export interface CGIFTSTransaction {
  id: string;
  giftId: string;
  sender: string;
  recipient: string;
  amount: number;
  currency: string;
  timestamp: number;
  effect: string;
  effectId?: string;
  status: 'pending' | 'active' | 'completed' | 'failed';
  blockchainTxHash?: string;
  metadata?: {
    position?: Vector3D;
    intensity?: number;
    customization?: Record<string, any>;
  };
}

export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

export interface CGIFTSAuction {
  id: string;
  giftId: string;
  startingBid: number;
  currentBid: number;
  highestBidder: string | null;
  startTime: number;
  endTime: number;
  status: 'active' | 'completed' | 'cancelled';
  bids: CGIFTSBid[];
  metadata?: {
    reservePrice?: number;
    buyNowPrice?: number;
    auctionType: 'standard' | 'dutch' | 'sealed_bid';
  };
}

export interface CGIFTSBid {
  id: string;
  auctionId: string;
  bidder: string;
  amount: number;
  timestamp: number;
  status: 'active' | 'outbid' | 'winning' | 'won';
  blockchainTxHash?: string;
}

export interface CGIFTSEffect {
  id: string;
  name: string;
  type: 'particle' | 'shader' | 'mesh' | 'hybrid';
  complexity: 'low' | 'medium' | 'high' | 'ultra';
  duration: number;
  particleCount?: number;
  shaderUniforms?: Record<string, any>;
  geometryData?: {
    vertices: number[];
    indices: number[];
    uvs: number[];
    normals: number[];
  };
  animationCurves?: {
    intensity: number[];
    scale: number[];
    rotation: number[];
    position: Vector3D[];
  };
}

export interface CGIFTSUser {
  id: string;
  username: string;
  displayName: string;
  avatar?: string;
  preferences: {
    favoriteGifts: string[];
    effectQuality: 'low' | 'medium' | 'high' | 'ultra';
    enableXR: boolean;
    enableHaptics: boolean;
    autoAcceptGifts: boolean;
  };
  statistics: {
    giftsSent: number;
    giftsReceived: number;
    totalSpent: number;
    totalReceived: number;
    favoriteCategory: string;
    auctionsWon: number;
  };
  wallet: {
    balance: number;
    currency: string;
    paymentMethods: PaymentMethod[];
  };
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'crypto' | 'bank' | 'msr_wallet';
  provider: string;
  last4?: string;
  expiryDate?: string;
  isDefault: boolean;
  metadata?: Record<string, any>;
}

export interface CGIFTSRoom {
  id: string;
  name: string;
  type: 'public' | 'private' | 'premium';
  participants: string[];
  activeGifts: CGIFTSTransaction[];
  settings: {
    maxParticipants: number;
    allowGifts: boolean;
    allowAuctions: boolean;
    effectQuality: 'low' | 'medium' | 'high' | 'ultra';
    moderationLevel: 'none' | 'basic' | 'strict';
  };
  xrSpace?: {
    sceneId: string;
    position: Vector3D;
    rotation: Vector3D;
    scale: Vector3D;
  };
}

export interface CGIFTSRecommendation {
  giftId: string;
  confidence: number;
  reason: string;
  category: 'trending' | 'personal' | 'occasion' | 'ai_suggested';
  metadata?: {
    similarUsers?: string[];
    occasionMatch?: string;
    priceRange?: [number, number];
  };
}

export interface CGIFTSAnalytics {
  timeframe: 'hour' | 'day' | 'week' | 'month' | 'year';
  metrics: {
    totalGifts: number;
    totalRevenue: number;
    uniqueUsers: number;
    averageGiftValue: number;
    popularGifts: Array<{
      giftId: string;
      count: number;
      revenue: number;
    }>;
    userEngagement: {
      dailyActiveUsers: number;
      averageSessionTime: number;
      retentionRate: number;
    };
    auctionMetrics: {
      totalAuctions: number;
      averageBidCount: number;
      averageFinalPrice: number;
      completionRate: number;
    };
  };
}

export interface CGIFTSEvent {
  type: 'gift_sent' | 'gift_received' | 'auction_created' | 'bid_placed' | 'auction_won' | 'effect_started' | 'effect_completed';
  timestamp: number;
  userId: string;
  data: Record<string, any>;
  metadata?: {
    roomId?: string;
    sessionId?: string;
    deviceType?: string;
    xrMode?: boolean;
  };
}

export interface CGIFTSConfig {
  enableXR: boolean;
  enable3DEffects: boolean;
  enableBlockchain: boolean;
  enableAuctions: boolean;
  enableAI: boolean;
  maxConcurrentEffects: number;
  effectQuality: 'low' | 'medium' | 'high' | 'ultra';
  renderDistance: number;
  particleBudget: number;
  shaderComplexity: 'low' | 'medium' | 'high' | 'ultra';
  networking: {
    enableRealtime: boolean;
    maxConnections: number;
    compressionLevel: number;
  };
  security: {
    enableAntiSpam: boolean;
    maxGiftsPerMinute: number;
    requireVerification: boolean;
    enableModerationAI: boolean;
  };
}

// API Response Types
export interface CGIFTSApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
  metadata?: {
    timestamp: number;
    requestId: string;
    version: string;
  };
}

export interface CGIFTSPaginatedResponse<T = any> extends CGIFTSApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// WebSocket Event Types
export interface CGIFTSWebSocketMessage {
  type: 'gift_sent' | 'gift_received' | 'auction_update' | 'effect_sync' | 'user_joined' | 'user_left';
  roomId?: string;
  userId?: string;
  data: Record<string, any>;
  timestamp: number;
}

// XR Integration Types
export interface CGIFTSXRSession {
  sessionId: string;
  userId: string;
  roomId: string;
  xrMode: 'vr' | 'ar' | 'mixed';
  capabilities: {
    handTracking: boolean;
    eyeTracking: boolean;
    hapticFeedback: boolean;
    spatialAudio: boolean;
  };
  position: Vector3D;
  rotation: Vector3D;
  controllers: Array<{
    id: string;
    position: Vector3D;
    rotation: Vector3D;
    buttons: Record<string, boolean>;
  }>;
}

// Blockchain Integration Types
export interface CGIFTSBlockchainTransaction {
  txHash: string;
  blockNumber: number;
  from: string;
  to: string;
  value: string;
  gasUsed: number;
  status: 'pending' | 'confirmed' | 'failed';
  timestamp: number;
  metadata: {
    giftId?: string;
    auctionId?: string;
    transactionType: 'gift' | 'bid' | 'auction_settlement' | 'refund';
  };
}

// AI Integration Types
export interface CGIFTSAIContext {
  userId: string;
  recipientId?: string;
  roomContext: {
    roomId: string;
    participants: string[];
    recentActivity: CGIFTSEvent[];
  };
  userHistory: {
    giftsSent: CGIFTSTransaction[];
    giftsReceived: CGIFTSTransaction[];
    preferences: Record<string, any>;
  };
  socialContext: {
    relationship: 'friend' | 'follower' | 'stranger' | 'vip';
    interactionHistory: number;
    mutualConnections: string[];
  };
}

// Error Types
export class CGIFTSError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public metadata?: Record<string, any>
  ) {
    super(message);
    this.name = 'CGIFTSError';
  }
}

export class CGIFTSValidationError extends CGIFTSError {
  constructor(message: string, field: string, value: any) {
    super(message, 'VALIDATION_ERROR', 400, { field, value });
    this.name = 'CGIFTSValidationError';
  }
}

export class CGIFTSPaymentError extends CGIFTSError {
  constructor(message: string, paymentProvider: string, providerError?: any) {
    super(message, 'PAYMENT_ERROR', 402, { paymentProvider, providerError });
    this.name = 'CGIFTSPaymentError';
  }
}

export class CGIFTSAuctionError extends CGIFTSError {
  constructor(message: string, auctionId: string, currentState: any) {
    super(message, 'AUCTION_ERROR', 409, { auctionId, currentState });
    this.name = 'CGIFTSAuctionError';
  }
}

// Utility Types
export type CGIFTSEventHandler<T = any> = (event: CGIFTSEvent & { data: T }) => void | Promise<void>;

export type CGIFTSMiddleware = (
  context: {
    userId: string;
    action: string;
    data: Record<string, any>;
  },
  next: () => Promise<void>
) => Promise<void>;

export interface CGIFTSPlugin {
  name: string;
  version: string;
  initialize: (core: any) => Promise<void>;
  dispose: () => Promise<void>;
  hooks?: {
    beforeGiftSent?: CGIFTSEventHandler<CGIFTSTransaction>;
    afterGiftSent?: CGIFTSEventHandler<CGIFTSTransaction>;
    beforeAuctionCreated?: CGIFTSEventHandler<CGIFTSAuction>;
    afterAuctionCompleted?: CGIFTSEventHandler<CGIFTSAuction>;
  };
}

// Export all types as a namespace for easier imports
export namespace CGIFTS {
  export type Gift = CGIFTSGift;
  export type Transaction = CGIFTSTransaction;
  export type Auction = CGIFTSAuction;
  export type Bid = CGIFTSBid;
  export type Effect = CGIFTSEffect;
  export type User = CGIFTSUser;
  export type Room = CGIFTSRoom;
  export type Recommendation = CGIFTSRecommendation;
  export type Analytics = CGIFTSAnalytics;
  export type Event = CGIFTSEvent;
  export type Config = CGIFTSConfig;
  export type ApiResponse<T = any> = CGIFTSApiResponse<T>;
  export type PaginatedResponse<T = any> = CGIFTSPaginatedResponse<T>;
  export type WebSocketMessage = CGIFTSWebSocketMessage;
  export type XRSession = CGIFTSXRSession;
  export type BlockchainTransaction = CGIFTSBlockchainTransaction;
  export type AIContext = CGIFTSAIContext;
  export type EventHandler<T = any> = CGIFTSEventHandler<T>;
  export type Middleware = CGIFTSMiddleware;
  export type Plugin = CGIFTSPlugin;
}