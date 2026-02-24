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

# Copy everything needed for Next.js to serve prerendered pages
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/package-lock.json ./

# Copy next.config so Next.js can read it
COPY --from=builder /app/next.config.mjs ./

EXPOSE 8080
ENV PORT=8080

# Start Next.js in production mode
CMD ["npm", "start"]
