import json
import pathlib
import re

from collections import Counter
from html import escape
from typing import Any, Dict, List, Optional, Tuple

ROOT = pathlib.Path(__file__).resolve().parent.parent
DEFS = ROOT / 'definitions'
DOCS = ROOT / 'docs-site'

NAV_PATH = DOCS / 'nav.json'
CONTENT_DIR = DOCS / 'content' / 'docs'
REF_SQL_DIR = DOCS / 'reference' / 'sql'
REF_API_DIR = DOCS / 'reference' / 'api'
API_INDEX_PATH = DOCS / 'reference' / 'sql' / 'api.md'

API_DOC_SPECS = {
    'api-opteryx-billing.json': {
        'slug': 'billing-api',
        'title': 'Billing API',
        'status': 'Published',
        'base_url': 'https://billing.opteryx.app',
        'summary': 'Billing account and membership management, payment methods and charges, and workspace lifecycle (creation, deletion, locking).',
        'try_it_live': True,
    },
    'api-opteryx-authenticate.json': {
        'has_flow': True,
        'slug': 'authentication-api',
        'title': 'Authentication API',
        'status': 'Published',
        'base_url': 'https://authenticate.opteryx.app',
        'summary': 'Authentication, OAuth 2.0, OpenID Connect discovery, JWKS publication, and client credential management.',
        'try_it_live': True,
    },
    'api-opteryx-jobs.json': {
        'has_flow': True,
        'slug': 'jobs-api',
        'title': 'Jobs API',
        'status': 'Published',
        'base_url': 'https://jobs.opteryx.app',
        'summary': 'Job submission, execution status tracking, result retrieval, recent-query listing, and edit-time statement checking.',
        'try_it_live': True,
    },
    'api-opteryx-odata.json': {
        'slug': 'odata-api',
        'title': 'OData API',
        'status': 'Published',
        'base_url': 'https://odata.opteryx.app',
        'summary': 'OData service discovery, metadata, and dataset query endpoints for compatible clients and BI tools.',
    },
    'api-opteryx-policy.json': {
        'slug': 'policy-api',
        'title': 'Policy API',
        'status': 'Published',
        'base_url': 'https://policy.opteryx.app',
        'summary': 'Workspace policy listing, inspection, creation, updates, and deletion for access-control management.',
        'try_it_live': True,
    },
    'api-opteryx-upload.json': {
        'has_flow': True,
        'slug': 'upload-api',
        'title': 'Upload API',
        'status': 'Published',
        'base_url': 'https://upload.opteryx.app',
        'summary': 'Multipart upload sessions, part upload and deletion, session inspection, and commit flows for ingesting files into Opteryx.',
        'try_it_live': True,
    },
}

# The service that issues the bearer tokens every other API expects. "Try it live"
# cards link here rather than naming an endpoint, so the token instructions live in
# one place and the link can't rot if the slug changes.
AUTH_DEFINITION = 'api-opteryx-authenticate.json'

API_MANUAL_DOC_SPECS = [
    {
        'slug': 'jobs-api',
        'title': 'Jobs API',
        'summary': 'Job submission, status tracking, and result retrieval.',
    },
]


def slugify(name: str) -> str:
    return re.sub(r'[^a-z0-9]+', '_', name.lower())


def load_json(path: pathlib.Path):
    return json.loads(path.read_text())


def write_md(path: pathlib.Path, lines: List[str]):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text('\n'.join(lines))


def _schema_to_type(schema: Optional[Dict[str, Any]]) -> str:
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


