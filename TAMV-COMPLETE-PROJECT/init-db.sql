-- TAMV Core API - Inicialización de Base de Datos
-- Script para crear las tablas básicas del ecosistema

-- Crear extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Tabla de usuarios del ecosistema
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    ecosystem_level INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de sesiones
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de servicios del ecosistema
CREATE TABLE IF NOT EXISTS ecosystem_services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    port INTEGER,
    status VARCHAR(20) DEFAULT 'available',
    version VARCHAR(20) DEFAULT '1.0.0',
    endpoint_url TEXT,
    health_check_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de métricas del sistema
CREATE TABLE IF NOT EXISTS system_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    metric_name VARCHAR(100) NOT NULL,
    metric_value NUMERIC,
    metric_unit VARCHAR(20),
    service_name VARCHAR(100),
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de logs de auditoría
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100),
    resource_id UUID,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insertar servicios del ecosistema TAMV
INSERT INTO ecosystem_services (name, description, port, status, endpoint_url, health_check_url) VALUES
('Core API', 'API principal del ecosistema TAMV', 3000, 'active', 'http://localhost:3000', 'http://localhost:3000/health'),
('XR Renderer', 'Motor de renderizado XR/VR 4D', 8080, 'available', 'http://localhost:8080', 'http://localhost:8080/xr/health'),
('Quantum Processor', 'Procesador cuántico-clásico híbrido', 9000, 'available', 'http://localhost:9000', 'http://localhost:9000/quantum/health'),
('Isabella AI', 'Sistema de IA ética explicable', 7000, 'available', 'http://localhost:7000', 'http://localhost:7000/ai/health'),
('Blockchain Service', 'Servicio blockchain MSR antifraud', 6000, 'available', 'http://localhost:6000', 'http://localhost:6000/blockchain/health'),
('Security Service', 'Sistema de seguridad Tenochtitlan', 5000, 'available', 'http://localhost:5000', 'http://localhost:5000/security/health')
ON CONFLICT DO NOTHING;

-- Insertar métricas iniciales
INSERT INTO system_metrics (metric_name, metric_value, metric_unit, service_name) VALUES
('active_users', 6200000, 'count', 'ecosystem'),
('monthly_revenue', 42000000, 'usd', 'ecosystem'),
('active_countries', 25, 'count', 'ecosystem'),
('system_uptime', 99.97, 'percentage', 'ecosystem'),
('services_integrated', 35, 'count', 'ecosystem')
ON CONFLICT DO NOTHING;

-- Crear índices para optimización
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_system_metrics_recorded_at ON system_metrics(recorded_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ecosystem_services_updated_at BEFORE UPDATE ON ecosystem_services
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comentarios en las tablas
COMMENT ON TABLE users IS 'Usuarios del ecosistema TAMV DreamWorld';
COMMENT ON TABLE user_sessions IS 'Sesiones activas de usuarios';
COMMENT ON TABLE ecosystem_services IS 'Servicios disponibles en el ecosistema';
COMMENT ON TABLE system_metrics IS 'Métricas del sistema y servicios';
COMMENT ON TABLE audit_logs IS 'Logs de auditoría para seguridad';

-- Mensaje de confirmación
DO $$
BEGIN
    RAISE NOTICE 'Base de datos TAMV inicializada correctamente';
    RAISE NOTICE 'Servicios registrados: %', (SELECT COUNT(*) FROM ecosystem_services);
    RAISE NOTICE 'Métricas iniciales: %', (SELECT COUNT(*) FROM system_metrics);
END $$;