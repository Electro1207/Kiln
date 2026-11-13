import { useRef, type RefObject } from "react";
import { motion, useMotionValueEvent, useScroll, useSpring, useTransform } from "motion/react";
import { cn } from "../../cn";
import { springFirm } from "../../motion";

/** Text used by ScrollProgress. Pass a partial via `labels` to translate or reword. */
export interface ScrollProgressLabels {
  /** aria-label of the progress bar. */
  progress: string;
}
export const scrollProgressLabels: ScrollProgressLabels = { progress: "Reading progress" };

export type ScrollProgressProps = {
  /** A scrolling element to follow; the window when left out. */
  container?: RefObject<HTMLElement | null>;
  /** A thin bar (default), or a ring with the percentage in the middle. */
  variant?: "bar" | "ring";
  /** Ring only: diameter in px. Default 56. */
  size?: number;
  /** Ring only: stroke width in px. Default 5. */
  stroke?: number;
  /** Ring only: show the percentage in the middle. Default true. */
  showValue?: boolean;
  className?: string;
  /** Override any UI text. Merged over `scrollProgressLabels`. */
  labels?: Partial<ScrollProgressLabels>;
};

/**
 * How far down you have read, as a thin bar that fills (position it yourself: fixed to the top
 * of the page, or sticky in a panel) or as a ring with the percentage in it. Either way it is
 * smoothed with the firm spring, so a flick of the wheel never makes it jump, and it never
 * re-renders while you scroll: the fill and the number are written straight from the scroll.
 */
export function ScrollProgress({ container, variant = "bar", size = 56, stroke = 5, showValue = true, className, labels }: ScrollProgressProps) {
  const l = { ...scrollProgressLabels, ...labels };
  const { scrollYProgress } = useScroll(container ? { container } : undefined);
  const p = useSpring(scrollYProgress, springFirm);
  const ref = useRef<HTMLDivElement>(null);
  const text = useTransform(p, (v) => `${Math.round(Math.min(1, Math.max(0, v)) * 100)}`);
  useMotionValueEvent(scrollYProgress, "change", (v) => ref.current?.setAttribute("aria-valuenow", String(Math.round(v * 100))));

  const a11y = { ref, role: "progressbar", "aria-label": l.progress, "aria-valuemin": 0, "aria-valuemax": 100, "aria-valuenow": 0 } as const;

  if (variant === "bar") {
    return <motion.div {...a11y} style={{ scaleX: p }} className={cn("h-[3px] origin-left rounded-r-full bg-accent", className)} />;
  }

  const r = (size - stroke) / 2;
  return (
    <div {...a11y} className={cn("relative inline-grid shrink-0 place-items-center", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="absolute inset-0 -rotate-90" aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} className="stroke-active" />
        <motion.circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} strokeLinecap="round" className="stroke-accent" style={{ pathLength: p }} />
      </svg>
      {showValue && (
        <span aria-hidden className="relative text-xs font-medium text-ink tabular">
          <motion.span>{text}</motion.span>
          <span className="text-[0.75em] text-muted">%</span>
        </span>
      )}
    </div>
  );
}
