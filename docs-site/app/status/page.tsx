"use client";

/*
 * /status — a read-model over the public Statuspage API for status.opteryx.app.
 *
 * The v2 endpoints are unauthenticated and send `access-control-allow-origin: *`,
 * so this is a plain browser fetch: no proxy, no key, no server-side component.
 * Atlassian CDN-caches the responses at 10s, so the 60s poll is free.
 *
 * Statuspage remains the system of record. It owns incident declaration, the
 * email/Slack/Teams/RSS subscriber fan-out and the uptime history — and it
 * stays up on someone else's infrastructure when ours doesn't, which is the
 * entire point of a status page. Subscribing is not possible through the API
 * (it's read-only), so that link goes out to Statuspage itself.
 *
 * Rendered client-side on purpose: a statically built page would serve a
 * cached "all systems operational" during an outage, which is worse than
 * showing nothing.
 */

import React from "react";

const SUMMARY_URL = "https://opteryx.statuspage.io/api/v2/summary.json";
const INCIDENTS_URL = "https://opteryx.statuspage.io/api/v2/incidents.json";
const STATUSPAGE_URL = "https://opteryx.statuspage.io";
const POLL_MS = 60000;
const HISTORY_LIMIT = 20;

type Dot = "ok" | "degraded" | "outage" | "unknown";

type Component = {
  id: string;
  name: string;
  status: string;
  description: string | null;
  position: number;
  group: boolean;
  only_show_if_degraded: boolean;
};

type IncidentUpdate = {
  id: string;
  status: string;
  body: string;
  created_at: string;
};

type Incident = {
  id: string;
  name: string;
  status: string;
  impact: string;
  shortlink: string;
  created_at: string;
  resolved_at: string | null;
  incident_updates: IncidentUpdate[];
};

type Summary = {
  status: { indicator: string; description: string };
  components: Component[];
  incidents: Incident[];
  scheduled_maintenances: Incident[];
};

const INDICATOR: Record<string, { dot: Dot; cls: string; head: string }> = {
  none: { dot: "ok", cls: "is-ok", head: "All systems operational" },
  minor: { dot: "degraded", cls: "is-degraded", head: "Degraded performance" },
  major: { dot: "outage", cls: "is-outage", head: "Outage" },
  critical: { dot: "outage", cls: "is-outage", head: "Outage" },
  maintenance: {
    dot: "degraded",
    cls: "is-degraded",
    head: "Under maintenance",
  },
};

const COMPONENT: Record<string, { dot: Dot; text: string }> = {
  operational: { dot: "ok", text: "operational" },
  degraded_performance: { dot: "degraded", text: "degraded" },
  partial_outage: { dot: "degraded", text: "partial outage" },
  major_outage: { dot: "outage", text: "outage" },
  under_maintenance: { dot: "degraded", text: "maintenance" },
};

