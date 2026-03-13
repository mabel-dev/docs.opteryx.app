import json
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent.parent
DEFS = ROOT / 'definitions'
DOCS = ROOT / 'docs-site'

NAV_PATH = DOCS / 'nav.json'
CONTENT_DIR = DOCS / 'content' / 'docs'
REF_SQL_DIR = CONTENT_DIR / 'reference' / 'sql'


def slugify(name: str) -> str:
    return re.sub(r'[^a-z0-9]+', '_', name.lower())


def load_json(path: pathlib.Path):
    return json.loads(path.read_text())


def write_md(path: pathlib.Path, lines: list[str]):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text('\n'.join(lines))


def build_functions_docs(functions_def: dict):
    # build index grouped by category
    categories: dict[str, list[tuple[str, str]]] = {}
    for name, info in functions_def.items():
        overloads = info.get('overloads', [])
        summary = info.get('summary') or (overloads[0].get('documentation') if overloads else '')
        category = (overloads[0].get('category') if overloads else 'Other') or 'Other'
        categories.setdefault(category, []).append((name, summary))

    # write index page
    lines = [
        '---',
        'title: SQL Functions — Opteryx Reference',
        'description: Concise list of SQL functions with links to detail pages.',
        '---',
        '',
        '# Functions',
        '',
        'The following functions are supported by Opteryx.  Click a name for details.',
        ''
    ]

    for category in sorted(categories.keys()):
        lines.append(f'## {category}\n')
        for name, summary in sorted(categories[category], key=lambda x: x[0]):
            slug = slugify(name)
            lines.append(f'- [{name}](functions/{slug}) — {summary}')
        lines.append('')

    write_md(REF_SQL_DIR / 'functions.md', lines)

    # detail pages
    for name, info in functions_def.items():
        slug = slugify(name)
        path = REF_SQL_DIR / 'functions' / f'{slug}.md'
        overloads = info.get('overloads', [])
        doc = overloads[0].get('documentation', '') if overloads else info.get('summary', '')

        lines = []
        lines.append('---')
        lines.append(f'title: {name} — Opteryx Function')
        lines.append(f'description: {doc}')
        lines.append('---\n')
        lines.append(f'# {name}\n')
        if doc:
            lines.append(doc + '\n')

        if overloads and overloads[0].get('category'):
            lines.append(f"**Category:** {overloads[0]['category']}\n")

        lines.append('## Syntax\n')
        for ov in overloads:
            lines.append('```')
            lines.append(ov.get('label', ''))
            lines.append('```\n')

        # arguments
        args = []
        for ov in overloads:
            for param in ov.get('parameters', []):
                label = param.get('label')
                if label and not any(a[0] == label for a in args):
                    args.append((label, param.get('type',''), param.get('documentation',''), param.get('optional', False), param.get('constant_only', False), param.get('variadic', False)))

        if args:
            lines.append('## Arguments\n')
            for label, typ, doc_str, optional, constant, variadic in args:
                flags = []
                if optional:
                    flags.append('optional')
                if constant:
                    flags.append('constant')
                if variadic:
                    flags.append('variadic')
                flag_text = f" [{' | '.join(flags)}]" if flags else ''
                typ_text = f'`{typ}`' if typ else ''
                if typ_text:
                    lines.append(f'- **{label}** {typ_text}{flag_text}')
                else:
                    lines.append(f'- **{label}**{flag_text}')
                if doc_str:
                    lines.append(f'    {doc_str}')
            lines.append('')

        # returns
        returns = []
        for ov in overloads:
            ret = ov.get('returns') or {}
            rtype = ret.get('type') or ov.get('return_type','')
            rdoc = ret.get('documentation','')
            if rtype:
                pair = (rtype, rdoc)
            elif rdoc:
                pair = (None, rdoc)
            else:
                continue
            if pair not in returns:
                returns.append(pair)

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
        notes = []
        for ov in overloads:
            note = ov.get('notes')
            if note and note not in notes:
                notes.append(note)
        if notes:
            lines.append('## Usage Notes\n')
            for note in notes:
                lines.append(note)
            lines.append('')

        write_md(path, lines)


def build_operators_docs(ops_def: dict):
    # index grouped by category
    categories: dict[str, list[tuple[str,str]]] = {}
    for name, info in ops_def.items():
        category = info.get('category') or 'Other'
        summary = info.get('summary') or info.get('display_name','')
        categories.setdefault(category, []).append((name, summary))

    lines = [
        '---',
        'title: SQL Operators — Opteryx Reference',
        'description: Reference for SQL operators.',
        '---','',
        '# Operators','',
        'The following operators are supported by Opteryx.  Click a name for details.',''
    ]

    for category in sorted(categories.keys()):
        lines.append(f'## {category}\n')
        for name, summary in sorted(categories[category], key=lambda x: x[0]):
            slug = slugify(name)
            lines.append(f'- [{name}](operators/{slug}) — {summary}')
        lines.append('')

    write_md(REF_SQL_DIR / 'operators.md', lines)

    for name, info in ops_def.items():
        slug = slugify(name)
        path = REF_SQL_DIR / 'operators' / f'{slug}.md'
        display = info.get('display_name')
        token = info.get('token')
        category = info.get('category')
        sig_count = info.get('signature_count')
        left = info.get('left_types', [])
        right = info.get('right_types', [])
        result = info.get('result_types', [])
        signatures = info.get('signatures', [])

        lines = []
        lines.append('---')
        lines.append(f'title: {display or name} — Opteryx Operator')
        lines.append(f'description: {info.get("summary","") or ""}')
        lines.append('---\n')
        lines.append(f'# {display or name}\n')
        if category:
            lines.append(f'**Category:** {category}\n')
        if token:
            lines.append(f'**Token:** `{token}`\n')
        if sig_count is not None:
            lines.append(f'**Signatures:** {sig_count}\n')

        if signatures:
            lines.append('## Signatures\n')
            for sig in signatures:
                lt = sig.get('left_type')
                rt = sig.get('right_type')
                res = sig.get('result_type')
                if token and lt and rt:
                    lines.append(f'- `{lt} {token} {rt}` → {res or "<dynamic>"}')
                else:
                    lines.append(f'- {sig}')
            lines.append('')

        if left or right or result:
            lines.append('## Types\n')
            if left:
                lines.append(f'- **Left:** {", ".join(left)}')
            if right:
                lines.append(f'- **Right:** {", ".join(right)}')
            if result:
                lines.append(f'- **Result:** {", ".join(result)}')
            lines.append('')

        write_md(path, lines)


