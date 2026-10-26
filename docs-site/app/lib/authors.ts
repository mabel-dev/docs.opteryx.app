export type AuthorProfile = {
  name: string;
  photo?: string;
  bio?: string;
  github?: string;
};

// Profiles keyed by the `author:` frontmatter value. A post whose author is
// not listed here still renders, with initials and no bio.
const AUTHORS: Record<string, AuthorProfile> = {
  "Justin Joyce": {
    name: "Justin Joyce",
    photo: "/authors/justin-joyce.jpg",
    bio: "Building Opteryx — a SQL engine that queries your data where it lives, from object storage to Iceberg and PostgreSQL.",
    github: "joocer",
  },
};

export function getAuthor(name: string | undefined): AuthorProfile {
  const key = (name || "").trim() || "Justin Joyce";
  return AUTHORS[key] ?? { name: key };
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}
