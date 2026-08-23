import fs from "fs";
import path from "path";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getContentDocsDir } from "@/app/lib/getContentDocsDir";
import { renderMarkdownToHtml } from "@/app/lib/renderMarkdown";
import { listMarkdownSlugs } from "@/app/lib/listMarkdownSlugs";
import { readMarkdownFile } from "@/app/lib/readMarkdownFile";
import BlogPostTOC from "@/app/blog/BlogPostTOC";

type Props = {
  params: {
    slug: string;
  };
};

// no revalidation; static
export const revalidate = false;

function normalizeSlug(slug: string | undefined): string {
  if (!slug || typeof slug !== "string" || slug.trim().length === 0) {
    return "";
  }
  return slug.replace(/\.md$/i, "");
}

function getContentBlogDir(): string {
  const cwd = process.cwd();
  const possiblePaths = [
    path.join(cwd, "content", "blog"),
    path.join(cwd, "../content", "blog"),
    path.join(cwd, "../docs-site/content/blog"),
  ];

  for (const contentDir of possiblePaths) {
    try {
      const stat = fs.statSync(contentDir);
      if (stat && stat.isDirectory()) {
        return contentDir;
      }
    } catch {
      // Try next candidate
    }
  }

  return path.join(cwd, "content", "blog");
}

function parseFrontmatter(source: string) {
  const match = source.match(/^---\n([\s\S]*?)\n---\n/);
  if (!match) return { frontmatter: {}, body: source };
  const yaml = match[1];
  const body = source.slice(match[0].length);

  const fm: Record<string, any> = {};
  for (const line of yaml.split("\n")) {
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    let val = line.slice(idx + 1).trim();
    if (val.startsWith('"') && val.endsWith('"')) {
      val = val.slice(1, -1);
    }
    fm[key] = val;
  }

  return { frontmatter: fm, body };
}

function readBlogPosts(blogDir: string): PostMeta[] {
  if (!fs.existsSync(blogDir)) return [];

  const posts: PostMeta[] = [];
  const files = fs.readdirSync(blogDir).filter((f) => {
    const lower = f.toLowerCase();
    return (
      (lower.endsWith(".md") || lower.endsWith(".mdx")) &&
      lower !== "index.md" &&
      lower !== "index.mdx"
    );
  });

  for (const file of files) {
    const slug = file.replace(/\.(md|mdx)$/i, "");
    const fullPath = path.join(blogDir, file);
    const raw = fs.readFileSync(fullPath, "utf8");
    const { frontmatter } = parseFrontmatter(raw);
    const title =
      (frontmatter.title as string) ||
      slug.replace(/\d{4}-\d{2}-\d{2}-/, "").replace(/-/g, " ");
    const description = frontmatter.description as string | undefined;
    const date = frontmatter.date as string | undefined;
    const image = frontmatter.image as string | undefined;

    posts.push({ slug, title, description, date, image });
  }

  posts.sort((a, b) => {
    if (a.date && b.date) return b.date.localeCompare(a.date);
    if (a.date) return -1;
    if (b.date) return 1;
    return a.title.localeCompare(b.title);
  });

  return posts;
}

type PostMeta = {
  slug: string;
  title: string;
  description?: string;
  date?: string;
  image?: string;
};

export function generateStaticParams() {
  // only include files under content/blog
  const blogDir = getContentBlogDir();
  return listMarkdownSlugs(blogDir)
    .filter((slug) => Array.isArray(slug) && slug.length > 0)
    .filter((slug) => !(slug.length === 1 && slug[0] === "index"))
    .map((slug) => ({ slug: slug.join("/") }));
}

