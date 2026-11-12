import { useRef, type ReactNode } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { cn } from "../../cn";
import { springSoft } from "../../motion";

export type MagneticProps = {
  children: ReactNode;
  /** How strongly it follows the pointer, 0..1. */
  strength?: number;
  /** Furthest it moves, px. */
  max?: number;
  /** How far outside the child the pull starts, px. */
  zone?: number;
  className?: string;
};

/**
 * Wrap a button and it leans gently towards the pointer, then settles back.
 * The pull starts in a margin around it, so it reacts before you arrive.
 */
export function Magnetic({ children, strength = 0.3, max = 10, zone = 28, className }: MagneticProps) {
  const inner = useRef<HTMLDivElement>(null);
  const dx = useMotionValue(0);
  const dy = useMotionValue(0);
  const x = useSpring(dx, springSoft);
  const y = useSpring(dy, springSoft);
  const lx = useTransform(x, (v) => v * 0.4);
  const ly = useTransform(y, (v) => v * 0.4);
  const clamp = (v: number) => Math.max(-max, Math.min(max, v));

  return (
    <div
      className={cn("inline-block", className)}
      style={{ padding: zone, margin: -zone }}
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse" || !inner.current) return;
        const r = inner.current.getBoundingClientRect();
        dx.set(clamp((e.clientX - (r.left + r.width / 2)) * strength));
        dy.set(clamp((e.clientY - (r.top + r.height / 2)) * strength));
      }}
      onPointerLeave={() => {
        dx.set(0);
        dy.set(0);
      }}
    >
      <motion.div ref={inner} style={{ x, y }} className="inline-block">
        <motion.div style={{ x: lx, y: ly }}>{children}</motion.div>
      </motion.div>
    </div>
  );
}
