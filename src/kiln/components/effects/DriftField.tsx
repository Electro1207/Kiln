import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
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
  /**
   * Stay put at the foot of its column instead of drifting: for what should always be at hand (a
   * progress ring, a theme switch). The drifting pieces fade out above the pinned ones, so the two
   * never overlap.
   */
  pin?: boolean;
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

/** Height of a column's pinned pieces, kept current as they change size. */
function useDock() {
  const ref = useRef<HTMLDivElement>(null);
  const [h, setH] = useState(0);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setH(el.offsetHeight));
    ro.observe(el);
    setH(el.offsetHeight);
    return () => ro.disconnect();
  }, []);
  return [ref, h] as const;
}

/**
 * Small live controls floating in two columns at the edges of a stage, carried upwards as the page
 * scrolls and looping back in from below, each column at its own speed. Pieces in a column are spaced
 * evenly and share a speed, so they never collide; pinned pieces stay at the foot of their column.
 * The field fills its positioned parent and only the pieces take the pointer. Transforms only; with
 * reduced motion the pieces stay where they start.
 */
export function DriftField({ items, progress, speed, loop = 1.5, inset, itemClassName, className, "aria-label": ariaLabel }: DriftFieldProps) {
  const still = usePrefersReducedMotion();
  const screens = useScreens();
  const zero = useMotionValue(0);
  const p = progress ?? screens ?? zero;
  const sp = { left: speed?.left ?? 0.6, right: speed?.right ?? 0.45 };
  const ins = { left: inset?.left ?? "1.5rem", right: inset?.right ?? "4.5rem" };
  const [leftDock, leftH] = useDock();
  const [rightDock, rightH] = useDock();
  const sides = (["left", "right"] as const).map((side) => {
    const own = items.filter((it) => (it.side ?? "left") === side);
    const drift = own.filter((it) => !it.pin);
    const offset = side === "left" ? 0.1 : 0.1 + loop / Math.max(2, drift.length * 2);
    return { side, drift: drift.map((it, i) => ({ it, at: offset + (i * loop) / Math.max(1, drift.length) })), pinned: own.filter((it) => it.pin) };
  });
  return (
    <div role="group" aria-label={ariaLabel} className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      {sides.map(({ side, drift, pinned }) => {
        const dock = side === "left" ? leftH : rightH;
        // Each column drifts in its own layer, which ends above that column's pinned pieces and fades out there.
        const fade = dock ? `linear-gradient(to bottom, #000 calc(100% - 4rem), transparent)` : undefined;
        return (
          <div key={side}>
            <div
              className="absolute inset-x-0 top-0"
              style={{ bottom: dock ? `calc(${dock}px + 2.5rem)` : 0, maskImage: fade, WebkitMaskImage: fade }}
            >
              {drift.map(({ it, at }, i) => (
                <Piece key={i} item={it} at={at} speed={sp[side]} loop={loop} inset={ins[side]} progress={p} className={itemClassName} still={still} />
              ))}
            </div>
            <div
              ref={side === "left" ? leftDock : rightDock}
              className={cn("absolute bottom-6 flex flex-col gap-3", side === "left" ? "items-start" : "items-end")}
              style={{ [side]: ins[side] }}
            >
              {pinned.map((it, i) => (
                <div key={i} className={cn("pointer-events-auto rounded-card border border-line bg-surface px-4 py-3", itemClassName)} style={it.tilt ? { rotate: `${it.tilt}deg` } : undefined}>{it.content}</div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
