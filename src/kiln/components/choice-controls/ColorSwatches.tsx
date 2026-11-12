import { useId, useRef, type KeyboardEvent } from "react";
import { motion } from "motion/react";
import { cn } from "../../cn";
import { useControllable } from "../../controllable";
import { spring, springSnappy, fade } from "../../motion";

export type Swatch = { value: string; name: string; /** Set for pale colours so the tick is drawn dark. */ light?: boolean };

/** Pick one colour. The ring slides to the choice; the tick pops in. */
export function ColorSwatches({ label = "Colour", swatches, value: valueProp, defaultValue, onChange: onChangeProp, className }: {
  label?: string; swatches: Swatch[];
  /** Controlled value. Leave out and use `defaultValue` (or nothing: the first swatch) to let it keep its own. */
  value?: string; defaultValue?: string; onChange?: (v: string) => void; className?: string;
}) {
  const [value, onChange] = useControllable(valueProp, defaultValue ?? swatches[0]?.value ?? "", onChangeProp);
  const id = useId();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const current = swatches.find((s) => s.value === value);
  const onKey = (e: KeyboardEvent, i: number) => {
    const d = ["ArrowRight", "ArrowDown"].includes(e.key) ? 1 : ["ArrowLeft", "ArrowUp"].includes(e.key) ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    const n = (i + d + swatches.length) % swatches.length;
    onChange(swatches[n].value);
    refs.current[n]?.focus();
  };
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="flex items-baseline gap-2">
        <span id={`${id}-l`} className="text-sm font-medium text-ink">{label}</span>
        <span className="text-sm text-muted">{current?.name}</span>
      </div>
      <div role="radiogroup" aria-labelledby={`${id}-l`} className="flex flex-wrap gap-2.5">
        {swatches.map((s, i) => {
          const on = s.value === value;
          return (
            <button
              key={s.value}
              ref={(el) => { refs.current[i] = el; }}
              type="button"
              role="radio"
              aria-checked={on}
              aria-label={s.name}
              tabIndex={on ? 0 : -1}
              onClick={() => onChange(s.value)}
              onKeyDown={(e) => onKey(e, i)}
              className="relative grid size-9 place-items-center rounded-full outline-offset-4"
            >
              <motion.span aria-hidden initial={false} animate={{ opacity: on ? 1 : 0 }} transition={fade} className="pointer-events-none absolute inset-0 z-10 border-2 border-ink" style={{ borderRadius: 18 }} />
              <motion.span
                className="grid size-7 place-items-center rounded-full"
                style={{ background: s.value }}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.9 }}
                transition={spring}
              >
                <svg viewBox="0 0 16 16" className={cn("size-3.5", s.light ? "text-black/80" : "text-white")} aria-hidden>
                  <motion.path d="M3.5 8.5l3 3 6-7" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
                    initial={false} animate={{ pathLength: on ? 1 : 0, opacity: on ? 1 : 0 }} transition={on ? { ...springSnappy, delay: 0.08 } : { duration: 0.1 }} />
                </svg>
              </motion.span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
