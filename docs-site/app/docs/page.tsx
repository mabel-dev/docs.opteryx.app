import Link from "next/link";

type DocSection = {
  title: string;
  description: string;
  href: string;
  icon: string;
};

const GETTING_STARTED: DocSection[] = [
  {
    title: "Logging in",
    description: "Set up your account and get access to the platform",
    href: "/docs/getting-started/registration",
    icon: "🔐",
  },
  {
    title: "Site tour",
    description: "Learn your way around the interface and key features",
    href: "/docs/getting-started/quick-start",
    icon: "🗺️",
  },
  {
    title: "Load and query data",
    description: "Import data and run your first query",
    href: "/docs/getting-started/reading-data",
    icon: "📊",
  },
];

const CORE_CONCEPTS: DocSection[] = [
  {
    title: "Access and permissions",
    description: "Understand how access control works",
    href: "/docs/core-concepts/access-and-permissions",
    icon: "🔒",
  },
  {
    title: "Cost model",
    description: "Learn how costs are calculated",
    href: "/docs/core-concepts/cost-model",
    icon: "💰",
  },
];

const REFERENCE: DocSection[] = [
  {
    title: "API Reference",
    description: "Complete API documentation and examples",
    href: "/docs/reference/api/authentication-api",
    icon: "⚙️",
  },
  {
    title: "SQL Language Reference",
    description: "SQL functions, operators, and statements",
    href: "/docs/reference/sql-language-reference/data-types",
    icon: "📝",
  },
  {
    title: "Python Integration",
    description: "Use Opteryx with Python and SQLAlchemy",
    href: "/docs/reference/python-integration/sqlalchemy",
    icon: "🐍",
  },
];

function DocCard({ section }: { section: DocSection }) {
  return (
    <Link href={section.href} className="post-card">
      <div className="post-card-art tone-teal">
        <span className="art-glyph">{section.icon}</span>
      </div>
      <div className="post-card-body">
        <h3>{section.title}</h3>
        <p>{section.description}</p>
      </div>
    </Link>
  );
}

export default function Page() {
  return (
    <main className="page">
      {/* Hero section */}
      <section className="docs-hero">
        <div className="docs-hero-content">
          <h1>Opteryx Documentation</h1>
          <p className="docs-hero-lead">
            Fast, lightweight SQL analytics for your data. Run queries locally
            or in the cloud.
          </p>
          <div className="docs-hero-ctas">
            <Link
              href="/docs/getting-started/quick-start"
              className="btn-primary"
            >
              Get Started
            </Link>
            <Link href="/blog" className="btn-secondary">
              Read the Blog
            </Link>
          </div>
        </div>
      </section>

      {/* Getting Started */}
      <section className="docs-section">
        <div className="docs-section-header">
          <h2>Getting Started</h2>
          <p>Set up Opteryx and learn the fundamentals in just a few minutes</p>
        </div>
        <div className="card-grid">
          {GETTING_STARTED.map((section) => (
            <DocCard key={section.href} section={section} />
          ))}
        </div>
      </section>

      {/* Core Concepts */}
      <section className="docs-section">
        <div className="docs-section-header">
          <h2>Core Concepts</h2>
          <p>Understand the key ideas behind Opteryx</p>
        </div>
        <div className="card-grid">
          {CORE_CONCEPTS.map((section) => (
            <DocCard key={section.href} section={section} />
          ))}
        </div>
      </section>

      {/* Reference */}
      <section className="docs-section">
        <div className="docs-section-header">
          <h2>Reference</h2>
          <p>API and language documentation</p>
        </div>
        <div className="card-grid">
          {REFERENCE.map((section) => (
            <DocCard key={section.href} section={section} />
          ))}
        </div>
      </section>

      {/* Help section */}
      <section className="docs-section docs-help">
        <div className="docs-help-content">
          <h2>Can't find what you're looking for?</h2>
          <p>Check out our blog for in-depth guides and engineering updates.</p>
          <Link href="/blog" className="btn-link">
            Visit the Blog →
          </Link>
        </div>
      </section>
    </main>
  );
}
