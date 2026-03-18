import json
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent.parent
DEFS = ROOT / 'definitions'
DOCS = ROOT / 'docs-site'

NAV_PATH = DOCS / 'nav.json'
CONTENT_DIR = DOCS / 'content' / 'docs'
REF_SQL_DIR = CONTENT_DIR / 'reference' / 'sql'
REF_API_DIR = DOCS / 'reference' / 'api'
API_INDEX_PATH = CONTENT_DIR / 'reference' / 'api.md'

API_DOC_SPECS = {
    'api-opteryx-authenticate.json': {
        'slug': 'authentication-api',
        'title': 'Authentication API',
        'status': 'Published',
        'base_url': 'https://authenticate.opteryx.app',
        'summary': 'Authentication, OAuth 2.0, OpenID Connect discovery, JWKS publication, and client credential management.',
    },
    'api-opteryx-policy.json': {
        'slug': 'policy-api',
        'title': 'Policy API',
        'status': 'Published',
        'base_url': 'https://policy.opteryx.app',
        'summary': 'Workspace policy listing, inspection, creation, updates, and deletion for access-control management.',
    },
    'api-opteryx-upload.json': {
        'slug': 'upload-api',
        'title': 'Upload API',
        'status': 'Published',
        'base_url': 'https://upload.opteryx.app',
        'summary': 'Multipart upload sessions, part upload and deletion, session inspection, and commit flows for ingesting files into Opteryx.',
    },
}


def slugify(name: str) -> str:
    return re.sub(r'[^a-z0-9]+', '_', name.lower())


def load_json(path: pathlib.Path):
    return json.loads(path.read_text())


def write_md(path: pathlib.Path, lines: list[str]):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text('\n'.join(lines))


def _schema_to_type(schema: dict | None) -> str:
    if not schema:
        return 'object'

    ref = schema.get('$ref')
    if isinstance(ref, str):
        return ref.rsplit('/', 1)[-1]

    any_of = schema.get('anyOf')
    if isinstance(any_of, list) and any_of:
        options = []
        nullable = False
        for item in any_of:
            if item.get('type') == 'null':
                nullable = True
                continue
            options.append(_schema_to_type(item))

        if not options:
            return 'null'

        joined = ' | '.join(dict.fromkeys(options))
        return f'{joined} | null' if nullable else joined

    schema_type = schema.get('type')
    if schema_type == 'array':
        return f"array<{_schema_to_type(schema.get('items', {}))}>"
    if schema_type == 'object':
        return 'object'
    if schema_type:
        return str(schema_type)

    return 'object'


def _render_parameter_list(lines: list[str], heading: str, parameters: list[dict]):
    if not parameters:
        return

    lines.append(f'### {heading}\n')
    for param in parameters:
        name = param.get('name', 'parameter')
        required = 'required' if param.get('required') else 'optional'
        location = param.get('in', 'query')
        schema_type = _schema_to_type(param.get('schema', {}))
        description = param.get('description') or param.get('schema', {}).get('description') or ''

        lines.append(f'- **{name}** `{schema_type}` [{location}; {required}]')
        if description:
            lines.append(f'  {description}')
    lines.append('')


def _render_request_body(lines: list[str], request_body: dict, schemas: dict):
    if not request_body:
        return

    content = request_body.get('content', {}) or {}
    if not content:
        return

    lines.append('### Request Body\n')
    for content_type, content_info in content.items():
        schema = content_info.get('schema', {}) or {}
        lines.append(f'- **Content-Type:** `{content_type}`')
        lines.append(f'  Schema: `{_schema_to_type(schema)}`')

        ref = schema.get('$ref')
        if isinstance(ref, str):
            schema_name = ref.rsplit('/', 1)[-1]
            schema_def = schemas.get(schema_name, {})
            properties = schema_def.get('properties', {}) or {}
            required = set(schema_def.get('required', []))
            for field_name, field_schema in properties.items():
                required_text = 'required' if field_name in required else 'optional'
                field_type = _schema_to_type(field_schema)
                lines.append(f'  - **{field_name}** `{field_type}` [{required_text}]')
                field_description = field_schema.get('description')
                if field_description:
                    lines.append(f'    {field_description}')
        lines.append('')


