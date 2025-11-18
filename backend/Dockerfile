FROM node:18-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci --silent

COPY . .
RUN npm run build --silent

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
COPY --from=builder /app/node_modules ./node_modules

COPY --from=builder /app/dist ./dist

COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/generated ./generated

EXPOSE 3000

ENV PORT=3000

CMD ["node", "dist/src/main.js"]
