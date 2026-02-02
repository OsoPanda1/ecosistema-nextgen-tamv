# CRIPTOGRAFÍA FORMAL DEL HOME 3D
## Especificación Técnica Verificable

**Estado:** Especificación formal ejecutable  
**Versión:** 1.0  
**Objetivo:** Home 3D verificable matemáticamente, no "escena bonita"

---

## Identidades

### DID + Claves Ed25519

```
Identity := {
    did: DID_TAMV,
    publicKey: Ed25519_PublicKey,
    privateKey: Ed25519_PrivateKey,
    created: Timestamp,
    lastRotation: Timestamp
}

DID_TAMV := "did:tamv:" + Base58(SHA256(publicKey))
```

### Vinculación opcional a hardware enclave

```
HardwareBinding := {
    enclaveId: UUID,
    attestation: SGX_Attestation | TPM_Attestation,
    bindingSignature: Ed25519_Signature,
    bindingTimestamp: Timestamp
}
```

---

## Sesiones

### X25519 para intercambio

```
SessionKey := {
    ephemeralPrivate: X25519_PrivateKey,
    ephemeralPublic: X25519_PublicKey,
    sharedSecret: X25519_SharedSecret,
    derivedKey: HKDF(sharedSecret, sessionInfo)
}
```

### Forward Secrecy obligatoria

```
ForwardSecrecy := {
    keyRotationInterval: 3600, // 1 hora
    maxMessagesPerKey: 1000,
    ratchetState: DoubleRatchet_State,
    deletionPolicy: IMMEDIATE_DELETE
}
```

### Rotación automática

```
KeyRotation := {
    trigger: TIME_BASED | MESSAGE_COUNT | MANUAL,
    newKeyGeneration: () => X25519_KeyPair(),
    oldKeyDeletion: () => SecureDelete(oldKey),
    notificationProtocol: SILENT | EXPLICIT
}
```

---

## Eventos

### Todo evento XR

```
EVENT := {
    id: UUID_v4,
    timestamp: RFC3339_Timestamp,
    scene: SceneID,
    actorDID: DID_TAMV,
    payload: EncryptedPayload,
    signature: Ed25519_Signature
}

EncryptedPayload := AES256_GCM(
    key: SessionKey.derivedKey,
    nonce: Random(96_bits),
    data: EventData,
    aad: id + timestamp + scene + actorDID
)

EventData := {
    type: EventType,
    position: Vector3,
    rotation: Quaternion,
    interaction: InteractionData,
    metadata: CustomMetadata
}
```

### Tipos de eventos

```
EventType := 
    | ENTER_SCENE
    | EXIT_SCENE
    | MOVE
    | INTERACT
    | SPEAK
    | GESTURE
    | CREATE_OBJECT
    | MODIFY_OBJECT
    | DELETE_OBJECT
    | CUSTOM
```

---

## Seguridad

### Anti-replay

```
ReplayProtection := {
    windowSize: 300, // 5 minutos
    nonceCache: LRU_Cache<Nonce, Timestamp>,
    timestampTolerance: 30, // 30 segundos
    validation: (event) => {
        if (now() - event.timestamp > timestampTolerance) return REJECT;
        if (nonceCache.contains(event.nonce)) return REJECT;
        nonceCache.put(event.nonce, event.timestamp);
        return ACCEPT;
    }
}
```

### Anti-spoofing

```
SpoofingProtection := {
    identityVerification: (event) => {
        publicKey := DID_Resolver.resolve(event.actorDID);
        return Ed25519_Verify(
            publicKey,
            event.signature,
            event.id + event.timestamp + event.scene + event.payload
        );
    },
    positionValidation: (event) => {
        lastPosition := SceneState.getLastPosition(event.actorDID);
        maxSpeed := SceneConfig.maxMovementSpeed;
        timeDelta := event.timestamp - lastEvent.timestamp;
        maxDistance := maxSpeed * timeDelta;
        actualDistance := distance(event.position, lastPosition);
        return actualDistance <= maxDistance;
    }
}
```

### Scene integrity hash

```
SceneIntegrity := {
    stateHash: SHA256,
    merkleRoot: MerkleTree_Root,
    participants: Set<DID_TAMV>,
    lastUpdate: Timestamp,
    
    computeHash: (scene) => {
        objects := scene.getAllObjects().sort();
        participants := scene.getParticipants().sort();
        state := objects + participants + scene.metadata;
        return SHA256(state);
    },
    
    verifyIntegrity: (scene, expectedHash) => {
        currentHash := computeHash(scene);
        return currentHash == expectedHash;
    }
}
```

### MSR anchor opcional

```
MSR_Anchor := {
    enabled: Boolean,
    interval: 3600, // 1 hora
    merkleRoot: MerkleTree_Root,
    blockchainTx: Transaction_Hash,
    
    anchor: (sceneState) => {
        merkleTree := MerkleTree.build(sceneState.events);
        transaction := Blockchain.submit({
            type: "SCENE_ANCHOR",
            sceneId: sceneState.id,
            merkleRoot: merkleTree.root,
            timestamp: now(),
            participants: sceneState.participants.length
        });
        return transaction.hash;
    }
}
```

