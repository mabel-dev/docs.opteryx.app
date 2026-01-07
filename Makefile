# Makefile for running the documentation site

PORT ?= 3000

.PHONY: serve serve-prod build install

serve:
	@echo "Starting docs-site dev server on http://localhost:$(PORT)"
	@cd docs-site && if [ ! -d node_modules ]; then npm ci --silent; fi && PORT=$(PORT) npm run dev

serve-prod:
	@echo "Building and starting docs-site in production mode on port $(PORT)"
	@cd docs-site && npm ci --silent && npm run build && PORT=$(PORT) npm start

build:
	@cd docs-site && npm run build

install:
	@cd docs-site && npm ci
