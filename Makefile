# Makefile for running the documentation site

PORT ?= 3000

.PHONY: serve serve-prod build install validate deploy-firebase \
        sql-definitions sql-docs check-sql-definitions

serve:
	@echo "Starting docs-site dev server on http://localhost:$(PORT)"
	@cd docs-site && if [ ! -d node_modules ]; then npm ci --silent; fi && PORT=$(PORT) npm run dev

# The site is a static export, so there is no `next start` to run. The Firebase
# emulator is the honest local preview: it reads the same firebase.json the
# deploy does, so cleanUrls and the cache headers behave as they will in prod.
serve-prod: build
	@echo "Serving the static export via the Firebase emulator on http://localhost:$(PORT)"
	@npx --yes firebase-tools emulators:start --only hosting

build:
	@cd docs-site && npm run build

# Build fresh and push to Firebase Hosting. Deploys are atomic and the previous
# release stays rollback-able from the Hosting console.
deploy-firebase: build
	@npx --yes firebase-tools deploy --only hosting

install:
	@cd docs-site && npm ci

validate:
	@cd docs-site && npm run validate:docs

# --- SQL reference generation ------------------------------------------------
# The chain, first link to last. Nothing in it is hand-edited; to change what the
# docs say about a function, edit the registrar in opteryx-core.
#
#   opteryx-core registrars -> reference/*.json      (`make reference` THERE)
#     -> definitions/*.json                          (make sql-definitions)
#       -> docs-site/reference/**/*.md + nav.json    (make sql-docs)

sql-definitions: ## Pull definitions/*.json from opteryx-core/reference
	@python3 scripts/sync_sql_definitions.py

# Fails if the definitions have drifted from opteryx-core. Writes nothing —
# suitable for CI, where a stale definition means the published docs describe a
# SQL surface the engine does not have.
check-sql-definitions: ## Fail if definitions/*.json are behind opteryx-core
	@python3 scripts/sync_sql_definitions.py --check

# Statement pages are hand-written prose, so nothing regenerates them and
# nothing noticed when the engine grew syntax they never mentioned. This checks
# the one thing a script can: that every supported statement has a page, and
# that the page names the operations the clause catalog says it accepts.
check-statement-coverage: ## Fail if a supported statement has no page, or a page omits its syntax
	@python3 scripts/check_statement_coverage.py

check-sql: check-sql-definitions check-statement-coverage ## Every SQL-surface drift check

sql-docs: sql-definitions ## Sync definitions, then rebuild the reference pages
	@python3 scripts/update_docs_from_definitions.py
