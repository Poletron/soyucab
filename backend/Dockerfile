# ============================================
# Dockerfile - Backend SoyUCAB
# Node.js 18 Alpine (Optimizado para producción)
# ============================================

FROM node:18-alpine

# Directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias primero (mejor cache)
COPY package*.json ./

# Instalar dependencias de producción
RUN npm install --omit=dev

# Copiar código fuente
COPY src ./src

# Exponer puerto
EXPOSE 3000

# Usuario no-root para seguridad
USER node

# Comando de inicio
CMD ["node", "src/server.js"]