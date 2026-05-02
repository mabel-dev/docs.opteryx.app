/* DocsContent.jsx — Documentation page demonstrating prose + visual elements:
   data-type lists, callouts (info/note/tip/warning/danger), tables, parameter
   tables, code blocks, ordered/unordered/definition lists, steps,
   blockquote, tags, kbd shortcuts. */

const TYPE_SECTIONS = [
  { id: 'numeric', title: 'Numeric types',
    types: [
      { name: 'DECIMAL',  desc: 'Fixed-point decimal — exact arithmetic up to 38 digits.' },
      { name: 'DOUBLE',   desc: 'Double-precision IEEE-754 float.' },
      { name: 'INTEGER',  desc: '64-bit signed integer.' },
    ] },
  { id: 'temporal', title: 'Temporal types',
    types: [
      { name: 'DATE',      desc: 'Calendar date with no time component.' },
      { name: 'TIME',      desc: 'Time of day, microsecond precision.' },
      { name: 'TIMESTAMP', desc: 'Date + time, optionally with timezone.' },
    ] },
  { id: 'collection', title: 'Collection types',
    types: [
      { name: 'ARRAY', desc: 'Ordered, homogeneous list of values.' },
      { name: 'JSONB', desc: 'Binary-encoded JSON document.' },
    ] },
];

function Breadcrumbs() {
  const crumbs = ['Docs', 'Reference', 'SQL Language Reference', 'Data Types'];
  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      {crumbs.map((c, i) => (
        <span key={c} className="crumb">
          {i > 0 && (
            <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="crumb-sep">
              <path d="M6 4 L10 8 L6 12" />
            </svg>
          )}
          <a href="#" className={i === crumbs.length - 1 ? 'current' : ''}>{c}</a>
        </span>
      ))}
    </nav>
  );
}

/* ----- Callout ---------------------------------------------------- */
const ICONS = {
  info: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="8" r="6.5"/><path d="M8 7.5 v3.5"/><circle cx="8" cy="5" r="0.6" fill="currentColor"/></svg>,
  note: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3 h7 l3 3 v7 a1 1 0 0 1 -1 1 H3 a1 1 0 0 1 -1 -1 V4 a1 1 0 0 1 1 -1 z"/><path d="M10 3 v3 h3"/></svg>,
  tip: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M8 1.5 a4.5 4.5 0 0 0 -2.5 8.3 V11.5 h5 V9.8 A4.5 4.5 0 0 0 8 1.5 z"/><path d="M6 13.5 h4"/><path d="M6.5 15 h3"/></svg>,
  warning: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M8 1.8 L14.5 13.2 H1.5 z"/><path d="M8 6.5 v3.5"/><circle cx="8" cy="11.5" r="0.6" fill="currentColor"/></svg>,
  danger: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="8" r="6.5"/><path d="M5.5 5.5 L10.5 10.5 M10.5 5.5 L5.5 10.5"/></svg>,
};
function Callout({ kind = 'info', title, children }) {
  const labels = { info: 'Note', note: 'Note', tip: 'Tip', warning: 'Warning', danger: 'Caution' };
  return (
    <div className={'callout ' + kind}>
      <div className="callout-body">
        <span className="callout-label">{title || labels[kind]}</span>
        {children}
      </div>
    </div>
  );
}

/* ----- Code block (toy syntax-highlight) -------------------------- */
function CodeBlock({ lang, lines }) {
  return (
    <div className="code-block">
      <div className="code-block-header">
        <span className="lang">{lang}</span>
        <button className="copy-btn" onClick={(e) => e.preventDefault()}>Copy</button>
      </div>
      <pre>{lines}</pre>
    </div>
  );
}

const SQL_SAMPLE = (
  <code>
    <span className="tok-com">{'-- Top 5 origin airports by flight count (2024)'}</span>{'\n'}
    <span className="tok-kw">SELECT</span>{' origin, '}
    <span className="tok-fn">COUNT</span>{'(*) '}
    <span className="tok-kw">AS</span>{' flights\n'}
    <span className="tok-kw">FROM</span>{' opteryx.flights\n'}
    <span className="tok-kw">WHERE</span>{' year = '}<span className="tok-num">2024</span>{'\n'}
    <span className="tok-kw">GROUP BY</span>{' origin\n'}
    <span className="tok-kw">ORDER BY</span>{' flights '}<span className="tok-kw">DESC</span>{'\n'}
    <span className="tok-kw">LIMIT</span>{' '}<span className="tok-num">5</span><span className="tok-pun">;</span>
  </code>
);

