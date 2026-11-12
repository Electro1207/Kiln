import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { cn } from "../../cn";
import { springSoft } from "../../motion";

export type GanttTask = {
  id: string;
  name: string;
  /** ISO dates, inclusive. A task with start === end and `milestone` draws as a diamond. */
  start: string;
  end: string;
  /** 0 to 1. */
  progress?: number;
  /** Ids of tasks that must finish first. */
  after?: string[];
  milestone?: boolean;
  /** Who owns it, shown under the name. */
  owner?: string;
};

export type GanttChartProps = {
  tasks: GanttTask[];
  /** ISO date range shown. */
  from: string;
  to: string;
  today?: string;
  /** Width of one day in px. */
  dayWidth?: number;
  rowHeight?: number;
  title: string;
  /** BCP 47 locale for month and date text. */
  locale?: string;
  /** Override any UI text. Merged over `ganttChartLabels`. */
  labels?: Partial<GanttChartLabels>;
  className?: string;
};

/** Text used by GanttChart. Pass a partial via `labels` to translate or reword. */
export interface GanttChartLabels {
  /** Heading of the pinned name column. */
  task: string;
  /** Marker above today's line. */
  today: string;
  /** aria-label of the scrolling timeline region. */
  timeline: (title: string) => string;
  /** aria-label of a task: "Name: 1 Mar to 4 Mar, 40% done". `percent` is undefined when no progress. */
  taskLabel: (name: string, start: string, end: string, percent?: number) => string;
}
export const ganttChartLabels: GanttChartLabels = {
  task: "Task",
  today: "Today",
  timeline: (title) => `${title}, timeline`,
  taskLabel: (name, start, end, percent) => `${name}: ${start} to ${end}${percent != null ? `, ${percent}% done` : ""}`,
};

const DAY = 864e5;
const toDay = (iso: string) => Math.round(Date.UTC(+iso.slice(0, 4), +iso.slice(5, 7) - 1, +iso.slice(8, 10)) / DAY);
const fromDay = (n: number) => new Date(n * DAY);

/**
 * Tasks as bars over dates, with arrows from each task to the ones waiting on
 * it, and a line for today. Names stay pinned while the dates scroll. Hovering
 * or focusing a task brings forward its chain of dependencies.
 */
