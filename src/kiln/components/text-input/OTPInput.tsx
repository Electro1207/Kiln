import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion, useAnimate, useReducedMotion } from "motion/react";
import { cn } from "../../cn";
import { easeOut, springLand, useMotionTier } from "../../motion";
import { useControllable } from "../../controllable";

/**
 * A one-time code: separate cells drawn over one real <input>,
 * so paste, SMS autofill, the keyboard and screen readers behave as in any field.
 * The cell being typed in lights its edge and a soft halo in place (nothing travels between
 * cells), each digit sets down into its cell, and a caret blinks in the next empty one.
 */
/** Text used by OTPInput. Pass a partial via `labels` to translate or reword. */
export interface OTPInputLabels {
  /** Default field label (the `label` prop wins). */
  label: string;
  /** Screen-reader announcement once every digit is filled. */
  complete: string;
}
export const otpInputLabels: OTPInputLabels = { label: "Verification code", complete: "Code complete" };

export function OTPInput({
  length = 6, value: valueProp, defaultValue = "", onChange: onChangeProp, onComplete, label: labelProp, error, disabled, className, labels,
}: {
  length?: number;
  /** Controlled code. Leave out and use `defaultValue` to let the field keep its own. */
  value?: string;
  defaultValue?: string;
  onChange?: (v: string) => void;
  onComplete?: (v: string) => void;
  label?: string;
  /** Override any UI text. Merged over `otpInputLabels`. */
  labels?: Partial<OTPInputLabels>;
  /** Turn true to show a refusal: the row nudges, the way a wrong key does. */
  error?: boolean;
  disabled?: boolean;
  className?: string;
}) {
  const l = { ...otpInputLabels, ...labels };
  const label = labelProp ?? l.label;
  const [value, onChange] = useControllable(valueProp, defaultValue, onChangeProp);
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const [focused, setFocused] = useState(false);
  const reduce = useReducedMotion();
  // Low-end devices keep the drop but skip the blur, which repaints every frame.
  const lite = useMotionTier() === "lite";
  const [scope, animate] = useAnimate<HTMLDivElement>();

  useEffect(() => {
    if (error && !reduce && scope.current) animate(scope.current, { x: [0, -7, 6, -4, 2, 0] }, { duration: 0.42, ease: [0.33, 1, 0.68, 1] });
  }, [error, reduce, animate, scope]);

  const set = (raw: string) => {
    const v = raw.replace(/\D/g, "").slice(0, length);
    onChange(v);
    if (v.length === length && v !== value) onComplete?.(v);
  };

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label htmlFor={id} className="text-sm font-medium text-ink">{label}</label>
      <div ref={scope} className="relative w-[360px] max-w-full">
        <div aria-hidden className="grid gap-2" style={{ gridTemplateColumns: `repeat(${length}, minmax(0, 1fr))` }}>
          {Array.from({ length }, (_, i) => {
            const digit = value[i];
            const current = focused && !disabled && i === Math.min(value.length, length - 1);
            return (
              <div
                key={i}
                className={cn(
                  "relative flex h-[52px] items-center justify-center rounded-control border bg-surface font-mono text-[22px] text-ink transition-[border-color,box-shadow] duration-200 ease-out-soft",
                  error
                    ? "border-negative shadow-[0_0_0_3px_var(--k-negative-soft)]"
                    : current
                      ? "border-focus-edge shadow-[0_0_0_3px_var(--k-focus-wash)]"
                      : "border-line",
                  disabled && "opacity-60",
                )}
              >
                <AnimatePresence initial={false}>
                  {digit && (
                    <motion.span
                      key={digit + i}
                      initial={reduce ? { opacity: 0 } : lite ? { opacity: 0, y: -8 } : { opacity: 0, y: -8, filter: "blur(3px)" }}
                      animate={lite ? { opacity: 1, y: 0 } : { opacity: 1, y: 0, filter: "blur(0px)" }}
                      exit={{ opacity: 0, transition: { duration: 0.08, ease: easeOut } }}
                      transition={springLand}
                      className="absolute"
                    >
                      {digit}
                    </motion.span>
                  )}
                </AnimatePresence>
                {current && !digit && <span className="animate-caret h-6 w-px bg-ink" />}
              </div>
            );
          })}
        </div>
        <input
          ref={input}
          id={id}
          value={value}
          onChange={(e) => set(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9]*"
          maxLength={length}
          disabled={disabled}
          aria-invalid={error || undefined}
          className={"absolute inset-0 h-full w-full cursor-text opacity-0"}
        />
      </div>
      <span className="sr-only" aria-live="polite">{value.length === length ? l.complete : ""}</span>
    </div>
  );
}
