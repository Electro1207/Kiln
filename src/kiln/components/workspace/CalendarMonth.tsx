import { useEffect, useLayoutEffect, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../../cn";
import { useControllable } from "../../controllable";
import { springFirm, springSoft } from "../../motion";
import { AnchoredLayer } from "../shared/Anchored";

export type CalTone = "accent" | "info" | "positive" | "warning" | "negative";
export type CalEvent = { id: string; date: Date; title: string; time?: string; place?: string; tone?: CalTone };

export type CalendarMonthProps = {
  events: CalEvent[];
  /** Controlled selected day. Leave out to let the calendar keep its own. */
  value?: Date;
  /** Where the uncontrolled calendar starts. Default today. */
  defaultValue?: Date;
  /** Same as `defaultValue`; kept for existing code. */
  defaultDate?: Date;
  /** Called with the day picked, controlled or not. */
  onChange?: (date: Date) => void;
  /** Chips shown in a day cell before “+N more”. */
  maxPerDay?: number;
  /** BCP 47 locale for month and day names. Weeks always start on Monday. Defaults to English. */
  locale?: string;
  /** Override any UI text. Merged over `calendarMonthLabels`. */
  labels?: Partial<CalendarMonthLabels>;
  /** Replace any built-in icon. Merged over `calendarMonthIcons`. */
  icons?: Partial<CalendarMonthIcons>;
  className?: string;
};

/** Text used by CalendarMonth. Pass a partial via `labels` to translate or reword. */
export interface CalendarMonthLabels {
  /** Jump-to-today button. */
  today: string;
  /** aria-label of the previous month button. */
  previousMonth: string;
  /** aria-label of the next month button. */
  nextMonth: string;
  /** Time shown for an event without a time. */
  allDay: string;
  /** Empty-state text under the day agenda. */
  nothingPlanned: string;
  /** Day cell aria-label suffix when the day has no events. */
  nothingPlannedShort: string;
  /** Day cell aria-label suffix: "3 events". */
  eventCount: (count: number) => string;
  /** The "+2 more" button in a day cell. */
  more: (count: number) => string;
  /** aria-label of the all-events popover. */
  allEvents: string;
}
/** Icons used by CalendarMonth. Pass a partial via `icons` to swap any of them. */
export interface CalendarMonthIcons {
  /** The previous-month button. */
  previous: ReactNode;
  /** The next-month button. */
  next: ReactNode;
}
export const calendarMonthIcons: CalendarMonthIcons = { previous: <ChevronLeft />, next: <ChevronRight /> };
export const calendarMonthLabels: CalendarMonthLabels = {
  today: "Today",
  previousMonth: "Previous month",
  nextMonth: "Next month",
  allDay: "All day",
  nothingPlanned: "Nothing planned.",
  nothingPlannedShort: "nothing planned",
  eventCount: (n) => `${n} event${n > 1 ? "s" : ""}`,
  more: (n) => `+${n} more`,
  allEvents: "All events",
};

const dotTone: Record<CalTone, string> = {
  accent: "bg-accent",
  info: "bg-info",
  positive: "bg-positive",
  warning: "bg-warning",
  negative: "bg-negative",
};
const chipTone: Record<CalTone, string> = {
  accent: "bg-accent-soft",
  info: "bg-info-soft",
  positive: "bg-positive-soft",
  warning: "bg-warning-soft",
  negative: "bg-negative-soft",
};

const day0 = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const plus = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const same = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
const key = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
const mKey = (d: Date) => d.getFullYear() * 12 + d.getMonth();
// 2024-01-01 is a Monday.
const weekNames = (fmt: Intl.DateTimeFormat) => Array.from({ length: 7 }, (_, i) => fmt.format(new Date(2024, 0, 1 + i)));

function grid(month: Date) {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const start = plus(first, -((first.getDay() + 6) % 7));
  return Array.from({ length: 42 }, (_, i) => plus(start, i));
}

/** A month of events with a day agenda. Months slide in the direction you move; so do days. */
export function CalendarMonth({ events, value, defaultValue, defaultDate, onChange, maxPerDay = 2, locale, labels, icons, className }: CalendarMonthProps) {
  const l = { ...calendarMonthLabels, ...labels };
  const ic = { ...calendarMonthIcons, ...icons };
  const loc = locale ?? "en-GB";
  const { fmtMonth, fmtDay, WEEK, WEEK1 } = useMemo(
    () => ({
      fmtMonth: new Intl.DateTimeFormat(loc, { month: "long", year: "numeric" }),
      fmtDay: new Intl.DateTimeFormat(loc, { weekday: "long", day: "numeric", month: "long" }),
      WEEK: weekNames(new Intl.DateTimeFormat(loc, { weekday: "short" })),
      WEEK1: weekNames(new Intl.DateTimeFormat(loc, { weekday: "narrow" })),
    }),
    [loc],
  );
  const [today] = useState(() => day0(new Date()));
  const [selectedRaw, setSelected] = useControllable<Date>(value, defaultValue ?? defaultDate ?? today, onChange);
  const selectedKey = key(selectedRaw);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const selected = useMemo(() => day0(selectedRaw), [selectedKey]);
  const [month, setMonth] = useState(() => new Date(selected.getFullYear(), selected.getMonth(), 1));
  const [mDir, setMDir] = useState(0);
  const [dDir, setDDir] = useState(0);
  const [more, setMore] = useState<{ date: Date } | null>(null);
  const moreRef = useRef<HTMLElement | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const byDay = useMemo(() => {
    const m = new Map<string, CalEvent[]>();
    for (const e of events) {
      const k = key(e.date);
      m.set(k, [...(m.get(k) ?? []), e]);
    }
    for (const list of m.values()) list.sort((a, b) => (a.time ?? "").localeCompare(b.time ?? ""));
    return m;
  }, [events]);

  const goMonth = (n: number) => {
    setMDir(n);
    setMonth((m) => new Date(m.getFullYear(), m.getMonth() + n, 1));
  };
  // A day set from outside brings its month into view.
  useEffect(() => {
    setMonth((m) => (mKey(selected) === mKey(m) ? m : new Date(selected.getFullYear(), selected.getMonth(), 1)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedKey]);
  const pick = (d: Date, focus = false) => {
    setDDir(d > selected ? 1 : -1);
    setSelected(d);
    if (mKey(d) !== mKey(month)) {
      setMDir(mKey(d) > mKey(month) ? 1 : -1);
      setMonth(new Date(d.getFullYear(), d.getMonth(), 1));
    }
    if (focus) requestAnimationFrame(() => gridRef.current?.querySelector<HTMLElement>(`[data-day="${key(d)}"]`)?.focus());
  };

  const onGridKey = (e: KeyboardEvent) => {
    const map: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
    if (!(e.key in map)) return;
    e.preventDefault();
    pick(plus(selected, map[e.key]), true);
  };

  const agendaRef = useRef<HTMLDivElement>(null);
  const [agendaH, setAgendaH] = useState<number | "auto">("auto");
  useLayoutEffect(() => {
    const el = agendaRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setAgendaH(el.offsetHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, [selected]);

  const dayEvents = byDay.get(key(selected)) ?? [];

  return (
    <div className={cn("@container w-full", className)}>
      <div className="mb-3 flex items-center gap-2">
        <div className="grid min-w-0 flex-1 overflow-hidden [&>*]:[grid-area:1/1]" aria-live="polite">
          <AnimatePresence initial={false} custom={mDir}>
            <motion.h3
              key={mKey(month)}
              custom={mDir}
              variants={{
                enter: (d: number) => ({ opacity: 0, x: d * 12 }),
                center: { opacity: 1, x: 0, transition: { x: springSoft, opacity: { duration: 0.2, delay: 0.08 } } },
                exit: (d: number) => ({ opacity: 0, x: d * -12, transition: { duration: 0.1 } }),
              }}
              initial="enter"
              animate="center"
              exit="exit"
              className="truncate text-base font-semibold text-ink"
            >
              {fmtMonth.format(month)}
            </motion.h3>
          </AnimatePresence>
        </div>
        <button
          type="button"
          onClick={() => pick(today)}
          className="h-8 rounded-control bg-btn-secondary px-3 text-[13px] font-medium text-btn-secondary-ink transition-colors hover:bg-btn-secondary-hover"
        >
          {l.today}
        </button>
        <button type="button" aria-label={l.previousMonth} onClick={() => goMonth(-1)} className="grid size-8 place-items-center rounded-control text-muted transition-colors hover:bg-active hover:text-ink [&>svg]:size-4">
          {ic.previous}
        </button>
        <button type="button" aria-label={l.nextMonth} onClick={() => goMonth(1)} className="grid size-8 place-items-center rounded-control text-muted transition-colors hover:bg-active hover:text-ink [&>svg]:size-4">
          {ic.next}
        </button>
      </div>

      <div className="overflow-hidden rounded-card bg-line">
        <div className="grid grid-cols-7 gap-px">
          {WEEK.map((w, wi) => (
            <div key={wi} className="bg-surface px-2 py-1.5 text-xs text-muted">
              <span className="@xl:hidden">{WEEK1[wi]}</span>
              <span className="hidden @xl:inline">{w}</span>
            </div>
          ))}
        </div>
        {/* Both months share one grid cell: no popLayout measuring, so the slide is transform only. */}
        <div className="relative mt-px grid overflow-hidden [&>*]:[grid-area:1/1]">
          <AnimatePresence initial={false} custom={mDir}>
            <motion.div
              key={mKey(month)}
              ref={gridRef}
              role="grid"
              aria-label={fmtMonth.format(month)}
              onKeyDown={onGridKey}
              custom={mDir}
              // A whole transform (not x) lets Motion hand the slide to the compositor.
              variants={{
                enter: (d: number) => ({ transform: `translateX(${d >= 0 ? 100 : -100}%)` }),
                center: { transform: "translateX(0%)" },
                exit: (d: number) => ({ transform: `translateX(${d >= 0 ? -100 : 100}%)` }),
              }}
              style={{ willChange: "transform" }}
              initial="enter"
              animate="center"
              exit="exit"
              transition={springFirm}
              className="grid w-full grid-cols-7 gap-px"
            >
              {grid(month).map((d) => {
                const list = byDay.get(key(d)) ?? [];
                const inMonth = d.getMonth() === month.getMonth();
                const isSel = same(d, selected);
                const isToday = same(d, today);
                const hidden = Math.max(0, list.length - maxPerDay);
                return (
                  <div
                    key={key(d)}
                    role="gridcell"
                    aria-selected={isSel}
                    className={cn("relative flex min-h-12 flex-col gap-1 p-1 transition-colors duration-200 @xl:min-h-24 @xl:p-1.5", isSel ? "bg-raised" : "bg-surface")}
                  >
                    <button
                      type="button"
                      data-day={key(d)}
                      tabIndex={isSel ? 0 : -1}
                      aria-label={`${fmtDay.format(d)}, ${list.length ? l.eventCount(list.length) : l.nothingPlannedShort}`}
                      onClick={() => pick(d)}
                      className="absolute inset-0 outline-offset-[-2px]"
                    />
                    <span
                      className={cn(
                        "pointer-events-none relative grid size-6 place-items-center rounded-full text-xs tabular transition-colors duration-200",
                        isToday ? "bg-btn-primary font-medium text-btn-primary-ink" : isSel ? "font-semibold text-ink" : inMonth ? "text-ink" : "text-faint",
                      )}
                    >
                      {d.getDate()}
                    </span>
                    <span className="pointer-events-none flex gap-0.5 px-1 @xl:hidden">
                      {list.slice(0, 3).map((e) => (
                        <span key={e.id} className={cn("size-1.5 rounded-full", dotTone[e.tone ?? "accent"], !inMonth && "opacity-50")} />
                      ))}
                    </span>
                    <span className="pointer-events-none hidden flex-col gap-0.5 @xl:flex">
                      {list.slice(0, maxPerDay).map((e) => (
                        <span key={e.id} className={cn("flex items-center gap-1 truncate rounded-[4px] px-1.5 text-[11px] leading-5 text-ink", chipTone[e.tone ?? "accent"], !inMonth && "opacity-60")}>
                          {e.time && <span className="shrink-0 text-muted tabular">{e.time}</span>}
                          <span className="truncate">{e.title}</span>
                        </span>
                      ))}
                    </span>
                    {hidden > 0 && (
                      <button
                        type="button"
                        onClick={(ev) => { moreRef.current = ev.currentTarget; setMore({ date: d }); }}
                        className="relative hidden w-fit rounded-[4px] px-1.5 text-left text-[11px] leading-5 text-muted transition-colors hover:bg-active hover:text-ink @xl:block"
                      >
                        {l.more(hidden)}
                      </button>
                    )}
                  </div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <AnchoredLayer open={!!more} onClose={() => setMore(null)} anchor={moreRef} placement="bottom-start" role="dialog" aria-label={l.allEvents} className="w-64 p-2">
        {more && (
          <div className="flex flex-col gap-1">
            <p className="px-1.5 pb-1 text-[13px] font-semibold text-ink">{fmtDay.format(more.date)}</p>
            {(byDay.get(key(more.date)) ?? []).map((e) => (
              <div key={e.id} className="flex items-center gap-2 rounded-[6px] px-1.5 py-1 text-[13px] text-ink">
                <span className={cn("size-2 shrink-0 rounded-full", dotTone[e.tone ?? "accent"])} />
                <span className="w-10 shrink-0 text-muted tabular">{e.time ?? l.allDay}</span>
                <span className="truncate">{e.title}</span>
              </div>
            ))}
          </div>
        )}
      </AnchoredLayer>

      <motion.div initial={false} animate={{ height: agendaH }} transition={springSoft} className="relative mt-4 overflow-hidden">
        <AnimatePresence initial={false} mode="popLayout" custom={dDir}>
          <motion.div
            key={key(selected)}
            ref={agendaRef}
            custom={dDir}
            variants={{
              enter: (d: number) => ({ opacity: 0, x: d * 20 }),
              center: { opacity: 1, x: 0, transition: { x: springFirm, opacity: { duration: 0.2, delay: 0.08 } } },
              exit: (d: number) => ({ opacity: 0, x: d * -20, transition: { duration: 0.1 } }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            className="w-full"
          >
            <h4 className="mb-2 text-sm font-semibold text-ink">{fmtDay.format(selected)}</h4>
            {dayEvents.length ? (
              <ul className="flex flex-col gap-1.5">
                {dayEvents.map((e) => (
                  <li key={e.id} className="flex items-start gap-3 rounded-card bg-raised px-3 py-2.5">
                    <span className={cn("mt-1.5 size-2 shrink-0 rounded-full", dotTone[e.tone ?? "accent"])} />
                    <span className="w-12 shrink-0 text-[13px] text-muted tabular">{e.time ?? l.allDay}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm text-ink">{e.title}</span>
                      {e.place && <span className="block text-xs text-muted">{e.place}</span>}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="rounded-card bg-raised px-3 py-3 text-sm text-muted">{l.nothingPlanned}</p>
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
