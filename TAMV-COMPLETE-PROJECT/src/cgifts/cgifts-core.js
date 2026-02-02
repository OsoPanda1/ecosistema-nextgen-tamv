/**
 * CGIFTS TAMV - Core Gift System
 * Evolution of TikTok gifts with XR 3D effects and blockchain federation
 * Developed by Edwin Oswaldo Castillo Trejo (Anubis Villaseñor)
 * 
 * Features:
 * - 30+ gifts with 3D XR effects ($1-$300 range)
 * - WebXR integration with TAMV 4D renderer
 * - Blockchain federation with MSR anchoring
 * - Mini Anubis Ultra special implementation
 * - Real-time subscription system
 */

import * as THREE from 'three';
import { TAMV4DRenderer } from '../xr-engine/tamv-4d-renderer.js';
import { MSRBlockchain } from '../blockchain/msr-chain/msr-blockchain.js';
import { IsabellaCore } from '../ai/isabella-universal/isabella-core.js';

/**
 * CGIFTS Gift Categories and Pricing
 */
export const CGIFTS_CATALOG = {
  LIGHT: {
    range: [1, 10],
    currency: 'USD',
    effects: ['sparkle', 'glow', 'pulse'],
    gifts: [
      { id: 'heart_light', name: 'Corazón de Luz', price: 1, effect: 'heart_sparkle' },
      { id: 'star_burst', name: 'Explosión Estelar', price: 2, effect: 'star_particles' },
      { id: 'rainbow_wave', name: 'Onda Arcoíris', price: 3, effect: 'rainbow_wave' },
      { id: 'crystal_flower', name: 'Flor de Cristal', price: 5, effect: 'crystal_bloom' },
      { id: 'phoenix_feather', name: 'Pluma de Fénix', price: 7, effect: 'phoenix_trail' },
      { id: 'quantum_orb', name: 'Orbe Cuántico', price: 10, effect: 'quantum_field' }
    ]
  },
  EPIC: {
    range: [10, 50],
    currency: 'USD',
    effects: ['explosion', 'transformation', 'portal'],
    gifts: [
      { id: 'dragon_breath', name: 'Aliento de Dragón', price: 15, effect: 'dragon_fire' },
      { id: 'time_vortex', name: 'Vórtice Temporal', price: 20, effect: 'time_distortion' },
      { id: 'galaxy_spiral', name: 'Espiral Galáctica', price: 25, effect: 'galaxy_formation' },
      { id: 'phoenix_rebirth', name: 'Renacimiento Fénix', price: 30, effect: 'phoenix_resurrection' },
      { id: 'quantum_tunnel', name: 'Túnel Cuántico', price: 35, effect: 'quantum_teleport' },
      { id: 'cosmic_storm', name: 'Tormenta Cósmica', price: 40, effect: 'cosmic_lightning' },
      { id: 'anubis_blessing', name: 'Bendición de Anubis', price: 50, effect: 'anubis_golden_aura' }
    ]
  },
  LEGENDARY: {
    range: [50, 100],
    currency: 'USD',
    effects: ['reality_warp', 'dimension_shift', 'universe_creation'],
    gifts: [
      { id: 'reality_fracture', name: 'Fractura de Realidad', price: 60, effect: 'reality_break' },
      { id: 'dimension_gate', name: 'Portal Dimensional', price: 70, effect: 'dimension_portal' },
      { id: 'universe_birth', name: 'Nacimiento del Universo', price: 80, effect: 'big_bang_simulation' },
      { id: 'anubis_judgment', name: 'Juicio de Anubis', price: 90, effect: 'anubis_scales_justice' },
      { id: 'tamv_genesis', name: 'Génesis TAMV', price: 100, effect: 'tamv_world_creation' }
    ]
  },
  ULTRA: {
    range: [300, 300],
    currency: 'USD',
    effects: ['mini_anubis_manifestation'],
    gifts: [
      { 
        id: 'mini_anubis_ultra', 
        name: 'Mini Anubis Ultra', 
        price: 300, 
        effect: 'mini_anubis_full_manifestation',
        special: true,
        auction: true,
        limited: true,
        description: 'Ultra-exclusive gift with special auction mechanics and full Mini Anubis manifestation'
      }
    ]
  }
};

