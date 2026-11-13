import { useEffect, useLayoutEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { motion } from "motion/react";
import { cn } from "../../cn";
import { fade, springSnappy, springSoft } from "../../motion";
import { useControllable } from "../../controllable";

/** One place on the page: the id of its element, its name and what it covers. */
export type Checkpoint = { id: string; label: string; summary?: ReactNode };

/** Text used by ScrollCheckpoints. Pass a partial via `labels` to translate or reword. */
export interface ScrollCheckpointsLabels {
  /** aria-label of the navigation. */
  nav: string;
  /** Prefix read before a checkpoint's position, e.g. "2 of 5". */
  of: (n: number, total: number) => string;
}
export const scrollCheckpointsLabels: ScrollCheckpointsLabels = { nav: "On this page", of: (n, t) => `${n} of ${t}` };

export type ScrollCheckpointsProps = {
  items: Checkpoint[];
  /** Id of the checkpoint you are at. Leave it out and the component follows the page itself. */
  value?: string;
  /** Called when the current checkpoint changes, by scrolling or by a click. */
  onChange?: (id: string) => void;
  /** Edge of the window it sits on. Default "right". */
  side?: "left" | "right";
  /** The scrolling element, when it isn't the page. */
  container?: RefObject<HTMLElement | null>;
  /** A checkpoint becomes current once its element's top passes this share of the window height. Default 0.45. */
  line?: number;
  /** Where to place it: pinned to the window edge, or by the parent (for previews). Default "fixed". */
  position?: "fixed" | "inline";
  className?: string;
  /** Override any UI text. Merged over `scrollCheckpointsLabels`. */
  labels?: Partial<ScrollCheckpointsLabels>;
};

/**
 * Checkpoints for a long page, like the marks beside a long conversation: one tick
 * per section, the current one longer and in full ink. Hover or focus a tick to
 * see what that part covers; click it to travel there with the page's own
 * scroll, so scroll-linked effects play on the way. It follows the page by
 * itself, or you can drive it with `value`. Each preview belongs to its own
 * tick and fades, so nothing slides under the pointer.
 */
export function ScrollCheckpoints({ items, container, value, onChange, side = "right", line = 0.45, position = "fixed", className, labels }: ScrollCheckpointsProps) {
  const l = { ...scrollCheckpointsLabels, ...labels };
  const [current, setCurrent] = useControllable<string>(value, items[0]?.id ?? "", onChange);
  const [hover, setHover] = useState<string | null>(null);
  const tracking = value === undefined;
  const latest = useRef(current);
  useLayoutEffect(() => { latest.current = current; });

  useEffect(() => {
    if (!tracking) return;
    let frame = 0;
    const read = () => {
      frame = 0;
      const box = container?.current?.getBoundingClientRect();
      const mark = box ? box.top + box.height * line : window.innerHeight * line;
      let at = items[0]?.id;
      for (const it of items) {
        const el = document.getElementById(it.id);
        if (el && el.getBoundingClientRect().top <= mark) at = it.id;
      }
      if (at && at !== latest.current) setCurrent(at);
    };
    const on = () => { if (!frame) frame = requestAnimationFrame(read); };
    read();
    const target: HTMLElement | Window = container?.current ?? window;
    target.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => { target.removeEventListener("scroll", on); window.removeEventListener("resize", on); cancelAnimationFrame(frame); };
  }, [items, line, tracking, setCurrent, container]);

  const go = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const behavior = reduce ? "auto" : "smooth";
    const box = container?.current;
    // Inside a box, scroll only the box; scrollIntoView would move the page too.
    if (box) box.scrollTo({ top: box.scrollTop + el.getBoundingClientRect().top - box.getBoundingClientRect().top, behavior });
    else el.scrollIntoView({ behavior, block: "start" });
    if (!box) history.replaceState(null, "", `#${id}`);
    if (!tracking) setCurrent(id);
  };

  const right = side === "right";
  return (
    <nav
      aria-label={l.nav}
      onPointerLeave={() => setHover(null)}
      className={cn(
        position === "fixed" && cn("fixed top-1/2 z-40 -translate-y-1/2", right ? "right-2" : "left-2"),
        "flex flex-col py-2",
        right ? "items-end" : "items-start",
        className,
      )}
    >
      <ol className="flex flex-col">
        {items.map((it, i) => {
          const on = it.id === current;
          const open = hover === it.id;
          return (
            <li key={it.id} className="relative">
              <button
                type="button"
                onClick={() => go(it.id)}
                onPointerEnter={() => setHover(it.id)}
                onFocus={() => setHover(it.id)}
                onBlur={() => setHover((h) => (h === it.id ? null : h))}
                aria-current={on ? "location" : undefined}
                aria-label={`${it.label}, ${l.of(i + 1, items.length)}`}
                className={cn("group flex h-7 w-10 items-center rounded-control outline-offset-[-2px]", right ? "justify-end pr-2" : "justify-start pl-2")}
              >
                <motion.span
                  aria-hidden
                  initial={false}
                  animate={{ scaleX: on ? 1 : open ? 0.75 : 0.5 }}
                  transition={springSnappy}
                  className={cn(
                    "block h-[3px] w-6 rounded-full transition-colors duration-200",
                    right ? "origin-right" : "origin-left",
                    on ? "bg-ink" : "bg-line-strong group-hover:bg-muted",
                  )}
                />
              </button>
              <motion.div
                aria-hidden
                initial={false}
                animate={open ? { opacity: 1, x: 0, scale: 1 } : { opacity: 0, x: right ? 6 : -6, scale: 0.98 }}
                transition={open ? springSoft : fade}
                className={cn(
                  "pointer-events-none absolute top-1/2 w-60 -translate-y-1/2 rounded-card border border-line bg-elevated px-3.5 py-2.5 shadow-float",
                  right ? "right-full mr-2 origin-right" : "left-full ml-2 origin-left",
                )}
              >
                <span className="flex items-baseline justify-between gap-3">
                  <span className="truncate text-sm font-medium text-ink">{it.label}</span>
                  <span className="shrink-0 text-xs text-faint tabular">{String(i + 1).padStart(2, "0")}</span>
                </span>
                {it.summary && <span className="mt-0.5 line-clamp-2 block text-xs text-muted">{it.summary}</span>}
              </motion.div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
