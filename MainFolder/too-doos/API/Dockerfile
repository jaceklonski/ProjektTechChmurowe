# Dockerfile
ARG NODE_VERSION=18-alpine

# ——— Build stage ———
FROM node:${NODE_VERSION} AS builder
WORKDIR /app

# kopiujemy schema PRISMY, by postinstall/prisma generate działało
COPY prisma ./prisma

# kopiujemy package.json, instalujemy depki produkcyjne
COPY package*.json ./
RUN npm ci --omit=dev

# kopiujemy kod
COPY src ./src

# ——— Runtime stage ———
FROM node:${NODE_VERSION} AS runtime
WORKDIR /app
ENV NODE_ENV=production

# kopiujemy moduły i kod z buildu
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/src ./src
COPY --from=builder /app/prisma ./prisma

RUN apk update && apk add --no-cache curl iputils

# entrypoint
COPY entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

USER node
EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD curl -f http://localhost:5000/health || exit 1

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
