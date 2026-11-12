import { useId, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Minus, Plus } from "lucide-react";
import { cn } from "../../cn";
import { springSnappy } from "../../motion";
import { useControllable, type Size } from "../../controllable";

/** Text used by NumberField. Pass a partial via `labels` to translate or reword. */
export interface NumberFieldLabels {
  /** aria-label of the minus button. */
  decrease: string;
  /** aria-label of the plus button. */
  increase: string;
}
export const numberFieldLabels: NumberFieldLabels = { decrease: "Decrease", increase: "Increase" };

/** A stepper. Digits roll up or down as the number changes. Hold a button to repeat. */
const nfSizes: Record<Size, { box: string; btn: string; text: string }> = {
  sm: { box: "h-8", btn: "size-8", text: "text-[13px] min-w-12" },
  md: { box: "h-10", btn: "size-10", text: "text-sm min-w-16" },
  lg: { box: "h-12", btn: "size-12", text: "text-[15px] min-w-20" },
};

/** A number input with stepper buttons and arrow-key stepping. Controlled with `value` + `onChange`, or uncontrolled with `defaultValue`. */
export function NumberField({
  value: valueProp, defaultValue, onChange: onChangeProp, min = -Infinity, max = Infinity, step = 1, label, suffix, size = "md", className, labels,
}: {
  /** Controlled number. Leave out and use `defaultValue` to let the field keep its own. */
  value?: number;
  /** Starting number when uncontrolled. Defaults to `min` when it is finite, else 0. */
  defaultValue?: number;
  onChange?: (v: number) => void;
  size?: Size;
  min?: number;
  max?: number;
  step?: number;
  label?: ReactNode;
  suffix?: ReactNode;
  className?: string;
  /** Override any UI text. Merged over `numberFieldLabels`. */
  labels?: Partial<NumberFieldLabels>;
}) {
  const l = { ...numberFieldLabels, ...labels };
  const [value, onChange] = useControllable(valueProp, defaultValue ?? (Number.isFinite(min) ? min : 0), onChangeProp);
  const sz = nfSizes[size];
  const id = useId();
  const [dir, setDir] = useState(1);
  const [editing, setEditing] = useState<string | null>(null);
  const timer = useRef<number | undefined>(undefined);
  const latest = useRef(value);
  latest.current = value;

  const clamp = (n: number) => Math.min(max, Math.max(min, n));
  const bump = (d: number) => {
    const n = clamp(Number((latest.current + d * step).toFixed(6)));
    if (n === latest.current) return;
    setDir(d);
    latest.current = n;
    onChange(n);
  };
  const startRepeat = (d: number) => {
    bump(d);
    let delay = 380;
    const tick = () => { bump(d); delay = Math.max(50, delay * 0.8); timer.current = window.setTimeout(tick, delay); };
    timer.current = window.setTimeout(tick, delay);
  };
  const stop = () => window.clearTimeout(timer.current);

  const commit = () => {
    if (editing === null) return;
    const n = Number(editing);
    if (!Number.isNaN(n) && editing.trim() !== "") { setDir(n >= value ? 1 : -1); onChange(clamp(n)); }
    setEditing(null);
  };

  const chars = String(value).split("");
  const btn = cn(sz.btn, "grid shrink-0 place-items-center text-muted transition-colors hover:bg-raised hover:text-ink disabled:opacity-40 disabled:hover:bg-transparent");

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {label && <label htmlFor={id} className="text-sm font-medium text-ink">{label}</label>}
      <div className={cn(sz.box, "inline-flex w-fit items-center overflow-hidden rounded-control border border-line-strong bg-surface transition-[border-color,box-shadow] duration-200 focus-within:border-accent focus-within:ring-[3px] focus-within:ring-accent/20")}>
        <motion.button type="button" aria-label={l.decrease} tabIndex={-1} disabled={value <= min} whileTap={{ scale: 0.85 }} transition={springSnappy}
          onPointerDown={(e) => { e.preventDefault(); startRepeat(-1); }} onPointerUp={stop} onPointerLeave={stop} onPointerCancel={stop}
          className={btn}>
          <Minus className="size-4" />
        </motion.button>
        <div className={cn("relative flex h-full items-center justify-center px-1 font-medium text-ink tabular", sz.text)}>
          <input
            id={id}
            role="spinbutton"
            inputMode="decimal"
            aria-valuenow={value}
            aria-valuemin={Number.isFinite(min) ? min : undefined}
            aria-valuemax={Number.isFinite(max) ? max : undefined}
            value={editing ?? String(value)}
            onFocus={(e) => { setEditing(String(value)); requestAnimationFrame(() => e.target.select()); }}
            onChange={(e) => setEditing(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === "ArrowUp") { e.preventDefault(); setEditing(null); bump(1); }
              if (e.key === "ArrowDown") { e.preventDefault(); setEditing(null); bump(-1); }
              if (e.key === "Enter") (e.target as HTMLInputElement).blur();
            }}
            className={cn("absolute inset-0 w-full bg-transparent text-center outline-none", editing === null && "text-transparent caret-transparent")}
          />
          {editing === null && (
            <span aria-hidden className="pointer-events-none flex overflow-hidden">
              {chars.map((c, i) => (
                <span key={chars.length - i} className="grid [&>*]:[grid-area:1/1]">
                  <AnimatePresence initial={false} custom={dir}>
                    <motion.span
                      key={c}
                      custom={dir}
                      variants={{
                        enter: (d: number) => ({ y: d > 0 ? "100%" : "-100%", opacity: 0 }),
                        center: { y: "0%", opacity: 1 },
                        exit: (d: number) => ({ y: d > 0 ? "-100%" : "100%", opacity: 0 }),
                      }}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={springSnappy}
                      className="inline-block"
                    >
                      {c}
                    </motion.span>
                  </AnimatePresence>
                </span>
              ))}
              {suffix && <span className="ml-1 text-muted">{suffix}</span>}
            </span>
          )}
        </div>
        <motion.button type="button" aria-label={l.increase} tabIndex={-1} disabled={value >= max} whileTap={{ scale: 0.85 }} transition={springSnappy}
          onPointerDown={(e) => { e.preventDefault(); startRepeat(1); }} onPointerUp={stop} onPointerLeave={stop} onPointerCancel={stop}
          className={btn}>
          <Plus className="size-4" />
        </motion.button>
      </div>
    </div>
  );
}
