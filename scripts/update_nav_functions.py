import json, pathlib, re

nav_path=pathlib.Path('docs-site/nav.json')
nav=json.loads(nav_path.read_text())
# remove blog section
nav=[sec for sec in nav if 'Engineering Blog' not in sec]
# load funcs for building items
funcs=json.loads(pathlib.Path('functions.json').read_text())
# slug map
slug_map={}
for name in funcs.keys():
    slug=re.sub(r'[^a-z0-9]+','_',name.lower())
    slug_map[name]=slug

# create individual pages
base = pathlib.Path('docs-site/reference/sql/functions')
base.mkdir(exist_ok=True)
for name, entries in funcs.items():
    slug = slug_map[name]
    filepath = base / f"{slug}.md"
    if not filepath.exists():
        print('creating page for', name)
        doc = entries[0].get('documentation','')
        content = f"""---
title: {name} — Opteryx Function
description: {doc}
---

# {name}

{doc}

<!-- more details to be added -->
"""
        filepath.write_text(content)
    else:
        # for debugging
        pass

# rebuild functions.md list
lines=[
'---',
'title: SQL Functions — Opteryx Reference',
'description: Concise list of SQL functions with links to detail pages.',
'---','',
'# Functions','',
'The following functions are supported by Opteryx.  Click a name for details.','']
for name in sorted(funcs.keys()):
    slug=slug_map[name]
    doc=funcs[name][0].get('documentation','')
    lines.append(f'- [{name}](functions/{slug}) — {doc}')
path=pathlib.Path('docs-site/reference/sql/functions.md')
path.write_text("\n".join(lines))

# build nav items
item_list=[{name: f"reference/sql/functions/{slug_map[name]}.md"} for name in sorted(funcs.keys())]
# insert into nav
for section in nav:
    if 'Reference' in section:
        for entry in section['Reference']:
            if 'SQL Language Reference' in entry:
                for sub in entry['SQL Language Reference']:
                    if 'Functions' in sub:
                        sub['Functions']={'href':'reference/sql/functions.md','items':item_list}
# write back nav
nav_path.write_text(json.dumps(nav, indent=2))
print('nav.json updated, blog removed, functions items regenerated: items count', len(item_list))
