import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { cn } from "../../cn";
import { springSnappy } from "../../motion";

/** Text used by CopyButton. Pass a partial via `labels` to translate or reword. */
export interface CopyButtonLabels {
  /** Idle label (aria-label, or the visible word with `showLabel`). The `label` prop wins. */
  copy: string;
  /** Confirmation shown and announced after copying. The `copiedLabel` prop wins. */
  copied: string;
}
export const copyButtonLabels: CopyButtonLabels = { copy: "Copy", copied: "Copied" };

/** A button that copies text to the clipboard and confirms in place. */
export function CopyButton({
  value, label: labelProp, copiedLabel: copiedLabelProp, className, showLabel = false, labels,
}: {
  value: string;
  label?: string;
  copiedLabel?: string;
  className?: string;
  /** Show the word next to the icon. */
  showLabel?: boolean;
  /** Override any UI text. Merged over `copyButtonLabels`. */
  labels?: Partial<CopyButtonLabels>;
}) {
  const l = { ...copyButtonLabels, ...labels };
  const label = labelProp ?? l.copy;
  const copiedLabel = copiedLabelProp ?? l.copied;
  const [copied, setCopied] = useState(false);
  const t = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(t.current), []);
  const copy = async () => {
    try { await navigator.clipboard.writeText(value); } catch { /* insecure context: still show feedback */ }
    setCopied(true);
    window.clearTimeout(t.current);
    t.current = window.setTimeout(() => setCopied(false), 1600);
  };
  return (
    <motion.button
      type="button"
      onClick={copy}
      whileTap={{ scale: 0.92 }}
      transition={springSnappy}
      aria-label={showLabel ? undefined : copied ? copiedLabel : label}
      className={cn(
        "inline-flex h-8 items-center gap-1.5 rounded-control px-2 text-[13px] font-medium transition-colors duration-200",
        copied ? "text-positive" : "text-muted hover:bg-raised hover:text-ink",
        className,
      )}
    >
      {/* Both icons share one cell and cross-fade: nothing ever reflows during the swap. */}
      <span className="grid size-4 shrink-0 [&>*]:[grid-area:1/1]">
        <motion.svg
          viewBox="0 0 16 16"
          className="size-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          aria-hidden
          initial={false}
          animate={{ opacity: copied ? 0 : 1, scale: copied ? 0.8 : 1 }}
          transition={springSnappy}
        >
          <rect x="5.5" y="5.5" width="8" height="8" rx="2" />
          <path d="M10.5 3.5v-.5a1.5 1.5 0 0 0-1.5-1.5H4A1.5 1.5 0 0 0 2.5 3v5A1.5 1.5 0 0 0 4 9.5h.5" strokeLinecap="round" />
        </motion.svg>
        <motion.svg
          viewBox="0 0 16 16"
          className="size-4"
          aria-hidden
          initial={false}
          animate={{ opacity: copied ? 1 : 0, scale: copied ? 1 : 0.8 }}
          transition={springSnappy}
        >
          <motion.path
            d="M3 8.5l3.2 3L13 4.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={false}
            animate={{ pathLength: copied ? 1 : 0 }}
            transition={copied ? { duration: 0.32, ease: [0.22, 1, 0.36, 1], delay: 0.06 } : { duration: 0 }}
          />
        </motion.svg>
      </span>
      {showLabel && (
        <span className="grid overflow-hidden text-left [&>*]:[grid-area:1/1]">
          <motion.span initial={false} animate={{ opacity: copied ? 0 : 1, y: copied ? -8 : 0 }} transition={{ ...springSnappy, opacity: { duration: copied ? 0.1 : 0.2 } }} aria-hidden={copied}>
            {label}
          </motion.span>
          <motion.span initial={false} animate={{ opacity: copied ? 1 : 0, y: copied ? 0 : 8 }} transition={{ ...springSnappy, opacity: { duration: copied ? 0.2 : 0.1 } }} aria-hidden={!copied}>
            {copiedLabel}
          </motion.span>
        </span>
      )}
      <span className="sr-only" aria-live="polite">{copied ? copiedLabel : ""}</span>
    </motion.button>
  );
}
