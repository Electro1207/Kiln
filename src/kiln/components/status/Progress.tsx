import { useId, useRef, type HTMLAttributes, type ReactNode, type Ref } from "react";
import { useLoop } from "../shared/useLoop";
import { motion } from "motion/react";
import { cn } from "../../cn";
import { springFirm } from "../../motion";

export type ProgressProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  /** 0..max. Leave undefined for an indeterminate bar. */
  value?: number;
  max?: number;
  label?: ReactNode;
  /** Text at the right of the label row, e.g. "64%" or "3 of 8 files". */
  valueText?: ReactNode;
  /** Bar thickness: sm 4px, md 8px, lg 12px. */
  size?: "sm" | "md" | "lg";
  tone?: "accent" | "positive" | "negative";
  ref?: Ref<HTMLDivElement>;
};

const fill = { accent: "bg-accent", positive: "bg-positive", negative: "bg-negative" };

/** A horizontal progress bar. Fills with a spring; without a value it runs a band back and forth. */
export function Progress({ value, max = 100, label, valueText, size = "md", tone = "accent", className, ref, ...rest }: ProgressProps) {
  const id = useId();
  const indeterminate = value === undefined;
  const pct = indeterminate ? 0 : Math.min(Math.max(value / max, 0), 1);
  const band = useRef<HTMLDivElement>(null);
  useLoop(
    band,
    (el) =>
      indeterminate
        ? [el.animate([{ transform: "translateX(-100%)" }, { transform: "translateX(250%)" }], { duration: 1400, endDelay: 100, iterations: Infinity, easing: "cubic-bezier(0.65, 0, 0.35, 1)" })]
        : [],
    [indeterminate],
  );
  return (
    <div ref={ref} {...rest} className={cn("k-fill", className)}>
      {(label || valueText) && (
        <div className="mb-2 flex items-baseline justify-between gap-3 text-sm">
          {label && <span id={id} className="font-medium text-ink">{label}</span>}
          {valueText && <span className="tabular text-muted">{valueText}</span>}
        </div>
      )}
      <div
        role="progressbar"
        aria-labelledby={label ? id : undefined}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={indeterminate ? undefined : value}
        className={cn("relative overflow-hidden rounded-full bg-active", size === "sm" ? "h-1" : size === "lg" ? "h-3" : "h-2")}
      >
        {indeterminate ? (
          <div ref={band} className={cn("absolute inset-y-0 left-0 w-2/5 rounded-full", fill[tone])} style={{ transform: "translateX(-100%)" }} />
        ) : (
          <motion.div
            className={cn("absolute inset-0 rounded-full", fill[tone])}
            initial={false}
            animate={{ x: `${(pct - 1) * 100}%` }}
            transition={springFirm}
          />
        )}
      </div>
    </div>
  );
}
