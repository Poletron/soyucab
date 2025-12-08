FROM node:18-alpine

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar código fuente
COPY . .

# Exponer puerto de desarrollo
EXPOSE 5173

# Comando de desarrollo con host 0.0.0.0 para acceso desde Docker
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
