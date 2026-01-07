import React from 'react'
import TopNav from '@/app/components/TopNav'
import DocsSidebar from '@/app/components/DocsSidebar'
import Breadcrumbs from '@/app/components/Breadcrumbs'
import TableOfContents from '@/app/components/TableOfContents'
import DocsFooter from '@/app/components/DocsFooter'

export const metadata = { title: 'Tutorials — Opteryx' }

export default function TutorialsLayout({ children }: { children: React.ReactNode }){
  return (
    <div className="min-h-screen bg-white">
      <TopNav />
      <div className="docs-layout flex w-full">
        <DocsSidebar />
        <div className="docs-main flex-1 min-w-0">
          <div className="max-w-4xl mx-auto px-3 py-4">
            <Breadcrumbs />
            {children}
            <DocsFooter />
          </div>
        </div>
        <TableOfContents />
      </div>
    </div>
  )
}
