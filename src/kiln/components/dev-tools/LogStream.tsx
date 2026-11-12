import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowDown, Pause } from "lucide-react";
import { cn } from "../../cn";
import { fade, springSoft } from "../../motion";

export type LogLevel = "debug" | "info" | "warn" | "error";
export type LogEntry = { id: number; time: string; level: LogLevel; source: string; message: string };

const levels: { id: LogLevel; tone: string; dot: string }[] = [
  { id: "debug", tone: "text-muted", dot: "bg-faint" },
  { id: "info", tone: "text-info", dot: "bg-info" },
  { id: "warn", tone: "text-warning", dot: "bg-warning" },
  { id: "error", tone: "text-negative", dot: "bg-negative" },
];

/** Text used by LogStream. Pass a partial via `labels` to translate or reword. */
export interface LogStreamLabels {
  /** Level names. */
  levels: Record<LogLevel, string>;
  /** aria-label of the level filter group. */
  levelsGroup: string;
  /** aria-label of the log when there is no title. */
  log: string;
  /** Empty state when no line matches the active levels. */
  empty: string;
  /** Pill text while paused, given the number of waiting lines. */
  paused: (waiting: number) => string;
  /** Pill text to return to the tail. */
  jumpToLatest: string;
}
export const logStreamLabels: LogStreamLabels = {
  levels: { debug: "Debug", info: "Info", warn: "Warn", error: "Error" },
  levelsGroup: "Levels",
  log: "Log",
  empty: "No lines at these levels.",
  paused: (n) => `Paused · ${n} new`,
  jumpToLatest: "Jump to latest",
};

export interface LogStreamIcons {
  /** Jump-to-latest pill. */
  latest: ReactNode;
  /** Pill while the stream is paused. */
  paused: ReactNode;
}
export const logStreamIcons: LogStreamIcons = { latest: <ArrowDown />, paused: <Pause /> };

export type LogStreamProps = {
  /** Every entry so far, oldest first. The component only renders the rows in view. */
  entries: LogEntry[];
  title?: string;
  height?: number;
  rowHeight?: number;
  /** BCP 47 locale for the level counts. Defaults to "en-US". */
  locale?: string;
  className?: string;
  /** Override any UI text. Merged over `logStreamLabels`. */
  labels?: Partial<LogStreamLabels>;
  /** Replace any built-in icon. Merged over `logStreamIcons`. */
  icons?: Partial<LogStreamIcons>;
};

/**
 * A live log. Filter by level; it follows the tail while you are at the bottom,
 * holds still while the pointer is over it (new lines wait behind a "new" pill),
 * and renders only the rows in view, so a hundred thousand lines cost the same as fifty.
 */
