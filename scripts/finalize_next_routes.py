#!/usr/bin/env python3
"""Finalize routes for Next.js app router by moving .mdx files into page.mdx folders
and fixing internal .md links and asset src paths.
"""
from pathlib import Path
import re

import sys

ROOT = Path(__file__).resolve().parents[1]
DOCS_APP = ROOT / 'docs-site' / 'app' / 'docs'

if not DOCS_APP.exists():
    print('docs-site/app/docs does not exist; run migrate first', file=sys.stderr)
    sys.exit(1)

mdfiles = list(DOCS_APP.rglob('*.mdx'))
print(f'Found {len(mdfiles)} mdx files')

link_re = re.compile(r'href\s*=\s*"([^"]+?)\.md"')
img_re = re.compile(r'src\s*=\s*"assets/([^"]+)"')

for f in mdfiles:
    rel = f.relative_to(DOCS_APP)
    text = f.read_text()
    # replace .md links -> /docs/path (strip ./)
    text = link_re.sub(lambda m: f'href="/docs/{m.group(1).lstrip("./")}"', text)
    # replace assets src
    text = img_re.sub(lambda m: f'src="/docs/assets/{m.group(1)}"', text)

    # write updated content back
    f.write_text(text)

# Now move files into page.mdx structure
for f in list(DOCS_APP.rglob('*.mdx')):
    rel = f.relative_to(DOCS_APP)
    parts = rel.parts
    if f.name == 'index.mdx':
        # move to parent/page.mdx
        parent = f.parent
        dest = parent / 'page.mdx'
        print(f'Moving {f} -> {dest}')
        f.replace(dest)
    else:
        stem = f.stem
        parent = f.parent
        newdir = parent / stem
        newdir.mkdir(exist_ok=True)
        dest = newdir / 'page.mdx'
        print(f'Moving {f} -> {dest}')
        f.replace(dest)

# cleanup: remove empty directories under DOCS_APP
for d in sorted(DOCS_APP.rglob('*'), key=lambda p: -len(p.parts)):
    if d.is_dir() and not any(d.iterdir()):
        print('Removing empty dir', d)
        d.rmdir()

print('Route finalization complete')
