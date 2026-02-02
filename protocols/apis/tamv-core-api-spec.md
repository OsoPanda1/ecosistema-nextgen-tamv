# TAMV CORE API & TAMVAI API
## Especificación Técnica Completa

**Estado:** Especificación API ejecutable  
**Versión:** 1.0  
**Principio:** Isabella no ejecuta, recomienda

---

## TAMV CORE API

### Dominios principales

#### /identity - Gestión de identidad soberana

```yaml
# POST /identity/create
# Crear nueva identidad soberana
post:
  summary: "Crear identidad DID soberana"
  requestBody:
    required: true
    content:
      application/json:
        schema:
          type: object
          properties:
            publicKey:
              type: string
              format: base64
              description: "Clave pública Ed25519"
            proof:
              type: object
              properties:
                type: 
                  type: string
                  enum: ["Ed25519Signature2020"]
                created:
                  type: string
                  format: date-time
                verificationMethod:
                  type: string
                proofValue:
                  type: string
                  format: base64
          required: [publicKey, proof]
  responses:
    201:
      description: "Identidad creada exitosamente"
      content:
        application/json:
          schema:
            type: object
            properties:
              did:
                type: string
                pattern: "^did:tamv:[a-zA-Z0-9]{43}$"
              document:
                $ref: "#/components/schemas/DIDDocument"
              created:
                type: string
                format: date-time
    400:
      description: "Datos inválidos"
    409:
      description: "Identidad ya existe"

# GET /identity/{did}
# Resolver identidad DID
get:
  summary: "Resolver documento DID"
  parameters:
    - name: did
      in: path
      required: true
      schema:
        type: string
        pattern: "^did:tamv:[a-zA-Z0-9]{43}$"
  responses:
    200:
      description: "Documento DID encontrado"
      content:
        application/json:
          schema:
            $ref: "#/components/schemas/DIDDocument"
    404:
      description: "DID no encontrado"
```

#### /consent - Gestión de consentimiento granular

```yaml
# POST /consent/grant
# Otorgar consentimiento específico
post:
  summary: "Otorgar consentimiento granular"
  security:
    - DIDAuth: []
  requestBody:
    required: true
    content:
      application/json:
        schema:
          type: object
          properties:
            purpose:
              type: string
              enum: ["identity", "economic", "social", "educational", "governance"]
            dataCategories:
              type: array
              items:
                type: string
                enum: ["profile", "activity", "preferences", "biometric", "financial"]
            duration:
              type: string
              format: duration
              description: "ISO 8601 duration (P1Y = 1 año)"
            conditions:
              type: object
              properties:
                revocable:
                  type: boolean
                  default: true
                transferable:
                  type: boolean
                  default: false
                auditRequired:
                  type: boolean
                  default: true
          required: [purpose, dataCategories]
  responses:
    201:
      description: "Consentimiento otorgado"
      content:
        application/json:
          schema:
            type: object
            properties:
              consentId:
                type: string
                format: uuid
              expiresAt:
                type: string
                format: date-time
              proof:
                $ref: "#/components/schemas/ConsentProof"

# DELETE /consent/{consentId}
# Revocar consentimiento
delete:
  summary: "Revocar consentimiento"
  security:
    - DIDAuth: []
  parameters:
    - name: consentId
      in: path
      required: true
      schema:
        type: string
        format: uuid
  responses:
    204:
      description: "Consentimiento revocado"
    404:
      description: "Consentimiento no encontrado"
    403:
      description: "No autorizado para revocar"
```

#### /economy - Gestión económica

