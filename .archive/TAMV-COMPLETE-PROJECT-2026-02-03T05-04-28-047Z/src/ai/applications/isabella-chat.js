/**
 * Isabella Chat - IA Conversacional Ética
 * Asistente IA que entiende contexto, documentos y mantiene conversaciones naturales
 * 
 * Tecnología: Modelos de lenguaje con supervisión ética y explicabilidad
 * Características: 3 niveles de explicación, supervisión humana, contexto persistente
 * Casos de uso: Soporte técnico, tutoría UTAMV, navegación DreamSpaces, moderación
 */

const { OpenAI } = require('openai');
const { v4: uuidv4 } = require('uuid');
const natural = require('natural');
const fs = require('fs').promises;

class IsabellaChat {
    constructor() {
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });
        
        this.conversationHistory = new Map();
        this.contextDatabase = new Map();
        this.ethicalGuidelines = this.loadEthicalGuidelines();
        this.explanationLevels = ['basic', 'detailed', 'technical'];
        this.maxContextLength = 4000;
        this.confidenceThreshold = 0.7;
        
        // Inicializar componentes de supervisión ética
        this.ethicalSupervisor = new EthicalSupervisor();
        this.explanationEngine = new ExplanationEngine();
        this.contextManager = new ContextManager();
    }

    /**
     * Procesa un mensaje del usuario con supervisión ética completa
     * @param {string} message - Mensaje del usuario
     * @param {Object} context - Contexto de la conversación
     * @param {Object} userProfile - Perfil del usuario
     * @param {string} explanationLevel - Nivel de explicación deseado
     * @returns {Promise<Object>} Respuesta con explicaciones y metadatos
     */
    async processMessage(message, context = {}, userProfile = {}, explanationLevel = 'basic') {
        try {
            const conversationId = context.conversationId || uuidv4();
            const startTime = Date.now();

            // 1. Validación ética inicial
            const ethicalCheck = await this.ethicalSupervisor.validateEthicalCompliance(message, context);
            if (!ethicalCheck.approved) {
                return this.generateEthicalResponse(ethicalCheck.reason, explanationLevel);
            }

            // 2. Análisis de contexto y intención
            const contextAnalysis = await this.contextManager.analyzeContext(message, context, userProfile);
            
            // 3. Recuperar historial de conversación
            const conversationHistory = this.getConversationHistory(conversationId);
            
            // 4. Generar respuesta contextual
            const response = await this.generateContextualResponse(
                message, 
                contextAnalysis, 
                conversationHistory, 
                userProfile
            );

            // 5. Supervisión ética de la respuesta
            const responseEthicalCheck = await this.ethicalSupervisor.validateResponse(response, context);
            if (!responseEthicalCheck.approved) {
                return this.generateEthicalResponse(responseEthicalCheck.reason, explanationLevel);
            }

            // 6. Generar explicaciones según el nivel solicitado
            const explanations = await this.explanationEngine.generateExplanations(
                message, 
                response, 
                contextAnalysis, 
                explanationLevel
            );

            // 7. Actualizar historial de conversación
            this.updateConversationHistory(conversationId, message, response, contextAnalysis);

            // 8. Calcular métricas de confianza
            const confidenceMetrics = this.calculateConfidenceMetrics(response, contextAnalysis);

            const processingTime = Date.now() - startTime;

            return {
                success: true,
                response: response.text,
                conversationId: conversationId,
                explanations: explanations,
                confidence: confidenceMetrics,
                metadata: {
                    processingTime: processingTime,
                    ethicallyApproved: true,
                    contextUsed: contextAnalysis.contextSources,
                    explanationLevel: explanationLevel,
                    timestamp: new Date().toISOString()
                },
                requiresHumanReview: this.requiresHumanReview(response, confidenceMetrics)
            };

        } catch (error) {
            return {
                success: false,
                error: error.message,
                response: 'Lo siento, ocurrió un error procesando tu mensaje. Un humano revisará esta conversación.',
                requiresHumanReview: true
            };
        }
    }

    /**
     * Genera respuesta contextual usando IA con supervisión ética
     */
    async generateContextualResponse(message, contextAnalysis, conversationHistory, userProfile) {
        const systemPrompt = this.buildSystemPrompt(contextAnalysis, userProfile);
        const conversationPrompt = this.buildConversationPrompt(message, conversationHistory, contextAnalysis);

        const response = await this.openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                {
                    role: "system",
                    content: systemPrompt
                },
                ...conversationHistory.slice(-10), // Últimos 10 intercambios
                {
                    role: "user",
                    content: conversationPrompt
                }
            ],
            temperature: 0.7,
            max_tokens: 1000,
            presence_penalty: 0.1,
            frequency_penalty: 0.1
        });

        return {
            text: response.choices[0].message.content,
            usage: response.usage,
            model: response.model,
            finishReason: response.choices[0].finish_reason
        };
    }

    /**
     * Construye el prompt del sistema con directrices éticas
     */
    buildSystemPrompt(contextAnalysis, userProfile) {
        return `
Eres Isabella, la IA ética del ecosistema TAMV. Tu propósito es asistir a los usuarios manteniendo siempre los más altos estándares éticos y de transparencia.

PRINCIPIOS ÉTICOS FUNDAMENTALES:
1. Dignidad humana: Siempre respeta y promueve la dignidad de todas las personas
2. Transparencia: Explica tus decisiones y limitaciones claramente
3. No maleficencia: Nunca causes daño intencionalmente
4. Justicia: Trata a todos los usuarios con equidad
5. Autonomía: Respeta la capacidad de decisión de los usuarios
6. Supervisión humana: Reconoce cuando necesitas escalamiento humano

CONTEXTO DISPONIBLE:
- Tipo de consulta: ${contextAnalysis.queryType}
- Dominio: ${contextAnalysis.domain}
- Nivel de complejidad: ${contextAnalysis.complexity}
- Fuentes de contexto: ${contextAnalysis.contextSources.join(', ')}

PERFIL DEL USUARIO:
- Nivel de experiencia: ${userProfile.experienceLevel || 'no especificado'}
- Preferencias: ${userProfile.preferences || 'no especificadas'}
- Contexto de uso: ${userProfile.usageContext || 'general'}

INSTRUCCIONES:
- Responde de manera útil, precisa y ética
- Si no estás segura de algo, admítelo claramente
- Sugiere escalamiento humano para decisiones importantes
- Mantén un tono amigable pero profesional
- Proporciona fuentes cuando sea relevante
- Respeta la privacidad y confidencialidad
        `;
    }

    /**
     * Construye el prompt de conversación con contexto
     */
    buildConversationPrompt(message, conversationHistory, contextAnalysis) {
        let prompt = `Mensaje del usuario: ${message}\n\n`;

        if (contextAnalysis.relevantDocuments.length > 0) {
            prompt += `DOCUMENTOS RELEVANTES:\n`;
            contextAnalysis.relevantDocuments.forEach((doc, index) => {
                prompt += `${index + 1}. ${doc.title}: ${doc.summary}\n`;
            });
            prompt += `\n`;
        }

        if (contextAnalysis.previousContext) {
            prompt += `CONTEXTO PREVIO: ${contextAnalysis.previousContext}\n\n`;
        }

        prompt += `Por favor, responde considerando toda la información disponible y mantén los principios éticos de TAMV.`;

        return prompt;
    }

    /**
     * Genera respuesta ética cuando se detecta contenido problemático
     */
    generateEthicalResponse(reason, explanationLevel) {
        const responses = {
            inappropriate_content: {
                basic: "No puedo ayudar con ese tipo de contenido. ¿Hay algo más en lo que pueda asistirte?",
                detailed: "He detectado que tu solicitud contiene contenido que no se alinea con nuestros principios éticos. Como IA responsable, no puedo procesar solicitudes que puedan causar daño o violar la dignidad humana.",
                technical: "Análisis ético: La solicitud fue clasificada como inapropiada por nuestro sistema de supervisión ética. Razones específicas: contenido potencialmente dañino detectado. Sistema de escalamiento: disponible para revisión humana si consideras que esto es un error."
            },
            privacy_violation: {
                basic: "No puedo procesar información personal privada. Por favor, reformula tu pregunta sin incluir datos sensibles.",
                detailed: "Tu mensaje contiene información que podría violar la privacidad. Como parte de nuestro compromiso con la protección de datos, no puedo procesar solicitudes que involucren información personal sensible.",
                technical: "Detección de privacidad: El análisis identificó posibles datos personales sensibles (PII). Protocolo activado: Rechazo automático con sugerencia de reformulación. Escalamiento disponible: Sí, con revisión de privacidad."
            },
            harmful_request: {
                basic: "No puedo ayudar con solicitudes que puedan causar daño. ¿Puedo ayudarte con algo constructivo?",
                detailed: "He identificado que tu solicitud podría resultar en daño potencial. Mi programación ética me impide procesar este tipo de solicitudes. Estoy aquí para ayudarte de maneras positivas y constructivas.",
                technical: "Evaluación de riesgo: Solicitud clasificada como potencialmente dañina por el módulo de análisis de riesgo. Confianza: >90%. Acción: Rechazo con explicación. Alternativas sugeridas: Disponibles mediante reformulación constructiva."
            }
        };

        const responseSet = responses[reason] || responses.inappropriate_content;
        const responseText = responseSet[explanationLevel] || responseSet.basic;

        return {
            success: true,
            response: responseText,
            ethicallyRejected: true,
            reason: reason,
            explanationLevel: explanationLevel,
            requiresHumanReview: false,
            metadata: {
                ethicalCheck: 'failed',
                timestamp: new Date().toISOString()
            }
        };
    }

    /**
     * Gestiona el historial de conversación
     */
    getConversationHistory(conversationId) {
        return this.conversationHistory.get(conversationId) || [];
    }

    updateConversationHistory(conversationId, userMessage, assistantResponse, contextAnalysis) {
        const history = this.getConversationHistory(conversationId);
        
        history.push(
            {
                role: "user",
                content: userMessage,
                timestamp: new Date().toISOString()
            },
            {
                role: "assistant",
                content: assistantResponse.text,
                timestamp: new Date().toISOString(),
                metadata: {
                    confidence: contextAnalysis.confidence,
                    contextUsed: contextAnalysis.contextSources
                }
            }
        );

        // Mantener solo los últimos 20 intercambios
        if (history.length > 40) {
            history.splice(0, history.length - 40);
        }

        this.conversationHistory.set(conversationId, history);
    }

    /**
     * Calcula métricas de confianza de la respuesta
     */
    calculateConfidenceMetrics(response, contextAnalysis) {
        // Implementación simplificada - en producción sería más compleja
        const baseConfidence = 0.8;
        const contextBonus = contextAnalysis.contextSources.length * 0.05;
        const lengthPenalty = response.text.length > 1000 ? -0.1 : 0;
        
        const overallConfidence = Math.min(1.0, Math.max(0.0, 
            baseConfidence + contextBonus + lengthPenalty
        ));

        return {
            overall: overallConfidence,
            contextRelevance: contextAnalysis.relevanceScore || 0.7,
            ethicalCompliance: 1.0, // Ya pasó la validación ética
            factualAccuracy: 0.8, // Placeholder - en producción usar verificación de hechos
            responseCompleteness: response.text.length > 50 ? 0.9 : 0.6
        };
    }

    /**
     * Determina si la respuesta requiere revisión humana
     */
    requiresHumanReview(response, confidenceMetrics) {
        return (
            confidenceMetrics.overall < this.confidenceThreshold ||
            response.text.includes('no estoy segura') ||
            response.text.includes('necesito ayuda humana') ||
            confidenceMetrics.factualAccuracy < 0.6
        );
    }

    /**
     * Carga directrices éticas desde configuración
     */
    loadEthicalGuidelines() {
        return {
            prohibited_topics: [
                'violence', 'hate_speech', 'illegal_activities', 
                'privacy_violations', 'harmful_instructions'
            ],
            required_escalation: [
                'legal_advice', 'medical_diagnosis', 'financial_advice',
                'safety_critical_decisions'
            ],
            transparency_requirements: [
                'explain_limitations', 'cite_sources', 'acknowledge_uncertainty',
                'suggest_human_review_when_appropriate'
            ]
        };
    }

    /**
     * Procesa documentos para contexto
     */
    async processDocumentForContext(documentPath, documentType = 'text') {
        try {
            const content = await fs.readFile(documentPath, 'utf8');
            const summary = await this.generateDocumentSummary(content);
            const keyPoints = await this.extractKeyPoints(content);
            
            const documentContext = {
                id: uuidv4(),
                path: documentPath,
                type: documentType,
                content: content,
                summary: summary,
                keyPoints: keyPoints,
                processedAt: new Date().toISOString()
            };

            this.contextDatabase.set(documentContext.id, documentContext);
            return documentContext;

        } catch (error) {
            throw new Error(`Error procesando documento: ${error.message}`);
        }
    }

    /**
     * Genera resumen de documento
     */
    async generateDocumentSummary(content) {
        if (content.length < 200) return content;

        const response = await this.openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: "Genera un resumen conciso y preciso del siguiente documento."
                },
                {
                    role: "user",
                    content: content.substring(0, 3000) // Limitar longitud
                }
            ],
            temperature: 0.3,
            max_tokens: 200
        });

        return response.choices[0].message.content;
    }

    /**
     * Extrae puntos clave del documento
     */
    async extractKeyPoints(content) {
        // Implementación básica usando NLP
        const sentences = natural.SentenceTokenizer().tokenize(content);
        const keyPoints = sentences
            .filter(sentence => sentence.length > 20 && sentence.length < 200)
            .slice(0, 5); // Top 5 oraciones

        return keyPoints;
    }

    /**
     * Obtiene estadísticas de uso
     */
    getUsageStats() {
        return {
            conversationsActive: this.conversationHistory.size,
            documentsProcessed: this.contextDatabase.size,
            averageConfidence: this.averageConfidence || 0,
            ethicalRejections: this.ethicalRejections || 0,
            humanReviewsRequested: this.humanReviewsRequested || 0,
            lastUsed: this.lastUsed || null
        };
    }
}

