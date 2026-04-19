# 🗓️ ROADMAP 7 DÍAS - TAMV MVP FUNCIONAL

## DÍA 1 (HOY) - Backend Funcional ✅ COMPLETADO

### Logros
- ✅ Backend con Express.js
- ✅ Base de datos PostgreSQL
- ✅ Auth con JWT
- ✅ APIs REST (auth, users, posts, likes)
- ✅ Docker Compose
- ✅ Documentación

### Tiempo: 30 minutos
### Estado: ✅ LISTO PARA USAR

---

## DÍA 2 (MAÑANA) - Conectar Frontend

### Tareas
1. ⏳ Crear cliente API en frontend
2. ⏳ Implementar login/register UI
3. ⏳ Conectar feed con backend real
4. ⏳ Implementar crear post desde UI
5. ⏳ Probar flujo completo end-to-end

### Archivos a crear
- `frontend/src/api/client.js`
- `frontend/src/hooks/useAuth.js`
- `frontend/src/hooks/usePosts.js`
- `frontend/src/components/LoginForm.jsx`
- `frontend/src/components/PostForm.jsx`

### Tiempo estimado: 4 horas
### Resultado: Sistema funcional con UI

---

## DÍA 3 - Features Sociales Básicas

### Tareas
1. ⏳ Implementar comentarios (backend + frontend)
2. ⏳ Implementar seguir/seguidores
3. ⏳ Agregar perfiles de usuario
4. ⏳ Implementar búsqueda de usuarios

### APIs a crear
- `POST /api/posts/:id/comments`
- `GET /api/posts/:id/comments`
- `POST /api/users/:id/follow`
- `DELETE /api/users/:id/follow`
- `GET /api/users/:id/followers`
- `GET /api/users/:id/following`
- `GET /api/users/search?q=`

### Tiempo estimado: 6 horas
### Resultado: Red social básica funcional

---

## DÍA 4 - Tiempo Real con WebSocket

### Tareas
1. ⏳ Instalar Socket.io
2. ⏳ Implementar WebSocket server
3. ⏳ Conectar frontend con WebSocket
4. ⏳ Notificaciones en tiempo real
5. ⏳ Presencia online (quién está conectado)

### Archivos a crear
- `backend/websocket.js`
- `frontend/src/hooks/useWebSocket.js`
- `frontend/src/components/Notifications.jsx`

### Código base
```javascript
// backend/websocket.js
const socketIO = require('socket.io');

function initWebSocket(server) {
  const io = socketIO(server, {
    cors: { origin: '*' }
  });
  
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    
    socket.on('join', (userId) => {
      socket.join(`user:${userId}`);
    });
    
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });
  
  return io;
}
```

### Tiempo estimado: 5 horas
### Resultado: Notificaciones en tiempo real

---

## DÍA 5 - Chat Privado

### Tareas
1. ⏳ Crear tabla de mensajes
2. ⏳ Implementar API de chat
3. ⏳ Crear UI de chat
4. ⏳ Integrar con WebSocket
5. ⏳ Agregar indicador de "escribiendo..."

### Esquema de base de datos
```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_user_id UUID REFERENCES users(id),
  to_user_id UUID REFERENCES users(id),
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_messages_users ON messages(from_user_id, to_user_id);
```

### APIs a crear
- `GET /api/messages/:userId` - Conversación con usuario
- `POST /api/messages` - Enviar mensaje
- `PUT /api/messages/:id/read` - Marcar como leído

### Tiempo estimado: 6 horas
### Resultado: Chat privado funcional

---

## DÍA 6 - Multimedia y Optimización

### Tareas
1. ⏳ Implementar upload de imágenes
2. ⏳ Integrar con AWS S3 o Cloudinary
3. ⏳ Optimizar queries de base de datos
4. ⏳ Agregar paginación a feed
5. ⏳ Implementar cache con Redis

### Archivos a crear
- `backend/middleware/upload.js`
- `backend/services/storage.js`
- `backend/middleware/cache.js`

### Código base
```javascript
// backend/middleware/upload.js
const multer = require('multer');
const { S3Client } = require('@aws-sdk/client-s3');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

async function uploadToS3(file) {
  // Upload logic
}
```

