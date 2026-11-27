import { forwardRef, useImperativeHandle, useLayoutEffect, useRef, type ChangeEvent } from "react";
import { cn } from "../../cn";
import { useControllable } from "../../controllable";
import { type AccessibilityFeaturesProp } from "../../a11y";
import { TextField, type TextFieldProps } from "./TextField";

/**
 * A mask is a pattern. `9` takes a digit, `A` a letter, `*` a letter or digit; every other
 * character is shown as it is. A function gets what has been typed so far (without the
 * punctuation) and returns the pattern to use, so the shape can change as the person types.
 */
export type Mask = string | ((raw: string) => string);

const test = (slot: string, ch: string) =>
  slot === "9" ? /\d/.test(ch) : slot === "A" ? /\p{L}/u.test(ch) : /[\p{L}\d]/u.test(ch);
const isSlot = (c: string) => c === "9" || c === "A" || c === "*";

/** Fill a mask from raw characters. `ends[k]` is the display index just after the k-th raw character. */
function fill(mask: string, raw: string) {
  let display = "";
  const ends: number[] = [];
  let r = 0;
  for (let p = 0; p < mask.length; p++) {
    const m = mask[p];
    if (isSlot(m)) {
      while (r < raw.length && !test(m, raw[r])) r++;
      if (r >= raw.length) break;
      display += raw[r++];
      ends.push(display.length);
    } else {
      // A literal only shows once another character is waiting to follow it.
      if (r >= raw.length) break;
      display += m;
    }
  }
  return { display, ends };
}

/** Pull the raw characters out of what the person typed or pasted, walking the mask. */
function parse(mask: string, typed: string) {
  let raw = "";
  let p = 0;
  for (const ch of typed) {
    while (p < mask.length && !isSlot(mask[p])) {
      if (mask[p] === ch) break;
      p++;
    }
    if (p >= mask.length) break;
    if (!isSlot(mask[p])) { p++; continue; }
    if (test(mask[p], ch)) { raw += ch; p++; }
  }
  return raw;
}

const maskOf = (mask: Mask, raw: string) => (typeof mask === "function" ? mask(raw) : mask);

/** Text used by MaskedInput. Pass a partial via `labels` to translate or reword. */
export interface MaskedInputLabels {
  /** Suffix of the label of an optional field. */
  optional: string;
}
export const maskedInputLabels: MaskedInputLabels = { optional: "optional" };

export type MaskedInputProps = Omit<TextFieldProps, "value" | "defaultValue" | "onValueChange" | "type" | "labels"> & {
  /** The pattern: `"(999) 999-9999"`, `"AA-9999"`, or a function from the raw text to a pattern. */
  mask: Mask;
  /** The raw value, without punctuation (`"5551234567"`). Leave out to let the field keep its own. */
  value?: string;
  defaultValue?: string;
  /** Called with the raw value, without punctuation. */
  onValueChange?: (raw: string) => void;
  /** Called once when every slot of the mask is filled. */
  onComplete?: (raw: string) => void;
  /** Turn letters into capitals as they are typed. */
  uppercase?: boolean;
  /** Override any UI text. Merged over `maskedInputLabels`. */
  labels?: Partial<MaskedInputLabels>;
  /** Turn accessibility features on for this component only. */
  accessibilityFeatures?: AccessibilityFeaturesProp;
};

/** A text field that formats as you type (phone, plate, code). The caret stays where you are typing. */
export const MaskedInput = forwardRef<HTMLInputElement, MaskedInputProps>(function MaskedInput(
  { mask, value, defaultValue = "", onValueChange, onComplete, uppercase, onChange, onClear, placeholder, inputMode, labels, accessibilityFeatures, containerClassName, ...rest },
  ref,
) {
  const input = useRef<HTMLInputElement>(null);
  useImperativeHandle(ref, () => input.current!);
  const [raw, setRaw] = useControllable<string>(value, defaultValue, onValueChange);
  const caret = useRef<number | null>(null);

  const pattern = maskOf(mask, raw);
  const { display } = fill(pattern, uppercase ? raw.toUpperCase() : raw);

  useLayoutEffect(() => {
    if (caret.current == null) return;
    const el = input.current;
    if (el && document.activeElement === el) el.setSelectionRange(caret.current, caret.current);
    caret.current = null;
  });

  const handle = (e: ChangeEvent<HTMLInputElement>) => {
    const el = e.target;
    let typed = el.value;
    if (uppercase) typed = typed.toUpperCase();
    // Pick the pattern from what is there, then read the characters through it.
    const plain = typed.replace(/[^\p{L}\d]/gu, "");
    const pat = maskOf(mask, plain);
    const next = parse(pat, typed);
    const out = fill(maskOf(mask, next), next);
    // Where the caret goes: just after the same number of raw characters that were before it.
    const before = parse(pat, typed.slice(0, el.selectionStart ?? typed.length)).length;
    caret.current = before === 0 ? 0 : out.ends[Math.min(before, out.ends.length) - 1] ?? out.display.length;
    // A forced redraw: when the text does not change, React will not touch the DOM, so set it here.
    if (el.value !== out.display) el.value = out.display;
    const full = !!out.display && out.ends.length === [...maskOf(mask, next)].filter(isSlot).length;
    if (next !== raw) setRaw(next);
    else if (document.activeElement === el && caret.current != null) { el.setSelectionRange(caret.current, caret.current); caret.current = null; }
    onChange?.(e);
    if (full && next !== raw) onComplete?.(next);
  };

  const slots = [...pattern].filter(isSlot).length;
  const numeric = slots > 0 && [...pattern].every((c) => !isSlot(c) || c === "9");
  const hint = typeof mask === "string" ? mask.replace(/[9A*]/g, "_") : undefined;

  return (
    <TextField
      ref={input}
      {...rest}
      accessibilityFeatures={accessibilityFeatures}
      value={display}
      onChange={handle}
      onClear={() => { setRaw(""); onClear?.(); }}
      placeholder={placeholder ?? hint}
      inputMode={inputMode ?? (numeric ? "numeric" : "text")}
      autoComplete={rest.autoComplete ?? "off"}
      spellCheck={false}
      labels={labels}
      containerClassName={cn("tabular", containerClassName)}
    />
  );
});
