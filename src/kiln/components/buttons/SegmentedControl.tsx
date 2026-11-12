import { useRef, type KeyboardEvent, type ReactNode } from "react";
import { motion } from "motion/react";
import { cn } from "../../cn";
import { fade } from "../../motion";
import { useControllable, type Size } from "../../controllable";

export type Segment<T extends string> = { value: T; label: ReactNode; icon?: ReactNode };

const segSizes: Record<Size, string> = {
  sm: "h-7 px-2.5 text-[13px]",
  md: "h-8 px-3.5 text-sm",
  lg: "h-10 px-4 text-[15px]",
};

export type SegmentedControlProps<T extends string> = {
  options: Segment<T>[];
  /** Controlled value. Leave out and use `defaultValue` (or nothing: the first option) to let it keep its own. */
  value?: T;
  defaultValue?: T;
  onChange?: (v: T) => void;
  size?: Size;
  /** Accessible name for the group. */
  label?: string;
  className?: string;
  /** Stretch to the container's width, segments sharing it equally. */
  fullWidth?: boolean;
};

/** A row of mutually exclusive options; the chosen one gets a raised fill that fades in place. */
export function SegmentedControl<T extends string>({
  options, value: valueProp, defaultValue, onChange: onChangeProp, size = "md", label, className, fullWidth,
}: SegmentedControlProps<T>) {
  const [value, onChange] = useControllable<T>(valueProp, (defaultValue ?? options[0]?.value) as T, onChangeProp);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const onKey = (e: KeyboardEvent, i: number) => {
    const d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    const n = (i + d + options.length) % options.length;
    onChange(options[n].value);
    refs.current[n]?.focus();
  };
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn("relative isolate inline-flex rounded-control bg-active p-1 dark:bg-ground", fullWidth && "flex w-full", className)}
    >
      {options.map((o, i) => {
        const on = o.value === value;
        return (
          <button
            key={o.value}
            ref={(el) => { refs.current[i] = el; }}
            type="button"
            role="radio"
            aria-checked={on}
            tabIndex={on ? 0 : -1}
            onClick={() => onChange(o.value)}
            onKeyDown={(e) => onKey(e, i)}
            className={cn(
              "relative inline-flex flex-1 items-center justify-center whitespace-nowrap font-medium transition-colors duration-200",
              segSizes[size],
              on ? "text-ink" : "text-muted hover:text-ink",
              "[&_svg]:size-4",
            )}
            style={{ borderRadius: 6 }}
          >
            <motion.span aria-hidden initial={false} animate={{ opacity: on ? 1 : 0 }} transition={fade}
                className="pointer-events-none absolute inset-0 bg-elevated"
                style={{ borderRadius: 6 }}
              />
            {/* The label sits above the travelling pill, in every item, so the pill never covers a word. */}
            <span className="relative z-[1] inline-flex items-center gap-1.5">
              {o.icon}
              {o.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
