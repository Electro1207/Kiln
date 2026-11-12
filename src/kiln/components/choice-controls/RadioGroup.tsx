import { useId, useRef, type KeyboardEvent, type ReactNode } from "react";
import { motion } from "motion/react";
import { cn } from "../../cn";
import { fade } from "../../motion";
import { useControllable, type Size } from "../../controllable";

export type RadioOption<T extends string> = { value: T; label: ReactNode; description?: ReactNode; aside?: ReactNode; disabled?: boolean };

/**
 * One choice from a short list. `variant="card"` turns each option into a
 * tile; a ring slides between them.
 */
const radioSizes: Record<Size, { ring: string; dot: string; text: string; pad: string }> = {
  sm: { ring: "size-4", dot: "size-2", text: "text-[13px]", pad: "p-3" },
  md: { ring: "size-[18px]", dot: "size-2.5", text: "text-sm", pad: "p-4" },
  lg: { ring: "size-[22px]", dot: "size-3", text: "text-[15px]", pad: "p-5" },
};

export type RadioGroupProps<T extends string> = {
  /** Visible group label; also its accessible name. */
  label: string;
  options: RadioOption<T>[];
  /** Controlled value. Leave out and use `defaultValue` to let the group keep its own. */
  value?: T;
  defaultValue?: T;
  onChange?: (v: T) => void;
  variant?: "list" | "card";
  columns?: 1 | 2 | 3;
  size?: Size;
  /** Hide the visible label but keep it as the accessible name. */
  hideLabel?: boolean;
  className?: string;
};

/** A group of radio options with arrow-key navigation. Controlled with `value` + `onChange`, or uncontrolled with `defaultValue`. */
export function RadioGroup<T extends string>({
  label, options, value: valueProp, defaultValue, onChange: onChangeProp, variant = "list", columns = 1, size = "md", hideLabel, className,
}: RadioGroupProps<T>) {
  const [value, onChange] = useControllable<T>(valueProp, (defaultValue ?? options.find((o) => !o.disabled)?.value) as T, onChangeProp);
  const sz = radioSizes[size];
  const id = useId();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const enabled = options.map((o, i) => (o.disabled ? -1 : i)).filter((i) => i >= 0);

  const onKey = (e: KeyboardEvent, i: number) => {
    const d = ["ArrowDown", "ArrowRight"].includes(e.key) ? 1 : ["ArrowUp", "ArrowLeft"].includes(e.key) ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    const pos = enabled.indexOf(i);
    const n = enabled[(pos + d + enabled.length) % enabled.length];
    onChange(options[n].value);
    refs.current[n]?.focus();
  };

  const cols = columns === 3 ? "sm:grid-cols-3" : columns === 2 ? "sm:grid-cols-2" : "";

  return (
    <div role="radiogroup" aria-labelledby={`${id}-l`} className={cn("flex flex-col gap-3", className)}>
      <span id={`${id}-l`} className={cn("font-medium text-ink", sz.text, hideLabel && "sr-only")}>{label}</span>
      <div className={cn("grid gap-3", variant === "card" && "isolate", cols)}>
        {options.map((o, i) => {
          const on = o.value === value;
          const dot = (
            <span className={cn(
              "relative mt-0.5 grid shrink-0 place-items-center rounded-full border transition-colors duration-200", sz.ring,
              on ? "border-accent" : cn("border-line-strong group-hover:border-faint", variant === "list" && "bg-surface"),
            )}>
              {/* The dot only fades: a mark that moves or scales inside its ring reads as a wobble. */}
              <motion.span
                className={cn("rounded-full bg-accent", sz.dot)}
                initial={false}
                animate={{ opacity: on ? 1 : 0 }}
                transition={fade}
              />
            </span>
          );
          return (
            <button
              key={o.value}
              ref={(el) => { refs.current[i] = el; }}
              type="button"
              role="radio"
              aria-checked={on}
              disabled={o.disabled}
              tabIndex={on || (!options.some((x) => x.value === value) && i === enabled[0]) ? 0 : -1}
              onClick={() => onChange(o.value)}
              onKeyDown={(e) => onKey(e, i)}
              className={cn(
                "group relative flex items-start gap-3 text-left",
                variant === "card" ? "disabled:[&>span>*]:opacity-50" : "disabled:opacity-50",
                variant === "card" && cn("rounded-card", sz.pad),
              )}
            >
              {/* Layers, all in the group's one stacking context: every tile's background at the
                  bottom (-z-[1]), the travelling selection (tint and ring together) above them, and
                  every tile's content on top (z-[1]). The selection fades out of one tile and into the next:
                  it never travels across the others. */}
              {variant === "card" && (
                <span aria-hidden className="absolute inset-0 -z-[1] rounded-card bg-surface transition-colors duration-200 group-hover:bg-active" />
              )}
              {variant === "card" && (
                <motion.span
                  aria-hidden
                  initial={false}
                  animate={{ opacity: on ? 1 : 0 }}
                  transition={fade}
                  className="pointer-events-none absolute inset-0 border-2 border-accent bg-accent-soft"
                  style={{ borderRadius: 12 }}
                />
              )}
              <span className={cn("contents", variant === "card" && "[&>*]:relative [&>*]:z-[1]")}>
              {dot}
              <span className="min-w-0 flex-1">
                <span className="flex items-baseline justify-between gap-2">
                  <span className={cn("font-medium text-ink", sz.text)}>{o.label}</span>
                  {o.aside && <span className={cn("text-ink tabular", sz.text)}>{o.aside}</span>}
                </span>
                {o.description && <span className="mt-0.5 block text-[13px] text-muted">{o.description}</span>}
              </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
