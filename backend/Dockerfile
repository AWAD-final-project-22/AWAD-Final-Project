# ============================================
# Stage 1: Build
# ============================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first (for better layer caching)
COPY package*.json ./

# Copy Prisma schema (needed for prisma generate)
COPY prisma ./prisma

# Install ALL dependencies (including devDependencies for build)
RUN npm ci --silent

# Copy source code
COPY . .

# Build the application
RUN npm run build --silent

# ============================================
# Stage 2: Production
# ============================================
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy package files
COPY package*.json ./

# Copy Prisma schema for migrations
COPY prisma ./prisma

# Install ONLY production dependencies (no devDependencies)
# This makes the image much smaller
RUN npm ci --omit=dev --silent

# Copy built application from builder
COPY --from=builder /app/dist ./dist

# Generate Prisma Client for production
RUN npx prisma generate

EXPOSE 3000

CMD ["node", "dist/src/main.js"]
