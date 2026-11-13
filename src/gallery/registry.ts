import type { Category, Entry } from "./types";

/* Every file in ./demos exports a `category` of entries. The demo files are only where entries live;
   this file decides where they are shown: sections → groups → entries, in the order a person would
   look for them. Each group is one gallery page (#/<group>/<entry>).

   An entry that is not listed below still appears, at the end of its file's fallback group, so a
   new demo never goes missing; list it here to give it its proper place. */

export type Section = { id: string; name: string; groups: Category[] };

type GroupSpec = { id: string; name: string; summary: string; entries: string[] };
type SectionSpec = { id: string; name: string; groups: GroupSpec[] };

export const TAXONOMY: SectionSpec[] = [
  {
    id: "foundations",
    name: "Foundations",
    groups: [
      { id: "tokens", name: "Tokens", summary: "The colours, type and springs every component is made from. Change them once and the whole library follows.", entries: ["colour-tokens", "type-scale", "motion-presets"] },
      { id: "primitives", name: "Primitives", summary: "The small pieces underneath everything else: the theme switch, glazes, scrolling, rules and images.", entries: ["theme-toggle", "glaze-picker", "glaze", "scroll-area", "separator", "aspect-image"] },
    ],
  },
  {
    id: "inputs",
    name: "Actions & inputs",
    groups: [
      { id: "buttons", name: "Buttons & links", summary: "Everything you press: buttons, toggles, groups, copy, hold to confirm and links.", entries: ["button", "icon-button", "button-group", "toggle-button", "segmented-control", "copy-button", "hold-button", "magnetic-button", "link"] },
      { id: "text-input", name: "Text input", summary: "Fields you type into, from a single line to rich text, with codes, phone numbers, money and mentions.", entries: ["text-field", "textarea", "password-field", "search-field", "number-field", "otp-input", "phone-input", "currency-input", "placeholder-input", "mentions-textarea", "rich-text-editor"] },
      { id: "choice", name: "Choice controls", summary: "Checkboxes, radios, switches, sliders, stars and colours: picking from what is on screen.", entries: ["checkbox", "radio-group", "switch", "slider", "rating", "color-swatches", "color-picker"] },
      { id: "pickers", name: "Pickers", summary: "Choosing from a list that opens: selects, comboboxes, tags, dates, times, slots and files.", entries: ["select", "combobox", "tag-input", "chip-filter", "date-picker", "time-picker", "booking-slots", "file-dropzone", "signature-pad"] },
      { id: "forms", name: "Forms", summary: "Whole forms and the patterns inside them: sign-in, settings, editing in place, uploads and key–value lists.", entries: ["auth-forms", "settings-section", "inline-edit", "avatar-upload", "key-value-editor"] },
    ],
  },
  {
    id: "navigation",
    name: "Navigation",
    groups: [
      { id: "menus", name: "Menus & bars", summary: "Getting around an app: bars, sidebars, menus, mega menus and the command palette.", entries: ["navbar", "flyout-nav", "sidebar-nav", "docs-nav", "dropdown-menu", "context-menu", "command-palette", "spotlight-search"] },
      { id: "wayfinding", name: "Wayfinding", summary: "Finding your place inside a page or a flow: tabs, accordions, breadcrumbs, pages and steps.", entries: ["tabs", "accordion", "breadcrumbs", "pagination", "stepper", "back-to-top", "scroll-progress", "scroll-checkpoints"] },
    ],
  },
  {
    id: "feedback",
    name: "Overlays & feedback",
    groups: [
      { id: "overlays", name: "Overlays", summary: "Things that float above the page: dialogs, drawers, popovers, tooltips, hover cards and the lightbox.", entries: ["dialog", "alert-dialog", "drawer", "popover", "tooltip", "hover-card", "lightbox"] },
      { id: "notices", name: "Notices", summary: "Telling people what happened: toasts, alerts, banners, field messages, undo and notifications.", entries: ["toast", "alert", "banner", "field-message", "undo-bar", "notification-bell", "notification-center", "cookie-consent"] },
      { id: "status", name: "Status & loading", summary: "Badges, progress, spinners, skeletons and empty states: what is going on, and what to do when nothing is.", entries: ["badge", "progress", "progress-ring", "meter", "spinner", "skeleton", "multi-step-loader", "empty-state"] },
      { id: "guidance", name: "Guidance", summary: "Showing people around: tours, onboarding and the shortcut sheet.", entries: ["product-tour", "onboarding-wizard", "keyboard-shortcuts"] },
    ],
  },
  {
    id: "data",
    name: "Data & charts",
    groups: [
      { id: "display", name: "Data display", summary: "Showing facts at a glance: avatars, tags, keys, stats, lists, timelines and code.", entries: ["avatar", "tag", "kbd", "stat", "number-ticker", "description-list", "list", "timeline", "heat-strip", "code-block"] },
      { id: "tables", name: "Tables & lists", summary: "Rows of data, from a plain table to a grid you can sort and a list of ten thousand.", entries: ["table", "data-grid", "comparison-table", "virtual-list", "infinite-feed"] },
      { id: "charts", name: "Charts", summary: "Bars, lines, areas, donuts, gauges, funnels, radars, treemaps, heatmaps and flows, drawn in SVG.", entries: ["bar-chart", "line-chart", "area-chart", "donut", "sparkline", "gauge", "funnel", "radar", "treemap", "year-heatmap", "sankey"] },
    ],
  },
  {
    id: "surfaces",
    name: "Surfaces & media",
    groups: [
      { id: "cards", name: "Cards", summary: "Containers for one thing each: plain, pictured, selectable, expanding, tilting, floating and priced.", entries: ["card", "media-card", "interactive-card", "stat-card", "expandable-card", "tilt-card", "floating-card", "pricing"] },
      { id: "media", name: "Media", summary: "Players, carousels and galleries for video, sound and pictures.", entries: ["video-player", "media-player", "carousel", "masonry", "compare-slider", "marquee"] },
    ],
  },
  {
    id: "patterns",
    name: "Layouts & patterns",
    groups: [
      { id: "shells", name: "App shells", summary: "Whole-screen layouts: sidebars, stacked pages, headings, grid and stacked lists, a dashboard.", entries: ["app-shell", "stacked-layout", "headings-layout", "grid-list", "stacked-list", "dashboard"] },
      { id: "workspace", name: "Workspace", summary: "Tools people work in all day: trees, boards, sortable lists, panels, calendars, files and filters.", entries: ["tree-view", "kanban-board", "sortable-list", "resizable-panels", "filter-bar", "file-manager", "calendar-month", "week-calendar", "gantt", "notification-preferences"] },
      { id: "communication", name: "Communication", summary: "Talking to people: chat, comments, a feed and the composer.", entries: ["chat-thread", "comment-thread", "comment-feed", "message-composer"] },
      { id: "ai", name: "AI interfaces", summary: "Conversations with a model: prompts, streaming, reasoning, sources, tool calls and suggestions.", entries: ["conversation", "prompt-input", "streaming-message", "reasoning", "sources", "tool-call", "suggestions", "message-actions"] },
      { id: "devtools", name: "Developer tools", summary: "For people who read code: diffs, JSON, a terminal and a live log.", entries: ["diff-viewer", "json-viewer", "terminal", "terminal-script", "log-stream"] },
      { id: "commerce", name: "Commerce", summary: "Selling things: galleries, quick view, the cart, checkout, reviews, filters, orders and invoices.", entries: ["product-gallery", "product-quick-view", "cart-drawer", "checkout-form", "reviews-summary", "category-filters", "order-history", "invoice"] },
      { id: "marketing", name: "Marketing", summary: "Sections for a public site: heroes, features, stats, pricing calls, FAQs, testimonials, blogs and footers.", entries: ["hero", "feature-split", "bento-grid", "feature-tabs", "stats-section", "cta-section", "newsletter", "contact-section", "team-grid", "faq-section", "testimonials", "blog-list", "changelog", "headings", "not-found", "footer"] },
    ],
  },
  {
    id: "motion",
    name: "Motion",
    groups: [
      { id: "text-effects", name: "Text effects", summary: "Words that arrive, type, rotate and decode, with nothing reflowing around them.", entries: ["text-animate", "typewriter", "word-rotate", "scramble-text", "scroll-words"] },
      { id: "effects", name: "Effects", summary: "Loops and pointer effects that hum on the compositor: docks, beams, orbits, lists, parallax and scroll stories.", entries: ["reveal", "dock", "animated-beam", "orbiting-circles", "animated-list", "border-beam", "sticky-scroll-reveal", "scroll-story", "scroll-timeline", "parallax", "parallax-section", "card-journey", "drift-field"] },
    ],
  },
];

