import { LayoutGroup, motion } from "motion/react";
import { Check } from "lucide-react";
import { useId, useMemo, useState, type ReactNode } from "react";
import { cn } from "../../cn";
import { fade, press, springSoft } from "../../motion";
import { useA11yProps, type AccessibilityFeaturesProp } from "../../a11y";

export type ChipOption = { value: string; label: string; count?: number };

/** Icons used by ChipFilter. Pass a partial via `icons` to replace them. */
export interface ChipFilterIcons {
  /** Tick that grows in on an active chip. */
  check: ReactNode;
}
export const chipFilterIcons: ChipFilterIcons = { check: <Check /> };

type Base = {
  options: ChipOption[];
  /** Accessible name of the group. */
  label?: string;
  /** Replace any built-in icon. Merged over `chipFilterIcons`. */
  icons?: Partial<ChipFilterIcons>;
  className?: string;
  /** Accessibility features to add for this group only (`calm` and `reduceMotion` stop neighbours gliding aside and the press shrink; adds to the person's settings, never removes them). */
  accessibilityFeatures?: AccessibilityFeaturesProp;
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
  const { a11y, rootProps } = useA11yProps(props.accessibilityFeatures);
  const still = a11y.calm || a11y.reduceMotion;
  const ic = useMemo(() => ({ ...chipFilterIcons, ...props.icons }), [props.icons]);
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
      <div role="group" aria-label={props.label} {...rootProps} className={cn("flex flex-wrap gap-2", props.className)}>
        {props.options.map((o) => {
          const on = isOn(o.value);
          return (
            <motion.button
              key={o.value}
              type="button"
              aria-pressed={on}
              onClick={() => toggle(o.value)}
              layout={still ? false : "position"}
              whileTap={still ? undefined : press}
              transition={springSoft}
              className={cn(
                // The fill cross-fades over 160ms; the text colour switches in one step once the
                // fill is three-quarters there, so the label never passes through grey-on-grey.
                "inline-flex h-8 items-center rounded-full px-3 text-[0.8125rem] transition-[background-color,color] [transition-delay:0ms,100ms] [transition-duration:160ms,0ms] ease-in-out-soft",
                on ? "bg-btn-primary text-btn-primary-ink hover:bg-btn-primary-hover" : "bg-surface text-ink hover:bg-active",
              )}
            >
              {/* The tick takes a fixed 20px slot, so the chip changes width in one step and its
                  neighbours glide aside on a transform (layout="position"); no width is animated. */}
              {on && (
                <motion.span
                  aria-hidden
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={fade}
                  className="inline-flex w-5 shrink-0 [&>svg]:size-3.5 [&>svg]:shrink-0 [&>svg]:[stroke-width:2.75]"
                >
                  {ic.check}
                </motion.span>
              )}
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
