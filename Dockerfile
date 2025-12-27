## Multi-stage build: build Next.js then run production server
FROM node:18-alpine AS builder
WORKDIR /app

# Install dependencies (copy package files from docs-site to improve cache)
COPY docs-site/package.json docs-site/package-lock.json* ./
# Ensure native build tools are available for any native modules on Alpine
RUN apk add --no-cache python3 build-base

# Use `npm ci` when a lockfile exists for reproducible installs. If that fails
# (peer deps, platform-specific optional deps, etc.), fall back to a more
# tolerant install using `--legacy-peer-deps` so CI builds don't break silently.
RUN if [ -f package-lock.json ]; then npm ci --silent || npm install --legacy-peer-deps --silent; else npm install --legacy-peer-deps --silent; fi

# Copy the docs-site source into the build context
COPY docs-site/ ./

# Diagnostic: show installed packages and react info
RUN node -e "console.log('react keys:', Object.keys(require('react'))); console.log('react version:', require('react').version)"
RUN npm ls --depth=0 || true

# Build the Next.js app
RUN npm run build

## Runtime image
FROM node:18-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

# Copy built app and production dependencies from builder
COPY --from=builder /app .

EXPOSE 8080
ENV PORT=8080

# Start Next.js in production mode
CMD ["sh", "-c", "npm run start -- -- -p ${PORT}"]
