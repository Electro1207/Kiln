import { Fragment } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check } from "lucide-react";
import { cn } from "../../cn";
import { fade, springSnappy, springSoft } from "../../motion";

export type Step = { label: string; description?: string };

/** Text used by Stepper. Pass a partial via `labels` to translate or reword. */
export interface StepperLabels {
  /** aria-label of a step's dot, e.g. "Step 2: Shipping, done". */
  step: (index: number, label: string, done: boolean) => string;
}
export const stepperLabels: StepperLabels = { step: (i, label, done) => `Step ${i}: ${label}${done ? ", done" : ""}` };

export type StepperProps = {
  steps: Step[];
  /** Index of the step in progress. steps.length means all done. */
  current: number;
  /** Lets people go back to a finished step. */
  onStepClick?: (index: number) => void;
  orientation?: "horizontal" | "vertical";
  className?: string;
  /** Override any UI text. Merged over `stepperLabels`. */
  labels?: Partial<StepperLabels>;
};

function Dot({ index, state }: { index: number; state: "done" | "current" | "todo" }) {
  return (
    <span className="relative grid size-8 shrink-0 place-items-center [&>*]:[grid-area:1/1]">
      <span
        className={cn(
          "size-8 rounded-full transition-colors duration-300 ease-out-soft",
          state === "done" ? "bg-btn-primary" : state === "current" ? "bg-accent-soft" : "bg-active",
        )}
      />
      <AnimatePresence initial={false}>
        {state === "current" && (
          <motion.span
            key="ring"
            aria-hidden
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={fade}
            className="pointer-events-none absolute -inset-1 rounded-full border-2 border-accent"
          />
        )}
      </AnimatePresence>
      <AnimatePresence initial={false}>
        {state === "done" ? (
          <motion.span
            key="tick"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ opacity: fade, scale: springSnappy }}
            className="grid place-items-center text-btn-primary-ink"
          >
            <Check className="size-4" strokeWidth={3} />
          </motion.span>
        ) : (
          <motion.span
            key="n"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={fade}
            className={cn("grid place-items-center text-[13px] font-medium tabular transition-colors duration-300", state === "current" ? "text-ink" : "text-muted")}
          >
            {index + 1}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}

/** A progress indicator for multi-step flows, horizontal or vertical. Pass `onStepClick` to let people go back. */
export function Stepper({ steps, current, onStepClick, orientation = "horizontal", className, labels }: StepperProps) {
  const l = { ...stepperLabels, ...labels };
  const vertical = orientation === "vertical";
  return (
    <ol className={cn("flex w-full", vertical ? "flex-col" : "items-start", className)}>
      {steps.map((s, i) => {
        const state = i < current ? "done" : i === current ? "current" : "todo";
        const clickable = !!onStepClick && i < current;
        const Head = clickable ? "button" : "div";
        return (
          <Fragment key={s.label}>
            <li className={cn("flex min-w-0", vertical ? "gap-3" : "flex-col items-center text-center", !vertical && "w-0 flex-1")}>
              <div className={cn("flex", vertical ? "flex-col items-center" : "w-full items-center")}>
                {!vertical && <Connector filled={i <= current && i > 0} hidden={i === 0} />}
                <Head
                  {...(clickable ? { type: "button" as const, onClick: () => onStepClick?.(i) } : {})}
                  aria-current={state === "current" ? "step" : undefined}
                  aria-label={l.step(i + 1, s.label, state === "done")}
                  className={cn("rounded-full", clickable && "transition-transform hover:scale-105")}
                >
                  <Dot index={i} state={state} />
                </Head>
                {!vertical && <Connector filled={i < current} hidden={i === steps.length - 1} />}
                {vertical && i < steps.length - 1 && <Connector vertical filled={i < current} />}
              </div>
              <div className={cn("min-w-0", vertical ? "pb-6 pt-1" : "mt-2 px-1")}>
                <p className={cn("truncate text-sm transition-colors duration-300", state === "todo" ? "text-muted" : "font-medium text-ink")}>{s.label}</p>
                {s.description && (
                  <p className={cn("text-xs text-muted", !vertical && "hidden sm:block")}>{s.description}</p>
                )}
              </div>
            </li>
          </Fragment>
        );
      })}
    </ol>
  );
}

function Connector({ filled, hidden, vertical }: { filled: boolean; hidden?: boolean; vertical?: boolean }) {
  return (
    <span aria-hidden className={cn("relative overflow-hidden rounded-full bg-active", vertical ? "my-1 w-0.5 flex-1 min-h-6" : "mx-1 h-0.5 flex-1", hidden && "invisible")}>
      <motion.span
        initial={false}
        animate={vertical ? { scaleY: filled ? 1 : 0 } : { scaleX: filled ? 1 : 0 }}
        transition={springSoft}
        className={cn("absolute inset-0 bg-btn-primary", vertical ? "origin-top" : "origin-left")}
      />
    </span>
  );
}
