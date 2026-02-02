/**
 * CGIFTS XR Integration
 * WebXR integration for CGIFTS with TAMV 4D renderer
 * Provides immersive 3D gift experiences in VR/AR
 */

import * as THREE from 'three';
import { TAMV4DRenderer } from '../../xr-engine/tamv-4d-renderer.js';
import { CGIFTSCore } from '../cgifts-core.js';

/**
 * CGIFTS XR Integration Class
 */
export class CGIFTSXRIntegration {
  constructor(config = {}) {
    this.config = {
      enableVR: true,
      enableAR: true,
      enableHaptics: true,
      enableSpatialAudio: true,
      maxConcurrentEffects: 20,
      effectLOD: true, // Level of Detail optimization
      ...config
    };

    // Core systems
    this.tamv4D = null;
    this.cgiftsCore = null;
    
    // XR specific components
    this.xrSession = null;
    this.xrSpace = null;
    this.xrControllers = [];
    this.xrHands = [];
    
    // Gift effect management
    this.activeEffects = new Map();
    this.effectPool = new Map();
    this.spatialGifts = new Map();
    
    // Interaction system
    this.interactionRaycaster = new THREE.Raycaster();
    this.interactionObjects = [];
    this.selectedObject = null;
    
    // Spatial audio
    this.audioListener = null;
    this.audioContext = null;
    
    // Performance optimization
    this.lodManager = null;
    this.frustumCuller = null;
    
    this.initialize();
  }

  /**
   * Initialize XR integration
   */
  async initialize() {
    try {
      await this.initializeTAMV4D();
      await this.initializeCGIFTS();
      await this.initializeXRSystems();
      await this.initializeSpatialAudio();
      await this.initializeInteractionSystem();
      await this.initializePerformanceOptimization();
      
      console.log('CGIFTS XR Integration initialized successfully');
    } catch (error) {
      console.error('Failed to initialize CGIFTS XR Integration:', error);
      throw error;
    }
  }

  /**
   * Initialize TAMV 4D renderer
   */
  async initializeTAMV4D() {
    this.tamv4D = new TAMV4DRenderer({
      enableVR: this.config.enableVR,
      enableAR: this.config.enableAR,
      enable4D: true,
      enableQuantumPhysics: true,
      enableAITextures: true,
      enableHaptics: this.config.enableHaptics,
      renderQuality: 'ultra'
    });

    // Get XR-enabled scene and camera
    this.xrScene = this.tamv4D.scene;
    this.xrCamera = this.tamv4D.camera;
    this.xrRenderer = this.tamv4D.renderer;
  }

  /**
   * Initialize CGIFTS core
   */
  async initializeCGIFTS() {
    this.cgiftsCore = new CGIFTSCore({
      enableXR: true,
      enable3DEffects: true,
      enableBlockchain: true,
      maxConcurrentEffects: this.config.maxConcurrentEffects
    });

    // Subscribe to gift events
    this.cgiftsCore.subscribe((eventType, data) => {
      this.handleCGIFTSEvent(eventType, data);
    });
  }

  /**
   * Initialize XR systems
   */
  async initializeXRSystems() {
    if (!navigator.xr) {
      console.warn('WebXR not supported');
      return;
    }

    // Check XR support
    const vrSupported = await navigator.xr.isSessionSupported('immersive-vr');
    const arSupported = await navigator.xr.isSessionSupported('immersive-ar');

    if (vrSupported) {
      await this.setupVRSystem();
    }

    if (arSupported) {
      await this.setupARSystem();
    }

    // Setup hand tracking if available
    await this.setupHandTracking();
  }

  /**
   * Setup VR system
   */
  async setupVRSystem() {
    // VR session configuration
    const sessionInit = {
      requiredFeatures: ['local-floor'],
      optionalFeatures: ['hand-tracking', 'eye-tracking', 'hit-test']
    };

    // Setup VR controllers
    this.setupVRControllers();
    
    // Setup VR interaction zones
    this.setupVRInteractionZones();
  }

