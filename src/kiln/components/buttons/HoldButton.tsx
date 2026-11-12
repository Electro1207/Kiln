import { useEffect, useRef, useState, type ReactNode } from "react";
import { animate, motion, useMotionValue, useTransform } from "motion/react";
import { cn } from "../../cn";
import { easeOut, springFirm, springSnappy } from "../../motion";

/** Text used by HoldButton. Pass a partial via `labels` to translate or reword. */
export interface HoldButtonLabels {
  /** Shown once the hold completes. The `doneLabel` prop wins. */
  done: string;
  /** Description announced to assistive tech. */
  holdHint: string;
}
export const holdButtonLabels: HoldButtonLabels = { done: "Done", holdHint: "Press and hold to confirm" };

/** For destructive actions: the visitor holds to confirm. Releasing early rewinds smoothly. */
/** Text swaps hand over rather than overlap: the old words leave quickly, then the new ones arrive. */
const textSwap = (show: boolean) => (show ? { duration: 0.18, delay: 0.08, ease: easeOut } : { duration: 0.09, ease: easeOut });

export function HoldButton({
  children, onConfirm, duration = 1.2, className, tone = "danger", doneLabel: doneLabelProp, labels,
}: {
  children: ReactNode;
  onConfirm: () => void;
  /** Seconds to hold. */
  duration?: number;
  className?: string;
  tone?: "danger" | "primary";
  doneLabel?: ReactNode;
  /** Override any UI text. Merged over `holdButtonLabels`. */
  labels?: Partial<HoldButtonLabels>;
}) {
  const l = { ...holdButtonLabels, ...labels };
  const doneLabel = doneLabelProp ?? l.done;
  const progress = useMotionValue(0);
  const clip = useTransform(progress, (p) => `inset(0 ${100 - p * 100}% 0 0)`);
  const ctrl = useRef<ReturnType<typeof animate> | null>(null);
  const [done, setDone] = useState(false);
  const reset = useRef<number | undefined>(undefined);
  useEffect(() => () => { ctrl.current?.stop(); window.clearTimeout(reset.current); }, []);

  const start = () => {
    if (done) return;
    ctrl.current?.stop();
    ctrl.current = animate(progress, 1, {
      duration: duration * (1 - progress.get()),
      ease: "linear",
      onComplete: () => {
        setDone(true);
        onConfirm();
        reset.current = window.setTimeout(() => {
          setDone(false);
          ctrl.current = animate(progress, 0, { duration: 0.5, ease: easeOut });
        }, 1800);
      },
    });
  };
  const cancel = () => {
    if (done) return;
    ctrl.current?.stop();
    ctrl.current = animate(progress, 0, springFirm);
  };

  const fill = tone === "danger" ? "bg-btn-danger text-btn-danger-ink" : "bg-btn-primary text-btn-primary-ink";

  const faces = (
    <span className="grid justify-items-center [&>*]:[grid-area:1/1]">
      <motion.span initial={false} animate={{ opacity: done ? 0 : 1 }} transition={textSwap(!done)}>{children}</motion.span>
      <motion.span initial={false} animate={{ opacity: done ? 1 : 0 }} transition={textSwap(done)}>{doneLabel}</motion.span>
    </span>
  );

  return (
    <motion.button
      type="button"
      onPointerDown={start}
      onPointerUp={cancel}
      onPointerLeave={cancel}
      onPointerCancel={cancel}
      onKeyDown={(e) => { if ((e.key === " " || e.key === "Enter") && !e.repeat) { e.preventDefault(); start(); } }}
      onKeyUp={(e) => { if (e.key === " " || e.key === "Enter") cancel(); }}
      onContextMenu={(e) => e.preventDefault()}
      whileTap={{ scale: 0.97 }}
      transition={springSnappy}
      aria-description={l.holdHint}
      className={cn(
        "relative inline-grid h-10 touch-none select-none place-items-center overflow-hidden rounded-control bg-btn-secondary px-5 text-sm font-medium text-btn-secondary-ink",
        className,
      )}
    >
      {faces}
      <motion.span aria-hidden style={{ clipPath: clip }} className={cn("absolute inset-0 grid place-items-center px-5", fill)}>
        {faces}
      </motion.span>
      <span className="sr-only" aria-live="polite">{done ? doneLabel : ""}</span>
    </motion.button>
  );
}
