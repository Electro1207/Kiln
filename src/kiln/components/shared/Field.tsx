import { AnimatePresence, motion } from "motion/react";
import type { ReactNode } from "react";
import { cn } from "../../cn";
import { fade } from "../../motion";
import type { Size } from "../../controllable";

/** Text used by Field. Pass a partial via `labels` to translate or reword. */
export interface FieldLabels {
  /** Suffix shown after the label of an optional field. */
  optional: string;
}
export const fieldLabels: FieldLabels = { optional: "optional" };

/** Label, hint and error around any control. Used by every text input in Kiln. */
export function Field({
  id, label, hint, error, children, className, optional, aside, labels,
}: {
  id: string;
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  children: ReactNode;
  className?: string;
  optional?: boolean;
  /** Right side of the label row, e.g. a counter. */
  aside?: ReactNode;
  /** Override any UI text. Merged over `fieldLabels`. */
  labels?: Partial<FieldLabels>;
}) {
  const l = { ...fieldLabels, ...labels };
  return (
    <div className={cn("k-fill flex min-w-0 flex-col gap-2", className)}>
      {(label || aside) && (
        <div className="flex items-baseline justify-between gap-3">
          {label && (
            <label htmlFor={id} className="text-sm font-medium text-ink">
              {label}
              {optional && <span className="ml-1.5 font-normal text-muted">{l.optional}</span>}
            </label>
          )}
          {aside}
        </div>
      )}
      {children}
      {(hint || error) && (
        <div className="grid [&>*]:[grid-area:1/1]">
          <AnimatePresence initial={false}>
            {error ? (
              <motion.p key="err" id={`${id}-msg`} role="alert" initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { ...fade, delay: 0.08 } }} exit={{ opacity: 0, transition: { duration: 0.09 } }} className="text-[13px] text-negative">
                {error}
              </motion.p>
            ) : (
              <motion.p key="hint" id={`${id}-msg`} initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { ...fade, delay: 0.08 } }} exit={{ opacity: 0, transition: { duration: 0.09 } }} className="text-[13px] text-muted">
                {hint}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

/** Height, padding and text size of a text input box at each size. */
export const inputSizes: Record<Size, string> = {
  sm: "k-ctl-sm px-2.5",
  md: "k-ctl-md px-3",
  lg: "k-ctl-lg px-4",
};

/** The shared box style for text inputs. */
export const inputBox = (invalid?: boolean, size: Size = "md") =>
  cn(
    "group/box relative flex w-full items-center gap-2 rounded-control border bg-surface",
    inputSizes[size],
    "transition-[border-color,box-shadow,background-color] duration-200 ease-out-soft",
    "focus-within:ring-[3px]",
    invalid
      ? "border-negative focus-within:ring-negative/20"
      : "border-line-strong hover:border-faint focus-within:border-accent focus-within:ring-accent/20",
  );