  /**
   * Setup VR controllers
   */
  setupVRControllers() {
    // Controller 1
    const controller1 = this.xrRenderer.xr.getController(0);
    controller1.addEventListener('selectstart', (event) => this.onControllerSelect(event, 0));
    controller1.addEventListener('selectend', (event) => this.onControllerRelease(event, 0));
    controller1.addEventListener('squeezestart', (event) => this.onControllerSqueeze(event, 0));
    this.xrScene.add(controller1);

    // Controller 2
    const controller2 = this.xrRenderer.xr.getController(1);
    controller2.addEventListener('selectstart', (event) => this.onControllerSelect(event, 1));
    controller2.addEventListener('selectend', (event) => this.onControllerRelease(event, 1));
    controller2.addEventListener('squeezestart', (event) => this.onControllerSqueeze(event, 1));
    this.xrScene.add(controller2);

    this.xrControllers = [controller1, controller2];

    // Add controller models and rays
    this.addControllerModelsAndRays();
  }

  /**
   * Add controller models and interaction rays
   */
  addControllerModelsAndRays() {
    this.xrControllers.forEach((controller, index) => {
      // Interaction ray
      const geometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 0, -1)
      ]);
      
      const material = new THREE.LineBasicMaterial({ 
        color: 0x00ff88,
        transparent: true,
        opacity: 0.7
      });
      
      const line = new THREE.Line(geometry, material);
      line.name = 'ray';
      line.scale.z = 5;
      controller.add(line);

      // Gift selection indicator
      const indicatorGeometry = new THREE.RingGeometry(0.02, 0.04, 16);
      const indicatorMaterial = new THREE.MeshBasicMaterial({
        color: 0x00ff88,
        transparent: true,
        opacity: 0.8,
        side: THREE.DoubleSide
      });
      
