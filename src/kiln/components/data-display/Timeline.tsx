import type { ReactNode } from "react";
import { motion } from "motion/react";
import { cn } from "../../cn";
import { staggerChild, staggerParent } from "../../motion";

export type TimelineItem = {
  id: string;
  title: ReactNode;
  time: string;
  /** ISO date for the <time> element. */
  dateTime?: string;
  body?: ReactNode;
  icon?: ReactNode;
  tone?: "neutral" | "accent" | "positive" | "negative" | "warning";
};

const tones = {
  neutral: "bg-active text-muted",
  accent: "bg-accent-soft text-accent",
  positive: "bg-positive-soft text-positive",
  negative: "bg-negative-soft text-negative",
  warning: "bg-warning-soft text-warning",
};

/** An activity feed. Entries rise in one after another when it scrolls into view. */
export function Timeline({ items, className }: { items: TimelineItem[]; className?: string }) {
  return (
    <motion.ol
      className={cn("relative flex flex-col", className)}
      variants={staggerParent}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
    >
      {items.map((item, i) => (
        <motion.li key={item.id} variants={staggerChild} className="relative flex gap-3 pb-6 last:pb-0">
          {i < items.length - 1 && <span aria-hidden className="absolute bottom-0 left-[15px] top-8 w-0.5 rounded-full bg-line" />}
          <span
            className={cn(
              "relative grid size-8 shrink-0 place-items-center rounded-full [&>svg]:size-4",
              tones[item.tone ?? "neutral"],
            )}
            aria-hidden
          >
            {item.icon ?? <span className="size-2 rounded-full bg-current" />}
          </span>
          <div className="min-w-0 flex-1 pt-1">
            <div className="flex flex-wrap items-baseline justify-between gap-x-3">
              <span className="text-sm text-ink">{item.title}</span>
              <time dateTime={item.dateTime} className="tabular text-xs text-muted">
                {item.time}
              </time>
            </div>
            {item.body && <div className="mt-1.5 text-[13px] text-muted">{item.body}</div>}
          </div>
        </motion.li>
      ))}
    </motion.ol>
  );
}
