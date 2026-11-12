import { memo, useEffect, useMemo, useRef, useState } from "react";
import { motion, useMotionValue } from "motion/react";
import { cn } from "../../cn";
import { fade } from "../../motion";

export type YearDay = { date: string; count: number };

const CELL = 11;
const GAP = 3;
const PITCH = CELL + GAP;
const LEVELS = [0, 0.25, 0.5, 0.75, 1];

/** Text used by YearHeatmap. Pass a partial via `labels` to translate or reword. Weekday and month names come from `locale`. */
export interface YearHeatmapLabels {
  /** aria-label of the grid; receives the total count and the `unit`. */
  gridLabel: (total: number, unit: string) => string;
  /** Left end of the colour legend. */
  fewer: string;
  /** Right end of the colour legend. */
  more: string;
}
export const yearHeatmapLabels: YearHeatmapLabels = {
  gridLabel: (total, unit) => `${total} ${unit} in the year`,
  fewer: "Fewer",
  more: "More",
};

/** Short weekday names for the Mon, Wed and Fri rows (Monday 1 Jan 2024 is a Monday). */
const weekdays = (locale: string) =>
  [0, 1, 2, 3, 4, 5, 6].map((i) => (i % 2 === 0 && i < 5 ? new Date(2024, 0, 1 + i, 12).toLocaleDateString(locale, { weekday: "short" }) : ""));

const parse = (iso: string) => new Date(iso + "T12:00:00");
const fmt = (iso: string, locale: string) => parse(iso).toLocaleDateString(locale, { weekday: "long", day: "numeric", month: "long", year: "numeric" });

/**
 * A year of daily counts as a calendar: weeks across, Monday to Sunday down,
 * months labelled along the top. The day under the pointer is read out; it is
 * found from the pointer's position over the grid, so gaps never flicker. The
 * cells render once; only the ring and the readout change on hover.
 */
export function YearHeatmap({ days, unit, locale = "en-GB", className, labels }: {
  days: YearDay[];
  unit: string;
  /** Locale for dates and numbers. Defaults to "en-GB". */
  locale?: string;
  className?: string;
  /** Override any UI text. Merged over `yearHeatmapLabels`. */
  labels?: Partial<YearHeatmapLabels>;
}) {
  const l = { ...yearHeatmapLabels, ...labels };
  const [active, setActive] = useState<number | null>(null);
  const activeRef = useRef<number | null>(null);
  const grid = useRef<HTMLDivElement>(null);
  const ringX = useMotionValue(0);
  const ringY = useMotionValue(0);
  // Monday-based offset of the first day, so every column is one calendar week.
  const lead = (parse(days[0].date).getDay() + 6) % 7;
  const weeks = Math.ceil((days.length + lead) / 7);
  const total = useMemo(() => days.reduce((s, d) => s + d.count, 0), [days]);
  const cell = (i: number) => ({ col: Math.floor((i + lead) / 7), row: (i + lead) % 7 });

  const show = (i: number | null) => {
    if (i === activeRef.current) return;
    activeRef.current = i;
    if (i != null) {
      const { col, row } = cell(i);
      ringX.set(col * PITCH);
      ringY.set(row * PITCH);
    }
    setActive(i);
  };
  const pick = (cx: number, cy: number) => {
    const r = grid.current?.getBoundingClientRect();
    if (!r) return;
    const col = Math.max(0, Math.min(weeks - 1, Math.floor((cx - r.left + GAP / 2) / PITCH)));
    const row = Math.max(0, Math.min(6, Math.floor((cy - r.top + GAP / 2) / PITCH)));
    const i = col * 7 + row - lead;
    show(Math.max(0, Math.min(days.length - 1, i)));
  };

  const cur = active != null ? days[active] : null;
  return (
    <div className={cn("flex w-full min-w-0 flex-col gap-3", className)}>
      <div className="flex items-baseline justify-between gap-3 text-[13px]" aria-live="polite">
        <span className="truncate text-muted">{cur ? fmt(cur.date, locale) : `${parse(days[0].date).getFullYear()}`}</span>
        <span className="tabular shrink-0 font-medium text-ink">
          {(cur ? cur.count : total).toLocaleString(locale)} {unit}
        </span>
      </div>
      <div className="-m-1 overflow-x-auto p-1">
        <div className="flex w-max gap-2">
          <div className="flex flex-col pt-5 text-[10px] text-muted" style={{ gap: GAP }} aria-hidden>
            {weekdays(locale).map((d, i) => (
              <span key={i} className="leading-none" style={{ height: CELL }}>{d}</span>
            ))}
          </div>
          <div className="flex flex-col gap-1.5">
            <Months days={days} lead={lead} locale={locale} />
            <div
              ref={grid}
              className="relative touch-pan-x"
              style={{ width: weeks * PITCH - GAP, height: 7 * PITCH - GAP }}
              role="grid"
              aria-label={l.gridLabel(total, unit)}
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
              <Cells days={days} lead={lead} unit={unit} locale={locale} gridRef={grid} />
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
        </div>
      </div>
      <div className="flex items-center gap-1.5 self-end text-[11px] text-muted" aria-hidden>
        {l.fewer}
        {LEVELS.map((l, i) => (
          <span key={i} className={cn("size-2.5 rounded-[3px]", i === 0 ? "bg-active" : "bg-accent")} style={{ opacity: i === 0 ? 1 : l }} />
        ))}
        {l.more}
      </div>
    </div>
  );
}

