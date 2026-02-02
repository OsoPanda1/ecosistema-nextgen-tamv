/**
 * CGIFTS TAMV - Main Integration Module
 * Brings together all CGIFTS components for seamless operation
 * Integrates with existing TAMV architecture
 */

import { CGIFTSCore } from './cgifts-core.js';
import { CGIFTSXRIntegration } from './xr/cgifts-xr-integration.js';
import { CGIFTSBlockchain } from './blockchain/cgifts-blockchain.js';
import { initializeCGIFTSAPI, setupWebSocket } from './api/cgifts-api.js';
import { TAMV4DRenderer } from '../xr-engine/tamv-4d-renderer.js';
import { IsabellaCore } from '../ai/isabella-universal/isabella-core.js';
import { MSRBlockchain } from '../blockchain/msr-chain/msr-blockchain.js';

/**
 * CGIFTS Integration Manager
 * Orchestrates all CGIFTS systems and integrates with TAMV ecosystem
 */
export class CGIFTSIntegration {
  constructor(config = {}) {
    this.config = {
      // Core settings
      enableXR: true,
      enable3DEffects: true,
      enableBlockchain: true,
      enableAI: true,
      enableAPI: true,
      enableWebSocket: true,
      
      // Performance settings
      maxConcurrentEffects: 20,
      effectQuality: 'ultra',
      enableLOD: true,
      
      // Integration settings
      tamvIntegration: true,
      isabellaIntegration: true,
      msrIntegration: true,
      
      // Network settings
      apiPort: 3001,
      wsPort: 3002,
      
      ...config
    };

    // Core systems
    this.cgiftsCore = null;
    this.xrIntegration = null;
    this.blockchainIntegration = null;
    
    // TAMV integrations
    this.tamv4D = null;
    this.isabellaAI = null;
    this.msrBlockchain = null;
    
    // API and networking
    this.apiServer = null;
    this.wsServer = null;
    
    // Event system
    this.eventBus = new EventTarget();
    this.subscribers = new Set();
    
    // Performance monitoring
    this.performanceMetrics = {
      giftsPerSecond: 0,
      activeEffects: 0,
      memoryUsage: 0,
      networkLatency: 0,
      blockchainTPS: 0
    };
    
    this.initialize();
  }

  /**
   * Initialize CGIFTS integration
   */
  async initialize() {
    try {
      console.log('🎁 Initializing CGIFTS TAMV Integration...');
      
      await this.initializeCore();
      await this.initializeTAMVIntegrations();
      await this.initializeXRSystem();
      await this.initializeBlockchain();
      await this.initializeAPI();
      await this.setupEventHandlers();
      await this.startPerformanceMonitoring();
      
      console.log('✅ CGIFTS TAMV Integration initialized successfully!');
      this.logSystemStatus();
    } catch (error) {
      console.error('❌ Failed to initialize CGIFTS Integration:', error);
      throw error;
    }
  }

  /**
   * Initialize core CGIFTS system
   */
  async initializeCore() {
    console.log('🔧 Initializing CGIFTS Core...');
    
    this.cgiftsCore = new CGIFTSCore({
      enableXR: this.config.enableXR,
      enable3DEffects: this.config.enable3DEffects,
      enableBlockchain: this.config.enableBlockchain,
      enableAI: this.config.enableAI,
      maxConcurrentEffects: this.config.maxConcurrentEffects,
      effectQuality: this.config.effectQuality
    });

    // Subscribe to core events
    this.cgiftsCore.subscribe((eventType, data) => {
      this.handleCoreEvent(eventType, data);
    });
  }

