# Stage 1: build React frontend
FROM node:lts-bookworm AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: production runtime
FROM node:lts-bookworm-slim AS runner
WORKDIR /app

# Build tools needed to compile native sqlite3 module
RUN apt-get update && \
    apt-get install -y --no-install-recommends python3 make g++ && \
    rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist
COPY server.js ./

RUN mkdir -p /app/data

EXPOSE 3001
VOLUME ["/app/data"]

CMD ["node", "server.js"]
