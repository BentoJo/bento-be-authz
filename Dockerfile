# syntax=docker/dockerfile:1

# 1. Build stage — full toolchain, dev deps, compile TS -> dist.
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# 2. Runner stage — prod deps only, non-root, minimal surface.
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Prod dependencies only (no dev toolchain in the runtime image).
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Compiled output + the files the app reads at runtime.
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/drizzle.config.ts ./drizzle.config.ts
# drizzle/ migrations are not generated in this repo yet; copy is a no-op-safe
# glob so the build doesn't fail when the dir is absent. Uncomment the explicit
# line if/when ./drizzle exists and you want it in the image.
# COPY --from=builder /app/drizzle ./drizzle

# gRPC server loads .proto from src/shared/proto at runtime. main.js lives at
# /app/dist/src/main.js, and its protoPath resolves to
# /app/dist/src/shared/proto/*.proto — so the protos must land THERE.
COPY --from=builder /app/src/shared/proto ./dist/src/shared/proto

# Drop privileges — node:20-alpine ships a built-in non-root `node` user.
USER node

# gRPC listens on 50053 (GRPC_PORT in .env).
EXPOSE 50053

# NOTE: gRPC-only service, no HTTP health route — no HEALTHCHECK here.
# Liveness is verified at the orchestration layer (compose ps / a TCP probe on
# 50053, e.g. `nc -z localhost 50053`).

CMD ["node", "dist/src/main.js"]
