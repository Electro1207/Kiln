import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { AnimatePresence, animate, motion, useInView, useMotionValue, useReducedMotion } from "motion/react";
import { cn } from "../../cn";
import { useControllable } from "../../controllable";
import { easeOut, fade } from "../../motion";

/** Text used by FeatureTabs. Pass a partial via `labels` to translate or reword. */
export interface FeatureTabsLabels {
  /** aria-label of the tab list. */
  features: string;
}
export const featureTabsLabels: FeatureTabsLabels = { features: "Features" };

export type Feature = { id: string; title: string; body: string; media: ReactNode };

export type FeatureTabsProps = {
  features: Feature[];
  /** Controlled index of the chosen feature. Leave out to let the tabs keep their own. */
  value?: number;
  /** Where the uncontrolled tabs start. Default 0. */
  defaultValue?: number;
  /** Called with the new index, whether picked or auto-advanced, controlled or not. */
  onChange?: (index: number) => void;
  /** Seconds each feature stays before the next one. 0 turns auto-advance off. */
  interval?: number;
  /** Override any UI text. Merged over `featureTabsLabels`. */
  labels?: Partial<FeatureTabsLabels>;
  className?: string;
};

/**
 * A list of features beside one picture panel. The panel cross-fades to the
 * chosen feature; it advances on its own, with a progress bar that pauses
 * while the pointer or focus is inside, and stops for good once someone picks.
 */
export function FeatureTabs({ features, value, defaultValue = 0, onChange, interval = 6, labels, className }: FeatureTabsProps) {
  const l = { ...featureTabsLabels, ...labels };
  const id = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useControllable(value, defaultValue, onChange);
  const [paused, setPaused] = useState(false);
  const [manual, setManual] = useState(false);
  const reduce = useReducedMotion();
  const inView = useInView(rootRef, { amount: 0.3 });
  const progress = useMotionValue(0);
  const auto = interval > 0 && !manual && !reduce;

  useEffect(() => {
    if (!auto || paused || !inView) return;
    const left = (1 - progress.get()) * interval;
    const ctl = animate(progress, 1, {
      duration: left,
      ease: "linear",
      onComplete: () => {
        progress.set(0);
        setActive((a) => (a + 1) % features.length);
      },
    });
    return () => ctl.stop();
  }, [auto, paused, inView, active, interval, features.length, progress, setActive]);

  const pick = (i: number) => {
    setManual(true);
    progress.set(0);
    setActive(i);
  };

  const onKey = (e: KeyboardEvent) => {
    const d = e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : e.key === "ArrowUp" || e.key === "ArrowLeft" ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    const n = (active + d + features.length) % features.length;
    pick(n);
    rootRef.current?.querySelector<HTMLElement>(`[data-feature="${n}"]`)?.focus();
  };

  return (
    <div
      ref={rootRef}
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(e) => !rootRef.current?.contains(e.relatedTarget as Node) && setPaused(false)}
      className={cn("@container w-full", className)}
    >
      <div className="grid gap-6 @3xl:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] @3xl:gap-10">
        <div role="tablist" aria-orientation="vertical" aria-label={l.features} onKeyDown={onKey} className="order-2 flex flex-col gap-1 @3xl:order-1">
          {features.map((f, i) => {
            const on = i === active;
            return (
              <button
                key={f.id}
                type="button"
                role="tab"
                data-feature={i}
                id={`${id}-t-${i}`}
                aria-selected={on}
                aria-controls={`${id}-p`}
                tabIndex={on ? 0 : -1}
                onClick={() => pick(i)}
                className="relative rounded-card px-4 py-3.5 text-left outline-offset-[-2px]"
              >
                <motion.span
                  aria-hidden
                  initial={false}
                  animate={{ opacity: on ? 1 : 0 }}
                  transition={fade}
                  className="pointer-events-none absolute inset-0 rounded-card bg-surface"
                />
                <span className="relative z-[1] block">
                  <span className={cn("block text-[15px] font-medium transition-colors duration-200", on ? "text-ink" : "text-muted")}>{f.title}</span>
                  <span className={cn("mt-1 block text-sm leading-relaxed transition-colors duration-200", on ? "text-ink" : "text-muted")}>{f.body}</span>
                  <span aria-hidden className="mt-3 block h-0.5 overflow-hidden rounded-full bg-active">
                    {on && auto ? (
                      <motion.span className="block h-full origin-left bg-accent" style={{ scaleX: progress }} />
                    ) : (
                      <motion.span initial={false} animate={{ opacity: on ? 1 : 0 }} transition={fade} className="block h-full bg-accent" />
                    )}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
        <div
          id={`${id}-p`}
          role="tabpanel"
          aria-labelledby={`${id}-t-${active}`}
          className="order-1 grid overflow-hidden rounded-sheet bg-surface @3xl:order-2 [&>*]:[grid-area:1/1]"
        >
          <AnimatePresence initial={false}>
            <motion.div
              key={features[active].id}
              initial={{ opacity: 0, scale: 1.015 }}
              animate={{ opacity: 1, scale: 1, transition: { opacity: { duration: 0.35, ease: easeOut }, scale: { duration: 0.6, ease: easeOut } } }}
              exit={{ opacity: 0, transition: { duration: 0.25, ease: easeOut } }}
              className="min-w-0"
            >
              {features[active].media}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
