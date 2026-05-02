import fs from "fs";
import path from "path";
import Link from "next/link";
import { notFound } from "next/navigation";
import DocRenderer from "@/app/components/DocRenderer";
import { getContentDocsDir } from "@/app/lib/getContentDocsDir";
import { listMarkdownSlugs } from "@/app/lib/listMarkdownSlugs";
import { readMarkdownFile } from "@/app/lib/readMarkdownFile";

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

  const posts = readBlogPosts(blogDir);
  const latest = posts[0];
  const showLatest = latest && latest.slug !== normalizedSlug;

  return (
    <>
      <DocRenderer source={source} />

      <div
        style={{
          marginTop: "48px",
          borderRadius: "var(--r-s)",
          border: "1px solid var(--border)",
          background: "var(--opteryx-pale-teal)",
          padding: "28px 32px",
        }}
      >
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 600,
            fontSize: "16px",
            color: "var(--text-deep)",
            margin: "0 0 16px",
          }}
        >
          Recent posts
        </h2>

        {showLatest ? (
          <>
            <Link
              href={`/blog/${latest.slug}`}
              className="lp-ed-tile"
              style={{
                display: "block",
                textDecoration: "none",
                maxWidth: "360px",
              }}
            >
              {latest.image ? (
                <div
                  style={{
                    marginBottom: "12px",
                    height: "140px",
                    overflow: "hidden",
                    borderRadius: "var(--r-m)",
                    background: "var(--panel)",
                  }}
                >
                  <img
                    src={latest.image}
                    alt={latest.title}
                    style={{
                      height: "100%",
                      width: "100%",
                      objectFit: "cover",
                    }}
                  />
                </div>
              ) : null}
              <h3
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 600,
                  fontSize: "16px",
                  color: "var(--text-deep)",
                  margin: "0 0 6px",
                }}
              >
                {latest.title}
              </h3>
              {latest.date ? (
                <p
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "12px",
                    color: "var(--muted)",
                    margin: "0 0 6px",
                  }}
                >
                  {latest.date}
                </p>
              ) : null}
              {latest.description ? (
                <p
                  style={{
                    fontSize: "13px",
                    color: "var(--muted)",
                    lineHeight: 1.55,
                    margin: 0,
                  }}
                >
                  {latest.description}
                </p>
              ) : null}
            </Link>
            <div style={{ marginTop: "16px" }}>
              <Link
                href="/blog"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  fontFamily: "var(--font-display)",
                  fontWeight: 600,
                  fontSize: "13px",
                  color: "var(--opteryx-teal)",
                  border: "1px solid var(--opteryx-teal)",
                  borderRadius: "var(--r-m)",
                  padding: "7px 14px",
                  background: "#fff",
                  textDecoration: "none",
                }}
              >
                All blog posts
              </Link>
            </div>
          </>
        ) : (
          <Link
            href="/blog"
            style={{
              display: "inline-flex",
              alignItems: "center",
              fontFamily: "var(--font-display)",
              fontWeight: 600,
              fontSize: "13px",
              color: "var(--opteryx-teal)",
              border: "1px solid var(--opteryx-teal)",
              borderRadius: "var(--r-m)",
              padding: "7px 14px",
              background: "#fff",
              textDecoration: "none",
            }}
          >
            All blog posts
          </Link>
        )}
      </div>
    </>
  );
}
