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
RUN if [ -f package-lock.json ]; then \
		npm ci --loglevel verbose 2>&1 | tee /app/npm-install.log || (cat /app/npm-install.log && false); \
	else \
		npm install --legacy-peer-deps --loglevel verbose 2>&1 | tee /app/npm-install.log || (cat /app/npm-install.log && false); \
	fi

# Diagnostic: show installed packages
RUN npm ls --depth=0 || true

# Build the Next.js app
RUN npm run build

## Runtime image
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

# Copy built app and production dependencies from builder
COPY --from=builder /app .

EXPOSE 8080
ENV PORT=8080

# Start Next.js in production mode via npm so `node_modules/.bin` is on PATH
CMD ["npm", "start"]
