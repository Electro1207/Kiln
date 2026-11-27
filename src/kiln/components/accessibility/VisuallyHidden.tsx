import { forwardRef, type ElementType, type HTMLAttributes } from "react";
import { cn } from "../../cn";
import { useA11yProps, type AccessibilityFeaturesProp } from "../../a11y";

export type VisuallyHiddenProps = HTMLAttributes<HTMLElement> & {
  /** The element to render. Default "span". */
  as?: ElementType;
  /** Show it while it or something inside it has focus (a skip link, a shortcut hint). */
  focusable?: boolean;
  /** Accessibility features to add for this element only (matters while `focusable` shows it). Adds to the person's own settings, never removes them. */
  accessibilityFeatures?: AccessibilityFeaturesProp;
};

/** Content that screen readers read and the screen does not show. */
export const VisuallyHidden = forwardRef<HTMLElement, VisuallyHiddenProps>(function VisuallyHidden(
  { as: Tag = "span", focusable, className, accessibilityFeatures, style, ...rest },
  ref,
) {
  const { rootProps } = useA11yProps(accessibilityFeatures);
  return <Tag {...rest} {...rootProps} style={{ ...rootProps.style, ...style }} ref={ref} className={cn("sr-only", focusable && "focus:not-sr-only focus-within:not-sr-only", className)} />;
});
