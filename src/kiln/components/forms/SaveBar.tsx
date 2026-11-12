import { AnimatePresence, motion } from "motion/react";
import type { ReactNode } from "react";
import { cn } from "../../cn";
import { springSoft } from "../../motion";
import { Button } from "../buttons/Button";

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
  dirty, saving, onSave, onReset, message, saveLabel, resetLabel, className, sticky, labels,
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
}) {
  const l = { ...saveBarLabels, ...labels };
  return (
    <div className={cn("pointer-events-none inset-x-0 bottom-0 z-20 flex justify-center px-3 pb-3", sticky ? "sticky" : "absolute", className)}>
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
}
