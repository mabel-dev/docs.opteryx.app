import { getReferenceDir } from '@/app/lib/getReferenceDir'
import fs from 'fs'
import path from 'path'
import DocRenderer from '@/app/components/DocRenderer'
import { notFound } from 'next/navigation'

type Props = { params: { slug: string } }

export function generateStaticParams() {
  const referenceBase = getReferenceDir()
  const apiDir = path.join(referenceBase, 'api')
  
  if (!fs.existsSync(apiDir)) {
    console.error(`API directory not found at: ${apiDir}`)
    return []
  }
  
  const files = fs.readdirSync(apiDir)
  return files
    .filter(file => file.endsWith('.md'))
    .map(file => ({
      slug: file.replace('.md', '')
    }))
}

export default function Page({ params }: Props){
  const { slug } = params
  const referenceBase = getReferenceDir()
  const mdPath = path.join(referenceBase, 'api', `${slug}.md`)

  if (!fs.existsSync(mdPath)) {
    console.error(`Reference file not found at: ${mdPath}, cwd: ${getReferenceDir()}`)
    return notFound()
  }

  const source = fs.readFileSync(mdPath, 'utf8')
  return <DocRenderer source={source} />
}
