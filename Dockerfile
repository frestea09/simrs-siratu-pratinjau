# syntax=docker/dockerfile:1

# Base image providing Node.js runtime
FROM node:20-alpine AS base

# Install compatibility libraries required by Next.js
RUN apk add --no-cache libc6-compat

# Set working directory for all subsequent stages
WORKDIR /app

# Install production dependencies
FROM base AS deps

# Copy dependency manifests and Prisma schema for generating the client
COPY package.json package-lock.json* ./
COPY prisma ./prisma

# Install only production dependencies for the runtime image
RUN npm ci --omit=dev

# Build stage for compiling the Next.js application
FROM base AS builder

# Copy manifests and Prisma schema before installing dependencies so that
# Prisma's postinstall hook can access the schema.
COPY package.json package-lock.json* ./
COPY prisma ./prisma

# Install full dependency set including dev dependencies needed for building
RUN npm ci

# Copy the rest of the application source and build it
COPY . .

# Ensure the Prisma client is generated (handled during npm ci) and build the app
RUN npm run build

# Production runtime image
FROM base AS runner

ENV NODE_ENV=production
ENV PORT=9002
ENV DATABASE_URL=postgresql://postgres:your_new_password@localhost:5432/siratudb?schema=public

# Create a non-root user to run the application
RUN addgroup -g 1001 nextjs \
    && adduser -S -G nextjs -u 1001 nextjs

# Copy production node_modules, built assets, and necessary configuration
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.js ./next.config.js
COPY --from=builder /app/next.config.ts ./next.config.ts
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next

# Adjust ownership for the application directory
RUN chown -R nextjs:nextjs /app

USER nextjs

EXPOSE 9002

CMD ["npm", "run", "start"]
