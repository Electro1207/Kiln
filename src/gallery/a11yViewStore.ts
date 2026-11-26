/* Gallery-only: state of the Accessibility view and the sidebar marker CSS. */
import { useSyncExternalStore } from "react";
import { A11Y_META } from "./a11y-meta";

/* ---------- the on/off state: outside React so the header, sidebar and every entry read one value ---------- */
const KEY = "kiln-a11y-view";
const read = () => {
  try {
    if (new URLSearchParams(location.search).get("a11y") === "1") {
      localStorage.setItem(KEY, "1");
      return true;
    }
    return localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
};
let view = typeof window === "undefined" ? false : read();
const listeners = new Set<() => void>();
const subscribe = (l: () => void) => { listeners.add(l); return () => void listeners.delete(l); };
export function setA11yView(v: boolean) {
  if (v === view) return;
  view = v;
  try { localStorage.setItem(KEY, v ? "1" : "0"); } catch { /* storage blocked: the view still works for this visit */ }
  listeners.forEach((l) => l());
}
export const useA11yView = () => useSyncExternalStore(subscribe, () => view, () => false);

/** Does this entry have accessibility notes? */
export const hasA11yMeta = (id: string) => !!A11Y_META[id];

/* ---------- sidebar marker ---------- */
/** CSS that puts a small dot (named for screen readers where the browser allows) on every nav row that has notes. */
export function a11yMarkerCss() {
  const rows = Object.keys(A11Y_META).map((id) => `a[data-nav-id="${id}"]`);
  if (!rows.length) return "";
  return `${rows.join(",")}{padding-right:26px}
${rows.map((r) => `${r}::after`).join(",")}{content:"" / "Has accessibility notes";position:absolute;right:10px;top:50%;width:6px;height:6px;margin-top:-3px;border-radius:9999px;background:var(--k-accent);animation:k-a11y-dot .22s ease-out both}
@keyframes k-a11y-dot{from{opacity:0}to{opacity:1}}`;
}

