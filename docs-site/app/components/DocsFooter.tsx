import Image from 'next/image'
import Link from 'next/link'

export default function DocsFooter() {
  return (
    <footer className="mt-16 pt-8 border-t border-gray-200">
      <div className="flex items-center justify-between text-sm text-gray-600">
        <Link 
          href="https://opteryx.app" 
          className="flex items-center gap-2 hover:text-opteryx-teal transition-colors teal-logo"
          target="_blank"
          rel="noopener noreferrer"
        >
          <div className="w-6 h-6">
            <Image src="/opteryx-logo-outline.svg" alt="" width={24} height={24} className="w-full h-full" style={{ filter: 'invert(33%) sepia(65%) saturate(3) hue-rotate(162deg)' }} />
          </div>
          <span>Try Opteryx Now</span>
        </Link>
        <div>
          © 2026 Opteryx, All Rights Reserved
        </div>
      </div>
    </footer>
  )
}
