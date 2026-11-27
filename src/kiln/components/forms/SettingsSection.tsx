import { useId, type ReactNode } from "react";
import { cn } from "../../cn";
import { useA11yProps, type AccessibilityFeaturesProp } from "../../a11y";

/**
 * One settings group in two columns: what it is on the left, the controls in a
 * panel on the right. Stacks on phones.
 */
export function SettingsSection({ title, description, aside, children, className, accessibilityFeatures }: {
  title: ReactNode;
  description?: ReactNode;
  /** Extra notes under the description, e.g. a summary of the current values. */
  aside?: ReactNode;
  children: ReactNode;
  className?: string;
  /** Accessibility features to add for this section (it is a labelled landmark with nothing that moves; the controls inside answer the features themselves). Adds to the person's own settings, never removes them. */
  accessibilityFeatures?: AccessibilityFeaturesProp;
}) {
  const { rootProps } = useA11yProps(accessibilityFeatures);
  const id = useId();
  return (
    <section {...rootProps} aria-labelledby={`${id}-t`} className={cn("grid gap-4 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] md:gap-10", className)}>
      <div className="md:pt-1">
        <h3 id={`${id}-t`} className="text-base font-medium text-ink">{title}</h3>
        {description && <p className="mt-1 max-w-sm text-sm text-muted">{description}</p>}
        {aside && <div className="mt-4 text-sm text-muted">{aside}</div>}
      </div>
      <div className="flex min-w-0 flex-col gap-4 rounded-sheet bg-surface p-4 sm:p-5">{children}</div>
    </section>
  );
}

/** A row inside a settings panel: title and description on the left, a control on the right. */
export function SettingsRow({ title, description, control, htmlFor }: { title: ReactNode; description?: ReactNode; control: ReactNode; htmlFor?: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        {htmlFor ? (
          <label htmlFor={htmlFor} className="block cursor-pointer text-sm font-medium text-ink">{title}</label>
        ) : (
          <span className="block text-sm font-medium text-ink">{title}</span>
        )}
        {description && <p className="mt-0.5 text-[0.8125rem] text-muted">{description}</p>}
      </div>
      <div className="shrink-0 pt-px">{control}</div>
    </div>
  );
}
