import { memo, useEffect, useMemo, useRef, useState } from "react";
import { motion, useMotionValue } from "motion/react";
import { cn } from "../../cn";
import { fade } from "../../motion";

/** Text used by HeatStrip. Pass a partial via `labels` to translate or reword. */
export interface HeatStripLabels {
  /** Readout when no day is hovered, given the number of weeks. */
  lastWeeks: (weeks: number) => string;
  /** aria-label of the grid, given the total, the unit and the number of weeks. */
  summary: (total: number, unit: string, weeks: number) => string;
  /** aria-label of a day cell, given the formatted date, count and unit. */
  day: (date: string, count: number, unit: string) => string;
  /** Legend text at the low end. */
  fewer: string;
  /** Legend text at the high end. */
  more: string;
}
export const heatStripLabels: HeatStripLabels = {
  lastWeeks: (weeks) => `Last ${weeks} weeks`,
  summary: (total, unit, weeks) => `${total} ${unit} over ${weeks} weeks`,
  day: (date, count, unit) => `${date}: ${count} ${unit}`,
  fewer: "Fewer",
  more: "More",
};

export type HeatStripProps = {
  /** One count per day, oldest first. Its length should be a multiple of 7. */
  days: { date: string; count: number }[];
  /** What a count is, for the readout: "deploys", "sightings". */
  unit: string;
  /** BCP 47 locale for dates. Defaults to "en-GB". */
  locale?: string;
  className?: string;
  /** Override any UI text. Merged over `heatStripLabels`. */
  labels?: Partial<HeatStripLabels>;
};

const LEVELS = [0, 0.25, 0.5, 0.75, 1];
const CELL = 12;
const GAP = 3;
const PITCH = CELL + GAP;

const formatters = new Map<string, Intl.DateTimeFormat>();
const fmt = (iso: string, locale = "en-GB") => {
  let f = formatters.get(locale);
  if (!f) formatters.set(locale, (f = new Intl.DateTimeFormat(locale, { weekday: "short", day: "numeric", month: "short" })));
  return f.format(new Date(iso + "T12:00:00"));
};

/**
 * A half-year-at-a-glance strip, one square per day, weeks in columns.
 * The hovered day is computed from the pointer over the whole grid, gaps
 * included, and kept until the pointer leaves the grid: no flicker between cells.
 *
 * Performance: the 180-odd cells render once (memoised) and never re-render on
 * hover; the ring is positioned through motion values and only the readout
 * re-renders. The entrance runs on the compositor (Web Animations), not React.
 */
export function HeatStrip({ days, unit, locale, className, labels }: HeatStripProps) {
  // Stable, so the memoised cells don't re-render on every hover.
  const l = useMemo(() => ({ ...heatStripLabels, ...labels }), [labels]);
  const [active, setActive] = useState<number | null>(null);
  const activeRef = useRef<number | null>(null);
  const grid = useRef<HTMLDivElement>(null);
  const ringX = useMotionValue(0);
  const ringY = useMotionValue(0);
  const weeks = Math.ceil(days.length / 7);
  const total = useMemo(() => days.reduce((s, d) => s + d.count, 0), [days]);

  const show = (i: number | null) => {
    if (i === activeRef.current) return;
    activeRef.current = i;
    if (i != null) {
      ringX.set(Math.floor(i / 7) * PITCH);
      ringY.set((i % 7) * PITCH);
    }
    setActive(i);
  };

  const pick = (clientX: number, clientY: number) => {
    const r = grid.current?.getBoundingClientRect();
    if (!r) return;
    const col = Math.max(0, Math.min(weeks - 1, Math.floor((clientX - r.left + GAP / 2) / PITCH)));
    const row = Math.max(0, Math.min(6, Math.floor((clientY - r.top + GAP / 2) / PITCH)));
    show(Math.min(days.length - 1, col * 7 + row));
  };

  const cur = active != null ? days[active] : null;
  return (
    <div className={cn("flex w-full min-w-0 flex-col gap-3", className)}>
      <div className="flex items-baseline justify-between gap-3 text-[13px]" aria-live="polite">
        <span className="tabular text-muted">{cur ? fmt(cur.date, locale) : l.lastWeeks(weeks)}</span>
        <span className="tabular font-medium text-ink">
          {cur ? cur.count : total} {unit}
        </span>
      </div>
      <div className="-m-1 overflow-x-auto p-1">
        <div
          ref={grid}
          className="relative flex w-max touch-pan-x"
          style={{ gap: GAP }}
          role="grid"
          aria-label={l.summary(total, unit, weeks)}
          onPointerMove={(e) => pick(e.clientX, e.clientY)}
          onPointerLeave={() => show(null)}
          onFocus={(e) => {
            const i = Number((e.target as HTMLElement).dataset.i);
            if (!Number.isNaN(i)) show(i);
          }}
          onBlur={(e) => {
            if (!grid.current?.contains(e.relatedTarget as Node)) show(null);
          }}
        >
          <Cells days={days} unit={unit} gridRef={grid} locale={locale} l={l} />
          {/* One ring for the whole grid, above every cell. It jumps cell to cell. */}
          <motion.span
            aria-hidden
            className="pointer-events-none absolute left-0 top-0 z-10 rounded-[4px] border-2 border-ink"
            style={{ width: CELL + 4, height: CELL + 4, marginLeft: -2, marginTop: -2, x: ringX, y: ringY }}
            initial={false}
            animate={{ opacity: active == null ? 0 : 1 }}
            transition={fade}
          />
        </div>
      </div>
      <div className="flex items-center gap-1.5 self-end text-[11px] text-muted" aria-hidden>
        {l.fewer}
        {LEVELS.map((lv, i) => (
          <span key={i} className={cn("size-2.5 rounded-[3px]", i === 0 ? "bg-active" : "bg-accent")} style={{ opacity: i === 0 ? 1 : lv }} />
        ))}
        {l.more}
      </div>
    </div>
  );
}

