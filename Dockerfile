# Multi-Stage Production Dockerfile for HealthPulse Frontend

# Stage 1: Build Angular Application
FROM node:22-alpine AS build
WORKDIR /app

# Copy package descriptors
COPY package*.json ./

# Install dependencies cleanly
RUN npm ci --prefer-offline --no-audit

# Copy application source code
COPY . .

# Build production bundle with AOT & optimization
RUN npm run build -- --configuration production

# Stage 2: Serve via High-Performance Nginx
FROM nginx:alpine-slim

# Copy custom Nginx configuration with SPA fallback & security headers
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy compiled Angular distribution artifacts to Nginx html directory
COPY --from=build /app/dist/healthcare-platform-frontend/browser /usr/share/nginx/html

# Expose standard HTTP port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

# Launch Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