const FALLBACK: Record<string, string> = {
  foundations: "primitives", actions: "buttons", inputs: "text-input", "advanced-inputs": "text-input", forms: "forms",
  pickers: "pickers", navigation: "menus", workspace: "workspace", apps: "workspace", overlays: "overlays",
  feedback: "status", communication: "communication", ai: "ai", data: "display", devtools: "devtools", charts: "charts",
  media: "media", surfaces: "cards", layouts: "shells", marketing: "marketing", commerce: "commerce", effects: "effects",
};

const modules = import.meta.glob<{ category: Category }>("./demos/*.tsx", { eager: true });
const files = Object.values(modules).map((m) => m.category).filter(Boolean);

const byId = new Map<string, Entry>();
const fileOf = new Map<string, string>();
for (const f of files)
  for (const e of f.entries) {
    if (import.meta.env.DEV && byId.has(e.id)) console.warn(`[kiln] duplicate entry id "${e.id}"`);
    byId.set(e.id, e);
    fileOf.set(e.id, f.id);
  }

const placed = new Set<string>();
export const sections: Section[] = TAXONOMY.map((s) => ({
  id: s.id,
  name: s.name,
  groups: s.groups.map((g) => ({
    id: g.id,
    name: g.name,
    summary: g.summary,
    entries: g.entries.flatMap((id) => {
      const e = byId.get(id);
      if (!e) {
        if (import.meta.env.DEV) console.warn(`[kiln] taxonomy lists "${id}" but no demo defines it`);
        return [];
      }
      placed.add(id);
      return [e];
    }),
  })),
}));

