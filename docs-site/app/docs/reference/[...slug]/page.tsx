import path from 'path'
import { notFound } from 'next/navigation'
import DocRenderer from '@/app/components/DocRenderer'
import { getContentDocsDir } from '@/app/lib/getContentDocsDir'
import { getReferenceDir } from '@/app/lib/getReferenceDir'
import { getReferenceDocsPaths, getReferenceMdPathForDocsPath } from '@/app/lib/docsNav'
import { listMarkdownSlugs } from '@/app/lib/listMarkdownSlugs'
import { readMarkdownFile } from '@/app/lib/readMarkdownFile'

type Props = {
  params: {
    slug: string[]
  }
}

// Ensure this route is statically generated with no revalidation
export const revalidate = false

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
  const slugs = new Set<string>()

  for (const docsPath of getReferenceDocsPaths()) {
    if (!docsPath.startsWith('/docs/reference/')) {
      continue
    }

    const slug = docsPath.slice('/docs/reference/'.length)
    if (slug) {
      slugs.add(slug)
    }
  }

  const contentReferenceDir = path.join(getContentDocsDir(), 'reference')
  for (const slugParts of listMarkdownSlugs(contentReferenceDir)) {
    slugs.add(slugParts.join('/'))
  }

  return [...slugs]
    .filter(Boolean)
    .map((slug) => ({ slug: slug.split('/').filter(Boolean) }))
}

export default function Page({ params }: Props) {
  if (!params || !params.slug || !Array.isArray(params.slug)) {
    return notFound()
  }

  const normalizedSlug = normalizeSlug(params.slug)
  if (normalizedSlug.length === 0) {
    return notFound()
  }

  const docsPath = `/docs/reference/${normalizedSlug.join('/')}`
  const mappedRelativePath = getReferenceMdPathForDocsPath(docsPath)

  const candidates: string[] = []

  candidates.push(path.join(getContentDocsDir(), 'reference', ...normalizedSlug) + '.md')

  if (mappedRelativePath) {
    candidates.push(path.join(getReferenceDir(), mappedRelativePath))
  }

  candidates.push(path.join(getReferenceDir(), ...normalizedSlug) + '.md')

  for (const candidatePath of candidates) {
    const source = readMarkdownFile(candidatePath)

    if (source) {
      return <DocRenderer source={source} />
    }
  }

  return notFound()
}
