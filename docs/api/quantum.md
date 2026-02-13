# Quantum Computing API Documentation

## Overview

The Quantum Computing API provides endpoints for quantum-enhanced operations, including quantum circuits, quantum machine learning, quantum encryption, and quantum data processing.

## Base URL

```
Development: http://localhost:3000/api/v1/quantum
Production: https://api.tamv.example.com/api/v1/quantum
```

## Authentication

All endpoints require JWT authentication:

```http
Authorization: Bearer <your-jwt-token>
```

## Quantum Computing Endpoints

### Health Check

**Endpoint:** `GET /health`

**Description:** Check quantum engine health status

**Response:**
```json
{
  "status": "ok",
  "quantumEngine": "running",
  "timestamp": "2023-10-27T10:15:30Z"
}
```

### Quantum Circuits

**Create Circuit:** `POST /circuits`

**Description:** Create a new quantum circuit

**Request Body:**
```json
{
  "qubits": 2
}
```

**Response:**
```json
{
  "id": "uuid",
  "qubits": 2,
  "gates": [],
  "measurements": [],
  "timestamp": "2023-10-27T10:15:30Z"
}
```

**Get Circuit:** `GET /circuits/:id`

**Description:** Retrieve a quantum circuit by ID

**Response:**
```json
{
  "id": "uuid",
  "qubits": 2,
  "gates": [],
  "measurements": [],
  "timestamp": "2023-10-27T10:15:30Z"
}
```

**Add Gate:** `POST /circuits/:id/gates`

**Description:** Add a quantum gate to a circuit

**Request Body:**
```json
{
  "type": "hadamard",
  "targetQubits": [0],
  "parameters": []
}
```

**Response:** Updated circuit object

**Execute Circuit:** `POST /circuits/:id/execute`

**Description:** Execute a quantum circuit

**Request Body:**
```json
{
  "shots": 1024
}
```

**Response:**
```json
{
  "id": "uuid",
  "circuitId": "uuid",
  "measurements": [],
  "counts": {
    "00": 512,
    "01": 256,
    "10": 128,
    "11": 128
  },
  "probabilities": {
    "00": 0.5,
    "01": 0.25,
    "10": 0.125,
    "11": 0.125
  },
  "executionTime": 1500,
  "timestamp": "2023-10-27T10:15:30Z"
}
```

### Quantum Data Processing

**Quantum Processing:** `POST /process`

**Description:** Quantum-enhanced data processing

**Request Body:**
```json
{
  "data": {
    "text": "Quantum computing revolutionizing technology",
    "images": ["base64-encoded-image"],
    "audio": "base64-encoded-audio"
  }
}
```

**Response:**
```json
{
  "text": "Quantum computing revolutionizing technology",
  "images": ["base64-encoded-image"],
  "audio": "base64-encoded-audio",
  "quantumEnhanced": true,
  "quantumProcessingTime": 2500,
  "quantumScore": 0.92,
  "quantumInsights": [
    "Quantum analysis detects high semantic coherence",
    "Quantum image processing identifies hidden patterns",
    "Quantum audio analysis detects emotional tone"
  ]
}
```

### Quantum Encryption

**Quantum Encryption:** `POST /encrypt`

**Description:** Quantum-enhanced encryption

**Request Body:**
```json
{
  "data": "Sensitive information to encrypt"
}
```

**Response:**
```json
{
  "encryptedData": "Qabc123:U2VudGl2ZSBpbmZvcm1hdGlvbiB0byBlbmNyeXB0",
  "timestamp": "2023-10-27T10:15:30Z"
}
```

**Quantum Decryption:** `POST /decrypt`

**Description:** Quantum-enhanced decryption

**Request Body:**
```json
{
  "data": "Qabc123:U2VudGl2ZSBpbmZvcm1hdGlvbiB0byBlbmNyeXB0"
}
```

**Response:**
```json
{
  "decryptedData": "Sensitive information to encrypt",
  "timestamp": "2023-10-27T10:15:30Z"
}
```

### Quantum Random Number Generation

**Quantum Random:** `GET /random?min=0&max=100`

**Description:** Generate a quantum random number

**Query Parameters:**
- `min` (optional): Minimum value (default: 0)
- `max` (optional): Maximum value (default: 100)

