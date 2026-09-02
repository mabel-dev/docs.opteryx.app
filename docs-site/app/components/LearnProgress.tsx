"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { LearnStep } from "@/app/lib/learnPaths";

type Props = {
  slug: string;
  steps: LearnStep[];
};

const STORAGE_PREFIX = "opteryx-learn:";

function readDone(slug: string): string[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_PREFIX + slug);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((v) => typeof v === "string") : [];
  } catch {
    return [];
  }
}

function writeDone(slug: string, done: string[]) {
  try {
    window.localStorage.setItem(STORAGE_PREFIX + slug, JSON.stringify(done));
  } catch {
    // Private mode or storage disabled: the ticks just don't persist.
  }
}

/**
 * The ordered step list for a learning path, with a tick per step.
 *
 * Progress lives in this browser's localStorage only. There are no accounts
 * on the docs site, so this is a convenience, not a record: clearing site data
 * or switching browsers starts the path over, and the page must read correctly
 * with nothing stored.
 */
export default function LearnProgress({ slug, steps }: Props) {
  const [done, setDone] = useState<string[]>([]);

  useEffect(() => {
    setDone(readDone(slug));
  }, [slug]);

  const toggle = (href: string) => {
    setDone((prev) => {
      const next = prev.includes(href)
        ? prev.filter((h) => h !== href)
        : [...prev, href];
      writeDone(slug, next);
      return next;
    });
  };

  const reset = () => {
    setDone([]);
    writeDone(slug, []);
  };

  const completed = steps.filter((step) => done.includes(step.href)).length;
  const percent = steps.length ? Math.round((completed / steps.length) * 100) : 0;

  return (
    <div className="learn-steps-wrap">
      <div className="learn-progress" role="status">
        <div className="learn-progress-bar" aria-hidden="true">
          <div className="learn-progress-fill" style={{ width: `${percent}%` }} />
        </div>
        <div className="learn-progress-label">
          <span>
            {completed} of {steps.length} steps done
          </span>
          {completed > 0 && (
            <button type="button" className="learn-reset" onClick={reset}>
              Reset
            </button>
          )}
        </div>
      </div>

      <ol className="learn-steps">
        {steps.map((step, index) => {
          const isDone = done.includes(step.href);
          return (
            <li key={step.href} className={isDone ? "done" : ""}>
              <button
                type="button"
                className="learn-check"
                aria-pressed={isDone}
                aria-label={`Mark "${step.title}" as ${isDone ? "not done" : "done"}`}
                onClick={() => toggle(step.href)}
              >
                {isDone ? "✓" : index + 1}
              </button>
              <div className="learn-step-body">
                <div className="learn-step-head">
                  <Link href={step.href}>{step.title}</Link>
                  {step.optional && <span className="learn-tag">Optional</span>}
                </div>
                <p>{step.why}</p>
                <div className="learn-step-meta">
                  <span>{step.kind}</span>
                  <span className="sep">·</span>
                  <span>{step.minutes} min</span>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
