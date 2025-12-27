import Link from 'next/link'

export default function TopNav(){
  return (
    <header className="w-full border-b bg-white">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="font-semibold text-lg text-opteryx-navy">Opteryx Docs</Link>
          <nav className="hidden md:flex gap-4 text-sm text-gray-600">
            <Link href="/docs/getting-started/quick-start">Get started</Link>
            <Link href="/docs/architecture/execution-engine">Architecture</Link>
            <Link href="/docs/operations/security-permissions">Security</Link>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <input aria-label="Search" placeholder="Search" className="hidden md:inline-block px-3 py-1 border rounded-md text-sm" />
          <a href="/docs/getting-started/quick-start" className="inline-block px-3 py-1 rounded-md bg-opteryx-teal text-white text-sm">Get started</a>
        </div>
      </div>
    </header>
  )
}