/**
 * CGIFTS Core System Class
 */
export class CGIFTSCore {
  constructor(config = {}) {
    this.config = {
      enableXR: true,
      enable3DEffects: true,
      enableBlockchain: true,
      enableAuction: true,
      maxConcurrentEffects: 10,
      effectQuality: 'ultra',
      ...config
    };

    // Core systems
    this.renderer4D = null;
    this.msrBlockchain = null;
    this.isabellaAI = null;
    
    // Gift system
    this.activeGifts = new Map();
    this.giftHistory = [];
    this.effectQueue = [];
    
    // 3D Effect systems
    this.effectRenderer = null;
    this.particleSystems = new Map();
    this.shaderLibrary = new Map();
    
    // Auction system for Mini Anubis
    this.auctionSystem = null;
    
    // Real-time subscriptions
    this.subscribers = new Set();
    this.eventEmitter = new EventTarget();
    
    this.initialize();
  }

  /**
   * Initialize CGIFTS system
   */
  async initialize() {
    try {
      await this.initializeRenderer();
      await this.initializeBlockchain();
      await this.initializeAI();
      await this.initializeEffects();
      await this.initializeAuction();
      
      console.log('CGIFTS Core initialized successfully');
    } catch (error) {
      console.error('Failed to initialize CGIFTS Core:', error);
      throw error;
    }
  }

  /**
   * Initialize 4D renderer for XR effects
   */
  async initializeRenderer() {
    if (!this.config.enableXR) return;
    
    this.renderer4D = new TAMV4DRenderer({
      enableVR: true,
      enableAR: true,
      enable4D: true,
      enableQuantumPhysics: true,
      renderQuality: this.config.effectQuality
    });
    
    // Create dedicated scene for gift effects
    this.effectScene = new THREE.Scene();
    this.effectCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  }

  /**
   * Initialize blockchain integration
   */
  async initializeBlockchain() {
    if (!this.config.enableBlockchain) return;
    
    this.msrBlockchain = new MSRBlockchain({
      network: 'tamv-mainnet',
      enableSmartContracts: true
    });
    
    await this.msrBlockchain.initialize();
  }

  /**
   * Initialize Isabella AI for gift recommendations
   */
  async initializeAI() {
    this.isabellaAI = new IsabellaCore({
      enableRecommendations: true,
      enableModerationAI: true
    });
  }

  /**
   * Initialize 3D effect systems
   */
  async initializeEffects() {
    await this.loadShaderLibrary();
    await this.initializeParticleSystems();
    await this.setupEffectRenderer();
  }