/** The cells. Rendered once per data set; hover never re-renders them. */
const Cells = memo(function Cells({ days, unit, gridRef, locale, l }: { days: HeatStripProps["days"]; unit: string; gridRef: React.RefObject<HTMLDivElement | null>; locale?: string; l: HeatStripLabels }) {
  const wrap = useRef<HTMLDivElement>(null);
  const max = useMemo(() => Math.max(1, ...days.map((d) => d.count)), [days]);
  const weeks = useMemo(() => {
    const w: { date: string; count: number; i: number }[][] = [];
    days.forEach((d, i) => {
      (w[Math.floor(i / 7)] ??= []).push({ ...d, i });
    });
    return w;
  }, [days]);

  useEffect(() => {
    const el = wrap.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const cells = Array.from(el.querySelectorAll<HTMLElement>("[data-i]"));
    cells.forEach((c) => (c.style.visibility = "hidden"));
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      cells.forEach((c) => {
        c.style.visibility = "";
        const col = Math.floor(Number(c.dataset.i) / 7);
        c.animate([{ opacity: 0 }, { opacity: c.style.opacity || "1" }], { duration: 450, delay: col * 12, easing: "cubic-bezier(0.22, 1, 0.36, 1)", fill: "backwards" });
      });
    });
    io.observe(gridRef.current ?? el.parentElement ?? el);
    return () => {
      io.disconnect();
      cells.forEach((c) => (c.style.visibility = ""));
    };
  }, [days, gridRef]);

  const lastIndex = days.length - 1;
  return (
    <div ref={wrap} className="contents">
      {weeks.map((week, wi) => (
        <div key={wi} className="flex flex-col" style={{ gap: GAP }} role="row">
          {week.map((d) => {
            const lvl = d.count === 0 ? 0 : Math.max(1, Math.min(4, Math.ceil((d.count / max) * 4)));
            return (
              <button
                key={d.date}
                type="button"
                role="gridcell"
                data-i={d.i}
                tabIndex={d.i === lastIndex ? 0 : -1}
                aria-label={l.day(fmt(d.date, locale), d.count, unit)}
                onKeyDown={(e) => {
                  const step = { ArrowUp: -1, ArrowDown: 1, ArrowLeft: -7, ArrowRight: 7 }[e.key];
                  if (step == null) return;
                  e.preventDefault();
                  const n = Math.max(0, Math.min(lastIndex, d.i + step));
                  const cells = gridRef.current?.querySelectorAll<HTMLButtonElement>("[role=gridcell]");
                  if (!cells) return;
                  cells.forEach((c) => (c.tabIndex = -1));
                  cells[n].tabIndex = 0;
                  cells[n].focus();
                }}
                className={cn("rounded-[3px] outline-none", lvl === 0 ? "bg-active" : "bg-accent")}
                style={{ width: CELL, height: CELL, opacity: lvl === 0 ? 1 : LEVELS[lvl] }}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
});
