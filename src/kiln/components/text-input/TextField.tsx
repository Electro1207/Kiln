import { forwardRef, useEffect, useId, useImperativeHandle, useRef, useState, type InputHTMLAttributes, type ReactNode } from "react";
import { AnimatePresence, motion, useAnimate } from "motion/react";
import { X } from "lucide-react";
import { cn } from "../../cn";
import { springSnappy } from "../../motion";
import { Field, inputBox } from "../shared/Field";
import type { Size } from "../../controllable";

/** Text used by TextField. Pass a partial via `labels` to translate or reword. */
export interface TextFieldLabels {
  /** aria-label of the clear button. */
  clear: string;
  /** Suffix after the label when `optional` is set. */
  optional: string;
}
export const textFieldLabels: TextFieldLabels = { clear: "Clear", optional: "optional" };

/** Icons used by TextField. Pass a partial via `icons` to replace them. */
export interface TextFieldIcons {
  /** Clear button. */
  clear: ReactNode;
}
export const textFieldIcons: TextFieldIcons = { clear: <X /> };

export type TextFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "size"> & {
  /** Visible label. Without one, pass `aria-label`. */
  label?: ReactNode;
  /** Help text under the field; replaced by `error` while there is one. */
  hint?: ReactNode;
  error?: ReactNode;
  leading?: ReactNode;
  trailing?: ReactNode;
  /** Shows an × that empties the field (controlled use: pass onClear). */
  clearable?: boolean;
  onClear?: () => void;
  optional?: boolean;
  size?: Size;
  /** Called with the new text. `onChange` still receives the native event. */
  onValueChange?: (value: string) => void;
  /** Root (label, box and message). `className` styles the `<input>` itself. */
  containerClassName?: string;
  /** The bordered box around the input. Use it for a custom height or width. */
  boxClassName?: string;
  /** Override any UI text. Merged over `textFieldLabels`. */
  labels?: Partial<TextFieldLabels>;
  /** Replace any built-in icon. Merged over `textFieldIcons`. */
  icons?: Partial<TextFieldIcons>;
};

/** A labelled text input: native `<input>` props plus label, hint, error, icons and a clear button. */

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { label, hint, error, leading, trailing, clearable, onClear, optional, size = "md", onValueChange, id: idProp, className, containerClassName, boxClassName, value, defaultValue, onChange, labels, icons, ...rest },
  ref,
) {
  const l = { ...textFieldLabels, ...labels };
  const ic = { ...textFieldIcons, ...icons };
  const autoId = useId();
  const id = idProp ?? autoId;
  const input = useRef<HTMLInputElement>(null);
  useImperativeHandle(ref, () => input.current!);
  const [inner, setInner] = useState(String(defaultValue ?? ""));
  const current = value !== undefined ? String(value) : inner;
  const [scope, animate] = useAnimate();

  const lastError = useRef(error);
  useEffect(() => {
    if (error && error !== lastError.current && scope.current) {
      animate(scope.current, { x: [0, -6, 5, -3, 2, 0] }, { duration: 0.42, ease: "easeOut" });
    }
    lastError.current = error;
  }, [error, animate, scope]);

  return (
    <Field id={id} label={label} hint={hint} error={error} optional={optional} labels={{ optional: l.optional }} className={containerClassName}>
      <div ref={scope} className={cn(inputBox(!!error, size), boxClassName)}>
        {leading && <span className="shrink-0 text-faint transition-colors group-focus-within/box:text-muted [&_svg]:size-4">{leading}</span>}
        <input
          ref={input}
          id={id}
          value={value}
          defaultValue={value === undefined ? defaultValue : undefined}
          onChange={(e) => { if (value === undefined) setInner(e.target.value); onChange?.(e); onValueChange?.(e.target.value); }}
          aria-invalid={!!error || undefined}
          aria-describedby={error || hint ? `${id}-msg` : undefined}
          className={cn("h-full min-w-0 flex-1 bg-transparent text-ink outline-none placeholder:text-faint", className)}
          {...rest}
        />
        <AnimatePresence initial={false}>
          {clearable && current.length > 0 && (
            <motion.button
              type="button"
              aria-label={l.clear}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={springSnappy}
              onClick={() => {
                if (value === undefined) { setInner(""); if (input.current) input.current.value = ""; }
                onClear?.();
                onValueChange?.("");
                input.current?.focus();
              }}
              className="grid size-5 shrink-0 place-items-center rounded-full bg-active text-muted hover:text-ink [&>svg]:size-3 [&>svg]:[stroke-width:2.5]"
            >
              {ic.clear}
            </motion.button>
          )}
        </AnimatePresence>
        {trailing && <span className="shrink-0 text-faint [&_svg]:size-4">{trailing}</span>}
      </div>
    </Field>
  );
});
