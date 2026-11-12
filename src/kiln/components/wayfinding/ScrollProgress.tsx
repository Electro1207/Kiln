import type { RefObject } from "react";
import { motion, useScroll, useSpring } from "motion/react";
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
  className?: string;
  /** Override any UI text. Merged over `scrollProgressLabels`. */
  labels?: Partial<ScrollProgressLabels>;
};

/**
 * A thin bar that fills as you read. It is one element scaled on the x axis,
 * smoothed with the firm spring so a flick of the wheel never makes it jump.
 * Position it yourself (fixed to the top of the page, or sticky in a panel).
 */
export function ScrollProgress({ container, className, labels }: ScrollProgressProps) {
  const l = { ...scrollProgressLabels, ...labels };
  const { scrollYProgress } = useScroll(container ? { container } : undefined);
  const scaleX = useSpring(scrollYProgress, springFirm);
  return (
    <motion.div
      role="progressbar"
      aria-label={l.progress}
      aria-valuemin={0}
      aria-valuemax={100}
      style={{ scaleX }}
      className={cn("h-[3px] origin-left rounded-r-full bg-accent", className)}
    />
  );
}