```yaml
# POST /economy/transaction
# Crear transacción económica
post:
  summary: "Crear transacción en ecosistema TAMV"
  security:
    - DIDAuth: []
  requestBody:
    required: true
    content:
      application/json:
        schema:
          type: object
          properties:
            type:
              type: string
              enum: ["payment", "donation", "reward", "fee", "redistribution"]
            amount:
              type: number
              minimum: 0
            currency:
              type: string
              enum: ["TAMV", "USD", "EUR", "MXN"]
            recipient:
              type: string
              pattern: "^did:tamv:[a-zA-Z0-9]{43}$"
            purpose:
              type: string
              maxLength: 500
            metadata:
              type: object
              properties:
                projectId:
                  type: string
                  format: uuid
                category:
                  type: string
                tags:
                  type: array
                  items:
                    type: string
          required: [type, amount, currency, recipient, purpose]
  responses:
    201:
      description: "Transacción creada"
      content:
        application/json:
          schema:
            type: object
            properties:
              transactionId:
                type: string
                format: uuid
              status:
                type: string
                enum: ["pending", "processing", "completed", "failed"]
              fairSplitApplied:
                type: boolean
              fees:
                type: object
                properties:
                  platform:
                    type: number
                  creator:
                    type: number
                  community:
                    type: number

# GET /economy/balance/{did}
# Consultar balance económico
get:
  summary: "Consultar balance de identidad"
  security:
    - DIDAuth: []
  parameters:
    - name: did
      in: path
      required: true
      schema:
        type: string
        pattern: "^did:tamv:[a-zA-Z0-9]{43}$"
  responses:
    200:
      description: "Balance encontrado"
      content:
        application/json:
          schema:
            type: object
            properties:
              balances:
                type: object
                properties:
                  TAMV:
                    type: number
                  USD:
                    type: number
                  EUR:
                    type: number
                  MXN:
                    type: number
              locked:
                type: object
                description: "Fondos bloqueados en escrow"
              pending:
                type: object
                description: "Transacciones pendientes"
              lastUpdated:
                type: string
                format: date-time
```

#### /governance - Participación en gobernanza

```yaml
# POST /governance/vote
# Emitir voto en propuesta
post:
  summary: "Votar en propuesta de gobernanza"
  security:
    - DIDAuth: []
  requestBody:
    required: true
    content:
      application/json:
        schema:
          type: object
          properties:
            proposalId:
              type: string
              format: uuid
            voterDID:
              type: string
              pattern: "^did:tamv:[a-zA-Z0-9]{43}$"
            vote:
              type: string
              enum: ["yes", "no", "abstain"]
            reasoning:
              type: string
              maxLength: 1000
              description: "Justificación opcional del voto"
            signature:
              type: string
              format: base64
              description: "Firma Ed25519 del voto"
          required: [proposalId, voterDID, vote, signature]
  responses:
    201:
      description: "Voto registrado"
      content:
        application/json:
          schema:
            type: object
            properties:
              voteId:
                type: string
                format: uuid
              blockchainAnchor:
                type: string
                description: "Hash de transacción blockchain"
              timestamp:
                type: string
                format: date-time
    400:
      description: "Voto inválido"
    409:
      description: "Ya votó en esta propuesta"

# GET /governance/proposals
# Listar propuestas activas
get:
  summary: "Obtener propuestas de gobernanza"
  parameters:
    - name: status
      in: query
      schema:
        type: string
        enum: ["draft", "active", "closed", "implemented"]
    - name: category
      in: query
      schema:
        type: string
        enum: ["economic", "technical", "ethical", "legal"]
    - name: limit
      in: query
      schema:
        type: integer
        minimum: 1
        maximum: 100
        default: 20
  responses:
    200:
      description: "Lista de propuestas"
      content:
        application/json:
          schema:
            type: object
            properties:
              proposals:
                type: array
                items:
                  $ref: "#/components/schemas/Proposal"
              pagination:
                $ref: "#/components/schemas/Pagination"
```

#### /audit - Auditoría y transparencia

