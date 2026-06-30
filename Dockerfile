# ══ STAGE 1: Build de React/Vite ════════════════════
FROM node:18-alpine AS builder

WORKDIR /app

# Copiar dependencias primero (aprovecha caché de Docker)
COPY package*.json ./
RUN npm install

# Copiar el resto del código
COPY . .

# Construir la aplicación para producción
RUN npm run build

# ══ STAGE 2: Servir con Nginx ═══════════════════════
FROM nginx:alpine

# Crear usuario no-root (requerido por la rúbrica)
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copiar los archivos construidos (Vite genera en /dist, no /build)
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar configuración de nginx personalizada
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Ajustar permisos para que nginx pueda leer los archivos
RUN chown -R appuser:appgroup /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]