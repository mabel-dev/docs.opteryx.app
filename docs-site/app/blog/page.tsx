import DocRenderer from "@/app/components/DocRenderer";
import Link from "next/link";
import path from "path";
import fs from "fs";
import { readMarkdownFile } from "@/app/lib/readMarkdownFile";
import { getContentDocsDir } from "@/app/lib/getContentDocsDir";

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

export const dynamic = "force-dynamic";

type PostMeta = {
  slug: string;
  title: string;
  description?: string;
  date?: string;
  image?: string;
};

export default function Page() {
  const defaultBlogDir = path.join(process.cwd(), "content", "blog");
  const blogDir = path.join(getContentDocsDir(), "../blog");
  const resolvedBlogDir = fs.existsSync(defaultBlogDir)
    ? defaultBlogDir
    : blogDir;
  const indexMarkdown = readMarkdownFile(
    path.join(resolvedBlogDir, "index.md"),
  );

  const posts: PostMeta[] = [];
  const postFiles: string[] = [];
  const debug = process.env.DEBUG_BLOG === "1";

  try {
    const files = fs.readdirSync(resolvedBlogDir).filter((f) => {
      const lower = f.toLowerCase();
      return (
        (lower.endsWith(".md") || lower.endsWith(".mdx")) &&
        lower !== "index.md" &&
        lower !== "index.mdx"
      );
    });

    postFiles.push(...files);

    for (const file of files) {
      const slug = file.replace(/\.(md|mdx)$/i, "");
      const fullPath = path.join(resolvedBlogDir, file);
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
  } catch (err) {
    // ignore if dir missing
  }

  posts.sort((a, b) => {
    if (a.date && b.date) return b.date.localeCompare(a.date);
    if (a.date) return -1;
    if (b.date) return 1;
    return a.title.localeCompare(b.title);
  });

  return (
    <>
      <DocRenderer
        source={
          indexMarkdown ||
          "# Engineering Blog\n\nThis section will contain the latest posts from the engineering team.\n"
        }
      />

      {posts.length > 0 && (
        <div
          style={{
            marginTop: "40px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "20px",
          }}
        >
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="lp-ed-tile"
              style={{ display: "block", textDecoration: "none" }}
            >
              {post.image ? (
                <div
                  style={{
                    marginBottom: "16px",
                    height: "160px",
                    overflow: "hidden",
                    borderRadius: "var(--r-m)",
                    background: "var(--panel)",
                  }}
                >
                  <img
                    src={post.image}
                    alt={post.title}
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
                  fontSize: "17px",
                  color: "var(--text-deep)",
                  margin: "0 0 6px",
                }}
              >
                {post.title}
              </h3>
              {post.date ? (
                <p
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "12px",
                    color: "var(--muted)",
                    margin: "0 0 8px",
                  }}
                >
                  {post.date}
                </p>
              ) : null}
              {post.description ? (
                <p
                  style={{
                    fontSize: "14px",
                    color: "var(--muted)",
                    lineHeight: 1.55,
                    margin: 0,
                  }}
                >
                  {post.description}
                </p>
              ) : null}
            </Link>
          ))}
        </div>
      )}

      {process.env.DEBUG_BLOG === "1" && (
        <pre
          style={{
            marginTop: "32px",
            padding: "16px",
            background: "var(--muted-surface)",
            fontSize: "12px",
            color: "var(--text)",
            borderRadius: "var(--r-m)",
          }}
        >
          {JSON.stringify({ resolvedBlogDir, postFiles, posts }, null, 2)}
        </pre>
      )}
    </>
  );
}