const Months = memo(function Months({ days, lead, locale }: { days: YearDay[]; lead: number; locale: string }) {
  const labels: { col: number; text: string }[] = [];
  days.forEach((d, i) => {
    if (parse(d.date).getDate() === 1 || i === 0) {
      const col = Math.floor((i + lead) / 7);
      if (!labels.length || col - labels[labels.length - 1].col >= 3) labels.push({ col, text: parse(d.date).toLocaleDateString(locale, { month: "short" }) });
    }
  });
  return (
    <div className="relative h-3.5 text-[10px] text-muted" aria-hidden>
      {labels.map((l) => (
        <span key={l.col} className="absolute top-0 leading-none" style={{ left: l.col * PITCH }}>{l.text}</span>
      ))}
    </div>
  );
});

const Cells = memo(function Cells({
  days, lead, unit, locale, gridRef,
}: { days: YearDay[]; lead: number; unit: string; locale: string; gridRef: React.RefObject<HTMLDivElement | null> }) {
  const wrap = useRef<HTMLDivElement>(null);
  const max = useMemo(() => Math.max(1, ...days.map((d) => d.count)), [days]);
  useEffect(() => {
    const el = wrap.current;
    const host = gridRef.current;
    if (!el || !host || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const cells = Array.from(el.children) as HTMLElement[];
    cells.forEach((c) => (c.style.visibility = "hidden"));
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      cells.forEach((c, i) => {
        c.style.visibility = "";
        c.animate([{ opacity: 0 }, { opacity: c.style.opacity || "1" }], { duration: 420, delay: Math.floor((i + lead) / 7) * 8, easing: "cubic-bezier(0.22, 1, 0.36, 1)", fill: "backwards" });
      });
    });
    io.observe(host);
    return () => {
      io.disconnect();
      cells.forEach((c) => (c.style.visibility = ""));
    };
  }, [days, lead, gridRef]);
  const last = days.length - 1;
  return (
    <div ref={wrap} className="contents">
      {days.map((d, i) => {
        const col = Math.floor((i + lead) / 7), row = (i + lead) % 7;
        const lvl = d.count === 0 ? 0 : Math.max(1, Math.min(4, Math.ceil((d.count / max) * 4)));
        return (
          <button
            key={d.date}
            type="button"
            role="gridcell"
            data-i={i}
            tabIndex={i === last ? 0 : -1}
            aria-label={`${fmt(d.date, locale)}: ${d.count} ${unit}`}
            onKeyDown={(e) => {
              const step = { ArrowUp: -1, ArrowDown: 1, ArrowLeft: -7, ArrowRight: 7 }[e.key];
              if (step == null) return;
              e.preventDefault();
              const n = Math.max(0, Math.min(last, i + step));
              const all = gridRef.current?.querySelectorAll<HTMLButtonElement>("[role=gridcell]");
              if (!all) return;
              all.forEach((c) => (c.tabIndex = -1));
              all[n].tabIndex = 0;
              all[n].focus();
            }}
            className={cn("absolute rounded-[3px] outline-none", lvl === 0 ? "bg-active" : "bg-accent")}
            style={{ left: col * PITCH, top: row * PITCH, width: CELL, height: CELL, opacity: lvl === 0 ? 1 : LEVELS[lvl] }}
          />
        );
      })}
    </div>
  );
});
