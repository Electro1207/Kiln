import type { ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import { cn } from "../../cn";
import { easeOut, springFirm } from "../../motion";

export type BannerProps = {
  open: boolean;
  onDismiss?: () => void;
  children: ReactNode;
  /** A link or small button at the end of the line. */
  action?: ReactNode;
  /** "inverse" is ink on the page; "brand" uses the primary button fill. */
  tone?: "inverse" | "brand" | "neutral";
  /** Override any UI text. Merged over `bannerLabels`. */
  labels?: Partial<BannerLabels>;
  className?: string;
};

/** Text used by Banner. Pass a partial via `labels` to translate or reword. */
export interface BannerLabels {
  /** aria-label of the banner region. */
  region: string;
  /** aria-label of the dismiss button. */
  dismiss: string;
}
export const bannerLabels: BannerLabels = { region: "Announcement", dismiss: "Dismiss announcement" };

const tones = {
  inverse: "bg-ink text-surface dark:bg-btn-secondary dark:text-btn-secondary-ink",
  brand: "bg-btn-primary text-btn-primary-ink",
  neutral: "bg-raised text-ink",
};

/**
 * A full-width announcement for the top of an app. It sits in the flow: the
 * space opens as the bar slides down into it, and closes the same way, so the
 * page below moves once and smoothly.
 */
export function Banner({ open, onDismiss, children, action, tone = "inverse", labels, className }: BannerProps) {
  const l = { ...bannerLabels, ...labels };
  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          key="banner"
          initial={{ height: 0 }}
          animate={{ height: "auto" }}
          exit={{ height: 0, transition: { ...springFirm, delay: 0.04 } }}
          transition={springFirm}
          className="overflow-hidden"
        >
          <motion.div
            role="region"
            aria-label={l.region}
            initial={{ y: "-100%" }}
            animate={{ y: 0 }}
            exit={{ y: "-100%", transition: { duration: 0.26, ease: easeOut } }}
            transition={springFirm}
            className={cn("relative flex min-h-11 items-center gap-3 px-4 py-2 text-[13.5px] leading-5 sm:justify-center", onDismiss && "sm:px-12", tones[tone], className)}
          >
            <p className="min-w-0 flex-1 sm:flex-none">{children}</p>
            {action && <span className="shrink-0">{action}</span>}
            {onDismiss && (
              <button
                type="button"
                aria-label={l.dismiss}
                onClick={onDismiss}
                className="-mr-1.5 grid size-7 shrink-0 place-items-center rounded-full opacity-70 transition-opacity hover:opacity-100 sm:absolute sm:right-3"
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
