/* ui_kits/docs/Landing.jsx — Opteryx documentation landing page.
   Reuses DocsHeader / DocsFooter for shared site chrome. */

function IconArrow() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14M13 5l7 7-7 7" />
    </svg>
  );
}

function IconDiscord() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.27 5.33A19 19 0 0 0 14.5 4l-.27.5a14 14 0 0 0-4.46 0L9.5 4a19 19 0 0 0-4.77 1.33A20.27 20.27 0 0 0 1.5 17.5a19.4 19.4 0 0 0 5.93 3l.7-.95a13.6 13.6 0 0 1-2.16-1.04l.55-.43a13.5 13.5 0 0 0 11.96 0l.55.43c-.69.4-1.41.75-2.17 1.04l.7.95a19.5 19.5 0 0 0 5.94-3 20.5 20.5 0 0 0-3.23-12.17ZM8.52 15.33a2.32 2.32 0 0 1-2.16-2.4 2.31 2.31 0 0 1 2.16-2.4 2.3 2.3 0 0 1 2.16 2.4 2.31 2.31 0 0 1-2.16 2.4Zm6.96 0a2.32 2.32 0 0 1-2.16-2.4 2.31 2.31 0 0 1 2.16-2.4 2.31 2.31 0 0 1 2.16 2.4 2.32 2.32 0 0 1-2.16 2.4Z" />
    </svg>
  );
}

function DocsLanding() {
  return (
    <div className="landing-shell">
      <DocsHeader />
      <main className="landing-page">
        <section className="lp-ed-hero">
          <div>
            <div className="eyebrow">Documentation</div>
            <h1>
              Query <em>anything,</em>
              <br />
              in plain SQL.
            </h1>
          </div>
          <div className="meta">
            <strong>Opteryx</strong> is a small, fast SQL engine that runs where
            your data already is — local files, object storage, dataframes, or a
            remote service.
          </div>
        </section>

        <section className="lp-ed-feature">
          <div className="text">
            <div className="lbl">Start here · 5 min</div>
            <h2>Your first query, in less time than this paragraph.</h2>
            <p>
              Install with pip, point at a Parquet file, and pull rows back. No
              cluster, no schema upfront — just SQL.
            </p>
            <a href="#" className="ed-cta">
              Open quickstart <IconArrow />
            </a>
          </div>
          <div className="demo">
            <div className="ln">
              <span className="com"># pip install opteryx</span>
            </div>
            <div className="ln">
              <span className="kw">SELECT</span> name, mass
            </div>
            <div className="ln">
              {" "}
              <span className="kw">FROM</span>{" "}
              <span className="str">'orders.parquet'</span>
            </div>
            <div className="ln">
              {" "}
              <span className="kw">WHERE</span> mass &gt;{" "}
              <span className="num">1.0</span>
            </div>
            <div className="ln">
              {" "}
              <span className="kw">ORDER BY</span> mass{" "}
              <span className="kw">DESC</span>
            </div>
            <div className="ln">
              {" "}
              <span className="kw">LIMIT</span> <span className="num">3</span>;
            </div>
            <div className="res">
              <div className="ln">
                <pre>┌─────────┬────────┐</pre>
              </div>
              <div className="ln">
                <pre>│ name │ mass │</pre>
              </div>
              <div className="ln">
                <pre>├─────────┼────────┤</pre>
              </div>
              <div className="ln">
                <pre>│ Jupiter │ 1898.0 │</pre>
              </div>
              <div className="ln">
                <pre>│ Saturn │ 568.0 │</pre>
              </div>
              <div className="ln">
                <pre>│ Neptune │ 102.0 │</pre>
              </div>
              <div className="ln">
                <pre>└─────────┴────────┘</pre>
              </div>
            </div>
          </div>
        </section>

        <section className="lp-ed-secondary">
          <div className="lp-ed-tile">
            <div className="lbl">// reference</div>
            <h3>
              <a href="#" className="tile-title">
                SQL Reference
              </a>
            </h3>
            <p>
              Statements, expressions, functions, operators, and data types —
              the full Opteryx grammar.
            </p>
            <div className="links">
              <a href="#">SELECT</a>
              <a href="#">JOINs</a>
              <a href="#">Window functions</a>
              <a href="#">Aggregates</a>
              <a href="#">String fns</a>
              <a href="#">Types →</a>
            </div>
          </div>
          <div className="lp-ed-tile">
            <div className="lbl">// reference</div>
            <h3>
              <a href="#" className="tile-title">
                API Reference
              </a>
            </h3>
            <p>
              Embed Opteryx in Python, or call it over HTTP. Connection objects,
              cursors, and results.
            </p>
            <div className="links">
              <a href="#">opteryx.query</a>
              <a href="#">Connections</a>
              <a href="#">Cursors</a>
              <a href="#">POST /v1/query</a>
              <a href="#">Errors →</a>
            </div>
          </div>
        </section>

        <section className="lp-ed-community">
          <div className="text">
            <h4>Stuck? Talk to a human.</h4>
            <p>
              The Opteryx community hangs out on Discord — maintainers included.
              Most questions get answered within the hour.
            </p>
          </div>
          <a href="#" className="discord">
            <span className="dot"></span>
            <IconDiscord />
            Join the Discord
          </a>
        </section>
      </main>
      <DocsFooter />
    </div>
  );
}

window.DocsLanding = DocsLanding;
