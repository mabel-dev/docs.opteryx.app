import React from 'react'
import nav from '../nav.json'
import Link from 'next/link'

export default function DocsLayout({children}:{children:React.ReactNode}){
  return (
    <div style={{display:'flex'}}>
      <aside style={{width:260,padding:20,borderRight:'1px solid #eee'}}>
        <h3>Docs</h3>
        <nav>
          {nav.map((item:any, i:number)=>{
            const key = Object.keys(item)[0]
            const val = item[key]
            if(typeof val === 'string'){
              const href = `/docs/${val.replace(/\.md$/, '')}`
              return <div key={i}><Link href={href}>{key}</Link></div>
            }
            if(Array.isArray(val)){
              return <div key={i}><div style={{fontWeight:600}}>{key}</div>{val.map((sub:any, j:number)=>{
                const subKey = Object.keys(sub)[0]
                const subVal = sub[subKey]
                const href = `/docs/${subVal.replace(/\.md$/, '')}`
                return <div key={j} style={{marginLeft:8}}><Link href={href}>{subKey}</Link></div>
              })}</div>
            }
            return null
          })}
        </nav>
      </aside>
      <main style={{flex:1,padding:24}}>{children}</main>
    </div>
  )
}
