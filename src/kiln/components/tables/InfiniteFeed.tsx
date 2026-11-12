import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { motion } from "motion/react";
import { cn } from "../../cn";
import { fade } from "../../motion";
import { Skeleton } from "../status/Skeleton";

/** Text used by InfiniteFeed. Pass a partial via `labels` to translate or reword. */
export interface InfiniteFeedLabels {
  /** Shown when a page fails to load. */
  error: string;
  /** The retry button. */
  retry: string;
}
export const infiniteFeedLabels: InfiniteFeedLabels = { error: "Couldn’t load more.", retry: "Try again" };

export type InfiniteFeedProps<T> = {
  /** Return the next page after `cursor` (null for the first). Return `next: null` at the end. */
  load: (cursor: string | null) => Promise<{ items: T[]; next: string | null }>;
  getKey: (item: T) => string;
  renderItem: (item: T) => ReactNode;
  /** Skeleton rows shown while a page loads. */
  skeleton?: ReactNode;
  /** Visible height of the scrolling box in px. */
  height: number;
  label: string;
  endText?: ReactNode;
  className?: string;
  /** Override any UI text. Merged over `infiniteFeedLabels`. */
  labels?: Partial<InfiniteFeedLabels>;
};

function DefaultSkeleton() {
  return (
    <div className="flex gap-3 rounded-card bg-surface p-4">
      <Skeleton shape="circle" className="size-9 shrink-0" />
      <div className="flex flex-1 flex-col gap-2 pt-1">
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
      </div>
    </div>
  );
}

/**
 * A list that fetches its next page as you near the end. New items are added
 * below what you are reading, skeleton rows hold their place while they load,
 * and each new page fades in, so the scroll position never jumps.
 */
export function InfiniteFeed<T>({ load, getKey, renderItem, skeleton, height, label, endText = "That’s everything.", className, labels }: InfiniteFeedProps<T>) {
  const l = { ...infiniteFeedLabels, ...labels };
  const [pages, setPages] = useState<T[][]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const sentinel = useRef<HTMLDivElement>(null);
  const busy = useRef(false);

  const more = useCallback(async () => {
    if (busy.current || done) return;
    busy.current = true;
    setLoading(true);
    setError(false);
    try {
      const r = await load(cursor);
      setPages((p) => [...p, r.items]);
      setCursor(r.next);
      if (r.next == null) setDone(true);
    } catch {
      setError(true);
    } finally {
      busy.current = false;
      setLoading(false);
    }
  }, [cursor, done, load]);

  useEffect(() => {
    const el = sentinel.current;
    if (!el || done || error) return;
    const io = new IntersectionObserver((e) => e[0].isIntersecting && more(), { root: boxRef.current, rootMargin: "0px 0px 600px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, [more, done, error]);

  const count = pages.reduce((n, p) => n + p.length, 0);

  return (
    <div
      ref={boxRef}
      role="feed"
      aria-label={label}
      aria-busy={loading}
      className={cn("overflow-y-auto overscroll-contain rounded-card", className)}
      style={{ height, overflowAnchor: "none" }}
    >
      <div className="flex flex-col gap-2 p-2">
        {pages.map((page, pi) => (
          <motion.div key={pi} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={fade} className="flex flex-col gap-2">
            {page.map((it, i) => (
              <article key={getKey(it)} aria-posinset={pages.slice(0, pi).reduce((n, p) => n + p.length, 0) + i + 1} aria-setsize={done ? count : -1} className="[content-visibility:auto] [contain-intrinsic-size:auto_96px]">
                {renderItem(it)}
              </article>
            ))}
          </motion.div>
        ))}
        {loading && (
          <div className="flex flex-col gap-2" aria-hidden>
            {Array.from({ length: 3 }, (_, i) => <div key={i}>{skeleton ?? <DefaultSkeleton />}</div>)}
          </div>
        )}
        {error && (
          <div className="flex items-center justify-between gap-3 rounded-card bg-negative-soft px-4 py-3 text-sm text-ink">
            {l.error}
            <button type="button" onClick={more} className="rounded-control bg-surface px-3 py-1.5 text-[13px] font-medium text-ink hover:bg-raised">
              {l.retry}
            </button>
          </div>
        )}
        {done && <p className="py-6 text-center text-[13px] text-muted">{endText}</p>}
        <div ref={sentinel} aria-hidden className="h-px" />
      </div>
    </div>
  );
}
