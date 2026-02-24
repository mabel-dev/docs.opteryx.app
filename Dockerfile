## Multi-stage build: build Next.js then run production server
FROM node:20-alpine AS builder
WORKDIR /app

# Copy the docs-site source into the build context first
COPY docs-site/ ./

# Ensure native build tools are available for any native modules on Alpine
RUN apk add --no-cache python3 build-base

# Show environment info
RUN echo "node: $(node -v)" && echo "npm: $(npm -v)" && ls -la

# Install dependencies with error handling
RUN npm install --loglevel verbose 2>&1 | tee /app/npm-install.log || (cat /app/npm-install.log && false)

# Diagnostic: show installed packages
RUN npm ls --depth=0 || true

# Build the Next.js app
RUN npm run build

## Runtime image
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

# Copy built Next.js app and dependencies from builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/package-lock.json ./package-lock.json
COPY --from=builder /app/node_modules ./node_modules

# Copy content directories needed for fallback path resolution
COPY --from=builder /app/content ./content
COPY --from=builder /app/reference ./reference
COPY --from=builder /app/core-concepts ./core-concepts

EXPOSE 8080
ENV PORT=8080

# Start Next.js in production mode via npm so `node_modules/.bin` is on PATH
CMD ["npm", "start"]
