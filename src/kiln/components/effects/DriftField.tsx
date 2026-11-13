import { useEffect, useState, type ReactNode } from "react";
import { motion, useMotionValue, useScroll, useTransform, type MotionValue } from "motion/react";
import { cn } from "../../cn";
import { usePrefersReducedMotion } from "../shared/useLoop";

export type DriftItem = {
  /** What floats: usually a small live control (a switch, a slider, a progress ring). */
  content: ReactNode;
  /** Which edge column it floats in. Default "left". */
  side?: "left" | "right";
  /** Its tilt at rest, in degrees. Default 0. */
  tilt?: number;
};

export type DriftFieldProps = {
  items: DriftItem[];
  /**
   * What carries the pieces upwards, in screen heights. Defaults to the page's own scroll. Pass
   * CardJourney's `useJourney().progress` (stops) to drift with a journey instead.
   */
  progress?: MotionValue<number>;
  /** Screen heights each column travels per unit of progress. Different speeds read as depth. Default { left: 0.6, right: 0.45 }. */
  speed?: { left?: number; right?: number };
  /** One loop, in screen heights: a piece leaves at the top and comes back from below, off screen. Default 1.5. */
  loop?: number;
  /** Distance from each edge. Default { left: "1.5rem", right: "4.5rem" } (room for a scroll rail on the right). */
  inset?: { left?: string; right?: string };
  /** Classes for the box around each piece. */
  itemClassName?: string;
  className?: string;
  /** Names the group of controls for screen readers. */
  "aria-label"?: string;
};

function useScreens() {
  const { scrollY } = useScroll();
  const [h, setH] = useState(() => (typeof window === "undefined" ? 800 : window.innerHeight));
  useEffect(() => {
    const on = () => setH(window.innerHeight);
    window.addEventListener("resize", on);
    return () => window.removeEventListener("resize", on);
  }, []);
  return useTransform(scrollY, (y) => y / h);
}

function Piece({ item, at, speed, loop, inset, progress, className, still }: { item: DriftItem; at: number; speed: number; loop: number; inset: string; progress: MotionValue<number>; className?: string; still: boolean }) {
  const right = item.side === "right";
  const y = useTransform(progress, (v) => {
    const p = still ? 0 : v;
    const pos = (((at - p * speed + 0.25) % loop) + loop) % loop - 0.25;
    return `${pos * 100}%`;
  });
  const rotate = useTransform(progress, (v) => (item.tilt ?? 0) + (still ? 0 : Math.sin(v * 2 + at * 7) * 3));
  // The layer is as tall as the field, so a percentage move is a share of the field, not of the piece.
  return (
    <motion.div style={{ y }} className="pointer-events-none absolute inset-0 will-change-transform">
      <motion.div
        style={{ rotate, [right ? "right" : "left"]: inset }}
        className={cn("pointer-events-auto absolute top-0 will-change-transform rounded-card border border-line bg-surface px-4 py-3", className)}
      >
        {item.content}
      </motion.div>
    </motion.div>
  );
}

/**
 * Small live controls floating in two columns at the edges of a stage, carried upwards as the page
 * scrolls and looping back in from below, each column at its own speed. Pieces in a column are spaced
 * evenly and share a speed, so they never collide. The field fills its positioned parent and only the
 * pieces take the pointer. Transforms only; with reduced motion the pieces stay where they start.
 */
export function DriftField({ items, progress, speed, loop = 1.5, inset, itemClassName, className, "aria-label": ariaLabel }: DriftFieldProps) {
  const still = usePrefersReducedMotion();
  const screens = useScreens();
  const zero = useMotionValue(0);
  const p = progress ?? screens ?? zero;
  const sp = { left: speed?.left ?? 0.6, right: speed?.right ?? 0.45 };
  const ins = { left: inset?.left ?? "1.5rem", right: inset?.right ?? "4.5rem" };
  const left = items.filter((it) => it.side !== "right");
  const right = items.filter((it) => it.side === "right");
  const place = (list: DriftItem[], offset: number) => list.map((it) => ({ it, at: offset + (list.indexOf(it) * loop) / Math.max(1, list.length) }));
  return (
    <div role="group" aria-label={ariaLabel} className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      {[...place(left, 0.1), ...place(right, 0.1 + loop / Math.max(2, right.length * 2))].map(({ it, at }, i) => (
        <Piece key={i} item={it} at={at} speed={it.side === "right" ? sp.right : sp.left} loop={loop} inset={it.side === "right" ? ins.right : ins.left} progress={p} className={itemClassName} still={still} />
      ))}
    </div>
  );
}
