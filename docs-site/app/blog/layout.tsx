import React from "react";
import Link from "next/link";
import SiteHeader from "@/app/components/SiteHeader";

export const metadata = { title: "Engineering Blog — Opteryx" };

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SiteHeader />
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
