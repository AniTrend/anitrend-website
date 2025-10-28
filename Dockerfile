# syntax=docker.io/docker/dockerfile:1

FROM node:24-bookworm-slim AS base

# Enable corepack for yarn support and install minimal native build deps
RUN apt-get update \
	&& apt-get install -y --no-install-recommends \
	   ca-certificates curl python3 make g++ \
	&& rm -rf /var/lib/apt/lists/* \
	&& corepack enable

# Step 1. Dependencies stage - cache yarn install separately
FROM base AS dependencies

WORKDIR /app

# Copy only dependency files first for optimal caching
COPY package.json yarn.lock .yarnrc.yml ./

# Install dependencies using yarn (Yarn Berry config)
RUN yarn install --immutable

# Step 2. Source code stage - adds source files after dependencies are cached
FROM dependencies AS with-source

# Copy all source files and configuration
COPY src ./src
COPY public ./public
COPY next.config.ts .
COPY tsconfig.json .
COPY tailwind.config.ts .
COPY postcss.config.mjs .
COPY components.json .

# Step 3. Build stage - performs Next.js build
FROM with-source AS builder

# Environment variables must be present at build time
# https://github.com/vercel/next.js/discussions/14030

# Next.js collects completely anonymous telemetry data about general usage. Learn more here: https://nextjs.org/telemetry
# Uncomment the following line to disable telemetry at build time
# ENV NEXT_TELEMETRY_DISABLED 1

# Build Next.js using yarn with memory optimization
ENV NODE_OPTIONS="--max-old-space-size=1024"
RUN yarn build

# Step 4. Production image, copy all the files and run next
FROM base AS runner

WORKDIR /app

# Don't run production as root
RUN groupadd -g 1001 nodejs \
	&& useradd -u 1001 -g nodejs -m -r nextjs
USER nextjs

# Ensure production environment in runtime image
ENV NODE_ENV=production

COPY --from=builder /app/public ./public

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Uncomment the following line to disable telemetry at run time
# ENV NEXT_TELEMETRY_DISABLED 1

# Note: Don't expose ports here, Compose will handle that for us

CMD ["node", "server.js"]