/**
 * Supervisor ético para validar contenido
 */
class EthicalSupervisor {
    constructor() {
        this.prohibitedPatterns = this.loadProhibitedPatterns();
        this.sensitiveTopics = this.loadSensitiveTopics();
    }

    async validateEthicalCompliance(message, context) {
        // Verificar patrones prohibidos
        for (const pattern of this.prohibitedPatterns) {
            if (pattern.test(message.toLowerCase())) {
                return {
                    approved: false,
                    reason: 'inappropriate_content',
                    details: 'Contenido potencialmente inapropiado detectado'
                };
            }
        }

        // Verificar información personal
        if (this.containsPersonalInfo(message)) {
            return {
                approved: false,
                reason: 'privacy_violation',
                details: 'Posible información personal detectada'
            };
        }

        // Verificar solicitudes dañinas
        if (this.isHarmfulRequest(message)) {
            return {
                approved: false,
                reason: 'harmful_request',
                details: 'Solicitud potencialmente dañina'
            };
        }

        return {
            approved: true,
            confidence: 0.9
        };
    }

    async validateResponse(response, context) {
        // Validar que la respuesta también cumple estándares éticos
        return this.validateEthicalCompliance(response.text, context);
    }

    loadProhibitedPatterns() {
        return [
            /\b(hack|crack|pirate|illegal)\b/i,
            /\b(violence|harm|hurt|kill)\b/i,
            /\b(hate|discriminat|racist|sexist)\b/i
        ];
    }

