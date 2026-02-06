import { getReferenceDir } from '@/app/lib/getReferenceDir'
import fs from 'fs'
import path from 'path'
import DocRenderer from '@/app/components/DocRenderer'

export default function Page(){
  const mdPath = path.join(getReferenceDir(), 'sql', 'functions', 'cast.md')
  const source = fs.readFileSync(mdPath, 'utf8')
  return <DocRenderer source={source} />
}