```yaml
# GET /audit/trail/{entityId}
# Obtener rastro de auditoría
get:
  summary: "Consultar rastro de auditoría"
  security:
    - DIDAuth: []
  parameters:
    - name: entityId
      in: path
      required: true
      schema:
        type: string
        format: uuid
    - name: eventType
      in: query
      schema:
        type: string
        enum: ["identity", "transaction", "vote", "consent", "decision"]
    - name: fromDate
      in: query
      schema:
        type: string
        format: date-time
    - name: toDate
      in: query
      schema:
        type: string
        format: date-time
  responses:
    200:
      description: "Rastro de auditoría"
      content:
        application/json:
          schema:
            type: object
            properties:
              events:
                type: array
                items:
                  type: object
                  properties:
                    eventId:
                      type: string
                      format: uuid
                    eventType:
                      type: string
                    timestamp:
                      type: string
                      format: date-time
                    actor:
                      type: string
                    action:
                      type: string
                    details:
                      type: object
                    hash:
                      type: string
                      description: "Hash criptográfico del evento"
                    blockchainAnchor:
                      type: string
                      description: "Anclaje en blockchain si aplica"
              totalEvents:
                type: integer
              integrity:
                type: object
                properties:
                  verified:
                    type: boolean
                  chainHash:
                    type: string
```

---

## TAMVAI API

### /ethics - Evaluación ética

```yaml
# POST /ethics/evaluate
# Solicitar evaluación ética a Isabella
post:
  summary: "Evaluar propuesta éticamente"
  security:
    - DIDAuth: []
  requestBody:
    required: true
    content:
      application/json:
        schema:
          type: object
          properties:
            contextType:
              type: string
              enum: ["economic_proposal", "technical_change", "governance_decision", "content_moderation", "user_interaction"]
            inputContext:
              type: object
              description: "Contexto específico para evaluación"
            stakeholders:
              type: array
              items:
                type: string
              description: "Partes afectadas por la decisión"
            timeframe:
              type: string
              enum: ["immediate", "short_term", "long_term", "permanent"]
            riskTolerance:
              type: string
              enum: ["low", "medium", "high"]
          required: [contextType, inputContext]
  responses:
    200:
      description: "Evaluación ética completada"
      content:
        application/json:
          schema:
            type: object
            properties:
              evaluationId:
                type: string
                format: uuid
              ethicalAssessment:
                type: object
                properties:
                  overallScore:
                    type: number
                    minimum: 0
                    maximum: 1
                  principleScores:
                    type: object
                    properties:
                      humanDignity:
                        type: number
                      transparency:
                        type: number
                      fairness:
                        type: number
                      accountability:
                        type: number
                      beneficence:
                        type: number
                  riskFactors:
                    type: array
                    items:
                      type: object
                      properties:
                        factor:
                          type: string
                        severity:
                          type: string
                          enum: ["low", "medium", "high", "critical"]
                        mitigation:
                          type: string
              recommendation:
                type: string
                enum: ["approve", "approve_with_conditions", "reject", "requires_human_review"]
              conditions:
                type: array
                items:
                  type: string
              reasoning:
                type: string
                description: "Explicación detallada de la evaluación"
              confidence:
                type: number
                minimum: 0
                maximum: 1
```

### /xai/explain - Explicación de decisiones

```yaml
# POST /xai/explain
# Solicitar explicación de decisión automatizada
post:
  summary: "Explicar decisión automatizada"
  security:
    - DIDAuth: []
  requestBody:
    required: true
    content:
      application/json:
        schema:
          type: object
          properties:
            decisionId:
              type: string
              format: uuid
            explanationLevel:
              type: string
              enum: ["simple", "detailed", "technical", "regulatory"]
            audience:
              type: string
              enum: ["end_user", "auditor", "regulator", "developer"]
            language:
              type: string
              default: "es"
              enum: ["es", "en", "fr", "pt"]
          required: [decisionId, explanationLevel, audience]
  responses:
    200:
      description: "Explicación generada"
      content:
        application/json:
          schema:
            type: object
            properties:
              explanationId:
                type: string
                format: uuid
              explanation:
                type: object
                properties:
                  summary:
                    type: string
                    description: "Resumen en lenguaje natural"
                  keyFactors:
                    type: array
                    items:
                      type: object
                      properties:
                        factor:
                          type: string
                        importance:
                          type: number
                        contribution:
                          type: string
                  decisionLogic:
                    type: object
                    description: "Lógica de decisión estructurada"
                  alternatives:
                    type: array
                    items:
                      type: object
                      properties:
                        option:
                          type: string
                        probability:
                          type: number
                        reasoning:
                          type: string
                  confidence:
                    type: object
                    properties:
                      level:
                        type: number
                      factors:
                        type: array
                        items:
                          type: string
              visualAids:
                type: object
                properties:
                  charts:
                    type: array
                    items:
                      type: string
                      format: uri
                  diagrams:
                    type: array
                    items:
                      type: string
                      format: uri
              interactiveElements:
                type: object
                properties:
                  whatIfScenarios:
                    type: array
                    items:
                      type: object
                  sensitivityAnalysis:
                    type: object
```

