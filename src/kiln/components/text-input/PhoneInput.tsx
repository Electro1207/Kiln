import { useId, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { motion } from "motion/react";
import { ChevronDown, Search } from "lucide-react";
import { cn } from "../../cn";
import { springSnappy } from "../../motion";
import { Field, inputBox } from "../shared/Field";
import { AnchoredLayer, RowHighlight, optionClass, panelClass } from "../shared/Anchored";
import { countBefore, placeCaret, positionAfter } from "./caret";
import { useControllable, type Size } from "../../controllable";

export type Country = {
  /** ISO 3166-1 alpha-2, e.g. "GB". */
  code: string;
  name: string;
  /** Without the plus, e.g. "44". */
  dial: string;
  /** National number layout, one # per digit, e.g. "#### ######". */
  pattern: string;
};

/** A starter list; pass your own `countries` for full coverage. */
export const COUNTRIES: Country[] = [
  { code: "US", name: "United States", dial: "1", pattern: "(###) ###-####" },
  { code: "CA", name: "Canada", dial: "1", pattern: "(###) ###-####" },
  { code: "GB", name: "United Kingdom", dial: "44", pattern: "#### ######" },
  { code: "IE", name: "Ireland", dial: "353", pattern: "## ### ####" },
  { code: "AU", name: "Australia", dial: "61", pattern: "### ### ###" },
  { code: "NZ", name: "New Zealand", dial: "64", pattern: "## ### ####" },
  { code: "DE", name: "Germany", dial: "49", pattern: "#### #######" },
  { code: "FR", name: "France", dial: "33", pattern: "# ## ## ## ##" },
  { code: "ES", name: "Spain", dial: "34", pattern: "### ### ###" },
  { code: "IT", name: "Italy", dial: "39", pattern: "### ### ####" },
  { code: "NL", name: "Netherlands", dial: "31", pattern: "# ########" },
  { code: "IN", name: "India", dial: "91", pattern: "##### #####" },
  { code: "JP", name: "Japan", dial: "81", pattern: "##-####-####" },
  { code: "TN", name: "Tunisia", dial: "216", pattern: "## ### ###" },
];

const isDigit = (c: string) => c >= "0" && c <= "9";
const digitsIn = (p: string) => [...p].filter((c) => c === "#").length;

/** Lay digits into a pattern, stopping where the digits run out (no dangling separators). */
export function applyPattern(digits: string, pattern: string) {
  let out = "";
  let i = 0;
  for (const ch of pattern) {
    if (i >= digits.length) break;
    if (ch === "#") out += digits[i++];
    else out += ch;
  }
  return out + digits.slice(i);
}

export type PhoneValue = { country: string; national: string };

/**
 * A country picker beside a number that formats as you type. Codes are shown
 * as text ("GB +44"), not flags. `toE164` gives the international form.
 * Controlled with `value` + `onChange`, or uncontrolled with `defaultValue`.
 */
/** Icons used by PhoneInput. Pass a partial via `icons` to replace them. */
export interface PhoneInputIcons {
  /** Chevron on the country button; it turns over while open. */
  chevron: ReactNode;
  /** Magnifier in the country search. */
  search: ReactNode;
}
export const phoneInputIcons: PhoneInputIcons = { chevron: <ChevronDown />, search: <Search /> };

/** Text used by PhoneInput. Pass a partial via `labels` to translate or reword. */
export interface PhoneInputLabels {
  /** Default field label (the `label` prop wins). */
  label: string;
  /** aria-label of the country button. */
  country: (name: string, dial: string) => string;
  /** aria-label of the country list and its popover. */
  countries: string;
  /** Placeholder of the country search box. */
  searchPlaceholder: string;
  /** aria-label of the country search box. */
  search: string;
  /** Shown when no country matches the search. */
  noMatch: string;
  /** Validation message for a number of the wrong length. */
  wrongLength: (name: string, need: number, have: number) => string;
}
export const phoneInputLabels: PhoneInputLabels = {
  label: "Phone number",
  country: (name, dial) => `Country: ${name}, +${dial}. Change`,
  countries: "Countries",
  searchPlaceholder: "Search countries or codes",
  search: "Search countries",
  noMatch: "No country matches. Not even Alderaan.",
  wrongLength: (name, need, have) => `A ${name} number has ${need} digits; this has ${have}.`,
};

export function PhoneInput({ value: valueProp, defaultValue, onChange: onChangeProp, countries = COUNTRIES, label: labelProp, hint, size = "md", className, labels, icons }: {
  /** The number; leave out to let the component keep it. */
  value?: PhoneValue;
  /** Starting number when uncontrolled. Defaults to the first country, empty. */
  defaultValue?: PhoneValue;
  onChange?: (v: PhoneValue) => void;
  /** Countries to offer. Defaults to a short starter list. */
  countries?: Country[];
  label?: ReactNode;
  hint?: ReactNode;
  /** Height and text size. Defaults to md. */
  size?: Size;
  className?: string;
  /** Override any UI text. Merged over `phoneInputLabels`. */
  labels?: Partial<PhoneInputLabels>;
  /** Replace any built-in icon. Merged over `phoneInputIcons`. */
  icons?: Partial<PhoneInputIcons>;
}) {
  const l = { ...phoneInputLabels, ...labels };
  const ic = { ...phoneInputIcons, ...icons };
  const label = labelProp ?? l.label;
  const [value, onChange] = useControllable<PhoneValue>(valueProp, defaultValue ?? { country: countries[0].code, national: "" }, onChangeProp);
  const id = useId();
  const listId = useId();
  const input = useRef<HTMLInputElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const [touched, setTouched] = useState(false);

  const country = countries.find((c) => c.code === value.country) ?? countries[0];
  const need = digitsIn(country.pattern);
  const shown = applyPattern(value.national, country.pattern);
  const complete = value.national.length === need;
  const error = touched && value.national.length > 0 && !complete
    ? l.wrongLength(country.name, need, value.national.length)
    : undefined;

  const list = useMemo(() => {
    const s = q.trim().toLowerCase().replace(/^\+/, "");
    return s ? countries.filter((c) => c.name.toLowerCase().includes(s) || c.code.toLowerCase() === s || c.dial.startsWith(s)) : countries;
  }, [q, countries]);

  const pick = (c: Country) => {
    onChange({ country: c.code, national: value.national.slice(0, digitsIn(c.pattern)) });
    setOpen(false);
    setQ("");
    requestAnimationFrame(() => input.current?.focus());
  };

  const onListKey = (e: KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(list.length - 1, a + 1)); }
    if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(0, a - 1)); }
    if (e.key === "Enter" && list[active]) { e.preventDefault(); pick(list[active]); }
  };

  return (
    <Field id={id} label={label} hint={hint} error={error} className={className}>
      <div className={inputBox(!!error, size)}>
        <button
          ref={trigger}
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-label={l.country(country.name, country.dial)}
          onClick={() => { setActive(Math.max(0, countries.indexOf(country))); setOpen((o) => !o); }}
          className="-ml-1.5 flex h-7 shrink-0 items-center gap-1.5 rounded-md px-1.5 text-sm text-ink transition-colors hover:bg-raised"
        >
          <span className="font-medium">{country.code}</span>
          <span className="text-muted tabular">+{country.dial}</span>
          <motion.span initial={false} animate={{ rotate: open ? 180 : 0 }} transition={springSnappy} className="grid text-faint [&>svg]:size-3.5">{ic.chevron}</motion.span>
        </button>
        <span aria-hidden className="h-5 w-px shrink-0 bg-line" />
        <input
          ref={input}
          id={id}
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          placeholder={country.pattern.replace(/#/g, "0")}
          value={shown}
          aria-invalid={!!error || undefined}
          aria-describedby={error || hint ? `${id}-msg` : undefined}
          onChange={(e) => {
            const raw = e.target.value;
            const caret = e.target.selectionStart ?? raw.length;
            let n = countBefore(raw, caret, isDigit);
            let national = raw.replace(/\D/g, "").slice(0, need);
            // Backspace over a separator ("(212) |555") removes the digit before it, as people expect.
            if (raw.length < shown.length && national === value.national && n > 0) {
              national = national.slice(0, n - 1) + national.slice(n);
              n -= 1;
            }
            onChange({ country: country.code, national });
            placeCaret(input.current, positionAfter(applyPattern(national, country.pattern), Math.min(n, national.length), isDigit));
          }}
          onBlur={() => setTouched(true)}
          className="h-full min-w-0 flex-1 bg-transparent text-ink outline-none tabular placeholder:text-faint"
        />
      </div>
      <AnchoredLayer open={open} onClose={() => { setOpen(false); setQ(""); }} anchor={trigger} placement="bottom-start" className={cn(panelClass, "w-72 p-0")} aria-label={l.countries}>
        <div className="flex items-center gap-2 border-b border-line px-3">
          <span className="grid shrink-0 place-items-center text-faint [&>svg]:size-4" aria-hidden>{ic.search}</span>
          <input
            autoFocus
            value={q}
            onChange={(e) => { setQ(e.target.value); setActive(0); }}
            onKeyDown={onListKey}
            placeholder={l.searchPlaceholder}
            aria-label={l.search}
            aria-controls={listId}
            aria-activedescendant={list[active] ? `${listId}-${list[active].code}` : undefined}
            className="h-10 min-w-0 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-faint"
          />
        </div>
        <ul id={listId} role="listbox" aria-label={l.countries} className="max-h-64 overflow-y-auto p-1" onMouseLeave={() => {}}>
          {list.length === 0 && <li className="px-3 py-6 text-center text-[13px] text-muted">{l.noMatch}</li>}
          {list.map((c, i) => (
            <li
              key={c.code}
              id={`${listId}-${c.code}`}
              role="option"
              aria-selected={c.code === country.code}
              onPointerMove={() => active !== i && setActive(i)}
              onClick={() => pick(c)}
              className={cn(optionClass, "relative")}
            >
              <RowHighlight on={active === i} />
              <span className="w-7 font-medium text-ink">{c.code}</span>
              <span className="min-w-0 flex-1 truncate">{c.name}</span>
              <span className="text-muted tabular">+{c.dial}</span>
            </li>
          ))}
        </ul>
      </AnchoredLayer>
    </Field>
  );
}

export const toE164 = (v: PhoneValue, countries = COUNTRIES) => {
  const c = countries.find((x) => x.code === v.country);
  return c && v.national ? `+${c.dial}${v.national}` : "";
};
