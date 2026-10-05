import React from "react";
import { renderMarkdownToHtml } from "@/app/lib/renderMarkdown";
import CodeCopy from "@/app/components/CodeCopy";
import DocTabs from "@/app/components/DocTabs";
import { lastUpdated } from "@/app/lib/lastUpdated";

type DocRendererProps = { source: string; sourcePath?: string };

export default async function DocRenderer({ source, sourcePath }: DocRendererProps) {
  if (!source || typeof source !== "string" || source.trim().length === 0) {
    return (
      <div className="docs-main">
        <article className="docs-article">
          <p>No content available.</p>
        </article>
      </div>
    );
  }

  const html = await renderMarkdownToHtml(source, {
    addHeadingIds: true,
    transformCallouts: true,
  });
  const updated = sourcePath ? lastUpdated(sourcePath) : null;

  return (
    <div className="docs-main">
      <article
        className="docs-article"
        dangerouslySetInnerHTML={{ __html: html }}
      />
      {updated && <p className="docs-last-updated">Last updated {updated}</p>}
      <CodeCopy />
      <DocTabs />
    </div>
  );
}