### /risk/assess - Evaluación de riesgos

```yaml
# POST /risk/assess
# Evaluar riesgos de propuesta o acción
post:
  summary: "Evaluar riesgos comprehensivamente"
  security:
    - DIDAuth: []
  requestBody:
    required: true
    content:
      application/json:
        schema:
          type: object
          properties:
            assessmentType:
              type: string
              enum: ["technical", "economic", "legal", "ethical", "social", "comprehensive"]
            subject:
              type: object
              description: "Objeto de evaluación de riesgo"
            scope:
              type: string
              enum: ["individual", "community", "platform", "ecosystem", "global"]
            timeHorizon:
              type: string
              enum: ["immediate", "short_term", "medium_term", "long_term"]
          required: [assessmentType, subject, scope]
  responses:
    200:
      description: "Evaluación de riesgo completada"
      content:
        application/json:
          schema:
            type: object
            properties:
              assessmentId:
                type: string
                format: uuid
              overallRiskLevel:
                type: string
                enum: ["very_low", "low", "medium", "high", "very_high", "critical"]
              riskCategories:
                type: object
                properties:
                  technical:
                    $ref: "#/components/schemas/RiskCategory"
                  economic:
                    $ref: "#/components/schemas/RiskCategory"
                  legal:
                    $ref: "#/components/schemas/RiskCategory"
                  ethical:
                    $ref: "#/components/schemas/RiskCategory"
                  social:
                    $ref: "#/components/schemas/RiskCategory"
              mitigationStrategies:
                type: array
                items:
                  type: object
                  properties:
                    strategy:
                      type: string
                    effectiveness:
                      type: number
                    cost:
                      type: string
                      enum: ["low", "medium", "high"]
                    timeframe:
                      type: string
              monitoringRecommendations:
                type: array
                items:
                  type: object
                  properties:
                    metric:
                      type: string
                    threshold:
                      type: number
                    frequency:
                      type: string
```

---

## Esquemas de datos comunes

```yaml
components:
  schemas:
    DIDDocument:
      type: object
      properties:
        "@context":
          type: array
          items:
            type: string
        id:
          type: string
          pattern: "^did:tamv:[a-zA-Z0-9]{43}$"
        verificationMethod:
          type: array
          items:
            type: object
            properties:
              id:
                type: string
              type:
                type: string
                enum: ["Ed25519VerificationKey2020"]
              controller:
                type: string
              publicKeyMultibase:
                type: string
        authentication:
          type: array
          items:
            type: string
        service:
          type: array
          items:
            type: object
            properties:
              id:
                type: string
              type:
                type: string
              serviceEndpoint:
                type: string
                format: uri

    ConsentProof:
      type: object
      properties:
        type:
          type: string
          enum: ["Ed25519Signature2020"]
        created:
          type: string
          format: date-time
        verificationMethod:
          type: string
        proofPurpose:
          type: string
          enum: ["authentication", "assertionMethod"]
        proofValue:
          type: string
          format: base64

    Proposal:
      type: object
      properties:
        id:
          type: string
          format: uuid
        title:
          type: string
        description:
          type: string
        category:
          type: string
          enum: ["economic", "technical", "ethical", "legal"]
        status:
          type: string
          enum: ["draft", "active", "closed", "implemented"]
        author:
          type: string
          pattern: "^did:tamv:[a-zA-Z0-9]{43}$"
        createdAt:
          type: string
          format: date-time
        votingEndsAt:
          type: string
          format: date-time
        votes:
          type: object
          properties:
            yes:
              type: integer
            no:
              type: integer
            abstain:
              type: integer
        requiredQuorum:
          type: number
          minimum: 0
          maximum: 1

    RiskCategory:
      type: object
      properties:
        level:
          type: string
          enum: ["very_low", "low", "medium", "high", "very_high", "critical"]
        factors:
          type: array
          items:
            type: object
            properties:
              factor:
                type: string
              impact:
                type: string
                enum: ["negligible", "minor", "moderate", "major", "severe", "catastrophic"]
              probability:
                type: string
                enum: ["very_unlikely", "unlikely", "possible", "likely", "very_likely", "certain"]
        score:
          type: number
          minimum: 0
          maximum: 1

    Pagination:
      type: object
      properties:
        page:
          type: integer
          minimum: 1
        limit:
          type: integer
          minimum: 1
          maximum: 100
        total:
          type: integer
        hasNext:
          type: boolean
        hasPrevious:
          type: boolean

  securitySchemes:
    DIDAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
      description: "JWT firmado con clave privada DID"
```

