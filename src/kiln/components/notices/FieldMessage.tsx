import type { ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "../../cn";
import { easeOut, spring } from "../../motion";

export type FieldMessageProps = {
  /** Tie it to its field with aria-describedby={id}. */
  id?: string;
  tone?: "error" | "success" | "hint";
  /** Nothing renders when empty; changes slide in, and the space opens and closes smoothly. */
  children?: ReactNode;
  className?: string;
};

/** The line under a form field: a hint, an error or a confirmation. */
export function FieldMessage({ id, tone = "hint", children, className }: FieldMessageProps) {
  const show = children != null && children !== false && children !== "";
  return (
    <div id={id} aria-live={tone === "error" ? "assertive" : "polite"} className={className}>
      <AnimatePresence initial={false}>
        {show && (
          <motion.div
            key={`${tone}-${typeof children === "string" ? children : "node"}`}
            initial={{ height: 0, opacity: 0, y: -4 }}
            animate={{ height: "auto", opacity: 1, y: 0 }}
            exit={{ height: 0, opacity: 0, y: -4, transition: { duration: 0.16, ease: easeOut } }}
            transition={spring}
            className="overflow-hidden"
          >
            <p
              className={cn(
                "flex items-start gap-1.5 pt-2 text-[13px] leading-snug",
                tone === "error" && "text-negative",
                tone === "success" && "text-positive",
                tone === "hint" && "text-muted",
              )}
            >
              {tone === "error" && <AlertCircle className="mt-px size-3.5 shrink-0" aria-hidden />}
              {tone === "success" && <CheckCircle2 className="mt-px size-3.5 shrink-0" aria-hidden />}
              <span>{children}</span>
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
