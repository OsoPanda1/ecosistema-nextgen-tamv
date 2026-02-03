# 🗄️ ESTRATEGIA DE MIGRACIONES DB - TAMV ENHANCED
## Base de Datos PostgreSQL + PLpgSQL

**Versión:** Enhanced v2.0  
**Fecha:** 2025-12-31  
**Estado:** Estrategia de Producción Aprobada

---

## 🎯 PRINCIPIOS FUNDAMENTALES

### 1. Seguridad Primero
- ❌ **NUNCA** cambios destructivos en una sola migración
- ✅ **SIEMPRE** scripts de rollback donde sea posible
- ✅ **VERSIONADO** semántico + timestamps
- ✅ **TESTING** en staging con datos idénticos a producción

### 2. Zero Downtime
- **Migraciones compatibles** hacia adelante y atrás
- **Dual-write strategy** para cambios de esquema
- **Gradual rollout** de cambios estructurales
- **Rollback inmediato** disponible

### 3. Observabilidad
- **Logging completo** de todas las migraciones
- **Métricas de performance** durante ejecución
- **Alertas automáticas** en caso de fallos
- **Auditoría completa** de cambios

---

## 🔄 FLUJO RECOMENDADO (5 PASOS)

### Ejemplo: Cambio de Columna `email_verified`

#### Paso 1: Crear Columnas Nuevas (Nullable)
```sql
-- Migration: 001_add_email_verification_v2.sql
-- Timestamp: 20251231_120000

BEGIN;

-- Crear nuevas columnas
ALTER TABLE users 
ADD COLUMN email_verified_v2 BOOLEAN DEFAULT NULL,
ADD COLUMN verification_token_v2 VARCHAR(255) DEFAULT NULL,
ADD COLUMN verified_at_v2 TIMESTAMP DEFAULT NULL;

-- Crear índices para performance
CREATE INDEX CONCURRENTLY idx_users_email_verified_v2 
ON users(email_verified_v2) 
WHERE email_verified_v2 IS NOT NULL;

-- Logging
INSERT INTO migration_log (version, description, executed_at, status)
VALUES ('001', 'Add email verification v2 columns', NOW(), 'SUCCESS');

COMMIT;
```

#### Paso 2: Deploy App con Dual-Write
```typescript
// user.service.ts - Escribir en ambos campos
async updateEmailVerification(userId: string, verified: boolean) {
  await this.db.query(`
    UPDATE users 
    SET 
      email_verified = $1,
      email_verified_v2 = $1,
      verification_token = $2,
      verification_token_v2 = $2,
      verified_at_v2 = CASE WHEN $1 THEN NOW() ELSE NULL END
    WHERE id = $3
  `, [verified, null, userId]);
}
```

#### Paso 3: Backfill Datos Gradualmente
```sql
-- Migration: 002_backfill_email_verification_v2.sql
-- Ejecutar en batches para evitar locks largos

DO $$
DECLARE
    batch_size INTEGER := 10000;
    processed INTEGER := 0;
    total_rows INTEGER;
BEGIN
    -- Contar total de filas a procesar
    SELECT COUNT(*) INTO total_rows 
    FROM users 
    WHERE email_verified_v2 IS NULL;
    
    RAISE NOTICE 'Starting backfill of % rows', total_rows;
    
    WHILE EXISTS (
        SELECT 1 FROM users 
        WHERE email_verified_v2 IS NULL 
        LIMIT 1
    ) LOOP
        -- Procesar batch
        UPDATE users 
        SET 
            email_verified_v2 = email_verified,
            verification_token_v2 = verification_token,
            verified_at_v2 = CASE 
                WHEN email_verified THEN created_at 
                ELSE NULL 
            END
        WHERE id IN (
            SELECT id FROM users 
            WHERE email_verified_v2 IS NULL 
            LIMIT batch_size
        );
        
        processed := processed + batch_size;
        
        RAISE NOTICE 'Processed % of % rows (%.1f%%)', 
            processed, total_rows, 
            (processed::float / total_rows * 100);
        
        -- Pausa para evitar saturar la DB
        PERFORM pg_sleep(0.1);
    END LOOP;
    
    RAISE NOTICE 'Backfill completed successfully';
END $$;

-- Verificar integridad
DO $$
DECLARE
    mismatch_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO mismatch_count
    FROM users 
    WHERE email_verified != email_verified_v2;
    
    IF mismatch_count > 0 THEN
        RAISE EXCEPTION 'Data integrity check failed: % mismatches found', mismatch_count;
    END IF;
    
    RAISE NOTICE 'Data integrity check passed';
END $$;
```

