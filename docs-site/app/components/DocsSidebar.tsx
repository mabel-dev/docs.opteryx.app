"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  sidebarNav,
  type DocsNavItem,
  type DocsNavSection,
} from "@/app/lib/docsNav";
import { learnPaths } from "@/app/lib/learnPaths";

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{
        transform: open ? "rotate(180deg)" : "rotate(0deg)",
        transition: "transform 150ms",
      }}
    >
      <path d="M4 6 L8 10 L12 6" />
    </svg>
  );
}

export default function DocsSidebar() {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>(
    {},
  );

  const itemContainsPath = (item: DocsNavItem, path: string): boolean => {
    if (item.href === path) return true;
    if (!item.items) return false;
    return item.items.some((child) => itemContainsPath(child, path));
  };

  useEffect(() => {
    const initialExpanded: Record<string, boolean> = {};
    sidebarNav.forEach((section) => {
      section.items.forEach((item) => {
        if (!item.items) return;
        const level2Key = `${section.title}::${item.title}`;
        if (itemContainsPath(item, pathname)) initialExpanded[level2Key] = true;
        item.items.forEach((child) => {
          if (!child.items) return;
          const level3Key = `${section.title}::${item.title}::${child.title}`;
          if (itemContainsPath(child, pathname))
            initialExpanded[level3Key] = true;
        });
      });
    });
    setExpandedItems((prev) => ({ ...initialExpanded, ...prev }));
  }, [pathname]);

  const toggleItem = (key: string) => {
    setExpandedItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const renderNestedItem = (parentKey: string, item: DocsNavItem) => {
    if (!item.items) {
      if (!item.href) {
        return (
          <span className="nav-item d3">
            <span className="nav-label">{item.title}</span>
          </span>
        );
      }
      const isActive = item.href === pathname;
      return (
        <Link
          href={item.href}
          className={`nav-item d3${isActive ? " active" : ""}`}
        >
          <span className="nav-label">{item.title}</span>
        </Link>
      );
    }

    const key = `${parentKey}::${item.title}`;
    const isExpanded = !!expandedItems[key];
    const isActive = item.href === pathname;

    return (
      <div>
        <div
          className={`nav-item d2${isActive ? " active" : ""}`}
          style={{ cursor: "pointer" }}
          onClick={() => toggleItem(key)}
        >
          {item.href ? (
            <Link
              href={item.href}
              className="nav-label"
              onClick={(e) => e.stopPropagation()}
            >
              {item.title}
            </Link>
          ) : (
            <span className="nav-label">{item.title}</span>
          )}
          <ChevronIcon open={isExpanded} />
        </div>
        {isExpanded && (
          <div className="nav-children">
            {item.items.map((child) => (
              <div key={child.href || child.title}>
                {renderNestedItem(key, child)}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderLevel2Item = (sectionTitle: string, item: DocsNavItem) => {
    const isActive = item.href === pathname;

    if (item.items) {
      const key = `${sectionTitle}::${item.title}`;
      const isExpanded = !!expandedItems[key];
      return (
        <div key={item.title}>
          <div
            className={`nav-item d1${isActive ? " active" : ""}`}
            style={{ cursor: "pointer" }}
            onClick={() => toggleItem(key)}
          >
            <span className="nav-label">{item.title}</span>
            <ChevronIcon open={isExpanded} />
          </div>
          {isExpanded && (
            <div className="nav-children">
              {item.items.map((subItem) => (
                <div key={subItem.href || subItem.title}>
                  {renderNestedItem(key, subItem)}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    if (!item.href) {
      return (
        <div key={item.title} className="nav-item d1">
          <span className="nav-label">{item.title}</span>
        </div>
      );
    }

    return (
      <Link
        key={item.title}
        href={item.href}
        className={`nav-item d1${isActive ? " active" : ""}`}
      >
        <span className="nav-label">{item.title}</span>
      </Link>
    );
  };

  const isReleasesPage = pathname.startsWith("/releases");

  const releasesNav: DocsNavSection[] = [
    {
      title: "Releases",
      items: [
        { title: "Overview", href: "/releases" },
        { title: "Web site", href: "/releases/web" },
        { title: "API", href: "/releases/api" },
        { title: "SQL", href: "/releases/sql" },
      ],
    },
  ];

  const isLearnPage = pathname.startsWith("/learn");

  const learnNav: DocsNavSection[] = [
    {
      title: "Learning paths",
      items: [
        { title: "All paths", href: "/learn" },
        ...learnPaths.map((learnPath) => ({
          title: learnPath.title,
          href: `/learn/${learnPath.slug}`,
        })),
      ],
    },
  ];

  const navToRender = isReleasesPage
    ? releasesNav
    : isLearnPage
      ? learnNav
      : sidebarNav;

  return (
    <aside className="docs-sidebar">
      <nav>
        {navToRender.map((section) => (
          <div key={section.title} className="nav-group">
            <div className="nav-group-title">{section.title}</div>
            {section.items.map((item) => renderLevel2Item(section.title, item))}
          </div>
        ))}
      </nav>
    </aside>
  );
}
