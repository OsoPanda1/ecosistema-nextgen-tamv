# 🚀 INSTRUCCIONES DE DESPLIEGUE RÁPIDO - TAMV

## OPCIÓN 1: Docker (Recomendado - 5 minutos)

### Paso 1: Instalar Docker
Si no tienes Docker instalado:
- Windows: https://docs.docker.com/desktop/install/windows-install/
- Mac: https://docs.docker.com/desktop/install/mac-install/
- Linux: https://docs.docker.com/engine/install/

### Paso 2: Levantar el sistema
```bash
# En la raíz del proyecto
docker-compose up -d

# Ver logs
docker-compose logs -f
```

### Paso 3: Verificar que funciona
```bash
# Health check
curl http://localhost:3000/health

# Debería responder:
# {"status":"healthy","timestamp":"2026-02-02T..."}
```

### Paso 4: Probar el API
```bash
# Registrar usuario
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@tamv.com","password":"test123","username":"testuser"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@tamv.com","password":"test123"}'

# Guardar el token que te devuelve
```

---

## OPCIÓN 2: Local (Sin Docker - 10 minutos)

### Paso 1: Instalar PostgreSQL
- Windows: https://www.postgresql.org/download/windows/
- Mac: `brew install postgresql`
- Linux: `sudo apt install postgresql`

### Paso 2: Crear base de datos
```bash
# Conectar a PostgreSQL
psql -U postgres

# Crear usuario y base de datos
CREATE USER tamv WITH PASSWORD 'tamv123';
CREATE DATABASE tamv OWNER tamv;
\q
```

### Paso 3: Cargar esquema
```bash
psql -U tamv -d tamv -f backend/schema.sql
```

### Paso 4: Instalar dependencias del backend
```bash
cd backend
npm install
```

### Paso 5: Configurar variables de entorno
```bash
# Copiar archivo de ejemplo
cp .env.example .env

# Editar .env si es necesario
# DATABASE_URL=postgresql://tamv:tamv123@localhost:5432/tamv
```

### Paso 6: Iniciar backend
```bash
npm start

# O en modo desarrollo con auto-reload:
npm run dev
```

### Paso 7: Verificar
```bash
curl http://localhost:3000/health
```

---

## OPCIÓN 3: Frontend (Lovable.ai)

### Paso 1: Ir a Lovable.ai
https://lovable.dev

### Paso 2: Crear nuevo proyecto
- Nombre: "TAMV DreamWorld"
- Template: React + Vite

### Paso 3: Copiar archivos
Copiar estos archivos de `TAMV-COMPLETE-PROJECT/demo/lovable-demo/`:
- `App.jsx`
- `components.jsx`
- `index.css`
- `tailwind.config.js`

### Paso 4: Configurar API
Agregar en el código:
```javascript
const API_URL = 'http://localhost:3000/api';
```

### Paso 5: Deploy
Click en "Deploy" en Lovable.ai

---

## PRUEBAS RÁPIDAS

### 1. Registrar usuario
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@tamv.com",
    "password": "demo123",
    "username": "demo"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@tamv.com",
    "password": "demo123"
  }'
```

Guarda el token que te devuelve.

### 3. Crear post
```bash
curl -X POST http://localhost:3000/api/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_TOKEN_AQUI" \
  -d '{
    "content": "Mi primer post en TAMV! 🚀"
  }'
```

### 4. Ver feed
```bash
curl http://localhost:3000/api/posts/feed
```

### 5. Like a un post
```bash
curl -X POST http://localhost:3000/api/posts/POST_ID_AQUI/like \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

---

## SOLUCIÓN DE PROBLEMAS

### Error: "Cannot connect to database"
```bash
# Verificar que PostgreSQL está corriendo
docker-compose ps

# O si es local:
sudo systemctl status postgresql
```

### Error: "Port 3000 already in use"
```bash
# Cambiar puerto en docker-compose.yml o .env
PORT=3001
```

### Error: "Module not found"
```bash
# Reinstalar dependencias
cd backend
rm -rf node_modules package-lock.json
npm install
```

---

## SIGUIENTE PASO

Una vez que el backend funciona:

1. ✅ Conectar el frontend de Lovable
2. ✅ Implementar más features (chat, marketplace, etc.)
3. ✅ Deploy a producción (AWS, Vercel, etc.)

---

## COMANDOS ÚTILES

```bash
# Ver logs del backend
docker-compose logs -f backend

# Ver logs de la base de datos
docker-compose logs -f postgres

# Reiniciar servicios
docker-compose restart

# Detener todo
docker-compose down

# Detener y borrar datos
docker-compose down -v

# Entrar a la base de datos
docker-compose exec postgres psql -U tamv -d tamv
```

---

## ESTADO ACTUAL

✅ Backend funcional con:
- Autenticación (register/login)
- Posts (crear, ver feed)
- Likes
- Base de datos PostgreSQL

❌ Falta implementar:
- Comentarios
- Seguir/Seguidores
- Chat en tiempo real
- Marketplace
- Streaming

**Tiempo total de setup**: 5-10 minutos
**Sistema funcional**: ✅ SÍ
**Listo para desarrollo**: ✅ SÍ
