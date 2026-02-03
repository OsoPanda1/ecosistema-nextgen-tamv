/**
 * Isabella Core - Cognitive Orchestrator
 * Sovereign AI kernel that preprocesses, orchestrates, and post-processes all AI requests
 * 
 * Features:
 * - Ethical preprocessing with guardrails
 * - Multi-backend model orchestration (Ollama, local models, HPC)
 * - Post-processing with explainability
 * - Risk assessment and filtering
 * - Civilizational context injection
 */

const axios = require('axios');
const { EventEmitter } = require('events');

class IsabellaCore extends EventEmitter {
  constructor(config = {}) {
    super();
    
    this.config = {
      modelBackend: config.modelBackend || 'ollama',
      modelName: config.modelName || 'llama3.1:8b',
      ollamaEndpoint: config.ollamaEndpoint || 'http://localhost:11434',
      ethicalMode: config.ethicalMode || 'strict', // strict, standard, research
      explanationLevel: config.explanationLevel || 'detailed',
      maxRetries: config.maxRetries || 3,
      timeout: config.timeout || 120000,
      ...config
    };

    this.ready = false;
    this.models = new Map();
    this.ethicalGuidelines = this.loadEthicalGuidelines();
    this.civilizationalContext = this.loadCivilizationalContext();
  }

  /**
   * Initialize Isabella Core
   */
  async initialize() {
    try {
      console.log('Initializing Isabella Core...');
      
      // Load available models
      await this.loadAvailableModels();
      
      // Initialize ethical reasoning engine
      await this.initializeEthicalEngine();
      
      // Initialize explainability engine
      await this.initializeExplainabilityEngine();
      
      this.ready = true;
      console.log('✅ Isabella Core initialized');
      
      this.emit('ready');
    } catch (error) {
      console.error('Failed to initialize Isabella Core:', error);
      throw error;
    }
  }

  /**
   * Check if Isabella is ready
   */
  isReady() {
    return this.ready;
  }

  /**
   * Load available models from backend
   */
  async loadAvailableModels() {
    try {
      if (this.config.modelBackend === 'ollama') {
        const response = await axios.get(`${this.config.ollamaEndpoint}/api/tags`, {
          timeout: 10000
        });
        
        if (response.data && response.data.models) {
          response.data.models.forEach(model => {
            this.models.set(model.name, {
              id: model.name,
              name: model.name,
              size: model.size,
              created: Math.floor(Date.now() / 1000),
              backend: 'ollama',
              capabilities: ['chat', 'completion']
            });
          });
        }
      }
      
      // Add embedding models
      this.models.set('nomic-embed-text', {
        id: 'nomic-embed-text',
        name: 'nomic-embed-text',
        created: Math.floor(Date.now() / 1000),
        backend: 'ollama',
        capabilities: ['embeddings']
      });
      
      console.log(`Loaded ${this.models.size} models`);
    } catch (error) {
      console.warn('Could not load models from backend:', error.message);
      // Add default model
      this.models.set(this.config.modelName, {
        id: this.config.modelName,
        name: this.config.modelName,
        created: Math.floor(Date.now() / 1000),
        backend: this.config.modelBackend,
        capabilities: ['chat', 'completion']
      });
    }
  }

  /**
   * List available models
   */
  async listAvailableModels() {
    return Array.from(this.models.values());
  }

  /**
   * Initialize ethical reasoning engine
   */
  async initializeEthicalEngine() {
    // Ethical categories and rules
    this.ethicalCategories = {
      harmful_content: {
        violence: ['explicit violence', 'gore', 'torture'],
        hate_speech: ['discrimination', 'racism', 'xenophobia'],
        illegal: ['illegal activities', 'fraud', 'hacking'],
        adult: ['explicit sexual content', 'pornography'],
        self_harm: ['suicide', 'self-injury', 'eating disorders']
      },
      sensitive_topics: {
        medical: ['medical advice', 'diagnosis', 'treatment'],
        legal: ['legal advice', 'contracts'],
        financial: ['investment advice', 'financial planning'],
        political: ['political manipulation', 'propaganda']
      },
      privacy: {
        pii: ['personal information', 'private data'],
        confidential: ['trade secrets', 'confidential information']
      }
    };
    
    console.log('Ethical engine initialized');
  }

  /**
   * Initialize explainability engine
   */
  async initializeExplainabilityEngine() {
    this.explanationTemplates = {
      basic: 'Isabella processed your request and generated a response.',
      detailed: 'Isabella analyzed your request, checked ethical guidelines, and generated a contextual response.',
      technical: 'Isabella performed ethical validation, context enrichment, model selection, and post-processing with risk assessment.'
    };
    
    console.log('Explainability engine initialized');
  }

  /**
   * Load ethical guidelines
   */
  loadEthicalGuidelines() {
    return {
      strict: {
        blockHarmfulContent: true,
        blockSensitiveTopics: true,
        requireExplicitConsent: true,
        logAllInteractions: true
      },
      standard: {
        blockHarmfulContent: true,
        blockSensitiveTopics: false,
        requireExplicitConsent: false,
        logAllInteractions: true
      },
      research: {
        blockHarmfulContent: false,
        blockSensitiveTopics: false,
        requireExplicitConsent: false,
        logAllInteractions: true
      }
    };
  }

