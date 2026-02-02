## STRIDE — THREAT MODEL (DREAMWORLD v2.0)
## Modelo de Amenazas Completo para Ecosistema Expandido

**Estado:** Análisis de seguridad formal DreamWorld v2.0  
**Versión:** 2.0  
**Metodología:** STRIDE (Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, Elevation of Privilege)  
**Alcance:** Ecosistema completo con 30+ servicios

---

## Matriz de Amenazas y Mitigaciones Expandida

| Amenaza | Descripción | Componente Afectado | Mitigación DreamWorld v2.0 | Estado |
|---------|-------------|-------------------|---------------------------|---------|
| **Spoofing** | Suplantación de identidad | Todos los servicios | DID + ID-NVIDA + Biometría | ✅ MITIGADO |
| **Tampering** | Modificación de datos | Ecosistema completo | Hash + MSR + Blockchain | ✅ MITIGADO |
| **Repudiation** | Negación de acciones | Transacciones y votos | BookPI + Evidencia legal | ✅ MITIGADO |
| **Info Disclosure** | Filtración de información | Datos personales/salud | Zero-Trust + Encriptación | ✅ MITIGADO |
| **DoS** | Denegación de servicio | Infraestructura global | Edge + Auto-scaling + CDN | ✅ MITIGADO |
| **Elevation** | Escalación de privilegios | Sistema de permisos | No Admin + Roles granulares | ✅ MITIGADO |

---

## Amenazas Específicas del Ecosistema DreamWorld v2.0

### 🌐 Red Social Avanzada - Amenazas

#### S1: Suplantación en streaming y contenido
```
Amenaza: Deepfakes y contenido sintético malicioso
Vector: IA generativa, manipulación de video/audio
Impacto: ALTO - Desinformación y daño reputacional
```

**Mitigación implementada:**
```sql
-- Verificación de autenticidad de contenido
CREATE TABLE content_authenticity_verification (
    content_id UUID PRIMARY KEY,
    creator_did TEXT NOT NULL,
    content_hash TEXT NOT NULL,
    authenticity_score NUMERIC CHECK (authenticity_score BETWEEN 0 AND 1),
    deepfake_detection JSONB NOT NULL,
    biometric_verification JSONB,
    device_attestation TEXT,
    creation_timestamp TIMESTAMP DEFAULT NOW(),
    
    -- Verificación multi-factor
    voice_print_match BOOLEAN,
    facial_recognition_match BOOLEAN,
    behavioral_pattern_match BOOLEAN,
    
    -- Cadena de custodia
    creation_device_id TEXT,
    location_verification JSONB,
    network_fingerprint TEXT
);

-- Función de detección de deepfakes
CREATE OR REPLACE FUNCTION detect_synthetic_content(
    p_content_id UUID,
    p_content_data BYTEA,
    p_creator_did TEXT
) RETURNS JSONB AS $
DECLARE
    v_detection_result JSONB;
    v_authenticity_score NUMERIC := 0;
BEGIN
    -- Análisis de deepfake con IA
    v_detection_result := ai_deepfake_detection(p_content_data);
    
    -- Verificación biométrica del creador
    IF verify_biometric_consistency(p_creator_did, p_content_data) THEN
        v_authenticity_score := v_authenticity_score + 0.4;
    END IF;
    
    -- Verificación de dispositivo
    IF verify_device_attestation(p_creator_did) THEN
        v_authenticity_score := v_authenticity_score + 0.3;
    END IF;
    
    -- Análisis de patrones temporales
    IF verify_temporal_consistency(p_creator_did, p_content_id) THEN
        v_authenticity_score := v_authenticity_score + 0.3;
    END IF;
    
    -- Registrar verificación
    INSERT INTO content_authenticity_verification (
        content_id, creator_did, content_hash, authenticity_score, deepfake_detection
    ) VALUES (
        p_content_id, p_creator_did, encode(sha256(p_content_data), 'hex'),
        v_authenticity_score, v_detection_result
    );
    
    RETURN jsonb_build_object(
        'authentic', v_authenticity_score > 0.7,
        'confidence', v_authenticity_score,
        'requires_review', v_authenticity_score < 0.5
    );
END;
$ LANGUAGE plpgsql;
```

### 🎓 Universidad TAMV - Amenazas

#### T1: Manipulación de certificaciones académicas
```
Amenaza: Falsificación de certificados y logros académicos
Vector: Ataques a blockchain, manipulación de registros
Impacto: CRÍTICO - Compromete credibilidad educativa
```

**Mitigación implementada:**
```sql
-- Certificaciones inmutables con múltiple verificación
CREATE TABLE utamv_certifications (
    certification_id UUID PRIMARY KEY,
    student_did TEXT NOT NULL,
    course_id UUID NOT NULL,
    certification_type TEXT NOT NULL,
    completion_date TIMESTAMP DEFAULT NOW(),
    
    -- Verificación académica
    final_grade NUMERIC CHECK (final_grade BETWEEN 0 AND 100),
    assessment_proofs JSONB NOT NULL,
    instructor_signatures TEXT[] NOT NULL,
    peer_validations JSONB,
    
    -- Inmutabilidad blockchain
    blockchain_tx_hash TEXT NOT NULL,
    merkle_proof JSONB NOT NULL,
    ipfs_certificate_hash TEXT NOT NULL,
    
    -- Verificación externa
    industry_validation JSONB,
    accreditation_body_approval TEXT,
    
    -- Anti-fraude
    proctoring_evidence JSONB NOT NULL,
    biometric_verification JSONB NOT NULL,
    plagiarism_check_results JSONB NOT NULL
);

-- Función de emisión de certificado verificable
CREATE OR REPLACE FUNCTION issue_verified_certificate(
    p_student_did TEXT,
    p_course_id UUID,
    p_assessment_data JSONB,
    p_instructor_signatures TEXT[]
) RETURNS UUID AS $
DECLARE
    v_cert_id UUID;
    v_blockchain_tx TEXT;
    v_merkle_proof JSONB;
BEGIN
    v_cert_id := gen_random_uuid();
    
    -- Verificar completitud del curso
    IF NOT verify_course_completion(p_student_did, p_course_id) THEN
        RAISE EXCEPTION 'Course not completed or requirements not met';
    END IF;
    
    -- Verificar firmas de instructores
    IF NOT verify_instructor_signatures(p_instructor_signatures, p_assessment_data) THEN
        RAISE EXCEPTION 'Invalid instructor signatures';
    END IF;
    
    -- Anclar en blockchain
    v_blockchain_tx := anchor_certificate_to_blockchain(v_cert_id, p_assessment_data);
    
    -- Generar prueba Merkle
    v_merkle_proof := generate_merkle_proof(v_cert_id, p_assessment_data);
    
    -- Registrar certificación
    INSERT INTO utamv_certifications (
        certification_id, student_did, course_id, assessment_proofs,
        instructor_signatures, blockchain_tx_hash, merkle_proof
    ) VALUES (
        v_cert_id, p_student_did, p_course_id, p_assessment_data,
        p_instructor_signatures, v_blockchain_tx, v_merkle_proof
    );
    
    -- Notificar a registros externos
    PERFORM notify_accreditation_bodies(v_cert_id);
    
    RETURN v_cert_id;
END;
$ LANGUAGE plpgsql;
```