  /**
   * Initialize TAMV system integrations
   */
  async initializeTAMVIntegrations() {
    if (!this.config.tamvIntegration) return;
    
    console.log('🌌 Initializing TAMV integrations...');
    
    // Initialize TAMV 4D Renderer
    this.tamv4D = new TAMV4DRenderer({
      enableVR: this.config.enableXR,
      enableAR: this.config.enableXR,
      enable4D: true,
      enableQuantumPhysics: true,
      renderQuality: this.config.effectQuality
    });

    // Initialize Isabella AI
    if (this.config.isabellaIntegration) {
      this.isabellaAI = new IsabellaCore({
        enableRecommendations: true,
        enableModerationAI: true,
        enableEthicalAI: true
      });
      
      // Connect Isabella to CGIFTS for gift recommendations
      this.cgiftsCore.isabellaAI = this.isabellaAI;
    }

    // Initialize MSR Blockchain
    if (this.config.msrIntegration) {
      this.msrBlockchain = new MSRBlockchain({
        network: 'tamv-mainnet',
        enableSmartContracts: true
      });
      
      await this.msrBlockchain.initialize();
    }
  }

  /**
   * Initialize XR system
   */
  async initializeXRSystem() {
    if (!this.config.enableXR) return;
    
    console.log('🥽 Initializing XR system...');
    
    this.xrIntegration = new CGIFTSXRIntegration({
      enableVR: true,
      enableAR: true,
      enableHaptics: true,
      enableSpatialAudio: true,
      maxConcurrentEffects: this.config.maxConcurrentEffects,
      effectLOD: this.config.enableLOD
    });

    // Connect XR integration to core
    this.xrIntegration.cgiftsCore = this.cgiftsCore;
    this.xrIntegration.tamv4D = this.tamv4D;
  }

  /**
   * Initialize blockchain integration
   */
  async initializeBlockchain() {
    if (!this.config.enableBlockchain) return;
    
    console.log('⛓️ Initializing blockchain integration...');
    
    this.blockchainIntegration = new CGIFTSBlockchain({
      network: 'tamv-mainnet',
      enableCrossChain: true,
      enableNFTMinting: true,
      msrBlockchain: this.msrBlockchain
    });

    // Connect blockchain to core
    this.cgiftsCore.msrBlockchain = this.blockchainIntegration;
  }

  /**
   * Initialize API and WebSocket servers
   */
  async initializeAPI() {
    if (!this.config.enableAPI) return;
    
    console.log('🌐 Initializing API servers...');
    
    // Initialize REST API
    await initializeCGIFTSAPI({
      cgiftsCore: this.cgiftsCore,
      xrIntegration: this.xrIntegration,
      blockchainIntegration: this.blockchainIntegration
    });

    // Initialize WebSocket server
    if (this.config.enableWebSocket) {
      const io = require('socket.io')(this.config.wsPort, {
        cors: {
          origin: "*",
          methods: ["GET", "POST"]
        }
      });
      
      setupWebSocket(io);
      this.wsServer = io;
      
      console.log(`📡 WebSocket server running on port ${this.config.wsPort}`);
    }
  }

  /**
   * Setup event handlers
   */
  async setupEventHandlers() {
    console.log('📡 Setting up event handlers...');
    
    // Core CGIFTS events
    this.cgiftsCore.eventEmitter.addEventListener('gift_sent', (event) => {
      this.handleGiftSent(event.detail);
    });

    this.cgiftsCore.eventEmitter.addEventListener('auction_created', (event) => {
      this.handleAuctionCreated(event.detail);
    });

    this.cgiftsCore.eventEmitter.addEventListener('bid_placed', (event) => {
      this.handleBidPlaced(event.detail);
    });

    // XR events
    if (this.xrIntegration) {
      this.xrIntegration.eventEmitter?.addEventListener('xr_gift_sent', (event) => {
        this.handleXRGiftSent(event.detail);
      });
    }

    // Blockchain events
    if (this.blockchainIntegration) {
      this.blockchainIntegration.eventEmitter?.addEventListener('transaction_confirmed', (event) => {
        this.handleBlockchainConfirmation(event.detail);
      });
    }
  }

