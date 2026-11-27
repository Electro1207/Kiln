import type { ReactNode } from "react";
import { motion } from "motion/react";
import { cn } from "../../cn";
import { springSoft, staggerChild, staggerParent } from "../../motion";
import { useA11yProps, type AccessibilityFeaturesProp } from "../../a11y";

export type Suggestion = { label: string; prompt?: string; icon?: ReactNode };

/**
 * Prompt starters as chips. They wrap on wide screens and scroll sideways on
 * a phone; picking one hands its prompt back.
 */
export function Suggestions({ items, onPick, className, accessibilityFeatures }: { items: Suggestion[]; onPick: (prompt: string) => void; className?: string; accessibilityFeatures?: AccessibilityFeaturesProp }) {
  const { rootProps } = useA11yProps(accessibilityFeatures);
  return (
    <motion.ul
      {...rootProps}
      variants={staggerParent}
      initial="hidden"
      animate="visible"
      className={cn("-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0", className)}
    >
      {items.map((s) => (
        <motion.li key={s.label} variants={staggerChild} className="shrink-0">
          <motion.button
            type="button"
            onClick={() => onPick(s.prompt ?? s.label)}
            whileTap={{ scale: 0.96 }}
            transition={springSoft}
            className="inline-flex h-9 items-center gap-2 whitespace-nowrap rounded-full border border-line bg-surface px-3.5 text-[0.84375rem] text-ink transition-colors hover:border-line-strong hover:bg-raised focus-visible:outline-2 focus-visible:outline-accent [&_svg]:size-4 [&_svg]:text-muted"
          >
            {s.icon}
            {s.label}
          </motion.button>
        </motion.li>
      ))}
    </motion.ul>
  );
}