#### Paso 4: Deploy App con Lectura de Nuevos Campos
```typescript
// user.service.ts - Leer de nuevos campos
async getUserVerificationStatus(userId: string) {
  const result = await this.db.query(`
    SELECT 
      email_verified_v2 as email_verified,
      verification_token_v2 as verification_token,
      verified_at_v2 as verified_at
    FROM users 
    WHERE id = $1
  `, [userId]);
  
  return result.rows[0];
}
```

#### Paso 5: Eliminar Columnas Antiguas (Release Posterior)
```sql
-- Migration: 003_cleanup_email_verification_old.sql
-- Ejecutar solo después de confirmar que todo funciona

BEGIN;

-- Verificar que no hay referencias a columnas antiguas
DO $$
BEGIN
    -- Aquí podrían ir checks adicionales
    RAISE NOTICE 'Starting cleanup of old email verification columns';
END $$;

-- Eliminar índices antiguos
DROP INDEX IF EXISTS idx_users_email_verified;

-- Eliminar columnas antiguas
ALTER TABLE users 
DROP COLUMN IF EXISTS email_verified,
DROP COLUMN IF EXISTS verification_token;

-- Renombrar columnas nuevas
ALTER TABLE users 
RENAME COLUMN email_verified_v2 TO email_verified;
ALTER TABLE users 
RENAME COLUMN verification_token_v2 TO verification_token;
ALTER TABLE users 
RENAME COLUMN verified_at_v2 TO verified_at;

-- Recrear índices con nombres correctos
CREATE INDEX idx_users_email_verified 
ON users(email_verified) 
WHERE email_verified = true;

-- Logging
INSERT INTO migration_log (version, description, executed_at, status)
VALUES ('003', 'Cleanup old email verification columns', NOW(), 'SUCCESS');

COMMIT;
```

---

## 🛠️ HERRAMIENTAS DE MIGRACIÓN

### Node.js con node-pg-migrate
```json
{
  "scripts": {
    "migrate:create": "node-pg-migrate create",
    "migrate:up": "node-pg-migrate up",
    "migrate:down": "node-pg-migrate down",
    "migrate:test": "npm run migrate:up && npm run test:integration",
    "migrate:status": "node-pg-migrate status"
  },
  "dependencies": {
    "node-pg-migrate": "^6.2.2",
    "pg": "^8.8.0"
  }
}
```

### Configuración de Migración
```javascript
// migrations/config.js
module.exports = {
  databaseUrl: process.env.DATABASE_URL,
  migrationsTable: 'pgmigrations',
  dir: 'migrations',
  direction: 'up',
  count: Infinity,
  ignorePattern: '.*\\.map',
  schema: 'public',
  createSchema: false,
  createMigrationsSchema: false,
  checkOrder: true,
  verbose: true,
  log: console.log
};
```

### Template de Migración
```javascript
// migrations/YYYYMMDD_HHMMSS_description.js
exports.up = (pgm) => {
  // Log inicio
  pgm.sql(`
    INSERT INTO migration_log (version, description, started_at, status)
    VALUES ('${__filename}', 'Migration description', NOW(), 'RUNNING')
  `);
  
  // Cambios de esquema
  pgm.addColumn('users', {
    new_column: {
      type: 'varchar(255)',
      notNull: false,
      default: null
    }
  });
  
  // Log éxito
  pgm.sql(`
    UPDATE migration_log 
    SET status = 'SUCCESS', completed_at = NOW()
    WHERE version = '${__filename}'
  `);
};

exports.down = (pgm) => {
  // Rollback
  pgm.dropColumn('users', 'new_column');
  
  // Log rollback
  pgm.sql(`
    UPDATE migration_log 
    SET status = 'ROLLED_BACK', completed_at = NOW()
    WHERE version = '${__filename}'
  `);
};
```

---

## 🧪 TESTING DE MIGRACIONES

### Setup de Testing
```bash
#!/bin/bash
# test_migration.sh

set -euo pipefail

echo "🧪 Testing migration in staging environment..."

# 1. Crear snapshot de staging
kubectl exec -n tamv-staging deployment/postgres -- \
  pg_dump $DATABASE_URL > staging_backup_$(date +%Y%m%d_%H%M%S).sql

# 2. Ejecutar migración
npm run migrate:up

# 3. Ejecutar tests de integridad
npm run test:migration

# 4. Verificar performance
npm run test:performance

# 5. Test de rollback
npm run migrate:down
npm run migrate:up

echo "✅ Migration testing completed successfully"
```

