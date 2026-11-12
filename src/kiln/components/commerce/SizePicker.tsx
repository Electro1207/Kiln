import { useId, useRef, type KeyboardEvent } from "react";
import { motion } from "motion/react";
import { cn } from "../../cn";
import { fade } from "../../motion";
import { useControllable } from "../../controllable";

export type SizeOption = { value: string; label?: string; soldOut?: boolean };

/** Text used by SizePicker. Pass a partial via `labels` to translate or reword. */
export interface SizePickerLabels {
  /** Default heading when no `label` prop is given. */
  size: string;
  /** aria-label of a sold-out size, given its label. */
  soldOut: (size: string) => string;
}
export const sizePickerLabels: SizePickerLabels = { size: "Size", soldOut: (s) => `${s}, sold out` };

/**
 * A grid of sizes. Each tile owns its fill, which fades in when chosen; sold-out
 * sizes are struck through and cannot be picked.
 * Controlled with `value` + `onChange`, or uncontrolled with `defaultValue`.
 */
export function SizePicker({ label, sizes, value: valueProp, defaultValue = null, onChange: onChangeProp, guide, className, labels }: {
  label?: string;
  sizes: SizeOption[];
  /** Chosen size, or null for none; leave out to let the component keep it. */
  value?: string | null;
  /** Starting size when uncontrolled. */
  defaultValue?: string | null;
  onChange?: (v: string) => void;
  /** Optional link or button beside the label, e.g. a size guide. */
  guide?: React.ReactNode;
  className?: string;
  /** Override any UI text. Merged over `sizePickerLabels`. */
  labels?: Partial<SizePickerLabels>;
}) {
  const l = { ...sizePickerLabels, ...labels };
  const id = useId();
  const [value, setValue] = useControllable<string | null>(valueProp, defaultValue, (v) => v != null && onChangeProp?.(v));
  const onChange = (v: string) => setValue(v);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const open = sizes.map((s, i) => (s.soldOut ? -1 : i)).filter((i) => i >= 0);

  const onKey = (e: KeyboardEvent, i: number) => {
    const d = ["ArrowRight", "ArrowDown"].includes(e.key) ? 1 : ["ArrowLeft", "ArrowUp"].includes(e.key) ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    const n = open[(open.indexOf(i) + d + open.length) % open.length];
    onChange(sizes[n].value);
    refs.current[n]?.focus();
  };

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="flex items-baseline justify-between gap-3">
        <span id={`${id}-l`} className="text-sm font-medium text-ink">{label ?? l.size}</span>
        {guide}
      </div>
      <div role="radiogroup" aria-labelledby={`${id}-l`} className="grid grid-cols-4 gap-2 sm:grid-cols-6">
        {sizes.map((s, i) => {
          const on = s.value === value;
          const first = value == null && i === open[0];
          return (
            <button
              key={s.value}
              ref={(el) => { refs.current[i] = el; }}
              type="button"
              role="radio"
              aria-checked={on}
              aria-disabled={s.soldOut || undefined}
              aria-label={s.soldOut ? l.soldOut(s.label ?? s.value) : undefined}
              tabIndex={on || first ? 0 : -1}
              onClick={() => !s.soldOut && onChange(s.value)}
              onKeyDown={(e) => onKey(e, i)}
              className={cn(
                "group relative grid h-11 place-items-center rounded-control border text-sm font-medium",
                s.soldOut ? "cursor-not-allowed border-line text-faint" : "border-line-strong bg-surface text-ink hover:border-faint",
              )}
            >
              <motion.span aria-hidden initial={false} animate={{ opacity: on ? 1 : 0 }} transition={fade} className="pointer-events-none absolute -inset-px rounded-control bg-btn-primary" />
              {/* The label turns light part-way through the fill's fade, so no frame shows grey on grey. */}
              <span className={cn("relative z-[1] transition-[color] delay-[80ms] duration-0", on && "text-btn-primary-ink")}>{s.label ?? s.value}</span>
              {s.soldOut && (
                <svg aria-hidden className="pointer-events-none absolute inset-0 size-full text-line-strong" preserveAspectRatio="none" viewBox="0 0 100 100">
                  <line x1="4" y1="96" x2="96" y2="4" stroke="currentColor" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
                </svg>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