  /**
   * Start performance monitoring
   */
  async startPerformanceMonitoring() {
    console.log('📊 Starting performance monitoring...');
    
    setInterval(() => {
      this.updatePerformanceMetrics();
    }, 5000); // Update every 5 seconds
  }

  /**
   * Update performance metrics
   */
  updatePerformanceMetrics() {
    const stats = this.cgiftsCore.getGiftStatistics();
    
    this.performanceMetrics = {
      giftsPerSecond: this.calculateGiftsPerSecond(),
      activeEffects: stats.activeEffects,
      memoryUsage: this.getMemoryUsage(),
      networkLatency: this.getNetworkLatency(),
      blockchainTPS: this.getBlockchainTPS()
    };

    // Emit performance update
    this.eventBus.dispatchEvent(new CustomEvent('performance_update', {
      detail: this.performanceMetrics
    }));
  }

  /**
   * Calculate gifts per second
   */
  calculateGiftsPerSecond() {
    const recentGifts = this.cgiftsCore.giftHistory.filter(
      gift => Date.now() - gift.timestamp < 60000 // Last minute
    );
    return recentGifts.length / 60;
  }

  /**
   * Get memory usage
   */
  getMemoryUsage() {
    if (performance.memory) {
      return Math.round(performance.memory.usedJSHeapSize / 1024 / 1024); // MB
    }
    return 0;
  }

  /**
   * Get network latency
   */
  getNetworkLatency() {
    // TODO: Implement proper network latency measurement
    return Math.random() * 50 + 10; // Placeholder: 10-60ms
  }

  /**
   * Get blockchain TPS
   */
  getBlockchainTPS() {
    if (!this.blockchainIntegration) return 0;
    
    const stats = this.blockchainIntegration.getBlockchainStats();
    return stats.pendingTransactions / 10; // Rough estimate
  }

  /**
   * Handle core CGIFTS events
   */
  handleCoreEvent(eventType, data) {
    switch (eventType) {
      case 'gift_sent':
        this.processGiftSent(data);
        break;
      case 'auction_created':
        this.processAuctionCreated(data);
        break;
      case 'bid_placed':
        this.processBidPlaced(data);
        break;
    }
  }

  /**
   * Process gift sent event
   */
  async processGiftSent(transaction) {
    try {
      // Record on blockchain
      if (this.blockchainIntegration) {
        await this.blockchainIntegration.recordGiftTransaction(transaction);
      }

      // Trigger XR effect
      if (this.xrIntegration) {
        await this.xrIntegration.displayGiftEffect(transaction);
      }

      // AI learning
      if (this.isabellaAI) {
        await this.isabellaAI.updateGiftPreferences(
          transaction.sender,
          transaction.recipient,
          this.cgiftsCore.findGiftById(transaction.giftId)
        );
      }

      // Broadcast to WebSocket clients
      if (this.wsServer) {
        this.wsServer.emit('gift_sent', transaction);
      }

      console.log(`🎁 Gift processed: ${transaction.giftId} from ${transaction.sender} to ${transaction.recipient}`);
    } catch (error) {
      console.error('Failed to process gift sent:', error);
    }
  }

  /**
   * Process auction created event
   */
  async processAuctionCreated(auction) {
    try {
      // Record on blockchain
      if (this.blockchainIntegration) {
        await this.blockchainIntegration.createAuction(auction);
      }

      // Broadcast to WebSocket clients
      if (this.wsServer) {
        this.wsServer.emit('auction_created', auction);
      }

      console.log(`🏛️ Auction created: ${auction.id} for gift ${auction.giftId}`);
    } catch (error) {
      console.error('Failed to process auction created:', error);
    }
  }

