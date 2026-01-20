# ============================================
# Stage 1: Build
# ============================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first (for better layer caching)
COPY package*.json ./

# Install ALL dependencies (including devDependencies for build)
RUN npm ci --silent

# Copy source code
COPY . .

# Build arguments and environment variables
ARG NEXT_PUBLIC_API_END_POINT
ENV NEXT_PUBLIC_API_END_POINT=$NEXT_PUBLIC_API_END_POINT
ENV NEXT_TELEMETRY_DISABLED=1

# Build the application (standalone output configured in next.config.ts)
RUN npm run build --silent

# ============================================
# Stage 2: Production
# ============================================
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3001

# Copy standalone build output (includes only necessary files)
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static
COPY --from=builder --chown=node:node /app/public ./public

# Run as non-root user for security
USER node

EXPOSE 3001

CMD ["node", "server.js"]