import Link from "next/link";
import Image from "next/image";

export default function TopNav() {
  return (
    <header className="docs-header">
      <div className="docs-header-inner">
        <Link href="/" className="docs-logo">
          <Image src="/opteryx-icon.svg" alt="Opteryx" width={22} height={22} />
          <span>Opteryx Documentation</span>
        </Link>
        <nav className="docs-nav">
          <Link href="/docs">Guides</Link>
          <Link href="/blog">Blog</Link>
          <Link href="/releases">Releases</Link>
        </nav>
        <div className="docs-search">
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <circle cx="11" cy="11" r="6" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input aria-label="Search" placeholder="Search" />
        </div>
        <a href="https://opteryx.app" className="docs-cta">
          Try Opteryx
        </a>
      </div>
    </header>
  );
}