def _resolve_schema(schema: Optional[Dict[str, Any]], schemas: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    if not schema:
        return {}

    ref = schema.get('$ref')
    if isinstance(ref, str) and schemas is not None:
        schema_name = ref.rsplit('/', 1)[-1]
        resolved = schemas.get(schema_name)
        if isinstance(resolved, dict):
            return resolved

    return schema


def _schema_allowed_values(schema: Optional[Dict[str, Any]], schemas: Optional[Dict[str, Any]] = None) -> List[str]:
    resolved = _resolve_schema(schema, schemas)

    enum_values = resolved.get('enum')
    if isinstance(enum_values, list):
        return [json.dumps(value) if not isinstance(value, str) else value for value in enum_values]

    if 'const' in resolved:
        value = resolved['const']
        return [json.dumps(value) if not isinstance(value, str) else value]

    any_of = resolved.get('anyOf')
    if isinstance(any_of, list):
        collected = []
        for item in any_of:
            collected.extend(_schema_allowed_values(item, schemas))
        # preserve order while removing duplicates
        return list(dict.fromkeys(collected))

    return []


def _format_schema_value(value) -> str:
    if isinstance(value, str):
        return value
    return json.dumps(value)


def _schema_default_value(schema: Optional[Dict[str, Any]], schemas: Optional[Dict[str, Any]] = None) -> Optional[str]:
    resolved = _resolve_schema(schema, schemas)

    if 'default' in resolved:
        return _format_schema_value(resolved['default'])

    any_of = resolved.get('anyOf')
    if isinstance(any_of, list):
        for item in any_of:
            default = _schema_default_value(item, schemas)
            if default is not None:
                return default

    return None


def _render_parameter_list(lines: List[str], heading: str, parameters: List[Dict[str, Any]]):
    if not parameters:
        return

    lines.append(f'### {heading}\n')
    for param in parameters:
        name = param.get('name', 'parameter')
        required = 'required' if param.get('required') else 'optional'
        location = param.get('in', 'query')
        schema_type = _schema_to_type(param.get('schema', {}))
        description = param.get('description') or param.get('schema', {}).get('description') or ''
        allowed_values = _schema_allowed_values(param.get('schema', {}))
        default_value = _schema_default_value(param.get('schema', {}))

        lines.append(f'- **{name}** `{schema_type}` [{location}; {required}]')
        if description:
            lines.append(f'  {description}')
        if allowed_values:
            lines.append(f"  Allowed values: {', '.join(f'`{value}`' for value in allowed_values)}")
        if default_value is not None:
            lines.append(f"  Default: `{default_value}`")
    lines.append('')


def _render_request_body(lines: List[str], request_body: Dict[str, Any], schemas: Dict[str, Any]):
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
                allowed_values = _schema_allowed_values(field_schema, schemas)
                default_value = _schema_default_value(field_schema, schemas)
                lines.append(f'  - **{field_name}** `{field_type}` [{required_text}]')
                field_description = field_schema.get('description')
                if field_description:
                    lines.append(f'    {field_description}')
                if allowed_values:
                    lines.append(f"    Allowed values: {', '.join(f'`{value}`' for value in allowed_values)}")
                if default_value is not None:
                    lines.append(f"    Default: `{default_value}`")
        lines.append('')


def _render_responses(lines: List[str], responses: Dict[str, Any]):
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


def _auth_docs_path() -> str:
    """Docs path for the service that issues bearer tokens."""
    return f"/docs/reference/api/{API_DOC_SPECS[AUTH_DEFINITION]['slug']}"


# Field names whose values are credentials. These render masked, and the
# generated cURL/Python snippets emit a placeholder instead of the real value —
# a copied snippet must never carry a live secret.
SECRET_FIELD_HINTS = ('secret', 'password', 'passwd', 'token', 'credential', 'key')


def _is_secret_field(name: str) -> bool:
    lowered = name.lower()
    return any(hint in lowered for hint in SECRET_FIELD_HINTS)


# Methods that remove or replace existing state. Cards for these require an
# explicit typed confirmation before they will fire against the live platform.
DESTRUCTIVE_METHODS = ('DELETE', 'PUT')


def _is_destructive(method: str) -> bool:
    return method.upper() in DESTRUCTIVE_METHODS


def _takes_bearer_token(operation: Dict[str, Any]) -> bool:
    """Whether the operation declares an `authorization` header parameter.

    The token-issuing endpoint does not take one — showing it a bearer field
    would tell the reader to supply the very thing they are there to obtain.
    """
    for param in operation.get('parameters', []) or []:
        if param.get('in') == 'header' and param.get('name', '').lower() == 'authorization':
            return True
    return False


def _request_body_content(operation: Dict[str, Any]) -> Tuple[Optional[str], Dict[str, Any]]:
    """Return (content_type, media_object) for a body this widget can drive."""
    content = (operation.get('requestBody') or {}).get('content') or {}
    for content_type in ('application/json', 'application/x-www-form-urlencoded'):
        if content_type in content:
            return content_type, content[content_type]
    return None, {}


def _placeholder_value(schema: Dict[str, Any], schemas: Dict[str, Any]) -> Any:
    """A type-appropriate empty value for a field with no declared default."""
    any_of = schema.get('anyOf')
    if isinstance(any_of, list):
        for item in any_of:
            if item.get('type') != 'null':
                return _placeholder_value(_resolve_schema(item, schemas), schemas)
        return None

    schema_type = schema.get('type')
    if schema_type == 'array':
        return []
    if schema_type == 'object':
        return {}
    if schema_type == 'boolean':
        return False
    if schema_type in ('integer', 'number'):
        return 0
    if schema_type == 'string':
        return ''
    return None


def _example_request_body(operation: Dict[str, Any], schemas: Dict[str, Any]) -> Optional[str]:
    """Return a pretty-printed JSON example for an operation's request body.

    Uses the spec's own `example` when present, otherwise synthesizes one from
    the schema's required fields so the editor is never handed an empty box.
    """
    content_type, content = _request_body_content(operation)
    if content_type != 'application/json':
        return None

    if 'example' in content:
        return json.dumps(content['example'], indent=2)

    schema = _resolve_schema(content.get('schema', {}), schemas)
    properties = schema.get('properties', {}) or {}
    if not properties:
        return '{}'

    # Every declared field, not just the required ones — an editor prefilled with
    # `{}` tells the reader nothing about what the endpoint accepts. Declared
    # defaults are used verbatim so the example matches the schema exactly.
    placeholder = {}
    for field, field_schema in properties.items():
        resolved = _resolve_schema(field_schema, schemas)
        if 'default' in resolved:
            placeholder[field] = resolved['default']
        else:
            placeholder[field] = _placeholder_value(resolved, schemas)

    return json.dumps(placeholder, indent=2)


def _render_try_it_live(
    lines: List[str],
    method: str,
    route: str,
    operation: Dict[str, Any],
    schemas: Dict[str, Any],
    base_url: str,
):
    """Emit a 'Try it live' card for one operation.

    The markup is plain HTML embedded in the markdown (marked passes it through);
    docs-site/public/api-tryit.js hydrates it in the browser. Everything the card
    needs is read off the OpenAPI operation, so it cannot drift from the spec.
    """
    parameters = operation.get('parameters', []) or []
    path_params = [p for p in parameters if p.get('in') == 'path']
    query_params = [p for p in parameters if p.get('in') == 'query']
    example_body = _example_request_body(operation, schemas)
    body_type, body_content = _request_body_content(operation)
    is_form = body_type == 'application/x-www-form-urlencoded'
    needs_token = _takes_bearer_token(operation)

    lines.append('### Try it live\n')

    # <details>/<summary> so the card is collapsed by default and the toggle works
    # natively — keyboard accessible, and correct even before the JS has loaded.
    auth_docs = _auth_docs_path()
    lines.append(
        f'<details class="api-tryit" data-method="{method}" '
        f'data-base="{base_url}" data-path="{route}" data-auth-docs="{auth_docs}"'
        + (' data-body-type="form"' if is_form else '')
        + (' data-destructive="1"' if _is_destructive(method) else '')
        + '>'
    )
    lines.append('  <summary class="api-tryit__bar">')
    lines.append(f'    <span class="t-verb t-verb--{method.lower()}">{method.lower()}</span>')
    # Rendered here rather than left for the JS to fill in — the endpoint must be
    # readable even if the script is slow, blocked, or never runs. The hydrator
    # only rewrites this when a path or query value actually changes.
    lines.append(
        f'    <span class="t-url"><span class="t-host">{base_url}</span>{route}</span>'
    )
    lines.append('    <span class="t-open"></span>')
    lines.append('  </summary>')
    lines.append('  <div class="api-tryit__body">')

    # Only where the operation actually declares an authorization header. The
    # token-issuing endpoint does not, and must not ask for what it hands out.
    if needs_token:
        lines.append('    <div class="t-field">')
        lines.append(
            '      <div class="t-label">Bearer token <span class="t-opt">required</span></div>'
        )
        lines.append(
            '      <input type="password" class="t-token" autocomplete="off" '
            'placeholder="paste a token from the Authentication API">'
        )
        lines.append(
            '      <div class="t-hint">Held in this tab only — never stored or logged. '
            f'See the <a href="{auth_docs}">Authentication API</a> for how to get one.</div>'
        )
        lines.append('    </div>')

    for heading, params, css_class in (
        ('Path parameters', path_params, 't-path'),
        ('Query parameters', query_params, 't-query'),
    ):
        if not params:
            continue
        lines.append('    <div class="t-field">')
        lines.append(f'      <div class="t-label">{heading}</div>')
        lines.append('      <div class="t-params">')
        for param in params:
            name = param.get('name', '')
            required = 'required' if param.get('required') else 'optional'
            param_type = _schema_to_type(param.get('schema', {}))
            default = _schema_default_value(param.get('schema', {}))
            lines.append(
                f'        <div class="t-pname">{name}<span>{param_type} · {required}</span></div>'
            )
            lines.append(
                f'        <input type="text" class="{css_class}" data-name="{name}"'
                + (f' value="{default}"' if default is not None else '')
                + f' placeholder="{param_type}">'
            )
        lines.append('      </div>')
        lines.append('    </div>')

    if is_form:
        # Form bodies get one field per property rather than a raw editor —
        # x-www-form-urlencoded is not something a reader should hand-assemble.
        form_schema = _resolve_schema(body_content.get('schema', {}), schemas)
        form_props = form_schema.get('properties', {}) or {}
        form_required = set(form_schema.get('required', []) or [])
        schema_name = _schema_to_type(body_content.get('schema', {}))

        lines.append('    <div class="t-field">')
        lines.append(
            '      <div class="t-label">Form body '
            f'<span class="t-opt">application/x-www-form-urlencoded · {schema_name}</span></div>'
        )
        lines.append('      <div class="t-params">')
        has_secret = False
        for name, field_schema in form_props.items():
            required = 'required' if name in form_required else 'optional'
            field_type = _schema_to_type(field_schema)
            default = _schema_default_value(field_schema, schemas)
            secret = _is_secret_field(name)
            has_secret = has_secret or secret
            lines.append(
                f'        <div class="t-pname">{name}<span>{field_type} · {required}</span></div>'
            )
            lines.append(
                f'        <input type="{"password" if secret else "text"}" class="t-form" '
                f'data-name="{name}"'
                + (' data-secret="1"' if secret else '')
                + (f' value="{default}"' if default is not None else '')
                + ' autocomplete="off"'
                + f' placeholder="{field_type}">'
            )
        lines.append('      </div>')
        if has_secret:
            lines.append(
                '      <div class="t-hint">Secret fields are sent only to the API — '
                'copied cURL and Python snippets carry a placeholder, never the value.</div>'
            )
        lines.append('    </div>')
    elif example_body is not None:
        schema_name = _schema_to_type(body_content.get('schema', {}))
        lines.append('    <div class="t-field">')
        lines.append(
            '      <div class="t-label">Request body '
            f'<span class="t-opt">application/json · {schema_name}</span></div>'
        )
        lines.append(f'      <textarea class="t-body" spellcheck="false">{example_body}</textarea>')
        lines.append('    </div>')

    lines.append('    <div class="t-actions">')
    lines.append('      <button type="button" class="t-btn t-send">Send request</button>')
    lines.append('      <button type="button" class="t-btn t-curl">Copy as cURL</button>')
    lines.append('      <button type="button" class="t-btn t-python">Copy as Python</button>')
    lines.append('    </div>')
    lines.append('  </div>')
    lines.append('  <div class="t-resp">')
    lines.append('    <div class="t-resp__bar">')
    lines.append('      <span class="t-pill"></span>')
    lines.append('      <span class="t-meta"></span>')
    lines.append('      <button type="button" class="t-btn t-copy-resp" hidden>Copy</button>')
    lines.append('    </div>')
    lines.append('    <pre class="t-pre"></pre>')
    lines.append('    <div class="t-note"></div>')
    lines.append('  </div>')
    lines.append('</details>')
    lines.append('')


# Call-sequence diagrams. The source service owns the *content* (which calls, in
# what order, what comes back); this repo owns how it looks. Services therefore
# emit structured steps under a top-level `x-flow`, never HTML — the api-flow
# markup below is meaningless without docs-site/app/globals.css, and baking it
# into a service repo would couple that repo to this site's stylesheet.
FLOW_EXTENSION = 'x-flow'


def _load_flow(spec: Dict[str, Any], doc_meta: Dict[str, Any], def_name: str) -> Optional[Dict[str, Any]]:
    """Read the service's own `x-flow`, and insist on it where one is expected.

    definitions/*.json are autogenerated exports, so a flow can only live in the
    service repo — anything written in here is destroyed by the next export,
    silently. `has_flow` records that a service *does* publish one, so an export
    that arrives without it fails the build instead of quietly dropping the
    diagram off the page, which is exactly how these went missing before.
    """
    flow = spec.get(FLOW_EXTENSION)

    if flow is None and doc_meta.get('has_flow'):
        raise SystemExit(
            f"{def_name}: expected a `{FLOW_EXTENSION}` block and found none — the service "
            f"publishes one from docs/api-flow.json, so this export is incomplete. "
            f"Re-export it, or drop 'has_flow' if the flow was retired on purpose."
        )

    return flow


def _flow_text(text: str) -> str:
    """Escape a flow label, turning `backticks` into <code> spans."""
    rendered = []
    for index, segment in enumerate(str(text).split('`')):
        escaped = escape(segment, quote=False)
        rendered.append(f'<code>{escaped}</code>' if index % 2 else escaped)
    # Written as real characters in the spec; emitted as entities so the markup
    # stays legible in the generated .md regardless of file encoding.
    return ''.join(rendered).replace('—', '&mdash;').replace('·', '&middot;')


def _render_flow_steps(lines: List[str], steps: List[Dict[str, Any]], indent: int, numbered: bool):
    """Render one <ol> of steps. Only the top level is numbered — steps inside a
    group are alternatives or repeats, so numbering them would imply an order
    they don't have."""
    pad = ' ' * indent
    counter = 0

    for step in steps:
        if 'group' in step:
            lines.append(f'{pad}<li class="api-flow__group" data-label="{escape(str(step["group"])).replace("—", "&mdash;")}">')
            lines.append(f'{pad}  <ol class="api-flow__steps">')
            _render_flow_steps(lines, step.get('steps', []), indent + 4, numbered=False)
            lines.append(f'{pad}  </ol>')
            if step.get('note'):
                lines.append(f'{pad}  <div class="api-flow__note">{_flow_text(step["note"])}</div>')
            lines.append(f'{pad}</li>')
            continue

        # Checked last: `note` also appears *alongside* a request as its
        # qualifier, so a bare note is only a note when nothing else is set.
        if 'request' in step:
            kind = 'req'
            label = f'<code>{escape(str(step["request"]), quote=False)}</code>'
            if step.get('note'):
                label += f' &mdash; {_flow_text(step["note"])}'
        elif 'response' in step:
            kind = 'res'
            label = escape(str(step['response']), quote=False)
            if step.get('returns'):
                label += f' &middot; {_flow_text(step["returns"])}'
        elif 'note' in step:
            lines.append(f'{pad}<li class="api-flow__note">{_flow_text(step["note"])}</li>')
            continue
        else:
            raise SystemExit(f'{FLOW_EXTENSION}: step has no request/response/group/note: {step!r}')

        lines.append(f'{pad}<li class="api-flow__step api-flow__step--{kind}">')
        if numbered:
            counter += 1
            lines.append(f'{pad}  <span class="api-flow__num">{counter}</span>')
        lines.append(f'{pad}  <span class="api-flow__label">{label}</span>')
        lines.append(f'{pad}</li>')


def _render_flow(flow: Dict[str, Any]) -> List[str]:
    actor_a, actor_b = flow['actors']

    lines = [f'## {flow["title"]}', '']
    if flow.get('intro'):
        lines += [flow['intro'], '']

    lines.append('<div class="api-flow">')
    lines.append('  <div class="api-flow__head">')
    lines.append(f'    <span class="api-flow__actor api-flow__actor--a">{escape(actor_a)}</span>')
    lines.append(f'    <span class="api-flow__actor api-flow__actor--b">{escape(actor_b)}</span>')
    lines.append('  </div>')
    lines.append('  <ol class="api-flow__steps">')
    _render_flow_steps(lines, flow.get('steps', []), 4, numbered=True)
    lines.append('  </ol>')
    lines.append('</div>')
    lines.append('')

    # Trailing prose stays markdown — it's rendered by the site's markdown
    # pipeline, not by the diagram CSS.
    for note in flow.get('notes', []) or []:
        lines.append(f'- {note}')

    return lines


def _flow_requests(steps: List[Dict[str, Any]]):
    for step in steps:
        if 'group' in step:
            yield from _flow_requests(step.get('steps', []))
        elif 'request' in step:
            yield step['request']


def _validate_flow(flow: Dict[str, Any], spec: Dict[str, Any], def_name: str):
    """Check every request in the flow names a route the spec actually declares.

    This is the payoff for carrying the flow as data rather than prose: if a
    service renames or drops an endpoint, the diagram fails the build instead of
    quietly describing a call that no longer exists.
    """
    # Placeholder names are normalised away: a diagram may call the job id
    # `{execution_id}` (the name the API hands back) where the route declares
    # `{identifier}`. Path shape and method still have to match exactly.
    def shape(route: str) -> str:
        return re.sub(r'\{[^}]*\}', '{}', route.split('?', 1)[0])

    declared = {
        (shape(route), method)
        for route, methods in (spec.get('paths', {}) or {}).items()
        for method in methods
    }
    unknown = [
        request
        for request in _flow_requests(flow.get('steps', []))
        if (shape(str(request).partition(' ')[2]), str(request).partition(' ')[0].lower()) not in declared
    ]

    if unknown:
        raise SystemExit(
            f"{def_name}: {FLOW_EXTENSION} references endpoints that are not in the spec: "
            f"{unknown} — the flow is out of date with the API."
        )


def _operation_summary(operation: Dict[str, Any], route: str) -> str:
    return operation.get('summary') or operation.get('operationId') or route


def _heading_slug(text: str) -> str:
    """Match docs-site/app/lib/renderMarkdown.ts::addHeadingIdsToHtml exactly.

    That function assigns the anchor id every h2/h3 gets at render time, purely
    from the heading's own text. The endpoint table needs to link to those same
    ids, so the slugging logic must stay byte-for-byte identical to the JS —
    diverge here and every link in the table silently 404s to nowhere.
    """
    slug = text.lower()
    slug = re.sub(r'[^\w\s-]', '', slug, flags=re.ASCII)
    slug = re.sub(r'\s+', '-', slug)
    slug = re.sub(r'-+', '-', slug)
    return slug.strip()


def _sort_api_operations(spec: Dict[str, Any]) -> List[Tuple[str, str, Dict[str, Any]]]:
    operations: List[Tuple[str, str, Dict[str, Any]]] = []
    for route, methods in spec.get('paths', {}).items():
        for method, operation in methods.items():
            if method.lower() not in {'get', 'post', 'put', 'patch', 'delete'}:
                continue
            operations.append((route, method.upper(), operation))

    method_order = {'GET': 0, 'POST': 1, 'PUT': 2, 'PATCH': 3, 'DELETE': 4}
    return sorted(operations, key=lambda item: (item[0], method_order.get(item[1], 99), item[1]))


def _get_available_api_docs(generated_specs: Optional[List[Dict[str, Any]]] = None) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
    generated: List[Dict[str, Any]] = []
    if generated_specs is not None:
        generated = sorted(generated_specs, key=lambda item: item['title'].lower())
    else:
        for def_name, meta in API_DOC_SPECS.items():
            if (DEFS / def_name).exists():
                generated.append(meta)
        generated.sort(key=lambda item: item['title'].lower())

    generated_by_slug = {spec['slug'] for spec in generated}
    manual = []
    for spec in API_MANUAL_DOC_SPECS:
        if spec['slug'] in generated_by_slug:
            continue
        if (REF_API_DIR / f"{spec['slug']}.md").exists():
            manual.append(spec)

    manual.sort(key=lambda item: item['title'].lower())
    return generated, manual


def _build_api_index(generated_specs: list[dict]):
    generated_specs, manual_specs = _get_available_api_docs(generated_specs)

    lines = [
        '# API Reference',
        '',
        'This section documents the HTTP APIs exposed by Opteryx services.',
        '',
        '## Generated from OpenAPI',
        '',
    ]

    for spec in generated_specs:
        lines.append(f"- [{spec['title']}](/docs/reference/api/{spec['slug']}) — {spec['summary']}")
    lines.append('')

    lines.append('## Additional API Docs')
    lines.append('')
    for spec in manual_specs:
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
        ]

        flow = _load_flow(spec, doc_meta, def_name)
        if flow:
            _validate_flow(flow, spec, def_name)
            lines.extend(_render_flow(flow))
            lines.append('')

        lines += [
            '## Endpoints',
            '',
            '<table class="endpoint-index">',
            '  <thead>',
            '    <tr><th>Service</th><th>Docs</th></tr>',
            '  </thead>',
            '  <tbody>',
        ]

        operations = _sort_api_operations(spec)

        # Slugs must be unique per page — the JS assigns ids by heading text
        # alone, so two operations sharing a summary would collide and the
        # table would jump to whichever one the browser resolves first.
        slug_counts = Counter(
            _heading_slug(_operation_summary(operation, route)) for route, _, operation in operations
        )
        collisions = {slug for slug, count in slug_counts.items() if count > 1}
        if collisions:
            raise SystemExit(
                f"{def_name}: duplicate operation summaries produce the same anchor "
                f"{sorted(collisions)} — give each a distinct 'summary' in the source."
            )

        for route, method, operation in operations:
            summary = _operation_summary(operation, route)
            slug = _heading_slug(summary)
            lines.append('    <tr>')
            lines.append(
                '      <td>'
                f'<span class="ep-name">{escape(summary)}</span>'
                f'<span class="ep-verb ep-verb--{method.lower()}">{method.lower()}</span>'
                f'<code>{escape(route)}</code>'
                '</td>'
            )
            lines.append(
                f'      <td class="ep-doc"><a href="#{slug}">View</a></td>'
            )
            lines.append('    </tr>')
        lines.append('  </tbody>')
        lines.append('</table>')
        lines.append('')

        for route, method, operation in operations:
            summary = _operation_summary(operation, route)
            description = operation.get('description') or ''
            tags = operation.get('tags') or []

            lines.append(f'## {summary}')
            lines.append('')
            lines.append(
                '**Request:** '
                f'<span class="ep-verb ep-verb--{method.lower()}">{method.lower()}</span>'
                f'<code>{escape(route)}</code>'
            )
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

            if doc_meta.get('try_it_live'):
                _render_try_it_live(lines, method, route, operation, schemas, doc_meta['base_url'])

        write_md(output_path, lines)
        generated_specs.append({**doc_meta, 'definition': def_name})

    _build_api_index(generated_specs)


