/**
 * TAMV Core API Server
 * Ecosistema Civilizacional Digital
 * Optimizado para AWS ECS Express Mode
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware de seguridad
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['*'],
  credentials: true
}));

// Middleware de compresión
app.use(compression());

// Logging
app.use(morgan('combined'));

// Parsing de JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health Check Endpoint (requerido para ECS)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'tamv-core-api',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime()
  });
});

// Readiness Check (para Kubernetes/ECS)
app.get('/ready', (req, res) => {
  // Aquí puedes agregar verificaciones de dependencias (DB, Redis, etc.)
  res.status(200).json({
    status: 'ready',
    timestamp: new Date().toISOString(),
    checks: {
      database: 'connected', // Placeholder
      redis: 'connected',     // Placeholder
      memory: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`
    }
  });
});

// API Routes
app.get('/api/v1/status', (req, res) => {
  res.json({
    message: 'TAMV Core API está funcionando correctamente',
    ecosystem: 'TAMV DreamWorld v2.0',
    description: 'Primer Ecosistema Civilizacional Digital del Mundo',
    services: {
      'core-api': 'active',
      'xr-renderer': 'available',
      'quantum-processor': 'available',
      'isabella-ai': 'available',
      'blockchain-service': 'available',
      'security-service': 'available'
    },
    metrics: {
      users: '6.2M',
      revenue: '$42M/month',
      countries: 25,
      uptime: '99.97%'
    }
  });
});

// Endpoint principal de la API
app.get('/api/v1/ecosystem', (req, res) => {
  res.json({
    name: 'TAMV DreamWorld v2.0',
    tagline: 'La evolución de todo lo conocido en la red',
    description: 'El primer ecosistema civilizacional federado antifrágil a nivel mundial',
    features: [
      'XR 4D Rendering Engine',
      'Quantum-Classical Hybrid Processing',
      'Isabella AI - Ethical Explainable AI',
      'MSR Blockchain Anti-Fraud',
      'Tenochtitlan Security System',
      'Universal Knowledge Encyclopedia'
    ],
    statistics: {
      activeUsers: 6200000,
      monthlyRevenue: 42000000,
      activeCountries: 25,
      systemUptime: 99.97,
      servicesIntegrated: 35
    },
    endpoints: {
      health: '/health',
      ready: '/ready',
      status: '/api/v1/status',
      ecosystem: '/api/v1/ecosystem',
      services: '/api/v1/services'
    }
  });
});

// Servicios disponibles
app.get('/api/v1/services', (req, res) => {
  res.json({
    services: [
      {
        name: 'Core API',
        port: 3000,
        status: 'active',
        description: 'API principal del ecosistema'
      },
      {
        name: 'XR Renderer',
        port: 8080,
        status: 'available',
        description: 'Motor de renderizado XR/VR 4D'
      },
      {
        name: 'Quantum Processor',
        port: 9000,
        status: 'available',
        description: 'Procesador cuántico-clásico híbrido'
      },
      {
        name: 'Isabella AI',
        port: 7000,
        status: 'available',
        description: 'Sistema de IA ética explicable'
      },
      {
        name: 'Blockchain Service',
        port: 6000,
        status: 'available',
        description: 'Servicio blockchain MSR antifraud'
      },
      {
        name: 'Security Service',
        port: 5000,
        status: 'available',
        description: 'Sistema de seguridad Tenochtitlan'
      }
    ]
  });
});

// Ruta raíz
app.get('/', (req, res) => {
  res.json({
    message: '🌟 Bienvenido a TAMV DreamWorld v2.0',
    description: 'El Primer Ecosistema Civilizacional Digital del Mundo',
    version: '1.0.0',
    documentation: '/api/v1/ecosystem',
    health: '/health'
  });
});

// Manejo de errores 404
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint no encontrado',
    message: 'Visita /api/v1/ecosystem para ver los endpoints disponibles'
  });
});

// Manejo global de errores
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Algo salió mal'
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM recibido, cerrando servidor...');
  server.close(() => {
    console.log('Servidor cerrado correctamente');
    process.exit(0);
  });
});

// Iniciar servidor
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`
🚀 TAMV Core API iniciado correctamente
🌐 Puerto: ${PORT}
🏗️  Entorno: ${process.env.NODE_ENV || 'development'}
📊 Health Check: http://localhost:${PORT}/health
📖 API Info: http://localhost:${PORT}/api/v1/ecosystem
  `);
});

module.exports = app;