const SHELL_SAMPLE = (
  <code>
    <span className="tok-com">{'# install + run a query against a parquet file'}</span>{'\n'}
    <span className="tok-pun">$</span>{' pip install opteryx\n'}
    <span className="tok-pun">$</span>{' opteryx '}<span className="tok-str">"SELECT * FROM 'data/sales.parquet' LIMIT 10"</span>
  </code>
);

const PYTHON_SAMPLE = (
  <code>
    <span className="tok-com">{'# Run an Opteryx query from Python and read results as Arrow.'}</span>{'\n'}
    <span className="tok-kw">import</span>{' opteryx\n\n'}
    {'cur = opteryx.query(\n    '}
    <span className="tok-str">"SELECT origin, COUNT(*) AS flights\\n"</span>{'\n    '}
    <span className="tok-str">"FROM opteryx.flights\\n"</span>{'\n    '}
    <span className="tok-str">"WHERE year = 2024\\n"</span>{'\n    '}
    <span className="tok-str">"GROUP BY origin\\n"</span>{'\n    '}
    <span className="tok-str">"ORDER BY flights DESC LIMIT 5"</span>{'\n)\n\n'}
    {'table = cur.'}<span className="tok-fn">arrow</span>{'()\n'}
    <span className="tok-fn">print</span>{'(table.to_pandas())'}
  </code>
);

const JSON_SAMPLE = (
  <code>
    {'{\n  '}
    <span className="tok-str">"query_id"</span>{': '}<span className="tok-str">"qr_7f3b91c2-3f44-4a21"</span>{',\n  '}
    <span className="tok-str">"status"</span>{': '}<span className="tok-str">"ok"</span>{',\n  '}
    <span className="tok-str">"duration_ms"</span>{': '}<span className="tok-num">412</span>{',\n  '}
    <span className="tok-str">"bytes_scanned"</span>{': '}<span className="tok-num">1288490188</span>{',\n  '}
    <span className="tok-str">"row_count"</span>{': '}<span className="tok-num">5</span>{',\n  '}
    <span className="tok-str">"columns"</span>{': [\n    {'}
    <span className="tok-str">"name"</span>{': '}<span className="tok-str">"origin"</span>{', '}
    <span className="tok-str">"type"</span>{': '}<span className="tok-str">"VARCHAR"</span>{'},\n    {'}
    <span className="tok-str">"name"</span>{': '}<span className="tok-str">"flights"</span>{', '}
    <span className="tok-str">"type"</span>{': '}<span className="tok-str">"INTEGER"</span>{'}\n  ],\n  '}
    <span className="tok-str">"warnings"</span>{': []\n}'}
  </code>
);

/* ----- Type list (existing pattern) ------------------------------- */
function TypeList({ types }) {
  return (
    <ul className="type-list">
      {types.map(t => (
        <li key={t.name}>
          <a href="#" className="type-kw mono">{t.name}</a>
          <span className="type-dash"> — </span>
          <span className="type-desc">{t.desc}</span>
        </li>
      ))}
    </ul>
  );
}

