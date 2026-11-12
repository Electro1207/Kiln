import { useId, useMemo, useRef, useState, type ReactNode } from "react";
import { cn } from "../../cn";
import { Field, inputBox } from "../shared/Field";
import { countBefore, placeCaret, positionAfter } from "./caret";
import { useControllable, type Size } from "../../controllable";

const isDigit = (c: string) => c >= "0" && c <= "9";

/**
 * Money, formatted for the locale as you type (grouping, decimal mark, symbol),
 * with the caret kept beside the digit it was next to. The value is a number
 * of minor units (cents), or null when empty. Controlled with `value` + `onChange`,
 * or uncontrolled with `defaultValue`.
 */
export function CurrencyInput({
  value: valueProp, defaultValue = null, onChange: onChangeProp, currency = "USD", locale = "en-US", label, hint, error, max, size = "md", className, placeholder,
}: {
  /** Amount in minor units; leave out to let the component keep it. */
  value?: number | null;
  /** Starting amount when uncontrolled. */
  defaultValue?: number | null;
  onChange?: (cents: number | null) => void;
  currency?: string;
  locale?: string;
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  /** Largest amount in minor units. */
  max?: number;
  /** Height and text size. Defaults to md. */
  size?: Size;
  className?: string;
  placeholder?: string;
}) {
  const id = useId();
  const [value, onChange] = useControllable<number | null>(valueProp, defaultValue, onChangeProp);
  const input = useRef<HTMLInputElement>(null);

  const fmt = useMemo(() => new Intl.NumberFormat(locale, { style: "currency", currency }), [locale, currency]);
  const parts = useMemo(() => fmt.formatToParts(1234.5), [fmt]);
  const decimal = parts.find((p) => p.type === "decimal")?.value ?? ".";
  const fraction = fmt.resolvedOptions().maximumFractionDigits ?? 2;
  const symbol = parts.find((p) => p.type === "currency")?.value ?? "";
  const symbolFirst = parts.findIndex((p) => p.type === "currency") < parts.findIndex((p) => p.type === "integer");
  const grouping = useMemo(() => new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }), [locale]);

  // The text shown while editing keeps what the person typed after the decimal mark
  // ("12." stays "12." rather than snapping to "12.00").
  const [draft, setDraft] = useState<string | null>(null);
  const shown = draft ?? (value == null ? "" : fmt.format(value / 10 ** fraction));

  const build = (intDigits: string, frac: string | null) => {
    const int = intDigits.replace(/^0+(?=\d)/, "");
    const body = (int ? grouping.format(Number(int)) : frac != null ? "0" : "") + (frac != null ? decimal + frac : "");
    if (!body) return "";
    return symbolFirst ? `${symbol}${body}` : `${body} ${symbol}`;
  };

  const onInput = (raw: string, caret: number) => {
    const di = Math.max(raw.lastIndexOf(decimal), decimal !== "." ? raw.lastIndexOf(".") : -1);
    let intDigits = (di >= 0 ? raw.slice(0, di) : raw).replace(/\D/g, "");
    let frac = di >= 0 ? raw.slice(di + 1).replace(/\D/g, "").slice(0, fraction) : null;
    if (fraction === 0) frac = null;
    if (intDigits.length > 13) intDigits = intDigits.slice(0, 13);
    let cents = intDigits || frac ? Number(intDigits || "0") * 10 ** fraction + Number((frac ?? "").padEnd(fraction, "0") || "0") : null;
    if (cents != null && max != null && cents > max) {
      cents = max;
      const whole = Math.floor(max / 10 ** fraction);
      intDigits = String(whole);
      frac = fraction ? String(max % 10 ** fraction).padStart(fraction, "0") : null;
    }
    const next = build(intDigits, frac);
    const n = countBefore(raw, caret, isDigit);
    setDraft(next);
    onChange(cents);
    const justTypedMark = raw[caret - 1] === decimal || raw[caret - 1] === ".";
    placeCaret(input.current, justTypedMark && next.includes(decimal) ? next.lastIndexOf(decimal) + 1 : positionAfter(next, n, isDigit));
  };

  return (
    <Field id={id} label={label} hint={hint} error={error} className={className}>
      <div className={inputBox(!!error, size)}>
        <input
          ref={input}
          id={id}
          inputMode="decimal"
          autoComplete="off"
          placeholder={placeholder ?? fmt.format(0)}
          value={shown}
          aria-invalid={!!error || undefined}
          aria-describedby={error || hint ? `${id}-msg` : undefined}
          onChange={(e) => onInput(e.target.value, e.target.selectionStart ?? e.target.value.length)}
          onBlur={() => setDraft(null)}
          className={cn("h-full min-w-0 flex-1 bg-transparent text-ink outline-none tabular placeholder:text-faint")}
        />
        <span className="shrink-0 text-[13px] text-faint">{currency}</span>
      </div>
    </Field>
  );
}