  /**
   * Load shader library for 3D effects
   */
  async loadShaderLibrary() {
    // Heart Sparkle Effect
    this.shaderLibrary.set('heart_sparkle', {
      vertexShader: `
        uniform float uTime;
        uniform float uIntensity;
        attribute vec3 heartPosition;
        attribute float sparklePhase;
        
        varying vec3 vColor;
        varying float vAlpha;
        
        void main() {
          vec3 pos = position;
          
          // Heart shape transformation
          float heartScale = sin(uTime * 2.0 + sparklePhase) * 0.5 + 1.0;
          pos = heartPosition * heartScale;
          
          // Sparkle effect
          float sparkle = sin(uTime * 5.0 + sparklePhase) * 0.5 + 0.5;
          vAlpha = sparkle * uIntensity;
          vColor = vec3(1.0, 0.2, 0.4) * sparkle;
          
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = 5.0 * sparkle;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        varying float vAlpha;
        
        void main() {
          vec2 center = gl_PointCoord - 0.5;
          float dist = length(center);
          
          if (dist > 0.5) discard;
          
          float alpha = (1.0 - dist * 2.0) * vAlpha;
          gl_FragColor = vec4(vColor, alpha);
        }
      `
    });

    // Dragon Fire Effect
    this.shaderLibrary.set('dragon_fire', {
      vertexShader: `
        uniform float uTime;
        uniform float uIntensity;
        attribute vec3 fireDirection;
        attribute float firePhase;
        
        varying vec3 vColor;
        varying float vAlpha;
        varying vec2 vUv;
        
        void main() {
          vUv = uv;
          vec3 pos = position;
          
          // Fire movement
          float fireWave = sin(uTime * 3.0 + firePhase) * 0.3;
          pos += fireDirection * fireWave;
          
          // Fire color variation
          float heat = sin(uTime * 4.0 + firePhase) * 0.5 + 0.5;
          vColor = mix(vec3(1.0, 0.3, 0.0), vec3(1.0, 1.0, 0.2), heat);
          vAlpha = uIntensity * (0.7 + heat * 0.3);
          
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        varying vec3 vColor;
        varying float vAlpha;
        varying vec2 vUv;
        
        void main() {
          // Fire texture pattern
          vec2 fireUV = vUv * 3.0 + vec2(uTime * 0.5, uTime * 0.8);
          float firePattern = sin(fireUV.x) * sin(fireUV.y) * 0.5 + 0.5;
          
          // Fire edge fade
          float edgeFade = 1.0 - length(vUv - 0.5) * 2.0;
          edgeFade = clamp(edgeFade, 0.0, 1.0);
          
          float alpha = vAlpha * firePattern * edgeFade;
          gl_FragColor = vec4(vColor, alpha);
        }
      `
    });

    // Mini Anubis Ultra Effect
    this.shaderLibrary.set('mini_anubis_full_manifestation', {
      vertexShader: `
        uniform float uTime;
        uniform float uIntensity;
        uniform vec3 uAnubisPosition;
        attribute vec3 anubisGeometry;
        attribute vec3 goldenAura;
        
        varying vec3 vColor;
        varying float vAlpha;
        varying vec3 vPosition;
        
        void main() {
          vPosition = position;
          vec3 pos = position;
          
          // Anubis manifestation animation
          float manifestation = sin(uTime * 0.5) * 0.5 + 0.5;
          pos = mix(position, anubisGeometry + uAnubisPosition, manifestation);
          
          // Golden aura effect
          vec3 auraOffset = goldenAura * sin(uTime * 2.0) * 0.1;
          pos += auraOffset;
          
          // Divine golden color
          vColor = vec3(1.0, 0.8, 0.2) * (0.8 + manifestation * 0.2);
          vAlpha = uIntensity * manifestation;
          
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        varying vec3 vColor;
        varying float vAlpha;
        varying vec3 vPosition;
        
        void main() {
          // Divine energy pattern
          float energy = sin(vPosition.x * 10.0 + uTime) * 
                        sin(vPosition.y * 10.0 + uTime * 1.3) * 
                        sin(vPosition.z * 10.0 + uTime * 0.7);
          energy = energy * 0.5 + 0.5;
          
          // Sacred geometry overlay
          float sacred = sin(length(vPosition) * 20.0 - uTime * 3.0) * 0.3 + 0.7;
          
          vec3 finalColor = vColor * energy * sacred;
          float finalAlpha = vAlpha * sacred;
          
          gl_FragColor = vec4(finalColor, finalAlpha);
        }
      `
    });
  }

  /**
   * Initialize particle systems for different effects
   */
  async initializeParticleSystems() {
    // Heart Sparkle Particles
    const heartGeometry = new THREE.BufferGeometry();
    const heartPositions = new Float32Array(1000 * 3);
    const sparklePhases = new Float32Array(1000);
    
    // Generate heart shape positions
    for (let i = 0; i < 1000; i++) {
      const t = (i / 1000) * Math.PI * 2;
      const x = 16 * Math.pow(Math.sin(t), 3);
      const y = 13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t);
      
      heartPositions[i * 3] = x * 0.1;
      heartPositions[i * 3 + 1] = y * 0.1;
      heartPositions[i * 3 + 2] = (Math.random() - 0.5) * 2;
      
      sparklePhases[i] = Math.random() * Math.PI * 2;
    }
    
    heartGeometry.setAttribute('position', new THREE.BufferAttribute(heartPositions, 3));
    heartGeometry.setAttribute('heartPosition', new THREE.BufferAttribute(heartPositions, 3));
    heartGeometry.setAttribute('sparklePhase', new THREE.BufferAttribute(sparklePhases, 1));
    
