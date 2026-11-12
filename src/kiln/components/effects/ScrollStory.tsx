import { useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from "react";
import { motion, useMotionValueEvent, useScroll, useTransform, type MotionValue } from "motion/react";
import { cn } from "../../cn";
import { usePrefersReducedMotion } from "../shared/useLoop";

export type ScrollStoryStep = {
  id: string;
  /** Small label above the title, e.g. "01" or "Why". */
  eyebrow?: ReactNode;
  title: ReactNode;
  body?: ReactNode;
  /** What the pinned panel shows while this step is read: a live component, a picture, a figure. */
  visual: ReactNode;
};

/** Text used by ScrollStory. Pass a partial via `labels` to translate or reword. */
export interface ScrollStoryLabels {
  /** aria-label of the step rail. */
  steps: string;
  /** aria-label of a rail button, given the step number and count. */
  goTo: (step: number, count: number) => string;
}
export const scrollStoryLabels: ScrollStoryLabels = { steps: "Steps", goTo: (step, count) => `Go to step ${step} of ${count}` };

export type ScrollStoryProps = {
  steps: ScrollStoryStep[];
  /** Distance from the top of the screen at which the panel pins, px; the height of a fixed header. Default 0. */
  stickyTop?: number;
  /**
   * Steps already read stay in full ink, so the column fills up as you go.
   * Set false to dim them again once they pass. Default true.
   */
  keepRead?: boolean;
  /** Called once each time a different step becomes the one being read. */
  onStepChange?: (index: number) => void;
  /**
   * The scrolling element, when it isn't the page. Also set the CSS variable
   * `--story-vh` on `className` to that element's height (for example
   * `[--story-vh:520px]`) so steps and the panel size to it instead of the screen.
   */
  container?: RefObject<HTMLElement | null>;
  className?: string;
  /** Class for the pinned panel's frame. */
  panelClassName?: string;
  /** Override any UI text. Merged over `scrollStoryLabels`. */
  labels?: Partial<ScrollStoryLabels>;
};

/**
 * A page-length story: the words scroll in normal flow while a panel beside them
 * stays pinned and changes with the step being read. It never takes over the
 * scroll; the page moves exactly as fast as the wheel. The position is one motion
 * value, so frames cost no React renders; only the current step changes state.
 * Below 768px the panel sits inline above each step's words instead of pinning.
 */
export function ScrollStory({
  steps, stickyTop = 0, keepRead = true, onStepChange, container, className, panelClassName, labels,
}: ScrollStoryProps) {
  const l = useMemo(() => ({ ...scrollStoryLabels, ...labels }), [labels]);
  const track = useRef<HTMLDivElement>(null);
  const reduce = usePrefersReducedMotion();
  const wide = useWide();
  const n = steps.length;
  const [active, setActive] = useState(0);
  const { scrollYProgress } = useScroll({ target: track, container, offset: ["start center", "end center"] });
  const s = useTransform(scrollYProgress, (p) => p * n - 0.5);
  const last = useRef(0);
  useMotionValueEvent(s, "change", (v) => {
    const i = Math.min(n - 1, Math.max(0, Math.round(v)));
    if (i === last.current) return;
    last.current = i;
    setActive(i);
    onStepChange?.(i);
  });

  const goTo = (i: number) =>
    track.current?.children[i]?.scrollIntoView({ block: "center", behavior: reduce ? "auto" : "smooth" });

  return (
    <div className={cn("grid gap-x-12 md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]", className)}>
      <div ref={track}>
        {steps.map((st, i) => (
          <Step key={st.id} s={s} i={i} reduce={reduce} keepRead={keepRead} step={st} inline={!wide} panelClassName={panelClassName} />
        ))}
      </div>

      {wide && (
        <div>
          <div className="sticky flex flex-col justify-center gap-4 py-8" style={{ top: stickyTop, height: `calc(var(--story-vh, 100vh) - ${stickyTop}px)` }}>
            <div className={cn("relative min-h-0 flex-1 overflow-hidden rounded-card bg-raised", panelClassName)}>
              {steps.map((st, i) => (
                <Layer key={st.id} s={s} i={i} n={n} reduce={reduce} on={i === active}>
                  {st.visual}
                </Layer>
              ))}
            </div>
            <div role="group" aria-label={l.steps} className="flex items-center gap-3">
              <span className="w-14 shrink-0 text-xs text-muted tabular" aria-live="polite">
                <span className="text-ink">{String(active + 1).padStart(2, "0")}</span> / {String(n).padStart(2, "0")}
              </span>
              <div className="flex flex-1 gap-1.5">
                {steps.map((st, i) => (
                  <Tick key={st.id} s={s} i={i} label={l.goTo(i + 1, n)} current={i === active} onPick={() => goTo(i)} />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function useWide() {
  const q = "(min-width: 768px)";
  const [wide, setWide] = useState(() => typeof window === "undefined" || window.matchMedia(q).matches);
  useEffect(() => {
    const mq = window.matchMedia(q);
    const on = () => setWide(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return wide;
}

/** One pinned layer: cross-fades with its neighbours and drifts a little, so the swap reads as depth. */
function Layer({ s, i, n, reduce, on, children }: { s: MotionValue<number>; i: number; n: number; reduce: boolean; on: boolean; children: ReactNode }) {
  const inR = i === 0 ? [-2, -1] : [i - 0.5, i - 0.2];
  const outR = i === n - 1 ? [n + 1, n + 2] : [i + 0.2, i + 0.5];
  const opacity = useTransform(s, [inR[0], inR[1], outR[0], outR[1]], [i === 0 ? 1 : 0, 1, 1, i === n - 1 ? 1 : 0]);
  const y = useTransform(s, [i - 1, i, i + 1], reduce ? [0, 0, 0] : [36, 0, -36]);
  const scale = useTransform(s, [i - 1, i, i + 1], reduce ? [1, 1, 1] : [0.97, 1, 0.985]);
  return (
    <motion.div
      aria-hidden={!on}
      inert={!on}
      style={{ opacity, y, scale }}
      className={cn("absolute inset-0 will-change-transform", !on && "pointer-events-none")}
    >
      {children}
    </motion.div>
  );
}

function Step({
  s, i, reduce, keepRead, step, inline, panelClassName,
}: { s: MotionValue<number>; i: number; reduce: boolean; keepRead: boolean; step: ScrollStoryStep; inline: boolean; panelClassName?: string }) {
  const opacity = useTransform(s, [i - 0.6, i, i + 0.6], reduce ? [1, 1, 1] : [0.22, 1, keepRead ? 1 : 0.22]);
  const y = useTransform(s, [i - 1, i], reduce ? [0, 0] : [24, 0]);
  return (
    <section className="flex flex-col justify-center py-10 md:min-h-[calc(var(--story-vh,100vh)*0.78)] md:py-16">
      {inline && <div className={cn("relative mb-6 overflow-hidden rounded-card bg-raised", panelClassName)}>{step.visual}</div>}
      <motion.div style={inline ? undefined : { opacity, y }} className="max-w-xl">
        {step.eyebrow && <p className="text-sm font-medium text-accent">{step.eyebrow}</p>}
        <h3 className="mt-2 text-2xl font-semibold leading-tight tracking-[-0.015em] text-ink md:text-3xl">{step.title}</h3>
        {step.body && <div className="mt-3 text-base leading-7 text-muted md:text-[17px] md:leading-8">{step.body}</div>}
      </motion.div>
    </section>
  );
}

function Tick({ s, i, label, current, onPick }: { s: MotionValue<number>; i: number; label: string; current: boolean; onPick: () => void }) {
  const opacity = useTransform(s, [i - 0.6, i, i + 0.6], [0.2, 1, 0.2]);
  return (
    <button type="button" aria-label={label} aria-current={current ? "step" : undefined} onClick={onPick} className="group flex h-6 flex-1 items-center rounded-sm outline-offset-2">
      <motion.span style={{ opacity }} className="block h-0.5 w-full rounded-full bg-ink origin-center transition-transform duration-200 group-hover:scale-y-200 group-focus-visible:scale-y-200" />
    </button>
  );
}