### Tests de Integridad
```javascript
// tests/migration.test.js
const { Pool } = require('pg');

describe('Migration Tests', () => {
  let db;
  
  beforeAll(async () => {
    db = new Pool({ connectionString: process.env.DATABASE_URL });
  });
  
  afterAll(async () => {
    await db.end();
  });
  
  test('should maintain data integrity', async () => {
    const result = await db.query(`
      SELECT COUNT(*) as count 
      FROM users 
      WHERE email_verified_v2 IS NULL 
      AND email_verified IS NOT NULL
    `);
    
    expect(result.rows[0].count).toBe('0');
  });
  
  test('should have correct indexes', async () => {
    const result = await db.query(`
      SELECT indexname 
      FROM pg_indexes 
      WHERE tablename = 'users' 
      AND indexname = 'idx_users_email_verified_v2'
    `);
    
    expect(result.rows).toHaveLength(1);
  });
  
  test('should maintain performance', async () => {
    const start = Date.now();
    
    await db.query(`
      SELECT * FROM users 
      WHERE email_verified_v2 = true 
      LIMIT 1000
    `);
    
    const duration = Date.now() - start;
    expect(duration).toBeLessThan(100); // < 100ms
  });
});
```

---

## 🚀 CI/CD INTEGRATION

### GitHub Actions Job
```yaml
- name: Run Database Migrations
  run: |
    # Setup port-forward to staging database
    kubectl port-forward svc/postgres 5432:5432 -n tamv-staging &
    PF_PID=$!
    sleep 5
    
    # Run migrations
    npm run migrate:up
    
    # Run migration tests
    npm run test:migration
    
    # Cleanup
    kill $PF_PID
  env:
    DATABASE_URL: postgresql://tamv_user:${{ secrets.DB_PASSWORD }}@localhost:5432/tamv_staging
```

### Kubernetes Job para Producción
```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: db-migration-{{ .Values.migration.version }}
  namespace: tamv-prod
spec:
  template:
    spec:
      restartPolicy: Never
      containers:
      - name: migration
        image: ghcr.io/tamv-org/db-migrator:latest
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: database-credentials
              key: url
        - name: MIGRATION_VERSION
          value: "{{ .Values.migration.version }}"
        command:
        - /bin/bash
        - -c
        - |
          echo "Starting migration ${MIGRATION_VERSION}..."
          npm run migrate:up
          echo "Migration completed successfully"
      backoffLimit: 3
```

---

## 📊 MONITOREO Y ALERTAS

### Métricas de Migración
```sql
-- Tabla de logging de migraciones
CREATE TABLE IF NOT EXISTS migration_log (
    id SERIAL PRIMARY KEY,
    version VARCHAR(255) NOT NULL,
    description TEXT,
    started_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP,
    status VARCHAR(50) DEFAULT 'RUNNING',
    duration_ms INTEGER,
    rows_affected INTEGER,
    error_message TEXT,
    rollback_available BOOLEAN DEFAULT false
);

-- Función para logging automático
CREATE OR REPLACE FUNCTION log_migration_start(
    p_version VARCHAR(255),
    p_description TEXT
) RETURNS INTEGER AS $$
DECLARE
    log_id INTEGER;
BEGIN
    INSERT INTO migration_log (version, description, started_at, status)
    VALUES (p_version, p_description, NOW(), 'RUNNING')
    RETURNING id INTO log_id;
    
    RETURN log_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION log_migration_complete(
    p_log_id INTEGER,
    p_rows_affected INTEGER DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
    UPDATE migration_log 
    SET 
        completed_at = NOW(),
        status = 'SUCCESS',
        duration_ms = EXTRACT(EPOCH FROM (NOW() - started_at)) * 1000,
        rows_affected = p_rows_affected
    WHERE id = p_log_id;
END;
$$ LANGUAGE plpgsql;
```

### Alertas Prometheus
```yaml
# prometheus-rules.yaml
groups:
- name: database-migrations
  rules:
  - alert: MigrationRunning
    expr: |
      (
        time() - on() 
        postgres_migration_start_time{status="RUNNING"}
      ) > 1800  # 30 minutes
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "Database migration running for too long"
      description: "Migration {{ $labels.version }} has been running for more than 30 minutes"
      
  - alert: MigrationFailed
    expr: postgres_migration_status{status="FAILED"} == 1
    for: 0m
    labels:
      severity: critical
    annotations:
      summary: "Database migration failed"
      description: "Migration {{ $labels.version }} has failed: {{ $labels.error }}"
```

---

## 🔄 ROLLBACK STRATEGIES

