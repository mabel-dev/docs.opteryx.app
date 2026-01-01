import Link from 'next/link'

export default function TopNav(){
  return (
    <header className="topnav w-full shadow-sm border-b border-gray-200 bg-white sticky top-0 z-50">
      <div className="w-full px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-3">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" fill="#07797c"/></svg>
            <span className="font-semibold text-base text-opteryx-navy">Opteryx</span>
          </Link>
          <nav className="hidden md:flex gap-6 text-sm text-gray-600">
            <Link href="/docs" className="hover:text-opteryx-teal">Docs</Link>
            <Link href="/docs/architecture/execution-engine" className="hover:text-opteryx-teal">Architecture</Link>
            <Link href="/docs/operations/security-permissions" className="hover:text-opteryx-teal">Security</Link>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <input aria-label="Search" placeholder="Search" className="hidden md:inline-block px-3 py-1 border rounded-md text-sm" />
          <a href="https://opteryx.app" className="inline-block px-4 py-2 rounded-md bg-opteryx-teal text-white text-sm hover:bg-opteryx-teal/90 transition-colors">Try Opteryx</a>
        </div>
      </div>
    </header>
  )
}
