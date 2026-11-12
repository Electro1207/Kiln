import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
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

/** Icons used by Reasoning. Pass a partial via `icons` to replace any. */
export interface ReasoningIcons {
  /** Before the label. */
  brain: ReactNode;
  /** The chevron after the label. */
  expand: ReactNode;
}
export const reasoningIcons: ReasoningIcons = { brain: <Brain />, expand: <ChevronDown /> };

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
  /** Replace any built-in icon. Merged over `reasoningIcons`. */
  icons?: Partial<ReasoningIcons>;
};

/**
 * The model's working, folded behind one line. While it thinks the line
 * breathes and the panel is open; when it is done it reads "Thought for 6
 * seconds" and folds shut, one click from reopening.
 */
export function Reasoning({ thinking, seconds, children, autoCollapse = true, className, labels, icons }: ReasoningProps) {
  const l = { ...reasoningLabels, ...labels };
  const ic = useMemo(() => ({ ...reasoningIcons, ...icons }), [icons]);
  const [open, setOpen] = useState(thinking);
  const [measured, setMeasured] = useState<number | null>(thinking ? null : 1);
  const [wasThinking, setWasThinking] = useState(thinking);
  const label = useRef<HTMLSpanElement>(null);
  const id = useId();

  if (thinking !== wasThinking) {
    setWasThinking(thinking);
    if (thinking) {
      setMeasured(null);
      setOpen(true);
    } else if (autoCollapse) setOpen(false);
  }

  // The thinking spell ends when this effect cleans up; that is the moment to read the clock.
  useEffect(() => {
    if (!thinking) return;
    const start = performance.now();
    return () => setMeasured(Math.max(1, Math.round((performance.now() - start) / 1000)));
  }, [thinking]);

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
        <span className="grid [&>svg]:size-4" aria-hidden>{ic.brain}</span>
        <span ref={label} className="grid [&>*]:[grid-area:1/1]">
          <motion.span initial={false} animate={{ opacity: thinking ? 1 : 0 }} transition={fade}>{l.thinking}</motion.span>
          <motion.span initial={false} animate={{ opacity: thinking ? 0 : 1 }} transition={fade} aria-hidden={thinking}>
            {l.thoughtFor(secs ?? 0)}
          </motion.span>
        </span>
        <span className={cn("grid transition-transform duration-300 ease-out-soft [&>svg]:size-3.5", open && "rotate-180")} aria-hidden>{ic.expand}</span>
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
