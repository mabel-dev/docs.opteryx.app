## Multi-stage build: build Next.js then run production server
FROM node:20-alpine AS builder
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
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production

# Copy built app from builder, including all content directories needed for static generation
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/package-lock.json ./package-lock.json
COPY --from=builder /app/content ./content
COPY --from=builder /app/reference ./reference
COPY --from=builder /app/core-concepts ./core-concepts
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 8080
ENV PORT=8080

# Use the start script in package.json which runs `next start`
CMD ["npm", "start"]
