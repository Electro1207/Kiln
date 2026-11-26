import { forwardRef, useEffect, useLayoutEffect, useRef, useState, type HTMLAttributes, type RefObject } from "react";
import { motion } from "motion/react";
import { cn } from "../../cn";
import { fade } from "../../motion";
import { useControllable } from "../../controllable";
import { useA11yProps, type AccessibilityFeaturesProp } from "../../a11y";

/** One heading: the id of its element, its text and its depth (2 for an `h2`). */
export type TocItem = { id: string; label: string; level?: number };

/** Text used by TableOfContents. Pass a partial via `labels` to translate or reword. */
export interface TableOfContentsLabels {
  /** aria-label of the navigation, and the default heading above the list. */
  title: string;
}
export const tableOfContentsLabels: TableOfContentsLabels = { title: "On this page" };

const slug = (s: string) => s.toLowerCase().replace(/[^\p{L}\d]+/gu, "-").replace(/^-+|-+$/g, "");

export type TableOfContentsProps = Omit<HTMLAttributes<HTMLElement>, "onChange" | "title"> & {
  /** The headings, when you know them. Leave out to read them from `container`. */
  items?: TocItem[];
  /** Read the headings from inside this element (those that match `selector`). */
  container?: RefObject<HTMLElement | null>;
  /** Which elements in `container` count as headings. Default `"h2, h3"`. */
  selector?: string;
  /** Id of the heading you are at. Leave out and the list follows the scrolling itself. */
  value?: string;
  onChange?: (id: string) => void;
  /** The scrolling element, when it isn't the page. */
  scroller?: RefObject<HTMLElement | null>;
  /** A heading becomes current once its top passes this many px from the top of the scroller. Default 96. */
  offset?: number;
  /** Stay in view while the page scrolls. Default true. Set `top` to say how far from the edge. */
  sticky?: boolean;
  top?: number;
  /** Heading above the list; `false` hides it. Defaults to the `labels` title. */
  title?: string | false;
  /** Override any UI text. Merged over `tableOfContentsLabels`. */
  labels?: Partial<TableOfContentsLabels>;
  /** Turn accessibility features on for this component only. */
  accessibilityFeatures?: AccessibilityFeaturesProp;
};

/** The list of headings beside a long article. The one you are reading is marked, and a click takes you there. */
export const TableOfContents = forwardRef<HTMLElement, TableOfContentsProps>(function TableOfContents(
  { items: itemsProp, container, selector = "h2, h3", value, onChange, scroller, offset = 96, sticky = true, top = 24, title, labels, accessibilityFeatures, className, style, ...rest },
  ref,
) {
  const l = { ...tableOfContentsLabels, ...labels };
  const { a11y, rootProps } = useA11yProps(accessibilityFeatures);
  const [found, setFound] = useState<TocItem[]>([]);
  const items = itemsProp ?? found;
  const [current, setCurrent] = useControllable<string>(value, items[0]?.id ?? "", onChange);
  const tracking = value === undefined;
  const latest = useRef(current);
  const lock = useRef(0);
  useLayoutEffect(() => { latest.current = current; });

  // Read headings from the container, and again when its content changes.
  useEffect(() => {
    if (itemsProp) return;
    const root = container?.current;
    if (!root) return;
    const read = () => {
      const next: TocItem[] = [];
      const seen = new Set<string>();
      root.querySelectorAll<HTMLElement>(selector).forEach((el) => {
        const label = el.textContent?.trim() ?? "";
        if (!label) return;
        if (!el.id) { let s = slug(label) || "section"; let n = 2; const base = s; while (seen.has(s) || document.getElementById(s)) s = `${base}-${n++}`; el.id = s; }
        seen.add(el.id);
        next.push({ id: el.id, label, level: Number(el.tagName.slice(1)) || 2 });
      });
      setFound((prev) => (prev.length === next.length && prev.every((p, i) => p.id === next[i].id && p.label === next[i].label) ? prev : next));
    };
    read();
    const mo = new MutationObserver(read);
    mo.observe(root, { childList: true, subtree: true, characterData: true });
    return () => mo.disconnect();
  }, [itemsProp, container, selector]);

  // Scroll-spy: the last heading whose top has passed the line.
  useEffect(() => {
    if (!tracking || !items.length) return;
    let frame = 0;
    const read = () => {
      frame = 0;
      if (Date.now() < lock.current) return;
      const box = scroller?.current?.getBoundingClientRect();
      const mark = (box?.top ?? 0) + offset;
      let at = items[0].id;
      for (const it of items) {
        const el = document.getElementById(it.id);
        if (el && el.getBoundingClientRect().top <= mark) at = it.id;
      }
      const end = scroller?.current ? scroller.current.scrollTop + scroller.current.clientHeight >= scroller.current.scrollHeight - 2 : window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
      if (end) at = items[items.length - 1].id;
      if (at !== latest.current) setCurrent(at);
    };
    const on = () => { if (!frame) frame = requestAnimationFrame(read); };
    read();
    const target: HTMLElement | Window = scroller?.current ?? window;
    target.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => { target.removeEventListener("scroll", on); window.removeEventListener("resize", on); cancelAnimationFrame(frame); };
  }, [items, offset, tracking, setCurrent, scroller]);

  const go = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const reduce = a11y.reduceMotion || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const behavior = reduce ? "auto" : "smooth";
    const box = scroller?.current;
    if (box) box.scrollTo({ top: box.scrollTop + el.getBoundingClientRect().top - box.getBoundingClientRect().top - offset + 8, behavior });
    else window.scrollTo({ top: window.scrollY + el.getBoundingClientRect().top - offset + 8, behavior });
    // Hold the mark on the clicked heading while the page travels, so it doesn't flicker through the ones it passes.
    lock.current = Date.now() + (reduce ? 80 : 700);
    setCurrent(id);
    if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "-1");
    el.focus({ preventScroll: true });
  };

  const min = Math.min(...items.map((i) => i.level ?? 2), 6);
  const heading = title === undefined ? l.title : title;
  return (
    <nav
      ref={ref}
      aria-label={l.title}
      {...rest}
      {...rootProps}
      style={{ ...(sticky ? { top } : {}), ...rootProps.style, ...style }}
      className={cn("min-w-0", sticky && "sticky max-h-[calc(100dvh-3rem)] self-start overflow-y-auto", className)}
    >
      {heading && <p className="mb-2 text-[0.8125rem] font-medium text-ink">{heading}</p>}
      <ul className="border-l border-line">
        {items.map((it) => {
          const on = it.id === current;
          return (
            <li key={it.id} className="relative">
              <a
                href={`#${it.id}`}
                aria-current={on ? "location" : undefined}
                onClick={(e) => { e.preventDefault(); go(it.id); }}
                style={{ paddingLeft: 12 + ((it.level ?? 2) - min) * 12 }}
                className={cn(
                  "relative block rounded-r-[6px] py-1.5 pr-2 text-[0.8125rem] leading-snug outline-offset-[-2px] transition-colors duration-200",
                  on ? "font-medium text-ink" : "text-muted hover:text-ink",
                )}
              >
                <motion.span aria-hidden initial={false} animate={{ opacity: on ? 1 : 0 }} transition={fade} className="pointer-events-none absolute inset-y-0 -left-px w-0.5 bg-ink" />
                {it.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
});
