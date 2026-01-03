## Multi-stage build: build Next.js then run production server
FROM node:18-alpine AS builder
WORKDIR /app

# Install deps
COPY package.json package-lock.json* ./
RUN npm ci --silent

# Copy source and build
COPY . .
RUN npm run build

## Runtime image
FROM node:18-alpine
WORKDIR /app
ENV NODE_ENV=production

# Copy built app from builder
COPY --from=builder /app .

EXPOSE 8080
ENV PORT=8080

# Use the start script in package.json which runs `next start`
CMD ["sh", "-c", "npm run start -- -p ${PORT}" ]
