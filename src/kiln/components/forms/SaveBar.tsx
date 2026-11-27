import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { useEffect, type ReactNode } from "react";
import { cn } from "../../cn";
import { springSoft } from "../../motion";
import { Button } from "../buttons/Button";
import { useA11yProps, type AccessibilityFeaturesProp } from "../../a11y";
import { announce } from "../accessibility/announce";

/** Text used by SaveBar. Pass a partial via `labels` to translate or reword. */
export interface SaveBarLabels {
  /** aria-label of the region. */
  region: string;
  /** Default message (the `message` prop wins). */
  message: string;
  /** Default save button text (the `saveLabel` prop wins). */
  save: string;
  /** Default discard button text (the `resetLabel` prop wins). */
  discard: string;
}
export const saveBarLabels: SaveBarLabels = { region: "Unsaved changes", message: "You have unsaved changes", save: "Save changes", discard: "Discard" };

/**
 * Rises from the bottom of its container when there are unsaved changes.
 * Place it last inside a `relative` container with bottom padding, or let it stick to the viewport (`sticky`).
 */
export function SaveBar({
  dirty, saving, onSave, onReset, message, saveLabel, resetLabel, className, sticky, labels, accessibilityFeatures,
}: {
  dirty: boolean;
  saving?: boolean;
  onSave: () => void;
  onReset: () => void;
  message?: ReactNode;
  saveLabel?: ReactNode;
  resetLabel?: ReactNode;
  className?: string;
  /** Stick to the bottom of the scrolling viewport instead of the container. */
  sticky?: boolean;
  /** Override any UI text. Merged over `saveBarLabels`. */
  labels?: Partial<SaveBarLabels>;
  /** Accessibility features to add for this bar only. `reduceMotion` makes it appear without rising. Its appearance is always announced politely. Adds to the person's own settings, never removes them. */
  accessibilityFeatures?: AccessibilityFeaturesProp;
}) {
  const { a11y, rootProps } = useA11yProps(accessibilityFeatures);
  const l = { ...saveBarLabels, ...labels };
  const spoken = typeof message === "string" ? message : l.message;
  useEffect(() => { if (dirty) announce(spoken); }, [dirty, spoken]);
  const el = (
    <div {...rootProps} className={cn("pointer-events-none inset-x-0 bottom-0 z-20 flex justify-center px-3 pb-3", sticky ? "sticky" : "absolute", className)}>
      <AnimatePresence>
        {dirty && (
          <motion.div
            role="region"
            aria-label={l.region}
            initial={{ y: "120%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "120%", opacity: 0 }}
            transition={springSoft}
            className="pointer-events-auto flex w-full max-w-xl flex-wrap items-center justify-between gap-3 rounded-card bg-ink py-2 pl-4 pr-2 text-surface shadow-float"
          >
            <span className="text-sm">{message ?? l.message}</span>
            <span className="flex gap-2">
              <Button size="sm" variant="ghost" onClick={onReset} disabled={saving} className="text-surface hover:bg-surface/10">{resetLabel ?? l.discard}</Button>
              <Button size="sm" onClick={onSave} loading={saving}>{saveLabel ?? l.save}</Button>
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
  return a11y.reduceMotion ? <MotionConfig reducedMotion="always">{el}</MotionConfig> : el;
}
