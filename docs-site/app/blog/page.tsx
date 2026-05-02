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

  const posts: PostMeta[] = [];

  try {
    const files = fs.readdirSync(resolvedBlogDir).filter((f) => {
      const lower = f.toLowerCase();
      return (
        (lower.endsWith(".md") || lower.endsWith(".mdx")) &&
        lower !== "index.md" &&
        lower !== "index.mdx"
      );
    });

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

  const firstPost = posts[0];

  return (
    <main className="page">
      <section className="index-masthead-simple">
        <div className="eyebrow">Engineering Blog</div>
        <h1>
          Written by the people
          <br />
          who built <em>Opteryx.</em>
        </h1>
        <p className="lede">
          Engine internals, query planning, storage, and the occasional field
          note. No fluff.
        </p>
      </section>

      {firstPost && (
        <section className="lead">
          <Link href={`/blog/${firstPost.slug}`} className="lead-card">
            <div className="lead-art">
              <div className="lead-art-stripes" aria-hidden="true" />
              <div className="lead-art-panel">
                <span className="lbl">{firstPost.slug}</span>
                <span className="ln">
                  <span className="tok-kw">SELECT</span> *{" "}
                  <span className="tok-kw">FROM</span>{" "}
                  <span className="tok-fn">insights</span>
                </span>
                <span className="ln">
                  <span className="tok-com">
                    -- {firstPost.description || firstPost.title}
                  </span>
                </span>
              </div>
            </div>
            <div className="lead-body">
              <div className="lead-cat">Latest post</div>
              <h2>{firstPost.title}</h2>
              {firstPost.description && <p>{firstPost.description}</p>}
              <div className="lead-foot">
                <span className="author-avatar">JJ</span>
                <span className="who">Justin Joyce</span>
                {firstPost.date && (
                  <>
                    <span className="sep">·</span>
                    <span>{firstPost.date}</span>
                  </>
                )}
              </div>
            </div>
          </Link>
        </section>
      )}

      {posts.length > 1 && (
        <>
          <div className="grid-heading">
            <h3>More posts</h3>
          </div>
          <section className="card-grid">
            {posts.slice(1).map((post, i) => {
              const tones = ["tone-teal", "tone-orange", "tone-navy"];
              const tone = tones[i % 3];
              return (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="post-card"
                >
                  <div className={`post-card-art ${tone}`}>
                    <span className="art-glyph">
                      {post.slug
                        .replace(/\d{4}-\d{2}-\d{2}-/, "")
                        .replace(/-/g, " ")
                        .slice(0, 12)
                        .toUpperCase()}
                    </span>
                  </div>
                  <div className="post-card-body">
                    <div className="post-card-cat">Engineering</div>
                    <h3>{post.title}</h3>
                    {post.description && <p>{post.description}</p>}
                    <div className="post-card-foot">
                      {post.date && <span>{post.date}</span>}
                    </div>
                  </div>
                </Link>
              );
            })}
          </section>
        </>
      )}
    </main>
  );
}
