import React from "react";
import TopNav from "@/app/components/TopNav";
import DocsSidebar from "@/app/components/DocsSidebar";
import Breadcrumbs from "@/app/components/Breadcrumbs";
import TableOfContents from "@/app/components/TableOfContents";
import DocsFooter from "@/app/components/DocsFooter";

export const metadata = { title: "Releases — Opteryx" };

export default function ReleasesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <TopNav />
      <div className="docs-shell">
        <DocsSidebar />
        <div className="docs-main">
          <Breadcrumbs />
          {children}
          <DocsFooter />
        </div>
        <TableOfContents />
      </div>
    </>
  );
}