      const indicator = new THREE.Mesh(indicatorGeometry, indicatorMaterial);
      indicator.name = 'gift-indicator';
      indicator.visible = false;
      controller.add(indicator);
    });
  }

  /**
   * Setup VR interaction zones
   */
  setupVRInteractionZones() {
    // Gift palette zone (left hand area)
    const paletteZone = this.createGiftPalette();
    paletteZone.position.set(-0.5, 1.2, -0.3);
    this.xrScene.add(paletteZone);

    // Auction zone (right hand area)
    const auctionZone = this.createAuctionZone();
    auctionZone.position.set(0.5, 1.2, -0.3);
    this.xrScene.add(auctionZone);

    // Mini Anubis manifestation zone (center)
    const anubisZone = this.createAnubisZone();
    anubisZone.position.set(0, 1.5, -1);
    this.xrScene.add(anubisZone);
  }

  /**
   * Create gift palette for VR selection
   */
  createGiftPalette() {
    const paletteGroup = new THREE.Group();
    paletteGroup.name = 'gift-palette';

    // Create gift preview spheres
    const gifts = [
      ...this.cgiftsCore.constructor.CGIFTS_CATALOG.LIGHT.gifts.slice(0, 3),
      ...this.cgiftsCore.constructor.CGIFTS_CATALOG.EPIC.gifts.slice(0, 2),
      ...this.cgiftsCore.constructor.CGIFTS_CATALOG.LEGENDARY.gifts.slice(0, 1)
    ];

    gifts.forEach((gift, index) => {
      const giftSphere = this.createGiftPreviewSphere(gift);
      
      // Arrange in a circle
      const angle = (index / gifts.length) * Math.PI * 2;
      const radius = 0.15;
      giftSphere.position.set(
        Math.cos(angle) * radius,
        Math.sin(angle) * radius * 0.5,
        0
      );
      
      paletteGroup.add(giftSphere);
    });

    return paletteGroup;
  }

  /**
   * Create gift preview sphere
   */
  createGiftPreviewSphere(gift) {
    const geometry = new THREE.SphereGeometry(0.03, 16, 16);
    
    // Color based on gift category
    let color = 0x888888;
    if (gift.price <= 10) color = 0x4CAF50; // Light - Green
    else if (gift.price <= 50) color = 0x2196F3; // Epic - Blue
    else if (gift.price <= 100) color = 0x9C27B0; // Legendary - Purple
    else color = 0xFFD700; // Ultra - Gold

    const material = new THREE.MeshStandardMaterial({
      color: color,
      emissive: color,
      emissiveIntensity: 0.2,
      transparent: true,
      opacity: 0.8
    });

    const sphere = new THREE.Mesh(geometry, material);
    sphere.userData.gift = gift;
    sphere.userData.interactive = true;
    sphere.userData.type = 'gift-preview';

    // Add hover animation
    sphere.userData.originalScale = sphere.scale.clone();
    sphere.userData.hoverScale = sphere.scale.clone().multiplyScalar(1.2);

    return sphere;
  }

  /**
   * Create auction zone
   */
  createAuctionZone() {
    const auctionGroup = new THREE.Group();
    auctionGroup.name = 'auction-zone';

    // Auction pedestal
    const pedestalGeometry = new THREE.CylinderGeometry(0.08, 0.1, 0.15, 16);
    const pedestalMaterial = new THREE.MeshStandardMaterial({
      color: 0xFFD700,
      metalness: 0.8,
      roughness: 0.2
    });
    
    const pedestal = new THREE.Mesh(pedestalGeometry, pedestalMaterial);
    pedestal.position.y = -0.075;
    auctionGroup.add(pedestal);

    // Auction info display
    const displayGeometry = new THREE.PlaneGeometry(0.2, 0.1);
    const displayMaterial = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.8
    });
    
    const display = new THREE.Mesh(displayGeometry, displayMaterial);
    display.position.set(0, 0.1, 0);
    display.userData.type = 'auction-display';
    auctionGroup.add(display);

    return auctionGroup;
  }

  /**
   * Create Mini Anubis manifestation zone
   */
  createAnubisZone() {
    const anubisGroup = new THREE.Group();
    anubisGroup.name = 'anubis-zone';

    // Sacred circle
    const circleGeometry = new THREE.RingGeometry(0.3, 0.32, 32);
    const circleMaterial = new THREE.MeshBasicMaterial({
      color: 0xFFD700,
      transparent: true,
      opacity: 0.6,
      side: THREE.DoubleSide
    });
    
    const circle = new THREE.Mesh(circleGeometry, circleMaterial);
    circle.rotation.x = -Math.PI / 2;
    anubisGroup.add(circle);

    // Manifestation particles
    const particleGeometry = new THREE.BufferGeometry();
    const particleCount = 100;
    const positions = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      const radius = 0.31;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = Math.random() * 0.5;
      positions[i * 3 + 2] = Math.sin(angle) * radius;
    }
    
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const particleMaterial = new THREE.PointsMaterial({
      color: 0xFFD700,
      size: 0.01,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });
    
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    anubisGroup.add(particles);

    // Animate particles
    anubisGroup.userData.animateParticles = () => {
      particles.rotation.y += 0.01;
      const positions = particles.geometry.attributes.position.array;
      for (let i = 0; i < particleCount; i++) {
        positions[i * 3 + 1] += Math.sin(Date.now() * 0.001 + i) * 0.001;
      }
      particles.geometry.attributes.position.needsUpdate = true;
    };

    return anubisGroup;
  }

  /**
   * Setup AR system
   */
  async setupARSystem() {
    // AR session configuration
    const sessionInit = {
      requiredFeatures: ['hit-test'],
      optionalFeatures: ['dom-overlay', 'light-estimation']
    };

    // Setup AR hit testing
    this.setupARHitTesting();
    
    // Setup AR gift placement
    this.setupARGiftPlacement();
  }

  /**
   * Setup hand tracking
   */
  async setupHandTracking() {
    if (!this.xrRenderer.xr.getHand) return;

    // Hand 1
    const hand1 = this.xrRenderer.xr.getHand(0);
    hand1.addEventListener('pinchstart', (event) => this.onHandPinch(event, 0));
    hand1.addEventListener('pinchend', (event) => this.onHandRelease(event, 0));
    this.xrScene.add(hand1);

    // Hand 2
    const hand2 = this.xrRenderer.xr.getHand(1);
    hand2.addEventListener('pinchstart', (event) => this.onHandPinch(event, 1));
    hand2.addEventListener('pinchend', (event) => this.onHandRelease(event, 1));
    this.xrScene.add(hand2);

    this.xrHands = [hand1, hand2];
  }

  /**
   * Initialize spatial audio
   */
  async initializeSpatialAudio() {
    if (!this.config.enableSpatialAudio) return;

    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.audioListener = new THREE.AudioListener();
      this.xrCamera.add(this.audioListener);

      // Load gift sound effects
      await this.loadGiftSounds();
    } catch (error) {
      console.warn('Spatial audio initialization failed:', error);
    }
  }

  /**
   * Load gift sound effects
   */
  async loadGiftSounds() {
    const audioLoader = new THREE.AudioLoader();
    
    const soundEffects = {
      'heart_sparkle': '/assets/sounds/heart_sparkle.mp3',
      'dragon_fire': '/assets/sounds/dragon_fire.mp3',
      'mini_anubis_full_manifestation': '/assets/sounds/anubis_manifestation.mp3'
    };

    for (const [effectName, soundPath] of Object.entries(soundEffects)) {
      try {
        const buffer = await new Promise((resolve, reject) => {
          audioLoader.load(soundPath, resolve, undefined, reject);
        });
        
        this.effectPool.set(`sound_${effectName}`, buffer);
      } catch (error) {
        console.warn(`Failed to load sound effect ${effectName}:`, error);
      }
    }
  }

  /**
   * Initialize interaction system
   */
  async initializeInteractionSystem() {
    // Setup raycasting for object selection
    this.interactionRaycaster.far = 10;
    
    // Add interaction objects to the list
    this.updateInteractionObjects();
  }

  /**
   * Update interaction objects list
   */
  updateInteractionObjects() {
    this.interactionObjects = [];
    
    this.xrScene.traverse((object) => {
      if (object.userData.interactive) {
        this.interactionObjects.push(object);
      }
    });
  }

  /**
   * Initialize performance optimization
   */
  async initializePerformanceOptimization() {
    if (!this.config.effectLOD) return;

    // Level of Detail manager
    this.lodManager = {
      updateLOD: (camera) => {
        this.activeEffects.forEach((effect, id) => {
          const distance = camera.position.distanceTo(effect.position);
          
          // Adjust effect quality based on distance
          if (distance > 10) {
            effect.visible = false;
          } else if (distance > 5) {
            this.setEffectLOD(effect, 'low');
          } else if (distance > 2) {
            this.setEffectLOD(effect, 'medium');
          } else {
            this.setEffectLOD(effect, 'high');
          }
        });
      }
    };

    // Frustum culling
    this.frustumCuller = new THREE.Frustum();
  }

  /**
   * Set effect Level of Detail
   */
  setEffectLOD(effect, level) {
    if (!effect.material) return;

    switch (level) {
      case 'low':
        if (effect.geometry && effect.geometry.attributes.position) {
          const positions = effect.geometry.attributes.position.array;
          // Reduce particle count for distant effects
          effect.geometry.setDrawRange(0, Math.floor(positions.length / 9));
        }
        break;
      case 'medium':
        if (effect.geometry && effect.geometry.attributes.position) {
          const positions = effect.geometry.attributes.position.array;
          effect.geometry.setDrawRange(0, Math.floor(positions.length / 3));
        }
        break;
      case 'high':
        if (effect.geometry && effect.geometry.attributes.position) {
          effect.geometry.setDrawRange(0, Infinity);
        }
        break;
    }
  }

  /**
   * Handle CGIFTS events
   */
  handleCGIFTSEvent(eventType, data) {
    switch (eventType) {
      case 'gift_sent':
        this.displayGiftEffect(data);
        break;
      case 'auction_created':
        this.displayAuctionNotification(data);
        break;
      case 'bid_placed':
        this.displayBidEffect(data);
        break;
    }
  }

  /**
   * Display gift effect in XR space
   */
  async displayGiftEffect(transaction) {
    try {
      const gift = this.cgiftsCore.findGiftById(transaction.giftId);
      if (!gift) return;

      // Create 3D effect
      const effectMesh = await this.createXRGiftEffect(gift, transaction);
      
      // Position effect
      if (transaction.metadata && transaction.metadata.position) {
        effectMesh.position.copy(transaction.metadata.position);
      } else {
        // Default position in front of user
        effectMesh.position.set(0, 1.5, -2);
      }

      // Add to scene
      this.xrScene.add(effectMesh);
      this.activeEffects.set(transaction.id, effectMesh);

      // Play spatial audio
      this.playGiftSound(gift.effect, effectMesh.position);

      // Trigger haptic feedback
      this.triggerHapticFeedback(gift.category);

      // Schedule cleanup
      setTimeout(() => {
        this.cleanupGiftEffect(transaction.id);
      }, this.getEffectDuration(gift.effect));

    } catch (error) {
      console.error('Failed to display gift effect:', error);
    }
  }

  /**
   * Create XR-optimized gift effect
   */
  async createXRGiftEffect(gift, transaction) {
    const effectType = gift.effect;
    
    switch (effectType) {
      case 'heart_sparkle':
        return this.createHeartSparkleXR(gift, transaction);
      case 'dragon_fire':
        return this.createDragonFireXR(gift, transaction);
      case 'mini_anubis_full_manifestation':
        return this.createMiniAnubisXR(gift, transaction);
      default:
        return this.createDefaultEffectXR(gift, transaction);
    }
  }

  /**
   * Create heart sparkle effect for XR
   */
  createHeartSparkleXR(gift, transaction) {
    const group = new THREE.Group();
    
    // Heart-shaped particle system
    const particleCount = 200;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    
    for (let i = 0; i < particleCount; i++) {
      // Heart shape parametric equations
      const t = (i / particleCount) * Math.PI * 2;
      const x = 16 * Math.pow(Math.sin(t), 3);
      const y = 13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t);
      
      positions[i * 3] = x * 0.02;
      positions[i * 3 + 1] = y * 0.02;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 0.5;
      
      // Pink/red colors
      colors[i * 3] = 1.0;
      colors[i * 3 + 1] = 0.2 + Math.random() * 0.3;
      colors[i * 3 + 2] = 0.4 + Math.random() * 0.3;
      
      sizes[i] = Math.random() * 0.02 + 0.01;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    const material = new THREE.PointsMaterial({
      size: 0.02,
      transparent: true,
      opacity: 0.8,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true
    });
    
    const particles = new THREE.Points(geometry, material);
    group.add(particles);
    
    // Animation
    group.userData.animate = () => {
      particles.rotation.z += 0.02;
      const time = Date.now() * 0.001;
      material.opacity = 0.8 + Math.sin(time * 3) * 0.2;
    };
    
    return group;
  }

  /**
   * Create dragon fire effect for XR
   */
  createDragonFireXR(gift, transaction) {
    const group = new THREE.Group();
    
    // Fire particle system with volumetric appearance
    const particleCount = 500;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    const lifetimes = new Float32Array(particleCount);
    
    for (let i = 0; i < particleCount; i++) {
      // Initial positions (dragon mouth area)
      positions[i * 3] = (Math.random() - 0.5) * 0.2;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 0.1;
      positions[i * 3 + 2] = 0;
      
      // Fire velocities
      velocities[i * 3] = (Math.random() - 0.5) * 0.02;
      velocities[i * 3 + 1] = Math.random() * 0.05 + 0.02;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.01;
      
      // Fire colors (orange to red)
      const heat = Math.random();
      colors[i * 3] = 1.0;
      colors[i * 3 + 1] = 0.3 + heat * 0.4;
      colors[i * 3 + 2] = heat * 0.2;
      
      sizes[i] = Math.random() * 0.05 + 0.02;
      lifetimes[i] = Math.random();
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    const material = new THREE.PointsMaterial({
      size: 0.03,
      transparent: true,
      opacity: 0.7,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true
    });
    
    const particles = new THREE.Points(geometry, material);
    group.add(particles);
    
    // Fire animation
    group.userData.animate = () => {
      const positions = particles.geometry.attributes.position.array;
      const colors = particles.geometry.attributes.color.array;
      
      for (let i = 0; i < particleCount; i++) {
        // Update positions
        positions[i * 3] += velocities[i * 3];
        positions[i * 3 + 1] += velocities[i * 3 + 1];
        positions[i * 3 + 2] += velocities[i * 3 + 2];
        
        // Update lifetime
        lifetimes[i] += 0.02;
        
        // Reset particles that have lived too long
        if (lifetimes[i] > 1.0) {
          positions[i * 3] = (Math.random() - 0.5) * 0.2;
          positions[i * 3 + 1] = (Math.random() - 0.5) * 0.1;
          positions[i * 3 + 2] = 0;
          lifetimes[i] = 0;
        }
        
        // Fade out over lifetime
        const alpha = 1.0 - lifetimes[i];
        colors[i * 3 + 1] = (0.3 + Math.random() * 0.4) * alpha;
      }
      
      particles.geometry.attributes.position.needsUpdate = true;
      particles.geometry.attributes.color.needsUpdate = true;
    };
    
    return group;
  }

  /**
   * Create Mini Anubis manifestation effect for XR
   */
  createMiniAnubisXR(gift, transaction) {
    const group = new THREE.Group();
    
    // Sacred geometry base
    const baseGeometry = new THREE.CylinderGeometry(0.3, 0.35, 0.1, 8);
    const baseMaterial = new THREE.MeshStandardMaterial({
      color: 0x8B4513,
      metalness: 0.3,
      roughness: 0.7
    });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.position.y = -0.05;
    group.add(base);
    
    // Anubis figure (simplified)
    const anubisGeometry = new THREE.ConeGeometry(0.1, 0.4, 8);
    const anubisMaterial = new THREE.MeshStandardMaterial({
      color: 0x000000,
      metalness: 0.8,
      roughness: 0.2,
      emissive: 0x444444
    });
    const anubis = new THREE.Mesh(anubisGeometry, anubisMaterial);
    anubis.position.y = 0.2;
    group.add(anubis);
    
    // Golden aura particles
    const auraCount = 300;
    const auraGeometry = new THREE.BufferGeometry();
    const auraPositions = new Float32Array(auraCount * 3);
    const auraColors = new Float32Array(auraCount * 3);
    
    for (let i = 0; i < auraCount; i++) {
      const radius = 0.4 + Math.random() * 0.3;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      
      auraPositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      auraPositions[i * 3 + 1] = radius * Math.cos(phi);
      auraPositions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
      
      // Golden colors
      auraColors[i * 3] = 1.0;
      auraColors[i * 3 + 1] = 0.8 + Math.random() * 0.2;
      auraColors[i * 3 + 2] = 0.2 + Math.random() * 0.3;
    }
    
    auraGeometry.setAttribute('position', new THREE.BufferAttribute(auraPositions, 3));
    auraGeometry.setAttribute('color', new THREE.BufferAttribute(auraColors, 3));
    
    const auraMaterial = new THREE.PointsMaterial({
      size: 0.01,
      transparent: true,
      opacity: 0.8,
      vertexColors: true,
      blending: THREE.AdditiveBlending
    });
    
    const aura = new THREE.Points(auraGeometry, auraMaterial);
    group.add(aura);
    
    // Divine light
    const light = new THREE.PointLight(0xFFD700, 2, 5);
    light.position.y = 0.5;
    group.add(light);
    
    // Animation
    group.userData.animate = () => {
      const time = Date.now() * 0.001;
      
      // Rotate aura
      aura.rotation.y += 0.01;
      
      // Pulsing light
      light.intensity = 2 + Math.sin(time * 2) * 0.5;
      
      // Anubis levitation
      anubis.position.y = 0.2 + Math.sin(time * 1.5) * 0.05;
      anubis.rotation.y += 0.005;
      
      // Sacred energy waves
      const positions = aura.geometry.attributes.position.array;
      for (let i = 0; i < auraCount; i++) {
        const originalRadius = Math.sqrt(
          positions[i * 3] * positions[i * 3] +
          positions[i * 3 + 1] * positions[i * 3 + 1] +
          positions[i * 3 + 2] * positions[i * 3 + 2]
        );
        const wave = Math.sin(time * 3 + originalRadius * 10) * 0.02;
        
        positions[i * 3] *= (1 + wave);
        positions[i * 3 + 1] *= (1 + wave);
        positions[i * 3 + 2] *= (1 + wave);
      }
      aura.geometry.attributes.position.needsUpdate = true;
    };
    
    return group;
  }

  /**
   * Create default effect for XR
   */
  createDefaultEffectXR(gift, transaction) {
    const group = new THREE.Group();
    
    // Simple sparkle effect
    const geometry = new THREE.SphereGeometry(0.1, 16, 16);
    const material = new THREE.MeshBasicMaterial({
      color: 0x00ff88,
      transparent: true,
      opacity: 0.7
    });
    
    const sphere = new THREE.Mesh(geometry, material);
    group.add(sphere);
    
    group.userData.animate = () => {
      sphere.rotation.x += 0.02;
      sphere.rotation.y += 0.03;
      const time = Date.now() * 0.001;
      material.opacity = 0.7 + Math.sin(time * 4) * 0.3;
    };
    
    return group;
  }

  /**
   * Play spatial audio for gift
   */
  playGiftSound(effectType, position) {
    if (!this.audioListener || !this.config.enableSpatialAudio) return;

    const soundBuffer = this.effectPool.get(`sound_${effectType}`);
    if (!soundBuffer) return;

    try {
      const sound = new THREE.PositionalAudio(this.audioListener);
      sound.setBuffer(soundBuffer);
      sound.setRefDistance(1);
      sound.setVolume(0.5);
      
      // Create temporary object for sound positioning
      const soundObject = new THREE.Object3D();
      soundObject.position.copy(position);
      soundObject.add(sound);
      this.xrScene.add(soundObject);
      
      sound.play();
      
      // Remove after sound finishes
      sound.onEnded = () => {
        this.xrScene.remove(soundObject);
      };
    } catch (error) {
      console.warn('Failed to play gift sound:', error);
    }
  }

  /**
   * Trigger haptic feedback
   */
  triggerHapticFeedback(giftCategory) {
    if (!this.config.enableHaptics) return;

    const intensity = this.getHapticIntensity(giftCategory);
    const duration = this.getHapticDuration(giftCategory);

    this.xrControllers.forEach(controller => {
      if (controller.gamepad && controller.gamepad.hapticActuators) {
        controller.gamepad.hapticActuators[0].pulse(intensity, duration);
      }
    });
  }

  /**
   * Get haptic intensity based on gift category
   */
  getHapticIntensity(category) {
    switch (category) {
      case 'LIGHT': return 0.3;
      case 'EPIC': return 0.6;
      case 'LEGENDARY': return 0.8;
      case 'ULTRA': return 1.0;
      default: return 0.5;
    }
  }

  /**
   * Get haptic duration based on gift category
   */
  getHapticDuration(category) {
    switch (category) {
      case 'LIGHT': return 100;
      case 'EPIC': return 200;
      case 'LEGENDARY': return 300;
      case 'ULTRA': return 500;
      default: return 150;
    }
  }

  /**
   * Get effect duration
   */
  getEffectDuration(effectType) {
    const durations = {
      'heart_sparkle': 3000,
      'dragon_fire': 5000,
      'mini_anubis_full_manifestation': 10000
    };
    
    return durations[effectType] || 4000;
  }

  /**
   * Controller select event handler
   */
  onControllerSelect(event, controllerIndex) {
    const controller = this.xrControllers[controllerIndex];
    
    // Raycast for interaction
    this.interactionRaycaster.setFromXRController(controller);
    const intersects = this.interactionRaycaster.intersectObjects(this.interactionObjects);
    
    if (intersects.length > 0) {
      const object = intersects[0].object;
      this.handleObjectInteraction(object, 'select', controller);
    }
  }

  /**
   * Controller release event handler
   */
  onControllerRelease(event, controllerIndex) {
    const controller = this.xrControllers[controllerIndex];
    
    if (this.selectedObject) {
      this.handleObjectInteraction(this.selectedObject, 'release', controller);
      this.selectedObject = null;
    }
  }

  /**
   * Controller squeeze event handler
   */
  onControllerSqueeze(event, controllerIndex) {
    const controller = this.xrControllers[controllerIndex];
    
    // Trigger special action (e.g., open gift menu)
    this.openGiftMenu(controller);
  }

  /**
   * Hand pinch event handler
   */
  onHandPinch(event, handIndex) {
    const hand = this.xrHands[handIndex];
    
    // Similar to controller select but for hand tracking
    this.handleHandInteraction(hand, 'pinch');
  }

  /**
   * Hand release event handler
   */
  onHandRelease(event, handIndex) {
    const hand = this.xrHands[handIndex];
    
    this.handleHandInteraction(hand, 'release');
  }

  /**
   * Handle object interaction
   */
  handleObjectInteraction(object, action, controller) {
    if (!object.userData.interactive) return;

    switch (object.userData.type) {
      case 'gift-preview':
        this.handleGiftPreviewInteraction(object, action, controller);
        break;
      case 'auction-display':
        this.handleAuctionInteraction(object, action, controller);
        break;
    }
  }

  /**
   * Handle gift preview interaction
   */
  handleGiftPreviewInteraction(object, action, controller) {
    const gift = object.userData.gift;
    
    if (action === 'select') {
      // Highlight gift
      object.scale.copy(object.userData.hoverScale);
      object.material.emissiveIntensity = 0.5;
      
      // Show gift info
      this.showGiftInfo(gift, controller.position);
      
      this.selectedObject = object;
    } else if (action === 'release') {
      // Send gift
      this.sendGiftFromXR(gift, controller.position);
      
      // Reset appearance
      object.scale.copy(object.userData.originalScale);
      object.material.emissiveIntensity = 0.2;
    }
  }

  /**
   * Send gift from XR interface
   */
  async sendGiftFromXR(gift, position) {
    try {
      // TODO: Get recipient from XR context
      const recipientId = 'recipient_123'; // Placeholder
      
      await this.cgiftsCore.sendGift(gift.id, 'sender_123', recipientId, {
        position: position,
        intensity: 1.0
      });
      
      console.log(`Gift ${gift.name} sent from XR interface`);
    } catch (error) {
      console.error('Failed to send gift from XR:', error);
    }
  }

  /**
   * Show gift info in XR space
   */
  showGiftInfo(gift, position) {
    // Create floating info panel
    const infoGroup = new THREE.Group();
    
    // Background panel
    const panelGeometry = new THREE.PlaneGeometry(0.3, 0.2);
    const panelMaterial = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.8
    });
    const panel = new THREE.Mesh(panelGeometry, panelMaterial);
    infoGroup.add(panel);
    
    // TODO: Add text rendering for gift name and price
    
    infoGroup.position.copy(position);
    infoGroup.position.y += 0.2;
    this.xrScene.add(infoGroup);
    
    // Remove after 3 seconds
    setTimeout(() => {
      this.xrScene.remove(infoGroup);
    }, 3000);
  }

  /**
   * Open gift menu
   */
  openGiftMenu(controller) {
    // TODO: Implement XR gift menu interface
    console.log('Opening gift menu in XR');
  }

  /**
   * Handle hand interaction
   */
  handleHandInteraction(hand, action) {
    // TODO: Implement hand tracking interactions
    console.log(`Hand ${action} detected`);
  }

  /**
   * Cleanup gift effect
   */
  cleanupGiftEffect(transactionId) {
    const effect = this.activeEffects.get(transactionId);
    if (effect) {
      this.xrScene.remove(effect);
      
      // Dispose geometry and materials
      effect.traverse((child) => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach(material => material.dispose());
          } else {
            child.material.dispose();
          }
        }
      });
      
      this.activeEffects.delete(transactionId);
    }
  }

  /**
   * Update XR integration (called every frame)
   */
  update() {
    // Update LOD system
    if (this.lodManager) {
      this.lodManager.updateLOD(this.xrCamera);
    }
    
    // Update active effects
    this.activeEffects.forEach((effect) => {
      if (effect.userData.animate) {
        effect.userData.animate();
      }
    });
    
    // Update interaction objects
    this.updateInteractionObjects();
    
    // Update Anubis zone animation
    const anubisZone = this.xrScene.getObjectByName('anubis-zone');
    if (anubisZone && anubisZone.userData.animateParticles) {
      anubisZone.userData.animateParticles();
    }
  }

  /**
   * Dispose of XR integration
   */
  dispose() {
    // Cleanup active effects
    this.activeEffects.forEach((effect, id) => {
      this.cleanupGiftEffect(id);
    });
    
    // Dispose audio context
    if (this.audioContext) {
      this.audioContext.close();
    }
    
    // Clear data structures
    this.activeEffects.clear();
    this.effectPool.clear();
    this.spatialGifts.clear();
    this.interactionObjects.length = 0;
    
    console.log('CGIFTS XR Integration disposed');
  }
}

export default CGIFTSXRIntegration;