### 🏥 Servicios de Salud - Amenazas

#### I1: Filtración de datos médicos sensibles
```
Amenaza: Acceso no autorizado a información de salud
Vector: Ataques a bases de datos, ingeniería social
Impacto: CRÍTICO - Violación HIPAA y privacidad médica
```

**Mitigación implementada:**
```sql
-- Protección especial para datos de salud
CREATE TABLE health_data_vault (
    data_id UUID PRIMARY KEY,
    patient_did TEXT NOT NULL,
    data_category TEXT CHECK (data_category IN ('vital_signs', 'diagnosis', 'treatment', 'medication', 'mental_health')),
    encrypted_data BYTEA NOT NULL, -- Encriptación AES-256
    encryption_key_id TEXT NOT NULL,
    access_level TEXT DEFAULT 'restricted' CHECK (access_level IN ('public', 'limited', 'restricted', 'confidential')),
    
    -- Consentimiento específico para salud
    medical_consent_id UUID NOT NULL,
    consent_expiry TIMESTAMP NOT NULL,
    purpose_limitation TEXT NOT NULL,
    
    -- Auditoría médica
    healthcare_provider_did TEXT,
    medical_license_verification JSONB,
    hipaa_compliance_verified BOOLEAN DEFAULT FALSE,
    
    -- Protección adicional
    data_minimization_applied BOOLEAN DEFAULT TRUE,
    anonymization_level TEXT DEFAULT 'pseudonymized',
    retention_period INTERVAL DEFAULT INTERVAL '7 years',
    
    created_at TIMESTAMP DEFAULT NOW()
);

-- Función de acceso controlado a datos médicos
CREATE OR REPLACE FUNCTION access_health_data(
    p_requester_did TEXT,
    p_patient_did TEXT,
    p_data_category TEXT,
    p_medical_purpose TEXT
) RETURNS JSONB AS $
DECLARE
    v_access_granted BOOLEAN := FALSE;
    v_consent_valid BOOLEAN := FALSE;
    v_provider_verified BOOLEAN := FALSE;
    v_decrypted_data JSONB;
BEGIN
    -- Verificar consentimiento médico específico
    SELECT EXISTS (
        SELECT 1 FROM medical_consent 
        WHERE patient_did = p_patient_did 
        AND healthcare_provider_did = p_requester_did
        AND data_categories @> ARRAY[p_data_category]
        AND purpose = p_medical_purpose
        AND consent_active = TRUE
        AND expiry_date > NOW()
    ) INTO v_consent_valid;
    
    -- Verificar licencia médica del solicitante
    v_provider_verified := verify_medical_license(p_requester_did);
    
    -- Verificar propósito médico legítimo
    IF v_consent_valid AND v_provider_verified AND is_legitimate_medical_purpose(p_medical_purpose) THEN
        v_access_granted := TRUE;
        
        -- Desencriptar datos con auditoría
        SELECT decrypt_health_data(encrypted_data, encryption_key_id) INTO v_decrypted_data
        FROM health_data_vault 
        WHERE patient_did = p_patient_did AND data_category = p_data_category;
        
        -- Registrar acceso médico
        INSERT INTO health_data_access_log (
            requester_did, patient_did, data_category, purpose,
            access_granted, access_timestamp, legal_basis
        ) VALUES (
            p_requester_did, p_patient_did, p_data_category, p_medical_purpose,
            TRUE, NOW(), 'medical_consent'
        );
    ELSE
        -- Registrar intento de acceso denegado
        INSERT INTO health_security_incidents (
            incident_type, requester_did, patient_did, details, severity
        ) VALUES (
            'UNAUTHORIZED_HEALTH_DATA_ACCESS', p_requester_did, p_patient_did,
            jsonb_build_object('data_category', p_data_category, 'purpose', p_medical_purpose),
            'CRITICAL'
        );
        
        RAISE EXCEPTION 'Access denied: Invalid medical consent or unauthorized provider';
    END IF;
    
    RETURN CASE 
        WHEN v_access_granted THEN v_decrypted_data
        ELSE jsonb_build_object('error', 'access_denied')
    END;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 💰 Servicios Financieros y Lotería - Amenazas

#### D1: Ataques DDoS a sistema de lotería
```
Amenaza: Sobrecarga durante sorteos importantes
Vector: Ataques distribuidos coordinados
Impacto: ALTO - Interrupción de servicios financieros críticos
```

**Mitigación implementada:**
```sql
-- Protección especial para eventos de lotería
CREATE TABLE lottery_ddos_protection (
    protection_id UUID PRIMARY KEY,
    event_type TEXT NOT NULL,
    event_timestamp TIMESTAMP NOT NULL,
    
    -- Métricas de tráfico
    baseline_rps NUMERIC NOT NULL,
    current_rps NUMERIC NOT NULL,
    anomaly_threshold NUMERIC DEFAULT 5.0, -- 5x el baseline
    
    -- Protecciones activas
    rate_limiting_active BOOLEAN DEFAULT FALSE,
    geo_blocking_active BOOLEAN DEFAULT FALSE,
    captcha_challenge_active BOOLEAN DEFAULT FALSE,
    queue_system_active BOOLEAN DEFAULT FALSE,
    
    -- Distribución de carga
    edge_nodes_active INTEGER DEFAULT 0,
    cdn_cache_hit_ratio NUMERIC DEFAULT 0,
    load_balancer_health JSONB,
    
    detected_at TIMESTAMP DEFAULT NOW()
);

-- Función de protección automática contra DDoS
CREATE OR REPLACE FUNCTION activate_lottery_ddos_protection(
    p_event_type TEXT,
    p_current_rps NUMERIC
) RETURNS VOID AS $
DECLARE
    v_baseline_rps NUMERIC;
    v_anomaly_ratio NUMERIC;
    v_protection_level INTEGER := 0;