def _render_responses(lines: list[str], responses: dict):
    if not responses:
        return

    lines.append('### Responses\n')
    for status_code, response in responses.items():
        description = response.get('description') or 'Response'
        content = response.get('content', {}) or {}

        rendered = []
        for content_type, content_info in content.items():
            rendered.append(f'`{content_type}` `{_schema_to_type(content_info.get("schema", {}))}`')

        if rendered:
            lines.append(f'- **{status_code}** — {description} ({", ".join(rendered)})')
        else:
            lines.append(f'- **{status_code}** — {description}')
    lines.append('')


def _sort_api_operations(spec: dict) -> list[tuple[str, str, dict]]:
    operations = []
    for route, methods in spec.get('paths', {}).items():
        for method, operation in methods.items():
            if method.lower() not in {'get', 'post', 'put', 'patch', 'delete'}:
                continue
            operations.append((route, method.upper(), operation))

    method_order = {'GET': 0, 'POST': 1, 'PUT': 2, 'PATCH': 3, 'DELETE': 4}
    return sorted(operations, key=lambda item: (item[0], method_order.get(item[1], 99), item[1]))


def _build_api_index(generated_specs: list[dict]):
    generated_by_slug = {spec['slug']: spec for spec in generated_specs}
    manual_specs = [
        {
            'slug': 'jobs-api',
            'title': 'Jobs API',
            'summary': 'Job submission, status tracking, and result retrieval.',
        },
    ]

    lines = [
        '# API Reference',
        '',
        'This section documents the HTTP APIs exposed by Opteryx services.',
        '',
        '## Generated from OpenAPI',
        '',
    ]

    for spec in sorted(generated_specs, key=lambda item: item['title'].lower()):
        lines.append(f"- [{spec['title']}](/docs/reference/api/{spec['slug']}) — {spec['summary']}")
    lines.append('')

    lines.append('## Additional API Docs')
    lines.append('')
    for spec in sorted(manual_specs, key=lambda item: item['title'].lower()):
        if spec['slug'] in generated_by_slug:
            continue
        lines.append(f"- [{spec['title']}](/docs/reference/api/{spec['slug']}) — {spec['summary']}")
    lines.append('')

    write_md(API_INDEX_PATH, lines)


def build_api_docs():
    generated_specs = []

    for def_name, doc_meta in API_DOC_SPECS.items():
        path = DEFS / def_name
        if not path.exists():
            continue

        spec = load_json(path)
        info = spec.get('info', {}) or {}
        schemas = spec.get('components', {}).get('schemas', {}) or {}
        output_path = REF_API_DIR / f"{doc_meta['slug']}.md"

        lines = [
            f"# {doc_meta['title']}",
            '',
            f"Base URL: {doc_meta['base_url']}",
            '',
            '## Overview',
            '',
            doc_meta.get('summary') or info.get('description') or f"Reference for {info.get('title', doc_meta['title'])}.",
            '',
            '## Endpoints',
            '',
            'Endpoint | Method | Summary',
            '--- | --- | ---',
        ]

        operations = _sort_api_operations(spec)
        for route, method, operation in operations:
            summary = operation.get('summary') or operation.get('operationId') or route
            lines.append(f'`{route}` | `{method}` | {summary}')
        lines.append('')

        for route, method, operation in operations:
            summary = operation.get('summary') or route
            description = operation.get('description') or ''
            tags = operation.get('tags') or []

            lines.append(f'## {summary}')
            lines.append('')
            lines.append(f'**Request:** `[{method}] {route}`')
            lines.append('')

            if tags:
                lines.append(f"**Tags:** {', '.join(tags)}")
                lines.append('')

            if description:
                lines.append(description)
                lines.append('')

            parameters = operation.get('parameters', []) or []
            path_parameters = [p for p in parameters if p.get('in') == 'path']
            query_parameters = [p for p in parameters if p.get('in') == 'query']
            header_parameters = [p for p in parameters if p.get('in') == 'header']

            _render_parameter_list(lines, 'Path Parameters', path_parameters)
            _render_parameter_list(lines, 'Query Parameters', query_parameters)
            _render_parameter_list(lines, 'Header Parameters', header_parameters)
            _render_request_body(lines, operation.get('requestBody') or {}, schemas)
            _render_responses(lines, operation.get('responses') or {})

        write_md(output_path, lines)
        generated_specs.append({**doc_meta, 'definition': def_name})

    _build_api_index(generated_specs)


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
                    args.append((label, param.get('type', ''), param.get('documentation', ''), param.get('optional', False), param.get('constant_only', False), param.get('variadic', False)))

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
            rtype = ret.get('type') or ov.get('return_type', '')
            rdoc = ret.get('documentation', '')
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