---

## Protocolos de comunicación

### Handshake de sesión

```
SessionHandshake := {
    1. ClientHello: {
        clientDID: DID_TAMV,
        ephemeralPublic: X25519_PublicKey,
        supportedCiphers: [AES256_GCM],
        timestamp: RFC3339_Timestamp
    },
    
    2. ServerHello: {
        serverDID: DID_TAMV,
        ephemeralPublic: X25519_PublicKey,
        selectedCipher: AES256_GCM,
        sessionId: UUID,
        timestamp: RFC3339_Timestamp
    },
    
    3. KeyExchange: {
        sharedSecret: X25519(clientPrivate, serverPublic),
        sessionKey: HKDF(sharedSecret, "TAMV_HOME_3D_v1"),
        confirmation: HMAC(sessionKey, "HANDSHAKE_COMPLETE")
    }
}
```

### Sincronización de estado

```
StateSynchronization := {
    protocol: OPERATIONAL_TRANSFORM,
    conflictResolution: TIMESTAMP_ORDERING,
    
    applyOperation: (operation) => {
        if (!verifySignature(operation)) return REJECT;
        if (!verifyTimestamp(operation)) return REJECT;
        if (!verifyPermissions(operation)) return REJECT;
        
        transformedOp := transform(operation, concurrentOps);
        sceneState.apply(transformedOp);
        broadcast(transformedOp, excludeSender);
        
        return SUCCESS;
    }
}
```

---

## Verificación matemática

### Propiedades verificables

```
SecurityProperties := {
    Confidentiality: ∀ event ∈ Events, 
        decrypt(event.payload) ⟹ hasSessionKey(actor),
    
    Integrity: ∀ event ∈ Events,
        verify(event.signature, event.actorDID) = TRUE,
    
    Authenticity: ∀ event ∈ Events,
        event.actorDID ∈ AuthorizedParticipants,
    
    NonRepudiation: ∀ event ∈ Events,
        ∃ signature : Ed25519_Verify(signature, event) = TRUE,
    
    Freshness: ∀ event ∈ Events,
        |now() - event.timestamp| ≤ TOLERANCE
}
```

### Invariantes del sistema

```
SystemInvariants := {
    SceneConsistency: ∀ participant ∈ Scene,
        sceneHash(participant.view) = globalSceneHash,
    
    IdentityUniqueness: ∀ did₁, did₂ ∈ Participants,
        did₁ ≠ did₂ ⟹ publicKey(did₁) ≠ publicKey(did₂),
    
    TemporalOrdering: ∀ event₁, event₂ ∈ Events,
        event₁.timestamp < event₂.timestamp ⟹ 
        processOrder(event₁) < processOrder(event₂)
}
```

---

## Implementación de referencia

### Estructura de datos

```rust
#[derive(Serialize, Deserialize)]
pub struct Home3DEvent {
    pub id: Uuid,
    pub timestamp: DateTime<Utc>,
    pub scene_id: SceneId,
    pub actor_did: Did,
    pub payload: EncryptedPayload,
    pub signature: Ed25519Signature,
}

impl Home3DEvent {
    pub fn verify(&self) -> Result<(), CryptoError> {
        let public_key = resolve_did(&self.actor_did)?;
        let message = self.signable_content();
        ed25519_verify(&public_key, &self.signature, &message)
    }
    
    pub fn decrypt(&self, session_key: &SessionKey) -> Result<EventData, CryptoError> {
        aes256_gcm_decrypt(&session_key.derived_key, &self.payload)
    }
}
```

### Validación criptográfica

```rust
pub fn validate_event_chain(events: &[Home3DEvent]) -> Result<(), ValidationError> {
    for window in events.windows(2) {
        let prev = &window[0];
        let curr = &window[1];
        
        // Verificar orden temporal
        if curr.timestamp <= prev.timestamp {
            return Err(ValidationError::TemporalOrder);
        }
        
        // Verificar firmas
        prev.verify()?;
        curr.verify()?;
        
        // Verificar anti-replay
        if is_replayed(&curr.id) {
            return Err(ValidationError::ReplayAttack);
        }
    }
    
    Ok(())
}
```

---

## Resultado

👉 **El Home 3D es verificable matemáticamente, no "escena bonita".**

### Garantías criptográficas:
- **Confidencialidad**: Solo participantes autorizados pueden descifrar eventos
- **Integridad**: Cualquier modificación es detectable
- **Autenticidad**: Cada evento está firmado por su autor real
- **No repudio**: Las acciones no pueden ser negadas
- **Frescura**: Los eventos antiguos son rechazados automáticamente

### Propiedades del sistema:
- **Verificabilidad**: Cualquier observador puede verificar la validez
- **Auditabilidad**: Todas las acciones quedan registradas inmutablemente
- **Escalabilidad**: El protocolo funciona con miles de participantes
- **Interoperabilidad**: Compatible con estándares W3C DID y WebRTC