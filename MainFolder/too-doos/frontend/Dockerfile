# 1) Etap instalacji zależności
FROM node:18-alpine AS deps
WORKDIR /app

# Skopiuj manifesty, zainstaluj pakiety
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# 2) Etap budowania aplikacji
FROM node:18-alpine AS builder
WORKDIR /app

# Przepisz node_modules z poprzedniego etapu (cache)
COPY --from=deps /app/node_modules ./node_modules

# Skopiuj całą resztę kodu źródłowego
COPY . .

ARG KEYCLOAK_CLIENT_ID
ARG KEYCLOAK_CLIENT_SECRET
ARG KEYCLOAK_ISSUER_URL
ARG NEXTAUTH_URL

# Zbuduj produkcyjną wersję Next.js
RUN npm run build

# 3) Etap docelowy — lekki obraz run-time
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Skopiuj jedynie to, co potrzebne w produkcji
COPY --from=builder /app/.next       ./.next
COPY --from=builder /app/public      ./public
COPY --from=deps    /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.ts ./next.config.ts

# Jeśli masz dodatkowe pliki konfiguracyjne (tsconfig, etc.) i potrzebne są w runtime, dorzuć je:
# COPY --from=builder /app/tsconfig.json ./tsconfig.json

EXPOSE 3000

# Uruchom Next.js w trybie produkcyjnym
CMD ["npm", "run", "start"]
