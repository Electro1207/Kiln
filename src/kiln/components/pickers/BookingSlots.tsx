import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, CalendarCheck, Clock, Globe } from "lucide-react";
import { cn } from "../../cn";
import { easeOut, fade } from "../../motion";
import { Calendar, startOfDay, type CalendarLabels } from "./DatePicker";
import { SegmentedControl } from "../buttons/SegmentedControl";
import { TextField } from "../text-input/TextField";
import { Textarea } from "../text-input/Textarea";
import { Button } from "../buttons/Button";
import { Avatar } from "../data-display/Avatar";

export type Booking = { start: Date; minutes: number; name: string; email: string; notes: string; timeZone: string };

/** Text used by BookingSlots. Pass a partial via `labels` to translate or reword. */
export interface BookingSlotsLabels {
  /** aria-label of the meeting-length control. */
  length: string;
  /** Meeting length summary line: "30 minutes". */
  minutes: (n: number) => string;
  /** Short option text for a length in minutes: "30m", "1h". */
  durationShort: (minutes: number) => string;
  /** aria-label of the 12h/24h control. */
  clock: string;
  /** 12-hour option. */
  clock12: string;
  /** 24-hour option. */
  clock24: string;
  /** Heading above the times before a day is picked. */
  pickDay: string;
  /** Empty state before a day is picked. */
  chooseDay: string;
  /** Empty state when the day has no free times. */
  noSlots: string;
  /** Continue button on the first step. */
  next: string;
  /** Name field label. */
  name: string;
  /** Email field label. */
  email: string;
  /** Notes field label. */
  notes: string;
  /** Error under an empty name. */
  nameError: string;
  /** Error under an invalid email. */
  emailError: string;
  /** Back button on the details step. */
  back: string;
  /** Submit button. */
  confirm: string;
  /** Heading on the final step. */
  booked: string;
  /** Text on the final step. */
  bookedBody: (b: { title: string; host: string; day: string; time: string; timeZone: string; email: string }) => string;
  /** Button on the final step that starts over. */
  bookAnother: string;
  /** Text for the calendar (month buttons, weekday headings). */
  calendar: Partial<CalendarLabels>;
}
export const bookingSlotsLabels: BookingSlotsLabels = {
  length: "Length",
  minutes: (n) => `${n} minutes`,
  durationShort: (d) => (d < 60 ? `${d}m` : `${d / 60}h`),
  clock: "Clock",
  clock12: "12h",
  clock24: "24h",
  pickDay: "Pick a day",
  chooseDay: "Choose a day to see open times.",
  noSlots: "Nothing free that day. Try another.",
  next: "Next",
  name: "Your name",
  email: "Email",
  notes: "Anything to prepare?",
  nameError: "Who's coming?",
  emailError: "We'll send the invitation here.",
  back: "Back",
  confirm: "Confirm booking",
  booked: "You're booked",
  bookedBody: (b) => `${b.title} with ${b.host}, ${b.day} at ${b.time} (${b.timeZone}). An invitation is on its way to ${b.email}.`,
  bookAnother: "Book another",
  calendar: {},
};

/** Steps hand over: the old one fades out, the new one fades in with a small drift. */
const step = {
  initial: { opacity: 0, x: 10 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.24, ease: easeOut } },
  exit: { opacity: 0, x: -6, transition: { duration: 0.12, ease: easeOut } },
};

/**
 * A scheduler: pick a length, a day and a time (shown in the visitor's own
 * time zone), then confirm with a name and email.
 */
