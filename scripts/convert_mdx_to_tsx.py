#!/usr/bin/env python3
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
DOCS_APP = ROOT / 'docs-site' / 'app' / 'docs'

fm_re = re.compile(r'^---\n[\s\S]*?\n---\n', re.M)

for mdx in DOCS_APP.rglob('page.mdx'):
    rel = mdx.relative_to(DOCS_APP)
    # create page.tsx in same directory
    dest = mdx.with_suffix('.tsx')
    content = mdx.read_text()
    # strip frontmatter
    md = fm_re.sub('', content)
    # escape backticks
    md_escaped = md.replace('`', '\\`')
    tsx = f"""import DocRenderer from '../../../components/DocRenderer'

export default function Page(){{
  const source = `{md_escaped}`
  return <DocRenderer source={{source}} />
}}
"""
    mdx.unlink()
    dest.write_text(tsx)
    print('Converted', mdx, '->', dest)

print('Conversion complete')
