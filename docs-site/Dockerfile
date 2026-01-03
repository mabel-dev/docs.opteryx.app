## Multi-stage build: build Next.js then run production server
FROM node:18-alpine AS builder
WORKDIR /app

# Install deps
COPY package.json package-lock.json* ./
# upgrade npm to suppress update notice and use newer CLI features
RUN npm install -g npm@11.7.0 --silent --unsafe-perm
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
CMD ["sh", "-c", "next start -p ${PORT}" ]