export function BookingSlots({
  title, host, description, durations = [15, 30, 60], getSlots, min, max, onBook, locale, labels, className,
}: {
  title: string;
  host: { name: string; avatar?: string; role?: string };
  description?: ReactNode;
  /** Meeting lengths in minutes. */
  durations?: number[];
  /** Free start times on a day, as real instants (any zone). Return [] for none. */
  getSlots: (day: Date, minutes: number) => Date[];
  min?: Date;
  max?: Date;
  onBook: (b: Booking) => Promise<void>;
  /** BCP 47 locale for dates and times. Default: the browser's. */
  locale?: string;
  /** Override any UI text. Merged over `bookingSlotsLabels`. */
  labels?: Partial<BookingSlotsLabels>;
  className?: string;
}) {
  const l = { ...bookingSlotsLabels, ...labels };
  const timeZone = useMemo(() => Intl.DateTimeFormat().resolvedOptions().timeZone, []);
  const [minutes, setMinutes] = useState(durations[Math.min(1, durations.length - 1)]);
  const [day, setDay] = useState<Date | null>(null);
  const [slot, setSlot] = useState<Date | null>(null);
  const [clock, setClock] = useState<"12h" | "24h">("12h");
  const [stage, setStage] = useState<"pick" | "details" | "done">("pick");
  const [form, setForm] = useState({ name: "", email: "", notes: "" });
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});
  const [busy, setBusy] = useState(false);

  const slots = useMemo(() => (day ? getSlots(day, minutes) : []), [day, minutes, getSlots]);
  const time = (d: Date) => new Intl.DateTimeFormat(locale, { hour: "numeric", minute: "2-digit", hour12: clock === "12h", timeZone }).format(d);
  const longDay = (d: Date) => new Intl.DateTimeFormat(locale, { weekday: "long", month: "long", day: "numeric", timeZone }).format(d);
  const end = slot ? new Date(slot.getTime() + minutes * 60000) : null;

  const today = startOfDay(new Date());
  const lo = min ?? today;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (!form.name.trim()) next.name = l.nameError;
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) next.email = l.emailError;
    setErrors(next);
    if (Object.keys(next).length || !slot) return;
    setBusy(true);
    await onBook({ start: slot, minutes, timeZone, ...form });
    setBusy(false);
    setStage("done");
  };

  const summary = (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Avatar name={host.name} src={host.avatar} size="md" />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-ink">{host.name}</p>
          {host.role && <p className="truncate text-[13px] text-muted">{host.role}</p>}
        </div>
      </div>
      <h3 className="text-xl font-semibold tracking-[-0.01em] text-ink">{title}</h3>
      {description && <p className="text-sm text-muted">{description}</p>}
      <ul className="flex flex-col gap-2 text-sm text-ink">
        <li className="flex items-center gap-2"><Clock className="size-4 shrink-0 text-muted" aria-hidden />{l.minutes(minutes)}</li>
        {slot && end && <li className="flex items-center gap-2"><CalendarCheck className="size-4 shrink-0 text-muted" aria-hidden />{longDay(slot)}, {time(slot)} – {time(end)}</li>}
        <li className="flex items-center gap-2"><Globe className="size-4 shrink-0 text-muted" aria-hidden /><span className="truncate">{timeZone.replace(/_/g, " ")}</span></li>
      </ul>
    </div>
  );

  return (
    <div className={cn("w-full overflow-hidden rounded-sheet bg-surface", className)}>
      <AnimatePresence initial={false} mode="wait">
        {stage === "pick" && (
          <motion.div key="pick" {...step} className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[minmax(0,240px)_auto_minmax(0,220px)] lg:gap-8">
            <div className="flex flex-col gap-5">
              {summary}
              <SegmentedControl label={l.length} fullWidth value={String(minutes)} onChange={(v) => { setMinutes(Number(v)); setSlot(null); }}
                options={durations.map((d) => ({ value: String(d), label: l.durationShort(d) }))} />
            </div>
            <Calendar
              locale={locale}
              labels={l.calendar}
              value={day}
              onChange={(d) => { setDay(d); setSlot(null); }}
              min={lo}
              max={max}
              className="justify-self-center"
            />
            <div className="flex min-w-0 flex-col gap-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium text-ink">{day ? new Intl.DateTimeFormat(locale, { weekday: "short", day: "numeric", month: "short" }).format(day) : l.pickDay}</p>
                <SegmentedControl size="sm" label={l.clock} value={clock} onChange={setClock} options={[{ value: "12h", label: l.clock12 }, { value: "24h", label: l.clock24 }]} />
              </div>
              <AnimatePresence initial={false} mode="wait">
                <motion.div key={(day?.toDateString() ?? "none") + minutes} initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { duration: 0.2 } }} exit={{ opacity: 0, transition: { duration: 0.1 } }}
                  className="flex max-h-[296px] flex-col gap-2 overflow-y-auto pr-1">
                  {!day && <p className="rounded-card bg-raised px-4 py-6 text-center text-[13px] text-muted">{l.chooseDay}</p>}
                  {day && slots.length === 0 && <p className="rounded-card bg-raised px-4 py-6 text-center text-[13px] text-muted">{l.noSlots}</p>}
                  {slots.map((s) => {
                    const on = slot?.getTime() === s.getTime();
                    return (
                      <button key={s.toISOString()} type="button" aria-pressed={on} onClick={() => setSlot(s)}
                        className={cn("relative h-10 shrink-0 rounded-control border text-sm font-medium tabular transition-colors duration-200", on ? "border-transparent" : "border-line-strong text-ink hover:border-faint")}>
                        <motion.span aria-hidden className="pointer-events-none absolute -inset-px rounded-control bg-btn-primary" initial={false} animate={{ opacity: on ? 1 : 0 }} transition={fade} />
                        <span className={cn("relative z-[1] transition-[color] delay-[80ms] duration-0", on && "text-btn-primary-ink")}>{time(s)}</span>
                      </button>
                    );
                  })}
                </motion.div>
              </AnimatePresence>
              <Button disabled={!slot} onClick={() => setStage("details")} className="w-full">{l.next}</Button>
            </div>
          </motion.div>
        )}

        {stage === "details" && (
          <motion.div key="details" {...step} className="grid gap-6 p-5 sm:p-6 md:grid-cols-[minmax(0,260px)_minmax(0,1fr)] md:gap-10">
            {summary}
            <form onSubmit={submit} noValidate className="flex flex-col gap-4">
              <TextField label={l.name} autoComplete="name" value={form.name} error={errors.name} onChange={(e) => { setForm((f) => ({ ...f, name: e.target.value })); setErrors((x) => ({ ...x, name: undefined })); }} />
              <TextField label={l.email} type="email" autoComplete="email" value={form.email} error={errors.email} onChange={(e) => { setForm((f) => ({ ...f, email: e.target.value })); setErrors((x) => ({ ...x, email: undefined })); }} />
              <Textarea label={l.notes} value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} minRows={3} maxLength={500} showCount />
              <div className="flex gap-2">
                <Button type="button" variant="ghost" leading={<ArrowLeft />} onClick={() => setStage("pick")}>{l.back}</Button>
                <Button type="submit" loading={busy} className="flex-1">{l.confirm}</Button>
              </div>
            </form>
          </motion.div>
        )}

        {stage === "done" && slot && end && (
          <motion.div key="done" {...step} className="flex flex-col items-center gap-3 px-6 py-12 text-center" role="status">
            <span className="grid size-12 place-items-center rounded-full bg-positive-soft text-positive"><CalendarCheck className="size-6" /></span>
            <h3 className="text-xl font-semibold text-ink">{l.booked}</h3>
            <p className="max-w-sm text-sm text-muted">{l.bookedBody({ title, host: host.name, day: longDay(slot), time: time(slot), timeZone: timeZone.replace(/_/g, " "), email: form.email })}</p>
            <Button variant="secondary" className="mt-2" onClick={() => { setStage("pick"); setSlot(null); setForm({ name: "", email: "", notes: "" }); }}>{l.bookAnother}</Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
