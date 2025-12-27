import fs from 'fs-extra'
import yaml from 'js-yaml'
import path from 'path'

const ROOT = path.resolve(process.cwd(), '..') // repo root
const MKDOCS = path.join(ROOT, 'mkdocs.yml')
const DOCS_DIR = path.join(ROOT, 'docs')
const OUT_DIR = path.join(process.cwd(), 'app', 'docs')
const PUBLIC_DIR = path.join(process.cwd(), 'public', 'docs')

async function main(){
  if(!fs.existsSync(MKDOCS)){
    console.error('mkdocs.yml not found in repo root')
    process.exit(1)
  }

  const mk = yaml.load(await fs.readFile(MKDOCS, 'utf8'))
  await fs.remove(OUT_DIR)
  await fs.ensureDir(OUT_DIR)
  await fs.ensureDir(PUBLIC_DIR)

  // copy assets (anything under docs that is not .md into public/docs)
  const entries = await fs.readdir(DOCS_DIR)
  for(const entry of entries){
    const p = path.join(DOCS_DIR, entry)
    const stat = await fs.stat(p)
    if(stat.isDirectory()){
      // copy non-md assets recursively
      await fs.copy(p, path.join(PUBLIC_DIR, entry), {
        filter: (src) => !src.endsWith('.md')
      })
    }
  }

  // Walk docs and copy .md files into app/docs/<path>/page.mdx
  async function walkAndCopy(dir, relative=''){
    const items = await fs.readdir(dir)
    for(const it of items){
      const p = path.join(dir, it)
      const stat = await fs.stat(p)
      if(stat.isDirectory()){
        await walkAndCopy(p, path.join(relative, it))
      } else if(it.endsWith('.md')){
        const content = await fs.readFile(p, 'utf8')
        const destDir = path.join(OUT_DIR, relative)
        await fs.ensureDir(destDir)
        const title = it.replace(/\.md$/, '').replace(/[-_]/g,' ')
        const outFile = path.join(destDir, it.replace(/\.md$/, '.mdx'))
        const mdxContent = `---\ntitle: ${title}\n---\n\n${content}`
        await fs.writeFile(outFile, mdxContent)
      }
    }
  }

  await walkAndCopy(DOCS_DIR)

  // Generate a simple nav.json from mk.nav if present
  const nav = mk.nav || []
  await fs.writeFile(path.join(process.cwd(),'nav.json'), JSON.stringify(nav, null, 2))

  console.log('Migration complete. Pages written to', OUT_DIR)
  console.log('Assets copied into', PUBLIC_DIR)
}

main().catch(err=>{console.error(err); process.exit(1)})
