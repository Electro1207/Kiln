import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "../../cn";
import { fade, springSoft } from "../../motion";

export type CalendarTone = "accent" | "info" | "positive" | "warning" | "negative";

export type CalendarEvent = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  location?: string;
  tone?: CalendarTone;
};

export type WeekCalendarProps = {
  /** The days to show, in order (usually seven). */
  days: Date[];
  events: CalendarEvent[];
  /** First and last hour on the grid. */
  startHour?: number;
  endHour?: number;
  /** "Now", for the current-time line and today's mark. */
  now?: Date;
  /** Height of one hour, in px. */
  hourHeight?: number;
  /** Height of the scrolling area. */
  height?: number;
  /** BCP 47 locale for day names and times. */
  locale?: string;
  /** Override any UI text. Merged over `weekCalendarLabels`. */
  labels?: Partial<WeekCalendarLabels>;
  onSelect?: (event: CalendarEvent) => void;
  selectedId?: string | null;
  className?: string;
};

/** Text used by WeekCalendar. Pass a partial via `labels` to translate or reword. */
export interface WeekCalendarLabels {
  /** aria-label of the day tab strip on narrow widths. */
  day: string;
  /** aria-label of an event button: "Title, 9:00 AM to 10:00 AM, Place". */
  event: (title: string, start: string, end: string, location?: string) => string;
  /** aria-label of the current-time line. */
  now: (time: string) => string;
}
export const weekCalendarLabels: WeekCalendarLabels = {
  day: "Day",
  event: (title, start, end, location) => `${title}, ${start} to ${end}${location ? `, ${location}` : ""}`,
  now: (time) => `Now, ${time}`,
};

const tones: Record<CalendarTone, { fill: string; edge: string; ink: string }> = {
  accent: { fill: "bg-accent-soft", edge: "bg-accent", ink: "text-accent" },
  info: { fill: "bg-info-soft", edge: "bg-info", ink: "text-info" },
  positive: { fill: "bg-positive-soft", edge: "bg-positive", ink: "text-positive" },
  warning: { fill: "bg-warning-soft", edge: "bg-warning", ink: "text-warning" },
  negative: { fill: "bg-negative-soft", edge: "bg-negative", ink: "text-negative" },
};

const sameDay = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
const hours = (d: Date) => d.getHours() + d.getMinutes() / 60;

/** Lay out one day's events: overlapping events share the width side by side. */
function layoutDay(evts: CalendarEvent[]) {
  const sorted = [...evts].sort((a, b) => +a.start - +b.start || +b.end - +a.end);
  const out = new Map<string, { col: number; cols: number }>();
  let cluster: CalendarEvent[] = [];
  let clusterEnd = -Infinity;
  let colEnds: number[] = [];
  const flush = () => {
    const cols = colEnds.length;
    cluster.forEach((e) => (out.get(e.id)!.cols = cols));
    cluster = [];
    colEnds = [];
  };
  for (const e of sorted) {
    if (+e.start >= clusterEnd) flush();
    let col = colEnds.findIndex((end) => end <= +e.start);
    if (col < 0) {
      col = colEnds.length;
      colEnds.push(+e.end);
    } else colEnds[col] = +e.end;
    out.set(e.id, { col, cols: 1 });
    cluster.push(e);
    clusterEnd = Math.max(clusterEnd, +e.end);
  }
  flush();
  return out;
}

/**
 * A week on a time grid. Events sit by their start and end; ones that overlap
 * share the column side by side. A line marks the current time in today's
 * column. Below 640px of its own width it becomes a one-day scheduler with a
 * strip of days to switch between.
 */
