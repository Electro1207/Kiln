import { useCallback, useEffect, useState } from "react";
import { resolve } from "./registry";

export type Route =
  | { page: "overview" }
  | { page: "studio" }
  | { page: "about" }
  | { page: "category"; category: string; entry?: string };

function parse(hash: string): Route {
  const parts = hash.replace(/^#\/?/, "").split("/").filter(Boolean);
  if (parts.length === 0) return { page: "overview" };
  if (parts[0] === "studio") return { page: "studio" };
  if (parts[0] === "about") return { page: "about" };
  const r = resolve(parts[0], parts[1]);
  return r ? { page: "category", ...r } : { page: "category", category: parts[0], entry: parts[1] };
}

/* An old or partial address is rewritten to where it lives now, without adding a history step. */
function read(): Route {
  const r = parse(location.hash);
  const h = href(r);
  if (r.page === "category" && location.hash !== h) history.replaceState(null, "", h);
  return r;
}

export function href(r: Route) {
  if (r.page === "overview") return "#/";
  if (r.page === "studio") return "#/studio";
  if (r.page === "about") return "#/about";
  return `#/${r.category}${r.entry ? `/${r.entry}` : ""}`;
}

export function useRoute() {
  const [route, setRoute] = useState<Route>(read);
  useEffect(() => {
    const on = () => setRoute(read());
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);
  const go = useCallback((r: Route) => {
    const h = href(r);
    if (location.hash !== h) location.hash = h;
    else setRoute(parse(h));
  }, []);
  return { route, go };
}