export function GanttChart({ tasks, from, to, today, dayWidth = 18, rowHeight = 44, title, locale = "en-GB", labels, className }: GanttChartProps) {
  const lb = { ...ganttChartLabels, ...labels };
  const [focus, setFocus] = useState<string | null>(null);
  const d0 = toDay(from);
  const days = toDay(to) - d0 + 1;
  const width = days * dayWidth;
  const rowOf = useMemo(() => new Map(tasks.map((t, i) => [t.id, i])), [tasks]);
  const byId = useMemo(() => new Map(tasks.map((t) => [t.id, t])), [tasks]);

  const chain = useMemo(() => {
    if (!focus) return null;
    const set = new Set<string>([focus]);
    const up = (id: string) => byId.get(id)?.after?.forEach((p) => { if (!set.has(p)) { set.add(p); up(p); } });
    const down = (id: string) => tasks.forEach((t) => { if (t.after?.includes(id) && !set.has(t.id)) { set.add(t.id); down(t.id); } });
    up(focus);
    down(focus);
    return set;
  }, [focus, byId, tasks]);

  const x0 = (t: GanttTask) => (toDay(t.start) - d0) * dayWidth;
  const x1 = (t: GanttTask) => (toDay(t.end) - d0 + 1) * dayWidth;
  const yMid = (i: number) => i * rowHeight + rowHeight / 2;

  const weeks: number[] = [];
  const months: { at: number; label: string }[] = [];
  for (let i = 0; i < days; i++) {
    const d = fromDay(d0 + i);
    if (d.getUTCDay() === 1) weeks.push(i);
    if (d.getUTCDate() === 1 || i === 0) months.push({ at: i, label: d.toLocaleDateString(locale, { month: "long", timeZone: "UTC" }) });
  }
  const todayX = today ? (toDay(today) - d0 + 0.5) * dayWidth : null;
  const fmt = (iso: string) => fromDay(toDay(iso)).toLocaleDateString(locale, { day: "numeric", month: "short", timeZone: "UTC" });

  // Finish-to-start arrows leave from under the end of the earlier bar and drop to
  // the later task's row, so they never cross the progress label beside a bar.
  const links = tasks.flatMap((t) =>
    (t.after ?? []).filter((p) => byId.has(p)).map((p) => {
      const a = byId.get(p)!, ai = rowOf.get(p)!, bi = rowOf.get(t.id)!;
      const aw = x1(a) - x0(a);
      const sx = a.milestone ? x0(a) + dayWidth / 2 : x1(a) - Math.min(10, aw / 2);
      const sy = yMid(ai) + (a.milestone ? 9 : 12);
      const ex = t.milestone ? x0(t) + dayWidth / 2 - 9 : x0(t);
      const ey = yMid(bi);
      const r = 5;
      const d = ex - 4 > sx + r
        ? `M${sx} ${sy} V${ey - r} Q${sx} ${ey} ${sx + r} ${ey} H${ex - 2}`
        : `M${sx} ${sy} V${yMid(bi) - rowHeight / 2} H${ex - 10} V${ey} H${ex - 2}`;
      return { key: `${p}-${t.id}`, d, on: !chain || (chain.has(p) && chain.has(t.id)) };
    }),
  );

  return (
    <figure
      className={cn("flex w-full min-w-0 overflow-hidden rounded-card border border-line bg-surface", className)}
      aria-label={title}
      onPointerLeave={() => setFocus(null)}
    >
      <div className="w-40 shrink-0 border-r border-line sm:w-56">
        <div className="flex h-12 items-end border-b border-line px-4 pb-2 text-[13px] font-medium text-muted">{lb.task}</div>
        <ul>
          {tasks.map((t) => (
            <li
              key={t.id}
              className={cn("flex flex-col justify-center px-4 transition-opacity duration-200", chain && !chain.has(t.id) && "opacity-40")}
              style={{ height: rowHeight }}
            >
              <span className="truncate text-sm text-ink">{t.name}</span>
              {t.owner && <span className="truncate text-xs text-muted">{t.owner}</span>}
            </li>
          ))}
        </ul>
      </div>

      <div className="min-w-0 flex-1 overflow-x-auto" tabIndex={0} role="region" aria-label={lb.timeline(title)}>
        <div className="relative" style={{ width }}>
          <div className="relative h-12 border-b border-line" aria-hidden>
            {months.map((m) => (
              <span key={m.at} className="absolute top-2 whitespace-nowrap pl-1.5 text-[13px] font-medium text-ink" style={{ left: m.at * dayWidth }}>
                {m.label}
              </span>
            ))}
            {weeks.map((w) => (
              <span key={w} className="tabular absolute bottom-2 pl-1.5 text-[11px] text-muted" style={{ left: w * dayWidth }}>
                {fromDay(d0 + w).getUTCDate()}
              </span>
            ))}
          </div>
          <div className="relative" style={{ height: tasks.length * rowHeight }}>
            {weeks.map((w) => (
              <span key={w} aria-hidden className="absolute inset-y-0 w-px bg-line" style={{ left: w * dayWidth }} />
            ))}
            {tasks.map((_, i) => i > 0 && <span key={i} aria-hidden className="absolute inset-x-0 h-px bg-line/60" style={{ top: i * rowHeight }} />)}

            <svg className="pointer-events-none absolute inset-0 overflow-visible" width={width} height={tasks.length * rowHeight} aria-hidden>
              <defs>
                <marker id="gantt-arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="8" markerHeight="8" orient="auto">
                  <path d="M0 0 L8 4 L0 8 z" className="fill-muted" />
                </marker>
              </defs>
              {links.map((l) => (
                <path
                  key={l.key}
                  d={l.d}
                  fill="none"
                  className="stroke-muted transition-opacity duration-200"
                  strokeWidth={1.25}
                  markerEnd="url(#gantt-arrow)"
                  style={{ opacity: l.on ? 0.9 : 0.15 }}
                />
              ))}
            </svg>

            {tasks.map((t, i) => {
              const left = x0(t), w = Math.max(dayWidth, x1(t) - x0(t));
              const dim = chain && !chain.has(t.id);
              const label = lb.taskLabel(t.name, fmt(t.start), fmt(t.end), t.progress != null ? Math.round(t.progress * 100) : undefined);
              const hover = {
                onPointerEnter: () => setFocus(t.id),
                onFocus: () => setFocus(t.id),
                onBlur: () => setFocus(null),
              };
              if (t.milestone) {
                const cx = left + dayWidth / 2;
                return (
                  <motion.button
                    key={t.id}
                    type="button"
                    aria-label={label}
                    {...hover}
                    className="absolute grid place-items-center"
                    style={{ left: cx - 10, top: yMid(i) - 10, width: 20, height: 20 }}
                    initial={{ opacity: 0, scale: 0.6 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ ...springSoft, delay: 0.25 + i * 0.03 }}
                  >
                    <span className={cn("size-3.5 rotate-45 rounded-[3px] bg-ink transition-opacity duration-200", dim && "opacity-40")} />
                  </motion.button>
                );
              }
              return (
                <motion.button
                  key={t.id}
                  type="button"
                  aria-label={label}
                  {...hover}
                  className="absolute rounded-[6px] text-left"
                  style={{ left, width: w, top: yMid(i) - 12, height: 24 }}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ ...springSoft, delay: i * 0.03 }}
                >
                  <span aria-hidden className={cn("absolute inset-0 overflow-hidden rounded-[6px] bg-accent-soft transition-opacity duration-200", dim && "opacity-40")}>
                    {t.progress != null && <span className="absolute inset-y-0 left-0 bg-accent" style={{ width: `${t.progress * 100}%` }} />}
                  </span>
                  {t.progress != null && (
                    <span
                      aria-hidden
                      className={cn("tabular absolute left-full top-0 whitespace-nowrap pl-2 text-[11px] leading-6 text-muted transition-opacity duration-200", dim && "opacity-40")}
                    >
                      {Math.round(t.progress * 100)}%
                    </span>
                  )}
                </motion.button>
              );
            })}

            {todayX != null && todayX >= 0 && todayX <= width && (
              <div aria-hidden className="pointer-events-none absolute inset-y-0 z-10" style={{ left: todayX }}>
                <span className="absolute inset-y-0 -ml-px w-0.5 bg-accent" />
              </div>
            )}
          </div>
          {todayX != null && todayX >= 0 && todayX <= width && (
            <span className="tabular pointer-events-none absolute top-1 z-10 -translate-x-1/2 rounded-full bg-btn-primary px-1.5 text-[10px] font-medium leading-4 text-btn-primary-ink" style={{ left: todayX }}>
              {lb.today}
            </span>
          )}
        </div>
      </div>
      <figcaption className="sr-only">{title}</figcaption>
    </figure>
  );
}
