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
    categories: dict[str, list[tuple[str, dict]]] = {}
    for name, info in ops_def.items():
        category = info.get('category') or 'Other'
        categories.setdefault(category, []).append((name, info))

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
        for name, info in sorted(categories[category], key=lambda x: x[0]):
            slug = slugify(name)
            display = info.get('friendly_name') or name
            sql_symbol = info.get('sql_symbol') or info.get('token')
            label = f"{display} `{sql_symbol}`" if sql_symbol else display
            lines.append(f'- [{label}](operators/{slug})')
        lines.append('')

    write_md(REF_SQL_DIR / 'operators.md', lines)

    for name, info in ops_def.items():
        slug = slugify(name)
        path = REF_SQL_DIR / 'operators' / f'{slug}.md'
        display = info.get('friendly_name') or info.get('display_name') or name
        sql_symbol = info.get('sql_symbol') or info.get('token')
        ast_symbol = info.get('ast_symbol')
        node_kind = info.get('node_kind')
        category = info.get('category')
        description = info.get('description')
        documentation = info.get('documentation')
        sig_count = info.get('signature_count')
        has_dynamic_result = info.get('has_dynamic_result')
        left = info.get('left_types', [])
        right = info.get('right_types', [])
        result = info.get('result_types', [])
        signatures = info.get('signatures', [])

        lines = []
        lines.append('---')
        lines.append(f'title: {display} — Opteryx Operator')
        desc = (documentation or description or '').strip()
        if sql_symbol:
            desc = ((desc + ' ').strip() + f' Symbol: {sql_symbol}').strip()
        lines.append(f'description: {desc}')
        lines.append('---\n')
        lines.append(f'# {display}\n')

        if description:
            lines.append(description + '\n')
        if documentation:
            lines.append(documentation + '\n')

        if category:
            lines.append(f'**Category:** {category}\n')
        if node_kind:
            lines.append(f'**Node kind:** {node_kind}\n')
        if sql_symbol:
            lines.append(f'**SQL symbol:** `{sql_symbol}`\n')

        # Example usage
        if sql_symbol and signatures:
            first = signatures[0]
            lt = first.get('left_type')
            rt = first.get('right_type')
            if lt and rt:
                lines.append('## Example\n')
                lines.append('```sql')
                lines.append(f'SELECT col1 {sql_symbol} col2 FROM table;')
                lines.append('```\n')

        # Dynamic result explanation
        if sig_count is not None:
            lines.append(f'**Signatures:** {sig_count}\n')

        if signatures:
            lines.append('## Signatures\n')
            for sig in signatures:
                lt = sig.get('left_type')
                rt = sig.get('right_type')
                res = sig.get('result_type')
                cost = sig.get('cost_estimate')
                dyn = sig.get('result_type_is_dynamic')

                sig_line = ''
                if sql_symbol and lt and rt:
                    sig_line = f'`{lt} {sql_symbol} {rt}`'
                else:
                    sig_line = str(sig)


                if res is not None:
                    sig_line += f' → {res}'

                lines.append(f'- {sig_line}')
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

        notes = info.get('notes')
        if notes:
            lines.append('## Notes\n')
            lines.append(notes)
            lines.append('')

        write_md(path, lines)


def build_types_docs(types_def: dict):
    # flat list of types (no categorization)
    lines = [
        '---',
        'title: SQL Data Types — Opteryx Reference',
        'description: Reference for SQL data types supported by Opteryx.',
        '---','',
        '# Data Types','',
        'The following data types are supported by Opteryx.  Click a name for details.',''
    ]

    for name in sorted(types_def.keys()):
        slug = slugify(name)
        info = types_def[name]
        summary = info.get('canonical_name','')
        lines.append(f'- [{summary or name}](types/{slug}) — {summary}')
    lines.append('')

    write_md(REF_SQL_DIR / 'data-types.md', lines)

    for name, info in types_def.items():
        slug = slugify(name)
        path = REF_SQL_DIR / 'types' / f'{slug}.md'

        lines = []
        canonical = info.get('canonical_name')
        title_text = canonical or name.upper()

        lines.append('---')
        lines.append(f'title: {title_text} — Opteryx Type')
        lines.append(f'description: {canonical or name}')
        lines.append('---\n')
        lines.append(f'# {title_text}\n')

        metadata = info.get('metadata', {}) or {}
        description = metadata.get('description')
        if description:
            lines.append(description + '\n')

        example = metadata.get('example')
        if example is not None:
            lines.append('## Example\n')
            lines.append('```')
            lines.append(str(example))
            lines.append('```\n')

        min_value = metadata.get('min')
        max_value = metadata.get('max')
        if min_value is not None or max_value is not None:
            lines.append('## Range\n')
            if min_value is not None:
                lines.append(f'- **Min:** `{min_value}`')
            if max_value is not None:
                lines.append(f'- **Max:** `{max_value}`')
            lines.append('')

        notes = metadata.get('notes')
        if notes:
            lines.append('## Notes\n')
            lines.append(notes)
            lines.append('')

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


def update_nav(functions_def: dict, operators_def: dict, types_def: dict):
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

    functions_item = ensure_section('Functions', {'href': 'reference/sql/functions.md'})
    operators_item = ensure_section('Operators', {'href': 'reference/sql/operators.md'})
    types_item = ensure_section('Data Types', {'href': 'reference/sql/data-types.md'})

    # populate nav items for functions/operators/types so the sidebar can expand when viewing specific entries
    def populate_nav_items(item: dict, prefix: str, entries: dict, title_fn):
        if not isinstance(item.get(list(item.keys())[0]), dict):
            return
        key = list(item.keys())[0]
        node = item[key]
        if not isinstance(node, dict):
            return
        items = []
        for name in sorted(entries.keys()):
            slug = slugify(name)
            title = title_fn(name, entries[name])
            items.append({title: f'{prefix}/{slug}.md'})
        node['items'] = items

    populate_nav_items(functions_item, 'reference/sql/functions', functions_def, lambda name, _: name)
    populate_nav_items(operators_item, 'reference/sql/operators', operators_def, lambda name, info: info.get('friendly_name') or info.get('display_name') or name)
    populate_nav_items(types_item, 'reference/sql/types', types_def, lambda name, info: info.get('canonical_name') or name.upper())

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
    update_nav(functions_def, operators_def, types_def)
    print('docs regenerated')


if __name__ == '__main__':
    main()
