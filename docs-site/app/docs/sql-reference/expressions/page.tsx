```tsx
import DocRenderer from '@/app/components/DocRenderer'

import fs from 'fs'
import path from 'path'
import DocRenderer from '@/app/components/DocRenderer'

export default function Page(){
  const mdPath = path.join(process.cwd(), 'sql-reference', 'expressions.md')
  let source = fs.readFileSync(mdPath, 'utf8')
  source = source.replace(/^---\n[\s\S]*?\n---\n/, '')
  return <DocRenderer source={source} />
}

