import React from "react";
import Image from "next/image";
import Link from "next/link";

export const metadata = { title: "Engineering Blog — Opteryx" };

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <header className="blog-header">
        <div className="blog-header-inner">
          <Link
            href="/"
            className="blog-logo"
            style={{ textDecoration: "none" }}
          >
            <Image
              src="/opteryx-icon.svg"
              alt="Opteryx"
              width={22}
              height={22}
            />
            <span>Opteryx</span>
            <span className="sep">/</span>
            <span className="pill">Blog</span>
          </Link>
          <nav className="blog-nav">
            <Link href="https://opteryx.app">Product</Link>
            <Link href="/docs">Docs</Link>
            <Link href="/blog" className="active">
              Blog
            </Link>
          </nav>
          <span className="header-spacer" />
          <a href="https://opteryx.app" className="blog-cta">
            Start for free
          </a>
        </div>
      </header>
      {children}
      <footer className="blog-footer-simple">
        <div className="blog-footer-simple-inner">
          <span>
            © {new Date().getFullYear()} Opteryx · Written by Justin Joyce
          </span>
          <span className="links">
            <Link href="https://opteryx.app">Product</Link>
            <Link href="/docs">Docs</Link>
            <Link href="/releases">Changelog</Link>
          </span>
        </div>
      </footer>
    </>
  );
}
