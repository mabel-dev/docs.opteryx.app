import path from "path";
import Link from "next/link";
import { notFound } from "next/navigation";
import CodeCopy from "@/app/components/CodeCopy";
import LearnProgress from "@/app/components/LearnProgress";
import { getLearnContentDir } from "@/app/lib/getLearnContentDir";
import {
  getLearnPath,
  learnPaths,
  requiredMinutes,
} from "@/app/lib/learnPaths";
import { readMarkdownFile } from "@/app/lib/readMarkdownFile";
import { renderMarkdownToHtml } from "@/app/lib/renderMarkdown";

type Props = {
  params: Promise<{ path: string }>;
};

// Static export: every path is known from learn.json at build time.
export const revalidate = false;

export function generateStaticParams() {
  return learnPaths.map((learnPath) => ({ path: learnPath.slug }));
}

export async function generateMetadata({ params }: Props) {
  const resolved = await params;
  const learnPath = getLearnPath(resolved?.path ?? "");
  if (!learnPath) {
    return { title: "Learn — Opteryx" };
  }
  return {
    title: `${learnPath.title} path — Learn — Opteryx`,
    description: `${learnPath.headline}. ${learnPath.persona}`,
  };
}

export default async function Page({ params }: Props) {
  const resolved = await params;
  const learnPath = getLearnPath(resolved?.path ?? "");

  if (!learnPath) {
    return notFound();
  }

  const exerciseSource = readMarkdownFile(
    path.join(getLearnContentDir(), learnPath.exercise),
  );
  const exerciseHtml = exerciseSource
    ? await renderMarkdownToHtml(exerciseSource, {
        addHeadingIds: true,
        transformCallouts: true,
      })
    : "";

  const nextPaths = learnPath.next
    .map((slug) => getLearnPath(slug))
    .filter((p): p is NonNullable<typeof p> => p !== null);

  return (
    <>
      <nav className="breadcrumbs">
        <span className="crumb">
          <Link href="/learn">Learn</Link>
        </span>
        <span className="crumb">
          <span className="crumb-sep">/</span>
          <span className="current-crumb">{learnPath.title}</span>
        </span>
      </nav>

      <article className="docs-article learn-path">
        <div className="eyebrow">Learning path · {learnPath.title}</div>
        <h1>{learnPath.headline}</h1>
        <p className="lede">{learnPath.persona}</p>
        <div className="learn-meta">
          <span>{learnPath.steps.length} steps</span>
          <span className="sep">·</span>
          <span>{requiredMinutes(learnPath)} min of reading</span>
          <span className="sep">·</span>
          <span>{learnPath.time} with the exercise</span>
        </div>

        <h2 id="what-you-will-be-able-to-do">What you&apos;ll be able to do</h2>
        <ul>
          {learnPath.outcomes.map((outcome) => (
            <li key={outcome}>{outcome}</li>
          ))}
        </ul>

        <h3 id="before-you-start">Before you start</h3>
        <ul>
          {learnPath.prerequisites.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>

        <h2 id="the-path">The path</h2>
        <p>
          Work through these in order. Each one is an existing docs page; the
          note under it says why it is on this path. Tick a step when you are
          done with it. Progress is remembered by this browser only.
        </p>
        <LearnProgress slug={learnPath.slug} steps={learnPath.steps} />

        <div
          className="learn-exercise"
          dangerouslySetInnerHTML={{ __html: exerciseHtml }}
        />

        <h2 id="where-next">Where next</h2>
        <div className="learn-next">
          {nextPaths.map((next) => (
            <Link
              key={next.slug}
              href={`/learn/${next.slug}`}
              className={`learn-next-card tone-${next.tone}`}
            >
              <span className="learn-next-label">{next.title} path</span>
              <span className="learn-next-title">{next.headline}</span>
            </Link>
          ))}
        </div>
      </article>
      <CodeCopy />
    </>
  );
}
