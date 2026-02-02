-- TAMV IMMORTAL CORE v1.1
-- Post-Deployment Autonomous Bootstrap Script
-- Project: TAM.v

BEGIN;

-- =====================================================
-- CAPA 1 – REGISTRO FORENSE
-- =====================================================

CREATE TABLE IF NOT EXISTS tamv_audit_log (
    id SERIAL PRIMARY KEY,
    project_id TEXT,
    ritual_name TEXT,
    status TEXT,
    executed_at TIMESTAMP,
    details TEXT
);

INSERT INTO tamv_audit_log (project_id, ritual_name, status, executed_at, details)
VALUES (
    'ba83bda3-ee5e-45d4-a557-c9bf0f516e82',
    'TAMV_IMMORTAL_CORE_POSTDEPLOY',
    'auto_executed',
    NOW(),
    'Bootstrap autónomo post-despliegue ejecutado.'
);

-- =====================================================
-- CAPA 2 – BLINDAJE DE ENTORNO
-- =====================================================

CREATE TABLE IF NOT EXISTS backend_settings (
    project_id TEXT PRIMARY KEY,
    enforce_env_gitignore BOOLEAN DEFAULT FALSE,
    redact_env_in_logs BOOLEAN DEFAULT FALSE,
    secrets_rotation_enabled BOOLEAN DEFAULT FALSE,
    secrets_min_rotation_days INTEGER DEFAULT 0,
    enforce_security_middleware BOOLEAN DEFAULT FALSE,
    validate_server_imports BOOLEAN DEFAULT FALSE,
    zero_trust_enabled BOOLEAN DEFAULT FALSE,
    rls_enforced BOOLEAN DEFAULT FALSE,
    auth_leaked_password_protection BOOLEAN DEFAULT FALSE,
    auth_mfa_required_for_admins BOOLEAN DEFAULT FALSE,
    auth_min_password_length INTEGER DEFAULT 0,
    auth_password_pwned_check BOOLEAN DEFAULT FALSE,
    global_protection_layer TEXT,
    ai_security_supervisor TEXT
);

INSERT INTO backend_settings(project_id)
VALUES ('ba83bda3-ee5e-45d4-a557-c9bf0f516e82')
ON CONFLICT DO NOTHING;

UPDATE backend_settings
SET 
    enforce_env_gitignore      = TRUE,
    redact_env_in_logs         = TRUE,
    secrets_rotation_enabled   = TRUE,
    secrets_min_rotation_days  = 30
WHERE project_id = 'ba83bda3-ee5e-45d4-a557-c9bf0f516e82';

-- =====================================================
-- CAPA 3 – SEGURIDAD ESTRUCTURAL
-- =====================================================

UPDATE backend_settings
SET 
    enforce_security_middleware = TRUE,
    validate_server_imports     = TRUE,
    zero_trust_enabled          = TRUE,
    rls_enforced                = TRUE
WHERE project_id = 'ba83bda3-ee5e-45d4-a557-c9bf0f516e82';

-- =====================================================
-- CAPA 4 – AUTENTICACIÓN FUERTE
-- =====================================================

UPDATE backend_settings
SET 
    auth_leaked_password_protection = TRUE,
    auth_mfa_required_for_admins    = TRUE,
    auth_min_password_length        = 14,
    auth_password_pwned_check       = TRUE
WHERE project_id = 'ba83bda3-ee5e-45d4-a557-c9bf0f516e82';

-- =====================================================
-- CAPA 5 – AUDITORÍA XR / 3D
-- =====================================================

CREATE TABLE IF NOT EXISTS system_analysis (
    project_id TEXT,
    module TEXT,
    analysis_type TEXT,
    enforce_quality BOOLEAN,
    min_quality_score NUMERIC,
    updated_at TIMESTAMP,
    PRIMARY KEY(project_id, module, analysis_type)
);

INSERT INTO system_analysis (project_id, module, analysis_type, enforce_quality, min_quality_score)
VALUES (
    'ba83bda3-ee5e-45d4-a557-c9bf0f516e82',
    'dreamspaces_3d_xr',
    'hyperrealism_check',
    TRUE,
    0.90
)
ON CONFLICT (project_id, module, analysis_type) DO UPDATE
SET 
    enforce_quality   = TRUE,
    min_quality_score = EXCLUDED.min_quality_score,
    updated_at        = NOW();

-- =====================================================
-- CAPA 6 – ORQUESTACIÓN COGNITIVA
-- =====================================================