### Tiempo estimado: 5 horas
### Resultado: Sistema con multimedia

---

## DÍA 7 - Testing y Deploy

### Tareas
1. ⏳ Escribir tests básicos
2. ⏳ Configurar CI/CD
3. ⏳ Deploy a servidor de prueba
4. ⏳ Configurar dominio
5. ⏳ Configurar SSL

### Tests a crear
```javascript
// backend/tests/auth.test.js
describe('Auth API', () => {
  test('Register new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@test.com',
        password: 'test123',
        username: 'testuser'
      });
    
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });
});
```

### Deploy options
- **Opción 1**: AWS ECS (recomendado)
- **Opción 2**: Vercel (frontend) + Railway (backend)
- **Opción 3**: DigitalOcean App Platform

### Tiempo estimado: 6 horas
### Resultado: Sistema en producción

---

## RESUMEN SEMANAL

### Día 1: Backend ✅
- Backend funcional
- Base de datos
- Auth JWT

### Día 2: Frontend ⏳
- Conectar UI con API
- Login/Register
- Feed funcional

### Día 3: Social ⏳
- Comentarios
- Seguir/Seguidores
- Perfiles

### Día 4: Real-time ⏳
- WebSocket
- Notificaciones
- Presencia online

### Día 5: Chat ⏳
- Mensajería privada
- Indicadores de estado

### Día 6: Multimedia ⏳
- Upload de imágenes
- Optimización
- Cache

### Día 7: Deploy ⏳
- Tests
- CI/CD
- Producción

---

## MÉTRICAS DE ÉXITO

### Al final de la semana tendrás:

1. ✅ Backend completo con 20+ endpoints
2. ✅ Frontend conectado y funcional
3. ✅ Auth completo (login/register/logout)
4. ✅ Feed de posts con likes y comentarios
5. ✅ Seguir/Seguidores
6. ✅ Notificaciones en tiempo real
7. ✅ Chat privado
8. ✅ Upload de imágenes
9. ✅ Sistema en producción
10. ✅ Tests básicos

### Usuarios pueden:
- ✅ Registrarse y hacer login
- ✅ Crear posts con imágenes
- ✅ Ver feed de posts
- ✅ Dar like y comentar
- ✅ Seguir a otros usuarios
- ✅ Recibir notificaciones
- ✅ Chatear en privado
- ✅ Ver perfiles de usuarios

---

## STACK FINAL

### Backend
- Node.js + Express.js
- PostgreSQL
- Redis (cache)
- Socket.io (WebSocket)
- JWT (auth)
- AWS S3 (storage)

### Frontend
- React 18
- Tailwind CSS
- Socket.io client
- React Query (data fetching)
- Zustand (state management)

### Infraestructura
- Docker + Docker Compose
- AWS ECS (backend)
- Vercel (frontend)
- AWS RDS (database)
- AWS ElastiCache (Redis)
- AWS S3 (storage)
- CloudFront (CDN)

---

## TIEMPO TOTAL

- **Desarrollo**: 32 horas (4 horas/día)
- **Testing**: 6 horas
- **Deploy**: 6 horas
- **Total**: 44 horas (~1 semana)

---

## COSTO ESTIMADO (Infraestructura)

### Desarrollo
- Local: $0
- Docker: $0

### Producción (mensual)
- AWS ECS: $20-50
- AWS RDS: $15-30
- AWS S3: $5-10
- Vercel: $0 (hobby)
- Dominio: $12/año
- **Total**: $40-90/mes

---

## SIGUIENTE PASO INMEDIATO

**AHORA**: Levantar el backend
```bash
docker-compose up -d
curl http://localhost:3000/health
```

**MAÑANA**: Conectar frontend
```bash
cd frontend
npm install
npm run dev
```

---

## 🎯 OBJETIVO FINAL

**Al final de 7 días**: TAMV MVP funcional con usuarios reales probando el sistema.

**Usuarios objetivo**: 100 usuarios beta
**Posts objetivo**: 1,000 posts
**Engagement**: 50% daily active users

---

¿Listo para empezar? 🚀
