import Link from 'next/link'

export default function TopNav(){
  return (
    <header className="topnav w-full shadow-sm">
      <div className="container px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-3">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" fill="#07797c"/></svg>
            <span className="font-semibold text-base text-opteryx-navy">Opteryx</span>
          </Link>
          <nav className="hidden md:flex gap-6 text-sm text-gray-600">
            <Link href="/docs/getting-started/quick-start">Get started</Link>
            <Link href="/docs/architecture/execution-engine">Architecture</Link>
            <Link href="/docs/operations/security-permissions">Security</Link>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <input aria-label="Search" placeholder="Search" className="hidden md:inline-block px-3 py-1 border rounded-md text-sm" />
          <a href="/docs/getting-started/quick-start" className="inline-block px-4 py-2 rounded-md bg-opteryx-teal text-white text-sm">Get started</a>
          <div className="hidden md:flex items-center text-sm text-gray-600 ml-3">bastian</div>
        </div>
      </div>
    </header>
  )
}
