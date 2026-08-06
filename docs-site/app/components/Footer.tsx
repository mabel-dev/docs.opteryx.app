import Image from "next/image";
import Link from "next/link";
import StatusLink from "@/app/components/StatusLink";

export default function Footer() {
  return (
    <footer className="docs-footer">
      <div className="docs-footer-inner">
        <Link
          href="https://opteryx.app"
          className="docs-footer-cta"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image src="/opteryx-icon.svg" alt="" width={18} height={18} />
          <span>Try Opteryx Now</span>
        </Link>
        <div className="docs-footer-meta">
          <StatusLink />
          <span className="docs-footer-legal">
            © {new Date().getFullYear()} Opteryx, All Rights Reserved
          </span>
        </div>
      </div>
    </footer>
  );
}