// A post can name another URL as the copy that should own its search ranking,
// via a `canonical:` frontmatter key. This exists because the rugo log-analytics
// benchmark is published on both this site and rugo.dev; without a canonical the
// two copies compete and a search engine picks between them arbitrarily.
// Posts without the key emit nothing, so behaviour is unchanged for all of them.
export async function generateMetadata({ params }: Props) {
  const resolvedParams = await Promise.resolve(params);
  const normalizedSlug = normalizeSlug(resolvedParams?.slug);
  if (!normalizedSlug) return {};

  const mdPath = path.join(getContentBlogDir(), normalizedSlug + ".md");
  if (!fs.existsSync(mdPath)) return {};

  const { frontmatter } = parseFrontmatter(fs.readFileSync(mdPath, "utf8"));
  const canonical = frontmatter.canonical as string | undefined;
  if (!canonical) return {};

  return { alternates: { canonical } };
}

export default async function Page({ params }: Props) {
  const resolvedParams = await Promise.resolve(params);
  if (
    !resolvedParams ||
    !resolvedParams.slug ||
    typeof resolvedParams.slug !== "string"
  ) {
    return notFound();
  }
  const normalizedSlug = normalizeSlug(resolvedParams.slug);
  if (!normalizedSlug) {
    return notFound();
  }

  const blogDir = getContentBlogDir();
  const mdPath = path.join(blogDir, normalizedSlug + ".md");
  const source = readMarkdownFile(mdPath);
  if (!source) {
    return notFound();
  }

  // readMarkdownFile has already stripped the frontmatter, so parse the raw file
  // for the metadata and use `source` as the body.
  const { frontmatter } = parseFrontmatter(fs.readFileSync(mdPath, "utf8"));
  const postDate = frontmatter.date as string | undefined;
  const html = await renderMarkdownToHtml(source, {
    addHeadingIds: true,
    transformCallouts: true,
  });

  const posts = readBlogPosts(blogDir);
  const latest = posts[0];
  const showLatest = latest && latest.slug !== normalizedSlug;

  return (
    <>
      <div className="post-shell">
        {/* Left meta rail */}
        <aside className="post-meta-rail">
          <Link href="/blog" className="back-link">
            ← All posts
          </Link>
          <div className="meta-block">
            <div className="label">Author</div>
            <div className="meta-author">
              <span className="author-avatar">JJ</span>
              <div className="who">
                <div className="name">Justin Joyce</div>
                <div className="role">Maintainer</div>
              </div>
            </div>
          </div>
          {postDate && (
            <div className="meta-block">
              <div className="label">Published</div>
              <div className="value">{postDate}</div>
            </div>
          )}
        </aside>

        {/* Post body */}
        <article className="post-body">
          <div className="prose" dangerouslySetInnerHTML={{ __html: html }} />
          <div className="post-footer">
            <p className="post-disclaimer">
              {`This post was accurate at the time of publication${
                postDate ? ` (${postDate})` : ""
              }. Later releases may have changed the behaviour described here.`}
            </p>
            <div className="post-author-card">
              <span className="author-avatar">JJ</span>
              <div className="who">
                <div className="name">Justin Joyce</div>
                <div className="role">Maintainer, Opteryx</div>
                <p className="bio">
                  Building Opteryx — a read-only SQL engine for analytical
                  workloads on object storage.
                </p>
              </div>
            </div>
            {showLatest && (
              <div className="related">
                <h4>Related posts</h4>
                <div className="related-grid">
                  <Link href={`/blog/${latest.slug}`} className="related-card">
                    <div className="stamp">
                      <span className="tag-mini">latest</span>
                      {latest.date && <span>{latest.date}</span>}
                    </div>
                    <h5>{latest.title}</h5>
                    {latest.description && (
                      <p className="ex">{latest.description}</p>
                    )}
                  </Link>
                  <Link href="/blog" className="related-card">
                    <div className="stamp">
                      <span className="tag-mini">index</span>
                    </div>
                    <h5>All posts</h5>
                    <p className="ex">
                      Browse all engineering posts from the Opteryx team.
                    </p>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </article>

        {/* Right TOC — client component */}
        <BlogPostTOC />
      </div>
    </>
  );
}
