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
  /** Replace any built-in icon. Merged over `fieldMessageIcons`. */
  icons?: Partial<FieldMessageIcons>;
  className?: string;
};

/** Icons used by FieldMessage. Pass a partial via `icons` to swap any of them. */
export interface FieldMessageIcons {
  /** Beside an error. */
  error: ReactNode;
  /** Beside a success message. */
  success: ReactNode;
}
export const fieldMessageIcons: FieldMessageIcons = { error: <AlertCircle />, success: <CheckCircle2 /> };

/** The line under a form field: a hint, an error or a confirmation. */
export function FieldMessage({ id, tone = "hint", children, icons, className }: FieldMessageProps) {
  const ic = { ...fieldMessageIcons, ...icons };
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
              {tone === "error" && <span className="mt-px grid shrink-0 [&>svg]:size-3.5" aria-hidden>{ic.error}</span>}
              {tone === "success" && <span className="mt-px grid shrink-0 [&>svg]:size-3.5" aria-hidden>{ic.success}</span>}
              <span>{children}</span>
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
