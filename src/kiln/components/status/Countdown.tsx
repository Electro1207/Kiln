import { forwardRef, useEffect, useRef, useState, type HTMLAttributes } from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "../../cn";
import { fade } from "../../motion";
import { useA11yProps, type AccessibilityFeaturesProp } from "../../a11y";
import { announce } from "../accessibility/announce";

export type CountdownUnit = "days" | "hours" | "minutes" | "seconds";

/** Text used by Countdown. Pass a partial via `labels` to translate or reword. */
export interface CountdownLabels {
  /** Visible name of each unit under its digits. */
  units: Record<CountdownUnit, string>;
  /** The one spoken label, given the parts that are left, e.g. "3 days 4 hours 12 minutes left". */
  remaining: (parts: Record<CountdownUnit, number>) => string;
  /** Spoken (and set as the label) when the time is up. */
  complete: string;
}
const plural = (n: number, one: string) => `${n} ${one}${n === 1 ? "" : "s"}`;
export const countdownLabels: CountdownLabels = {
  units: { days: "Days", hours: "Hours", minutes: "Minutes", seconds: "Seconds" },
  remaining: (p) => {
    const bits = [p.days && plural(p.days, "day"), (p.days || p.hours) && plural(p.hours, "hour"), plural(p.minutes, "minute")].filter(Boolean);
    return `${bits.join(" ")} left`;
  },
  complete: "The countdown has finished",
};

export type CountdownProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  /** The moment it counts down to: a Date, a timestamp in ms, or anything `new Date()` reads. */
  target: Date | number | string;
  /** Which units to show, largest first. Default all four. Seconds are left out under `calm`. */
  units?: CountdownUnit[];
  /** Digit and cell size. Default md. */
  size?: "sm" | "md" | "lg";
  /** Called once when the target is reached. */
  onComplete?: () => void;
  /** Override any UI text. Merged over `countdownLabels`. */
  labels?: Partial<CountdownLabels>;
  /** Accessibility features to add for this countdown only (`calm` updates once a minute). Adds to the person's own settings, never removes them. */
  accessibilityFeatures?: AccessibilityFeaturesProp;
};

const ALL: CountdownUnit[] = ["days", "hours", "minutes", "seconds"];
const sizes = {
  sm: { cell: "min-w-14 px-2.5 py-2", digit: "text-xl", label: "text-[0.6875rem]" },
  md: { cell: "min-w-[4.5rem] px-3 py-3", digit: "text-[1.75rem]", label: "text-xs" },
  lg: { cell: "min-w-24 px-4 py-4", digit: "text-5xl", label: "text-[0.8125rem]" },
};

function parts(ms: number): Record<CountdownUnit, number> {
  const s = Math.max(0, Math.floor(ms / 1000));
  return { days: Math.floor(s / 86400), hours: Math.floor((s % 86400) / 3600), minutes: Math.floor((s % 3600) / 60), seconds: s % 60 };
}

/** One digit. Old and new share one cell and cross-fade; an invisible 0 holds the width. */
function Digit({ ch }: { ch: string }) {
  return (
    <span className="relative inline-block">
      <span aria-hidden className="invisible">0</span>
      <AnimatePresence initial={false}>
        <motion.span
          key={ch}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={fade}
          className="absolute inset-0 text-center"
        >
          {ch}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

/**
 * Time left until a date, as days, hours, minutes and seconds in a grid. Digits cross-fade in place
 * with tabular figures, so nothing shifts. Screen readers get one label, refreshed once a minute.
 */
export const Countdown = forwardRef<HTMLDivElement, CountdownProps>(function Countdown(
  { target, units = ALL, size = "md", onComplete, labels, accessibilityFeatures, className, style, ...rest },
  ref,
) {
  const l = { ...countdownLabels, ...labels, units: { ...countdownLabels.units, ...labels?.units } };
  const { a11y, rootProps } = useA11yProps(accessibilityFeatures);
  const end = new Date(target).getTime();
  const [ms, setMs] = useState(() => Math.max(0, end - Date.now()));
  const calm = a11y.calm;
  // The number of day digits is fixed when it starts, so 100 days to 99 never changes the width.
  const dayDigits = useRef(Math.max(2, String(parts(Math.max(0, end - Date.now())).days).length));
  const done = useRef(false);
  const cb = useRef(onComplete);
  useEffect(() => {
    cb.current = onComplete;
  });

  useEffect(() => {
    done.current = false;
    let timer = 0;
    const tick = () => {
      const left = Math.max(0, end - Date.now());
      setMs(left);
      if (left <= 0) {
        if (!done.current) {
          done.current = true;
          cb.current?.();
        }
        return;
      }
      // Next tick lands on the next second (or minute, when calm) boundary of the target.
      const step = calm ? 60000 : 1000;
      timer = window.setTimeout(tick, left % step || step);
    };
    tick();
    return () => window.clearTimeout(timer);
  }, [end, calm]);

  const p = parts(ms);
  const finished = ms <= 0;
  const shown = units.filter((u) => !(calm && u === "seconds"));
  const minute = Math.floor(ms / 60000);
  const label = finished ? l.complete : l.remaining(p);
  // One spoken label: it only changes with the minute, never every second.
  const spoken = useRef({ minute: -1, label });
  if (spoken.current.minute !== minute || finished) spoken.current = { minute, label };

  useEffect(() => {
    if (finished && done.current) announce(l.complete);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished]);

  const s = sizes[size];
  const pad = (u: CountdownUnit) => String(p[u]).padStart(u === "days" ? dayDigits.current : 2, "0");

  return (
    <div
      ref={ref}
      role="timer"
      aria-live="off"
      aria-label={spoken.current.label}
      {...rest}
      {...rootProps}
      className={cn("inline-grid auto-cols-fr grid-flow-col gap-2 sm:gap-3", className)}
      style={{ ...rootProps.style, ...style }}
    >
      {shown.map((u) => (
        <div key={u} aria-hidden className={cn("flex flex-col items-center gap-1 rounded-card border border-line bg-surface", s.cell)}>
          <span className={cn("tabular inline-flex font-medium leading-none text-ink", s.digit)}>
            {pad(u).split("").map((ch, i, all) => (
              <Digit key={all.length - i} ch={ch} />
            ))}
          </span>
          <span className={cn("text-muted", s.label)}>{l.units[u]}</span>
        </div>
      ))}
    </div>
  );
});