def _literal_for_type(type_name: str):
    """Return a (literal_sql, python_value) tuple for a given type.

    python_value may be None if evaluation is not supported.
    """
    t = type_name.lower()
    if t in ('integer', 'int'):
        return '1', 1
    if t in ('double', 'float', 'real'):
        return '1.5', 1.5
    if t == 'decimal':
        return '1.5', 1.5
    if t in ('varchar', 'string', 'text'):
        return "'a'", 'a'
    if t == 'boolean':
        return 'TRUE', True
    if t == 'date':
        return "DATE '2024-01-01'", None
    if t == 'timestamp':
        return "TIMESTAMP '2024-01-01 00:00:00'", None
    if t == 'time':
        return "TIME '00:00:00'", None
    if t == 'interval':
        return "INTERVAL '1' DAY", None
    if t == 'array':
        return 'ARRAY[1,2]', [1, 2]
    if t in ('jsonb', 'struct'):
        # Use a simple JSON object so examples demonstrate JSON extraction.
        return "'{\"index\": 1}'", {'index': 1}
    if t == 'blob':
        return "b'0102'", None
    if t == 'null':
        return 'NULL', None
    # fallback
    return 'NULL', None


def _format_expected_result(val):
    """Return an SQL-friendly string for an expected result."""
    if val is None:
        return 'NULL'
    if isinstance(val, bool):
        return 'TRUE' if val else 'FALSE'
    if isinstance(val, str):
        return f"'{val}'"
    if isinstance(val, (int, float)):
        return str(val)
    if isinstance(val, list):
        return 'ARRAY[' + ', '.join(str(x) for x in val) + ']'
    if isinstance(val, dict):
        # Represent JSON-like dicts as JSON string
        return f"'{json.dumps(val)}'"
    return str(val)


def _pick_example_signature(sql_symbol: str, signatures: list[dict]):
    """Pick the most sensible signature to use for an example.

    Prefer common scalar types (integer, boolean, varchar, double) over
    more exotic ones (blob, array, struct).

    Special-case JSON accessors so examples use a JSON object and a string key/path."""

    if sql_symbol in ('->', '->>'):
        for sig in signatures:
            if sig.get('left_type') in ('jsonb', 'struct') and sig.get('right_type') == 'varchar':
                return sig
        for sig in signatures:
            if sig.get('left_type') in ('jsonb', 'struct'):
                return sig

    if sql_symbol == '@?':
        for sig in signatures:
            if sig.get('left_type') in ('jsonb', 'struct') and sig.get('right_type') == 'varchar':
                return sig
        for sig in signatures:
            if sig.get('left_type') in ('jsonb', 'struct'):
                return sig

    preferred = {'integer', 'boolean', 'varchar', 'double', 'decimal', 'date', 'timestamp'}
    for sig in signatures:
        lt = sig.get('left_type')
        rt = sig.get('right_type')
        if lt in preferred and rt in preferred:
            return sig

    # fallback: first signature
    return signatures[0] if signatures else None


