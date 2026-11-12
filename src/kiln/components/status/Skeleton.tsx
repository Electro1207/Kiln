import { useImperativeHandle, useRef, type HTMLAttributes, type Ref } from "react";
import { useLoop } from "../shared/useLoop";
import { cn } from "../../cn";

export type SkeletonProps = Omit<HTMLAttributes<HTMLSpanElement>, "children"> & {
  /** "text" is a 12px line; "circle" is round; "block" takes its size from className. */
  shape?: "block" | "text" | "circle";
  ref?: Ref<HTMLSpanElement>;
};

/**
 * A placeholder that holds the shape of content still loading. It breathes
 * gently (opacity only), so it costs nothing to paint and never stutters.
 */
export function Skeleton({ className, shape = "block", ref, ...rest }: SkeletonProps) {
  const el = useRef<HTMLSpanElement>(null);
  useImperativeHandle(ref, () => el.current!);
  // A slow breath of opacity: the whole placeholder, on the compositor, no blur and no band to paint.
  useLoop(
    el,
    (node) => [
      node.animate([{ opacity: 1 }, { opacity: 0.5 }, { opacity: 1 }], { duration: 1800, iterations: Infinity, easing: "ease-in-out" }),
    ],
    [],
  );
  return (
    <span
      ref={el}
      aria-hidden
      {...rest}
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
export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <span aria-hidden className={cn("flex flex-col gap-2.5", className)}>
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton key={i} shape="text" className={i === lines - 1 ? "w-3/5" : "w-full"} />
      ))}
    </span>
  );
}
