from pathlib import Path

path = Path(__file__).with_name('update_docs_from_definitions.py')
text = path.read_text()

constants_block = """REF_API_DIR = DOCS / 'reference' / 'api'
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
        'base_url': 'https://control.opteryx.app',
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

"""

api_helpers_block = """
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
            'slug': 'authorization-api',
            'title': 'Authorization API',
            'summary': 'Authorization decisions and resource-access evaluation.',
        },
        {
            'slug': 'jobs-api',
            'title': 'Jobs API',
            'summary': 'Job submission, status tracking, and result retrieval.',
        },
        {
            'slug': 'metadata-api',
            'title': 'Metadata API',
            'summary': 'Dataset and schema discovery endpoints.',
        },
        {
            'slug': 'odata-api',
            'title': 'OData API',
            'summary': 'OData-compatible access to Opteryx datasets.',
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
        spec_path = DEFS / def_name
        if not spec_path.exists():
            continue

        spec = load_json(spec_path)
        info = spec.get('info', {}) or {}
        schemas = spec.get('components', {}).get('schemas', {}) or {}
        output_path = REF_API_DIR / f"{doc_meta['slug']}.md"

        lines = [
            f"# {doc_meta['title']}",
            '',
            f"**Status:** {doc_meta['status']}",
            '',
            f"Base URL: {doc_meta['base_url']}",
            '',
            '## Overview',
            '',
            doc_meta.get('summary') or info.get('description') or f"Reference for {info.get('title', doc_meta['title'])}.",
            '',
            f"Generated from `definitions/{def_name}`.",
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

"""

if "REF_API_DIR = DOCS / 'reference' / 'api'" not in text:
    text = text.replace(
        "REF_SQL_DIR = CONTENT_DIR / 'reference' / 'sql'\n\n",
        "REF_SQL_DIR = CONTENT_DIR / 'reference' / 'sql'\n" + constants_block,
        1,
    )

if 'def _schema_to_type(' not in text:
    text = text.replace('def build_functions_docs(functions_def: dict):\n', api_helpers_block + 'def build_functions_docs(functions_def: dict):\n', 1)

if 'build_api_docs()' not in text:
    text = text.replace(
        "    build_types_docs(types_def)\n    update_nav(functions_def, operators_def, types_def)\n",
        "    build_types_docs(types_def)\n    build_api_docs()\n    update_nav(functions_def, operators_def, types_def)\n",
        1,
    )

path.write_text(text)
print(f'updated {path}')
