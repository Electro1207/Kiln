import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent, type ReactNode, type RefObject } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../../cn";
import { springFirm, springSoft } from "../../motion";
import { AnchoredLayer, SwapText } from "../shared/Anchored";
import { useControllable, type Size } from "../../controllable";
import { inputSizes } from "../shared/Field";

export const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
export const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
export const addMonths = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth() + n, 1);
export const sameDay = (a?: Date | null, b?: Date | null) =>
  !!a && !!b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
const sameMonth = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
const monthKey = (d: Date) => d.getFullYear() * 12 + d.getMonth();

const makeFormats = (locale: string) => ({
  day: new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric" }),
  dayShort: new Intl.DateTimeFormat(locale, { day: "numeric", month: "short" }),
  month: new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }),
  full: new Intl.DateTimeFormat(locale, { weekday: "long", day: "numeric", month: "long", year: "numeric" }),
  weekday: new Intl.DateTimeFormat(locale, { weekday: "short" }),
});
const formatCache = new Map<string, ReturnType<typeof makeFormats>>();
/** Date formatters for a locale (default "en-GB"), cached. */
const formatsFor = (locale?: string) => {
  const key = locale ?? "en-GB";
  let f = formatCache.get(key);
  if (!f) formatCache.set(key, (f = makeFormats(key)));
  return f;
};
/** Monday-first short weekday names for a locale (2024-01-01 was a Monday). */
const intlWeekdays = (locale: string) => Array.from({ length: 7 }, (_, i) => formatsFor(locale).weekday.format(new Date(2024, 0, 1 + i)));

export const formatDate = (d: Date, locale?: string) => formatsFor(locale).day.format(d);

/** Text used by Calendar. Pass a partial via `labels` to translate or reword. */
export interface CalendarLabels {
  /** aria-label of the previous-month button. */
  previousMonth: string;
  /** aria-label of the next-month button. */
  nextMonth: string;
  /** Column headings, Monday first. With a `locale` and no override these come from Intl. */
  weekdays: string[];
}
export const calendarLabels: CalendarLabels = {
  previousMonth: "Previous month",
  nextMonth: "Next month",
  weekdays: ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"],
};

/** Icons used by Calendar. Pass a partial via `icons` to replace them. */
export interface CalendarIcons {
  /** Previous-month button. */
  previous: ReactNode;
  /** Next-month button. */
  next: ReactNode;
}
export const calendarIcons: CalendarIcons = { previous: <ChevronLeft />, next: <ChevronRight /> };

function monthGrid(month: Date): Date[] {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const lead = (first.getDay() + 6) % 7;
  const start = addDays(first, -lead);
  return Array.from({ length: 42 }, (_, i) => addDays(start, i));
}

export type DateRange = { start: Date | null; end: Date | null };

type CalendarBase = {
  min?: Date;
  max?: Date;
  /** Month shown first. Defaults to the selection or today. */
  defaultMonth?: Date;
  className?: string;
  autoFocus?: boolean;
  /** BCP 47 locale for month and day names. Default: English (en-GB). The week still starts on Monday. */
  locale?: string;
  /** Override any UI text. Merged over `calendarLabels`. */
  labels?: Partial<CalendarLabels>;
  /** Replace any built-in icon. Merged over `calendarIcons`. */
  icons?: Partial<CalendarIcons>;
};
export type CalendarProps =
  | (CalendarBase & {
      mode?: "single";
      /** Controlled selection. Leave out and use `defaultValue` to let the calendar keep its own. */
      value?: Date | null;
      /** Starting selection when uncontrolled. Default: none. */
      defaultValue?: Date | null;
      onChange?: (d: Date) => void;
    })
  | (CalendarBase & {
      mode: "range";
      /** Controlled range. Leave out and use `defaultValue` to let the calendar keep its own. */
      value?: DateRange;
      /** Starting range when uncontrolled. Default: empty. */
      defaultValue?: DateRange;
      onChange?: (r: DateRange) => void;
    });

