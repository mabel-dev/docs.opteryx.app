import Link from "next/link";
import TopNav from "./components/TopNav";
import Footer from "./components/Footer";

export default function NotFound() {
  return (
    <>
      <TopNav />
      <main className="flex min-h-[60vh] flex-col items-center justify-center px-6 py-24 text-center">
        <div className="font-mono text-sm font-semibold tracking-widest text-opteryx-teal">
          404
        </div>
        <h1 className="mt-3 font-display text-3xl font-bold text-opteryx-navy sm:text-4xl">
          We couldn&apos;t find that page
        </h1>
        <p className="mt-4 max-w-md font-body text-base text-[#5f6b78]">
          The page may have moved, been renamed, or no longer exists. Try
          heading back to the homepage or browsing the docs from the start.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-md bg-opteryx-teal px-5 py-2.5 font-display text-sm font-semibold text-white transition-colors hover:bg-[#05605f]"
          >
            Back to home
          </Link>
          <Link
            href="/docs"
            className="inline-flex items-center gap-2 rounded-md border border-[#d9e2e8] px-5 py-2.5 font-display text-sm font-semibold text-opteryx-navy transition-colors hover:bg-[#f6f8fb]"
          >
            Browse the docs
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
