import { forwardRef, useId, type FieldsetHTMLAttributes, type ReactNode } from "react";
import { cn } from "../../cn";
import { FieldMessage } from "../notices/FieldMessage";
import { useA11yProps, type AccessibilityFeaturesProp } from "../../a11y";

export type FieldsetProps = Omit<FieldsetHTMLAttributes<HTMLFieldSetElement>, "children"> & {
  /** The group's name, read before every field inside it. */
  legend: ReactNode;
  /** Help text under the legend. Tied to the group with `aria-describedby`. */
  description?: ReactNode;
  /** An error for the group as a whole ("Pick at least one"). Tied to the group and announced. */
  error?: ReactNode;
  /** Disables every field inside, natively. */
  disabled?: boolean;
  /** Draw a border and padding around the group. Default false. */
  bordered?: boolean;
  children?: ReactNode;
  /** The `<legend>` only. */
  legendClassName?: string;
  /** Turn accessibility features on for this component only. */
  accessibilityFeatures?: AccessibilityFeaturesProp;
};

/** A real `<fieldset>` and `<legend>` for a group of related fields: radios, checkboxes, an address. */
export const Fieldset = forwardRef<HTMLFieldSetElement, FieldsetProps>(function Fieldset(
  { legend, description, error, disabled, bordered, children, className, legendClassName, accessibilityFeatures, style, id: idProp, "aria-describedby": describedBy, ...rest },
  ref,
) {
  const auto = useId();
  const id = idProp ?? auto;
  const { rootProps } = useA11yProps(accessibilityFeatures);
  const hasError = error != null && error !== false && error !== "";
  const ids = [description ? `${id}-desc` : null, hasError ? `${id}-err` : null, describedBy].filter(Boolean).join(" ") || undefined;
  return (
    <fieldset
      ref={ref}
      id={id}
      disabled={disabled}
      aria-describedby={ids}
      aria-invalid={hasError || undefined}
      {...rest}
      {...rootProps}
      style={{ ...rootProps.style, ...style }}
      className={cn(
        "m-0 min-w-0 transition-opacity duration-200 disabled:opacity-50",
        bordered ? "rounded-card border border-line p-4 sm:p-5" : "border-0 p-0",
        className,
      )}
    >
      <legend className={cn("mb-0 p-0 text-sm font-medium text-ink", bordered && "px-1.5", legendClassName)}>{legend}</legend>
      {description && <p id={`${id}-desc`} className="mt-1 text-[0.8125rem] text-muted">{description}</p>}
      <div className="mt-3 flex flex-col gap-3">{children}</div>
      <FieldMessage id={`${id}-err`} tone="error">{hasError ? error : null}</FieldMessage>
    </fieldset>
  );
});
