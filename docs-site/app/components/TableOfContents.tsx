"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

interface Heading {
  id: string;
  text: string;
  level: number;
}

export default function TableOfContents() {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const pathname = usePathname();

  useEffect(() => {
    const extractHeadings = () => {
      const elements = Array.from(
        document.querySelectorAll("article h2, article h3"),
      );
      const headingData: Heading[] = elements.map((elem) => ({
        id: elem.id,
        text: elem.textContent || "",
        level: parseInt(elem.tagName[1]),
      }));
      setHeadings(headingData);
      // Unconditionally, because this runs once per page: the previous check
      // read an activeId left over from the page navigated away from, which is
      // never empty after the first one, so every page reached by a client-side
      // route change opened with nothing highlighted.
      setActiveId(headingData.length > 0 ? headingData[0].id : "");
    };

    const timer = setTimeout(extractHeadings, 100);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        });
      },
      { rootMargin: "-100px 0px -66%" },
    );

    const elements = document.querySelectorAll("article h2, article h3");
    elements.forEach((elem) => observer.observe(elem));

    // The timer is cleared as well as the observer: left pending across a route
    // change it fires against the next page and overwrites the heading it has
    // just highlighted.
    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [pathname]);

  if (headings.length === 0) return null;

  return (
    <aside className="docs-toc">
      <div className="toc-title">On this page</div>
      <nav>
        {headings.map((heading) => (
          <a
            key={heading.id}
            href={`#${heading.id}`}
            className={`toc-item${activeId === heading.id ? " active" : ""}${heading.level === 3 ? " toc-item-h3" : ""}`}
            style={heading.level === 3 ? { paddingLeft: "24px" } : undefined}
            onClick={(e) => {
              e.preventDefault();
              document
                .getElementById(heading.id)
                ?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            {heading.text}
          </a>
        ))}
      </nav>
    </aside>
  );
}
