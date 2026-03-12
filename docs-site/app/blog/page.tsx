import DocRenderer from '@/app/components/DocRenderer'
import path from 'path'
import { readMarkdownFile } from '@/app/lib/readMarkdownFile'
import { getContentDocsDir } from '@/app/lib/getContentDocsDir'

export default function Page() {
  // build list of blog posts dynamically
  const blogDir = path.join(getContentDocsDir(), '../blog')
  let postLinks = ''
  try {
    const files = require('fs')
      .readdirSync(blogDir)
      .filter((f: string) => f.endsWith('.md'))
      .sort()

    if (files.length) {
      postLinks = '\n## Posts\n' +
        files
          .map((f: string) => {
            const title = f.replace(/\d{4}-\d{2}-\d{2}-/, '').replace(/\.md$/, '').replace(/-/g, ' ')
            return `- [${title}](/blog/${f.replace(/\.md$/, '')})`
          })
          .join('\n')
    }
  } catch {
    // ignore if dir missing
  }

  const source = readMarkdownFile(path.join(blogDir, 'index.md'))

  const content = source || `# Engineering Blog\n\nThis section will contain the latest posts from the engineering team.  \n` +
    `Please check back soon for updates.`

  return <DocRenderer source={content + postLinks} />
}
