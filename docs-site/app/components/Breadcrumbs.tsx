"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  docsBreadcrumbsByPath,
  inferBreadcrumbsFromPath,
} from "@/app/lib/docsNav";

export default function Breadcrumbs() {
  const pathname = usePathname();
  const breadcrumbs =
    docsBreadcrumbsByPath[pathname] || inferBreadcrumbsFromPath(pathname);

  if (breadcrumbs.length === 0) return null;

  return (
    <nav className="breadcrumbs">
      <span className="crumb">
        <Link href="/docs">Docs</Link>
      </span>
      {breadcrumbs.map((crumb, index) => {
        const isLast = index === breadcrumbs.length - 1;
        return (
          <span key={`${crumb}-${index}`} className="crumb">
            <span className="crumb-sep">/</span>
            {isLast ? (
              <a
                href="#"
                className="current"
                onClick={(e) => e.preventDefault()}
              >
                {crumb}
              </a>
            ) : (
              <span>{crumb}</span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
