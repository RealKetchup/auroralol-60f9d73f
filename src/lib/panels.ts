/**
 * Panel layout config stored on profiles.panels (jsonb).
 * w = width in a 12 column grid, h = minimum height in px (0 = auto).
 */
export type PanelType =
  | "about"
  | "guestbook"
  | "reviews"
  | "discord"
  | "guests"
  | "links"
  | "music"
  | "custom";

export type PanelConfig = {
  id: string;
  type: PanelType;
  w: number;
  h: number;
  hidden: boolean;
  title?: string;
  html?: string;
};

export const PANEL_LABELS: Record<PanelType, string> = {
  about: "About",
  guestbook: "Guestbook",
  reviews: "Reviews",
  discord: "Discord",
  guests: "Recent guests",
  links: "Links",
  music: "Now playing",
  custom: "Custom panel",
};

export const BUILT_IN_TYPES: PanelType[] = [
  "about",
  "guestbook",
  "reviews",
  "discord",
  "guests",
  "links",
  "music",
];

export const DEFAULT_PANELS: PanelConfig[] = [
  { id: "p-guestbook", type: "guestbook", w: 8, h: 0, hidden: false },
  { id: "p-about", type: "about", w: 4, h: 0, hidden: false },
  { id: "p-reviews", type: "reviews", w: 4, h: 0, hidden: false },
  { id: "p-discord", type: "discord", w: 4, h: 0, hidden: false },
  { id: "p-guests", type: "guests", w: 4, h: 0, hidden: false },
  { id: "p-links", type: "links", w: 4, h: 0, hidden: false },
];

const TYPES = new Set<string>([...BUILT_IN_TYPES, "custom"]);

export function newPanelId(type: string) {
  return `p-${type}-${Math.random().toString(36).slice(2, 8)}`;
}

/** Accept anything from the database and return a safe, usable panel list. */
export function normalizePanels(value: unknown): PanelConfig[] {
  if (!Array.isArray(value) || value.length === 0) return DEFAULT_PANELS.map(p => ({ ...p }));
  const out: PanelConfig[] = [];
  for (const raw of value) {
    if (!raw || typeof raw !== "object") continue;
    const r = raw as Record<string, unknown>;
    const type = typeof r['type'] === "string" && TYPES.has(r['type']) ? (r['type'] as PanelType) : null;
    if (!type) continue;
    const w = Math.max(3, Math.min(12, Math.round(Number(r['w']) || 12)));
    const h = Math.max(0, Math.min(900, Math.round(Number(r['h']) || 0)));
    out.push({
      id: typeof r['id'] === "string" && r['id'] ? r['id'] : newPanelId(type),
      type,
      w,
      h,
      hidden: Boolean(r['hidden']),
      ...(typeof r['title'] === "string" ? { title: r['title'].slice(0, 60) } : {}),
      ...(typeof r['html'] === "string" ? { html: r['html'].slice(0, 20000) } : {}),
    });
  }
  return out.length ? out : DEFAULT_PANELS.map(p => ({ ...p }));
}

const BLOCKED_TAGS = /<\s*\/?\s*(script|iframe|object|embed|link|meta|base|form|template|svg\s+onload)\b[^>]*>/gi;
const EVENT_ATTRS = /\son[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi;
const JS_URLS = /(href|src|action|xlink:href)\s*=\s*(?:"\s*javascript:[^"]*"|'\s*javascript:[^']*'|javascript:[^\s>]+)/gi;
const STYLE_EXPR = /(expression\s*\(|behavior\s*:|-moz-binding)/gi;

/** Conservative HTML clean-up for user supplied panel markup. */
export function sanitizeHtml(html: string | null | undefined): string {
  if (!html) return "";
  return html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(BLOCKED_TAGS, "")
    .replace(EVENT_ATTRS, "")
    .replace(JS_URLS, "")
    .replace(STYLE_EXPR, "")
    .slice(0, 20000);
}

/** Scope-safe CSS: strip @import, url(javascript:) and hacks. */
export function sanitizeCss(css: string | null | undefined): string {
  if (!css) return "";
  return css
    .replace(/@import[^;]+;/gi, "")
    .replace(/url\(\s*['"]?\s*javascript:[^)]*\)/gi, "none")
    .replace(STYLE_EXPR, "")
    .slice(0, 20000);
}
