import Link from "next/link";
import TopNav from "@/app/components/TopNav";
import Footer from "@/app/components/Footer";
import { learnPaths, requiredMinutes } from "@/app/lib/learnPaths";

export const metadata = {
  title: "Learn — Opteryx",
  description:
    "Ordered learning paths through the Opteryx documentation for analysts, data engineers and developers, each ending in a hands-on exercise.",
};

export default function Page() {
  return (
    <>
      <TopNav />
      <main className="page">
        <section className="index-masthead-simple">
          <div className="eyebrow">Learn</div>
          <h1>
            Pick a path,
            <br />
            not a <em>page.</em>
          </h1>
          <p className="lede">
            The docs are a reference. These are routes through them: an ordered
            list of pages for the job you are doing, with a note on why each one
            is there, ending in an exercise you run against real data.
          </p>
        </section>

        <section className="card-grid learn-grid">
          {learnPaths.map((learnPath) => (
            <Link
              key={learnPath.slug}
              href={`/learn/${learnPath.slug}`}
              className="post-card"
            >
              <div className={`post-card-art tone-${learnPath.tone}`}>
                <span className="art-glyph">{learnPath.title.toUpperCase()}</span>
              </div>
              <div className="post-card-body">
                <div className="post-card-cat">Learning path</div>
                <h3>{learnPath.headline}</h3>
                <p>{learnPath.persona}</p>
                <div className="post-card-foot">
                  <span>{learnPath.steps.length} steps</span>
                  <span className="sep">·</span>
                  <span>{requiredMinutes(learnPath)} min reading</span>
                  <span className="sep">·</span>
                  <span>{learnPath.time}</span>
                </div>
              </div>
            </Link>
          ))}
        </section>

        <section className="learn-how">
          <div>
            <h3>Nothing to sign up for</h3>
            <p>
              No accounts, no badges. Every step is a page that already exists.
              Ticking steps off is remembered by this browser only.
            </p>
          </div>
          <div>
            <h3>Read in order</h3>
            <p>
              Each step assumes the ones before it. Skip a step if you already
              know the material, but do not reorder them.
            </p>
          </div>
          <div>
            <h3>Finish with your hands</h3>
            <p>
              Every path ends in an exercise on the public sample datasets, with
              a few questions to check the ideas stuck.
            </p>
          </div>
        </section>

        <section className="docs-section docs-help learn-help">
          <div className="docs-help-content">
            <h2>Not sure which path?</h2>
            <p>
              If you mostly write queries, start with Analyst. If you create
              tables other people read, Data engineer. If you are calling
              Opteryx from code, Developer. The paths cross-reference each other,
              so nothing is lost by picking wrong.
            </p>
            <Link href="/docs/introduction/when-to-use" className="btn-link">
              Or read When to use Opteryx first →
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