/** Every group, in sidebar order. Each is one page. */
export const categories: Category[] = sections.flatMap((s) => s.groups);

for (const [id, e] of byId) {
  if (placed.has(id)) continue;
  const target = categories.find((c) => c.id === FALLBACK[fileOf.get(id)!]) ?? categories[categories.length - 1];
  target.entries.push(e);
}

/** The group an entry lives in. */
export const groupOf = new Map<string, string>(categories.flatMap((c) => c.entries.map((e) => [e.id, c.id] as const)));
export const sectionOf = new Map<string, Section>(sections.flatMap((s) => s.groups.map((g) => [g.id, s] as const)));

/** Old and partial addresses still land somewhere sensible: an entry wins over the group named
    before it (#/inputs/otp-input → #/text-input/otp-input), and an old group name goes to where most
    of its entries now live (#/advanced-inputs → #/text-input). */
export function resolve(category: string, entry?: string): { category: string; entry?: string } | null {
  if (entry && groupOf.has(entry)) return { category: groupOf.get(entry)!, entry };
  if (categories.some((c) => c.id === category)) return { category };
  const old = files.find((f) => f.id === category);
  if (old) {
    const counts = new Map<string, number>();
    for (const e of old.entries) {
      const g = groupOf.get(e.id);
      if (g) counts.set(g, (counts.get(g) ?? 0) + 1);
    }
    const best = [...counts].sort((a, b) => b[1] - a[1])[0];
    if (best) return { category: best[0] };
  }
  return null;
}
