import Image from 'next/image'
import Link from 'next/link'

export default function DocsFooter() {
  return (
    <footer className="mt-16 pt-8 border-t border-gray-200">
      <div className="flex items-center justify-between text-sm text-gray-600">
        <Link 
          href="https://opteryx.dev" 
          className="flex items-center gap-2 hover:text-opteryx-teal transition-colors teal-logo"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image src="/opteryx.svg" alt="" width={16} height={16} />
          <span>Visit Opteryx</span>
        </Link>
        <div>
          © 2026 Opteryx, All Rights Reserved
        </div>
      </div>
    </footer>
  )
}
