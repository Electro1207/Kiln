import { useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { motion, useAnimationFrame, useInView, useMotionValue } from "motion/react";
import { Pause, Play } from "lucide-react";
import { cn } from "../../cn";
import { useA11yProps, type AccessibilityFeaturesProp } from "../../a11y";

/** Text used by Marquee. Pass a partial via `labels` to translate or reword. */
export interface MarqueeLabels {
  /** aria-label of the pause button (shown while the row moves). */
  pause: string;
  /** aria-label of the play button (shown while it is paused). */
  play: string;
}
export const marqueeLabels: MarqueeLabels = { pause: "Pause scrolling", play: "Resume scrolling" };

/** Icons used by Marquee. Pass a partial via `icons` to swap any of them. */
export interface MarqueeIcons {
  /** Pause button. */
  pause: ReactNode;
  /** Play button. */
  play: ReactNode;
}
export const marqueeIcons: MarqueeIcons = { pause: <Pause />, play: <Play /> };

export type MarqueeProps = {
  children: ReactNode;
  /** Pixels per second. Negative runs the other way. */
  speed?: number;
  gap?: number;
  /** Ease to a stop while the pointer is over it. */
  pauseOnHover?: boolean;
  label?: string;
  className?: string;
  /** Override any UI text. Merged over `marqueeLabels`. */
  labels?: Partial<MarqueeLabels>;
  /** Replace any built-in icon. Merged over `marqueeIcons`. */
  icons?: Partial<MarqueeIcons>;
  /**
   * Accessibility features to add here. `calm` or `reduceMotion` turn the row into a static,
   * scrollable one; `screenReaderHints` keeps the pause button always visible. Adds to the
   * person's own settings, never removes them.
   */
  accessibilityFeatures?: AccessibilityFeaturesProp;
};

/**
 * An endless row. Content is drawn twice and wrapped by its own width, so the
 * loop has no seam; hovering eases the speed down rather than stopping dead.
 * A pause button (WCAG 2.2.2) fades in on hover or focus, and is always shown
 * with `screenReaderHints`.
 */
export function Marquee({ children, speed = 40, gap = 40, pauseOnHover = true, label, className, labels, icons, accessibilityFeatures }: MarqueeProps) {
  const l = { ...marqueeLabels, ...labels };
  const ic = useMemo(() => ({ ...marqueeIcons, ...icons }), [icons]);
  const { a11y, rootProps } = useA11yProps(accessibilityFeatures);
  const root = useRef<HTMLDivElement>(null);
  const first = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(0);
  const [paused, setPaused] = useState(false);
  const x = useMotionValue(0);
  const current = useRef(speed);
  const target = useRef(speed);
  const holding = useRef(false);
  const still = a11y.reduceMotion || a11y.calm;
  const visible = useInView(root);

  const aim = (hold?: boolean, p = paused) => {
    if (hold !== undefined) holding.current = hold;
    target.current = p || holding.current ? 0 : speed;
  };

  useLayoutEffect(() => {
    const el = first.current;
    if (!el || still) return;
    const ro = new ResizeObserver(() => setW(el.getBoundingClientRect().width + gap));
    ro.observe(el);
    return () => ro.disconnect();
  }, [gap, still]);

  useAnimationFrame((_, delta) => {
    if (!w || still || !visible) return;
    const dt = Math.min(delta, 64) / 1000;
    current.current += (target.current - current.current) * Math.min(1, dt * 5);
    let next = x.get() - current.current * dt;
    if (next <= -w) next += w;
    if (next > 0) next -= w;
    x.set(next);
  });

  const toggle = () => {
    const p = !paused;
    setPaused(p);
    // Pressing play is an explicit "go": it wins over the pointer still resting on the row.
    aim(p ? undefined : false, p);
  };

  return (
    <div
      ref={root}
      {...rootProps}
      className={cn("group/marquee relative w-full", still ? "overflow-x-auto" : "overflow-hidden", className)}
      role="marquee"
      aria-label={label}
      tabIndex={still ? 0 : undefined}
      onPointerEnter={() => pauseOnHover && aim(true)}
      onPointerLeave={() => aim(false)}
      onFocus={() => aim(true)}
      onBlur={() => aim(false)}
    >
      {still ? (
        <div className="flex w-max items-center" style={{ gap }}>
          {children}
        </div>
      ) : (
        <>
          <motion.div className="flex w-max" style={{ x, gap }}>
            <div ref={first} className="flex shrink-0 items-center" style={{ gap }}>
              {children}
            </div>
            <div className="flex shrink-0 items-center" style={{ gap }} aria-hidden>
              {children}
            </div>
          </motion.div>
          {/* Its own layer: fades in over the row, never moves it. */}
          <button
            type="button"
            aria-label={paused ? l.play : l.pause}
            aria-pressed={paused}
            onClick={toggle}
            className={cn(
              "absolute right-2 top-1/2 z-10 grid size-8 -translate-y-1/2 place-items-center rounded-full border border-line-strong bg-surface text-ink shadow-float",
              "transition-opacity duration-200 hover:bg-raised [&>svg]:size-4",
              a11y.screenReaderHints
                ? "opacity-100"
                : "opacity-0 focus-visible:opacity-100 group-focus-within/marquee:opacity-100 group-hover/marquee:opacity-100",
            )}
          >
            {paused ? ic.play : ic.pause}
          </button>
        </>
      )}
    </div>
  );
}
