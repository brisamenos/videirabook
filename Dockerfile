# VideiraBook — imagem para EasyPanel / Docker
# Etapa 1: instala dependências (com ferramentas de compilação para o better-sqlite3)
FROM node:22-bookworm AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

# Etapa 2: imagem final enxuta
FROM node:22-bookworm-slim
WORKDIR /app
ENV NODE_ENV=production \
    PORT=3000 \
    DATA_DIR=/app/data \
    TZ=America/Fortaleza
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN mkdir -p /app/data/uploads
VOLUME ["/app/data"]
EXPOSE 3000
CMD ["node", "server.js"]
