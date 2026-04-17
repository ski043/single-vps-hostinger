# ============================================
# Base image shared across build targets
# ============================================

# IMPORTANT: Node.js Version Maintenance
# This Dockerfile uses Node.js 24.13.0-slim, which was the latest LTS version.
# To ensure security and compatibility, regularly update the NODE_VERSION ARG to the latest LTS version.
ARG NODE_VERSION=24.13.0-slim

FROM node:${NODE_VERSION} AS base

WORKDIR /app

# This shared base keeps the build stages aligned on the same Node version
# and includes OpenSSL because Prisma needs it in this project.
RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*

# ============================================
# Stage 1: Install pnpm dependencies
# ============================================

FROM base AS dependencies

# Copy dependency manifests first to maximize build cache reuse.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Installing dependencies in a dedicated stage lets later stages reuse the
# same node_modules tree without re-running pnpm install every time.
RUN --mount=type=cache,target=/root/.local/share/pnpm/store \
    corepack enable pnpm && pnpm install --frozen-lockfile

# ============================================
# Stage 2: Build Next.js application
# ============================================

FROM base AS builder

# This value is passed into the Next.js build so the final artifact can carry
# a deployment identifier without changing application code.
ARG DEPLOYMENT_VERSION=local-build

# The builder reuses the dependency stage so we do not download packages twice.
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .

# Generate Prisma client before the Next.js build so the standalone output can trace it.
RUN DATABASE_URL="postgresql://postgres:postgres@postgres:5432/hostmarshall?schema=public" \
    corepack enable pnpm \
    && pnpm prisma generate

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
# ENV NEXT_TELEMETRY_DISABLED=1
# These placeholder envs only exist so the production build can complete.
# Real runtime values still come from the VPS `.env` file when containers start.
RUN export NODE_ENV=production \
    DATABASE_URL="postgresql://postgres:postgres@postgres:5432/hostmarshall?schema=public" \
    BETTER_AUTH_SECRET="build-time-placeholder-secret-build-time-placeholder-secret" \
    BETTER_AUTH_URL="https://example.com" \
    DEPLOYMENT_VERSION="${DEPLOYMENT_VERSION}" \
    && corepack enable pnpm \
    && pnpm build

# ============================================
# Stage 3: Migration image
# ============================================

FROM base AS migrator

# The migration image is intentionally small and focused: it only needs Prisma,
# config, and dependencies to run `prisma migrate deploy` during rollout.
COPY --from=dependencies /app/node_modules ./node_modules
COPY package.json pnpm-workspace.yaml prisma.config.ts ./
COPY prisma ./prisma

CMD ["npx", "prisma", "migrate", "deploy"]

# ============================================
# Stage 4: Run Next.js application
# ============================================

FROM node:${NODE_VERSION} AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the run time.
# ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=builder --chown=node:node /app/public ./public

# The runtime cache is persisted via a named Docker volume in production, so we
# prepare the directory here and hand ownership to the non-root `node` user.
RUN mkdir -p .next/cache && chown -R node:node .next

# Automatically leverage output traces to reduce image size.
# `.next/standalone` contains the traced Node server, `.next/static` contains
# client assets, and the generated Prisma client is copied explicitly because
# the standalone output still needs it at runtime.
COPY --from=builder --chown=node:node /app/app/generated/prisma ./app/generated/prisma
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static

# The final container should not run as root during normal request handling.
USER node

EXPOSE 3000

CMD ["node", "server.js"]
