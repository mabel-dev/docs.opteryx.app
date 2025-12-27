## Multi-stage build: build Next.js then run production server
FROM node:18-alpine AS builder
WORKDIR /app

# Install dependencies (copy package files from docs-site to improve cache)
COPY docs-site/package.json docs-site/package-lock.json* ./
# Diagnostic install: show node/npm versions and run install verbosely so build logs reveal failure reasons
RUN node -v && npm -v && npm config ls -l || true
# Try a robust install: prefer lockfile with `npm ci`, otherwise install with safe flags
RUN if [ -f package-lock.json ]; then \
      npm ci --loglevel=verbose --no-audit --no-fund || (echo "npm ci failed"; cat /workspace/npm-debug.log || true; exit 1); \
    else \
      npm cache clean --force || true; \
      npm install --loglevel=verbose --no-audit --no-fund --legacy-peer-deps || (echo "npm install failed, retrying with legacy-peer-deps"; npm install --legacy-peer-deps --no-audit --no-fund || (cat /workspace/npm-debug.log || true; exit 1)); \
    fi

# Copy the docs-site source into the build context
COPY docs-site/ ./

# Diagnostic: show installed packages and react info
RUN node -e "console.log('react keys:', Object.keys(require('react'))); console.log('react version:', require('react').version)"
RUN npm ls --depth=0 || true

# Disable Next telemetry in the containerized build
ENV NEXT_TELEMETRY_DISABLED=1

# Build the Next.js app and capture verbose output to build.log so we can see failures
RUN sh -c "npm run build 2>&1 | tee build.log; rc=$?; if [ $rc -ne 0 ]; then echo '--- BUILD LOG ---'; tail -n 500 build.log || true; echo '--- .next ls ---'; ls -la .next || true; echo '--- .next size ---'; du -sh .next || true; exit $rc; fi"

# Show .next summary
RUN echo ".next content:"; ls -la .next || true; du -sh .next || true

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
