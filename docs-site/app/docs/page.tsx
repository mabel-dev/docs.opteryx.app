import path from 'path'
import { notFound } from 'next/navigation'
import DocRenderer from '@/app/components/DocRenderer'
import { getContentDocsDir } from '@/app/lib/getContentDocsDir'
import { readMarkdownFile } from '@/app/lib/readMarkdownFile'

export default function Page() {
  const source = readMarkdownFile(path.join(getContentDocsDir(), 'index.md'))

  if (!source) {
    return notFound()
  }

  return <DocRenderer source={source} />
}
