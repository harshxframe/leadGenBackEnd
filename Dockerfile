# ==========================
# Build Stage
# ==========================
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

# ==========================
# Production Stage
# ==========================
FROM node:22-alpine

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./

RUN npm ci --omit=dev

COPY --from=builder /app .

RUN addgroup -S appgroup && \
    adduser -S appuser -G appgroup

RUN mkdir -p /app/logs /app/temp && \
    chown -R appuser:appgroup /app

RUN apk add --no-cache docker-cli

USER root

EXPOSE 2020

CMD ["node", "server.js"]