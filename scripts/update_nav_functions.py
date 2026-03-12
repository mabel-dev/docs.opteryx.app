import json, pathlib, re

nav_path=pathlib.Path('docs-site/nav.json')
nav=json.loads(nav_path.read_text())
# remove blog section
nav=[sec for sec in nav if 'Engineering Blog' not in sec]
# load funcs for building items
funcs=json.loads(pathlib.Path('functions.json').read_text())
# slug map
def make_slug(name: str) -> str:
    return re.sub(r'[^a-z0-9]+','_',name.lower())

slug_map={name: make_slug(name) for name in funcs.keys()}

# directory for pages
base = pathlib.Path('docs-site/reference/sql/functions')
base.mkdir(exist_ok=True)

# helper to render a function page
for name, info in funcs.items():
    slug=slug_map[name]
    filepath=base/ f"{slug}.md"
    overloads = info.get('overloads', [])
    # build sections
    doc = overloads[0].get('documentation','') if overloads else ''
    lines = []
    lines.append('---')
    lines.append(f'title: {name} — Opteryx Function')
    lines.append(f'description: {doc}')
    lines.append('---\n')
    lines.append(f'# {name}\n')
    if doc:
        lines.append(doc + '\n')
    # category if available
    if overloads and overloads[0].get('category'):
        lines.append(f"**Category:** {overloads[0]['category']}\n")
    # syntax
    lines.append('## Syntax\n')
    for ov in overloads:
        lines.append('```')
        lines.append(ov.get('label',''))
        lines.append('```\n')
    # arguments
    args_seen={}
    for ov in overloads:
        for param in ov.get('parameters',[]):
            label=param.get('label')
            if label not in args_seen:
                args_seen[label]=param.get('documentation','')
    if args_seen:
        lines.append('## Arguments\n')
        for label, argdoc in args_seen.items():
            lines.append(f'- **{label}**: {argdoc}')
        lines.append('')
    # returns
    returns_seen=[]
    for ov in overloads:
        ret = ov.get('returns') or {}
        rdoc = ret.get('documentation','') or ov.get('return_type','')
        if rdoc and rdoc not in returns_seen:
            returns_seen.append(rdoc)
    lines.append('## Returns\n')
    if returns_seen:
        for rdoc in returns_seen:
            lines.append(rdoc)
    else:
        lines.append('_TBD_')
    lines.append('')
    filepath.write_text('\n'.join(lines))

# regenerate index list
lines=[
'---',
'title: SQL Functions — Opteryx Reference',
'description: Concise list of SQL functions with links to detail pages.',
'---','',
'# Functions','',
'The following functions are supported by Opteryx.  Click a name for details.','']
for name in sorted(funcs.keys()):
    slug=slug_map[name]
    doc = funcs[name].get('documentation','') or (funcs[name].get('overloads',[{}])[0].get('documentation',''))
    lines.append(f'- [{name}](functions/{slug}) — {doc}')
path=pathlib.Path('docs-site/reference/sql/functions.md')
path.write_text("\n".join(lines))

# update nav
item_list=[{name: f"reference/sql/functions/{slug_map[name]}.md"} for name in sorted(funcs.keys())]
for section in nav:
    if 'Reference' in section:
        for entry in section['Reference']:
            if 'SQL Language Reference' in entry:
                for sub in entry['SQL Language Reference']:
                    if 'Functions' in sub:
                        sub['Functions']={'href':'reference/sql/functions.md','items':item_list}
nav_path.write_text(json.dumps(nav, indent=2))

print('nav.json updated, blog removed, functions items regenerated: items count', len(item_list))
