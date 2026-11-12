import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Brain, ChevronDown } from "lucide-react";
import { cn } from "../../cn";
import { fade, springFirm } from "../../motion";
import { useLoop } from "../shared/useLoop";

/** Text used by Reasoning. Pass a partial via `labels` to translate or reword. */
export interface ReasoningLabels {
  /** Shown while the model is thinking. */
  thinking: string;
  /** "Thought for 6 seconds" text, with the number of seconds. */
  thoughtFor: (seconds: number) => string;
}
export const reasoningLabels: ReasoningLabels = {
  thinking: "Thinking…",
  thoughtFor: (s) => `Thought for ${s} ${s === 1 ? "second" : "seconds"}`,
};

export type ReasoningProps = {
  /** True while the model is still thinking. */
  thinking: boolean;
  /** Seconds it thought for, shown once it is done. Measured automatically when left out. */
  seconds?: number;
  children: ReactNode;
  /** Open while thinking, then fold away when the answer starts. Default true. */
  autoCollapse?: boolean;
  className?: string;
  /** Override any UI text. Merged over `reasoningLabels`. */
  labels?: Partial<ReasoningLabels>;
};

/**
 * The model's working, folded behind one line. While it thinks the line
 * breathes and the panel is open; when it is done it reads "Thought for 6
 * seconds" and folds shut, one click from reopening.
 */
export function Reasoning({ thinking, seconds, children, autoCollapse = true, className, labels }: ReasoningProps) {
  const l = { ...reasoningLabels, ...labels };
  const [open, setOpen] = useState(thinking);
  const started = useRef(performance.now());
  const [measured, setMeasured] = useState<number | null>(null);
  const label = useRef<HTMLSpanElement>(null);
  const id = useId();

  useEffect(() => {
    if (thinking) {
      started.current = performance.now();
      setMeasured(null);
      setOpen(true);
    } else {
      setMeasured(Math.max(1, Math.round((performance.now() - started.current) / 1000)));
      if (autoCollapse) setOpen(false);
    }
  }, [thinking, autoCollapse]);

  // A slow breathing of the label while thinking; opacity only, on the compositor.
  useLoop(
    label,
    (el) => (thinking ? [el.animate([{ opacity: 1 }, { opacity: 0.45 }, { opacity: 1 }], { duration: 1600, iterations: Infinity, easing: "ease-in-out" })] : []),
    [thinking],
  );

  const secs = seconds ?? measured;
  return (
    <div className={cn("text-sm", className)}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((o) => !o)}
        className="-ml-1 inline-flex h-8 items-center gap-2 rounded-full px-1 text-muted transition-colors hover:text-ink"
      >
        <Brain className="size-4" />
        <span ref={label} className="grid [&>*]:[grid-area:1/1]">
          <motion.span initial={false} animate={{ opacity: thinking ? 1 : 0 }} transition={fade}>{l.thinking}</motion.span>
          <motion.span initial={false} animate={{ opacity: thinking ? 0 : 1 }} transition={fade} aria-hidden={thinking}>
            {l.thoughtFor(secs ?? 0)}
          </motion.span>
        </span>
        <ChevronDown className={cn("size-3.5 transition-transform duration-300 ease-out-soft", open && "rotate-180")} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="body"
            id={id}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ height: springFirm, opacity: fade }}
            className="overflow-hidden"
          >
            <div className="mb-1 ml-2 mt-1 border-l-2 border-line pl-4 text-[13.5px] leading-[21px] text-muted">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
