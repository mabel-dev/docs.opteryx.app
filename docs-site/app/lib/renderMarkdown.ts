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

function addHeadingIdsToHtml(html: string): string {
  return html.replace(/<(h[23])>(.*?)<\/\1>/gi, (match, tag, content) => {
    if (!content || typeof content !== "string") {
      return match;
    }

    const id = content
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();

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
          : "/images/warning-outline.svg";

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
      if (!language) {
        return;
      }

      const highlighter = await getHighlighter();
      const highlighted = highlighter.codeToHtml(token.text ?? "", {
        lang: language,
        theme: SHIKI_THEME,
      });

      token.type = "html";
      token.raw = highlighted;
      token.text = highlighted;
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