BEGIN
    -- Obtener baseline histórico
    SELECT AVG(requests_per_second) INTO v_baseline_rps
    FROM lottery_traffic_history 
    WHERE event_type = p_event_type 
    AND timestamp_utc > NOW() - INTERVAL '30 days';
    
    -- Calcular ratio de anomalía
    v_anomaly_ratio := p_current_rps / COALESCE(v_baseline_rps, 100);
    
    -- Activar protecciones por niveles
    IF v_anomaly_ratio > 3 THEN
        -- Nivel 1: Rate limiting suave
        PERFORM activate_rate_limiting('soft', p_event_type);
        v_protection_level := 1;
    END IF;
    
    IF v_anomaly_ratio > 5 THEN
        -- Nivel 2: Rate limiting agresivo + CAPTCHA
        PERFORM activate_rate_limiting('aggressive', p_event_type);
        PERFORM activate_captcha_challenge(p_event_type);
        v_protection_level := 2;
    END IF;
    
    IF v_anomaly_ratio > 10 THEN
        -- Nivel 3: Sistema de cola + geo-blocking
        PERFORM activate_queue_system(p_event_type);
        PERFORM activate_geo_blocking_suspicious_regions();
        v_protection_level := 3;
    END IF;
    
    IF v_anomaly_ratio > 20 THEN
        -- Nivel 4: Activación de todos los edge nodes
        PERFORM scale_edge_nodes_to_maximum();
        PERFORM activate_emergency_cdn_caching();
        v_protection_level := 4;
    END IF;
    
    -- Registrar activación de protección
    INSERT INTO lottery_ddos_protection (
        protection_id, event_type, baseline_rps, current_rps,
        rate_limiting_active, captcha_challenge_active, 
        queue_system_active, geo_blocking_active
    ) VALUES (
        gen_random_uuid(), p_event_type, v_baseline_rps, p_current_rps,
        v_protection_level >= 1, v_protection_level >= 2,
        v_protection_level >= 3, v_protection_level >= 3
    );
    
    -- Notificar al equipo de seguridad
    IF v_protection_level >= 2 THEN
        INSERT INTO security_alerts (
            alert_type, severity, details, requires_immediate_attention
        ) VALUES (
            'LOTTERY_DDOS_DETECTED', 'HIGH',
            jsonb_build_object('event_type', p_event_type, 'anomaly_ratio', v_anomaly_ratio, 'protection_level', v_protection_level),
            v_protection_level >= 3
        );
    END IF;
END;
$ LANGUAGE plpgsql;
```

### 🎮 Gaming y Entretenimiento - Amenazas

#### E1: Escalación de privilegios en torneos
```
Amenaza: Manipulación de resultados de torneos
Vector: Explotación de vulnerabilidades de juego, colusión
Impacto: ALTO - Compromete integridad competitiva
```

**Mitigación implementada:**
```sql
-- Sistema anti-trampa para gaming
CREATE TABLE gaming_integrity_monitoring (
    monitoring_id UUID PRIMARY KEY,
    tournament_id UUID NOT NULL,
    player_did TEXT NOT NULL,
    game_session_id UUID NOT NULL,
    
    -- Detección de anomalías
    performance_anomalies JSONB,
    input_pattern_analysis JSONB,
    timing_analysis JSONB,
    statistical_outliers JSONB,
    
    -- Verificación de integridad
    client_integrity_verified BOOLEAN DEFAULT FALSE,
    anti_cheat_signature TEXT,
    hardware_fingerprint TEXT,
    network_analysis JSONB,
    
    -- Puntuación de sospecha
    cheat_suspicion_score NUMERIC CHECK (cheat_suspicion_score BETWEEN 0 AND 1),
    requires_manual_review BOOLEAN DEFAULT FALSE,
    
    detected_at TIMESTAMP DEFAULT NOW()
);

-- Función de detección de trampas en tiempo real
CREATE OR REPLACE FUNCTION detect_gaming_cheats(
    p_tournament_id UUID,
    p_player_did TEXT,
    p_game_data JSONB
) RETURNS JSONB AS $
DECLARE
    v_suspicion_score NUMERIC := 0;
    v_anomalies JSONB := '[]'::jsonb;
    v_player_history JSONB;
BEGIN
    -- Obtener historial del jugador
    SELECT jsonb_agg(performance_data) INTO v_player_history
    FROM gaming_sessions 
    WHERE player_did = p_player_did 
    AND created_at > NOW() - INTERVAL '30 days';
    
    -- Análisis de rendimiento anómalo
    IF detect_performance_anomalies(p_game_data, v_player_history) THEN
        v_anomalies := v_anomalies || jsonb_build_array('performance_spike');
        v_suspicion_score := v_suspicion_score + 0.3;
    END IF;
    
    -- Análisis de patrones de entrada
    IF detect_bot_input_patterns(p_game_data) THEN
        v_anomalies := v_anomalies || jsonb_build_array('bot_patterns');
        v_suspicion_score := v_suspicion_score + 0.4;
    END IF;
    
    -- Análisis de timing imposible
    IF detect_impossible_timing(p_game_data) THEN
        v_anomalies := v_anomalies || jsonb_build_array('impossible_timing');
        v_suspicion_score := v_suspicion_score + 0.5;
    END IF;
    
    -- Verificación de integridad del cliente
    IF NOT verify_client_integrity(p_player_did) THEN
        v_anomalies := v_anomalies || jsonb_build_array('client_modified');
        v_suspicion_score := v_suspicion_score + 0.6;
    END IF;
    
    -- Registrar monitoreo
    INSERT INTO gaming_integrity_monitoring (
        monitoring_id, tournament_id, player_did, 
        performance_anomalies, cheat_suspicion_score, requires_manual_review
    ) VALUES (
        gen_random_uuid(), p_tournament_id, p_player_did,
        v_anomalies, v_suspicion_score, v_suspicion_score > 0.6
    );
    
    -- Acciones automáticas basadas en puntuación
    IF v_suspicion_score > 0.8 THEN
        -- Suspensión temporal automática
        PERFORM suspend_player_temporarily(p_player_did, p_tournament_id, 'high_cheat_suspicion');
        
        -- Escalación inmediata
        INSERT INTO human_review_queue (
            review_type, priority, details, requires_immediate_attention
        ) VALUES (
            'GAMING_CHEAT_DETECTION', 'CRITICAL',
            jsonb_build_object('player_did', p_player_did, 'tournament_id', p_tournament_id, 'suspicion_score', v_suspicion_score),
            TRUE
        );
    ELSIF v_suspicion_score > 0.6 THEN
        -- Monitoreo intensivo
        PERFORM increase_monitoring_intensity(p_player_did, p_tournament_id);
    END IF;
    
    RETURN jsonb_build_object(
        'cheat_detected', v_suspicion_score > 0.6,
        'suspicion_score', v_suspicion_score,
        'anomalies', v_anomalies,
        'action_taken', CASE 
            WHEN v_suspicion_score > 0.8 THEN 'suspended'
            WHEN v_suspicion_score > 0.6 THEN 'monitoring_increased'
            ELSE 'none'
        END
    );
END;
$ LANGUAGE plpgsql;
```

---

## S - SPOOFING (Suplantación)

### Vectores de ataque identificados

#### S1: Suplantación de identidad DID
```
Amenaza: Atacante intenta crear DID falso o suplantar DID existente
Vector: Generación de claves falsas, reutilización de claves comprometidas
Impacto: ALTO - Compromete toda la identidad soberana
```

**Mitigación implementada:**
```sql
-- Verificación criptográfica obligatoria
CREATE OR REPLACE FUNCTION verify_did_authenticity(
    p_did TEXT,
    p_signature TEXT,
    p_message TEXT
) RETURNS BOOLEAN AS $$
DECLARE
    v_public_key TEXT;
    v_is_valid BOOLEAN;
