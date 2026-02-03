# TAMV Core API - Dockerfile optimizado para ECS Express Mode
FROM node:18-alpine

# Metadatos
LABEL maintainer="TAMV Holdings <dev@tamv.org>"
LABEL description="TAMV Core API - Ecosistema Civilizacional Digital"
LABEL version="1.0.0"

# Crear usuario no-root para seguridad
RUN addgroup -g 1001 -S nodejs
RUN adduser -S tamv -u 1001

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias de producción
RUN npm ci --only=production && npm cache clean --force

# Copiar código fuente
COPY --chown=tamv:nodejs src/ ./src/
COPY --chown=tamv:nodejs public/ ./public/

# Cambiar a usuario no-root
USER tamv

# Exponer puerto
EXPOSE 3000

# Health check para ECS
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Variables de entorno por defecto
ENV NODE_ENV=production
ENV PORT=3000

# Comando de inicio
CMD ["npm", "start"]