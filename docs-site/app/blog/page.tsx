import Link from 'next/link'
import path from 'path'
import fs from 'fs'
import { readMarkdownFile } from '@/app/lib/readMarkdownFile'
import { getContentDocsDir } from '@/app/lib/getContentDocsDir'

function parseFrontmatter(source: string) {
  const match = source.match(/^---\n([\s\S]*?)\n---\n/)
  if (!match) return { frontmatter: {}, body: source }
  const yaml = match[1]
  const body = source.slice(match[0].length)

  const fm: Record<string, any> = {}
  for (const line of yaml.split('\n')) {
    const idx = line.indexOf(':')
    if (idx === -1) continue
    const key = line.slice(0, idx).trim()
    let val = line.slice(idx + 1).trim()
    if (val.startsWith('"') && val.endsWith('"')) {
      val = val.slice(1, -1)
    }
    fm[key] = val
  }

  return { frontmatter: fm, body }
}

type PostMeta = {
  slug: string
  title: string
  description?: string
  date?: string
}

export default function Page() {
  const blogDir = path.join(getContentDocsDir(), '../blog')
  const indexMarkdown = readMarkdownFile(path.join(blogDir, 'index.md'))

  const posts: PostMeta[] = []
  try {
    const files = fs
      .readdirSync(blogDir)
      .filter((f) => {
        const lower = f.toLowerCase()
        return (lower.endsWith('.md') || lower.endsWith('.mdx')) && lower !== 'index.md' && lower !== 'index.mdx'
      })

    for (const file of files) {
      const slug = file.replace(/\.(md|mdx)$/i, '')
      const fullPath = path.join(blogDir, file)
      const raw = fs.readFileSync(fullPath, 'utf8')
      const { frontmatter } = parseFrontmatter(raw)
      const title =
        (frontmatter.title as string) ||
        slug.replace(/\d{4}-\d{2}-\d{2}-/, '').replace(/-/g, ' ')
      const description = frontmatter.description as string | undefined
      const date = frontmatter.date as string | undefined

      posts.push({ slug, title, description, date })
    }
  } catch (err) {
    // ignore if dir missing
  }

  posts.sort((a, b) => {
    if (a.date && b.date) return b.date.localeCompare(a.date)
    if (a.date) return -1
    if (b.date) return 1
    return a.title.localeCompare(b.title)
  })

  return (
    <div className="max-w-4xl mx-auto px-3 py-4">
      <div className="prose">
        <DocRenderer source={indexMarkdown || '# Engineering Blog\n\nThis section will contain the latest posts from the engineering team.\n'} />
      </div>

      {posts.length > 0 && (
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="block rounded-lg border border-gray-200 bg-white p-5 shadow-sm hover:border-opteryx-teal hover:shadow-md transition"
            >
              <h3 className="text-lg font-semibold">{post.title}</h3>
              {post.date ? <p className="text-sm text-gray-500">{post.date}</p> : null}
              {post.description ? <p className="mt-2 text-gray-700">{post.description}</p> : null}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