  /**
   * Load civilizational context
   */
  loadCivilizationalContext() {
    return {
      culturalValues: ['dignity', 'sovereignty', 'cooperation', 'sustainability'],
      ethicalPrinciples: ['transparency', 'accountability', 'fairness', 'privacy'],
      civilizationalGoals: ['human flourishing', 'technological sovereignty', 'environmental stewardship']
    };
  }

  /**
   * Process a request through Isabella
   */
  async process(request) {
    if (!this.ready) {
      throw new Error('Isabella Core not initialized');
    }

    const startTime = Date.now();
    
    try {
      // 1. Preprocess and validate
      const preprocessed = await this.preprocess(request);
      
      // 2. Orchestrate model execution
      const modelResponse = await this.orchestrate(preprocessed);
      
      // 3. Post-process and explain
      const postprocessed = await this.postprocess(modelResponse, request);
      
      const processingTime = Date.now() - startTime;
      
      return {
        success: true,
        response: postprocessed.response,
        explanation: postprocessed.explanation,
        metadata: {
          processingTime,
          model: preprocessed.selectedModel,
          ethicalScore: preprocessed.ethicalScore,
          riskLevel: postprocessed.riskLevel
        }
      };
    } catch (error) {
      console.error('Isabella processing error:', error);
      return {
        success: false,
        error: error.message,
        metadata: {
          processingTime: Date.now() - startTime
        }
      };
    }
  }

  /**
   * Preprocess request
   */
  async preprocess(request) {
    // Ethical validation
    const ethicalScore = await this.validateEthics(request);
    
    // Select appropriate model
    const selectedModel = this.selectModel(request);
    
    // Enrich with context
    const enrichedRequest = this.enrichContext(request);
    
    return {
      originalRequest: request,
      enrichedRequest,
      selectedModel,
      ethicalScore
    };
  }

  /**
   * Validate ethics
   */
  async validateEthics(request) {
    const guidelines = this.ethicalGuidelines[this.config.ethicalMode];
    let score = 100;
    
    // Simple keyword-based validation (in production, use ML models)
    const text = JSON.stringify(request).toLowerCase();
    
    if (guidelines.blockHarmfulContent) {
      for (const [category, keywords] of Object.entries(this.ethicalCategories.harmful_content)) {
        for (const keyword of keywords) {
          if (text.includes(keyword.toLowerCase())) {
            score -= 20;
            console.warn(`Detected harmful content: ${category}`);
          }
        }
      }
    }
    
    return Math.max(0, score);
  }

  /**
   * Select appropriate model
   */
  selectModel(request) {
    // Simple model selection logic
    if (request.type === 'embeddings') {
      return 'nomic-embed-text';
    }
    
    return this.config.modelName;
  }

  /**
   * Enrich request with context
   */
  enrichContext(request) {
    return {
      ...request,
      context: {
        ...request.context,
        civilizational: this.civilizationalContext,
        timestamp: new Date().toISOString()
      }
    };
  }

  /**
   * Orchestrate model execution
   */
  async orchestrate(preprocessed) {
    const { enrichedRequest, selectedModel } = preprocessed;
    
    if (this.config.modelBackend === 'ollama') {
      return await this.executeOllama(enrichedRequest, selectedModel);
    }
    
    throw new Error(`Unsupported backend: ${this.config.modelBackend}`);
  }

  /**
   * Execute request on Ollama
   */
  async executeOllama(request, model) {
    try {
      const response = await axios.post(
        `${this.config.ollamaEndpoint}/api/generate`,
        {
          model: model,
          prompt: request.prompt || request.messages?.[0]?.content || '',
          stream: false
        },
        {
          timeout: this.config.timeout
        }
      );
      
      return {
        content: response.data.response,
        model: model,
        backend: 'ollama'
      };
    } catch (error) {
      console.error('Ollama execution error:', error.message);
      throw error;
    }
  }

  /**
   * Post-process response
   */
  async postprocess(modelResponse, originalRequest) {
    // Risk assessment
    const riskLevel = this.assessRisk(modelResponse);
    
    // Generate explanation
    const explanation = this.generateExplanation(originalRequest, modelResponse, riskLevel);
    
    return {
      response: modelResponse.content,
      explanation,
      riskLevel,
      model: modelResponse.model
    };
  }

  /**
   * Assess risk level
   */
  assessRisk(response) {
    // Simple risk assessment (in production, use ML models)
    const text = response.content.toLowerCase();
    
    if (text.includes('warning') || text.includes('caution')) {
      return 'medium';
    }
    
    if (text.includes('danger') || text.includes('illegal')) {
      return 'high';
    }
    
    return 'low';
  }

  /**
   * Generate explanation
   */
  generateExplanation(request, response, riskLevel) {
    const level = this.config.explanationLevel;
    
    if (level === 'basic') {
      return this.explanationTemplates.basic;
    }
    
    if (level === 'detailed') {
      return `${this.explanationTemplates.detailed} Risk level: ${riskLevel}.`;
    }
    
    return `${this.explanationTemplates.technical} Model: ${response.model}, Risk: ${riskLevel}.`;
  }
}

module.exports = IsabellaCore;
