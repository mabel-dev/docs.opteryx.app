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
    args=[]
    for ov in overloads:
        for param in ov.get('parameters',[]):
            label=param.get('label')
            if not any(a[0]==label for a in args):
                args.append((label, param.get('type',''), param.get('documentation','')))

    if args:
        lines.append('## Arguments\n')
        for label, typ, doc_str in args:
            flags=[]
            # optional/constant/variadic flags can be stored in param metadata
            optional = False
            constant = False
            variadic = False
            # attempt to detect from JSON (some fields may exist)
            for ov in overloads:
                for param in ov.get('parameters',[]):
                    if param.get('label')==label:
                        if param.get('optional'):
                            optional=True
                        if param.get('constant_only'):
                            constant=True
                        if param.get('variadic'):
                            variadic=True
            if optional:
                flags.append('optional')
            if constant:
                flags.append('constant')
            if variadic:
                flags.append('variadic')

            typ_text = f'`{typ}`' if typ else ''
            flag_text = ''
            if flags:
                flag_text = ' [' + ' | '.join(flags) + ']'

            if typ_text:
                lines.append(f'- **{label}** {typ_text}{flag_text}\n    {doc_str}')
            else:
                lines.append(f'- **{label}**{flag_text}\n    {doc_str}')
        lines.append('')

    # returns
    returns=[]
    for ov in overloads:
        ret=ov.get('returns') or {}
        rtype=ret.get('type') or ov.get('return_type','')
        rdoc=ret.get('documentation','')
        if rtype:
            returns.append((rtype, rdoc))
        elif rdoc:
            returns.append((None, rdoc))

    lines.append('## Returns\n')
    if returns:
        for rtype, rdoc in returns:
            if rtype:
                if rdoc:
                    lines.append(f'**{rtype}** — {rdoc}')
                else:
                    lines.append(f'**{rtype}**')
            else:
                lines.append(rdoc)
    else:
        lines.append('_TBD_')
    lines.append('')

    # usage notes
    notes=[]
    for ov in overloads:
        note=ov.get('notes')
        if note and note not in notes:
            notes.append(note)
    if notes:
        lines.append('## Usage Notes\n')
        for note in notes:
            lines.append(note)
        lines.append('')
    filepath.write_text('\n'.join(lines))

# regenerate index list grouped by category
categories = {}
for name, info in funcs.items():
    overloads = info.get('overloads', [])
    # use summary field if present, otherwise first overload documentation
    summary = info.get('summary') or (overloads[0].get('documentation') if overloads else '')
    category = (overloads[0].get('category') if overloads else 'Other') or 'Other'
    categories.setdefault(category, []).append((name, summary))

lines=[
'---',
'title: SQL Functions — Opteryx Reference',
'description: Concise list of SQL functions with links to detail pages.',
'---','',
'# Functions','',
'The following functions are supported by Opteryx.  Click a name for details.','']

for category in sorted(categories.keys()):
    lines.append(f'## {category}\n')
    for name, summary in sorted(categories[category], key=lambda x: x[0]):
        slug = slug_map[name]
        lines.append(f'- [{name}](functions/{slug}) — {summary}')
    lines.append('')

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
