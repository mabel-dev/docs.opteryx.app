import fs from 'fs'
import path from 'path'
import DocRenderer from '@/app/components/DocRenderer'
import { notFound } from 'next/navigation'

type Props = { params: { slug: string } }

export function generateStaticParams() {
  const apiDir = path.join(process.cwd(), 'reference', 'api')
  const files = fs.readdirSync(apiDir)
  return files
    .filter(file => file.endsWith('.md'))
    .map(file => ({
      slug: file.replace('.md', '')
    }))
}

export default function Page({ params }: Props){
  const { slug } = params
  const mdPath = path.join(process.cwd(), 'reference', 'api', `${slug}.md`)

  if (!fs.existsSync(mdPath)) {
    return notFound()
  }

  const source = fs.readFileSync(mdPath, 'utf8')
  return <DocRenderer source={source} />
}
