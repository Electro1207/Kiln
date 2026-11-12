import { useEffect, useId } from "react";
import { motion, useSpring, useTransform } from "motion/react";
import { cn } from "../../cn";
import { springFirm } from "../../motion";

/** Text used by Meter. Pass a partial via `labels` to translate or reword. */
export interface MeterLabels {
  /** Visible "of 10 GB" text after the used figure. */
  of: (max: string, unit: string) => string;
  /** Accessible value text, e.g. "4.2 of 10 GB". */
  valueText: (used: string, max: number, unit: string) => string;
}
export const meterLabels: MeterLabels = {
  of: (max, unit) => `of ${max} ${unit}`,
  valueText: (used, max, unit) => `${used} of ${max} ${unit}`,
};

export type MeterSegment = { label: string; value: number; tone?: "accent" | "info" | "warning" | "muted" };

export type MeterProps = {
  label: string;
  /** Used amount, in `unit`. Ignored when segments are given. */
  value?: number;
  max: number;
  unit?: string;
  /** Split the used part into kinds (photos, documents, mail…). */
  segments?: MeterSegment[];
  /** Fraction at which the bar turns to warning (default 0.8) and to full (0.95). */
  warnAt?: number;
  fullAt?: number;
  /** Decimal places for the figures. */
  decimals?: number;
  className?: string;
  /** Override any UI text. Merged over `meterLabels`. */
  labels?: Partial<MeterLabels>;
};

const segTone = { accent: "bg-accent", info: "bg-info", warning: "bg-warning", muted: "bg-faint" };

/** How much of a limit is used: storage, seats, a monthly quota. Turns amber, then red, as it fills. */
export function Meter({ label, value = 0, max, unit = "", segments, warnAt = 0.8, fullAt = 0.95, decimals = 1, className, labels }: MeterProps) {
  const l = { ...meterLabels, ...labels };
  const id = useId();
  const used = segments ? segments.reduce((a, s) => a + s.value, 0) : value;
  const frac = Math.min(used / max, 1);
  const state = frac >= fullAt ? "full" : frac >= warnAt ? "warn" : "ok";
  const sp = useSpring(0, springFirm);
  useEffect(() => sp.set(used), [sp, used]);
  const usedText = useTransform(sp, (n) => n.toFixed(decimals));

  return (
    <div className={cn("w-full", className)}>
      <div className="mb-2 flex items-baseline justify-between gap-3 text-sm">
        <span id={id} className="font-medium text-ink">{label}</span>
        <span className="tabular text-muted">
          <motion.span className={cn("font-medium transition-colors", state === "full" ? "text-negative" : state === "warn" ? "text-warning" : "text-ink")}>
            {usedText}
          </motion.span>{" "}
          {l.of(max.toFixed(decimals).replace(/\.0+$/, ""), unit)}
        </span>
      </div>
      <div
        role="meter"
        aria-labelledby={id}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={used}
        aria-valuetext={l.valueText(used.toFixed(decimals), max, unit)}
        className="relative flex h-2 overflow-hidden rounded-full bg-active"
      >
        {segments ? (
          segments.map((s, i) => (
            <motion.span
              key={s.label}
              className={cn("h-full", segTone[s.tone ?? "accent"], i > 0 && "ml-0.5")}
              initial={false}
              animate={{ flexBasis: `${(s.value / max) * 100}%` }}
              transition={springFirm}
              style={{ flexShrink: 0 }}
            />
          ))
        ) : (
          <motion.span
            className={cn(
              "absolute inset-0 rounded-full transition-colors duration-300",
              state === "full" ? "bg-negative" : state === "warn" ? "bg-warning" : "bg-accent",
            )}
            initial={false}
            animate={{ x: `${(frac - 1) * 100}%` }}
            transition={springFirm}
          />
        )}
      </div>
      {segments && (
        <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-[13px] text-muted">
          {segments.map((s) => (
            <li key={s.label} className="flex items-center gap-1.5">
              <span aria-hidden className={cn("size-2 rounded-full", segTone[s.tone ?? "accent"])} />
              {s.label}
              <span className="tabular text-ink">
                {s.value.toFixed(decimals)} {unit}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
