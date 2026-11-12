import { forwardRef, useId, useMemo, useState, type InputHTMLAttributes, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Eye, EyeOff, Lock } from "lucide-react";
import { cn } from "../../cn";
import { easeOut, spring, springSnappy } from "../../motion";
import { Field, inputBox } from "../shared/Field";
import { useControllable, type Size } from "../../controllable";

export type PasswordRule = { label: string; test: (v: string) => boolean };

export const defaultPasswordRules: PasswordRule[] = [
  { label: "At least 10 characters", test: (v) => v.length >= 10 },
  { label: "A capital and a lower-case letter", test: (v) => /[a-z]/.test(v) && /[A-Z]/.test(v) },
  { label: "A number", test: (v) => /\d/.test(v) },
  { label: "A symbol such as ! or #", test: (v) => /[^A-Za-z0-9]/.test(v) },
];

/** Icons used by PasswordField. Pass a partial via `icons` to replace them. */
export interface PasswordFieldIcons {
  /** Padlock at the start of the field. */
  lock: ReactNode;
  /** Shown while the password is hidden; click to reveal it. */
  show: ReactNode;
  /** Shown while the password is visible; click to hide it. */
  hide: ReactNode;
}
export const passwordFieldIcons: PasswordFieldIcons = { lock: <Lock />, show: <Eye />, hide: <EyeOff /> };

/** Text used by PasswordField. Pass a partial via `labels` to translate or reword. */
export interface PasswordFieldLabels {
  /** aria-label of the reveal button while the password is hidden. */
  show: string;
  /** aria-label of the reveal button while the password is shown. */
  hide: string;
  /** Strength words for 0 to 4 rules met (five entries). */
  strength: string[];
  /** Strength text while the field is empty. */
  empty: string;
  /** Screen-reader suffix on a rule that is met. */
  met: string;
  /** Screen-reader suffix on a rule that is not met. */
  notMet: string;
}
export const passwordFieldLabels: PasswordFieldLabels = {
  show: "Show password",
  hide: "Hide password",
  strength: ["Too weak", "Weak", "Fair", "Good", "Strong"],
  empty: "—",
  met: " (met)",
  notMet: " (not met)",
};

const levels = [
  { word: "Too weak", bar: "bg-negative", text: "text-negative" },
  { word: "Weak", bar: "bg-negative", text: "text-negative" },
  { word: "Fair", bar: "bg-warning", text: "text-warning" },
  { word: "Good", bar: "bg-info", text: "text-info" },
  { word: "Strong", bar: "bg-positive", text: "text-positive" },
];

/** A password input with show/hide and, for new passwords, a strength meter and rule list. */
export const PasswordField = forwardRef<HTMLInputElement, Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "defaultValue" | "onChange" | "type" | "size"> & {
  /** Controlled text. Leave out and use `defaultValue` to let the field keep its own. */
  value?: string;
  defaultValue?: string;
  onValueChange?: (v: string) => void;
  size?: Size;
  label?: ReactNode;
  error?: ReactNode;
  /** Show the strength meter and rule list (for new passwords). */
  meter?: boolean;
  rules?: PasswordRule[];
  /** Override any UI text. Merged over `passwordFieldLabels`. */
  labels?: Partial<PasswordFieldLabels>;
  /** Replace any built-in icon. Merged over `passwordFieldIcons`. */
  icons?: Partial<PasswordFieldIcons>;
}>(function PasswordField({ value: valueProp, defaultValue = "", onValueChange: onValueProp, label = "Password", error, meter, rules = defaultPasswordRules, size = "md", id: idProp, labels, icons, ...rest }, ref) {
  const l = { ...passwordFieldLabels, ...labels };
  const ic = { ...passwordFieldIcons, ...icons };
  const [value, onValueChange] = useControllable(valueProp, defaultValue, onValueProp);
  const autoId = useId();
  const id = idProp ?? autoId;
  const [shown, setShown] = useState(false);
  const passed = useMemo(() => rules.map((r) => r.test(value)), [rules, value]);
  const score = value ? passed.filter(Boolean).length : 0;
  const level = levels[Math.min(score, levels.length - 1)];

  return (
    <Field id={id} label={label} error={error}>
      <div className={inputBox(!!error, size)}>
        <span className="grid shrink-0 place-items-center text-faint [&>svg]:size-4" aria-hidden>{ic.lock}</span>
        <input
          ref={ref}
          id={id}
          type={shown ? "text" : "password"}
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          aria-invalid={!!error || undefined}
          aria-describedby={meter ? `${id}-rules` : undefined}
          autoComplete={meter ? "new-password" : "current-password"}
          className="h-full min-w-0 flex-1 bg-transparent text-ink outline-none placeholder:text-faint"
          {...rest}
        />
        <button
          type="button"
          onClick={() => setShown((s) => !s)}
          aria-label={shown ? l.hide : l.show}
          aria-pressed={shown}
          className="grid size-7 shrink-0 place-items-center rounded-md text-muted transition-colors hover:bg-raised hover:text-ink [&>*]:[grid-area:1/1] [&_svg]:size-4"
        >
          <motion.span className="grid" initial={false} animate={{ opacity: shown ? 0 : 1, scale: shown ? 0.7 : 1 }} transition={springSnappy}>
            {ic.show}
          </motion.span>
          <motion.span className="grid" initial={false} animate={{ opacity: shown ? 1 : 0, scale: shown ? 1 : 0.7 }} transition={springSnappy}>
            {ic.hide}
          </motion.span>
        </button>
      </div>
      <AnimatePresence initial={false}>
      {meter && (
        <motion.div
          key="meter"
          id={`${id}-rules`}
          className="flex flex-col gap-2.5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: 0.22, delay: 0.16, ease: easeOut } }}
          exit={{ opacity: 0, transition: { duration: 0.08 } }}
        >
          <div className="flex items-center gap-3">
            <div className="grid flex-1 grid-cols-4 gap-1.5" aria-hidden>
              {rules.slice(0, 4).map((_, i) => (
                <div key={i} className="h-1 overflow-hidden rounded-full bg-active">
                  <motion.div
                    className={cn("h-full origin-left rounded-full transition-colors duration-300", level.bar)}
                    initial={false}
                    animate={{ scaleX: i < score ? 1 : 0 }}
                    transition={{ ...spring, delay: i < score ? i * 0.04 : 0 }}
                  />
                </div>
              ))}
            </div>
            <span className={cn("w-16 text-right text-[13px] font-medium transition-colors duration-300", value ? level.text : "text-faint")} aria-live="polite">
              {value ? (l.strength[Math.min(score, levels.length - 1)] ?? level.word) : l.empty}
            </span>
          </div>
          <ul className="grid gap-1 sm:grid-cols-2">
            {rules.map((r, i) => (
              <li key={r.label} className={cn("flex items-center gap-2 text-[13px] transition-colors duration-300", passed[i] ? "text-ink" : "text-muted")}>
                <svg viewBox="0 0 16 16" className="size-3.5 shrink-0" aria-hidden>
                  <circle cx="8" cy="8" r="7" className={cn("transition-colors duration-300", passed[i] ? "fill-positive" : "fill-active")} />
                  <motion.path d="M5 8.2l2 2L11 6" fill="none" stroke="var(--k-surface)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
                    initial={false} animate={{ pathLength: passed[i] ? 1 : 0, opacity: passed[i] ? 1 : 0 }} transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }} />
                </svg>
                <span>{r.label}<span className="sr-only">{passed[i] ? l.met : l.notMet}</span></span>
              </li>
            ))}
          </ul>
        </motion.div>
      )}
      </AnimatePresence>
    </Field>
  );
});
