import fs from 'fs'
import path from 'path'
import DocRenderer from '@/app/components/DocRenderer'

export default function Page(){
  const mdPath = path.join(process.cwd(), '..', 'sql-reference', 'supported-sql.md')
  let source = ''
  try { source = fs.readFileSync(mdPath, 'utf8') } catch(e) { source = '# Supported SQL\n\nContent not found.' }
  source = source.replace(/^---\n[\s\S]*?\n---\n/, '')
  return <DocRenderer source={source} />
}