export function WeekCalendar({
  days, events, startHour = 7, endHour = 23, now, hourHeight = 48, height = 520, locale = "en-US", labels, onSelect, selectedId, className,
}: WeekCalendarProps) {
  const l = { ...weekCalendarLabels, ...labels };
  const root = useRef<HTMLDivElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const [narrow, setNarrow] = useState(false);
  const todayIndex = now ? days.findIndex((d) => sameDay(d, now)) : -1;
  const [day, setDay] = useState(Math.max(0, todayIndex));

  useLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setNarrow(e.contentRect.width < 640));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useLayoutEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const first = now && todayIndex >= 0 ? hours(now) : Math.min(...events.map((e) => hours(e.start)), 9);
    el.scrollTop = Math.max(0, (first - startHour - 1) * hourHeight);
  }, [now, todayIndex, events, startHour, hourHeight]);

  const shown = narrow ? [day] : days.map((_, i) => i);
  const layouts = useMemo(() => days.map((d) => layoutDay(events.filter((e) => sameDay(e.start, d)))), [days, events]);
  const span = endHour - startHour;
  const dayName = (d: Date, style: "short" | "narrow") => d.toLocaleDateString(locale, { weekday: style });
  const time = (d: Date) => d.toLocaleTimeString(locale, { hour: "numeric", minute: "2-digit" });

  return (
    <div ref={root} className={cn("flex w-full min-w-0 flex-col overflow-hidden rounded-card border border-line bg-surface", className)}>
      {narrow && (
        <div role="tablist" aria-label={l.day} className="grid grid-cols-7 gap-1 border-b border-line p-2">
          {days.map((d, i) => {
            const on = i === day;
            const today = i === todayIndex;
            return (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={on}
                aria-label={d.toLocaleDateString(locale, { weekday: "long", month: "long", day: "numeric" })}
                onClick={() => {
                  setDay(i);
                  const evs = events.filter((e) => sameDay(e.start, d));
                  const first = i === todayIndex && now ? hours(now) : evs.length ? Math.min(...evs.map((e) => hours(e.start))) : null;
                  if (first != null) scroller.current?.scrollTo({ top: Math.max(0, (first - startHour - 0.5) * hourHeight), behavior: "smooth" });
                }}
                className="relative flex flex-col items-center gap-1 rounded-control py-1.5 text-xs text-muted"
              >
                <span>{dayName(d, "narrow")}</span>
                <span className="relative grid size-8 place-items-center">
                  <motion.span
                    aria-hidden
                    className={cn("absolute inset-0 rounded-full", today ? "bg-btn-primary" : "bg-btn-secondary")}
                    initial={false}
                    animate={{ opacity: on ? 1 : 0 }}
                    transition={fade}
                  />
                  <span
                    className={cn(
                      "tabular relative z-[1] text-sm font-medium transition-[color] duration-0",
                      on ? (today ? "text-btn-primary-ink delay-[80ms]" : "text-btn-secondary-ink delay-[80ms]") : today ? "text-accent" : "text-ink",
                    )}
                  >
                    {d.getDate()}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      )}

      {!narrow && (
        <div className="grid border-b border-line" style={{ gridTemplateColumns: `56px repeat(${shown.length}, minmax(0, 1fr))` }}>
          <span />
          {shown.map((i) => {
            const d = days[i];
            const today = i === todayIndex;
            return (
              <div key={i} className="flex items-center justify-center gap-1.5 py-2.5 text-[13px]">
                <span className="text-muted">{dayName(d, "short")}</span>
                <span
                  className={cn(
                    "tabular grid size-7 place-items-center rounded-full font-medium",
                    today ? "bg-btn-primary text-btn-primary-ink" : "text-ink",
                  )}
                >
                  {d.getDate()}
                </span>
              </div>
            );
          })}
        </div>
      )}

      <div ref={scroller} className="relative overflow-y-auto" style={{ height }}>
        <div className="relative grid" style={{ gridTemplateColumns: `56px repeat(${shown.length}, minmax(0, 1fr))`, height: span * hourHeight }}>
          <div className="relative" aria-hidden>
            {Array.from({ length: span }, (_, h) => (
              <span key={h} className="tabular absolute right-2 -translate-y-1/2 text-[11px] text-muted" style={{ top: h * hourHeight }}>
                {h === 0 ? "" : new Date(2000, 0, 1, startHour + h).toLocaleTimeString(locale, { hour: "numeric" })}
              </span>
            ))}
          </div>
          {Array.from({ length: span - 1 }, (_, h) => (
            <span key={h} aria-hidden className="pointer-events-none absolute left-14 right-0 h-px bg-line" style={{ top: (h + 1) * hourHeight }} />
          ))}

          {shown.map((i, ci) => {
            const d = days[i];
            const dayEvents = events.filter((e) => sameDay(e.start, d));
            const lay = layouts[i];
            const today = i === todayIndex;
            return (
              <div
                key={i}
                className={cn("relative", ci > 0 && "border-l border-line", today && "bg-accent-soft/30")}
                role="list"
                aria-label={d.toLocaleDateString(locale, { weekday: "long", month: "long", day: "numeric" })}
              >
                <AnimatePresence initial={false} mode="popLayout">
                  <motion.div
                    key={narrow ? `d${i}` : "w"}
                    className="absolute inset-0"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={fade}
                  >
                    {dayEvents.map((e) => {
                      const { col, cols } = lay.get(e.id)!;
                      const top = (hours(e.start) - startHour) * hourHeight;
                      const h = Math.max(22, (hours(e.end) - hours(e.start)) * hourHeight - 2);
                      const t = tones[e.tone ?? "accent"];
                      const sel = selectedId === e.id;
                      const short = h < 40;
                      return (
                        <button
                          key={e.id}
                          type="button"
                          role="listitem"
                          onClick={() => onSelect?.(e)}
                          aria-label={l.event(e.title, time(e.start), time(e.end), e.location)}
                          aria-pressed={onSelect ? sel : undefined}
                          className={cn(
                            "group absolute flex overflow-hidden rounded-[6px] text-left outline-offset-1",
                            t.fill,
                          )}
                          style={{
                            top: top + 1,
                            height: h,
                            left: `calc(${(col / cols) * 100}% + 2px)`,
                            width: `calc(${100 / cols}% - 4px)`,
                          }}
                        >
                          <span aria-hidden className={cn("w-[3px] shrink-0", t.edge)} />
                          <span className={cn("flex min-w-0 flex-1 gap-x-1.5 px-1.5", short ? "items-center" : "flex-col py-1")}>
                            <span className="truncate text-xs font-medium text-ink">{e.title}</span>
                            <span className={cn("tabular truncate text-[11px]", t.ink)}>
                              {time(e.start)}
                              {!short && e.location ? ` · ${e.location}` : ""}
                            </span>
                          </span>
                          <span aria-hidden className="pointer-events-none absolute inset-0 bg-ink/[0.04] opacity-0 transition-opacity duration-200 group-hover:opacity-100 dark:bg-ink/[0.06]" />
                          <motion.span
                            aria-hidden
                            className="pointer-events-none absolute inset-0 rounded-[6px] ring-2 ring-inset ring-ink"
                            initial={false}
                            animate={{ opacity: sel ? 1 : 0 }}
                            transition={fade}
                          />
                        </button>
                      );
                    })}
                  </motion.div>
                </AnimatePresence>

                {today && now && hours(now) >= startHour && hours(now) <= endHour && (
                  <motion.div
                    aria-label={l.now(time(now))}
                    role="img"
                    className="pointer-events-none absolute inset-x-0 z-10 flex items-center"
                    style={{ top: (hours(now) - startHour) * hourHeight - 1 }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={springSoft}
                  >
                    <span className="-ml-1 size-2 shrink-0 rounded-full bg-accent" />
                    <span className="h-0.5 flex-1 bg-accent" />
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
