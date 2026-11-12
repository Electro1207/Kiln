import { motion } from "motion/react";
import type { ReactNode } from "react";
import { Check } from "lucide-react";
import { cn } from "../../cn";
import { fade, springFirm } from "../../motion";

/** Text used by MultiStepLoader. Pass a partial via `labels` to translate or reword. */
export interface MultiStepLoaderLabels {
  /** aria-label of the step list. */
  progress: string;
}
export const multiStepLoaderLabels: MultiStepLoaderLabels = { progress: "Progress" };

/** Icons used by MultiStepLoader. Pass a partial via `icons` to replace them. */
export interface MultiStepLoaderIcons {
  /** Mark on a finished step. */
  check: ReactNode;
  /** Mark on the step in progress; it turns while active. */
  spinner: ReactNode;
}
export const multiStepLoaderIcons: MultiStepLoaderIcons = {
  check: <Check />,
  spinner: (
    <svg viewBox="0 0 20 20">
      <circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" strokeOpacity="0.2" strokeWidth="2" />
      <path d="M18 10a8 8 0 0 0-8-8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
};

export type MultiStepLoaderProps = {
  steps: string[];
  /** Index of the step in progress; steps before it are done. steps.length means all done. */
  current: number;
  className?: string;
  /** Override any UI text. Merged over `multiStepLoaderLabels`. */
  labels?: Partial<MultiStepLoaderLabels>;
  /** Replace any built-in icon. Merged over `multiStepLoaderIcons`. */
  icons?: Partial<MultiStepLoaderIcons>;
};

/**
 * A checklist that completes itself: each step's mark turns from waiting to
 * working to done, and a line fills down the list as it goes. Marks fade
 * between states in one cell; only the line moves.
 */
export function MultiStepLoader({ steps, current, className, labels, icons }: MultiStepLoaderProps) {
  const l = { ...multiStepLoaderLabels, ...labels };
  const ic = { ...multiStepLoaderIcons, ...icons };
  const n = steps.length;
  const fill = n > 1 ? Math.min(Math.max(current, 0), n - 1) / (n - 1) : 1;
  const ROW = 40;

  return (
    <ol className={cn("relative", className)} aria-label={l.progress}>
      <span aria-hidden className="absolute left-[9px] w-0.5 rounded-full bg-line" style={{ top: ROW / 2, height: (n - 1) * ROW }} />
      <motion.span
        aria-hidden
        className="absolute left-[9px] w-0.5 origin-top rounded-full bg-accent"
        style={{ top: ROW / 2, height: (n - 1) * ROW }}
        initial={false}
        animate={{ scaleY: fill }}
        transition={springFirm}
      />
      {steps.map((label, i) => {
        const state = i < current ? "done" : i === current ? "active" : "waiting";
        return (
          <li key={label} className="relative flex items-center gap-3" style={{ height: ROW }} aria-current={state === "active" ? "step" : undefined}>
            <span className="relative grid size-5 shrink-0 place-items-center [&>*]:[grid-area:1/1]">
              <motion.span
                initial={false}
                animate={{ opacity: state === "waiting" ? 1 : 0 }}
                transition={fade}
                className="size-5 rounded-full border-2 border-line-strong bg-surface"
              />
              <motion.span initial={false} animate={{ opacity: state === "active" ? 1 : 0 }} transition={fade} className="grid size-5 place-items-center rounded-full bg-surface">
                <span className={cn("grid size-5 place-items-center text-accent [&>svg]:size-5", state === "active" && "animate-spin")} aria-hidden>{ic.spinner}</span>
              </motion.span>
              <motion.span
                initial={false}
                animate={{ opacity: state === "done" ? 1 : 0 }}
                transition={fade}
                className="grid size-5 place-items-center rounded-full bg-btn-primary text-btn-primary-ink [&>svg]:size-3 [&>svg]:[stroke-width:3]"
              >
                {ic.check}
              </motion.span>
            </span>
            <span className={cn("text-sm leading-5 transition-colors duration-300", state === "waiting" ? "text-faint" : state === "active" ? "text-ink" : "text-muted")}>
              {label}
              <span className="sr-only">{state === "done" ? ", done" : state === "active" ? ", in progress" : ""}</span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}
