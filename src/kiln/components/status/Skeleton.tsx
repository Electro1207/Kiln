import { useImperativeHandle, useRef, type HTMLAttributes, type Ref } from "react";
import { useLoop } from "../shared/useLoop";
import { useA11yProps, type AccessibilityFeaturesProp } from "../../a11y";
import { cn } from "../../cn";

export type SkeletonProps = Omit<HTMLAttributes<HTMLSpanElement>, "children"> & {
  /** "text" is a 12px line; "circle" is round; "block" takes its size from className. */
  shape?: "block" | "text" | "circle";
  /** Accessibility features to add here. `calm` and `reduceMotion` stop the breathing. Adds to the person's own settings, never removes them. */
  accessibilityFeatures?: AccessibilityFeaturesProp;
  ref?: Ref<HTMLSpanElement>;
};

/**
 * A placeholder that holds the shape of content still loading. It breathes
 * gently (opacity only), so it costs nothing to paint and never stutters.
 */
export function Skeleton({ className, shape = "block", ref, accessibilityFeatures, style, ...rest }: SkeletonProps) {
  const { a11y, rootProps } = useA11yProps(accessibilityFeatures);
  const localStill = a11y.calm || a11y.reduceMotion;
  const el = useRef<HTMLSpanElement>(null);
  useImperativeHandle(ref, () => el.current!);
  // A slow breath of opacity: the whole placeholder, on the compositor, no blur and no band to paint.
  useLoop(
    el,
    (node) => localStill ? [] : [
      node.animate([{ opacity: 1 }, { opacity: 0.5 }, { opacity: 1 }], { duration: 1800, iterations: Infinity, easing: "ease-in-out" }),
    ],
    [localStill],
  );
  return (
    <span
      ref={el}
      aria-hidden
      {...rest}
      {...rootProps}
      style={{ ...rootProps.style, ...style }}
      className={cn(
        "relative block bg-active",
        shape === "text" && "h-3 rounded-full",
        shape === "circle" && "rounded-full",
        shape === "block" && "rounded-control",
        className,
      )}
    />
  );
}

/** A paragraph of skeleton lines; the last is shorter, like real text. */
export function SkeletonText({ lines = 3, className, accessibilityFeatures }: {
  lines?: number;
  className?: string;
  /** Accessibility features to add here; passed to every line. */
  accessibilityFeatures?: AccessibilityFeaturesProp;
}) {
  return (
    <span aria-hidden className={cn("flex flex-col gap-2.5", className)}>
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton key={i} shape="text" accessibilityFeatures={accessibilityFeatures} className={i === lines - 1 ? "w-3/5" : "w-full"} />
      ))}
    </span>
  );
}