---

## Ejemplo de uso completo

### Flujo de autorización económica

```bash
# 1. Crear propuesta económica
curl -X POST https://api.tamv.org/governance/proposals \
  -H "Authorization: Bearer $DID_JWT" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Nueva forma de monetización: NFTs educativos",
    "description": "Marketplace de NFTs para contenido educativo",
    "category": "economic",
    "details": {
      "monetizationType": "marketplace",
      "targetAudience": "educators",
      "expectedRevenue": 100000,
      "socialImpact": "increased_access_to_education"
    }
  }'

# 2. Solicitar evaluación ética a Isabella
curl -X POST https://ai.tamv.org/ethics/evaluate \
  -H "Authorization: Bearer $DID_JWT" \
  -H "Content-Type: application/json" \
  -d '{
    "contextType": "economic_proposal",
    "inputContext": {
      "proposalId": "uuid-from-step-1",
      "monetizationType": "marketplace",
      "contentType": "educational",
      "targetDemographic": "global_educators"
    },
    "stakeholders": ["educators", "students", "platform", "community"],
    "timeframe": "long_term",
    "riskTolerance": "medium"
  }'

# 3. Votar en la propuesta
curl -X POST https://api.tamv.org/governance/vote \
  -H "Authorization: Bearer $DID_JWT" \
  -H "Content-Type: application/json" \
  -d '{
    "proposalId": "uuid-from-step-1",
    "voterDID": "did:tamv:abc123...",
    "vote": "yes",
    "reasoning": "Beneficia la educación global",
    "signature": "base64-signature"
  }'

# 4. Consultar resultado de evaluación
curl -X GET https://ai.tamv.org/ethics/evaluate/uuid-from-step-2 \
  -H "Authorization: Bearer $DID_JWT"

# 5. Solicitar explicación de la recomendación
curl -X POST https://ai.tamv.org/xai/explain \
  -H "Authorization: Bearer $DID_JWT" \
  -H "Content-Type: application/json" \
  -d '{
    "decisionId": "uuid-from-step-2",
    "explanationLevel": "detailed",
    "audience": "end_user",
    "language": "es"
  }'
```

---

## Resultado

**👉 APIs completas para ecosistema TAMV con Isabella como recomendador ético.**

### Características técnicas:

1. **Separación Clara**: TAMV Core para operaciones, TAMVAI para recomendaciones
2. **Autenticación DID**: Identidad soberana en todas las operaciones
3. **Explicabilidad**: Toda decisión automatizada es explicable
4. **Auditabilidad**: Rastro completo de todas las acciones
5. **Escalabilidad**: Diseño para millones de usuarios concurrentes

### Principios de diseño:

- **Isabella Recomienda**: Nunca ejecuta decisiones críticas automáticamente
- **Transparencia Total**: Todas las operaciones son auditables
- **Consentimiento Granular**: Control fino sobre uso de datos
- **Interoperabilidad**: Compatible con estándares W3C y OpenAPI
- **Seguridad por Diseño**: Autenticación y autorización en cada endpoint