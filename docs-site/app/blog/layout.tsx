import React from 'react'
import TopNav from '@/app/components/TopNav'

export const metadata = { title: 'Engineering Blog — Opteryx' }

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <TopNav />
      <div className="max-w-4xl mx-auto px-3 py-4">
        {children}
      </div>
    </div>
  )
}