export function LogStream({ entries, title, height = 360, rowHeight = 26, locale, className, labels, icons }: LogStreamProps) {
  const lb = { ...logStreamLabels, ...labels };
  const ic = useMemo(() => ({ ...logStreamIcons, ...icons }), [icons]);
  const [on, setOn] = useState<Set<LogLevel>>(new Set(["info", "warn", "error"]));
  const [hover, setHover] = useState(false);
  const [follow, setFollow] = useState(true);
  const scroller = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);

  // While paused (pointer over it) the visible list is frozen at the entry count it had.
  const [frozenAt, setFrozenAt] = useState<number | null>(null);
  const count = useRef(entries.length);
  useLayoutEffect(() => {
    count.current = entries.length;
  });
  useEffect(() => setFrozenAt(hover ? count.current : null), [hover]);
  const live = frozenAt == null ? entries : entries.slice(0, frozenAt);
  const waiting = frozenAt == null ? 0 : entries.slice(frozenAt).filter((e) => on.has(e.level)).length;

  const rows = useMemo(() => live.filter((e) => on.has(e.level)), [live, on]);
  const counts = useMemo(() => {
    const c: Record<LogLevel, number> = { debug: 0, info: 0, warn: 0, error: 0 };
    for (const e of entries) c[e.level]++;
    return c;
  }, [entries]);

  const total = rows.length * rowHeight;
  const first = Math.max(0, Math.floor(scrollTop / rowHeight) - 6);
  const last = Math.min(rows.length, Math.ceil((scrollTop + height) / rowHeight) + 6);

  useLayoutEffect(() => {
    const el = scroller.current;
    if (el && follow && !hover) {
      el.scrollTop = el.scrollHeight;
      setScrollTop(el.scrollTop);
    }
  }, [rows.length, follow, hover]);

  return (
    <div
      className={cn("@container relative flex w-full flex-col overflow-hidden rounded-card border border-line bg-surface", className)}
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
    >
      <div className="flex flex-wrap items-center gap-2 border-b border-line px-3 py-2">
        {title && <span className="mr-auto truncate text-sm font-medium text-ink">{title}</span>}
        <div role="group" aria-label={lb.levelsGroup} className="flex flex-wrap gap-1">
          {levels.map((lv) => {
            const active = on.has(lv.id);
            return (
              <button
                key={lv.id}
                type="button"
                aria-pressed={active}
                onClick={() =>
                  setOn((s) => {
                    const n = new Set(s);
                    if (n.has(lv.id)) n.delete(lv.id);
                    else n.add(lv.id);
                    return n;
                  })
                }
                className={cn(
                  "relative inline-flex h-7 items-center gap-1.5 rounded-full px-2.5 text-xs font-medium transition-colors duration-200",
                  active ? "text-ink" : "text-faint hover:text-muted",
                )}
              >
                <motion.span aria-hidden className="pointer-events-none absolute inset-0 rounded-full bg-raised" initial={false} animate={{ opacity: active ? 1 : 0 }} transition={fade} />
                <span aria-hidden className={cn("relative z-[1] size-1.5 rounded-full transition-opacity duration-200", lv.dot, !active && "opacity-40")} />
                <span className="relative z-[1]">{lb.levels[lv.id]}</span>
                <span className="tabular relative z-[1] text-muted">{counts[lv.id].toLocaleString(locale ?? "en-US")}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div
        ref={scroller}
        role="log"
        aria-label={title ?? lb.log}
        aria-live="off"
        tabIndex={0}
        className="relative overflow-y-auto font-mono text-[12.5px] [contain:strict]"
        style={{ height }}
        onScroll={(e) => {
          const el = e.currentTarget;
          setScrollTop(el.scrollTop);
          const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < rowHeight;
          if (atBottom !== follow) setFollow(atBottom);
        }}
      >
        <div style={{ height: total, position: "relative" }}>
          {rows.slice(first, last).map((e, k) => {
            const lv = levels.find((x) => x.id === e.level)!;
            return (
              <div
                key={e.id}
                className={cn("absolute inset-x-0 flex items-center gap-3 px-3", e.level === "error" && "bg-negative-soft")}
                style={{ height: rowHeight, transform: `translateY(${(first + k) * rowHeight}px)` }}
              >
                <span className="tabular shrink-0 text-faint">{e.time}</span>
                <span className={cn("w-10 shrink-0 font-sans text-[11px] font-semibold", lv.tone)}>{lb.levels[lv.id]}</span>
                <span className="hidden w-24 shrink-0 truncate text-muted @lg:block">{e.source}</span>
                <span className="min-w-0 flex-1 truncate text-ink">{e.message}</span>
              </div>
            );
          })}
        </div>
        {rows.length === 0 && <p className="absolute inset-0 grid place-items-center font-sans text-sm text-muted">{lb.empty}</p>}
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center">
        <AnimatePresence>
          {(waiting > 0 || (!follow && !hover)) && (
            <motion.button
              type="button"
              className="pointer-events-auto inline-flex h-8 items-center gap-1.5 rounded-full border border-line bg-elevated px-3 text-xs font-medium text-ink shadow-float [&>svg]:size-3.5"
              onClick={() => {
                setFollow(true);
                setHover(false);
                const el = scroller.current;
                if (el) el.scrollTop = el.scrollHeight;
              }}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8, transition: fade }}
              transition={springSoft}
            >
              {waiting > 0 ? ic.paused : ic.latest}
              <span className="tabular">{waiting > 0 ? lb.paused(waiting) : lb.jumpToLatest}</span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
