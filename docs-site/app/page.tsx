import React from 'react'
import TopNav from './components/TopNav'
import Hero from './components/Hero'
import FeaturedGrid from './components/FeaturedGrid'
import Footer from './components/Footer'

const cards = [
  { title: 'Quick start', desc: 'Run your first query in minutes and explore Opteryx capabilities.', href: '/docs/getting-started/quick-start', icon: '/docs/assets/images/icon-getting-started.svg' },
  { title: 'Architecture', desc: 'Read about the execution engine, planner, and optimizer internals.', href: '/docs/architecture/execution-engine', icon: '/docs/assets/images/icon-architecture.svg' },
  { title: 'Security & permissions', desc: 'How to secure access, configure roles, and manage permissions.', href: '/docs/operations/security-permissions', icon: '/docs/assets/images/icon-security.svg' }
]

export default function Page(){
  return (
    <div className="min-h-screen bg-gray-50">
      <TopNav />
      <main>
        <Hero />
        <FeaturedGrid cards={cards} />
      </main>
      <Footer />
    </div>
  )
}
