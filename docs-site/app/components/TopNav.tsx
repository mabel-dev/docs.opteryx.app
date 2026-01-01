import Link from 'next/link'
import Image from 'next/image'

export default function TopNav(){
  return (
    <header className="topnav w-full shadow-sm border-b border-gray-200 bg-white sticky top-0 z-50">
      <div className="w-full px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-3 teal-logo">
            <Image src="/opteryx.svg" alt="Opteryx" width={28} height={28} />
            <span className="font-semibold text-base text-opteryx-navy">Opteryx Documentation</span>
          </Link>
          <nav className="hidden md:flex gap-6 text-sm text-gray-600">
            <Link href="/docs" className="hover:text-opteryx-teal">Docs</Link>
            <Link href="/docs/architecture/execution-engine" className="hover:text-opteryx-teal">Architecture</Link>
            <Link href="/docs/operations/security-permissions" className="hover:text-opteryx-teal">Security</Link>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative hidden md:block">
            <input 
              aria-label="Search" 
              placeholder="Search" 
              className="pl-9 pr-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-opteryx-teal focus:border-transparent w-64" 
            />
            <svg 
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 512 512"
            >
              <path d="M221.09 64a157.09 157.09 0 10157.09 157.09A157.1 157.1 0 00221.09 64z" fill="none" stroke="currentColor" strokeMiterlimit="10" strokeWidth="32"/>
              <path fill="none" stroke="currentColor" strokeLinecap="round" strokeMiterlimit="10" strokeWidth="32" d="M338.29 338.29L448 448"/>
            </svg>
          </div>
          <a href="https://opteryx.app" className="inline-block px-4 py-2 rounded-md bg-opteryx-teal text-white text-sm hover:bg-opteryx-teal/90 transition-colors">Try Opteryx</a>
        </div>
      </div>
    </header>
  )
}
