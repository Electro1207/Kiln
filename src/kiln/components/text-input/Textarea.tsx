import { forwardRef, useId, useImperativeHandle, useLayoutEffect, useRef, useState, type ReactNode, type TextareaHTMLAttributes } from "react";
import { animate, motion, useMotionValue } from "motion/react";
import { cn } from "../../cn";
import { springFirm } from "../../motion";
import { Field } from "../shared/Field";
import type { Size } from "../../controllable";

const textareaSizes: Record<Size, string> = {
  sm: "px-2.5 py-2 text-[13px] leading-5",
  md: "px-3 py-2.5 text-sm leading-5",
  lg: "px-4 py-3 text-[15px] leading-6",
};

/** Grows with its text, eased rather than jumping line by line. */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: ReactNode; hint?: ReactNode; error?: ReactNode;
  /** Height bounds in lines: it grows with the text between them. */
  minRows?: number; maxRows?: number;
  /** Show "n / maxLength" by the label. */
  showCount?: boolean;
  /** Called with the new text. `onChange` still receives the native event. */
  onValueChange?: (value: string) => void;
  /** Text size and padding. Defaults to md. */
  size?: Size;
  /** Root (label, box and message). `className` styles the `<textarea>` itself. */
  containerClassName?: string;
}>(function Textarea({ label, hint, error, minRows = 3, maxRows = 10, size = "md", showCount, maxLength, id: idProp, className, containerClassName, value, defaultValue, onChange, onValueChange, ...rest }, ref) {
  const autoId = useId();
  const id = idProp ?? autoId;
  const el = useRef<HTMLTextAreaElement>(null);
  useImperativeHandle(ref, () => el.current!);
  const [inner, setInner] = useState(String(defaultValue ?? ""));
  const text = value !== undefined ? String(value) : inner;
  const height = useMotionValue<number | "auto">("auto");
  const first = useRef(true);
  const [capped, setCapped] = useState(false);

  useLayoutEffect(() => {
    const t = el.current;
    if (!t) return;
    const cs = getComputedStyle(t);
    const line = parseFloat(cs.lineHeight) || 20;
    const pad = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);
    const prev = t.style.height;
    t.style.height = "0px";
    const target = Math.min(Math.max(t.scrollHeight, line * minRows + pad), line * maxRows + pad);
    t.style.height = prev;
    setCapped(t.scrollHeight > line * maxRows + pad);
    if (first.current) { height.set(target); first.current = false; }
    else animate(height, target, springFirm);
  }, [text, minRows, maxRows, height]);

  const over = maxLength != null && text.length >= maxLength;
  return (
    <Field
      id={id}
      className={containerClassName}
      label={label}
      hint={hint}
      error={error}
      aside={showCount && maxLength ? (
        <span className={cn("text-[13px] tabular transition-colors", over ? "text-negative" : "text-muted")}>{text.length} / {maxLength}</span>
      ) : undefined}
    >
      <motion.textarea
        ref={el}
        id={id}
        style={{ height, overflowY: capped ? "auto" : "hidden" }}
        value={value}
        defaultValue={value === undefined ? defaultValue : undefined}
        maxLength={maxLength}
        onChange={(e) => { if (value === undefined) setInner(e.target.value); onChange?.(e); onValueChange?.(e.target.value); }}
        aria-invalid={!!error || undefined}
        aria-describedby={error || hint ? `${id}-msg` : undefined}
        className={cn(
          "w-full resize-none rounded-control border bg-surface text-ink outline-none placeholder:text-faint",
          textareaSizes[size],
          "transition-[border-color,box-shadow] duration-200 ease-out-soft focus:ring-[3px]",
          error ? "border-negative focus:ring-negative/20" : "border-line-strong hover:border-faint focus:border-accent focus:ring-accent/20",
          className,
        )}
        {...(rest as object)}
      />
    </Field>
  );
});
