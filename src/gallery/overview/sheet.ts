import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from "react";
import { useReducedMotion } from "motion/react";
import { categories } from "../registry";
import { href } from "../useRoute";

/* The gallery scrolls inside its framed sheet, not the window. Scroll scenes find that sheet
   themselves, so the overview needs nothing passed down from the shell. */
export function useSheet(from: RefObject<HTMLElement | null>) {
  const sheet = useRef<HTMLElement | null>(null);
  useLayoutEffect(() => {
    let el = from.current?.parentElement ?? null;
    while (el && el !== document.body) {
      const o = getComputedStyle(el).overflowY;
      if (o === "auto" || o === "scroll") break;
      el = el.parentElement;
    }
    sheet.current = el && el !== document.body ? el : document.documentElement;
  }, [from]);
  return sheet;
}

/** Pinned, scrubbed scenes on a wide screen with motion allowed; a plain stacked layout otherwise. */
export function useScenes() {
  const reduce = useReducedMotion();
  const [wide, setWide] = useState(() => typeof window !== "undefined" && window.matchMedia("(min-width: 768px)").matches);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const on = () => setWide(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return wide && !reduce;
}

/** The gallery link for an entry, wherever the registry files it. Null if it no longer exists. */
export function entryHref(id: string): string | null {
  for (const c of categories) if (c.entries.some((e) => e.id === id)) return href({ page: "category", category: c.id, entry: id });
  return null;
}