def build_functions_docs(functions_def: Dict[str, Any]):
    # build index grouped by category
    categories: Dict[str, List[Tuple[str, str]]] = {}
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
        seen_labels: set = set()
        for ov in overloads:
            label = ov.get('label', '')
            if label in seen_labels:
                continue
            seen_labels.add(label)
            lines.append('```sql')
            lines.append(label)
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
    if t in ('varchar', 'string', 'text', 'nvarchar'):
        return "'a'", 'a'
    if t == 'boolean':
        return 'TRUE', True
    if t == 'date':
        return "'2024-01-01'::DATE", None
    if t == 'timestamp':
        return "'2024-01-01 00:00:00'::TIMESTAMP", None
    if t == 'time':
        return "'00:00:00'::TIME", None
    if t == 'interval':
        return "INTERVAL '1' DAY", None
    if t == 'array':
        return None, None
    if t in ('jsonb', 'nvarchar', 'variant'):
        return "'{\"index\": 1}'", {'index': 1}
    if t in ('blob', 'varbinary'):
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

def build_operators_docs(ops_def: Dict[str, Any]):
    # index grouped by category
    categories: Dict[str, List[Tuple[str, Dict[str, Any]]]] = {}
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
        lines.append(f'## {category.title()}\n')
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

        # Prefer documentation (longer form); fall back to description. Never show both.
        page_desc = documentation or description
        if page_desc:
            lines.append(page_desc + '\n')

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

                    if left_sql is not None and right_sql is not None:
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


