FROM node:24.0.0-alpine3.21 AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:24.0.0-alpine3.21 AS runner

WORKDIR /app

ENV NODE_ENV=production

RUN addgroup -S nodejs && adduser -S nodejs -G nodejs

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist

RUN chown -R nodejs:nodejs /app
USER nodejs

EXPOSE 9001

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget -qO- http://localhost:9001/health || exit 1

CMD ["node", "dist/main"]
