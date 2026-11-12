import { useRef, useState, type ReactNode } from "react";
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import { cn } from "../../cn";

export type RevealStep = {
  title: string;
  body: ReactNode;
  /** A live component (or anything else) to pin. Ignored when `image` is set. */
  panel?: ReactNode;
  /** A picture to pin; it fills the frame. */
  image?: { src: string; alt: string };
  /** Small label above the title, e.g. "Lid". */
  eyebrow?: string;
};

/** Text used by StickyScrollReveal. Pass a partial via `labels` to translate or reword. */
export interface StickyScrollRevealLabels {
  /** aria-label of the scrolling region. */
  story: string;
  /** aria-label of a progress tick, given the step title. */
  goTo: (title: string) => string;
}
export const stickyScrollRevealLabels: StickyScrollRevealLabels = { story: "Scrolling story", goTo: (title) => `Go to ${title}` };

export type StickyScrollRevealProps = {
  steps: RevealStep[];
  /** Height of the scrolling area, px. */
  height?: number;
  className?: string;
  /** Override any UI text. Merged over `stickyScrollRevealLabels`. */
  labels?: Partial<StickyScrollRevealLabels>;
};

/** Height of the pinned visual when the layout is stacked on a phone, px. */
const PHONE_VISUAL = 188;

/**
 * Words scroll past a visual that stays put. The scroll position becomes one
 * motion value, `s`, where each whole number is a step centred in view; the
 * text and the pinned layers read it directly, so scrolling never re-renders
 * React. Only the step counter changes state, once per step. On a phone the
 * visual pins above the text instead of beside it.
 */
export function StickyScrollReveal({ steps, height = 480, className, labels }: StickyScrollRevealProps) {
  const l = { ...stickyScrollRevealLabels, ...labels };
  const scroller = useRef<HTMLDivElement>(null);
  const reduce = !!useReducedMotion();
  const [active, setActive] = useState(0);
  const n = steps.length;

  const { scrollYProgress } = useScroll({ container: scroller });
  const s = useTransform(scrollYProgress, (p) => p * Math.max(n - 1, 0));
  useMotionValueEvent(s, "change", (v) => setActive(Math.min(n - 1, Math.max(0, Math.round(v)))));

  const goTo = (i: number) => {
    const el = scroller.current;
    if (!el) return;
    const top = n > 1 ? (i * (el.scrollHeight - el.clientHeight)) / (n - 1) : 0;
    el.scrollTo({ top, behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <div
      ref={scroller}
      tabIndex={0}
      aria-label={l.story}
      className={cn(
        "overflow-y-auto overscroll-contain rounded-card border border-line bg-surface [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        className,
      )}
      style={{ height, ["--h" as string]: `${height}px`, ["--vis" as string]: `${PHONE_VISUAL}px` }}
    >
      <div className="grid md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <div className="sticky top-0 z-10 flex h-[var(--vis)] flex-col gap-2 bg-surface p-3 md:order-2 md:h-[var(--h)] md:gap-3 md:self-start md:bg-transparent md:p-5">
          <div className="relative min-h-0 flex-1 overflow-hidden rounded-card bg-raised">
            {steps.map((st, i) => (
              <Layer key={st.title} s={s} i={i} reduce={reduce} hidden={i !== active}>
                {st.image ? (
                  <img src={st.image.src} alt={st.image.alt} draggable={false} className="size-full object-cover" />
                ) : (
                  <div className="grid size-full place-items-center">{st.panel}</div>
                )}
              </Layer>
            ))}
          </div>
          <div className="flex h-5 items-center gap-3">
            <span className="w-12 shrink-0 text-xs text-muted tabular" aria-live="polite">
              <span className="text-ink">{String(active + 1).padStart(2, "0")}</span> / {String(n).padStart(2, "0")}
            </span>
            <div className="flex flex-1 gap-1.5">
              {steps.map((st, i) => (
                <Tick key={st.title} s={s} i={i} label={l.goTo(st.title)} onPick={() => goTo(i)} />
              ))}
            </div>
          </div>
        </div>

        <div className="md:order-1">
          {steps.map((st, i) => (
            <Step key={st.title} s={s} i={i} reduce={reduce} step={st} />
          ))}
        </div>
      </div>
    </div>
  );
}

/** One pinned layer. Cross-fades with its neighbours and drifts a few pixels. */
function Layer({ s, i, reduce, hidden, children }: { s: MotionValue<number>; i: number; reduce: boolean; hidden: boolean; children: ReactNode }) {
  const opacity = useTransform(s, [i - 0.5, i - 0.15, i + 0.15, i + 0.5], [0, 1, 1, 0]);
  const y = useTransform(s, [i - 1, i, i + 1], reduce ? [0, 0, 0] : [28, 0, -28]);
  const scale = useTransform(s, [i - 1, i, i + 1], reduce ? [1, 1, 1] : [1.08, 1, 1.03]);
  return (
    <motion.div aria-hidden={hidden} className="absolute inset-0 will-change-transform" style={{ opacity, y, scale }}>
      {children}
    </motion.div>
  );
}

/** One step's words. Full ink at the centre of the view, quiet either side. */
function Step({ s, i, reduce, step }: { s: MotionValue<number>; i: number; reduce: boolean; step: RevealStep }) {
  const opacity = useTransform(s, [i - 0.7, i, i + 0.7], [0.18, 1, 0.18]);
  const y = useTransform(s, [i - 1, i, i + 1], reduce ? [0, 0, 0] : [20, 0, -20]);
  return (
    <section className="flex h-[calc(var(--h)-var(--vis))] flex-col justify-center px-5 md:h-[var(--h)] md:px-8">
      <motion.div style={{ opacity, y }} className="max-w-md">
        {step.eyebrow && <p className="text-xs font-medium text-accent">{step.eyebrow}</p>}
        <h3 className="mt-1.5 text-xl font-semibold leading-tight tracking-[-0.015em] text-ink md:text-3xl">{step.title}</h3>
        <div className="mt-2 text-sm leading-6 text-muted md:mt-3 md:text-base md:leading-7">{step.body}</div>
      </motion.div>
    </section>
  );
}

/** A segment of the progress rail. It fades in as its step arrives and out as it leaves. */
function Tick({ s, i, label, onPick }: { s: MotionValue<number>; i: number; label: string; onPick: () => void }) {
  const opacity = useTransform(s, [i - 0.6, i, i + 0.6], [0.18, 1, 0.18]);
  return (
    <button type="button" aria-label={label} onClick={onPick} className="group flex h-5 flex-1 items-center outline-none">
      <motion.span style={{ opacity }} className="block h-0.5 w-full rounded-full bg-ink group-focus-visible:h-1" />
    </button>
  );
}
