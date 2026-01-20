FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci --silent

COPY . .

ARG NEXT_PUBLIC_API_END_POINT
ENV NEXT_PUBLIC_API_END_POINT=$NEXT_PUBLIC_API_END_POINT
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build --silent


FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3001
EXPOSE 3001

COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static
COPY --from=builder --chown=node:node /app/public ./public

USER node
CMD ["node", "server.js"]