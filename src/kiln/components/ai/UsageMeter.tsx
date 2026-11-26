import { forwardRef, useEffect, useId, useMemo, type HTMLAttributes, type ReactNode } from "react";
import { motion, useSpring, useTransform } from "motion/react";
import { CircleAlert, TriangleAlert } from "lucide-react";
import { cn } from "../../cn";
import { springFirm } from "../../motion";
import { useA11yProps, type AccessibilityFeaturesProp } from "../../a11y";

export type UsageState = "ok" | "warning" | "over";

/** Text used by UsageMeter. Pass a partial via `labels` to translate or reword. */
export interface UsageMeterLabels {
  /** Visible "of 1M tokens" after the used figure, given the formatted limit. */
  of: (limit: string, unit: string) => string;
  /** Left of the bar: what is still available, given the formatted amount. */
  left: (amount: string, unit: string) => string;
  /** Text beside the warning icon, given the formatted amount left. */
  warning: (amount: string, unit: string) => string;
  /** Text beside the over icon, given the formatted amount over. */
  over: (amount: string, unit: string) => string;
  /** Spoken value of the meter. */
  valueText: (used: string, limit: string, unit: string, state: UsageState) => string;
}
export const usageMeterLabels: UsageMeterLabels = {
  of: (limit, unit) => `of ${limit} ${unit}`,
  left: (amount, unit) => `${amount} ${unit} left`,
  warning: (amount, unit) => `Running low: ${amount} ${unit} left`,
  over: (amount, unit) => `Over the limit by ${amount} ${unit}`,
  valueText: (used, limit, unit, state) =>
    `${used} of ${limit} ${unit}${state === "warning" ? ", running low" : state === "over" ? ", over the limit" : ""}`,
};

/** Icons used by UsageMeter. Pass a partial via `icons` to swap any of them. */
export interface UsageMeterIcons {
  /** Beside the "running low" message. */
  warning: ReactNode;
  /** Beside the "over the limit" message. */
  over: ReactNode;
}
export const usageMeterIcons: UsageMeterIcons = { warning: <TriangleAlert />, over: <CircleAlert /> };

export type UsageMeterProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  /** What the meter is for, e.g. "Context window". */
  label: string;
  /** Amount used, in `unit`. May pass `limit`; the bar stops full and the over state shows. */
  used: number;
  /** The most there is. */
  limit: number;
  /** What is counted. Default "tokens". */
  unit?: string;
  /** Fraction used at which the warning shows. Default 0.8. */
  warnAt?: number;
  /** Turns a number into text. Default is compact: 12.4K, 1.2M. */
  format?: (n: number) => string;
  /** Bar thickness: sm 4px, md 8px, lg 12px. */
  size?: "sm" | "md" | "lg";
  /** A line under the meter, e.g. when it resets. */
  note?: ReactNode;
  /** Shown beside the warning and over messages, e.g. an upgrade button. */
  action?: ReactNode;
  /** Override any UI text. Merged over `usageMeterLabels`. */
  labels?: Partial<UsageMeterLabels>;
  /** Replace any built-in icon. Merged over `usageMeterIcons`. */
  icons?: Partial<UsageMeterIcons>;
  /** Accessibility features to add for this meter only (`colourSafe` adds a hatch to the filled part). Adds to the person's own settings, never removes them. */
  accessibilityFeatures?: AccessibilityFeaturesProp;
};

const compact = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 });
const defaultFormat = (n: number) => compact.format(n);

const heights = { sm: "h-1", md: "h-2", lg: "h-3" };
const tones: Record<UsageState, string> = { ok: "bg-accent", warning: "bg-warning", over: "bg-negative" };
const textTones: Record<UsageState, string> = { ok: "text-ink", warning: "text-warning", over: "text-negative" };

/**
 * Tokens or credits used against a limit: a bar and the figures. It warns before the limit and
 * says so again past it, in words and an icon as well as colour. Announced as a meter.
 */
export const UsageMeter = forwardRef<HTMLDivElement, UsageMeterProps>(function UsageMeter(
  { label, used, limit, unit = "tokens", warnAt = 0.8, format = defaultFormat, size = "md", note, action, labels, icons, accessibilityFeatures, className, style, ...rest },
  ref,
) {
  const l = { ...usageMeterLabels, ...labels };
  const ic = useMemo(() => ({ ...usageMeterIcons, ...icons }), [icons]);
  const { a11y, rootProps } = useA11yProps(accessibilityFeatures);
  const id = useId();
  const frac = limit > 0 ? used / limit : 0;
  const state: UsageState = frac > 1 ? "over" : frac >= warnAt ? "warning" : "ok";
  const sp = useSpring(0, springFirm);
  useEffect(() => sp.set(used), [sp, used]);
  const usedText = useTransform(sp, (n) => format(Math.round(n)));
  const message = state === "over" ? l.over(format(used - limit), unit) : state === "warning" ? l.warning(format(limit - used), unit) : null;

  return (
    <div ref={ref} {...rest} {...rootProps} className={cn("k-fill", className)} style={{ ...rootProps.style, ...style }}>
      <div className="mb-2 flex items-baseline justify-between gap-3 text-sm">
        <span id={id} className="font-medium text-ink">{label}</span>
        <span className="tabular text-muted">
          <motion.span className={cn("font-medium transition-colors duration-300", textTones[state])}>{usedText}</motion.span> {l.of(format(limit), unit)}
        </span>
      </div>
      <div
        role="meter"
        aria-labelledby={id}
        aria-valuemin={0}
        aria-valuemax={limit}
        aria-valuenow={Math.min(used, limit)}
        aria-valuetext={l.valueText(format(used), format(limit), unit, state)}
        className={cn("relative overflow-hidden rounded-full bg-active", heights[size])}
      >
        <motion.div
          className={cn("absolute inset-0 origin-left rounded-full transition-colors duration-300", tones[state])}
          initial={false}
          animate={{ scaleX: Math.min(1, Math.max(0, frac)) }}
          transition={springFirm}
        />
        {/* A hatch on the filled part, so low, running low and over differ without colour (colourSafe). */}
        {a11y.colourSafe && state !== "ok" && (
          <motion.div
            aria-hidden
            className="absolute inset-0 origin-left [background-image:repeating-linear-gradient(135deg,var(--color-surface)_0_2px,transparent_2px_6px)] opacity-60"
            initial={false}
            animate={{ scaleX: Math.min(1, Math.max(0, frac)) }}
            transition={springFirm}
          />
        )}
      </div>
      <div className="mt-2 flex min-h-5 flex-wrap items-center justify-between gap-x-3 gap-y-1 text-[0.8125rem]">
        {message ? (
          <span className={cn("flex items-center gap-1.5", state === "over" ? "text-negative" : "text-warning")}>
            <span aria-hidden className="grid shrink-0 [&>svg]:size-3.5">{state === "over" ? ic.over : ic.warning}</span>
            <span>{message}</span>
          </span>
        ) : (
          <span className="tabular text-muted">{l.left(format(Math.max(0, limit - used)), unit)}</span>
        )}
        {message && action ? <span className="shrink-0">{action}</span> : note ? <span className="text-muted">{note}</span> : null}
      </div>
      {message && note && <p className="mt-1 text-[0.8125rem] text-muted">{note}</p>}
    </div>
  );
});
