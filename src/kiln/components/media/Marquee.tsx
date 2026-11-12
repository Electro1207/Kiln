import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { motion, useAnimationFrame, useInView, useMotionValue, useReducedMotion } from "motion/react";
import { cn } from "../../cn";

export type MarqueeProps = {
  children: ReactNode;
  /** Pixels per second. Negative runs the other way. */
  speed?: number;
  gap?: number;
  /** Ease to a stop while the pointer is over it. */
  pauseOnHover?: boolean;
  label?: string;
  className?: string;
};

/**
 * An endless row. Content is drawn twice and wrapped by its own width, so the
 * loop has no seam; hovering eases the speed down rather than stopping dead.
 */
export function Marquee({ children, speed = 40, gap = 40, pauseOnHover = true, label, className }: MarqueeProps) {
  const root = useRef<HTMLDivElement>(null);
  const first = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(0);
  const x = useMotionValue(0);
  const current = useRef(speed);
  const target = useRef(speed);
  const reduce = useReducedMotion();
  const visible = useInView(root);

  useLayoutEffect(() => {
    const el = first.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setW(el.getBoundingClientRect().width + gap));
    ro.observe(el);
    return () => ro.disconnect();
  }, [gap]);

  useAnimationFrame((_, delta) => {
    if (!w || reduce || !visible) return;
    const dt = Math.min(delta, 64) / 1000;
    current.current += (target.current - current.current) * Math.min(1, dt * 5);
    let next = x.get() - current.current * dt;
    if (next <= -w) next += w;
    if (next > 0) next -= w;
    x.set(next);
  });

  return (
    <div
      ref={root}
      className={cn("w-full overflow-hidden", className)}
      role="marquee"
      aria-label={label}
      onPointerEnter={() => pauseOnHover && (target.current = 0)}
      onPointerLeave={() => (target.current = speed)}
      onFocus={() => (target.current = 0)}
      onBlur={() => (target.current = speed)}
    >
      <motion.div className="flex w-max" style={{ x, gap }}>
        <div ref={first} className="flex shrink-0 items-center" style={{ gap }}>
          {children}
        </div>
        <div className="flex shrink-0 items-center" style={{ gap }} aria-hidden>
          {children}
        </div>
      </motion.div>
    </div>
  );
}
