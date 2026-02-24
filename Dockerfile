## Multi-stage build: build Next.js then run production server
FROM node:20-alpine AS builder
WORKDIR /app

# Copy the entire docs-site directory
COPY docs-site/ ./

# Ensure native build tools are available for any native modules on Alpine
RUN apk add --no-cache python3 build-base

# Install dependencies
RUN npm ci

# Build the Next.js app (includes static pre-rendering)
RUN npm run build

## Runtime image
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

# Copy the built app from builder - copy everything needed to run
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/package-lock.json ./package-lock.json

# Also copy content and reference directories for any runtime fallbacks
COPY --from=builder /app/content ./content
COPY --from=builder /app/reference ./reference
COPY --from=builder /app/core-concepts ./core-concepts
COPY --from=builder /app/app/lib ./app/lib

EXPOSE 8080
ENV PORT=8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s CMD node -e "require('http').get('http://localhost:8080', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start Next.js in production mode
CMD ["npm", "start"]