**Response:**
```json
{
  "randomNumber": 42,
  "timestamp": "2023-10-27T10:15:30Z"
}
```

### Quantum Machine Learning

**Quantum ML Prediction:** `POST /ml/predict`

**Description:** Quantum-enhanced machine learning prediction

**Request Body:**
```json
{
  "input": {
    "text": "This is a test post about quantum computing",
    "userData": {
      "age": 25,
      "interests": ["technology", "quantum computing"]
    }
  }
}
```

**Response:**
```json
{
  "prediction": {
    "sentiment": "positive",
    "category": "content",
    "engagementScore": 0.85
  },
  "confidence": 0.92,
  "quantumFeatures": [
    "Quantum semantic analysis",
    "Quantum user behavior modeling"
  ]
}
```

### Quantum Statistics

**Get Quantum Stats:** `GET /stats`

**Description:** Get quantum engine statistics

**Response:**
```json
{
  "circuitsCreated": 42,
  "circuitsExecuted": 28,
  "totalShots": 32768,
  "averageExecutionTime": 1200,
  "quantumProcessingRequests": 156,
  "encryptionRequests": 98,
  "mlPredictions": 74,
  "timestamp": "2023-10-27T10:15:30Z"
}
```

## Quantum Protocol Endpoints

**Base URL:** `/api/v1/quantum-protocol`

### Quantum Protocol Execution

**Execute Quantum Protocol:** `POST /execute`

**Description:** Execute a quantum-enhanced protocol command

**Request Body:**
```json
{
  "command": {
    "id": "uuid",
    "protocolId": "constitution.v1",
    "action": "evaluate",
    "payload": {
      "proposal": "New governance structure"
    },
    "timestamp": "2023-10-27T10:15:30Z"
  },
  "context": {
    "actorId": "user123",
    "layer": 3
  }
}
```

**Response:**
```json
{
  "event": {
    "id": "uuid",
    "actorId": "user123",
    "protocolId": "constitution.v1",
    "phase": "evaluated",
    "command": { ... },
    "decision": {
      "allowed": true,
      "reasons": ["Constitution compliant"],
      "phase": "evaluated"
    },
    "createdAt": "2023-10-27T10:15:30Z"
  },
  "guardianEventId": "uuid",
  "xrSceneId": "xr-scene-123",
  "quantumEnhanced": true,
  "quantumResult": { ... },
  "quantumProcessingTime": 3200
}
```

### Quantum Governance

**Governance Decision:** `POST /governance`

**Description:** Quantum-enhanced governance decision

**Request Body:**
```json
{
  "proposal": {
    "title": "New economic policy",
    "description": "Proposal for a new economic system",
    "impact": "high"
  },
  "context": {
    "actorId": "user123",
    "layer": 3
  }
}
```

**Response:**
```json
{
  "approved": true,
  "quantumScore": 0.88,
  "quantumAnalysis": [
    "Quantum analysis detects positive economic impact",
    "Constitution compliance verified"
  ],
  "processingTime": 2800
}
```

### Quantum Protocol Simulation

**Simulate Protocol:** `POST /simulate`

**Description:** Simulate quantum protocol behavior

**Request Body:**
```json
{
  "command": {
    "id": "uuid",
    "protocolId": "constitution.v1",
    "action": "evaluate",
    "payload": {
      "proposal": "Test proposal"
    },
    "timestamp": "2023-10-27T10:15:30Z"
  },
  "context": {
    "actorId": "user123",
    "layer": 3
  }
}
```

**Response:**
```json
{
  "simulationResult": { ... },
  "quantumPredictions": {
    "successRate": 0.92,
    "riskLevel": "low"
  },
  "confidence": 0.89,
  "processingTime": 1800
}
```

### Quantum Protocol Optimization

**Optimize Protocol:** `POST /optimize`

**Description:** Optimize protocol using quantum computing

**Request Body:**
```json
{
  "command": {
    "id": "uuid",
    "protocolId": "constitution.v1",
    "action": "evaluate",
    "payload": {
      "proposal": "Original proposal"
    },
    "timestamp": "2023-10-27T10:15:30Z"
  },
  "context": {
    "actorId": "user123",
    "layer": 3
  }
}
```