/** A month grid for picking one date (`mode="single"`, the default) or a range (`mode="range"`). Arrow keys, Page Up/Down, Home and End move focus. */
export function Calendar(props: CalendarProps) {
  const l = { ...calendarLabels, ...props.labels };
  const ic = useMemo(() => ({ ...calendarIcons, ...props.icons }), [props.icons]);
  const weekdays = props.labels?.weekdays ?? (props.locale ? intlWeekdays(props.locale) : calendarLabels.weekdays);
  const fmt = formatsFor(props.locale);
  const [today] = useState(() => startOfDay(new Date()));
  const [val, setVal] = useControllable<Date | DateRange | null>(
    props.value,
    props.defaultValue ?? (props.mode === "range" ? { start: null, end: null } : null),
    props.onChange as ((v: Date | DateRange | null) => void) | undefined,
  );
  const anchorDate = props.mode === "range" ? (val as DateRange).start : (val as Date | null);
  const [month, setMonth] = useState(() => {
    const d = props.defaultMonth ?? anchorDate ?? today;
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [dir, setDir] = useState(0);
  const [focus, setFocus] = useState<Date>(() => anchorDate ?? today);
  const [hover, setHover] = useState<Date | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const moved = useRef(false);

  const go = (n: number) => {
    setDir(n);
    setMonth((m) => addMonths(m, n));
  };

  const disabled = (d: Date) => (props.min && d < startOfDay(props.min)) || (props.max && d > startOfDay(props.max));

  const pick = (d: Date) => {
    if (disabled(d)) return;
    if (props.mode === "range") {
      const { start, end } = val as DateRange;
      if (!start || end) setVal({ start: d, end: null });
      else if (d < start) setVal({ start: d, end: start });
      else setVal({ start, end: d });
    } else {
      setVal(d);
    }
    setFocus(d);
    if (!sameMonth(d, month)) go(monthKey(d) > monthKey(month) ? 1 : -1);
  };

  const moveFocus = (d: Date) => {
    moved.current = true;
    setFocus(d);
    if (!sameMonth(d, month)) {
      setDir(monthKey(d) > monthKey(month) ? 1 : -1);
      setMonth(new Date(d.getFullYear(), d.getMonth(), 1));
    }
  };

  useEffect(() => {
    if (!moved.current && !props.autoFocus) return;
    const raf = requestAnimationFrame(() => {
      const el = gridRef.current?.querySelector<HTMLButtonElement>(`[data-day="${focus.toDateString()}"]`);
      el?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(raf);
  }, [focus, month, props.autoFocus]);

  const onKey = (e: KeyboardEvent) => {
    const map: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
    if (e.key in map) {
      e.preventDefault();
      moveFocus(addDays(focus, map[e.key]));
    } else if (e.key === "PageUp" || e.key === "PageDown") {
      e.preventDefault();
      const n = e.key === "PageUp" ? -1 : 1;
      moveFocus(new Date(focus.getFullYear(), focus.getMonth() + n, Math.min(focus.getDate(), 28)));
    } else if (e.key === "Home" || e.key === "End") {
      e.preventDefault();
      const wd = (focus.getDay() + 6) % 7;
      moveFocus(addDays(focus, e.key === "Home" ? -wd : 6 - wd));
    }
  };

  const days = monthGrid(month);
  const range = props.mode === "range" ? (val as DateRange) : null;
  const rangeEnd = range && range.start && !range.end && hover ? hover : range?.end ?? null;
  const [lo, hi] =
    range?.start && rangeEnd ? (range.start <= rangeEnd ? [range.start, rangeEnd] : [rangeEnd, range.start]) : [null, null];

  return (
    <div className={cn("w-[17.5rem] select-none p-2", props.className)}>
      <div className="mb-2 flex items-center justify-between gap-2">
        <button
          type="button"
          aria-label={l.previousMonth}
          onClick={() => go(-1)}
          className="grid size-8 place-items-center rounded-control text-muted transition-colors hover:bg-raised hover:text-ink [&>svg]:size-4"
        >
          {ic.previous}
        </button>
        <div className="relative h-6 flex-1 overflow-hidden text-center" aria-live="polite">
          <AnimatePresence mode="popLayout" initial={false} custom={dir}>
            <motion.span
              key={monthKey(month)}
              custom={dir}
              variants={{
                enter: (d: number) => ({ y: d >= 0 ? 8 : -8, opacity: 0 }),
                center: { y: 0, opacity: 1, transition: { y: springSoft, opacity: { duration: 0.18, delay: 0.08 } } },
                exit: (d: number) => ({ y: d >= 0 ? -8 : 8, opacity: 0, transition: { duration: 0.1 } }),
              }}
              initial="enter"
              animate="center"
              exit="exit"
              className="absolute inset-0 text-sm font-semibold"
            >
              {fmt.month.format(month)}
            </motion.span>
          </AnimatePresence>
        </div>
        <button
          type="button"
          aria-label={l.nextMonth}
          onClick={() => go(1)}
          className="grid size-8 place-items-center rounded-control text-muted transition-colors hover:bg-raised hover:text-ink [&>svg]:size-4"
        >
          {ic.next}
        </button>
      </div>

      <div className="grid grid-cols-7 pb-1 text-center text-xs text-muted" aria-hidden>
        {weekdays.map((w) => (
          <span key={w} className="py-1">{w}</span>
        ))}
      </div>

      <div className="relative h-[15rem] overflow-hidden" onMouseLeave={() => setHover(null)}>
        <AnimatePresence initial={false} custom={dir}>
          <motion.div
            key={monthKey(month)}
            ref={gridRef}
            role="grid"
            aria-label={fmt.month.format(month)}
            custom={dir}
            // Months move a whole width in lockstep, like pages, so the two grids never overlap.
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
            onKeyDown={onKey}
            className="absolute inset-0 grid grid-cols-7 grid-rows-6"
          >
            {days.map((d) => {
              const inMonth = sameMonth(d, month);
              const isToday = sameDay(d, today);
              const off = disabled(d);
              const single = props.mode !== "range" && sameDay(d, val as Date | null);
              const isStart = !!lo && sameDay(d, lo);
              const isEnd = !!hi && sameDay(d, hi);
              const inside = !!lo && !!hi && d > lo && d < hi;
              const ends = isStart || isEnd || (range?.start && !rangeEnd && sameDay(d, range.start));
              const selected = single || !!ends;
              const tabbable = sameDay(d, focus) && sameMonth(focus, month);
              return (
                <div key={d.toDateString()} role="gridcell" className="relative grid place-items-center">
                  {(inside || (isStart && hi && !sameDay(lo, hi)) || (isEnd && lo && !sameDay(lo, hi))) && (
                    <span
                      aria-hidden
                      className={cn(
                        "absolute inset-y-[3px] bg-accent-soft transition-opacity",
                        inside && "inset-x-0",
                        isStart && "left-1/2 right-0",
                        isEnd && "left-0 right-1/2",
                      )}
                    />
                  )}
                  <button
                    type="button"
                    data-day={d.toDateString()}
                    tabIndex={tabbable ? 0 : -1}
                    disabled={!!off}
                    aria-selected={selected}
                    aria-current={isToday ? "date" : undefined}
                    aria-label={fmt.full.format(d)}
                    onClick={() => pick(d)}
                    onMouseEnter={() => setHover(d)}
                    onFocus={() => setFocus(d)}
                    className={cn(
                      // The fill fades; the number's colour steps over at the fade's midpoint (no grey-on-grey frame).
                      "relative grid size-9 place-items-center rounded-full text-sm tabular outline-offset-0 transition-[background-color,color] [transition-duration:150ms,0ms] [transition-delay:0ms,75ms]",
                      !selected && "hover:bg-raised",
                      !inMonth && !selected && "text-faint",
                      off && "opacity-35 hover:bg-transparent",
                      selected ? "text-btn-primary-ink" : "text-ink",
                    )}
                  >
                    {/* The selection is a state mark: it fades in place rather than travelling,
                        so the number's colour and its fill always change together. */}
                    <AnimatePresence initial={false}>
                      {selected && (
                        <motion.span
                          key="sel"
                          aria-hidden
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ opacity: { duration: 0.12, ease: "linear" }, scale: springSoft }}
                          className="absolute inset-0 rounded-full bg-btn-primary"
                        />
                      )}
                    </AnimatePresence>
                    <span className="relative">{d.getDate()}</span>
                    {isToday && (
                      <span
                        aria-hidden
                        className={cn("absolute bottom-1 size-1 rounded-full", selected ? "bg-btn-primary-ink" : "bg-accent")}
                      />
                    )}
                  </button>
                </div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function Trigger({
  label,
  text,
  placeholder,
  open,
  onClick,
  triggerRef,
  id,
  size = "md",
  icon,
}: {
  icon: ReactNode;
  label?: string;
  text: string | null;
  placeholder: string;
  open: boolean;
  onClick: () => void;
  triggerRef: RefObject<HTMLButtonElement | null>;
  id: string;
  size?: Size;
}) {
  return (
    <>
      {label && (
        <span id={`${id}-label`} className="text-[13px] font-medium text-ink">
          {label}
        </span>
      )}
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-labelledby={label ? `${id}-label ${id}-value` : undefined}
        onClick={onClick}
        className={cn(
          "flex w-full items-center gap-2 rounded-control border border-line-strong bg-surface text-left",
          inputSizes[size],
          "transition-[border-color] duration-200 ease-out-soft hover:border-faint",
          open && "border-accent",
        )}
      >
        <span className="grid shrink-0 place-items-center text-muted [&>svg]:size-4" aria-hidden>{icon}</span>
        <span id={`${id}-value`} className="min-w-0 flex-1">
          <SwapText value={text ?? "none"} className={cn("tabular", !text && "text-muted")}>
            {text ?? placeholder}
          </SwapText>
        </span>
      </button>
    </>
  );
}

/** Text used by DatePicker. Pass a partial via `labels` to translate or reword. */
export interface DatePickerLabels extends CalendarLabels {
  /** Trigger text when nothing is picked (the `placeholder` prop wins). */
  placeholder: string;
  /** aria-label of the calendar popup. */
  dialog: string;
}
export const datePickerLabels: DatePickerLabels = { ...calendarLabels, placeholder: "Pick a date", dialog: "Choose a date" };

/** Icons used by DatePicker. Pass a partial via `icons` to replace them. */
export interface DatePickerIcons extends CalendarIcons {
  /** Leading icon of the trigger. */
  calendar: ReactNode;
}
export const datePickerIcons: DatePickerIcons = { ...calendarIcons, calendar: <CalendarDays /> };

export type DatePickerProps = {
  /** Selected date; leave out to let the component keep it. */
  value?: Date | null;
  /** Starting date when uncontrolled. */
  defaultValue?: Date | null;
  onChange?: (d: Date) => void;
  label?: string;
  placeholder?: string;
  min?: Date;
  max?: Date;
  /** Trigger height and text size. Defaults to md. */
  size?: Size;
  /** BCP 47 locale for date text. Default: English (en-GB). */
  locale?: string;
  /** Override any UI text. Merged over `datePickerLabels`. */
  labels?: Partial<DatePickerLabels>;
  /** Replace any built-in icon. Merged over `datePickerIcons`. */
  icons?: Partial<DatePickerIcons>;
  className?: string;
};

/** A button that opens a calendar. Controlled with `value` + `onChange`, or uncontrolled with `defaultValue`. */
export function DatePicker({ value: valueProp, defaultValue = null, onChange: onChangeProp, label, placeholder, min, max, size = "md", locale, labels, icons, className }: DatePickerProps) {
  const l = { ...datePickerLabels, ...labels };
  const ic = useMemo(() => ({ ...datePickerIcons, ...icons }), [icons]);
  const id = useId();
  const [value, setValue] = useControllable<Date | null>(valueProp, defaultValue, (d) => d && onChangeProp?.(d));
  const onChange = (d: Date) => setValue(d);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  return (
    <div className={cn("k-fill flex min-w-0 flex-col gap-1.5", className)}>
      <Trigger
        id={id}
        size={size}
        icon={ic.calendar}
        label={label}
        text={value ? formatDate(value, locale) : null}
        placeholder={placeholder ?? l.placeholder}
        open={open}
        onClick={() => setOpen((o) => !o)}
        triggerRef={triggerRef}
      />
      <AnchoredLayer open={open} onClose={() => setOpen(false)} anchor={triggerRef} role="dialog" aria-label={l.dialog}>
        <Calendar
          locale={locale}
          labels={labels}
          icons={ic}
          value={value}
          min={min}
          max={max}
          autoFocus
          onChange={(d) => {
            onChange(d);
            setTimeout(() => {
              setOpen(false);
              triggerRef.current?.focus();
            }, 140);
          }}
        />
      </AnchoredLayer>
    </div>
  );
}

export type RangePreset = { label: string; range: () => DateRange };

/** Text used by DateRangePicker. Pass a partial via `labels` to translate or reword. */
export interface DateRangePickerLabels extends CalendarLabels {
  /** Trigger text when nothing is picked (the `placeholder` prop wins). */
  placeholder: string;
  /** aria-label of the calendar popup. */
  dialog: string;
  /** Default preset: the next 7 days. */
  next7: string;
  /** Default preset: the coming weekend. */
  weekend: string;
  /** Default preset: the next 30 days. */
  next30: string;
  /** "3 nights" under the calendar. */
  nights: (n: number) => string;
  /** Hint when only a start date is picked. */
  chooseEnd: string;
  /** Hint when nothing is picked. */
  chooseStart: string;
  /** Close button. */
  done: string;
}
export const dateRangePickerLabels: DateRangePickerLabels = {
  ...calendarLabels,
  placeholder: "Pick dates",
  dialog: "Choose dates",
  next7: "Next 7 days",
  weekend: "This weekend",
  next30: "Next 30 days",
  nights: (n) => `${n} night${n === 1 ? "" : "s"}`,
  chooseEnd: "Choose an end date",
  chooseStart: "Choose a start date",
  done: "Done",
};

const makePresets = (l: DateRangePickerLabels): RangePreset[] => [
  { label: l.next7, range: () => { const t = startOfDay(new Date()); return { start: t, end: addDays(t, 6) }; } },
  {
    label: l.weekend,
    range: () => {
      const t = startOfDay(new Date());
      const sat = addDays(t, (6 - t.getDay() + 7) % 7);
      return { start: sat, end: addDays(sat, 1) };
    },
  },
  { label: l.next30, range: () => { const t = startOfDay(new Date()); return { start: t, end: addDays(t, 29) }; } },
];

/** Icons used by DateRangePicker. Pass a partial via `icons` to replace them. */
export type DateRangePickerIcons = DatePickerIcons;
export const dateRangePickerIcons: DateRangePickerIcons = datePickerIcons;

export type DateRangePickerProps = {
  /** Selected range; leave out to let the component keep it. */
  value?: DateRange;
  /** Starting range when uncontrolled. */
  defaultValue?: DateRange;
  onChange?: (r: DateRange) => void;
  label?: string;
  placeholder?: string;
  presets?: RangePreset[];
  min?: Date;
  /** Trigger height and text size. Defaults to md. */
  size?: Size;
  /** BCP 47 locale for date text. Default: English (en-GB). */
  locale?: string;
  /** Override any UI text. Merged over `dateRangePickerLabels`. */
  labels?: Partial<DateRangePickerLabels>;
  /** Replace any built-in icon. Merged over `dateRangePickerIcons`. */
  icons?: Partial<DateRangePickerIcons>;
  className?: string;
};

const emptyRange: DateRange = { start: null, end: null };

/** A button that opens a range calendar with presets. Controlled with `value` + `onChange`, or uncontrolled with `defaultValue`. */
export function DateRangePicker({
  value: valueProp,
  defaultValue = emptyRange,
  onChange: onChangeProp,
  size = "md",
  label,
  placeholder,
  presets: presetsProp,
  min,
  locale,
  labels,
  icons,
  className,
}: DateRangePickerProps) {
  const l = { ...dateRangePickerLabels, ...labels };
  const ic = useMemo(() => ({ ...dateRangePickerIcons, ...icons }), [icons]);
  const presets = presetsProp ?? makePresets(l);
  const fmt = formatsFor(locale);
  const id = useId();
  const [value, onChange] = useControllable<DateRange>(valueProp, defaultValue, onChangeProp);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [calKey, setCalKey] = useState(0);
  const text =
    value.start && value.end
      ? `${(value.start.getFullYear() === value.end.getFullYear() ? fmt.dayShort : fmt.day).format(value.start)} – ${fmt.day.format(value.end)}`
      : value.start
        ? `${fmt.day.format(value.start)} – …`
        : null;
  const nights = value.start && value.end ? Math.round((+value.end - +value.start) / 864e5) : 0;

  return (
    <div className={cn("k-fill flex min-w-0 flex-col gap-1.5", className)}>
      <Trigger id={id} size={size} icon={ic.calendar} label={label} text={text} placeholder={placeholder ?? l.placeholder} open={open} onClick={() => setOpen((o) => !o)} triggerRef={triggerRef} />
      <AnchoredLayer open={open} onClose={() => setOpen(false)} anchor={triggerRef} role="dialog" aria-label={l.dialog}>
        <div className="flex flex-col sm:flex-row">
          <div className="flex gap-1 overflow-x-auto p-2 sm:w-36 sm:flex-col sm:pr-0">
            {presets.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => {
                  onChange(p.range());
                  setCalKey((k) => k + 1);
                }}
                className="shrink-0 rounded-control px-2.5 py-1.5 text-left text-[13px] text-muted transition-colors hover:bg-raised hover:text-ink"
              >
                {p.label}
              </button>
            ))}
          </div>
          <div>
            <Calendar key={calKey} locale={locale} labels={labels} icons={ic} mode="range" value={value} onChange={onChange} min={min} autoFocus={calKey === 0} />
            <div className="flex items-center justify-between gap-3 px-3 pb-2 pt-1 text-xs text-muted">
              <span className="tabular">{nights > 0 ? l.nights(nights) : value.start ? l.chooseEnd : l.chooseStart}</span>
              <button
                type="button"
                disabled={!value.end}
                onClick={() => {
                  setOpen(false);
                  triggerRef.current?.focus();
                }}
                className="rounded-control bg-btn-primary px-3 py-1.5 text-[13px] font-medium text-btn-primary-ink transition-[background-color,opacity] duration-200 hover:bg-btn-primary-hover disabled:opacity-40"
              >
                {l.done}
              </button>
            </div>
          </div>
        </div>
      </AnchoredLayer>
    </div>
  );
}
