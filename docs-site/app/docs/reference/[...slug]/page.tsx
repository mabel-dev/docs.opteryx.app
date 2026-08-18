import fs from 'fs'
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

  // `content/docs/reference/` holds the few reference pages that are written by
  // hand rather than generated (the api and python section landing pages). A file
  // here that ALSO exists in the generated tree is a shadow: whichever one loses
  // is never served, and nothing says so. That is not hypothetical — three copies
  // dated 27 June sat on top of data-types, functions and aggregates, so the docs
  // shipped stale SQL while `make sql-docs` rewrote pages nobody could reach.
  // Generated wins (see the candidate order below) and a collision fails the build.
  const contentReferenceDir = path.join(getContentDocsDir(), 'reference')
  const shadowed: string[] = []
  for (const slugParts of listMarkdownSlugs(contentReferenceDir)) {
    const slug = slugParts.join('/')
    slugs.add(slug)
    if (fs.existsSync(path.join(getReferenceDir(), ...slugParts) + '.md')) {
      shadowed.push(slug)
    }
  }

  if (shadowed.length > 0) {
    throw new Error(
      `content/docs/reference/ shadows generated reference pages: ${shadowed.join(', ')}. ` +
        'Both files claim the same URL and only one can be served. Delete the ' +
        'content/docs/reference/ copy, or move the page out of the generated tree.'
    )
  }

  return [...slugs]
    .filter(Boolean)
    .map((slug) => ({ slug: slug.split('/').filter(Boolean) }))
}

export default async function Page({ params }: Props) {
  // In Next.js 16, params might be a Promise
  const resolvedParams = await Promise.resolve(params)
  
  if (!resolvedParams || !resolvedParams.slug || !Array.isArray(resolvedParams.slug)) {
    return notFound()
  }

  const normalizedSlug = normalizeSlug(resolvedParams.slug)
  if (normalizedSlug.length === 0) {
    return notFound()
  }

  const docsPath = `/docs/reference/${normalizedSlug.join('/')}`
  const mappedRelativePath = getReferenceMdPathForDocsPath(docsPath)

  // Generated pages first. `content/docs/reference/` is the fallback for the
  // hand-written pages that have no generated counterpart; it must never take
  // precedence, or a stale hand-written copy silently buries the real page.
  const candidates: string[] = []

  if (mappedRelativePath) {
    candidates.push(path.join(getReferenceDir(), mappedRelativePath))
  }

  candidates.push(path.join(getReferenceDir(), ...normalizedSlug) + '.md')
  candidates.push(path.join(getContentDocsDir(), 'reference', ...normalizedSlug) + '.md')

  for (const candidatePath of candidates) {
    const source = readMarkdownFile(candidatePath)

    if (source) {
      return <DocRenderer source={source} />
    }
  }

  return notFound()
}