def build_types_docs(types_def: Dict[str, Any]):
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
    groups: Dict[str, List[Tuple[str, Dict[str, Any]]]] = {}
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
            display = info.get('canonical_name') or name.upper()
            summary = (info.get('metadata') or {}).get('description') or display
            lines.append(f'- [{display}](types/{slug}) — {summary}')
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

        # Aliases / alternate names
        aliases = info.get('aliases') or []
        if aliases:
            alias_list = ', '.join(f'`{a.upper()}`' for a in sorted(aliases))
            lines.append(f'**Aliases:** {alias_list}\n')

        # Example literal
        example = metadata.get('example')
        if example is not None:
            lines.append('## Example\n')
            lines.append('```sql')
            lines.append(f'SELECT {example};')
            lines.append('```\n')

        # Range (numeric types)
        min_value = metadata.get('min')
        max_value = metadata.get('max')
        if min_value is not None or max_value is not None:
            lines.append('## Range\n')
            if min_value is not None:
                lines.append(f'- **Min:** `{min_value}`')
            if max_value is not None:
                lines.append(f'- **Max:** `{max_value}`')
            lines.append('')

        # Accepted string formats (temporal types)
        string_formats = metadata.get('string_formats') or []
        if string_formats:
            lines.append('## Accepted String Formats\n')
            lines.append('When casting a string to this type, the following formats are accepted:\n')
            lines.append('| Format | Example | Notes |')
            lines.append('|--------|---------|-------|')
            for fmt in string_formats:
                fmt_str = fmt.get('format', '')
                ex_str = f'`{fmt["example"]}`' if fmt.get('example') else ''
                note_str = fmt.get('note', '')
                lines.append(f'| `{fmt_str}` | {ex_str} | {note_str} |')
            lines.append('')

        # Casting to this type
        cast_to = metadata.get('cast_to') or []
        if cast_to:
            lines.append('## Casting\n')
            lines.append('| From | Example | Notes |')
            lines.append('|------|---------|-------|')
            for c in cast_to:
                from_str = c.get('type', '')
                ex_str = f'`{c["example"]}`' if c.get('example') else ''
                note_str = c.get('note', '')
                lines.append(f'| {from_str} | {ex_str} | {note_str} |')
            lines.append('')

        # Arithmetic
        arithmetic = metadata.get('arithmetic') or []
        if arithmetic:
            lines.append('## Arithmetic\n')
            lines.append('| Expression | Result Type | Description |')
            lines.append('|------------|-------------|-------------|')
            for a in arithmetic:
                lines.append(f'| `{a["expr"]}` | {a["result"]} | {a["desc"]} |')
            lines.append('')

        # Cross-type comparisons
        comparable_with = metadata.get('comparable_with')
        if comparable_with is not None:
            lines.append('## Comparisons\n')
            if comparable_with:
                types_str = ', '.join(f'`{t}`' for t in comparable_with)
                lines.append(f'Can be compared (using `=`, `<`, `>`, etc.) with: {types_str}.\n')
            else:
                lines.append('This type does not support direct comparisons with `=`, `<`, or `>`. Extract or cast values first.\n')

        # Notes
        notes = metadata.get('notes')
        if notes:
            lines.append('## Notes\n')
            lines.append(notes + '\n')

        # Limitations
        limitations = metadata.get('limitations') or []
        if limitations:
            lines.append('## Limitations\n')
            for lim in limitations:
                lines.append(f'- {lim}')
            lines.append('')

        write_md(path, lines)


