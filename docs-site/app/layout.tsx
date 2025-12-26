import './globals.css'
import React from 'react'

export const metadata = {
  title: 'Opteryx Docs',
  description: 'Documentation for Opteryx'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header style={{height:64,display:'flex',alignItems:'center',padding:'0 24px',borderBottom:'1px solid #eee'}}>
          <div style={{fontWeight:700}}>Opteryx Documentation</div>
        </header>
        <main>{children}</main>
      </body>
    </html>
  )
}