  /**
   * Process bid placed event
   */
  async processBidPlaced(bidData) {
    try {
      // Record on blockchain
      if (this.blockchainIntegration) {
        await this.blockchainIntegration.placeBid(bidData.bid);
      }

      // Trigger XR notification
      if (this.xrIntegration) {
        await this.xrIntegration.displayBidEffect(bidData);
      }

      // Broadcast to WebSocket clients
      if (this.wsServer) {
        this.wsServer.to(`auction_${bidData.auction.id}`).emit('bid_placed', bidData);
      }

      console.log(`💰 Bid placed: ${bidData.bid.amount} on auction ${bidData.auction.id}`);
    } catch (error) {
      console.error('Failed to process bid placed:', error);
    }
  }

  /**
   * Handle gift sent event
   */
  handleGiftSent(data) {
    console.log('Gift sent event:', data);
  }

  /**
   * Handle auction created event
   */
  handleAuctionCreated(data) {
    console.log('Auction created event:', data);
  }

  /**
   * Handle bid placed event
   */
  handleBidPlaced(data) {
    console.log('Bid placed event:', data);
  }

  /**
   * Handle XR gift sent event
   */
  handleXRGiftSent(data) {
    console.log('XR gift sent event:', data);
  }

  /**
   * Handle blockchain confirmation
   */
  handleBlockchainConfirmation(data) {
    console.log('Blockchain confirmation:', data);
  }

  /**
   * Send gift through integration
   */
  async sendGift(giftId, senderId, recipientId, options = {}) {
    try {
      return await this.cgiftsCore.sendGift(giftId, senderId, recipientId, options);
    } catch (error) {
      console.error('Failed to send gift:', error);
      throw error;
    }
  }

  /**
   * Create auction through integration
   */
  async createAuction(giftId, startingBid, duration, options = {}) {
    try {
      return await this.cgiftsCore.auctionSystem.createAuction(giftId, startingBid, duration);
    } catch (error) {
      console.error('Failed to create auction:', error);
      throw error;
    }
  }

  /**
   * Place bid through integration
   */
  async placeBid(auctionId, bidderId, amount) {
    try {
      return await this.cgiftsCore.auctionSystem.placeBid(auctionId, bidderId, amount);
    } catch (error) {
      console.error('Failed to place bid:', error);
      throw error;
    }
  }

  /**
   * Get gift recommendations
   */
  async getGiftRecommendations(userId, recipientId, context = {}) {
    try {
      return await this.cgiftsCore.getGiftRecommendations(userId, recipientId, context);
    } catch (error) {
      console.error('Failed to get recommendations:', error);
      return [];
    }
  }

  /**
   * Get system statistics
   */
  getSystemStats() {
    const coreStats = this.cgiftsCore.getGiftStatistics();
    const blockchainStats = this.blockchainIntegration?.getBlockchainStats() || {};
    
    return {
      core: coreStats,
      blockchain: blockchainStats,
      performance: this.performanceMetrics,
      integrations: {
        xr: !!this.xrIntegration,
        blockchain: !!this.blockchainIntegration,
        ai: !!this.isabellaAI,
        tamv4D: !!this.tamv4D
      }
    };
  }

  /**
   * Log system status
   */
  logSystemStatus() {
    const stats = this.getSystemStats();
    
    console.log('🎁 CGIFTS TAMV System Status:');
    console.log(`   📊 Total Gifts Sent: ${stats.core.totalGiftsSent}`);
    console.log(`   💰 Total Value: $${stats.core.totalValue}`);
    console.log(`   ✨ Active Effects: ${stats.core.activeEffects}`);
    console.log(`   🏛️ Active Auctions: ${stats.core.activeAuctions}`);
    console.log(`   🥽 XR Integration: ${stats.integrations.xr ? '✅' : '❌'}`);
    console.log(`   ⛓️ Blockchain Integration: ${stats.integrations.blockchain ? '✅' : '❌'}`);
    console.log(`   🤖 AI Integration: ${stats.integrations.ai ? '✅' : '❌'}`);
    console.log(`   🌌 TAMV 4D Integration: ${stats.integrations.tamv4D ? '✅' : '❌'}`);
    console.log(`   📈 Performance: ${stats.performance.giftsPerSecond.toFixed(2)} gifts/sec`);
    console.log(`   💾 Memory Usage: ${stats.performance.memoryUsage} MB`);
  }