def build_aggregates_docs(aggregates_def: Dict[str, Any]):
    # Build the aggregates reference page from definitions.
    categories: Dict[str, List[Tuple[str, Dict[str, Any]]]] = {}
    for name, info in aggregates_def.items():
        category = info.get('category') or 'Other'
        categories.setdefault(category, []).append((name, info))

    lines = [
        '---',
        'title: Aggregates — Opteryx Reference',
        'description: Quick reference for SQL aggregate functions supported by Opteryx.',
        '---',
        '',
        '# Aggregates',
        '',
        'Aggregates combine multiple rows into single summary values and are typically used with `GROUP BY`. Aggregates generally ignore `NULL` inputs.',
        '',
        '## Supported aggregates',
        ''
    ]

    for category in sorted(categories.keys()):
        lines.append(f'### {category.capitalize()}')
        lines.append('')
        for name, info in sorted(categories[category], key=lambda x: x[0]):
            summary = info.get('summary', '')
            sql_forms = info.get('sql_forms', []) or []
            documentation = info.get('documentation', '')
            support = info.get('support', {}) or {}

            lines.append(f'- **{name}** — {summary}')
            if sql_forms:
                sql_forms_display = ', '.join(f'`{form}`' for form in sql_forms)
                lines.append(f'  - SQL forms: {sql_forms_display}')

            flags = []
            if support.get('global'):
                flags.append('global')
            if support.get('grouped'):
                flags.append('grouped')
            if support.get('strict_grouped'):
                flags.append('strict_grouped')
            if flags:
                lines.append(f'  - Support: {", ".join(flags)}')

            if documentation:
                lines.append(f'  - Notes: {documentation}')
        lines.append('')

    # Write to the reference docs directory.
    write_md(REF_SQL_DIR / 'aggregates.md', lines)


