import { useLayoutEffect, useRef, type ElementType, type ReactNode } from "react";
import { useInView } from "motion/react";
import { cn } from "../../cn";
import { easeOut } from "../../motion";
import { usePrefersReducedMotion } from "../shared/useLoop";

export type RevealProps = {
  children: ReactNode;
  /** Element to render. Default `div`. */
  as?: ElementType;
  /** Where it comes from: it rises from below by default. */
  from?: "bottom" | "top" | "left" | "right";
  /** How far it travels, in px. */
  distance?: number;
  /** Seconds before it starts. Give siblings 0.06 to 0.09 more each to stagger them. */
  delay?: number;
  /** Play again every time it re-enters the screen. */
  repeat?: boolean;
  className?: string;
};

const DURATION = 720;

/**
 * Wraps anything and lets it rise into place, with a fade, the first time it
 * scrolls into view. It runs as one Web Animation of transform and opacity, so
 * it stays on the compositor however many are on the page. With reduced
 * motion the content is simply there.
 */
export function Reveal({ children, as: Tag = "div", from = "bottom", distance = 24, delay = 0, repeat, className }: RevealProps) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: !repeat, amount: 0.2, margin: "0px 0px -8% 0px" });
  const reduce = usePrefersReducedMotion();
  const dx = from === "left" ? -distance : from === "right" ? distance : 0;
  const dy = from === "bottom" ? distance : from === "top" ? -distance : 0;
  const hidden = `translate3d(${dx}px, ${dy}px, 0)`;

  // A layout effect, so the hidden pose is set before the first paint and nothing flashes.
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reduce) {
      el.style.opacity = el.style.transform = "";
      return;
    }
    if (!inView) {
      el.style.opacity = "0";
      el.style.transform = hidden;
      return;
    }
    const anim = el.animate(
      [{ opacity: 0, transform: hidden }, { opacity: 1, transform: "translate3d(0, 0, 0)" }],
      { duration: DURATION, delay: delay * 1000, easing: `cubic-bezier(${easeOut.join(",")})`, fill: "backwards" },
    );
    el.style.opacity = el.style.transform = "";
    return () => anim.cancel();
  }, [inView, reduce, hidden, delay]);

  return (
    <Tag ref={ref} className={cn(className)}>
      {children}
    </Tag>
  );
}