CREATE TABLE IF NOT EXISTS ai_agents (
    agent_name TEXT PRIMARY KEY,
    role TEXT,
    status TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS system_services (
    service_name TEXT PRIMARY KEY,
    category TEXT,
    status TEXT
);

CREATE TABLE IF NOT EXISTS agent_service_links (
    agent_name TEXT,
    service_name TEXT,
    access_level TEXT,
    linked_at TIMESTAMP,
    PRIMARY KEY(agent_name, service_name)
);

CREATE TABLE IF NOT EXISTS agent_permissions (
    agent_name TEXT,
    permission TEXT,
    PRIMARY KEY(agent_name, permission)
);

CREATE TABLE IF NOT EXISTS agent_commands (
    id SERIAL PRIMARY KEY,
    agent_name TEXT,
    command_type TEXT,
    command_payload JSONB,
    status TEXT,
    created_at TIMESTAMP
);

INSERT INTO ai_agents (agent_name, role, status, created_at)
VALUES ('Isabela', 'primary_orchestrator', 'active', NOW())
ON CONFLICT (agent_name) DO UPDATE
SET 
    role = EXCLUDED.role,
    status = 'active',
    updated_at = NOW();

INSERT INTO system_services (service_name, category, status)
VALUES
    ('Anubis Sentinel', 'security', 'active'),
    ('Horus Sentinel', 'monitoring', 'active'),
    ('Kateot', 'orchestration', 'active'),
    ('Aztec God', 'strategy', 'active'),
    ('Tenochtitlan', 'protection_core', 'active'),
    ('Atlas DigyTAMV', 'knowledge_core', 'active')
ON CONFLICT (service_name) DO UPDATE SET status='active';

INSERT INTO agent_service_links (agent_name, service_name, access_level, linked_at)
SELECT 'Isabela', service_name, 'full_control', NOW()
FROM system_services
ON CONFLICT DO NOTHING;

INSERT INTO agent_permissions (agent_name, permission)
VALUES
    ('Isabela','chat.read'),
    ('Isabela','chat.write'),
    ('Isabela','media.upload.image'),
    ('Isabela','media.upload.video'),
    ('Isabela','xr.upload'),
    ('Isabela','xr.validate'),
    ('Isabela','docs.3d.read'),
    ('Isabela','docs.3d.write'),
    ('Isabela','guild.create'),
    ('Isabela','guild.manage'),
    ('Isabela','guild.moderate'),
    ('Isabela','blockchain.anchor'),
    ('Isabela','system.publish'),
    ('Isabela','social.integrations.manage')
ON CONFLICT DO NOTHING;

UPDATE backend_settings
SET 
    global_protection_layer = 'tenochtitlan',
    ai_security_supervisor  = 'Isabela'
WHERE project_id = 'ba83bda3-ee5e-45d4-a557-c9bf0f516e82';

-- =====================================================
-- CAPA 7 – EXPANSIÓN PÚBLICA
-- =====================================================

CREATE TABLE IF NOT EXISTS social_integrations (
    platform TEXT PRIMARY KEY,
    status TEXT
);

CREATE TABLE IF NOT EXISTS social_accounts (
    platform TEXT,
    account_type TEXT,
    account_name TEXT,
    status TEXT
);

CREATE TABLE IF NOT EXISTS publication_jobs (
    id SERIAL PRIMARY KEY,
    job_name TEXT,
    agent_name TEXT,
    trigger_type TEXT,
    status TEXT,
    created_at TIMESTAMP
);

INSERT INTO social_integrations VALUES
    ('X','pending_setup'),
    ('Instagram','pending_setup'),
    ('LinkedIn','pending_setup'),
    ('TikTok','pending_setup'),
    ('YouTube','pending_setup')
ON CONFLICT DO NOTHING;

INSERT INTO agent_commands (agent_name, command_type, command_payload, status, created_at)
VALUES (
    'Isabela',
    'INIT_PUBLICATION_PROTOCOL',
    jsonb_build_object(
        'project','TAM',
        'objective','create_social_presence',
        'platforms',ARRAY['X','Instagram','LinkedIn','TikTok','YouTube'],
        'content_mode','introductory',
        'tone','professional_innovative',
        'cta','invite_users_to_platform'
    ),
    'pending',
    NOW()
);

INSERT INTO publication_jobs (job_name, agent_name, trigger_type, status, created_at)
VALUES ('TAM_PUBLIC_LAUNCH','Isabela','post_deploy_delayed','scheduled',NOW());

-- =====================================================
-- BLOCKCHAIN REGISTRY
-- =====================================================

CREATE TABLE IF NOT EXISTS blockchain_registry (
    chain_name TEXT PRIMARY KEY,
    status TEXT
);

INSERT INTO blockchain_registry VALUES
    ('ethereum','active'),
    ('polygon','active'),
    ('solana','active')
ON CONFLICT DO NOTHING;

COMMIT;