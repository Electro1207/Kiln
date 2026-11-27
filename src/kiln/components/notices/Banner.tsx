import { useMemo, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import { cn } from "../../cn";
import { easeOut, springFirm } from "../../motion";
import { useA11yProps, type AccessibilityFeaturesProp } from "../../a11y";

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
  /** Replace any built-in icon. Merged over `bannerIcons`. */
  icons?: Partial<BannerIcons>;
  className?: string;
  /** Accessibility features to add for this banner only (`reduceMotion` makes it fade in with the space instead of sliding down; `highContrast` and `strongFocus` come from the page-wide styles). Adds to the person's own settings, never removes them. */
  accessibilityFeatures?: AccessibilityFeaturesProp;
};

/** Icons used by Banner. Pass a partial via `icons` to swap any of them. */
export interface BannerIcons {
  /** Dismiss button. */
  close: ReactNode;
}
export const bannerIcons: BannerIcons = { close: <X /> };

/** Text used by Banner. Pass a partial via `labels` to translate or reword. */
export interface BannerLabels {
  /** aria-label of the banner region. */
  region: string;
  /** aria-label of the dismiss button. */
  dismiss: string;
}
export const bannerLabels: BannerLabels = { region: "Announcement", dismiss: "Dismiss announcement" };

const tones = {
  // dark: override kept: needs an inverse-surface token pair (reported).
  inverse: "bg-ink text-surface dark:bg-btn-secondary dark:text-btn-secondary-ink",
  brand: "bg-btn-primary text-btn-primary-ink",
  neutral: "bg-raised text-ink",
};

/**
 * A full-width announcement for the top of an app. It sits in the flow: the
 * space opens as the bar slides down into it, and closes the same way, so the
 * page below moves once and smoothly.
 */
export function Banner({ open, onDismiss, children, action, tone = "inverse", labels, icons, className, accessibilityFeatures }: BannerProps) {
  const { a11y, rootProps } = useA11yProps(accessibilityFeatures);
  const l = { ...bannerLabels, ...labels };
  const ic = useMemo(() => ({ ...bannerIcons, ...icons }), [icons]);
  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          key="banner"
          // A one-off height fold of a single element (allowed): the page below moves once.
          initial={{ height: 0 }}
          animate={{ height: "auto" }}
          exit={{ height: 0, transition: { ...springFirm, delay: 0.04 } }}
          transition={springFirm}
          className="overflow-hidden"
        >
          <motion.div
            role="region"
            aria-label={l.region}
            {...rootProps}
            initial={a11y.reduceMotion ? { opacity: 0 } : { y: "-100%" }}
            animate={a11y.reduceMotion ? { opacity: 1 } : { y: 0 }}
            exit={a11y.reduceMotion ? { opacity: 0, transition: { duration: 0.2, ease: easeOut } } : { y: "-100%", transition: { duration: 0.26, ease: easeOut } }}
            transition={springFirm}
            className={cn("relative flex min-h-11 items-center gap-3 px-4 py-2 text-[0.84375rem] leading-5 sm:justify-center", onDismiss && "sm:px-12", tones[tone], className)}
          >
            <p className="min-w-0 flex-1 sm:flex-none">{children}</p>
            {action && <span className="shrink-0">{action}</span>}
            {onDismiss && (
              <button
                type="button"
                aria-label={l.dismiss}
                onClick={onDismiss}
                className="k-hit -mr-1.5 grid size-7 shrink-0 place-items-center rounded-full [&>svg]:size-4 opacity-70 transition-opacity hover:opacity-100 sm:absolute sm:right-3"
              >
                {ic.close}
              </button>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