**Response:**
```json
{
  "optimizedCommand": { ... },
  "quantumImprovements": [
    "Efficiency improved by 35%",
    "Decision time reduced by 42%"
  ],
  "optimizationScore": 0.93,
  "processingTime": 2100
}
```

### Quantum Protocol Monitoring

**Monitor Protocol:** `POST /monitor`

**Description:** Monitor protocol health using quantum techniques

**Request Body:**
```json
{
  "protocolId": "constitution.v1",
  "context": {
    "actorId": "user123",
    "layer": 3
  }
}
```

**Response:**
```json
{
  "status": "healthy",
  "quantumMetrics": {
    "performance": 0.95,
    "security": 0.98,
    "efficiency": 0.92
  },
  "processingTime": 1200
}
```

### Quantum Protocol Health

**Health Check:** `GET /health`

**Description:** Check quantum protocol system health

**Response:**
```json
{
  "status": "ok",
  "quantumProtocolOrchestrator": "running",
  "quantumEngine": "running",
  "timestamp": "2023-10-27T10:15:30Z"
}
```

### Quantum Protocol Statistics

**Get Statistics:** `GET /stats`

**Description:** Get quantum protocol statistics

**Response:**
```json
{
  "quantumProtocolExecutions": 256,
  "quantumGovernanceDecisions": 128,
  "quantumProtocolSimulations": 189,
  "quantumProtocolOptimizations": 67,
  "quantumProtocolMonitors": 43,
  "averageQuantumProcessingTime": 2500,
  "quantumEnhancementRate": 0.85,
  "quantumSuccessRate": 0.97,
  "timestamp": "2023-10-27T10:15:30Z"
}
```

## Response Formats

All API responses follow the standard TAMV format:

**Success Response:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "QUANTUM_ERROR",
    "message": "Quantum operation failed",
    "details": { ... }
  }
}
```

## Status Codes

- `200 OK`: Successful request
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Missing or invalid authentication
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error

## Rate Limiting

- Public endpoints: 50 requests per 15 minutes per IP
- Authenticated endpoints: 200 requests per 15 minutes per user
- Quantum computing endpoints: 100 requests per 15 minutes per user

## Security Considerations

1. **Quantum Encryption:** Uses simulated quantum key distribution for secure communication
2. **Authentication:** JWT tokens with short expiration times
3. **Rate Limiting:** Prevent quantum computing resource abuse
4. **Data Protection:** All quantum operations are isolated and secure

## Performance Considerations

- Quantum operations may have longer response times (100-3000ms)
- Complex quantum circuits may take additional time
- Rate limiting is in place to prevent resource exhaustion

## Error Handling

Common quantum errors:

- **QUANTUM_CIRCUIT_NOT_FOUND**: Circuit ID not valid
- **QUANTUM_OPERATION_FAILED**: Quantum processing failed
- **QUANTUM_RESOURCE_EXHAUSTED**: Too many quantum operations
- **QUANTUM_DECRYPTION_FAILED**: Decryption attempt failed

## Examples

### Example: Creating and Executing a Quantum Circuit

```javascript
// Create quantum circuit with 2 qubits
const createResponse = await fetch('/api/v1/quantum/circuits', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer <token>'
  },
  body: JSON.stringify({ qubits: 2 })
});

const circuit = await createResponse.json();

// Add Hadamard gate to first qubit
const addGateResponse = await fetch(`/api/v1/quantum/circuits/${circuit.id}/gates`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer <token>'
  },
  body: JSON.stringify({
    type: 'hadamard',
    targetQubits: [0],
    parameters: []
  })
});

// Execute circuit
const executeResponse = await fetch(`/api/v1/quantum/circuits/${circuit.id}/execute`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer <token>'
  },
  body: JSON.stringify({ shots: 1024 })
});

const result = await executeResponse.json();
console.log('Quantum circuit executed with result:', result);
```

### Example: Quantum Data Processing

```javascript
const response = await fetch('/api/v1/quantum/process', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer <token>'
  },
  body: JSON.stringify({
    data: {
      text: 'Quantum computing is revolutionizing technology',
      images: ['base64-image-data'],
      userData: {
        age: 30,
        interests: ['quantum', 'technology', 'science']
      }
    }
  })
});

const result = await response.json();
console.log('Quantum processing result:', result.quantumInsights);
```