BEGIN
    -- Resolver clave pública del DID
    SELECT public_key INTO v_public_key 
    FROM did_registry 
    WHERE did = p_did AND status = 'active';
    
    IF v_public_key IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Verificar firma Ed25519
    v_is_valid := ed25519_verify(v_public_key, p_signature, p_message);
    
    -- Registrar intento de verificación
    INSERT INTO authentication_log (
        did, verification_result, timestamp_utc
    ) VALUES (
        p_did, v_is_valid, NOW()
    );
    
    RETURN v_is_valid;
END;
$$ LANGUAGE plpgsql;
```

#### S2: Suplantación en Home 3D
```
Amenaza: Atacante se hace pasar por otro usuario en espacios XR
Vector: Replay de eventos, clonación de avatares
Impacto: MEDIO - Compromete confianza en espacios virtuales
```

**Mitigación implementada:**
```typescript
// Verificación de identidad en cada evento XR
class XREventValidator {
  async validateEvent(event: XREvent): Promise<boolean> {
    // 1. Verificar firma del evento
    const isSignatureValid = await this.crypto.verifyEd25519(
      event.actorDID,
      event.signature,
      this.serializeEventData(event)
    );
    
    if (!isSignatureValid) {
      throw new SecurityError('Invalid event signature');
    }
    
    // 2. Verificar anti-replay
    const isReplay = await this.checkReplayProtection(event);
    if (isReplay) {
      throw new SecurityError('Replay attack detected');
    }
    
    // 3. Verificar coherencia temporal
    const isTemporallyValid = this.validateTemporalCoherence(event);
    if (!isTemporallyValid) {
      throw new SecurityError('Temporal inconsistency detected');
    }
    
    return true;
  }
  
  private async checkReplayProtection(event: XREvent): Promise<boolean> {
    const windowMs = 5 * 60 * 1000; // 5 minutos
    const now = Date.now();
    
    // Verificar ventana temporal
    if (now - event.timestamp > windowMs) {
      return true; // Es replay
    }
    
    // Verificar nonce único
    const nonceExists = await this.redis.exists(`nonce:${event.nonce}`);
    if (nonceExists) {
      return true; // Es replay
    }
    
    // Registrar nonce
    await this.redis.setex(`nonce:${event.nonce}`, windowMs / 1000, '1');
    
    return false; // No es replay
  }
}
```

---

## T - TAMPERING (Manipulación)

### Vectores de ataque identificados

#### T1: Modificación de transacciones económicas
```
Amenaza: Atacante modifica montos, destinatarios o condiciones de transacciones
Vector: Man-in-the-middle, modificación de base de datos
Impacto: CRÍTICO - Compromete integridad económica
```

**Mitigación implementada:**
```sql
-- Integridad criptográfica de transacciones
CREATE TABLE economic_transactions (
    transaction_id UUID PRIMARY KEY,
    sender_did TEXT NOT NULL,
    recipient_did TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    currency TEXT NOT NULL,
    purpose TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    data_hash TEXT NOT NULL,
    signature TEXT NOT NULL,
    blockchain_anchor TEXT,
    
    -- Verificación de integridad
    CONSTRAINT valid_hash CHECK (
        data_hash = encode(sha256(
            (sender_did || recipient_did || amount::text || currency || purpose || created_at::text)::bytea
        ), 'hex')
    )
);

