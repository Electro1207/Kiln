import { useRef, type CSSProperties, type ReactNode, type RefObject } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { cn } from "../../cn";
import { usePrefersReducedMotion } from "../shared/useLoop";

export type ParallaxProps = {
  children: ReactNode;
  /** Element to render. Default `div`. */
  as?: "div" | "section" | "article" | "figure" | "span" | "li";
  /**
   * How far it drifts, in px, while it crosses the screen: from `+distance` as it
   * enters to `-distance` as it leaves. Negative drifts the other way. Default 80.
   */
  distance?: number;
  /** Drift on the vertical (default) or horizontal axis. */
  axis?: "y" | "x";
  /** Degrees to turn over the same pass, for cards that tilt as they drift. Default 0. */
  rotate?: number;
  /** The scrolling element, when it isn't the page. */
  container?: RefObject<HTMLElement | null>;
  className?: string;
  style?: CSSProperties;
};

/**
 * Moves its content at a different speed from the page, so layers at different
 * distances read as depth. The offset is a motion value tied to scroll, so
 * scrolling never re-renders React, and only transform changes. With reduced
 * motion it stays still.
 */
export function Parallax({ children, as = "div", distance = 80, axis = "y", rotate = 0, container, className, style }: ParallaxProps) {
  const ref = useRef<HTMLElement>(null);
  const reduce = usePrefersReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, container, offset: ["start end", "end start"] });
  const d = reduce ? 0 : distance;
  const shift = useTransform(scrollYProgress, [0, 1], [d, -d]);
  const turn = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [-rotate / 2, rotate / 2]);
  const Tag = motion[as];
  return (
    <Tag
      ref={ref as never}
      className={cn("will-change-transform", className)}
      style={{ ...style, [axis]: shift, rotate: rotate ? turn : undefined }}
    >
      {children}
    </Tag>
  );
}
