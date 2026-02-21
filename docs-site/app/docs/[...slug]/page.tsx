import path from 'path'
import { notFound } from 'next/navigation'
import DocRenderer from '@/app/components/DocRenderer'
import { getContentDocsDir } from '@/app/lib/getContentDocsDir'
import { listMarkdownSlugs } from '@/app/lib/listMarkdownSlugs'
import { readMarkdownFile } from '@/app/lib/readMarkdownFile'

type Props = {
  params: {
    slug: string[]
  }
}

function normalizeSlug(slug: string[] | undefined): string[] {
  if (!slug || !Array.isArray(slug) || slug.length === 0) {
    return []
  }

  const normalized = [...slug]
  const lastIndex = normalized.length - 1
  normalized[lastIndex] = normalized[lastIndex].replace(/\.md$/i, '')
  return normalized
}

export function generateStaticParams() {
  const contentDir = getContentDocsDir()

  return listMarkdownSlugs(contentDir)
    .filter((slug) => Array.isArray(slug) && slug.length > 0)
    .filter((slug) => !(slug.length === 1 && slug[0] === 'index'))
    .filter((slug) => !(slug[0] === 'reference' && slug.length > 1))
    .map((slug) => ({ slug }))
}

export default function Page({ params }: Props) {
  if (!params || !params.slug || !Array.isArray(params.slug)) {
    return notFound()
  }

  const normalizedSlug = normalizeSlug(params.slug)
  if (normalizedSlug.length === 0) {
    return notFound()
  }

  const mdPath = path.join(getContentDocsDir(), ...normalizedSlug) + '.md'
  const source = readMarkdownFile(mdPath)

  if (!source) {
    return notFound()
  }

  return <DocRenderer source={source} />
}
