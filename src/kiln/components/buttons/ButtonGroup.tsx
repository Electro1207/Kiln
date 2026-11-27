import type { ReactNode } from "react";
import { cn } from "../../cn";
import { useA11yProps, type AccessibilityFeaturesProp } from "../../a11y";

/** Joins adjacent buttons into one strip. Children should be Buttons of the same size. */
export function ButtonGroup({ children, className, label, accessibilityFeatures }: {
  children: ReactNode; className?: string; label?: string;
  /** Accessibility features to add for this group (the strip itself has nothing to animate; the page CSS answers `largeTargets`, `strongFocus` and `highContrast` for the buttons inside). Adds to the person's own settings, never removes them. */
  accessibilityFeatures?: AccessibilityFeaturesProp;
}) {
  const { rootProps } = useA11yProps(accessibilityFeatures);
  return (
    <div
      {...rootProps}
      role="group"
      aria-label={label}
      className={cn(
        "inline-flex items-stretch",
        "[&>*]:rounded-none [&>*:first-child]:rounded-l-control [&>*:last-child]:rounded-r-control",
        "[&>*+*]:border-l [&>*+*]:border-line-strong/60",
        className,
      )}
    >
      {children}
    </div>
  );
}
