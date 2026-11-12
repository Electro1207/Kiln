import type { HTMLAttributes, ReactNode, Ref } from "react";
import { motion } from "motion/react";
import { cn } from "../../cn";
import { easeInOut } from "../../motion";

export type SeparatorProps = Omit<HTMLAttributes<HTMLElement>, "children"> & {
  orientation?: "horizontal" | "vertical";
  /** Text set in the middle of a horizontal separator ("or", a date). */
  label?: ReactNode;
  /** Draw in from the centre when it scrolls into view. */
  animated?: boolean;
  ref?: Ref<HTMLDivElement>;
};

/** A thin divider, optionally with a label in the middle. Other props go to the root. */
export function Separator({ orientation = "horizontal", label, animated = true, className, ref, ...rest }: SeparatorProps) {
  if (orientation === "vertical") {
    return <span role="separator" aria-orientation="vertical" {...rest} ref={ref as Ref<HTMLSpanElement>} className={cn("inline-block h-5 w-px self-center bg-line", className)} />;
  }
  const line = (origin: number) => (
    <motion.span
      aria-hidden
      className="h-px flex-1 bg-line"
      style={{ originX: origin }}
      initial={animated ? { scaleX: 0 } : false}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, ease: easeInOut }}
    />
  );
  return (
    <div role="separator" aria-orientation="horizontal" {...(rest as HTMLAttributes<HTMLDivElement>)} ref={ref} className={cn("k-fill flex items-center gap-3", className)}>
      {line(label ? 1 : 0.5)}
      {label && (
        <>
          <span className="shrink-0 text-xs text-muted">{label}</span>
          {line(0)}
        </>
      )}
    </div>
  );
}