def _find_section(nav: list, key: str) -> Optional[dict]:
    for section in nav:
        if key in section:
            return section
    return None


def _find_item(items: list, key: str) -> Optional[dict]:
    for item in items:
        if key in item:
            return item
    return None


def _populate_nav_items(item: dict, prefix: str, entries: dict, title_fn) -> None:
    key = list(item.keys())[0]
    node = item[key]
    if not isinstance(node, dict):
        return
    nav_items = []
    for name, info in entries.items():
        slug = slugify(name)
        title = title_fn(name, info)
        nav_items.append((title, slug))
    nav_items.sort(key=lambda x: x[0].lower())
    node['items'] = [{title: f'{prefix}/{slug}.md'} for title, slug in nav_items]


def update_nav(functions_def: Dict[str, Any], operators_def: Dict[str, Any], types_def: Dict[str, Any]):
    nav = load_json(NAV_PATH)

    # Remove any ghost sections introduced by previous script versions.
    nav = [s for s in nav if list(s.keys())[0] not in ('Engineering Blog', 'Reference')]

    # --- API Reference (top-level section) ---
    generated_api_docs, manual_api_docs = _get_available_api_docs()
    api_items = [{spec['title']: f"reference/api/{spec['slug']}.md"} for spec in generated_api_docs + manual_api_docs]

    api_section = _find_section(nav, 'API Reference')
    if api_section is not None:
        api_section['API Reference'] = api_items
    else:
        nav.append({'API Reference': api_items})

    # --- SQL Language Reference (top-level section) ---
    sql_section = _find_section(nav, 'SQL Language Reference')
    if sql_section is None:
        sql_section = {'SQL Language Reference': []}
        nav.append(sql_section)
    sql_block = sql_section['SQL Language Reference']

    # Update or create Functions, Operators, Data Types entries.
    for name, href, entries, title_fn in [
        ('Functions',   {'href': 'reference/sql/functions.md'},   functions_def, lambda n, _: n),
        ('Operators',   {'href': 'reference/sql/operators.md'},   operators_def, lambda n, i: i.get('friendly_name') or i.get('display_name') or n),
        ('Data Types',  {'href': 'reference/sql/data-types.md'},  types_def,     lambda n, i: i.get('canonical_name') or n.upper()),
    ]:
        item = _find_item(sql_block, name)
        if item is None:
            item = {name: href}
            sql_block.append(item)
        elif isinstance(item[name], str):
            item[name] = href
        nav_prefix = {
            'Functions':  'reference/sql/functions',
            'Operators':  'reference/sql/operators',
            'Data Types': 'reference/sql/types',
        }[name]
        _populate_nav_items(item, nav_prefix, entries, title_fn)

    # Trailing newline: without it every regeneration shows nav.json as modified
    # (POSIX "\ No newline at end of file") even when the nav itself is unchanged.
    NAV_PATH.write_text(json.dumps(nav, indent=2) + '\n')


