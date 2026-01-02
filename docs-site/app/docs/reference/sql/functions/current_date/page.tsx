import fs from 'fs'
import path from 'path'
import DocRenderer from '@/app/components/DocRenderer'

export default function Page(){
  const mdPath = path.join(process.cwd(), 'reference', 'sql', 'functions', 'current_date.md')
  const source = fs.readFileSync(mdPath, 'utf8')
  return <DocRenderer source={source} />
}