def build_types_docs(types_def: dict):
    # group by family
    families: dict[str, list[str]] = {}
    for name, info in types_def.items():
        family = info.get('family') or 'Other'
        families.setdefault(family, []).append(name)

    lines = [
        '---',
        'title: SQL Data Types — Opteryx Reference',
        'description: Reference for SQL data types supported by Opteryx.',
        '---','',
        '# Data Types','',
        'The following data types are supported by Opteryx.  Click a name for details.',''
    ]

    for family in sorted(families.keys()):
        lines.append(f'## {family}\n')
        for name in sorted(families[family]):
            slug = slugify(name)
            info = types_def[name]
            summary = info.get('canonical_name','')
            lines.append(f'- [{name}](types/{slug}) — {summary}')
        lines.append('')

    write_md(REF_SQL_DIR / 'data-types.md', lines)

    for name, info in types_def.items():
        slug = slugify(name)
        path = REF_SQL_DIR / 'types' / f'{slug}.md'

        lines = []
        lines.append('---')
        lines.append(f'title: {name} — Opteryx Type')
        lines.append(f'description: {info.get("canonical_name","")}')
        lines.append('---\n')
        lines.append(f'# {name}\n')

        canonical = info.get('canonical_name')
        if canonical:
            lines.append(f'**Canonical name:** {canonical}\n')

        aliases = info.get('aliases', [])
        if aliases:
            lines.append(f'**Aliases:** {", ".join(aliases)}\n')

        accepted = info.get('accepted_spellings', [])
        if accepted:
            lines.append(f'**Accepted spellings:** {", ".join(accepted)}\n')

        family = info.get('family')
        if family:
            lines.append(f'**Family:** {family}\n')

        flags = info.get('flags', {})
        if flags:
            lines.append('## Flags\n')
            for k, v in flags.items():
                lines.append(f'- **{k}**: `{v}`')
            lines.append('')

        param_forms = info.get('parameterized_forms', [])
        if param_forms:
            lines.append('## Parameterized Forms\n')
            for form in param_forms:
                lines.append(f'- `{form}`')
            lines.append('')

        ingestion = info.get('ingestion_mappings', {})
        if ingestion:
            lines.append('## Ingestion Mappings\n')
            for src, vals in ingestion.items():
                if vals:
                    lines.append(f'- **{src}**: {", ".join(vals)}')
            lines.append('')

        write_md(path, lines)


def update_nav():
    nav = load_json(NAV_PATH)

    # remove Engineering Blog if present
    nav = [s for s in nav if 'Engineering Blog' not in s]

    # ensure Reference section exists
    for section in nav:
        if 'Reference' in section:
            ref_section = section['Reference']
            break
    else:
        ref_section = []
        nav.append({'Reference': ref_section})

    # find or create SQL Language Reference block
    sql_block = None
    for item in ref_section:
        if 'SQL Language Reference' in item:
            sql_block = item['SQL Language Reference']
            break
    if sql_block is None:
        sql_block = []
        ref_section.append({'SQL Language Reference': sql_block})

    # ensure Functions/Operators/Types exist
    def ensure_section(name, href):
        for item in sql_block:
            if name in item:
                if isinstance(item[name], str):
                    item[name] = href
                return item
        new_item = {name: href}
        sql_block.append(new_item)
        return new_item

    ensure_section('Functions', {'href': 'reference/sql/functions.md'})
    ensure_section('Operators', {'href': 'reference/sql/operators.md'})
    ensure_section('Data Types', {'href': 'reference/sql/data-types.md'})

    # remove any stray 'Types' section that might be left over
    for item in list(sql_block):
        if 'Types' in item and isinstance(item['Types'], dict):
            sql_block.remove(item)

    # fix: remove Expressions accidentally nested under Statements
    for item in sql_block:
        if 'Statements' in item and isinstance(item['Statements'], dict):
            items = item['Statements'].get('items')
            if isinstance(items, list):
                item['Statements']['items'] = [sub for sub in items if not (isinstance(sub, dict) and 'Expressions' in sub)]

    NAV_PATH.write_text(json.dumps(nav, indent=2))


def main():
    functions_def = load_json(DEFS / 'functions.json')
    operators_def = load_json(DEFS / 'operators.json')
    types_def = load_json(DEFS / 'types.json')

    build_functions_docs(functions_def)
    build_operators_docs(operators_def)
    build_types_docs(types_def)
    update_nav()
    print('docs regenerated')


if __name__ == '__main__':
    main()