  /**
   * Subscribe to integration events
   */
  subscribe(callback) {
    this.subscribers.add(callback);
    
    return () => {
      this.subscribers.delete(callback);
    };
  }

  /**
   * Update integration (called every frame)
   */
  update() {
    // Update XR integration
    if (this.xrIntegration) {
      this.xrIntegration.update();
    }

    // Update TAMV 4D renderer
    if (this.tamv4D) {
      // TAMV 4D has its own render loop
    }
  }

  /**
   * Dispose of integration
   */
  dispose() {
    console.log('🧹 Disposing CGIFTS Integration...');
    
    // Dispose core systems
    if (this.cgiftsCore) {
      this.cgiftsCore.dispose();
    }

    if (this.xrIntegration) {
      this.xrIntegration.dispose();
    }

    if (this.blockchainIntegration) {
      this.blockchainIntegration.dispose();
    }

    if (this.tamv4D) {
      this.tamv4D.dispose();
    }

    // Close servers
    if (this.wsServer) {
      this.wsServer.close();
    }

    // Clear subscribers
    this.subscribers.clear();

    console.log('✅ CGIFTS Integration disposed');
  }
}

/**
 * Create and initialize CGIFTS integration
 */
export async function createCGIFTSIntegration(config = {}) {
  const integration = new CGIFTSIntegration(config);
  await integration.initialize();
  return integration;
}

/**
 * Demo implementation
 */
export async function runCGIFTSDemo() {
  console.log('🚀 Starting CGIFTS TAMV Demo...');
  
  try {
    // Create integration
    const cgifts = await createCGIFTSIntegration({
      enableXR: true,
      enable3DEffects: true,
      enableBlockchain: true,
      enableAI: true,
      effectQuality: 'ultra'
    });

    // Demo: Send a heart sparkle gift
    console.log('💖 Sending heart sparkle gift...');
    const heartGift = await cgifts.sendGift(
      'heart_light',
      'demo_sender',
      'demo_recipient',
      {
        position: { x: 0, y: 1.5, z: -2 },
        intensity: 1.0,
        message: 'Demo gift from CGIFTS TAMV!'
      }
    );
    console.log('Heart gift sent:', heartGift.id);

    // Demo: Send a dragon fire gift
    console.log('🐉 Sending dragon fire gift...');
    const dragonGift = await cgifts.sendGift(
      'dragon_breath',
      'demo_sender',
      'demo_recipient',
      {
        position: { x: 1, y: 1.5, z: -2 },
        intensity: 1.2
      }
    );
    console.log('Dragon gift sent:', dragonGift.id);

    // Demo: Create Mini Anubis Ultra auction
    console.log('🏛️ Creating Mini Anubis Ultra auction...');
    const auction = await cgifts.createAuction(
      'mini_anubis_ultra',
      300, // $300 starting bid
      24 * 60 * 60 * 1000 // 24 hours
    );
    console.log('Auction created:', auction.id);

    // Demo: Place a bid
    console.log('💰 Placing bid on auction...');
    const bid = await cgifts.placeBid(auction.id, 'demo_bidder', 350);
    console.log('Bid placed:', bid.id);

    // Demo: Get recommendations
    console.log('🤖 Getting gift recommendations...');
    const recommendations = await cgifts.getGiftRecommendations(
      'demo_user',
      'demo_recipient'
    );
    console.log('Recommendations:', recommendations.map(r => r.name));

    // Show system stats
    console.log('📊 System Statistics:');
    const stats = cgifts.getSystemStats();
    console.log(JSON.stringify(stats, null, 2));

    console.log('✅ CGIFTS TAMV Demo completed successfully!');
    
    return cgifts;
  } catch (error) {
    console.error('❌ CGIFTS Demo failed:', error);
    throw error;
  }
}

export default CGIFTSIntegration;