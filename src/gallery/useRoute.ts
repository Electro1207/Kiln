import { useCallback, useEffect, useState } from "react";
import { resolve } from "./registry";

export type Route =
  | { page: "overview" }
  | { page: "studio" }
  | { page: "about" }
  | { page: "privacy" }
  | { page: "terms" }
  | { page: "whats-new" }
  | { page: "category"; category: string; entry?: string };

const PAGES = ["studio", "about", "privacy", "terms", "whats-new"] as const;

/* Every page has a real address (/effects/card-journey), so each can be indexed and shared. Old
   addresses (#/effects/card-journey) still work: they are read once and rewritten to the path. */
function parse(path: string): Route {
  const parts = path.replace(/^#?\/?/, "").split(/[/?#]/).filter(Boolean);
  if (parts.length === 0) return { page: "overview" };
  const page = PAGES.find((p) => p === parts[0]);
  if (page) return { page };
  const r = resolve(parts[0], parts[1]);
  return r ? { page: "category", ...r } : { page: "category", category: parts[0], entry: parts[1] };
}

/* A hash route or an old or partial address is rewritten to where it lives now, without adding a history step. */
function read(): Route {
  const legacy = location.hash.startsWith("#/");
  const r = parse(legacy ? location.hash : location.pathname);
  const h = href(r);
  if ((legacy || r.page === "category") && location.pathname + (legacy ? location.hash : "") !== h) history.replaceState(null, "", h);
  return r;
}

export function href(r: Route) {
  if (r.page === "overview") return "/";
  if (r.page === "category") return `/${r.category}${r.entry ? `/${r.entry}` : ""}`;
  return `/${r.page}`;
}

/* Plain links to a gallery page (in Markdown, or a demo's breadcrumbs) navigate in place. Files the
   site serves (/r/…, /demo/…, anything with an extension) and links with a modifier key load normally. */
function internal(e: MouseEvent): string | null {
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return null;
  const a = (e.target as Element | null)?.closest?.("a");
  if (!a || a.target || a.hasAttribute("download")) return null;
  const url = new URL(a.href, location.href);
  if (url.origin !== location.origin) return null;
  if (url.hash.startsWith("#/")) return url.hash;
  if (url.pathname === location.pathname && url.hash) return null; // an anchor on this page
  if (/^\/(r|demo|assets)\//.test(url.pathname) || /\.[a-z0-9]+$/i.test(url.pathname)) return null;
  return url.pathname;
}

export function useRoute() {
  const [route, setRoute] = useState<Route>(read);
  const go = useCallback((r: Route) => {
    const h = href(r);
    if (location.pathname !== h || location.hash) history.pushState(null, "", h);
    setRoute(parse(h));
  }, []);
  useEffect(() => {
    const on = () => setRoute(read());
    const onHash = () => location.hash.startsWith("#/") && on();
    const click = (e: MouseEvent) => {
      const to = internal(e);
      if (to === null) return;
      e.preventDefault();
      go(parse(to));
    };
    window.addEventListener("popstate", on);
    window.addEventListener("hashchange", onHash);
    document.addEventListener("click", click);
    return () => {
      window.removeEventListener("popstate", on);
      window.removeEventListener("hashchange", onHash);
      document.removeEventListener("click", click);
    };
  }, [go]);
  return { route, go };
}
