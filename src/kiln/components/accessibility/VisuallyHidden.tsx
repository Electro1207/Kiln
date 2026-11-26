import { forwardRef, type ElementType, type HTMLAttributes } from "react";
import { cn } from "../../cn";

export type VisuallyHiddenProps = HTMLAttributes<HTMLElement> & {
  /** The element to render. Default "span". */
  as?: ElementType;
  /** Show it while it or something inside it has focus (a skip link, a shortcut hint). */
  focusable?: boolean;
};

/** Content that screen readers read and the screen does not show. */
export const VisuallyHidden = forwardRef<HTMLElement, VisuallyHiddenProps>(function VisuallyHidden(
  { as: Tag = "span", focusable, className, ...rest },
  ref,
) {
  return <Tag {...rest} ref={ref} className={cn("sr-only", focusable && "focus:not-sr-only focus-within:not-sr-only", className)} />;
});
