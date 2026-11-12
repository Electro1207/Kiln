import { useLayoutEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "../../cn";
import { easeOut, springFirm, springSoft } from "../../motion";
import { Button } from "../buttons/Button";

/** Text used by OnboardingWizard. Pass a partial via `labels` to translate or reword. */
export interface OnboardingWizardLabels {
  /** Heading of the last screen after finishing. */
  allSet: string;
  /** Heading of the summary screen. */
  summaryTitle: string;
  /** Description under the summary heading. */
  summaryDescription: string;
  /** Progress text when finished. */
  done: string;
  /** "Step 2 of 4" text. */
  stepOf: (step: number, total: number) => string;
  /** Right side of the progress row on the summary screen. */
  summary: string;
  /** "Next: Title" hint. */
  next: (title: string) => string;
  /** Hint when the summary comes next. */
  nextSummary: string;
  /** aria-label of the progress bar. */
  progress: string;
  /** Back button. */
  back: string;
  /** Continue button. */
  continue: string;
}
export const onboardingWizardLabels: OnboardingWizardLabels = {
  allSet: "All set",
  summaryTitle: "Check and finish",
  summaryDescription: "Everything you entered. Change anything before you finish.",
  done: "Done",
  stepOf: (s, t) => `Step ${s} of ${t}`,
  summary: "Summary",
  next: (t) => `Next: ${t}`,
  nextSummary: "Next: Summary",
  progress: "Progress",
  back: "Back",
  continue: "Continue",
};

export type WizardStep<V> = {
  id: string;
  title: string;
  description?: string;
  /** Draw the step. `errors` holds the messages from `validate`, shown after a failed Next. */
  render: (ctx: { values: V; set: (patch: Partial<V>) => void; errors: Partial<Record<keyof V, string>> }) => ReactNode;
  /** Return messages for fields that are not ready. Empty means the step may continue. */
  validate?: (values: V) => Partial<Record<keyof V, string>>;
};

export type OnboardingWizardProps<V> = {
  steps: WizardStep<V>[];
  initial: V;
  /** The last screen: everything entered, with links back to each step. */
  summary: (values: V, goTo: (i: number) => void) => ReactNode;
  onFinish: (values: V) => Promise<void> | void;
  finishLabel?: string;
  /** Override any UI text. Merged over `onboardingWizardLabels`. */
  labels?: Partial<OnboardingWizardLabels>;
  className?: string;
};

/**
 * A short multi-step setup. Each step checks itself before moving on, Back
 * keeps what was entered, and the last screen sums everything up with links
 * back to each step. Steps slide in from the side you are heading to.
 */
export function OnboardingWizard<V extends Record<string, unknown>>({
  steps, initial, summary, onFinish, finishLabel = "Finish", labels, className,
}: OnboardingWizardProps<V>) {
  const l = { ...onboardingWizardLabels, ...labels };
  const [values, setValues] = useState<V>(initial);
  const [at, setAt] = useState(0);
  const [dir, setDir] = useState(1);
  const [errors, setErrors] = useState<Partial<Record<keyof V, string>>>({});
  const [busy, setBusy] = useState(false);
  const [finished, setFinished] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const total = steps.length + 1;
  const onSummary = at === steps.length;

  const go = (i: number) => {
    setDir(i > at ? 1 : -1);
    setErrors({});
    setAt(i);
    requestAnimationFrame(() => headingRef.current?.focus({ preventScroll: true }));
  };

  const next = async (e?: FormEvent) => {
    e?.preventDefault();
    if (onSummary) {
      setBusy(true);
      try {
        await onFinish(values);
        setFinished(true);
      } finally {
        setBusy(false);
      }
      return;
    }
    const errs = steps[at].validate?.(values) ?? {};
    if (Object.values(errs).some(Boolean)) {
      setErrors(errs);
      return;
    }
    go(at + 1);
  };

  const [h, setH] = useState<number | "auto">("auto");
  useLayoutEffect(() => {
    const el = panelRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setH(el.offsetHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, [at, finished]);

  const title = finished ? l.allSet : onSummary ? l.summaryTitle : steps[at].title;
  const description = finished ? undefined : onSummary ? l.summaryDescription : steps[at].description;

  return (
    <form noValidate onSubmit={next} className={cn("@container w-full rounded-sheet bg-surface p-5 @xl:p-8", className)}>
      <div className="flex items-center justify-between gap-4 text-[13px] text-muted">
        <span className="tabular">{finished ? l.done : l.stepOf(at + 1, total)}</span>
        <span className="truncate">{finished ? "" : onSummary ? l.summary : steps[at + 1]?.title ? l.next(steps[at + 1].title) : l.nextSummary}</span>
      </div>
      <div className="mt-2 h-1 overflow-hidden rounded-full bg-active" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={finished ? total : at + 1} aria-label={l.progress}>
        <motion.div className="h-full origin-left rounded-full bg-btn-primary" initial={false} animate={{ scaleX: finished ? 1 : (at + 1) / total }} transition={springFirm} />
      </div>

      <motion.div initial={false} animate={{ height: h }} transition={springSoft} className="relative mt-6 overflow-hidden">
        <AnimatePresence initial={false} mode="popLayout" custom={dir}>
          <motion.div
            key={finished ? "done" : at}
            ref={panelRef}
            custom={dir}
            variants={{
              enter: (d: number) => ({ opacity: 0, x: d * 24 }),
              center: { opacity: 1, x: 0, transition: { x: springSoft, opacity: { duration: 0.22, delay: 0.08, ease: easeOut } } },
              exit: (d: number) => ({ opacity: 0, x: d * -24, transition: { duration: 0.12 } }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            className="w-full"
          >
            <h3 ref={headingRef} tabIndex={-1} className="text-xl font-semibold tracking-[-0.02em] text-ink outline-none">{title}</h3>
            {description && <p className="mt-1.5 text-sm text-ink">{description}</p>}
            <div className="mt-5">
              {finished ? null : onSummary ? summary(values, go) : steps[at].render({ values, set: (p) => setValues((v) => ({ ...v, ...p })), errors })}
            </div>
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {!finished && (
        <div className="mt-8 flex items-center justify-between gap-3">
          <Button type="button" variant="ghost" disabled={at === 0} onClick={() => go(at - 1)}>
            {l.back}
          </Button>
          <Button type="submit" loading={busy}>
            {onSummary ? finishLabel : l.continue}
          </Button>
        </div>
      )}
    </form>
  );
}