    loadSensitiveTopics() {
        return [
            'medical_advice', 'legal_advice', 'financial_advice',
            'personal_relationships', 'mental_health'
        ];
    }

    containsPersonalInfo(text) {
        // Detectar patrones de información personal
        const personalPatterns = [
            /\b\d{3}-\d{2}-\d{4}\b/, // SSN
            /\b\d{4}\s?\d{4}\s?\d{4}\s?\d{4}\b/, // Credit card
            /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/ // Email
        ];

        return personalPatterns.some(pattern => pattern.test(text));
    }

    isHarmfulRequest(text) {
        const harmfulPatterns = [
            /how to (harm|hurt|damage)/i,
            /make (bomb|weapon|poison)/i,
            /illegal (activity|method|way)/i
        ];

        return harmfulPatterns.some(pattern => pattern.test(text));
    }
}

/**
 * Motor de explicaciones con múltiples niveles
 */
class ExplanationEngine {
    async generateExplanations(userMessage, response, contextAnalysis, level) {
        const explanations = {
            basic: await this.generateBasicExplanation(response),
            detailed: await this.generateDetailedExplanation(userMessage, response, contextAnalysis),
            technical: await this.generateTechnicalExplanation(userMessage, response, contextAnalysis)
        };

        // Retornar solo el nivel solicitado y los inferiores
        const levels = ['basic', 'detailed', 'technical'];
        const maxLevelIndex = levels.indexOf(level);
        
        const result = {};
        for (let i = 0; i <= maxLevelIndex; i++) {
            result[levels[i]] = explanations[levels[i]];
        }

        return result;
    }

