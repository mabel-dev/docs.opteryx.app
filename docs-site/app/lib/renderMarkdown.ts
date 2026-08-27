import { Marked } from "marked";
import { createHighlighter, type Highlighter } from "shiki";

type RenderMarkdownOptions = {
  addHeadingIds?: boolean;
  transformCallouts?: boolean;
};

const SHIKI_THEME = "opteryx-light";

const OPTERYX_THEME = {
  name: SHIKI_THEME,
  type: "light",
  colors: {
    "editor.foreground": "#3D4A4E",
    "editor.background": "#FFFFFF",
  },
  tokenColors: [
    {
      scope: [
        "keyword",
        "storage",
        "keyword.operator.word",
        "keyword.control",
        "keyword.other.special-method",
      ],
      settings: { foreground: "#1F2E61", fontStyle: "bold" },
    },
    {
      scope: ["source.sql"],
      settings: { foreground: "#07797C" },
    },
    {
      scope: [
        "entity.name.function",
        "support.function",
        "variable.function",
        "meta.function-call",
      ],
      settings: { foreground: "#07797C" },
    },
    {
      scope: [
        "entity.name.type",
        "support.type",
        "storage.type",
        "support.class",
      ],
      settings: { foreground: "#1F2E61" },
    },
    {
      scope: [
        "string",
        "string.quoted",
        "string.regexp",
        "constant.character.escape",
      ],
      settings: { foreground: "#FE7701" },
    },
    {
      scope: [
        "constant.other.database-name.sql",
        "constant.other.table-name.sql",
        "constant.other.schema-name.sql",
        "entity.name.table.sql",
        "entity.name.column.sql",
      ],
      settings: { foreground: "#07797C" },
    },
    {
      scope: ["constant.numeric", "constant.language", "constant.character"],
      settings: { foreground: "#FFA503" },
    },
    {
      scope: ["comment", "punctuation.definition.comment"],
      settings: { foreground: "#C89427", fontStyle: "italic" },
    },
    {
      scope: [
        "invalid",
        "invalid.illegal",
        "invalid.deprecated",
        "meta.diff.header.from-file",
        "meta.diff.header.to-file",
      ],
      settings: { foreground: "#CB0101" },
    },
    {
      scope: [
        "punctuation",
        "meta.brace",
        "meta.delimiter",
        "meta.separator",
        "variable",
      ],
      settings: { foreground: "#3D4A4E" },
    },
  ],
} as const;

const SUPPORTED_LANGUAGES = ["sql", "python", "bash", "json"] as const;

const LANGUAGE_ALIASES: Record<string, (typeof SUPPORTED_LANGUAGES)[number]> = {
  py: "python",
  sh: "bash",
  shell: "bash",
  zsh: "bash",
};

let highlighterPromise: Promise<Highlighter> | null = null;

function getHighlighter(): Promise<Highlighter> {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: [OPTERYX_THEME as any],
      langs: [...SUPPORTED_LANGUAGES],
    });
  }

  return highlighterPromise;
}

function normalizeFenceLanguage(
  rawLanguage: string | undefined,
): string | null {
  if (!rawLanguage) {
    return null;
  }

  const normalized = rawLanguage.trim().toLowerCase();
  if (!normalized) {
    return null;
  }

  const canonical = LANGUAGE_ALIASES[normalized] ?? normalized;
  if (
    !SUPPORTED_LANGUAGES.includes(
      canonical as (typeof SUPPORTED_LANGUAGES)[number],
    )
  ) {
    return null;
  }

  return canonical;
}

// Tabler icon path data, keyed by fence language; `file` is the fallback for
// any labeled language without its own glyph.
const LANGUAGE_ICON_PATHS: Record<string, string> = {
  sql:
    `<path d="M12 6m-8 0a8 3 0 1 0 16 0a8 3 0 1 0 -16 0" />` +
    `<path d="M4 6v6a8 3 0 0 0 16 0v-6" />` +
    `<path d="M4 12v6a8 3 0 0 0 16 0v-6" />`,
  bash: `<path d="M5 7l5 5l-5 5" /><path d="M12 19l7 0" />`,
  python:
    `<path d="M12 9h-7a2 2 0 0 0 -2 2v4a2 2 0 0 0 2 2h3" />` +
    `<path d="M12 15h7a2 2 0 0 0 2 -2v-4a2 2 0 0 0 -2 -2h-3" />` +
    `<path d="M8 9v-4a2 2 0 0 1 2 -2h4a2 2 0 0 1 2 2v5a2 2 0 0 1 -2 2h-4a2 2 0 0 0 -2 2v5a2 2 0 0 0 2 2h4a2 2 0 0 0 2 -2v-4" />` +
    `<path d="M11 6l0 .01" /><path d="M13 18l0 .01" />`,
  json:
    `<path d="M7 4a2 2 0 0 0 -2 2v3a2 3 0 0 1 -2 3a2 3 0 0 1 2 3v3a2 2 0 0 0 2 2" />` +
    `<path d="M17 4a2 2 0 0 1 2 2v3a2 3 0 0 0 2 3a2 3 0 0 0 -2 3v3a2 2 0 0 1 -2 2" />`,
  text:
    `<path d="M14 3v4a1 1 0 0 0 1 1h4" />` +
    `<path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z" />` +
    `<path d="M9 9l1 0" /><path d="M9 13l6 0" /><path d="M9 17l6 0" />`,
  markdown:
    `<path d="M3 5m0 2a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v10a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2z" />` +
    `<path d="M7 15v-6l2 2l2 -2v6" /><path d="M14 13l2 2l2 -2m-2 2v-6" />`,
  file:
    `<path d="M14 3v4a1 1 0 0 0 1 1h4" />` +
    `<path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z" />`,
};

