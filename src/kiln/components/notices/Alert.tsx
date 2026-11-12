import { useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CircleAlert, CircleCheck, Info, TriangleAlert, X } from "lucide-react";
import { cn } from "../../cn";
import { easeOut, springFirm } from "../../motion";

export type AlertTone = "info" | "success" | "warning" | "error";

export type AlertProps = {
  tone?: AlertTone;
  title: ReactNode;
  children?: ReactNode;
  /** Buttons or links under the text. */
  action?: ReactNode;
  /** Show a close button; the alert folds shut and then calls onDismiss. */
  dismissible?: boolean;
  onDismiss?: () => void;
  /** "raised" when the alert sits on a white surface rather than on the page ground. */
  surface?: "surface" | "raised";
  /**
   * Space below the alert, in px. It folds away with the alert, so a stack of
   * alerts closes up without a jump. Use this instead of a gap on the parent.
   */
  spaceAfter?: number;
  /** Override any UI text. Merged over `alertLabels`. */
  labels?: Partial<AlertLabels>;
  className?: string;
};

/** Text used by Alert. Pass a partial via `labels` to translate or reword. */
export interface AlertLabels {
  /** Screen-reader prefix for the info tone. */
  info: string;
  /** Screen-reader prefix for the success tone. */
  success: string;
  /** Screen-reader prefix for the warning tone. */
  warning: string;
  /** Screen-reader prefix for the error tone. */
  error: string;
  /** aria-label of the dismiss button. */
  dismiss: string;
}
export const alertLabels: AlertLabels = { info: "Note", success: "Done", warning: "Warning", error: "Error", dismiss: "Dismiss" };

const tones: Record<AlertTone, { icon: ReactNode }> = {
  info: { icon: <Info className="size-[18px] text-info" strokeWidth={2} /> },
  success: { icon: <CircleCheck className="size-[18px] text-positive" strokeWidth={2} /> },
  warning: { icon: <TriangleAlert className="size-[18px] text-warning" strokeWidth={2} /> },
  error: { icon: <CircleAlert className="size-[18px] text-negative" strokeWidth={2} /> },
};

/**
 * An inline message about the page or a task. A calm card: the tone lives in
 * the icon, the words carry the message. Dismissing it fades the content, then
 * folds the space shut.
 */
export function Alert({
  tone = "info",
  title,
  children,
  action,
  dismissible,
  onDismiss,
  surface = "surface",
  spaceAfter = 0,
  labels,
  className,
}: AlertProps) {
  const [open, setOpen] = useState(true);
  const t = tones[tone];
  const l = { ...alertLabels, ...labels };
  return (
    <AnimatePresence initial={false} onExitComplete={onDismiss}>
      {open && (
        <motion.div
          key="alert"
          initial={false}
          exit={{ height: 0, transition: { ...springFirm, delay: 0.1 } }}
          className="overflow-hidden"
          style={{ paddingBottom: spaceAfter }}
        >
          <motion.div
            role={tone === "error" || tone === "warning" ? "alert" : "status"}
            exit={{ opacity: 0, scale: 0.985, transition: { duration: 0.16, ease: easeOut } }}
            className={cn(
              "flex gap-3 rounded-card border border-line p-4 text-ink",
              surface === "surface" ? "bg-surface" : "bg-raised",
              className,
            )}
          >
            <span className="grid h-5 shrink-0 place-items-center" aria-hidden>
              {t.icon}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold leading-5">
                <span className="sr-only">{l[tone]}: </span>
                {title}
              </p>
              {children && <div className="mt-1 text-[13.5px] leading-5 text-muted">{children}</div>}
              {action && <div className="mt-3 flex flex-wrap items-center gap-2">{action}</div>}
            </div>
            {dismissible && (
              <button
                type="button"
                aria-label={l.dismiss}
                onClick={() => setOpen(false)}
                className="-mr-1.5 -mt-1.5 grid size-8 shrink-0 place-items-center rounded-full text-muted transition-colors hover:bg-raised hover:text-ink"
              >
                <X className="size-4" />
              </button>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
