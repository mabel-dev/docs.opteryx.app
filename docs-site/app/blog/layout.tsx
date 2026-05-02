import React from "react";
import TopNav from "@/app/components/TopNav";
import Footer from "@/app/components/Footer";

export const metadata = { title: "Engineering Blog — Opteryx" };

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <TopNav />
      <div
        style={{
          maxWidth: "860px",
          margin: "0 auto",
          padding: "40px 28px 80px",
        }}
      >
        {children}
      </div>
      <Footer />
    </>
  );
}
