import type { ReactNode } from "react";
import { motion } from "motion/react";
import { ArrowDown } from "lucide-react";
import { cn } from "../../cn";
import { springSoft } from "../../motion";

/** Text used by ScrollHint. Pass a partial via `labels` to translate or reword. */
export interface ScrollHintLabels {
  /** The words on the button. */
  hint: string;
}
export const scrollHintLabels: ScrollHintLabels = { hint: "Scroll down for more" };

/** Icons used by ScrollHint. Pass a partial via `icons` to swap any of them. */
export interface ScrollHintIcons {
  /** The arrow that nudges. */
  arrow: ReactNode;
}
export const scrollHintIcons: ScrollHintIcons = { arrow: <ArrowDown /> };

export type ScrollHintProps = {
  /** Id of the element to scroll to when pressed. */
  target?: string;
  /** Called when pressed, after scrolling to `target` if there is one. */
  onClick?: () => void;
  /** Fades the hint in or out, e.g. once an intro has played. Default true. */
  show?: boolean;
  className?: string;
  /** Override any UI text. Merged over `scrollHintLabels`. */
  labels?: Partial<ScrollHintLabels>;
  /** Replace any built-in icon. Merged over `scrollHintIcons`. */
  icons?: Partial<ScrollHintIcons>;
};

/**
 * The quiet invitation at the foot of a first screen: a line of text and an arrow that nudges down
 * every couple of seconds. It is a real button: pressed, it scrolls smoothly to `target` (instantly
 * with reduced motion, and the arrow then stays still). Position it yourself.
 */
export function ScrollHint({ target, onClick, show = true, className, labels, icons }: ScrollHintProps) {
  const l = { ...scrollHintLabels, ...labels };
  const ic = { ...scrollHintIcons, ...icons };
  return (
    <motion.button
      type="button"
      onClick={() => {
        if (target) {
          const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
          document.getElementById(target)?.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
        }
        onClick?.();
      }}
      initial={false}
      animate={show ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
      transition={springSoft}
      tabIndex={show ? 0 : -1}
      aria-hidden={!show}
      className={cn("inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-ink outline-offset-2", !show && "pointer-events-none", className)}
    >
      {l.hint}
      <span aria-hidden className="inline-flex animate-nudge [&>svg]:size-4">{ic.arrow}</span>
    </motion.button>
  );
}
