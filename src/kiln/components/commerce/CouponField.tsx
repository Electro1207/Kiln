import { forwardRef, useEffect, useId, useMemo, useRef, useState, type HTMLAttributes, type ReactNode } from "react";
import { AnimatePresence, motion, useAnimate } from "motion/react";
import { Ticket } from "lucide-react";
import { cn } from "../../cn";
import { fade } from "../../motion";
import { useControllable, type Size } from "../../controllable";
import { useA11yProps, type AccessibilityFeaturesProp } from "../../a11y";
import { Button } from "../buttons/Button";
import { Tag } from "../data-display/Tag";
import { TextField } from "../text-input/TextField";
import { FieldMessage } from "../notices/FieldMessage";

export type CouponResult = {
  ok: boolean;
  /** Shown under the field: why it failed, or what the code did. */
  message?: string;
};

/** Text used by CouponField. Pass a partial via `labels` to translate or reword. */
export interface CouponFieldLabels {
  /** Label above the input. */
  label: string;
  placeholder: string;
  /** The apply button. */
  apply: string;
  /** Said when Apply is pressed with nothing typed. */
  empty: string;
  /** Said when `onApply` throws or rejects. */
  failed: string;
  /** Said under an applied code when `onApply` gave no message. */
  applied: (code: string) => string;
}
export const couponFieldLabels: CouponFieldLabels = {
  label: "Promo code",
  placeholder: "Enter a code",
  apply: "Apply",
  empty: "Type a code first.",
  failed: "That did not work. Try again in a moment.",
  applied: (code) => `${code} applied.`,
};

/** Icons used by CouponField. Pass a partial via `icons` to swap any of them. */
export interface CouponFieldIcons {
  /** Beside the applied code. */
  coupon: ReactNode;
}
export const couponFieldIcons: CouponFieldIcons = { coupon: <Ticket /> };

export type CouponFieldProps = Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "children" | "defaultValue"> & {
  /** Checks a code. Resolve `{ ok: true }` to apply it; `{ ok: false, message }` shows the message as an error. */
  onApply: (code: string) => Promise<CouponResult> | CouponResult;
  /** The applied code, or `null`. Leave out to let the field keep its own. */
  value?: string | null;
  defaultValue?: string | null;
  /** Called with the code when one is applied, and `null` when it is removed. */
  onChange?: (code: string | null) => void;
  /** Help text under the field while nothing is wrong. */
  hint?: ReactNode;
  size?: Size;
  disabled?: boolean;
  /** Override any UI text. Merged over `couponFieldLabels`. */
  labels?: Partial<CouponFieldLabels>;
  /** Replace any built-in icon. Merged over `couponFieldIcons`. */
  icons?: Partial<CouponFieldIcons>;
  /** Accessibility features to add for this field only. Adds to the person's own settings, never removes them. */
  accessibilityFeatures?: AccessibilityFeaturesProp;
};

const cell: Record<Size, string> = { sm: "min-h-8", md: "min-h-10", lg: "min-h-12" };

/**
 * A promo code box: type a code, press Apply (or Enter), and it is checked by your `onApply`.
 * A good code becomes a chip you can remove; a bad one says why, under the field.
 */
export const CouponField = forwardRef<HTMLDivElement, CouponFieldProps>(function CouponField(
  { onApply, value: valueProp, defaultValue = null, onChange, hint, size = "md", disabled, labels, icons, accessibilityFeatures, className, style, ...rest },
  ref,
) {
  const l = { ...couponFieldLabels, ...labels };
  const ic = useMemo(() => ({ ...couponFieldIcons, ...icons }), [icons]);
  const { a11y, rootProps } = useA11yProps(accessibilityFeatures);
  const still = a11y.reduceMotion || a11y.calm || a11y.noFlashing;
  const [applied, setApplied] = useControllable<string | null>(valueProp, defaultValue, onChange);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const chip = useRef<HTMLDivElement>(null);
  const [scope, animate] = useAnimate();
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  // A new error nudges the row once, like every Kiln field.
  const shown = useRef<string | null>(null);
  useEffect(() => {
    if (error && error !== shown.current && scope.current && !still) animate(scope.current, { x: [0, -6, 5, -3, 2, 0] }, { duration: 0.42, ease: "easeOut" });
    shown.current = error;
  }, [error, animate, scope, still]);

  const submit = async () => {
    if (busy || disabled) return;
    const code = text.trim();
    if (!code) {
      setSuccess(null);
      setError(l.empty);
      input.current?.focus();
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const result = await onApply(code);
      if (!mounted.current) return;
      if (result.ok) {
        setApplied(code);
        setSuccess(result.message ?? l.applied(code));
        setText("");
        requestAnimationFrame(() => chip.current?.querySelector("button")?.focus());
      } else {
        setError(result.message ?? l.failed);
      }
    } catch {
      if (mounted.current) setError(l.failed);
    } finally {
      if (mounted.current) setBusy(false);
    }
  };

  const remove = () => {
    setApplied(null);
    setSuccess(null);
    setError(null);
    requestAnimationFrame(() => input.current?.focus());
  };

  const has = applied != null;
  const message = error ?? (has ? success : null) ?? hint;
  const tone = error ? "error" : has && success ? "success" : "hint";

  return (
    <div ref={ref} {...rest} {...rootProps} className={cn("k-fill flex min-w-0 flex-col", className)} style={{ ...rootProps.style, ...style }}>
      <label htmlFor={`${id}-input`} className="mb-2 text-sm font-medium text-ink">{l.label}</label>
      <div className={cn("grid [&>*]:[grid-area:1/1]", cell[size])}>
        <AnimatePresence initial={false}>
          {has ? (
            <motion.div
              key="applied"
              ref={chip}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={fade}
              className="flex items-center"
            >
              <Tag tone="positive" size={size} leading={ic.coupon} onRemove={disabled ? undefined : remove}>
                {applied}
              </Tag>
            </motion.div>
          ) : (
            <motion.div
              key="field"
              ref={scope}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={fade}
              className="flex items-start gap-2"
            >
              <TextField
                ref={input}
                id={`${id}-input`}
                size={size}
                value={text}
                disabled={disabled}
                readOnly={busy}
                placeholder={l.placeholder}
                autoComplete="off"
                autoCapitalize="characters"
                spellCheck={false}
                aria-invalid={!!error || undefined}
                aria-describedby={message ? `${id}-msg` : undefined}
                boxClassName={error ? "border-negative focus-within:border-negative focus-within:ring-negative/20" : undefined}
                containerClassName="min-w-0 flex-1"
                onValueChange={(v) => {
                  setText(v);
                  if (error) setError(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    void submit();
                  }
                }}
              />
              <Button size={size} variant="secondary" loading={busy} disabled={disabled} onClick={() => void submit()}>
                {l.apply}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <FieldMessage id={`${id}-msg`} tone={tone}>{message}</FieldMessage>
    </div>
  );
});
