# Opteryx Docs - Minimal Next.js + MDX scaffold

This folder contains a minimal Next.js scaffold and a migration helper to import MkDocs content.

Getting started:

```bash
cd docs-site
npm install
# migrate the MkDocs `docs/` content into the Next.js app
npm run migrate-docs
# run the site locally
npm run dev
```

What the migration script does:
- parses `mkdocs.yml` in the repo root
- copies `docs/*.md` into `app/docs/.../*.mdx`
- copies non-markdown assets under `docs/` into `public/docs/`
- writes a simple `nav.json` based on `mkdocs.yml` for the sidebar

After running the migration, review the generated pages under `app/docs/` and adjust any content (links, images) as needed.

If you want, I can run the migration and commit the generated pages for you if you grant permission or run the above locally and push the changes.

