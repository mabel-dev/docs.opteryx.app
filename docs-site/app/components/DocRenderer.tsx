import React from "react";
import { renderMarkdownToHtml } from "@/app/lib/renderMarkdown";
import CodeCopy from "@/app/components/CodeCopy";

type DocRendererProps = { source: string };

export default async function DocRenderer({ source }: DocRendererProps) {
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

  return (
    <div className="docs-main">
      <article
        className="docs-article"
        dangerouslySetInnerHTML={{ __html: html }}
      />
      <CodeCopy />
    </div>
  );
}
