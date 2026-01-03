## Multi-stage build: build Next.js then run production server
FROM node:18-alpine AS builder
WORKDIR /app

# Install dependencies (copy package files from docs-site to improve cache)
COPY docs-site/package.json docs-site/package-lock.json* ./
# Ensure native build tools are available for any native modules on Alpine
RUN apk add --no-cache python3 build-base

# Use `npm ci` when a lockfile exists for reproducible installs. If that fails
# fall back to `npm install --legacy-peer-deps`. Run with verbose logging and
# capture output to a file so CI logs contain the underlying error for diagnosis.
RUN echo "node: $(node -v)" && echo "npm: $(npm -v)" && ls -la

# upgrade npm to suppress update notice and use newer CLI features
RUN npm install -g npm@11.7.0 --silent --unsafe-perm

RUN if [ -f package-lock.json ]; then \
			sh -c "npm ci --loglevel verbose 2>&1 | tee /app/npm-install.log" || (cat /app/npm-install.log && false); \
		else \
			sh -c "npm install --legacy-peer-deps --loglevel verbose 2>&1 | tee /app/npm-install.log" || (cat /app/npm-install.log && false); \
		fi

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
CMD ["sh", "-c", "next start -p ${PORT}"]
