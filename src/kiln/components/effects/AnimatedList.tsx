import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "../../cn";
import { easeOut, springSoft } from "../../motion";
import { useOnScreen, usePrefersReducedMotion } from "../shared/useLoop";

export type AnimatedListProps<T> = {
  items: T[];
  render: (item: T) => ReactNode;
  /** ms between arrivals. */
  interval?: number;
  /** How many stay in view; the oldest leaves when a new one lands. */
  visible?: number;
  className?: string;
};

/**
 * Items arriving one at a time at the top of a stack, like notifications
 * landing; the rest slide down to make room. It loops through `items` while
 * on screen.
 */
export function AnimatedList<T>({ items, render, interval = 1800, visible = 4, className }: AnimatedListProps<T>) {
  const ref = useRef<HTMLUListElement>(null);
  const onScreen = useOnScreen(ref);
  const reduce = usePrefersReducedMotion();
  const [count, setCount] = useState(1);

  useEffect(() => {
    if (!onScreen || reduce) return;
    const t = window.setInterval(() => setCount((c) => c + 1), interval);
    return () => window.clearInterval(t);
  }, [onScreen, reduce, interval]);

  const shown = reduce
    ? items.slice(0, visible).map((item, i) => ({ key: i, item }))
    : Array.from({ length: Math.min(count, visible) }, (_, k) => {
        const n = count - 1 - k;
        return { key: n, item: items[n % items.length] };
      });

  return (
    <ul ref={ref} aria-live="off" className={cn("relative flex flex-col gap-2.5", className)}>
      <AnimatePresence initial={false} mode="popLayout">
        {shown.map(({ key, item }) => (
          <motion.li
            key={key}
            layout
            initial={{ opacity: 0, y: -16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.2, ease: easeOut } }}
            transition={springSoft}
            style={{ borderRadius: 14 }}
          >
            {render(item)}
          </motion.li>
        ))}
      </AnimatePresence>
    </ul>
  );
}
