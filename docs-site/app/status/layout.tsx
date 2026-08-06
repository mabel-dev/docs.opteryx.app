import React from "react";
import TopNav from "@/app/components/TopNav";
import Footer from "@/app/components/Footer";

export const metadata = {
  title: "Platform status — Opteryx",
  description:
    "Live status of the Opteryx Jobs, Upload and OData APIs, plus current incidents and recent history.",
};

// Deliberately not the docs shell: no sidebar, no table of contents. Someone
// landing here has a broken query and one question, and nav chrome is in the
// way of answering it.
export default function StatusLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <TopNav />
      <div className="landing-shell">{children}</div>
      <Footer />
    </>
  );
}