/* ----- Page ------------------------------------------------------- */
function DocsContent() {
  return (
    <article className="docs-article">
      <Breadcrumbs />
      <h1>Data Types</h1>
      <p className="lede">
        Opteryx supports a focused set of SQL data types optimized for columnar
        execution over Parquet, Arrow and JSON sources. The pages that follow
        document the reference behavior of each type.
      </p>

      {/* ---- DATA TYPE SECTIONS (existing) ---- */}
      {TYPE_SECTIONS.map(s => (
        <section key={s.id} id={s.id} className="type-section">
          <h2>{s.title}</h2>
          <TypeList types={s.types} />
        </section>
      ))}

      {/* ---- CALLOUTS ---- */}
      <section id="callouts" className="type-section">
        <h2>Callouts</h2>
        <p>
          Use callouts sparingly to flag information that the reader must not
          miss. Five kinds are available.
        </p>
        <Callout kind="info" title="Note">
          <p>
            Type promotion follows SQL standard rules — see <a href="#">implicit casts</a> for
            the full coercion table.
          </p>
        </Callout>
        <Callout kind="tip" title="Tip">
          <p>
            Use <code>EXPLAIN</code> before a heavy query to see which predicates
            push down to the scan layer.
          </p>
        </Callout>
        <Callout kind="warning" title="Warning">
          <p>
            <code>TIMESTAMP WITH TIME ZONE</code> values are stored as UTC. The
            session zone affects display only.
          </p>
        </Callout>
        <Callout kind="danger" title="Caution">
          <p>
            Casting a <code>DOUBLE</code> with magnitude greater than 2<sup>63</sup> to
            <code> INTEGER</code> raises <code>NumericOverflow</code> and aborts the query.
          </p>
        </Callout>
        <Callout kind="note" title="Changelog">
          <p>The <code>JSONB</code> type was added in Opteryx 0.21. Earlier versions used <code>STRUCT</code>.</p>
        </Callout>
      </section>

      {/* ---- TABLES ---- */}
      <section id="tables" className="type-section">
        <h2>Tables</h2>
        <p>
          Tables document fixed structures — type matrices, status codes, supported
          file formats. Row hover is enabled.
        </p>
        <div className="table-wrap">
          <table className="docs-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Storage</th>
                <th>Range</th>
                <th>Aliases</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="mono">INTEGER</td>
                <td>8 bytes</td>
                <td>−2<sup>63</sup> … 2<sup>63</sup>−1</td>
                <td className="muted">INT, BIGINT</td>
              </tr>
              <tr>
                <td className="mono">DOUBLE</td>
                <td>8 bytes</td>
                <td>±1.8×10<sup>308</sup></td>
                <td className="muted">FLOAT, REAL</td>
              </tr>
              <tr>
                <td className="mono">DECIMAL(p,s)</td>
                <td>variable</td>
                <td>p ≤ 38</td>
                <td className="muted">NUMERIC</td>
              </tr>
              <tr>
                <td className="mono">VARCHAR</td>
                <td>variable</td>
                <td>up to 2<sup>31</sup> bytes</td>
                <td className="muted">STRING, TEXT</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* ---- PARAMETER TABLE ---- */}
      <section id="parameters" className="type-section">
        <h2>Parameter table</h2>
        <p>
          Use the parameter table to document function arguments, configuration
          options, or request bodies. Required parameters are tagged.
        </p>
        <table className="param-table">
          <tbody>
            <tr>
              <td className="param-name">
                <span className="name">format</span>
                <span className="req">Required</span>
                <span className="type">string</span>
              </td>
              <td className="param-desc">
                One of <code>parquet</code>, <code>jsonl</code>, <code>csv</code>, <code>arrow</code>.
                Determines how the source is decoded.
              </td>
            </tr>
            <tr>
              <td className="param-name">
                <span className="name">compression</span>
                <span className="type">string</span>
              </td>
              <td className="param-desc">
                Compression codec used by the source.
                <span className="default">default = <code>auto</code></span>
              </td>
            </tr>
            <tr>
              <td className="param-name">
                <span className="name">infer_schema_rows</span>
                <span className="type">integer</span>
              </td>
              <td className="param-desc">
                How many rows to scan when inferring schema for schemaless formats.
                <span className="default">default = <code>1000</code></span>
              </td>
            </tr>
            <tr>
              <td className="param-name">
                <span className="name">strict</span>
                <span className="type">boolean</span>
              </td>
              <td className="param-desc">
                If <code>true</code>, reject rows that do not match the declared schema
                instead of coercing.
                <span className="default">default = <code>false</code></span>
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* ---- LISTS ---- */}
      <section id="lists" className="type-section">
        <h2>Lists</h2>

        <h3>Unordered</h3>
        <ul className="bullet">
          <li>Predicate pushdown reaches the storage layer.</li>
          <li>Projection pruning trims unused columns before decode.</li>
          <li>Late materialisation defers row reconstruction until needed.</li>
        </ul>

        <h3>Ordered</h3>
        <ol className="numbered">
          <li>Parse the query into a logical plan.</li>
          <li>Apply rule-based optimisations (pushdown, pruning, constant folding).</li>
          <li>Lower to a physical plan and execute against the storage adapter.</li>
        </ol>

        <h3>Definition list</h3>
        <dl className="defs">
          <div>
            <dt>Relation</dt>
            <dd>An ordered set of rows where every row shares a fixed schema.</dd>
          </div>
          <div>
            <dt>Morsel</dt>
            <dd>A batch of rows passed between operators — the unit of vectorised work.</dd>
          </div>
          <div>
            <dt>Predicate</dt>
            <dd>A boolean expression filtered on either before or during scan.</dd>
          </div>
        </dl>
      </section>

      {/* ---- CODE ---- */}
      <section id="code" className="type-section">
        <h2>Code blocks</h2>
        <p>
          Inline references like <code>SELECT</code> or <code>opteryx.query()</code> use the
          inline code style. Multi-line examples use a fenced block with a language
          label and copy affordance.
        </p>
        <CodeBlock lang="SQL" lines={SQL_SAMPLE} />
        <CodeBlock lang="Python" lines={PYTHON_SAMPLE} />
        <CodeBlock lang="Shell" lines={SHELL_SAMPLE} />
        <CodeBlock lang="JSON" lines={JSON_SAMPLE} />
        <p>
          Trigger query execution with <kbd>⌘</kbd> + <kbd>Enter</kbd> in the IDE,
          or <kbd>Ctrl</kbd> + <kbd>Enter</kbd> on Windows / Linux.
        </p>
      </section>

      {/* ---- STEPS ---- */}
      <section id="steps" className="type-section">
        <h2>Steps</h2>
        <p>Use a step list to document a sequenced procedure.</p>
        <ol className="steps">
          <li>
            <div className="step-title">Install the client</div>
            <div className="step-body">
              <p>Pull the package from PyPI. Python 3.10 or newer is required.</p>
            </div>
          </li>
          <li>
            <div className="step-title">Configure a data source</div>
            <div className="step-body">
              <p>
                Set <code>OPTERYX_DATA</code> to the URL of your bucket — local paths,
                S3, GCS and Azure are supported out of the box.
              </p>
            </div>
          </li>
          <li>
            <div className="step-title">Run a query</div>
            <div className="step-body">
              <p>From the CLI or as a library call. Both return Arrow tables.</p>
            </div>
          </li>
        </ol>
      </section>

      {/* ---- TAGS + HTTP ---- */}
      <section id="tags" className="type-section">
        <h2>Tags &amp; method labels</h2>
        <p>
          Tags annotate availability, lifecycle and stability.
        </p>
        <p>
          <span className="tag teal">Stable</span>{' '}
          <span className="tag orange">Beta</span>{' '}
          <span className="tag warning">Preview</span>{' '}
          <span className="tag danger">Deprecated</span>{' '}
          <span className="tag success">New in 0.22</span>{' '}
          <span className="tag">Internal</span>
        </p>
        <p>HTTP method labels appear inline in API reference pages:</p>
        <ul className="bullet">
          <li><span className="http get">GET</span><code>/v1/jobs/{'{id}'}</code> — fetch a job.</li>
          <li><span className="http post">POST</span><code>/v1/jobs</code> — create a job.</li>
          <li><span className="http put">PUT</span><code>/v1/policies/{'{id}'}</code> — replace a policy.</li>
          <li><span className="http delete">DELETE</span><code>/v1/jobs/{'{id}'}</code> — cancel a running job.</li>
        </ul>
      </section>

      {/* ---- BLOCKQUOTE ---- */}
      <section id="quotes" className="type-section">
        <h2>Blockquote</h2>
        <blockquote>
          A query engine should hide complexity, not invent it. Every operator
          you can elide is one fewer thing the user has to learn.
          <cite>Opteryx design notes</cite>
        </blockquote>
      </section>
    </article>
  );
}

window.DocsContent = DocsContent;
