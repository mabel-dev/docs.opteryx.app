import fs from 'fs'
import path from 'path'
import DocRenderer from '@/app/components/DocRenderer'
import { notFound } from 'next/navigation'

type Props = { params: { slug: string } }

export default function Page({ params }: Props){
  const { slug } = params
  const mdPath = path.join(process.cwd(), 'reference', 'api', `${slug}.md`)

  if (!fs.existsSync(mdPath)) {
    return notFound()
  }

  const source = fs.readFileSync(mdPath, 'utf8')
  return <DocRenderer source={source} />
}