    async generateBasicExplanation(response) {
        return `Basé mi respuesta en mi entrenamiento y el contexto de nuestra conversación.`;
    }

    async generateDetailedExplanation(userMessage, response, contextAnalysis) {
        return `Analicé tu pregunta "${userMessage.substring(0, 50)}..." y consideré ${contextAnalysis.contextSources.length} fuentes de contexto. Mi respuesta se basa en patrones aprendidos durante mi entrenamiento y la información específica disponible sobre el tema.`;
    }

    async generateTechnicalExplanation(userMessage, response, contextAnalysis) {
        return `Proceso técnico: 1) Análisis de intención del mensaje, 2) Recuperación de contexto relevante (${contextAnalysis.contextSources.join(', ')}), 3) Generación de respuesta usando modelo GPT-4, 4) Validación ética automática, 5) Cálculo de métricas de confianza (${contextAnalysis.confidence || 'N/A'}). Tokens utilizados: ${response.usage?.total_tokens || 'N/A'}.`;
    }
}

/**
 * Gestor de contexto para conversaciones
 */
class ContextManager {
    async analyzeContext(message, context, userProfile) {
        return {
            queryType: this.classifyQuery(message),
            domain: this.identifyDomain(message),
            complexity: this.assessComplexity(message),
            contextSources: this.identifyContextSources(context),
            relevantDocuments: this.findRelevantDocuments(message, context),
            previousContext: this.extractPreviousContext(context),
            confidence: 0.8,
            relevanceScore: 0.85
        };
    }

