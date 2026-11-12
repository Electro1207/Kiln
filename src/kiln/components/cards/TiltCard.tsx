import type { ReactNode } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { cn } from "../../cn";
import { springSoft } from "../../motion";

export type TiltCardProps = {
  children: ReactNode;
  /** Maximum tilt in degrees. */
  max?: number;
  className?: string;
  /** Classes for the card surface itself. */
  cardClassName?: string;
};

/**
 * A card that leans towards the pointer in 3D and settles flat when it leaves.
 * Wrap inner pieces in TiltLayer to float them above the surface.
 */
export function TiltCard({ children, max = 8, className, cardClassName }: TiltCardProps) {
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const rx = useSpring(useTransform(py, (v) => -v * max * 2), springSoft);
  const ry = useSpring(useTransform(px, (v) => v * max * 2), springSoft);
  const sheenX = useTransform(px, (v) => `${v * 60}%`);
  const sheenY = useTransform(py, (v) => `${v * 60}%`);
  const sheen = useSpring(0, springSoft);
  const sheenOpacity = useTransform(sheen, (v) => v * 0.5);

  return (
    <div className={cn("[perspective:900px]", className)}>
      <motion.div
        onPointerMove={(e) => {
          if (e.pointerType !== "mouse") return;
          const r = e.currentTarget.getBoundingClientRect();
          px.set((e.clientX - r.left) / r.width - 0.5);
          py.set((e.clientY - r.top) / r.height - 0.5);
          sheen.set(1);
        }}
        onPointerLeave={() => {
          px.set(0);
          py.set(0);
          sheen.set(0);
        }}
        style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }}
        className={cn("relative rounded-[18px] border border-line bg-surface", cardClassName)}
      >
        {children}
        <motion.span
          aria-hidden
          style={{ x: sheenX, y: sheenY, opacity: sheenOpacity }}
          className="pointer-events-none absolute left-1/4 top-1/4 size-1/2 rounded-full bg-surface blur-3xl dark:bg-line-strong"
        />
      </motion.div>
    </div>
  );
}

/** A piece of the card lifted towards the viewer by `depth` px. */
export function TiltLayer({ depth = 24, children, className }: { depth?: number; children: ReactNode; className?: string }) {
  return (
    <div className={className} style={{ transform: `translateZ(${depth}px)`, transformStyle: "preserve-3d" }}>
      {children}
    </div>
  );
}
