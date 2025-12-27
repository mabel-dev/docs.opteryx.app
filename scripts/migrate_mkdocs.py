#!/usr/bin/env python3
"""Migrate MkDocs docs/ content into the Next.js app (docs-site).

Usage:
  python3 scripts/migrate_mkdocs.py

Requires: PyYAML (pip install pyyaml)
"""
import sys
from pathlib import Path
import shutil
import json

try:
    import yaml
except Exception:
    print("PyYAML not installed. Install with: pip install pyyaml", file=sys.stderr)
    sys.exit(1)

ROOT = Path(__file__).resolve().parents[1]
MKDOCS = ROOT / "mkdocs.yml"
DOCS_DIR = ROOT / "docs"
OUT_DIR = ROOT / "docs-site" / "app" / "docs"
PUBLIC_DIR = ROOT / "docs-site" / "public" / "docs"
NAV_FILE = ROOT / "docs-site" / "nav.json"


def copy_docs():
    if not MKDOCS.exists():
        print("mkdocs.yml not found at repo root", file=sys.stderr)
        sys.exit(1)

    if not DOCS_DIR.exists():
        print("docs/ directory not found", file=sys.stderr)
        sys.exit(1)

    print(f"Loading {MKDOCS}")
    mk = yaml.safe_load(MKDOCS.read_text())

    print(f"Cleaning output directories: {OUT_DIR} and {PUBLIC_DIR}")
    if OUT_DIR.exists():
        shutil.rmtree(OUT_DIR)
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    if PUBLIC_DIR.exists():
        shutil.rmtree(PUBLIC_DIR)
    PUBLIC_DIR.mkdir(parents=True, exist_ok=True)

    # copy files: non-md go to public/docs, md -> app/docs (as .mdx)
    for src in DOCS_DIR.rglob('*'):
        rel = src.relative_to(DOCS_DIR)
        dest_public = PUBLIC_DIR / rel
        dest_doc = OUT_DIR / rel
        if src.is_dir():
            continue
        if src.suffix.lower() == '.md':
            dest_doc = dest_doc.with_suffix('.mdx')
            dest_doc.parent.mkdir(parents=True, exist_ok=True)
            content = src.read_text()
            # add frontmatter title if absent
            title = src.stem.replace('-', ' ').replace('_', ' ')
            front = f"---\ntitle: {title}\n---\n\n"
            dest_doc.write_text(front + content)
        else:
            dest_public.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(src, dest_public)

    nav = mk.get('nav', [])
    NAV_FILE.write_text(json.dumps(nav, indent=2))
    print(f"Wrote nav to {NAV_FILE}")
    print(f"Docs copied to {OUT_DIR}")
    print(f"Assets copied to {PUBLIC_DIR}")


if __name__ == '__main__':
    copy_docs()
    print('Migration finished.')
