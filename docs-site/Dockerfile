## Multi-stage build: build Next.js then run production server
FROM node:18-alpine AS builder
WORKDIR /app

# Install deps
COPY package.json package-lock.json* ./
# Skip global npm upgrade to avoid failures on Alpine images; show current npm
RUN echo "npm: $(npm -v)"
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
CMD ["npm", "start"]