-- Función de verificación de integridad
CREATE OR REPLACE FUNCTION verify_transaction_integrity(
    p_transaction_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
    v_transaction economic_transactions%ROWTYPE;
    v_computed_hash TEXT;
    v_is_signature_valid BOOLEAN;
BEGIN
    SELECT * INTO v_transaction FROM economic_transactions WHERE transaction_id = p_transaction_id;
    
    -- Calcular hash esperado
    v_computed_hash := encode(sha256(
        (v_transaction.sender_did || v_transaction.recipient_did || 
         v_transaction.amount::text || v_transaction.currency || 
         v_transaction.purpose || v_transaction.created_at::text)::bytea
    ), 'hex');
    
    -- Verificar hash
    IF v_transaction.data_hash != v_computed_hash THEN
        RETURN FALSE;
    END IF;
    
    -- Verificar firma
    v_is_signature_valid := verify_did_authenticity(
        v_transaction.sender_did,
        v_transaction.signature,
        v_transaction.data_hash
    );
    
    RETURN v_is_signature_valid;
END;
$$ LANGUAGE plpgsql;
```

#### T2: Modificación de estado de escenas XR
```
Amenaza: Atacante modifica objetos, posiciones o propiedades de escenas 3D
Vector: Inyección de eventos maliciosos, modificación de estado
Impacto: MEDIO - Compromete experiencia XR
```

**Mitigación implementada:**
```typescript
// MSR (Merkle State Root) para integridad de escenas
class SceneIntegrityManager {
  private merkleTree: MerkleTree;
  
  async updateSceneState(sceneId: string, events: XREvent[]): Promise<void> {
    // 1. Validar todos los eventos
    for (const event of events) {
      await this.validateEvent(event);
    }
    
    // 2. Aplicar eventos al estado
    const newState = await this.applyEvents(sceneId, events);
    
    // 3. Calcular nuevo Merkle root
    const stateLeaves = this.serializeStateToLeaves(newState);
    this.merkleTree = new MerkleTree(stateLeaves, this.crypto.sha256);
    const newRoot = this.merkleTree.getRoot();
    
    // 4. Anclar en blockchain (opcional)
    if (this.config.blockchainAnchoringEnabled) {
      await this.anchorToBlockchain(sceneId, newRoot);
    }
    
    // 5. Actualizar estado con verificación
    await this.updateStateWithIntegrityCheck(sceneId, newState, newRoot);
  }
  
  async verifySceneIntegrity(sceneId: string): Promise<boolean> {
    const currentState = await this.getSceneState(sceneId);
    const storedRoot = await this.getStoredMerkleRoot(sceneId);
    
    // Recalcular root del estado actual
    const stateLeaves = this.serializeStateToLeaves(currentState);
    const computedTree = new MerkleTree(stateLeaves, this.crypto.sha256);
    const computedRoot = computedTree.getRoot();
    
    return storedRoot === computedRoot;
  }
}
```

---

## R - REPUDIATION (Repudio)

### Vectores de ataque identificados

#### R1: Negación de transacciones económicas
```
Amenaza: Usuario niega haber realizado una transacción
Vector: Reclamación de compromiso de claves, disputa de autenticidad
Impacto: ALTO - Compromete confianza en sistema económico
```

**Mitigación implementada:**
```sql
-- BookPI - Registro inmutable de evidencia
CREATE TABLE bookpi_evidence (
    evidence_id UUID PRIMARY KEY,
    event_type TEXT NOT NULL,
    actor_did TEXT NOT NULL,
    action_data JSONB NOT NULL,
    timestamp_utc TIMESTAMP DEFAULT NOW(),
    cryptographic_proof JSONB NOT NULL,
    blockchain_anchor TEXT,
    witness_signatures TEXT[],
    
    -- Campos de no repudio
    signature_algorithm TEXT DEFAULT 'Ed25519',
    signature_value TEXT NOT NULL,
    public_key_at_time TEXT NOT NULL,
    nonce TEXT NOT NULL UNIQUE,
    
    -- Metadatos de contexto
    ip_address INET,
    user_agent TEXT,
    session_id TEXT,
    device_fingerprint TEXT
);

-- Función de registro de evidencia no repudiable
CREATE OR REPLACE FUNCTION record_non_repudiable_evidence(
    p_event_type TEXT,
    p_actor_did TEXT,
    p_action_data JSONB,
    p_signature TEXT,
    p_nonce TEXT,
    p_context JSONB DEFAULT '{}'::jsonb
) RETURNS UUID AS $$
DECLARE
    v_evidence_id UUID;
    v_public_key TEXT;
    v_cryptographic_proof JSONB;
BEGIN
    v_evidence_id := gen_random_uuid();
    
    -- Obtener clave pública actual del actor
    SELECT public_key INTO v_public_key 
    FROM did_registry 
    WHERE did = p_actor_did AND status = 'active';
    
    -- Construir prueba criptográfica
    v_cryptographic_proof := jsonb_build_object(
        'signature_algorithm', 'Ed25519',
        'signature_value', p_signature,
        'public_key', v_public_key,
        'message_hash', encode(sha256(p_action_data::text::bytea), 'hex'),
        'timestamp', NOW(),
        'nonce', p_nonce
    );
    
    -- Verificar firma antes de registrar
    IF NOT verify_did_authenticity(p_actor_did, p_signature, p_action_data::text) THEN
        RAISE EXCEPTION 'Invalid signature for non-repudiable evidence';
    END IF;
    
    -- Registrar evidencia
    INSERT INTO bookpi_evidence (
        evidence_id, event_type, actor_did, action_data,
        cryptographic_proof, signature_value, public_key_at_time, nonce,
        ip_address, user_agent, session_id
    ) VALUES (
        v_evidence_id, p_event_type, p_actor_did, p_action_data,
        v_cryptographic_proof, p_signature, v_public_key, p_nonce,
        (p_context->>'ip_address')::inet,
        p_context->>'user_agent',
        p_context->>'session_id'
    );
    
    -- Anclar en blockchain para inmutabilidad adicional
    PERFORM anchor_evidence_to_blockchain(v_evidence_id);
    
    RETURN v_evidence_id;
END;
$$ LANGUAGE plpgsql;
```

#### R2: Negación de participación en gobernanza
```
Amenaza: Usuario niega haber votado en una propuesta
Vector: Reclamación de voto no autorizado
Impacto: MEDIO - Compromete legitimidad de decisiones
```

**Mitigación implementada:**
```sql
-- Registro de votos con prueba criptográfica
CREATE TABLE governance_votes_evidence (
    vote_id UUID PRIMARY KEY,
    proposal_id UUID NOT NULL,
    voter_did TEXT NOT NULL,
    vote_value INTEGER NOT NULL,
    timestamp_utc TIMESTAMP DEFAULT NOW(),
    
    -- Evidencia criptográfica
    vote_commitment TEXT NOT NULL, -- Hash del voto
    signature TEXT NOT NULL,
    public_key_snapshot TEXT NOT NULL,
    voting_power_at_time NUMERIC NOT NULL,
    
    -- Contexto adicional
    voting_session_id TEXT NOT NULL,
    client_metadata JSONB,
    
    -- Verificación de integridad
    CONSTRAINT valid_vote_commitment CHECK (
        vote_commitment = encode(sha256(
            (proposal_id::text || voter_did || vote_value::text || timestamp_utc::text)::bytea
        ), 'hex')
    )
);

-- Función de verificación de voto no repudiable
CREATE OR REPLACE FUNCTION verify_vote_non_repudiation(
    p_vote_id UUID
) RETURNS JSONB AS $$
DECLARE
    v_vote governance_votes_evidence%ROWTYPE;
    v_verification_result JSONB;
BEGIN
    SELECT * INTO v_vote FROM governance_votes_evidence WHERE vote_id = p_vote_id;
    
    v_verification_result := jsonb_build_object(
        'vote_id', v_vote.vote_id,
        'cryptographic_integrity', verify_did_authenticity(
            v_vote.voter_did, 
            v_vote.signature, 
            v_vote.vote_commitment
        ),
        'temporal_validity', (NOW() - v_vote.timestamp_utc) < INTERVAL '1 year',
        'commitment_integrity', (
            v_vote.vote_commitment = encode(sha256(
                (v_vote.proposal_id::text || v_vote.voter_did || 
                 v_vote.vote_value::text || v_vote.timestamp_utc::text)::bytea
            ), 'hex')
        ),
        'public_key_at_time', v_vote.public_key_snapshot,
        'blockchain_anchor', (
            SELECT blockchain_anchor FROM bookpi_evidence 
            WHERE evidence_id = v_vote.vote_id
        )
    );
    
    RETURN v_verification_result;
END;
$$ LANGUAGE plpgsql;
```

---

## I - INFORMATION DISCLOSURE (Filtración de Información)

### Vectores de ataque identificados

#### I1: Acceso no autorizado a datos personales
```
Amenaza: Atacante accede a información personal sin consentimiento
Vector: SQL injection, privilege escalation, insider threat
Impacto: CRÍTICO - Violación de privacidad y regulaciones
```

**Mitigación implementada:**
```sql
-- Zero-Trust con Row Level Security (RLS)
ALTER TABLE user_personal_data ENABLE ROW LEVEL SECURITY;

-- Política de acceso basada en consentimiento
CREATE POLICY personal_data_access_policy ON user_personal_data
    FOR ALL TO authenticated_users
    USING (
        -- Solo el propietario puede acceder
        owner_did = current_setting('app.current_user_did')
        OR
        -- O existe consentimiento explícito
        EXISTS (
            SELECT 1 FROM data_processing_consent 
            WHERE user_did = owner_did 
            AND consent_given = TRUE 
            AND (expiry_date IS NULL OR expiry_date > NOW())
            AND data_categories @> ARRAY[data_category]
        )
        OR
        -- O es acceso de auditoría autorizado
        EXISTS (
            SELECT 1 FROM audit_permissions
            WHERE auditor_did = current_setting('app.current_user_did')
            AND audit_scope @> ARRAY[owner_did]
            AND audit_active = TRUE
        )
    );

-- Función de acceso controlado
CREATE OR REPLACE FUNCTION access_personal_data(
    p_requester_did TEXT,
    p_owner_did TEXT,
    p_data_category TEXT,
    p_purpose TEXT
) RETURNS JSONB AS $$
DECLARE
    v_has_consent BOOLEAN;
    v_data JSONB;
BEGIN
    -- Verificar consentimiento
    SELECT consent_given INTO v_has_consent
    FROM data_processing_consent
    WHERE user_did = p_owner_did
    AND purpose = p_purpose
    AND data_categories @> ARRAY[p_data_category]
    AND (expiry_date IS NULL OR expiry_date > NOW());
    
    IF NOT COALESCE(v_has_consent, FALSE) THEN
        -- Registrar intento de acceso no autorizado
        INSERT INTO security_incidents (
            incident_type, requester_did, target_did, 
            details, severity, timestamp_utc
        ) VALUES (
            'UNAUTHORIZED_DATA_ACCESS', p_requester_did, p_owner_did,
            jsonb_build_object('data_category', p_data_category, 'purpose', p_purpose),
            'HIGH', NOW()
        );
        
        RAISE EXCEPTION 'Access denied: No valid consent for data access';
    END IF;
    
    -- Registrar acceso autorizado
    INSERT INTO data_access_log (
        requester_did, owner_did, data_category, 
        purpose, access_granted, timestamp_utc
    ) VALUES (
        p_requester_did, p_owner_did, p_data_category,
        p_purpose, TRUE, NOW()
    );
    
    -- Retornar datos (pseudonimizados si es necesario)
    SELECT pseudonymize_if_required(data, p_purpose) INTO v_data
    FROM user_personal_data
    WHERE owner_did = p_owner_did AND data_category = p_data_category;
    
    RETURN v_data;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### I2: Filtración de información en comunicaciones XR
```
Amenaza: Interceptación de comunicaciones en espacios virtuales
Vector: Man-in-the-middle, packet sniffing
Impacto: ALTO - Compromete privacidad de interacciones
```

**Mitigación implementada:**
```typescript
// Encriptación end-to-end para comunicaciones XR
class SecureXRCommunication {
  private sessionKeys: Map<string, SessionKey> = new Map();
  
  async establishSecureSession(participantDID: string): Promise<SessionKey> {
    // 1. Generar par de claves efímeras X25519
    const ephemeralKeyPair = await this.crypto.generateX25519KeyPair();
    
    // 2. Obtener clave pública del participante
    const participantPublicKey = await this.didResolver.getPublicKey(participantDID);
    
    // 3. Realizar intercambio de claves
    const sharedSecret = await this.crypto.x25519(
      ephemeralKeyPair.privateKey,
      participantPublicKey
    );
    
    // 4. Derivar clave de sesión
    const sessionKey = await this.crypto.hkdf(
      sharedSecret,
      'TAMV_XR_SESSION_v1',
      32 // 256 bits
    );
    
    // 5. Almacenar clave de sesión
    const sessionId = this.generateSessionId();
    this.sessionKeys.set(sessionId, {
      key: sessionKey,
      participantDID,
      createdAt: Date.now(),
      messageCount: 0
    });
    
    // 6. Programar rotación automática
    this.scheduleKeyRotation(sessionId);
    
    return { sessionId, key: sessionKey };
  }
  
  async encryptMessage(sessionId: string, message: any): Promise<EncryptedMessage> {
    const session = this.sessionKeys.get(sessionId);
    if (!session) {
      throw new Error('Invalid session ID');
    }
    
    // Verificar límites de uso de clave
    if (session.messageCount >= 1000) {
      await this.rotateSessionKey(sessionId);
    }
    
    // Generar nonce único
    const nonce = await this.crypto.randomBytes(12);
    
    // Encriptar con AES-256-GCM
    const encrypted = await this.crypto.aes256gcm.encrypt(
      session.key,
      nonce,
      JSON.stringify(message)
    );
    
    // Incrementar contador de mensajes
    session.messageCount++;
    
    return {
      sessionId,
      nonce: this.crypto.base64Encode(nonce),
      ciphertext: this.crypto.base64Encode(encrypted.ciphertext),
      tag: this.crypto.base64Encode(encrypted.tag),
      timestamp: Date.now()
    };
  }
  
  private scheduleKeyRotation(sessionId: string): void {
    setTimeout(async () => {
      await this.rotateSessionKey(sessionId);
    }, 3600000); // 1 hora
  }
}
```

---

## D - DENIAL OF SERVICE (Denegación de Servicio)

### Vectores de ataque identificados

#### D1: Sobrecarga de sistema de votación
```
Amenaza: Atacante satura sistema con votos falsos o spam
Vector: Botnet, ataques distribuidos
Impacto: ALTO - Compromete procesos democráticos
```

**Mitigación implementada:**
```sql
-- Rate limiting para votación
CREATE TABLE voting_rate_limits (
    voter_did TEXT PRIMARY KEY,
    votes_in_hour INTEGER DEFAULT 0,
    votes_in_day INTEGER DEFAULT 0,
    last_vote_timestamp TIMESTAMP,
    suspicious_activity_score INTEGER DEFAULT 0,
    
    CONSTRAINT reasonable_voting_limits CHECK (
        votes_in_hour <= 10 AND votes_in_day <= 50
    )
);

-- Función de verificación de rate limiting
CREATE OR REPLACE FUNCTION check_voting_rate_limit(
    p_voter_did TEXT
) RETURNS BOOLEAN AS $$
DECLARE
    v_current_limits voting_rate_limits%ROWTYPE;
    v_hour_ago TIMESTAMP := NOW() - INTERVAL '1 hour';
    v_day_ago TIMESTAMP := NOW() - INTERVAL '1 day';
BEGIN
    -- Obtener límites actuales
    SELECT * INTO v_current_limits 
    FROM voting_rate_limits 
    WHERE voter_did = p_voter_did;
    
    -- Si no existe registro, crear uno
    IF v_current_limits IS NULL THEN
        INSERT INTO voting_rate_limits (voter_did, votes_in_hour, votes_in_day, last_vote_timestamp)
        VALUES (p_voter_did, 0, 0, NOW());
        RETURN TRUE;
    END IF;
    
    -- Resetear contadores si ha pasado el tiempo
    IF v_current_limits.last_vote_timestamp < v_hour_ago THEN
        UPDATE voting_rate_limits 
        SET votes_in_hour = 0 
        WHERE voter_did = p_voter_did;
    END IF;
    
    IF v_current_limits.last_vote_timestamp < v_day_ago THEN
        UPDATE voting_rate_limits 
        SET votes_in_day = 0 
        WHERE voter_did = p_voter_did;
    END IF;
    
    -- Verificar límites
    IF v_current_limits.votes_in_hour >= 10 OR v_current_limits.votes_in_day >= 50 THEN
        -- Incrementar score de actividad sospechosa
        UPDATE voting_rate_limits 
        SET suspicious_activity_score = suspicious_activity_score + 1
        WHERE voter_did = p_voter_did;
        
        -- Registrar incidente de seguridad
        INSERT INTO security_incidents (
            incident_type, requester_did, details, severity
        ) VALUES (
            'VOTING_RATE_LIMIT_EXCEEDED', p_voter_did,
            jsonb_build_object('votes_in_hour', v_current_limits.votes_in_hour, 'votes_in_day', v_current_limits.votes_in_day),
            'MEDIUM'
        );
        
        RETURN FALSE;
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;
```

#### D2: Ataques DDoS a infraestructura XR
```
Amenaza: Sobrecarga de servidores XR con conexiones maliciosas
Vector: Ataques distribuidos, amplificación
Impacto: ALTO - Interrumpe servicios de metaverso
```

**Mitigación implementada:**
```typescript
// Edge protection con rate limiting distribuido
class EdgeProtection {
  private redis: Redis;
  private rateLimiter: RateLimiter;
  
  async checkConnectionLimit(clientIP: string, userDID?: string): Promise<boolean> {
    const key = userDID ? `user:${userDID}` : `ip:${clientIP}`;
    
    // Límites por IP
    const ipConnections = await this.redis.incr(`connections:ip:${clientIP}`);
    await this.redis.expire(`connections:ip:${clientIP}`, 60);
    
    if (ipConnections > 100) { // Máximo 100 conexiones por IP por minuto
      await this.logSecurityIncident('IP_CONNECTION_LIMIT_EXCEEDED', clientIP);
      return false;
    }
    
    // Límites por usuario autenticado
    if (userDID) {
      const userConnections = await this.redis.incr(`connections:user:${userDID}`);
      await this.redis.expire(`connections:user:${userDID}`, 60);
      
      if (userConnections > 10) { // Máximo 10 conexiones por usuario por minuto
        await this.logSecurityIncident('USER_CONNECTION_LIMIT_EXCEEDED', userDID);
        return false;
      }
    }
    
    return true;
  }
  
  async detectDDoSPattern(clientIP: string): Promise<boolean> {
    // Analizar patrones de tráfico
    const requestPattern = await this.analyzeRequestPattern(clientIP);
    
    // Indicadores de DDoS
    const indicators = {
      highFrequency: requestPattern.requestsPerSecond > 50,
      uniformTiming: requestPattern.timingVariance < 0.1,
      invalidRequests: requestPattern.errorRate > 0.8,
      geographicAnomalies: await this.checkGeographicAnomalies(clientIP),
      userAgentAnomalies: await this.checkUserAgentAnomalies(clientIP)
    };
    
    const suspicionScore = Object.values(indicators).filter(Boolean).length;
    
    if (suspicionScore >= 3) {
      // Activar protección automática
      await this.activateAutoProtection(clientIP, suspicionScore);
      return true;
    }
    
    return false;
  }
  
  private async activateAutoProtection(clientIP: string, score: number): Promise<void> {
    // Bloqueo temporal progresivo
    const blockDuration = Math.min(score * 300, 3600); // Máximo 1 hora
    
    await this.redis.setex(`blocked:${clientIP}`, blockDuration, score.toString());
    
    // Notificar a sistemas de monitoreo
    await this.notifySecurityTeam({
      type: 'DDOS_PROTECTION_ACTIVATED',
      clientIP,
      suspicionScore: score,
      blockDuration
    });
  }
}
```

---

## E - ELEVATION OF PRIVILEGE (Escalación de Privilegios)

### Vectores de ataque identificados

#### E1: Intento de obtener privilegios de administrador
```
Amenaza: Atacante intenta obtener acceso administrativo
Vector: Explotación de vulnerabilidades, ingeniería social
Impacto: CRÍTICO - Compromete todo el sistema
```

**Mitigación implementada:**
```sql
-- No existe rol de administrador global
-- Sistema de permisos granulares sin superusuario

-- Verificación de que no existen privilegios globales
CREATE OR REPLACE FUNCTION verify_no_god_mode()
RETURNS BOOLEAN AS $$
DECLARE
    v_god_mode_roles TEXT[];
BEGIN
    -- Buscar roles con privilegios excesivos
    SELECT ARRAY_AGG(role_name) INTO v_god_mode_roles
    FROM (
        SELECT role_name, COUNT(*) as permission_count
        FROM role_permissions rp
        JOIN permissions p ON rp.permission_id = p.permission_id
        GROUP BY role_name
        HAVING COUNT(*) > 20 -- Ningún rol debería tener más de 20 permisos
    ) excessive_roles;
    
    -- Verificar que no existen permisos de "all" o "*"
    IF EXISTS (
        SELECT 1 FROM permissions 
        WHERE resource = '*' OR action = '*' OR resource = 'all'
    ) THEN
        RAISE EXCEPTION 'God mode permission detected: wildcard permissions not allowed';
    END IF;
    
    -- Verificar que no existen usuarios con demasiados roles
    IF EXISTS (
        SELECT user_did, COUNT(*) as role_count
        FROM user_roles
        GROUP BY user_did
        HAVING COUNT(*) > 5 -- Máximo 5 roles por usuario
    ) THEN
        RAISE EXCEPTION 'Excessive role assignment detected';
    END IF;
    
    RETURN v_god_mode_roles IS NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger para verificar asignación de permisos
CREATE OR REPLACE FUNCTION prevent_privilege_escalation()
RETURNS TRIGGER AS $$
BEGIN
    -- Verificar que el usuario que asigna el rol tiene permisos para hacerlo
    IF NOT has_permission(
        current_setting('app.current_user_did'),
        'role',
        'assign',
        jsonb_build_object('target_role', NEW.role_name)
    ) THEN
        RAISE EXCEPTION 'Insufficient privileges to assign role %', NEW.role_name;
    END IF;
    
    -- Verificar que no se está creando escalación circular
    IF would_create_circular_privilege(NEW.user_did, NEW.role_name) THEN
        RAISE EXCEPTION 'Circular privilege escalation detected';
    END IF;
    
    -- Registrar asignación de rol para auditoría
    INSERT INTO privilege_audit_log (
        action, actor_did, target_did, role_name, timestamp_utc
    ) VALUES (
        'ROLE_ASSIGNED', 
        current_setting('app.current_user_did'),
        NEW.user_did,
        NEW.role_name,
        NOW()
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER prevent_privilege_escalation_trigger
    BEFORE INSERT OR UPDATE ON user_roles
    FOR EACH ROW EXECUTE FUNCTION prevent_privilege_escalation();
```

#### E2: Bypass de controles de autorización
```
Amenaza: Atacante evita verificaciones de permisos
Vector: SQL injection, race conditions, logic flaws
Impacto: ALTO - Acceso no autorizado a funciones
```

**Mitigación implementada:**
```sql
-- Verificación de autorización en cada operación crítica
CREATE OR REPLACE FUNCTION secure_operation_wrapper(
    p_operation TEXT,
    p_parameters JSONB,
    p_required_permission TEXT,
    p_resource_context JSONB DEFAULT '{}'::jsonb
) RETURNS JSONB AS $$
DECLARE
    v_current_user_did TEXT;
    v_has_permission BOOLEAN;
    v_operation_result JSONB;
    v_audit_id UUID;
BEGIN
    -- Obtener usuario actual
    v_current_user_did := current_setting('app.current_user_did', true);
    
    IF v_current_user_did IS NULL THEN
        RAISE EXCEPTION 'No authenticated user context';
    END IF;
    
    -- Verificar permisos
    v_has_permission := has_permission(
        ARRAY(SELECT role_name FROM user_roles WHERE user_did = v_current_user_did),
        split_part(p_required_permission, ':', 1), -- resource
        split_part(p_required_permission, ':', 2), -- action
        p_resource_context
    );
    
    IF NOT v_has_permission THEN
        -- Registrar intento de acceso no autorizado
        INSERT INTO security_incidents (
            incident_type, requester_did, details, severity
        ) VALUES (
            'UNAUTHORIZED_OPERATION_ATTEMPT',
            v_current_user_did,
            jsonb_build_object(
                'operation', p_operation,
                'required_permission', p_required_permission,
                'context', p_resource_context
            ),
            'HIGH'
        );
        
        RAISE EXCEPTION 'Insufficient privileges for operation: %', p_operation;
    END IF;
    
    -- Registrar inicio de operación
    v_audit_id := record_non_repudiable_evidence(
        'AUTHORIZED_OPERATION',
        v_current_user_did,
        jsonb_build_object(
            'operation', p_operation,
            'parameters', p_parameters,
            'permission_verified', p_required_permission
        ),
        '', -- Signature will be added by calling function
        gen_random_uuid()::text
    );
    
    -- Ejecutar operación de forma segura
    BEGIN
        CASE p_operation
            WHEN 'create_proposal' THEN
                v_operation_result := create_proposal_secure(p_parameters);
            WHEN 'cast_vote' THEN
                v_operation_result := cast_vote_secure(p_parameters);
            WHEN 'transfer_funds' THEN
                v_operation_result := transfer_funds_secure(p_parameters);
            ELSE
                RAISE EXCEPTION 'Unknown operation: %', p_operation;
        END CASE;
        
        -- Registrar éxito de operación
        UPDATE bookpi_evidence 
        SET action_data = action_data || jsonb_build_object('result', 'success', 'output', v_operation_result)
        WHERE evidence_id = v_audit_id;
        
    EXCEPTION WHEN OTHERS THEN
        -- Registrar fallo de operación
        UPDATE bookpi_evidence 
        SET action_data = action_data || jsonb_build_object('result', 'error', 'error_message', SQLERRM)
        WHERE evidence_id = v_audit_id;
        
        RAISE;
    END;
    
    RETURN v_operation_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## Monitoreo y Respuesta a Incidentes

### Sistema de alertas automáticas

```sql
-- Función de detección de patrones de ataque
CREATE OR REPLACE FUNCTION detect_attack_patterns()
RETURNS VOID AS $$
DECLARE
    v_incident RECORD;
BEGIN
    -- Detectar múltiples intentos de acceso fallidos
    FOR v_incident IN
        SELECT requester_did, COUNT(*) as attempt_count
        FROM security_incidents
        WHERE incident_type = 'UNAUTHORIZED_DATA_ACCESS'
        AND timestamp_utc > NOW() - INTERVAL '1 hour'
        GROUP BY requester_did
        HAVING COUNT(*) >= 5
    LOOP
        -- Activar respuesta automática
        PERFORM activate_security_response(
            'REPEATED_UNAUTHORIZED_ACCESS',
            v_incident.requester_did,
            jsonb_build_object('attempt_count', v_incident.attempt_count)
        );
    END LOOP;
    
    -- Detectar patrones de escalación de privilegios
    FOR v_incident IN
        SELECT actor_did, COUNT(*) as escalation_attempts
        FROM privilege_audit_log
        WHERE timestamp_utc > NOW() - INTERVAL '1 hour'
        GROUP BY actor_did
        HAVING COUNT(*) >= 10
    LOOP
        PERFORM activate_security_response(
            'PRIVILEGE_ESCALATION_PATTERN',
            v_incident.actor_did,
            jsonb_build_object('escalation_attempts', v_incident.escalation_attempts)
        );
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Programar ejecución periódica
SELECT cron.schedule('detect-attack-patterns', '*/5 * * * *', 'SELECT detect_attack_patterns();');
```

### Respuesta automática a amenazas

```sql
CREATE OR REPLACE FUNCTION activate_security_response(
    p_threat_type TEXT,
    p_actor_did TEXT,
    p_details JSONB
) RETURNS VOID AS $$
BEGIN
    CASE p_threat_type
        WHEN 'REPEATED_UNAUTHORIZED_ACCESS' THEN
            -- Suspender temporalmente la cuenta
            INSERT INTO account_suspensions (
                user_did, suspension_type, duration, reason, created_at
            ) VALUES (
                p_actor_did, 'TEMPORARY', INTERVAL '1 hour', 
                'Repeated unauthorized access attempts', NOW()
            );
            
        WHEN 'PRIVILEGE_ESCALATION_PATTERN' THEN
            -- Revocar todos los roles no esenciales
            DELETE FROM user_roles 
            WHERE user_did = p_actor_did 
            AND role_name NOT IN ('basic_user');
            
        WHEN 'DDOS_PATTERN' THEN
            -- Activar rate limiting agresivo
            INSERT INTO enhanced_rate_limits (
                target_identifier, limit_type, limit_value, duration
            ) VALUES (
                p_actor_did, 'REQUESTS_PER_MINUTE', 5, INTERVAL '1 hour'
            );
    END CASE;
    
    -- Notificar al equipo de seguridad
    INSERT INTO security_alerts (
        alert_type, severity, actor_did, details, auto_response_applied, created_at
    ) VALUES (
        p_threat_type, 'HIGH', p_actor_did, p_details, TRUE, NOW()
    );
END;
$$ LANGUAGE plpgsql;
```

---

## Resultado del Análisis STRIDE

**👉 Modelo de amenazas completo con mitigaciones implementadas.**

### Resumen de protecciones:

| Categoría | Nivel de Protección | Implementación |
|-----------|-------------------|----------------|
| **Spoofing** | ✅ ALTO | DID + Ed25519 + Anti-replay |
| **Tampering** | ✅ ALTO | Hash + MSR + Blockchain anchor |
| **Repudiation** | ✅ ALTO | BookPI + Evidencia criptográfica |
| **Info Disclosure** | ✅ ALTO | Zero-Trust + RLS + Encriptación E2E |
| **DoS** | ✅ MEDIO-ALTO | Rate limiting + Edge protection |
| **Elevation** | ✅ ALTO | No god-mode + Permisos granulares |

### Características del modelo de seguridad:

1. **Defensa en Profundidad**: Múltiples capas de protección
2. **Principio de Menor Privilegio**: Permisos mínimos necesarios
3. **Verificación Continua**: Monitoreo en tiempo real
4. **Respuesta Automática**: Mitigación automática de amenazas
5. **Auditabilidad Total**: Registro inmutable de todos los eventos
6. **Recuperación Rápida**: Capacidad de restauración ante incidentes

El sistema TAMV está diseñado para ser resiliente ante las amenazas más comunes y sofisticadas, manteniendo la operabilidad mientras protege la integridad, confidencialidad y disponibilidad de todos los componentes.