import path from 'path'
import { notFound } from 'next/navigation'
import DocRenderer from '@/app/components/DocRenderer'
import { getContentDocsDir } from '@/app/lib/getContentDocsDir'
import { listMarkdownSlugs } from '@/app/lib/listMarkdownSlugs'
import { readMarkdownFile } from '@/app/lib/readMarkdownFile'

type Props = {
  params: {
    slug: string
  }
}

// no revalidation; static
export const revalidate = false

function normalizeSlug(slug: string | undefined): string {
  if (!slug || typeof slug !== 'string' || slug.trim().length === 0) {
    return ''
  }
  return slug.replace(/\.md$/i, '')
}

export function generateStaticParams() {
  // only include files under content/blog
  const blogDir = path.join(getContentDocsDir(), '../blog')
  return listMarkdownSlugs(blogDir)
    .filter((slug) => Array.isArray(slug) && slug.length > 0)
    .filter((slug) => !(slug.length === 1 && slug[0] === 'index'))
    .map((slug) => ({ slug: slug.join('/') }))
}

export default async function Page({ params }: Props) {
  const resolvedParams = await Promise.resolve(params)
  if (!resolvedParams || !resolvedParams.slug || typeof resolvedParams.slug !== 'string') {
    return notFound()
  }
  const normalizedSlug = normalizeSlug(resolvedParams.slug)
  if (!normalizedSlug) {
    return notFound()
  }

  const mdPath = path.join(getContentDocsDir(), '../blog', normalizedSlug + '.md')
  const source = readMarkdownFile(mdPath)
  if (!source) {
    return notFound()
  }
  return <DocRenderer source={source} />
}
