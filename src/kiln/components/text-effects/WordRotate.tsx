import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "../../cn";
import { easeOut, springSoft } from "../../motion";
import { useOnScreen, usePrefersReducedMotion } from "../shared/useLoop";

export type WordRotateProps = {
  words: string[];
  /** ms each word stays. */
  interval?: number;
  className?: string;
  align?: "start" | "center" | "end";
};

/**
 * One word that swaps for the next in place. Every word is laid out in the
 * same cell, so the cell is as wide as the longest and the line never reflows.
 * The cell has room above and below the line, so marks over and under letters
 * (Devanagari, Kannada, Thai, Vietnamese) are never clipped.
 */
export function WordRotate({ words, interval = 2200, className, align = "start" }: WordRotateProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [i, setI] = useState(0);
  const reduce = usePrefersReducedMotion();
  const visible = useOnScreen(ref);

  useEffect(() => {
    if (reduce || !visible) return;
    const t = window.setInterval(() => setI((n) => (n + 1) % words.length), interval);
    return () => window.clearInterval(t);
  }, [reduce, visible, interval, words.length]);

  return (
    <span
      ref={ref}
      className={cn(
        "inline-grid overflow-hidden py-[0.3em] -my-[0.3em] align-bottom [&>*]:[grid-area:1/1]",
        align === "center" ? "justify-items-center" : align === "end" ? "justify-items-end" : "justify-items-start",
        className,
      )}
    >
      {words.map((w) => (
        <span key={`size-${w}`} aria-hidden className="invisible">
          {w}
        </span>
      ))}
      <span className="sr-only">{words.join(", ")}</span>
      <AnimatePresence initial={false}>
        <motion.span
          key={i}
          aria-hidden
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "-100%", opacity: 0, transition: { duration: 0.32, ease: easeOut } }}
          transition={springSoft}
          className="whitespace-nowrap"
        >
          {words[i]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
