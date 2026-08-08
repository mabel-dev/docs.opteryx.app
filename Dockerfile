## Multi-stage build: export the Next.js site, then serve the files.
##
## next.config.mjs sets `output: 'export'`, so the build produces a directory of
## static files and there is no server to start — `next start` refuses to run
## against an export. nginx serves `out/` instead.
FROM node:20-alpine AS builder
WORKDIR /app

# Copy the entire docs-site directory
COPY docs-site/ ./
# Copy blog content (outside docs-site) so the build can read it
COPY content/blog ./content/blog

# Ensure native build tools are available for any native modules on Alpine
RUN apk add --no-cache python3 build-base

# Install dependencies
RUN npm ci

# Build the Next.js app — writes the static export to /app/out
RUN npm run build

## Runtime image
FROM nginx:1.27-alpine AS runtime

# The export is self-contained: no node_modules, no next.config, no content
# directory. Everything the browser asks for is already in out/.
COPY --from=builder /app/out /usr/share/nginx/html
COPY cloudbuild/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080