def _compute_expected_result(sql_symbol: str, left_val, right_val):
    """Try to compute an expected result for common SQL operators."""
    if left_val is None or right_val is None:
        return None

    try:
        sym = sql_symbol.strip().upper()
        if sym in ('+', '-', '*', '/', '%'):
            return eval(f'{left_val}{sym}{right_val}')
        if sym in ('=', '=='):
            return left_val == right_val
        if sym in ('<>', '!='):
            return left_val != right_val
        if sym == '<':
            return left_val < right_val
        if sym == '<=':
            return left_val <= right_val
        if sym == '>':
            return left_val > right_val
        if sym == '>=':
            return left_val >= right_val
        if sym == 'AND':
            return bool(left_val and right_val)
        if sym == 'OR':
            return bool(left_val or right_val)
        if sym == '||':
            return str(left_val) + str(right_val)
        if sym == '@>':
            # array contains all
            return all(x in left_val for x in right_val)
        if sym == '<@':
            # array contained by
            return all(x in right_val for x in left_val)
        if sym == '->':
            # simple json extract by key
            if isinstance(left_val, dict) and isinstance(right_val, str):
                return left_val.get(right_val)
        if sym == 'IN':
            return left_val in right_val
    except Exception:
        return None

    return None

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
        # node_kind is not surfaced in docs (too internal)
        category = info.get('category')
        description = info.get('description')
        documentation = info.get('documentation')
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
        if sql_symbol:
            lines.append(f'**SQL symbol:** `{sql_symbol}`\n')

        # Example usage
        if sql_symbol and signatures:
            sig = _pick_example_signature(sql_symbol, signatures)
            if sig:
                lt = sig.get('left_type')
                rt = sig.get('right_type')
                if lt and rt:
                    left_sql, left_val = _literal_for_type(lt)
                    right_sql, right_val = _literal_for_type(rt)

                    # For JSON extraction, use a realistic key string rather than a generic varchar.
                    if sql_symbol in ('->', '->>') and rt == 'varchar':
                        right_sql, right_val = "'index'", 'index'

                    # For JSON path existence, use a simple JSONPath expression.
                    if sql_symbol == '@?' and rt == 'varchar':
                        right_sql, right_val = "'$.index'", '$.index'

                    expected = _compute_expected_result(sql_symbol, left_val, right_val)
                    expected_comment = ''
                    if expected is not None:
                        expected_comment = f' -- expected: {_format_expected_result(expected)}'

                    # Special-case non-infix operators (like map/array indexing)
                    if sql_symbol == '[]':
                        example_expr = f'{left_sql}[{right_sql}]'
                    else:
                        example_expr = f'{left_sql} {sql_symbol} {right_sql}'

                    lines.append('## Example\n')
                    lines.append('```sql')
                    lines.append(f'SELECT {example_expr};{expected_comment}')
                    lines.append('```\n')

        # Dynamic result explanation
        if has_dynamic_result:
            lines.append('**Dynamic result:** yes\n')

        if signatures:
            lines.append('## Signatures\n')
            for sig in signatures:
                lt = sig.get('left_type')
                rt = sig.get('right_type')
                res = sig.get('result_type')
                dyn = sig.get('result_type_is_dynamic')

                # Prefer readable formatting for subscript access (`[]`)
                if sql_symbol == '[]' and lt and rt:
                    sig_line = f'`{lt}[{rt}]`'
                elif sql_symbol and lt and rt:
                    sig_line = f'`{lt} {sql_symbol} {rt}`'
                else:
                    sig_line = str(sig)

                if res is not None:
                    sig_line += f' → {res}'
                elif dyn:
                    sig_line += ' → dynamic'

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
    # Categorize types by family so the generated page has a structured TOC.
    lines = [
        '---',
        'title: SQL Data Types — Opteryx Reference',
        'description: Reference for SQL data types supported by Opteryx.',
        '---','',
        '# Data Types','',
        'The following data types are supported by Opteryx.  Click a name for details.',''
    ]

    # Group types by their "family" metadata field to create distinct sections
    groups: dict[str, list[tuple[str, dict]]] = {}
    for name, info in types_def.items():
        family = info.get('family') or 'other'
        groups.setdefault(family, []).append((name, info))

    # Display order for families/categories
    family_order = [
        'numeric',
        'temporal',
        'interval',
        'text',
        'binary',
        'boolean',
        'nested',
        'vector',
        'null',
        'other',
    ]

    family_titles = {
        'numeric': 'Numeric types',
        'temporal': 'Temporal types',
        'interval': 'Interval types',
        'text': 'Text types',
        'binary': 'Binary types',
        'boolean': 'Boolean types',
        'nested': 'Collection types',
        'vector': 'Vector types',
        'null': 'Null type',
        'other': 'Other types',
    }

    for family in family_order:
        items = groups.get(family)
        if not items:
            continue

        lines.append(f'## {family_titles.get(family, family.title())}\n')

        for name, info in sorted(items, key=lambda x: x[0]):
            slug = slugify(name)
            summary = info.get('canonical_name', '')
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

        # Sort nav entries alphabetically by their visible title, not by the internal key.
        items = []
        for name, info in entries.items():
            slug = slugify(name)
            title = title_fn(name, info)
            items.append((title, slug))
        items.sort(key=lambda x: x[0].lower())

        node['items'] = [{title: f'{prefix}/{slug}.md'} for title, slug in items]

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
    build_api_docs()
    update_nav(functions_def, operators_def, types_def)
    print('docs regenerated')


if __name__ == '__main__':
    main()
