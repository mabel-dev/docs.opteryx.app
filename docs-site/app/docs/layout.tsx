import React from 'react'
import TopNav from '@/app/components/TopNav'
import DocsSidebar from '@/app/components/DocsSidebar'

export const metadata = { title: 'Docs — Opteryx' }

export default function DocsLayout({ children }: { children: React.ReactNode }){
  return (
    <div className="min-h-screen bg-gray-50">
      <TopNav />
      <div className="docs-layout max-w-7xl mx-auto px-4 mt-8 lg:flex lg:gap-8">
        <DocsSidebar />
        <div className="docs-main flex-1 lg:pt-2">
          {children}
        </div>
      </div>
    </div>
  )
}
