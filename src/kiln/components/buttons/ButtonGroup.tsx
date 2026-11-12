import type { ReactNode } from "react";
import { cn } from "../../cn";

/** Joins adjacent buttons into one strip. Children should be Buttons of the same size. */
export function ButtonGroup({ children, className, label }: { children: ReactNode; className?: string; label?: string }) {
  return (
    <div
      role="group"
      aria-label={label}
      className={cn(
        "inline-flex items-stretch",
        "[&>*]:rounded-none [&>*:first-child]:rounded-l-control [&>*:last-child]:rounded-r-control",
        "[&>*+*]:border-l [&>*+*]:border-line-strong/60",
        className,
      )}
    >
      {children}
    </div>
  );
}