### Rollback Automático
```sql
-- Función de rollback con validación
CREATE OR REPLACE FUNCTION safe_rollback_migration(
    p_version VARCHAR(255)
) RETURNS BOOLEAN AS $$
DECLARE
    migration_record RECORD;
    rollback_sql TEXT;
BEGIN
    -- Verificar que la migración existe y tiene rollback
    SELECT * INTO migration_record
    FROM migration_log 
    WHERE version = p_version 
    AND status = 'SUCCESS'
    AND rollback_available = true;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Migration % not found or rollback not available', p_version;
    END IF;
    
    -- Ejecutar rollback
    BEGIN
        -- Aquí iría la lógica específica de rollback
        RAISE NOTICE 'Rolling back migration %', p_version;
        
        -- Marcar como rolled back
        UPDATE migration_log 
        SET status = 'ROLLED_BACK', completed_at = NOW()
        WHERE version = p_version;
        
        RETURN true;
        
    EXCEPTION WHEN OTHERS THEN
        -- Log error
        UPDATE migration_log 
        SET status = 'ROLLBACK_FAILED', error_message = SQLERRM
        WHERE version = p_version;
        
        RETURN false;
    END;
END;
$$ LANGUAGE plpgsql;
```

### Script de Rollback de Emergencia
```bash
#!/bin/bash
# emergency_rollback.sh

set -euo pipefail

MIGRATION_VERSION=${1:-}
NAMESPACE=${2:-tamv-prod}

if [ -z "$MIGRATION_VERSION" ]; then
    echo "Usage: $0 <migration_version> [namespace]"
    exit 1
fi

echo "🚨 EMERGENCY ROLLBACK: $MIGRATION_VERSION"
echo "Namespace: $NAMESPACE"
echo ""

# Confirmar rollback
read -p "Are you sure you want to rollback migration $MIGRATION_VERSION? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
    echo "Rollback cancelled"
    exit 0
fi

# Ejecutar rollback
kubectl exec -n "$NAMESPACE" deployment/tamv-core -- \
    node -e "
        const { Pool } = require('pg');
        const db = new Pool({ connectionString: process.env.DATABASE_URL });
        
        (async () => {
            try {
                const result = await db.query(
                    'SELECT safe_rollback_migration(\$1)',
                    ['$MIGRATION_VERSION']
                );
                
                if (result.rows[0].safe_rollback_migration) {
                    console.log('✅ Rollback completed successfully');
                } else {
                    console.log('❌ Rollback failed');
                    process.exit(1);
                }
            } catch (error) {
                console.error('❌ Rollback error:', error.message);
                process.exit(1);
            } finally {
                await db.end();
            }
        })();
    "

echo "🔄 Rollback completed. Verify application functionality."
```

---

## 📋 CHECKLIST DE MIGRACIÓN

### Pre-Migration
- [ ] Migración testeada en staging con datos de producción
- [ ] Script de rollback preparado y testeado
- [ ] Backup de base de datos creado
- [ ] Ventana de mantenimiento programada (si necesaria)
- [ ] Equipo de guardia notificado
- [ ] Monitoreo adicional configurado

### Durante Migration
- [ ] Migración ejecutada en staging primero
- [ ] Tests de integridad pasados
- [ ] Performance verificada
- [ ] Logs monitoreados en tiempo real
- [ ] Métricas de aplicación estables

### Post-Migration
- [ ] Tests de smoke ejecutados
- [ ] Performance de aplicación verificada
- [ ] Logs revisados por errores
- [ ] Rollback testeado (en staging)
- [ ] Documentación actualizada
- [ ] Post-mortem programado (si hubo issues)

---

## 🎯 MEJORES PRÁCTICAS

### DO ✅
- **Usar transacciones** para operaciones atómicas
- **Crear índices CONCURRENTLY** para evitar locks
- **Procesar en batches** para tablas grandes
- **Validar datos** antes y después de migración
- **Mantener logs detallados** de todas las operaciones
- **Testear rollbacks** antes de ejecutar en producción

### DON'T ❌
- **Nunca** ejecutar migraciones destructivas sin backup
- **Nunca** cambiar tipos de datos directamente
- **Nunca** eliminar columnas en la misma migración que las crea
- **Nunca** ejecutar migraciones sin testear en staging
- **Nunca** ignorar warnings de performance
- **Nunca** ejecutar migraciones durante horas pico

---

**© 2025 TAMV Holdings - Territorio Autónomo de Memoria Viva**  
**Database Strategy Version:** Enhanced v2.0  
**Last Updated:** 2025-12-31