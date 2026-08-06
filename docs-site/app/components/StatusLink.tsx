"use client";

/*
 * The footer's Status link, with a live dot.
 *
 * Reads the Statuspage `status.json` rollup — the whole payload is the page
 * name and one indicator string, which is all a dot needs. Unauthenticated,
 * CORS-open and CDN-cached at 10s, same as /status uses.
 *
 * The dot renders only once we actually know something. Loading and
 * unreachable both render no dot at all: the plain link this used to be.
 * Green is never a guess — an "all systems operational" pip while the API is
 * unreachable is worse than no pip, and it's the one failure mode here worth
 * engineering out.
 */

import Link from "next/link";
import React from "react";

const STATUS_URL = "https://opteryx.statuspage.io/api/v2/status.json";
const TTL_MS = 60000;

type Dot = "ok" | "degraded" | "outage";
type State = { dot: Dot; label: string };

const INDICATOR: Record<string, State> = {
  none: { dot: "ok", label: "all systems operational" },
  minor: { dot: "degraded", label: "degraded performance" },
  major: { dot: "outage", label: "outage" },
  critical: { dot: "outage", label: "outage" },
  maintenance: { dot: "degraded", label: "under maintenance" },
};

// The footer is on every page, so memoise across mounts: at most one request
// per minute per tab, no matter how much of the site someone reads. Written
// only from the effect below, so it stays client-side and can't leak between
// server requests.
let cache: { at: number; state: State | null } | null = null;

export default function StatusLink() {
  const [state, setState] = React.useState<State | null>(
    () => cache?.state ?? null,
  );

  React.useEffect(() => {
    if (cache && Date.now() - cache.at < TTL_MS) {
      setState(cache.state);
      return;
    }
    let alive = true;
    const settle = (next: State | null) => {
      cache = { at: Date.now(), state: next };
      if (alive) setState(next);
    };
    // Deliberately not no-store: a dot is worth one cacheable GET, not a
    // guaranteed round trip on every page view.
    fetch(STATUS_URL)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => settle(INDICATOR[d?.status?.indicator] ?? null))
      .catch(() => settle(null));
    return () => {
      alive = false;
    };
  }, []);

  return (
    <Link
      href="/status"
      className="docs-footer-link docs-footer-status"
      aria-label={state ? `Status — ${state.label}` : "Status"}
    >
      {state ? (
        <span className={`st-dot st-dot--${state.dot}`} aria-hidden="true" />
      ) : null}
      <span>Status</span>
    </Link>
  );
}
