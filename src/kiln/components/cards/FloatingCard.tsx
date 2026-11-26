import { useRef, type ReactNode, type RefObject } from "react";
import { motion, useMotionTemplate, useMotionValue, useScroll, useSpring, useTransform } from "motion/react";
import { cn } from "../../cn";
import { springSoft } from "../../motion";
import { useA11yProps, type AccessibilityFeaturesProp } from "../../a11y";
import { useLoop } from "../shared/useLoop";

export type FloatingCardProps = {
  children: ReactNode;
  /** How far it bobs up and down at rest, in px. 0 keeps it still. Default 10. */
  float?: number;
  /** Seconds for one bob, up and back. Default 6. */
  period?: number;
  /** Most it leans towards the pointer, in degrees. 0 turns the lean off. Default 5. */
  tilt?: number;
  /** How far it drifts against the page while it crosses the screen, in px. Default 0. */
  drift?: number;
  /** The scrolling element for `drift`, when it isn't the page. */
  container?: RefObject<HTMLElement | null>;
  /** Classes for the outer box: size and placement. */
  className?: string;
  /** Classes for the card surface itself. */
  cardClassName?: string;
  /**
   * Accessibility features this component supports on its own, on top of the person's settings and any
   * AccessibilityScope: "all", "none", a profile name, a list of profiles, or single features. Reduced motion and calm hold the card still; the lean and drift stop under reduced motion.
   */
  accessibilityFeatures?: AccessibilityFeaturesProp;
};

/**
 * A card that hangs in the air: it bobs slowly at rest, leans a little towards
 * the pointer with a soft light following it, and can drift against the page as
 * it scrolls by. Each motion is its own layer, so they add up without fighting,
 * and all of them are transforms. The bob runs on the compositor and stops while
 * the card is off screen; with reduced motion the card simply sits still.
 * Anything inside stays fully interactive, a video player included.
 */
export function FloatingCard({ children, float = 10, period = 6, tilt = 5, drift = 0, container, className, cardClassName, accessibilityFeatures }: FloatingCardProps) {
  const root = useRef<HTMLDivElement>(null);
  const bob = useRef<HTMLDivElement>(null);
  const { a11y, rootProps } = useA11yProps(accessibilityFeatures);
  const reduce = a11y.reduceMotion;
  // The bob loops on its own, so calm stops it too. (useLoop reads only the shared settings, so the
  // component's own prop is applied here as well.)
  const hold = reduce || a11y.calm;

  useLoop(
    root,
    () => {
      const el = bob.current;
      if (!el || !float || hold) return [];
      return [
        el.animate(
          [
            { transform: "translate3d(0, 0, 0) rotate(0deg)" },
            { transform: `translate3d(0, ${-float}px, 0) rotate(-0.4deg)` },
            { transform: "translate3d(0, 0, 0) rotate(0deg)" },
          ],
          { duration: period * 1000, iterations: Infinity, easing: "ease-in-out" },
        ),
      ];
    },
    [float, period, hold],
  );

  const { scrollYProgress } = useScroll({ target: root, container, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [drift, -drift]);

  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const rx = useSpring(useTransform(py, (v) => -v * tilt * 2), springSoft);
  const ry = useSpring(useTransform(px, (v) => v * tilt * 2), springSoft);
  const lit = useSpring(0, springSoft);
  const lx = useTransform(px, (v) => `${(v + 0.5) * 100}%`);
  const ly = useTransform(py, (v) => `${(v + 0.5) * 100}%`);
  const light = useMotionTemplate`radial-gradient(420px circle at ${lx} ${ly}, color-mix(in oklab, var(--color-ink) 9%, transparent), transparent 70%)`;

  return (
    <motion.div ref={root} {...rootProps} style={{ ...rootProps.style, y }} className={cn("[perspective:1200px]", className)}>
      <div ref={bob} className="will-change-transform">
        <motion.div
          onPointerMove={(e) => {
            if (e.pointerType !== "mouse" || reduce || !tilt) return;
            const r = e.currentTarget.getBoundingClientRect();
            px.set((e.clientX - r.left) / r.width - 0.5);
            py.set((e.clientY - r.top) / r.height - 0.5);
            lit.set(1);
          }}
          onPointerLeave={() => {
            px.set(0);
            py.set(0);
            lit.set(0);
          }}
          style={{ rotateX: rx, rotateY: ry }}
          className={cn("relative overflow-hidden rounded-sheet border border-line bg-surface shadow-float", cardClassName)}
        >
          {children}
          <motion.span aria-hidden style={{ backgroundImage: light, opacity: lit }} className="pointer-events-none absolute inset-0" />
        </motion.div>
      </div>
    </motion.div>
  );
}
