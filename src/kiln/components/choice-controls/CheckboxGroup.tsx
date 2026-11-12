import { type ReactNode } from "react";
import { motion } from "motion/react";
import { staggerChild, staggerParent } from "../../motion";
import { Checkbox } from "./Checkbox";
import { cn } from "../../cn";
import { useControllable, type Size } from "../../controllable";

export type CheckOption = { value: string; label: ReactNode; description?: ReactNode };

/** Text used by CheckboxGroup. Pass a partial via `labels` to translate or reword. */
export interface CheckboxGroupLabels {
  /** Label of the parent box. The `selectAllLabel` prop wins. */
  selectAll: string;
}
export const checkboxGroupLabels: CheckboxGroupLabels = { selectAll: "Select all" };

/** A list of checkboxes with a parent "select all" that goes indeterminate. */
export function CheckboxGroup({
  label, options, value: valueProp, defaultValue = [], onChange: onChangeProp, selectAllLabel: selectAllProp, size = "md", className, labels,
}: {
  label: string;
  options: CheckOption[];
  /** Controlled list of checked values. Leave out and use `defaultValue` to let the group keep its own. */
  value?: string[];
  defaultValue?: string[];
  onChange?: (v: string[]) => void;
  /** Label of the parent box. Pass `null` to leave the parent out. */
  selectAllLabel?: ReactNode;
  size?: Size;
  className?: string;
  /** Override any UI text. Merged over `checkboxGroupLabels`. */
  labels?: Partial<CheckboxGroupLabels>;
}) {
  const selectAllLabel = selectAllProp === undefined ? { ...checkboxGroupLabels, ...labels }.selectAll : selectAllProp;
  const [value, onChange] = useControllable(valueProp, defaultValue, onChangeProp);
  const all = value.length === options.length;
  const none = value.length === 0;
  return (
    <fieldset className={cn("flex flex-col gap-3", className)}>
      <legend className="mb-3 text-sm font-medium text-ink">{label}</legend>
      {selectAllLabel !== null && (
        <Checkbox
          size={size}
          checked={all ? true : none ? false : "indeterminate"}
          onCheckedChange={(v) => onChange(v ? options.map((o) => o.value) : [])}
          label={<span className="font-medium">{selectAllLabel}</span>}
        />
      )}
      <motion.div variants={staggerParent} initial="hidden" animate="visible" className={cn("flex flex-col gap-3", selectAllLabel !== null && "ml-[30px]")}>
        {options.map((o) => (
          <motion.div key={o.value} variants={staggerChild}>
            <Checkbox
              size={size}
              checked={value.includes(o.value)}
              onCheckedChange={(on) => onChange(on ? [...value, o.value] : value.filter((v) => v !== o.value))}
              label={o.label}
              description={o.description}
            />
          </motion.div>
        ))}
      </motion.div>
    </fieldset>
  );
}
