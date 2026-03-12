import json, pathlib, re

funcs = json.loads(pathlib.Path('functions.json').read_text())
base = pathlib.Path('docs-site/reference/sql/functions')

for name, entries in funcs.items():
    slug = re.sub(r'[^a-z0-9]+','_',name.lower())
    path = base / f"{slug}.md"
    if not path.exists():
        continue
    doc = entries[0].get('documentation', '')

    # build syntax
    syntaxes = [e['label'] for e in entries]

    # collect unique arguments
    args = []
    for e in entries:
        for param in e.get('parameters', []):
            label = param['label']
            argdoc = param.get('documentation','')
            if not any(a[0]==label for a in args):
                args.append((label, argdoc))

    # write new content
    lines = []
    lines.append('---')
    lines.append(f'title: {name} — Opteryx Function')
    lines.append(f'description: {doc}')
    lines.append('---\n')
    lines.append(f'# {name}\n')
    if doc:
        lines.append(doc + '\n')
    lines.append('## Syntax\n')
    for s in syntaxes:
        lines.append('```')
        lines.append(s)
        lines.append('```\n')
    if args:
        lines.append('## Arguments\n')
        for label, argdoc in args:
            lines.append(f'- **{label}**: {argdoc}')
        lines.append('')
    lines.append('## Returns\n')
    lines.append('_TBD_\n')

    path.write_text('\n'.join(lines))

print('enriched pages for', len(funcs), 'functions')
