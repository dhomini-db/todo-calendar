# ── Estágio 1: instalar dependências ─────────────────────────────────────────
FROM node:20-alpine AS deps

WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install

# ── Estágio 2: build de produção ──────────────────────────────────────────────
FROM deps AS build

COPY . .
RUN npm run build

# ── Estágio 3: servir com Nginx ───────────────────────────────────────────────
FROM nginx:1.25-alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
