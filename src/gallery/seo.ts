import { useEffect } from "react";
import { categories } from "./registry";
import { KILN_SITE } from "./site";
import { href, type Route } from "./useRoute";

/* What a page is called in the tab, in search results and in link previews. scripts/prerender.mjs
   writes the same titles and descriptions into each page's static HTML, so keep the two in step. */

export const SITE_DESCRIPTION =
  "200+ animated React components for Tailwind CSS v4 and Motion: light and dark, 60fps, keyboard-ready. Use the npm package or copy any one in with the shadcn CLI.";

export function pageMeta(r: Route): { title: string; description: string } {
  switch (r.page) {
    case "overview":
      return { title: "Kiln — Animated React Components", description: SITE_DESCRIPTION };
    case "about":
      return { title: "About Kiln — Animated React Components", description: "Why Kiln exists, how it is built, and how to use it: npm package or copy-in components for React 19, Tailwind CSS v4 and Motion." };
    case "whats-new":
      return { title: "What's New in Kiln — Changelog", description: "Every Kiln release, newest first: new components, new props, changes and fixes, for the npm package and the copy-in registry alike." };
    case "studio":
      return { title: "Theme Studio — Kiln", description: "Make a Kiln theme: set the colours for light and dark, watch every component update, and download the tokens.css." };
    case "privacy":
      return { title: "Privacy Policy — Kiln", description: "Kiln collects no personal information: no accounts, cookies, analytics or tracking." };
    case "terms":
      return { title: "Terms of Use — Kiln", description: "The terms for using the Kiln website, the npm package and the copy-in registry." };
    case "category": {
      const c = categories.find((x) => x.id === r.category);
      const e = c?.entries.find((x) => x.id === r.entry);
      if (e) return { title: `${e.name} — Animated React Component | Kiln`, description: `${e.summary} A free React component for Tailwind CSS v4 and Motion, in light and dark.` };
      if (c) return { title: `${c.name} — Animated React Components | Kiln`, description: `${c.summary} ${c.entries.length} free React components for Tailwind CSS v4 and Motion.` };
      return { title: "Not found — Kiln", description: SITE_DESCRIPTION };
    }
  }
}

function setMeta(selector: string, attr: string, value: string) {
  const el = document.head.querySelector(selector);
  if (el) el.setAttribute(attr, value);
}

/** Keeps the document's title, description, canonical address and preview tags on the page shown. */
export function usePageMeta(r: Route) {
  useEffect(() => {
    const { title, description } = pageMeta(r);
    const url = KILN_SITE + href(r);
    document.title = title;
    setMeta('meta[name="description"]', "content", description);
    setMeta('link[rel="canonical"]', "href", url);
    setMeta('meta[property="og:title"]', "content", title);
    setMeta('meta[property="og:description"]', "content", description);
    setMeta('meta[property="og:url"]', "content", url);
  }, [r]);
}