def _prune_stale(directory: pathlib.Path, keep_slugs: set[str]) -> None:
    """Delete .md files in directory whose stem is not in keep_slugs."""
    if not directory.exists():
        return
    for path in directory.glob('*.md'):
        if path.stem not in keep_slugs:
            path.unlink()
            print(f'  removed stale: {path.name}')


def build_variables_docs(variables_def: Dict[str, Any]):
    """Render the system-variable (settings) reference.

    Generated, not hand-written: the source catalog is produced from
    `SYSTEM_VARIABLES_DEFAULTS` by opteryx-core's `make reference`, so the
    ownership tiers here cannot drift from the ones actually enforced.
    """
    # Only UNRESTRICTED variables are documented. RESTRICTED ones are withheld from
    # SHOW VARIABLES and unreachable by SET without the platform_admin entitlement,
    # so listing them describes a surface almost no reader of these docs has — and
    # several are session identity or internal policy state rather than a setting
    # at all. The catalog still carries them; this page is deliberately narrower
    # than the catalog.
    public = {n: v for n, v in variables_def.items()
              if v.get('visibility') == 'UNRESTRICTED'}
    settable = {n: v for n, v in public.items() if v.get('settable')}
    any_session = {n: v for n, v in settable.items() if not v.get('requires_entitlement')}
    admin_only = {n: v for n, v in settable.items() if v.get('requires_entitlement')}
    fixed = {n: v for n, v in public.items() if not v.get('settable')}

    lines = [
        '---',
        'title: System Variables — Opteryx Reference',
        'description: Every Opteryx system variable, its type, and who is permitted to set it.',
        '---', '',
        '# System Variables', '',
        'Opteryx exposes %d system variables that a session can read. Use '
        '[SHOW VARIABLES](statements/show-variables) to list them, and '
        '[SET](statements/set) to change the ones you are permitted to change.'
        % len(public), '',
        # Callouts are blockquotes opened with a recognised label — renderMarkdown.ts
        # rewrites `<blockquote><p>Be Aware: ...` into the styled callout. MkDocs-style
        # `!!! note` has no renderer support and shipped as literal "!!! note" text.
        # Must stay on ONE line: the regex matches a single <p>.
        '> Be Aware: Most system variables are **not** settable from SQL. A session runs at the '
        '`USER` tier, so only `USER`-owned variables are reachable by `SET` at all. Everything '
        'else is fixed by the server or stamped per session.', '',
        '> Note: This page lists the variables a session can see. An embedded build of '
        '`opteryx-core` may display additional variables that are internal to the hosted '
        'service and not part of the documented SQL surface.', '',
    ]

    def table(title, entries, note=None):
        if not entries:
            return
        lines.append('## ' + title)
        lines.append('')
        if note:
            lines.append(note)
            lines.append('')
        lines.append('| Variable | Type | Default |')
        lines.append('|---|---|---|')
        for name, info in sorted(entries.items()):
            source = info.get('default_source')
            if source == 'literal':
                default = '`%s`' % (info.get('default'),)
            elif source == 'environment':
                default = 'env `%s`' % info.get('environment_key')
            elif source == 'host':
                default = '_detected from the host_'
            elif source == 'build':
                default = '_from the build_'
            else:
                default = '_per session_'
            lines.append('| `%s` | %s | %s |' % (name, info.get('type'), default))
        lines.append('')

    table('Settable by any session', any_session)
    table(
        'Settable with `platform_admin`',
        admin_only,
        'These are `USER`-owned but `RESTRICTED`, so they are hidden from `SHOW VARIABLES` '
        'and refused by `SET` unless the caller holds the `platform_admin` entitlement.',
    )
    table(
        'Not settable from SQL',
        fixed,
        'Read-only from a session. Server-owned values are fixed when the server starts; '
        'session-identity values are stamped from the connection.',
    )

    lines += [
        '## Where defaults come from', '',
        '- **`env KEY`** — read from that environment variable when the server starts. The '
        'shipped fallback lives in the engine\'s configuration, not here: recording a value '
        'generated on one machine would describe that machine rather than the product.',
        '- **detected from the host** — derived at startup (CPU count, memory limits, platform).',
        '- **per session** — identity asserted by the connecting service, not configuration. '
        'See [SHOW USER](statements/show-user) and [SHOW GRANTS](statements/show-grants).', '',
    ]

    write_md(REF_SQL_DIR / 'variables.md', lines)


def main():
    functions_def = load_json(DEFS / 'functions.json')
    operators_def = load_json(DEFS / 'operators.json')
    types_def = load_json(DEFS / 'types.json')
    aggregates_def = load_json(DEFS / 'aggregates.json')
    variables_def = load_json(DEFS / 'variables.json')

    # Prune stale entries before regenerating so removed items disappear.
    _prune_stale(REF_SQL_DIR / 'functions', {slugify(n) for n in functions_def})
    _prune_stale(REF_SQL_DIR / 'operators', {slugify(n) for n in operators_def})
    _prune_stale(REF_SQL_DIR / 'types', {slugify(n) for n in types_def})

    build_functions_docs(functions_def)
    build_operators_docs(operators_def)
    build_types_docs(types_def)
    build_aggregates_docs(aggregates_def)
    build_variables_docs(variables_def)
    build_api_docs()
    update_nav(functions_def, operators_def, types_def)
    print('docs regenerated')


if __name__ == '__main__':
    main()
