import { forwardRef, useId, type ReactNode } from "react";
import { motion } from "motion/react";
import { cn } from "../../cn";
import { fade, springSnappy } from "../../motion";
import { useControllable, type Size } from "../../controllable";

export type CheckedState = boolean | "indeterminate";

const boxes: Record<Size, { box: string; tick: string; text: string }> = {
  sm: { box: "size-4 rounded-[4px]", tick: "size-3", text: "text-[13px]" },
  md: { box: "size-[18px] rounded-[5px]", tick: "size-3.5", text: "text-sm" },
  lg: { box: "size-[22px] rounded-[6px]", tick: "size-4", text: "text-[15px]" },
};

export type CheckboxProps = {
  /** Controlled state. Leave out and use `defaultChecked` to let the box keep its own. */
  checked?: CheckedState;
  defaultChecked?: CheckedState;
  onCheckedChange?: (v: boolean) => void;
  label?: ReactNode;
  description?: ReactNode;
  size?: Size;
  disabled?: boolean;
  className?: string;
  id?: string;
  name?: string;
};

/** A checkbox with an optional label and description. Supports `"indeterminate"`. */
export const Checkbox = forwardRef<HTMLButtonElement, CheckboxProps>(function Checkbox(
  { checked: checkedProp, defaultChecked = false, onCheckedChange, label, description, size = "md", disabled, className, id: idProp, name },
  ref,
) {
  const [checked, setChecked] = useControllable<CheckedState>(checkedProp, defaultChecked, onCheckedChange as (v: CheckedState) => void);
  const sz = boxes[size];
  const autoId = useId();
  const id = idProp ?? autoId;
  const on = checked === true;
  const mixed = checked === "indeterminate";
  return (
    <div className={cn("group flex items-start gap-3", disabled && "opacity-50", className)}>
      <motion.button
        ref={ref}
        id={id}
        type="button"
        role="checkbox"
        aria-checked={mixed ? "mixed" : on}
        aria-describedby={description ? `${id}-d` : undefined}
        disabled={disabled}
        name={name}
        onClick={() => setChecked(mixed ? true : !on)}
        whileTap={{ scale: 0.92 }}
        transition={springSnappy}
        className={cn(
          "relative mt-0.5 grid shrink-0 place-items-center border transition-[background-color,border-color] duration-200 ease-out-soft",
          sz.box,
          on || mixed ? "border-btn-primary bg-btn-primary text-btn-primary-ink" : "border-line-strong bg-surface group-hover:border-faint",
        )}
      >
        <svg viewBox="0 0 16 16" className={sz.tick} aria-hidden>
          <motion.path
            d="M3.5 8.5l3 3 6-7"
            fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
            initial={false}
            animate={{ pathLength: on ? 1 : 0, opacity: on ? 1 : 0 }}
            transition={{ pathLength: springSnappy, opacity: { duration: on ? 0.05 : 0.15 } }}
          />
          <motion.path
            d="M4 8h8"
            fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"
            initial={false}
            animate={{ opacity: mixed ? 1 : 0 }}
            transition={fade}
          />
        </svg>
      </motion.button>
      {(label || description) && (
        <div className="min-w-0">
          {label && <label htmlFor={id} className={cn("block cursor-pointer select-none text-ink", sz.text)}>{label}</label>}
          {description && <p id={`${id}-d`} className="text-[13px] text-muted">{description}</p>}
        </div>
      )}
    </div>
  );
});