function fmtDateTime(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function fmtMonth(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "Unknown";
  return d.toLocaleString(undefined, { month: "long", year: "numeric" });
}

/*
 * Incident bodies come back as Markdown. They're written by us, but they
 * still arrive over the wire from a third party, so this renders to React
 * nodes rather than going anywhere near dangerouslySetInnerHTML — there is
 * no HTML injection surface at all. The subset is deliberately small:
 * headings, bullets, bold, italic, code and https links, which is everything
 * an incident update has ever actually used.
 *
 * `_underscore_` italics are matched only at word boundaries, so prose like
 * _cumulative_ becomes italic while snake_case identifiers such as
 * only_show_if_degraded are left alone.
 */
const INLINE_RE =
  /(\*\*[^*]+\*\*|\*[^*\n]+\*|(?<![A-Za-z0-9_])_[^_\n]+_(?![A-Za-z0-9_])|`[^`]+`|\[[^\]]+\]\([^)\s]+\))/g;

function inline(text: string, key: string): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  const parts = text.split(INLINE_RE);
  parts.forEach((p, i) => {
    if (!p) return;
    const k = `${key}-${i}`;
    if (p.startsWith("**") && p.endsWith("**")) {
      out.push(<strong key={k}>{p.slice(2, -2)}</strong>);
    } else if (
      (p.startsWith("*") && p.endsWith("*")) ||
      (p.startsWith("_") && p.endsWith("_"))
    ) {
      out.push(<em key={k}>{p.slice(1, -1)}</em>);
    } else if (p.startsWith("`") && p.endsWith("`")) {
      out.push(<code key={k}>{p.slice(1, -1)}</code>);
    } else {
      const link = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(p);
      // Only https — never render a javascript: or data: URL from the feed.
      if (link && /^https:\/\//i.test(link[2])) {
        out.push(
          <a key={k} href={link[2]} target="_blank" rel="noopener noreferrer">
            {link[1]}
          </a>,
        );
      } else {
        out.push(<React.Fragment key={k}>{p}</React.Fragment>);
      }
    }
  });
  return out;
}

function IncidentBody({ text }: { text: string }) {
  const blocks = (text || "").trim().split(/\n\s*\n/);
  return (
    <div className="u-body">
      {blocks.map((block, bi) => {
        const lines = block.split("\n");

        // Horizontal rule — postmortems use these as section dividers.
        if (/^\s*(-{3,}|\*{3,}|_{3,})\s*$/.test(block)) {
          return <hr key={bi} className="u-rule" />;
        }

        // GFM table. Detected by a header row plus a |---|---| separator;
        // anything less than that is treated as ordinary prose.
        if (
          lines.length >= 2 &&
          /^\s*\|.*\|\s*$/.test(lines[0]) &&
          /^\s*\|[\s:|-]+\|\s*$/.test(lines[1])
        ) {
          const cells = (row: string) =>
            row
              .trim()
              .replace(/^\||\|$/g, "")
              .split("|")
              .map((c) => c.trim());
          const head = cells(lines[0]);
          const body = lines.slice(2).filter((l) => /\S/.test(l)).map(cells);
          return (
            <div key={bi} className="u-table-wrap">
              <table className="u-table">
                <thead>
                  <tr>
                    {head.map((h, i) => (
                      <th key={i}>{inline(h, `${bi}-h-${i}`)}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {body.map((row, ri) => (
                    <tr key={ri}>
                      {row.map((c, ci) => (
                        <td key={ci}>{inline(c, `${bi}-${ri}-${ci}`)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }

        // Blockquote — postmortems use these for the "what this means" pull
        // quote. Inner blank lines arrive as bare ">" markers, so strip the
        // markers first and re-split into paragraphs.
        if (lines.every((l) => /^\s*>/.test(l))) {
          const inner = lines
            .map((l) => l.replace(/^\s*>\s?/, ""))
            .join("\n")
            .split(/\n\s*\n/)
            .filter((s) => /\S/.test(s));
          return (
            <blockquote key={bi} className="u-quote">
              {inner.map((para, pi) => (
                <p key={pi}>{inline(para, `${bi}-q-${pi}`)}</p>
              ))}
            </blockquote>
          );
        }

        const bullets = lines.filter((l) => /^\s*[-*]\s+/.test(l));
        if (bullets.length === lines.length && lines.length > 0) {
          return (
            <ul key={bi} className="u-list">
              {lines.map((l, li) => (
                <li key={li}>
                  {inline(l.replace(/^\s*[-*]\s+/, ""), `${bi}-${li}`)}
                </li>
              ))}
            </ul>
          );
        }
        const heading = /^#{1,6}\s+(.*)$/.exec(lines[0]);
        if (heading) {
          return (
            <p key={bi} className="u-subhead">
              {inline(heading[1], `${bi}-h`)}
              {lines.length > 1
                ? inline("\n" + lines.slice(1).join("\n"), `${bi}-r`)
                : null}
            </p>
          );
        }
        return <p key={bi}>{inline(block, String(bi))}</p>;
      })}
    </div>
  );
}

function Dot({ kind, small }: { kind: Dot; small?: boolean }) {
  return (
    <span
      className={`st-dot st-dot--${kind}${small ? " st-dot--sm" : ""}`}
      aria-hidden="true"
    />
  );
}

function Updates({ updates }: { updates: IncidentUpdate[] }) {
  if (!updates || !updates.length) return null;
  return (
    <ul className="status-updates">
      {updates.map((u) => (
        <li key={u.id}>
          <span className="u-status">{u.status.replace(/_/g, " ")}</span>
          <span className="u-time">{fmtDateTime(u.created_at)}</span>
          <IncidentBody text={u.body} />
        </li>
      ))}
    </ul>
  );
}

function IncidentCard({
  incident,
  live,
}: {
  incident: Incident;
  live?: boolean;
}) {
  const updates = incident.incident_updates || [];
  const isPostmortem = updates.some((u) => u.status === "postmortem");

  return (
    <div className={`status-incident${live ? " status-incident--live" : ""}`}>
      <div className="status-incident__head">
        <span className="status-incident__name">{incident.name}</span>
        <span
          className={`status-incident__impact is-${incident.impact}`}
        >
          {incident.impact}
        </span>
        <span className="u-time">
          {fmtDateTime(incident.created_at)}
          {incident.resolved_at
            ? ` → resolved ${fmtDateTime(incident.resolved_at)}`
            : ""}
        </span>
      </div>
      {/* An active incident tells you everything immediately — you're here
          because something is broken right now. A resolved one folds away:
          postmortems run to thousands of words and would otherwise bury the
          rest of the history under a single entry. */}
      {live ? (
        <Updates updates={updates} />
      ) : updates.length ? (
        <details className="status-incident__more">
          <summary>
            {isPostmortem ? "Postmortem" : "Timeline"} · {updates.length} update
            {updates.length === 1 ? "" : "s"}
          </summary>
          <Updates updates={updates} />
        </details>
      ) : null}
    </div>
  );
}

export default function StatusPage() {
  const [summary, setSummary] = React.useState<Summary | null>(null);
  const [history, setHistory] = React.useState<Incident[] | null>(null);
  const [failed, setFailed] = React.useState(false);
  const [checkedAt, setCheckedAt] = React.useState<number | null>(null);

  const load = React.useCallback(() => {
    Promise.all([
      fetch(SUMMARY_URL, { cache: "no-store" }).then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.json();
      }),
      fetch(INCIDENTS_URL, { cache: "no-store" })
        .then((r) => (r.ok ? r.json() : { incidents: [] }))
        // History is a nice-to-have; never let it take the live status down
        // with it.
        .catch(() => ({ incidents: [] })),
    ])
      .then(([s, h]) => {
        setSummary(s as Summary);
        setHistory((h.incidents || []) as Incident[]);
        setFailed(false);
        setCheckedAt(Date.now());
      })
      .catch(() => {
        setFailed(true);
        setCheckedAt(Date.now());
      });
  }, []);

  React.useEffect(() => {
    load();
    const t = setInterval(load, POLL_MS);
    const onVis = () => {
      if (!document.hidden) load();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      clearInterval(t);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [load]);

  // Unreachable never renders green. Saying "all systems operational" when we
  // couldn't reach the source is the one failure mode worth engineering out.
  const meta =
    !failed && summary
      ? INDICATOR[summary.status?.indicator] || INDICATOR.none
      : {
          dot: "unknown" as Dot,
          cls: "",
          head: failed ? "Status unavailable" : "Checking status…",
        };

  const components = (summary?.components || [])
    .filter((c) => !c.group)
    .filter((c) => !(c.only_show_if_degraded && c.status === "operational"))
    .sort((a, b) => (a.position || 0) - (b.position || 0));

  const live = summary?.incidents || [];
  const maintenance = summary?.scheduled_maintenances || [];

  // summary.json's `incidents` are the unresolved ones; incidents.json is
  // everything. Drop the overlap so a live incident isn't also listed as
  // history directly below itself.
  const liveIds = new Set(live.map((i) => i.id));
  const past = (history || [])
    .filter((i) => !liveIds.has(i.id))
    .slice(0, HISTORY_LIMIT);

  const months: { month: string; items: Incident[] }[] = [];
  past.forEach((i) => {
    const m = fmtMonth(i.created_at);
    const last = months[months.length - 1];
    if (last && last.month === m) last.items.push(i);
    else months.push({ month: m, items: [i] });
  });

  return (
    <main className="status-page">
      <h1>Platform status</h1>
      <p className="status-sub">
        Live health of the Opteryx cloud APIs, read directly from our status
        service.
      </p>

      <div className={`status-banner ${meta.cls}`}>
        <Dot kind={meta.dot} />
        <div className="status-banner__text">
          <div className="status-banner__head">{meta.head}</div>
          <div className="status-banner__meta">
            {failed
              ? "Couldn't reach the status service — this says nothing about the platform itself."
              : checkedAt
                ? `Checked ${new Date(checkedAt).toLocaleTimeString()} · refreshes every minute`
                : ""}
          </div>
        </div>
      </div>

      <h2>Services</h2>
      {components.length ? (
        <ul className="status-components">
          {components.map((c) => {
            const m = COMPONENT[c.status] || {
              dot: "unknown" as Dot,
              text: c.status.replace(/_/g, " "),
            };
            return (
              <li key={c.id}>
                <Dot kind={m.dot} small />
                <span className="name">
                  {c.name}
                  {c.description ? (
                    <span className="desc">{c.description}</span>
                  ) : null}
                </span>
                <span className="state">{m.text}</span>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="status-note">
          {failed ? "Service list unavailable." : "Loading services…"}
        </p>
      )}

      {live.length > 0 && (
        <>
          <h2>Active incidents</h2>
          {live.map((i) => (
            <IncidentCard key={i.id} incident={i} live />
          ))}
        </>
      )}

      {maintenance.length > 0 && (
        <>
          <h2>Scheduled maintenance</h2>
          {maintenance.map((i) => (
            <IncidentCard key={i.id} incident={i} />
          ))}
        </>
      )}

      <h2>Recent history</h2>
      {months.length ? (
        months.map((m) => (
          <div key={m.month}>
            <div className="status-history-month">{m.month}</div>
            {m.items.map((i) => (
              <IncidentCard key={i.id} incident={i} />
            ))}
          </div>
        ))
      ) : (
        <p className="status-history-none">
          {failed
            ? "History unavailable."
            : history
              ? "No incidents recorded."
              : "Loading history…"}
        </p>
      )}

      <div className="status-foot">
        <span>
          Want to be told rather than have to look?{" "}
          <a href={STATUSPAGE_URL} target="_blank" rel="noopener noreferrer">
            Subscribe to updates
          </a>{" "}
          by email, Slack, Teams or RSS.
        </span>
        <a href={STATUSPAGE_URL} target="_blank" rel="noopener noreferrer">
          Uptime history →
        </a>
      </div>
    </main>
  );
}