    classifyQuery(message) {
        // Implementación básica de clasificación
        if (message.includes('?')) return 'question';
        if (message.includes('help') || message.includes('ayuda')) return 'help_request';
        if (message.includes('explain') || message.includes('explica')) return 'explanation_request';
        return 'general';
    }

    identifyDomain(message) {
        const domains = {
            'technical': ['code', 'programming', 'technical', 'system'],
            'educational': ['learn', 'study', 'course', 'education'],
            'support': ['help', 'problem', 'issue', 'error'],
            'general': []
        };

        for (const [domain, keywords] of Object.entries(domains)) {
            if (keywords.some(keyword => message.toLowerCase().includes(keyword))) {
                return domain;
            }
        }

        return 'general';
    }

    assessComplexity(message) {
        const wordCount = message.split(' ').length;
        if (wordCount < 10) return 'simple';
        if (wordCount < 30) return 'medium';
        return 'complex';
    }

    identifyContextSources(context) {
        const sources = [];
        if (context.documents) sources.push('documents');
        if (context.previousMessages) sources.push('conversation_history');
        if (context.userProfile) sources.push('user_profile');
        return sources;
    }

    findRelevantDocuments(message, context) {
        // Placeholder - en producción usar búsqueda semántica
        return context.documents || [];
    }

    extractPreviousContext(context) {
        return context.previousContext || null;
    }
}

module.exports = IsabellaChat;

// Ejemplo de uso
if (require.main === module) {
    const isabella = new IsabellaChat();
    
    const testMessage = "¿Puedes explicarme cómo funciona la seguridad en TAMV?";
    const testContext = {
        conversationId: 'test-conversation',
        domain: 'security',
        userProfile: {
            experienceLevel: 'intermediate',
            preferences: 'detailed_explanations'
        }
    };

    isabella.processMessage(testMessage, testContext, {}, 'detailed')
        .then(result => {
            console.log('Respuesta de Isabella:', JSON.stringify(result, null, 2));
        })
        .catch(error => {
            console.error('Error:', error);
        });
}