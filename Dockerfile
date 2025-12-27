## Multi-stage build: build Next.js then run production server
FROM node:18-alpine AS builder
WORKDIR /app

# Install dependencies (copy package files from docs-site to improve cache)
COPY docs-site/package.json docs-site/package-lock.json* ./
RUN npm ci --silent

# Copy the docs-site source into the build context
COPY docs-site/ ./

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
