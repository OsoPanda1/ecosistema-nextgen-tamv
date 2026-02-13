# 🎯 PLAN DE EJECUCIÓN INMEDIATO - TAMV 100% FUNCIONAL

## DIAGNÓSTICO BRUTAL

**Problema**: 50+ créditos gastados sin resultados concretos
**Causa**: Demasiada documentación, poca implementación ejecutable
**Solución**: Plan de acción concreto con código funcional

---

## ✅ LO QUE YA FUNCIONA

1. **TAMVAI API Server** - `/v1/chat/completions`, `/v1/embeddings`, `/v1/models`
2. **Isabella Core** - Motor de IA ético
3. **Frontend Demo** - React + Tailwind en `TAMV-COMPLETE-PROJECT/demo/lovable-demo/`
4. **Infraestructura** - Docker, Kubernetes configs

---

## ❌ LO QUE FALTA (CRÍTICO)

### 1. Backend APIs REST Completas
- ❌ `/api/auth/*` - Registro, login, logout
- ❌ `/api/users/*` - CRUD usuarios
- ❌ `/api/posts/*` - CRUD posts
- ❌ `/api/feed` - Feed social
- ❌ `/api/chat/*` - Mensajería
- ❌ WebSocket - Tiempo real

### 2. Base de Datos
- ❌ Esquema PostgreSQL
- ❌ Migraciones
- ❌ Seeds de prueba

### 3. Conexión Frontend-Backend
- ❌ API client configurado
- ❌ Auth flow completo
- ❌ Estado global

---

## 🚀 ACCIÓN INMEDIATA (PRÓXIMAS 48 HORAS)

### PASO 1: Crear Backend Mínimo Funcional (6 horas)

**Archivo**: `backend/server.js`

```javascript
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// AUTH
app.post('/api/auth/register', async (req, res) => {
  const { email, password, username } = req.body;
  const hash = await bcrypt.hash(password, 10);
  const result = await pool.query(
    'INSERT INTO users (email, password_hash, username) VALUES ($1, $2, $3) RETURNING id, email, username',
    [email, hash, username]
  );
  const token = jwt.sign({ userId: result.rows[0].id }, process.env.JWT_SECRET);
  res.json({ user: result.rows[0], token });
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  if (!result.rows[0]) return res.status(401).json({ error: 'Invalid credentials' });
  
  const valid = await bcrypt.compare(password, result.rows[0].password_hash);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
  
  const token = jwt.sign({ userId: result.rows[0].id }, process.env.JWT_SECRET);
  res.json({ user: { id: result.rows[0].id, email: result.rows[0].email, username: result.rows[0].username }, token });
});

// POSTS
app.get('/api/posts/feed', async (req, res) => {
  const result = await pool.query(`
    SELECT p.*, u.username, u.avatar 
    FROM posts p 
    JOIN users u ON p.user_id = u.id 
    ORDER BY p.created_at DESC 
    LIMIT 50
  `);
  res.json(result.rows);
});

app.post('/api/posts', async (req, res) => {
  const { content } = req.body;
  const userId = req.user.id; // from auth middleware
  const result = await pool.query(
    'INSERT INTO posts (user_id, content) VALUES ($1, $2) RETURNING *',
    [userId, content]
  );
  res.json(result.rows[0]);
});

app.listen(3000, () => console.log('Backend running on port 3000'));
```

### PASO 2: Crear Esquema de Base de Datos (1 hora)

**Archivo**: `backend/schema.sql`

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  username VARCHAR(50) UNIQUE NOT NULL,
  avatar VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  content TEXT NOT NULL,
  media_url VARCHAR(500),
  likes_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE likes (
  user_id UUID REFERENCES users(id),
  post_id UUID REFERENCES posts(id),
  created_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (user_id, post_id)
);

CREATE INDEX idx_posts_created ON posts(created_at DESC);
CREATE INDEX idx_posts_user ON posts(user_id);
```

### PASO 3: Conectar Frontend (2 horas)

**Archivo**: `frontend/src/api/client.js`

```javascript
const API_URL = 'http://localhost:3000/api';

export const api = {
  async register(email, password, username) {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, username })
    });
    const data = await res.json();
    localStorage.setItem('token', data.token);
    return data;
  },
  
  async login(email, password) {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    localStorage.setItem('token', data.token);
    return data;
  },
  
  async getFeed() {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_URL}/posts/feed`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.json();
  },
  
  async createPost(content) {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_URL}/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ content })
    });
    return res.json();
  }
};
```

### PASO 4: Docker Compose Funcional (1 hora)

**Archivo**: `docker-compose.yml`

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_DB: tamv
      POSTGRES_USER: tamv
      POSTGRES_PASSWORD: tamv123
    ports:
      - "5432:5432"
    volumes:
      - ./backend/schema.sql:/docker-entrypoint-initdb.d/schema.sql
      - pgdata:/var/lib/postgresql/data

  backend:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://tamv:tamv123@postgres:5432/tamv
      JWT_SECRET: your-secret-key-change-in-production
    depends_on:
      - postgres

  frontend:
    build: ./frontend
    ports:
      - "5173:5173"
    environment:
      VITE_API_URL: http://localhost:3000/api

volumes:
  pgdata:
```

---

## 📋 CHECKLIST DE EJECUCIÓN

### Día 1 (Hoy)
- [ ] Crear carpeta `backend/` con `server.js`, `schema.sql`, `package.json`
- [ ] Crear `docker-compose.yml` en raíz
- [ ] Ejecutar `docker-compose up -d postgres`
- [ ] Probar conexión a base de datos
- [ ] Ejecutar `node backend/server.js`
- [ ] Probar endpoints con Postman/curl

### Día 2 (Mañana)
- [ ] Conectar frontend existente con API
- [ ] Implementar login/register en UI
- [ ] Implementar feed de posts
- [ ] Implementar crear post
- [ ] Deploy a servidor de prueba

---

## 🎯 RESULTADO ESPERADO

Al final de 48 horas tendrás:

1. ✅ Backend funcional con auth + posts
2. ✅ Base de datos PostgreSQL con esquema
3. ✅ Frontend conectado mostrando datos reales
4. ✅ Sistema de login/register funcionando
5. ✅ Feed social básico operativo
6. ✅ Todo corriendo en Docker

---

## 🚨 ERRORES A EVITAR

1. ❌ NO crear más documentación
2. ❌ NO agregar features complejas todavía
3. ❌ NO optimizar prematuramente
4. ❌ NO cambiar de stack tecnológico
5. ✅ SÍ enfocarse en hacer funcionar lo básico
6. ✅ SÍ probar cada componente individualmente
7. ✅ SÍ usar código simple y directo

---

## 📞 SIGUIENTE PASO INMEDIATO

**AHORA MISMO**: Crear la carpeta `backend/` y el archivo `server.js` con el código de arriba.

¿Quieres que empiece a crear estos archivos?