    this.particleSystems.set('heart_sparkle', {
      geometry: heartGeometry,
      material: new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uIntensity: { value: 1.0 }
        },
        vertexShader: this.shaderLibrary.get('heart_sparkle').vertexShader,
        fragmentShader: this.shaderLibrary.get('heart_sparkle').fragmentShader,
        transparent: true,
        blending: THREE.AdditiveBlending
      })
    });
  }

  /**
   * Setup effect renderer
   */
  async setupEffectRenderer() {
    this.effectRenderer = {
      render: (effect, position, intensity = 1.0) => {
        return this.renderEffect(effect, position, intensity);
      },
      cleanup: (effectId) => {
        return this.cleanupEffect(effectId);
      }
    };
  }

  /**
   * Initialize auction system for Mini Anubis Ultra
   */
  async initializeAuction() {
    if (!this.config.enableAuction) return;
    
    this.auctionSystem = {
      activeAuctions: new Map(),
      auctionHistory: [],
      
      createAuction: async (giftId, startingBid, duration) => {
        const auction = {
          id: THREE.MathUtils.generateUUID(),
          giftId: giftId,
          startingBid: startingBid,
          currentBid: startingBid,
          highestBidder: null,
          startTime: Date.now(),
          endTime: Date.now() + duration,
          bids: []
        };
        
        this.auctionSystem.activeAuctions.set(auction.id, auction);
        
        // Record on blockchain
        if (this.msrBlockchain) {
          await this.msrBlockchain.recordTransaction({
            type: 'auction_created',
            auctionId: auction.id,
            giftId: giftId,
            startingBid: startingBid,
            timestamp: Date.now()
          });
        }
        
        return auction;
      },
      
      placeBid: async (auctionId, bidder, amount) => {
        const auction = this.auctionSystem.activeAuctions.get(auctionId);
        if (!auction || Date.now() > auction.endTime) {
          throw new Error('Auction not active');
        }
        
        if (amount <= auction.currentBid) {
          throw new Error('Bid must be higher than current bid');
        }
        
        auction.currentBid = amount;
        auction.highestBidder = bidder;
        auction.bids.push({
          bidder: bidder,
          amount: amount,
          timestamp: Date.now()
        });
        
        // Record on blockchain
        if (this.msrBlockchain) {
          await this.msrBlockchain.recordTransaction({
            type: 'bid_placed',
            auctionId: auctionId,
            bidder: bidder,
            amount: amount,
            timestamp: Date.now()
          });
        }
        
        // Notify subscribers
        this.notifySubscribers('bid_placed', { auction, bidder, amount });
        
        return auction;
      }
    };
  }

  /**
   * Send a gift with 3D XR effects
   */
  async sendGift(giftId, sender, recipient, options = {}) {
    try {
      // Validate gift
      const gift = this.findGiftById(giftId);
      if (!gift) {
        throw new Error(`Gift ${giftId} not found`);
      }
      
      // Handle Mini Anubis Ultra special case
      if (gift.special && gift.auction) {
        return await this.handleMiniAnubisUltra(gift, sender, recipient, options);
      }
      
      // Create gift transaction
      const transaction = {
        id: THREE.MathUtils.generateUUID(),
        giftId: giftId,
        sender: sender,
        recipient: recipient,
        amount: gift.price,
        timestamp: Date.now(),
        effect: gift.effect,
        status: 'pending'
      };
      
      // Record on blockchain
      if (this.msrBlockchain) {
        await this.msrBlockchain.recordTransaction({
          type: 'gift_sent',
          ...transaction
        });
      }
      
      // Render 3D effect
      const effectId = await this.renderGiftEffect(gift, options.position || new THREE.Vector3());
      transaction.effectId = effectId;
      transaction.status = 'active';
      
      // Store active gift
      this.activeGifts.set(transaction.id, transaction);
      this.giftHistory.push(transaction);
      
      // Notify subscribers
      this.notifySubscribers('gift_sent', transaction);
      
      // AI recommendation update
      if (this.isabellaAI) {
        await this.isabellaAI.updateGiftPreferences(sender, recipient, gift);
      }
      
      return transaction;
      
    } catch (error) {
      console.error('Failed to send gift:', error);
      throw error;
    }
  }

  /**
   * Handle Mini Anubis Ultra special gift
   */
  async handleMiniAnubisUltra(gift, sender, recipient, options) {
    // Check if there's an active auction
    const activeAuction = Array.from(this.auctionSystem.activeAuctions.values())
      .find(auction => auction.giftId === gift.id && Date.now() < auction.endTime);
    
    if (activeAuction) {
      // This is a bid, not a direct purchase
      return await this.auctionSystem.placeBid(activeAuction.id, sender, gift.price);
    } else {
      // Create new auction for Mini Anubis Ultra
      const auction = await this.auctionSystem.createAuction(
        gift.id, 
        gift.price, 
        options.auctionDuration || 24 * 60 * 60 * 1000 // 24 hours
      );
      
      // Place initial bid
      return await this.auctionSystem.placeBid(auction.id, sender, gift.price);
    }
  }

  /**
   * Render gift effect in 3D XR space
   */
  async renderGiftEffect(gift, position) {
    const effectId = THREE.MathUtils.generateUUID();
    
    try {
      // Get particle system for this effect
      const particleSystem = this.particleSystems.get(gift.effect);
      if (!particleSystem) {
        console.warn(`No particle system found for effect: ${gift.effect}`);
        return effectId;
      }
      
      // Create effect instance
      const effectMesh = new THREE.Points(particleSystem.geometry, particleSystem.material.clone());
      effectMesh.position.copy(position);
      effectMesh.userData.effectId = effectId;
      effectMesh.userData.startTime = Date.now();
      effectMesh.userData.duration = this.getEffectDuration(gift.effect);
      
      // Add to effect scene
      this.effectScene.add(effectMesh);
      
      // Start effect animation
      this.animateEffect(effectMesh, gift.effect);
      
      // Schedule cleanup
      setTimeout(() => {
        this.cleanupEffect(effectId);
      }, effectMesh.userData.duration);
      
      return effectId;
      
    } catch (error) {
      console.error('Failed to render gift effect:', error);
      return effectId;
    }
  }

  /**
   * Animate gift effect
   */
  animateEffect(effectMesh, effectType) {
    const animate = () => {
      if (!effectMesh.parent) return; // Effect was cleaned up
      
      const elapsed = Date.now() - effectMesh.userData.startTime;
      const progress = elapsed / effectMesh.userData.duration;
      
      if (progress >= 1.0) {
        return; // Effect completed
      }
      
      // Update shader uniforms
      if (effectMesh.material.uniforms) {
        effectMesh.material.uniforms.uTime.value = elapsed * 0.001;
        effectMesh.material.uniforms.uIntensity.value = this.getEffectIntensity(effectType, progress);
      }
      
      // Apply effect-specific animations
      this.applyEffectAnimation(effectMesh, effectType, progress);
      
      requestAnimationFrame(animate);
    };
    
    animate();
  }

  /**
   * Apply effect-specific animations
   */
  applyEffectAnimation(effectMesh, effectType, progress) {
    switch (effectType) {
      case 'heart_sparkle':
        effectMesh.rotation.y += 0.02;
        effectMesh.scale.setScalar(1 + Math.sin(progress * Math.PI) * 0.3);
        break;
        
      case 'dragon_fire':
        effectMesh.rotation.z += 0.05;
        effectMesh.position.y += Math.sin(progress * Math.PI * 2) * 0.1;
        break;
        
      case 'mini_anubis_full_manifestation':
        // Complex manifestation animation
        const manifestationPhase = Math.sin(progress * Math.PI);
        effectMesh.scale.setScalar(manifestationPhase);
        effectMesh.rotation.y = progress * Math.PI * 2;
        
        // Golden aura pulsing
        if (effectMesh.material.uniforms.uIntensity) {
          effectMesh.material.uniforms.uIntensity.value = 0.5 + manifestationPhase * 0.5;
        }
        break;
    }
  }

  /**
   * Get effect duration based on gift tier
   */
  getEffectDuration(effectType) {
    const durations = {
      // Light effects (1-3 seconds)
      'heart_sparkle': 2000,
      'star_particles': 2500,
      'rainbow_wave': 3000,
      
      // Epic effects (3-5 seconds)
      'dragon_fire': 4000,
      'time_distortion': 4500,
      'galaxy_formation': 5000,
      
      // Legendary effects (5-8 seconds)
      'reality_break': 6000,
      'dimension_portal': 7000,
      'big_bang_simulation': 8000,
      
      // Ultra effects (10+ seconds)
      'mini_anubis_full_manifestation': 15000
    };
    
    return durations[effectType] || 3000;
  }

  /**
   * Get effect intensity curve
   */
  getEffectIntensity(effectType, progress) {
    // Most effects fade in and out
    if (progress < 0.2) {
      return progress / 0.2; // Fade in
    } else if (progress > 0.8) {
      return (1.0 - progress) / 0.2; // Fade out
    } else {
      return 1.0; // Full intensity
    }
  }

  /**
   * Cleanup effect
   */
  cleanupEffect(effectId) {
    const effectMesh = this.effectScene.children.find(
      child => child.userData.effectId === effectId
    );
    
    if (effectMesh) {
      this.effectScene.remove(effectMesh);
      
      // Dispose geometry and material
      if (effectMesh.geometry) effectMesh.geometry.dispose();
      if (effectMesh.material) effectMesh.material.dispose();
    }
  }

  /**
   * Find gift by ID
   */
  findGiftById(giftId) {
    for (const category of Object.values(CGIFTS_CATALOG)) {
      const gift = category.gifts.find(g => g.id === giftId);
      if (gift) return gift;
    }
    return null;
  }

  /**
   * Get gift recommendations using Isabella AI
   */
  async getGiftRecommendations(userId, recipientId, context = {}) {
    if (!this.isabellaAI) {
      return this.getDefaultRecommendations();
    }
    
    try {
      const recommendations = await this.isabellaAI.getGiftRecommendations({
        userId: userId,
        recipientId: recipientId,
        context: context,
        giftHistory: this.giftHistory.filter(g => 
          g.sender === userId || g.recipient === recipientId
        )
      });
      
      return recommendations;
    } catch (error) {
      console.error('AI recommendations failed:', error);
      return this.getDefaultRecommendations();
    }
  }

  /**
   * Get default gift recommendations
   */
  getDefaultRecommendations() {
    return [
      CGIFTS_CATALOG.LIGHT.gifts[0], // Heart Light
      CGIFTS_CATALOG.EPIC.gifts[0],  // Dragon Breath
      CGIFTS_CATALOG.LEGENDARY.gifts[0] // Reality Fracture
    ];
  }

  /**
   * Subscribe to gift events
   */
  subscribe(callback) {
    this.subscribers.add(callback);
    
    return () => {
      this.subscribers.delete(callback);
    };
  }

  /**
   * Notify subscribers of events
   */
  notifySubscribers(eventType, data) {
    const event = new CustomEvent(eventType, { detail: data });
    this.eventEmitter.dispatchEvent(event);
    
    this.subscribers.forEach(callback => {
      try {
        callback(eventType, data);
      } catch (error) {
        console.error('Subscriber callback error:', error);
      }
    });
  }

  /**
   * Get gift statistics
   */
  getGiftStatistics() {
    const stats = {
      totalGiftsSent: this.giftHistory.length,
      totalValue: this.giftHistory.reduce((sum, gift) => {
        const giftData = this.findGiftById(gift.giftId);
        return sum + (giftData ? giftData.price : 0);
      }, 0),
      activeEffects: this.effectScene.children.length,
      activeAuctions: this.auctionSystem.activeAuctions.size,
      popularGifts: this.getMostPopularGifts(),
      recentActivity: this.giftHistory.slice(-10)
    };
    
    return stats;
  }

  /**
   * Get most popular gifts
   */
  getMostPopularGifts() {
    const giftCounts = {};
    
    this.giftHistory.forEach(gift => {
      giftCounts[gift.giftId] = (giftCounts[gift.giftId] || 0) + 1;
    });
    
    return Object.entries(giftCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([giftId, count]) => ({
        gift: this.findGiftById(giftId),
        count: count
      }));
  }

  /**
   * Dispose of CGIFTS system
   */
  dispose() {
    // Cleanup active effects
    this.effectScene.children.forEach(child => {
      if (child.geometry) child.geometry.dispose();
      if (child.material) child.material.dispose();
    });
    
    // Clear data structures
    this.activeGifts.clear();
    this.particleSystems.clear();
    this.shaderLibrary.clear();
    this.subscribers.clear();
    
    console.log('CGIFTS Core disposed');
  }
}

export default CGIFTSCore;