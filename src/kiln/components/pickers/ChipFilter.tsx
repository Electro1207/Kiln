import { LayoutGroup, motion } from "motion/react";
import { Check } from "lucide-react";
import { useId, useState } from "react";
import { cn } from "../../cn";
import { fade, press, springFirm, springSoft } from "../../motion";

export type ChipOption = { value: string; label: string; count?: number };

type Base = {
  options: ChipOption[];
  /** Accessible name of the group. */
  label?: string;
  className?: string;
};
export type ChipFilterProps =
  | (Base & {
      /** Several chips can be on (default). */
      multiple?: true;
      /** Selected values; leave out to let the component keep them. */
      value?: string[];
      /** Starting values when uncontrolled. */
      defaultValue?: string[];
      onChange?: (v: string[]) => void;
    })
  | (Base & {
      /** Only one chip can be on. */
      multiple: false;
      value?: string | null;
      defaultValue?: string | null;
      onChange?: (v: string | null) => void;
    });

/**
 * A row of toggle chips for filtering a list. Chips grow to make room for their tick, and their neighbours glide aside.
 * Controlled with `value` + `onChange`, or uncontrolled with `defaultValue`.
 */
export function ChipFilter(props: ChipFilterProps) {
  const id = useId();
  const single = props.multiple === false;
  const [inner, setInner] = useState<string[] | string | null>(props.defaultValue ?? (single ? null : []));
  const current = props.value !== undefined ? props.value : inner;
  const isOn = (v: string) => (single ? current === v : (current as string[]).includes(v));
  const toggle = (v: string) => {
    if (props.multiple === false) {
      const next = current === v ? null : v;
      setInner(next);
      props.onChange?.(next);
    } else {
      const list = current as string[];
      const next = list.includes(v) ? list.filter((x) => x !== v) : [...list, v];
      setInner(next);
      props.onChange?.(next);
    }
  };

  return (
    <LayoutGroup id={id}>
      <div role="group" aria-label={props.label} className={cn("flex flex-wrap gap-2", props.className)}>
        {props.options.map((o) => {
          const on = isOn(o.value);
          return (
            <motion.button
              key={o.value}
              type="button"
              aria-pressed={on}
              onClick={() => toggle(o.value)}
              whileTap={press}
              transition={springSoft}
              className={cn(
                // The fill cross-fades over 160ms; the text colour switches in one step once the
                // fill is three-quarters there, so the label never passes through grey-on-grey.
                "inline-flex h-8 items-center rounded-full px-3 text-[13px] transition-[background-color,color] [transition-delay:0ms,100ms] [transition-duration:160ms,0ms] ease-in-out-soft",
                on ? "bg-btn-primary text-btn-primary-ink hover:bg-btn-primary-hover" : "bg-surface text-ink hover:bg-active",
              )}
            >
              {/* The tick's slot opens to make room, so the chip and its neighbours reflow
                  smoothly instead of scaling; the tick fades in inside it. */}
              <motion.span
                aria-hidden
                initial={false}
                animate={{ width: on ? 20 : 0, opacity: on ? 1 : 0 }}
                transition={{ width: springFirm, opacity: fade }}
                className="inline-flex shrink-0 overflow-hidden"
              >
                <Check className="size-3.5 shrink-0" strokeWidth={2.75} />
              </motion.span>
              <span>{o.label}</span>
              {o.count != null && (
                <span className={cn("ml-1.5 tabular transition-colors [transition-delay:100ms] duration-0", on ? "text-btn-primary-ink/75" : "text-muted")}>{o.count}</span>
              )}
            </motion.button>
          );
        })}
      </div>
    </LayoutGroup>
  );
}