function languageIcon(language: string): string {
  const paths = LANGUAGE_ICON_PATHS[language] ?? LANGUAGE_ICON_PATHS.file;
  return (
    `<svg class="code-block-lang-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">` +
    `${paths}</svg>`
  );
}

const COPY_BUTTON =
  `<button type="button" class="copy-btn" data-copy-button>` +
  `<svg class="copy-btn-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 7m0 2.667a2.667 2.667 0 0 1 2.667 -2.667h8.666a2.667 2.667 0 0 1 2.667 2.667v8.666a2.667 2.667 0 0 1 -2.667 2.667h-8.666a2.667 2.667 0 0 1 -2.667 -2.667z" /><path d="M4.012 16.737a2.005 2.005 0 0 1 -1.012 -1.737v-10c0 -1.1 .9 -2 2 -2h10c.75 0 1.158 .385 1.5 1" /></svg>` +
  `<span class="copy-btn-label">Copy</span>` +
  `</button>`;

// The button carries no copy of the code — `CodeCopy` reads it from the <pre>
// at click time, so the highlighted markup is not duplicated into the page for
// every block. Only fences with a language we highlight get a button: the rest
// are mostly query output and console transcripts, which are there to be read
// rather than run.
function wrapInCodeBlock(
  highlighted: string,
  language: string,
  { copyButton = true }: { copyButton?: boolean } = {},
): string {
  return (
    `<div class="code-block" data-code-block>` +
    `<div class="code-block-header">` +
    `<span class="code-block-lang">${languageIcon(language)}${language}</span>` +
    (copyButton ? COPY_BUTTON : "") +
    `</div>${highlighted}</div>`
  );
}

function addHeadingIdsToHtml(html: string): string {
  // A page may repeat a heading — the API reference pages carry a "Responses"
  // and a "Try it live" under every endpoint. The slug alone is therefore not
  // unique, and a repeated id makes every anchor for it point at the first one
  // and gives the table of contents duplicate React keys. Later occurrences get
  // a counter; the first keeps the bare slug, so links already written against
  // it still resolve. The seen-map is per call, so it never leaks between pages.
  const seen = new Map<string, number>();

  return html.replace(/<(h[23])>(.*?)<\/\1>/gi, (match, tag, content) => {
    if (!content || typeof content !== "string") {
      return match;
    }

    const slug = content
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();

    // The loop, rather than a bare suffix, covers a page that also has a real
    // heading whose own slug is the one the counter is about to produce.
    let id = slug;
    let count = seen.get(slug) ?? 0;
    while (seen.has(id)) {
      count += 1;
      id = `${slug}-${count}`;
    }
    seen.set(slug, count);
    seen.set(id, 0);

    return `<${tag} id="${id}">${content}</${tag}>`;
  });
}

function transformCalloutBlockquotes(html: string): string {
  return html.replace(
    /<blockquote>\s*<p>\s*(Tip|TIP|Be Aware|Warning|Caution):\s*(.*?)<\/p>\s*<\/blockquote>/gi,
    (match, type, content) => {
      if (!type || !content) {
        return match;
      }

      const normalizedType = type.toLowerCase().replace(/\s+/g, "");
      const displayTitle = type.charAt(0).toUpperCase() + type.slice(1);
      const iconPath =
        normalizedType === "tip"
          ? "/images/bulb-outline.svg"
          : normalizedType === "warning"
            ? "/images/alert-triangle-warning.svg"
            : "/images/alert-triangle-danger.svg";

      return `<blockquote data-callout="${normalizedType}">
            <div class="callout-header">
              <img src="${iconPath}" alt="" class="callout-icon" />
              <div class="callout-title">${displayTitle}</div>
            </div>
            <p class="callout-content">${content}</p>
          </blockquote>`;
    },
  );
}

export async function renderMarkdownToHtml(
  source: string,
  options: RenderMarkdownOptions = {},
): Promise<string> {
  const renderer = new Marked({
    gfm: true,
    breaks: false,
    mangle: false,
    headerIds: false,
    async: true,
  });

  renderer.use({
    async walkTokens(token: any) {
      if (!token || token.type !== "code") {
        return;
      }

      const language = normalizeFenceLanguage(token.lang);
      const rawLabel = String(token.lang ?? "")
        .trim()
        .toLowerCase();

      let block: string;
      if (language) {
        const highlighter = await getHighlighter();
        const highlighted = highlighter.codeToHtml(token.text ?? "", {
          lang: language,
          theme: SHIKI_THEME,
        });
        block = wrapInCodeBlock(highlighted, language);
      } else if (/^[a-z0-9_+-]+$/.test(rawLabel)) {
        // A fence labeled with a language we don't highlight still gets the
        // header with its icon and name — just no copy button, and the code
        // rendered plain.
        const escaped = String(token.text ?? "")
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;");
        block = wrapInCodeBlock(
          `<pre><code>${escaped}</code></pre>`,
          rawLabel,
          { copyButton: false },
        );
      } else {
        return;
      }

      token.type = "html";
      token.raw = block;
      token.text = block;
      token.pre = false;
      token.block = true;
      token.lang = undefined;
      token.escaped = true;
    },
  });

  let html = String(await renderer.parse(source));

  if (options.addHeadingIds) {
    html = addHeadingIdsToHtml(html);
  }

  if (options.transformCallouts) {
    html = transformCalloutBlockquotes(html);
  }

  return html;
}
