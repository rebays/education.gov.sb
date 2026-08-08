# syntax=docker/dockerfile:1

# BUILD STAGE
# Install dependencies and produce Next.js' standalone output. The
# .next/standalone folder ships a minimal server plus only the runtime
# node_modules that were actually reached during tracing.
FROM node:22-alpine AS builder

# libc6-compat is needed by some Node.js modules on Alpine.
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Install dependencies from the lockfile.
COPY package.json package-lock.json ./
RUN npm ci

# Copy source and build.
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build


# RUNTIME STAGE
# Minimal image that runs the standalone server. No `npm install` here —
# Next already traced and copied the runtime deps into .next/standalone.
FROM node:22-alpine AS runtime

WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

# Run as a non-root user.
RUN addgroup -S nextjs && adduser -S -G nextjs nextjs

# Copy public assets and the standalone server. server.js and its
# node_modules live at the root of standalone/; static assets are placed
# where the standalone server expects them.
COPY --from=builder --chown=nextjs:nextjs /app/public ./public
COPY --from=builder --chown=nextjs:nextjs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nextjs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
