import React from "react";
import TopNav from "@/app/components/TopNav";
import DocsSidebar from "@/app/components/DocsSidebar";
import TableOfContents from "@/app/components/TableOfContents";
import Footer from "@/app/components/Footer";

export default function LearnPathLayout({
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
          {children}
          <Footer />
        </div>
        <TableOfContents />
      </div>
    </>
  );
}
