'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import SearchBox from './SearchBox'
import ThemeToggle from './ThemeToggle'

export default function SiteHeader() {
  const pathname = usePathname()

  const section = pathname.startsWith('/blog')
    ? 'Blog'
    : pathname.startsWith('/learn')
      ? 'Learn'
      : 'Docs'

  const navLinks = [
    { label: 'Home',     href: 'https://opteryx.app/' },
    { label: 'Docs',     href: '/docs' },
    { label: 'Learn',    href: '/learn' },
    { label: 'Blog',     href: '/blog' },
  ]

  return (
    <header className="blog-header">
      <div className="blog-header-inner">
        <a href="https://docs.opteryx.app/" className="blog-logo" style={{ textDecoration: 'none' }}>
          <Image src="/opteryx-icon.svg" alt="Opteryx" width={22} height={22} />
          <span>Opteryx<span className="logo-suffix"> Documentation</span></span>
          <span className="sep">/</span>
          <span className="pill">{section}</span>
        </a>
        <nav className="blog-nav">
          {navLinks.map(({ label, href }) =>
            href.startsWith('http') ? (
              <a key={href} href={href}>{label}</a>
            ) : (
              <Link
                key={href}
                href={href}
                className={pathname.startsWith(href) ? 'active' : ''}
              >
                {label}
              </Link>
            )
          )}
        </nav>
        <span className="header-spacer" />
        <SearchBox />
        <ThemeToggle />
        <a href="https://opteryx.app" className="blog-cta">Try Opteryx</a>
      </div>
    </header>
  )
}
