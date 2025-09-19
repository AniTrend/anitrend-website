# syntax=docker.io/docker/dockerfile:1

FROM node:22-bookworm-slim AS base

# Enable corepack for yarn support and install minimal native build deps
RUN apt-get update \
	&& apt-get install -y --no-install-recommends \
	   ca-certificates curl python3 make g++ \
	&& rm -rf /var/lib/apt/lists/* \
	&& corepack enable

# Step 1. Rebuild the source code only when needed
FROM base AS builder

WORKDIR /app

# Install dependencies using yarn (Yarn Berry config)
COPY package.json yarn.lock .yarnrc.yml ./
RUN yarn install --immutable

COPY src ./src
COPY public ./public
COPY next.config.ts .
COPY tsconfig.json .
COPY tailwind.config.ts .
COPY postcss.config.mjs .
COPY components.json .

# Environment variables must be present at build time
# https://github.com/vercel/next.js/discussions/14030

# Next.js collects completely anonymous telemetry data about general usage. Learn more here: https://nextjs.org/telemetry
# Uncomment the following line to disable telemetry at build time
# ENV NEXT_TELEMETRY_DISABLED 1

# Build Next.js using yarn with memory optimization
ENV NODE_OPTIONS="--max-old-space-size=1024"
RUN yarn build

# Note: It is not necessary to add an intermediate step that does a full copy of `node_modules` here

# Step 2. Production image, copy all the files and run next
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
