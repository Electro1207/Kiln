import { useEffect, useRef, useState, type ReactNode } from "react";
import { animate, motion, useMotionValue, useTransform } from "motion/react";
import { cn } from "../../cn";
import { easeOut, springFirm, springSnappy } from "../../motion";
import { useA11yProps, type AccessibilityFeaturesProp } from "../../a11y";

/** Text used by HoldButton. Pass a partial via `labels` to translate or reword. */
export interface HoldButtonLabels {
  /** Shown once the hold completes. The `doneLabel` prop wins. */
  done: string;
  /** Description announced to assistive tech. */
  holdHint: string;
  /** Shown after the first press when `extendedTime` is on (press, then press again). */
  pressAgain: string;
  /** Description announced to assistive tech when `extendedTime` is on. */
  pressAgainHint: string;
}
export const holdButtonLabels: HoldButtonLabels = {
  done: "Done",
  holdHint: "Press and hold to confirm",
  pressAgain: "Press again to confirm",
  pressAgainHint: "Press once, then press again within a few seconds to confirm",
};

/** How long the second press is waited for under `extendedTime`, in seconds. */
const CONFIRM_WINDOW = 4;

/** Text swaps hand over rather than overlap: the old words leave quickly, then the new ones arrive. */
const textSwap = (show: boolean) => (show ? { duration: 0.18, delay: 0.08, ease: easeOut } : { duration: 0.09, ease: easeOut });

/**
 * For destructive actions: the visitor holds to confirm. Releasing early rewinds smoothly.
 * Works with the pointer and with Space or Enter held. Under `extendedTime` there is nothing to hold:
 * the first press arms it ("Press again to confirm", a few seconds) and the second press confirms.
 */
export function HoldButton({
  children, onConfirm, duration = 1.2, className, tone = "danger", doneLabel: doneLabelProp, labels, accessibilityFeatures,
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
  /** Accessibility features to add here. `extendedTime` replaces holding with press, then press again. Adds to the person's own settings, never removes them. */
  accessibilityFeatures?: AccessibilityFeaturesProp;
}) {
  const { a11y, rootProps } = useA11yProps(accessibilityFeatures);
  const twoStep = a11y.extendedTime;
  const [armed, setArmed] = useState(false);
  const l = { ...holdButtonLabels, ...labels };
  const doneLabel = doneLabelProp ?? l.done;
  const progress = useMotionValue(0);
  const clip = useTransform(progress, (p) => `inset(0 ${100 - p * 100}% 0 0)`);
  const ctrl = useRef<ReturnType<typeof animate> | null>(null);
  const [done, setDone] = useState(false);
  const reset = useRef<number | undefined>(undefined);
  useEffect(() => () => { ctrl.current?.stop(); window.clearTimeout(reset.current); }, []);

  const finish = () => {
    setArmed(false);
    setDone(true);
    onConfirm();
    reset.current = window.setTimeout(() => {
      setDone(false);
      ctrl.current = animate(progress, 0, { duration: 0.5, ease: easeOut });
    }, 1800);
  };

  const start = () => {
    if (done) return;
    ctrl.current?.stop();
    ctrl.current = animate(progress, 1, {
      duration: duration * (1 - progress.get()),
      ease: "linear",
      onComplete: finish,
    });
  };

  // Press-then-confirm: the first press fills the button and lets it drain over the window; the second press confirms.
  const press2 = () => {
    if (done) return;
    ctrl.current?.stop();
    if (armed) {
      progress.set(1);
      finish();
      return;
    }
    setArmed(true);
    progress.set(1);
    ctrl.current = animate(progress, 0, {
      duration: CONFIRM_WINDOW,
      ease: "linear",
      onComplete: () => setArmed(false),
    });
  };
  const cancel = () => {
    if (done || twoStep) return;
    ctrl.current?.stop();
    ctrl.current = animate(progress, 0, springFirm);
  };

  const fill = tone === "danger" ? "bg-btn-danger text-btn-danger-ink" : "bg-btn-primary text-btn-primary-ink";

  const faces = (
    <span className="grid justify-items-center [&>*]:[grid-area:1/1]">
      <motion.span initial={false} animate={{ opacity: done || armed ? 0 : 1 }} transition={textSwap(!done && !armed)}>{children}</motion.span>
      <motion.span initial={false} animate={{ opacity: armed && !done ? 1 : 0 }} transition={textSwap(armed && !done)}>{l.pressAgain}</motion.span>
      <motion.span initial={false} animate={{ opacity: done ? 1 : 0 }} transition={textSwap(done)}>{doneLabel}</motion.span>
    </span>
  );

  return (
    <motion.button
      type="button"
      onPointerDown={twoStep ? undefined : start}
      onPointerUp={cancel}
      onPointerLeave={cancel}
      onPointerCancel={cancel}
      onBlur={cancel}
      onClick={twoStep ? press2 : undefined}
      onKeyDown={twoStep ? undefined : (e) => { if ((e.key === " " || e.key === "Enter") && !e.repeat) { e.preventDefault(); start(); } else if (e.key === "Escape") cancel(); }}
      onKeyUp={twoStep ? undefined : (e) => { if (e.key === " " || e.key === "Enter") cancel(); }}
      onContextMenu={(e) => e.preventDefault()}
      whileTap={{ scale: 0.97 }}
      transition={springSnappy}
      aria-description={twoStep ? l.pressAgainHint : l.holdHint}
      {...rootProps}
      style={rootProps.style}
      className={cn(
        "relative inline-grid h-10 touch-none select-none place-items-center overflow-hidden rounded-control bg-btn-secondary px-5 text-sm font-medium text-btn-secondary-ink",
        className,
      )}
    >
      {faces}
      <motion.span aria-hidden style={{ clipPath: clip }} className={cn("absolute inset-0 grid place-items-center px-5", fill)}>
        {faces}
      </motion.span>
      <span className="sr-only" aria-live="polite">{done ? doneLabel : armed ? l.pressAgain : ""}</span>
    </motion.button>
  );
}
