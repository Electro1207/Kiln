import { useImperativeHandle, useRef, type HTMLAttributes, type Ref } from "react";
import { cn } from "../../cn";
import { useA11yProps, type AccessibilityFeaturesProp } from "../../a11y";
import { useLoop } from "../shared/useLoop";

/** Text used by Spinner. Pass a partial via `labels` to translate or reword. */
export interface SpinnerLabels {
  /** Default accessible name. */
  loading: string;
}
export const spinnerLabels: SpinnerLabels = { loading: "Loading" };

export type SpinnerProps = Omit<HTMLAttributes<HTMLSpanElement>, "children"> & {
  /** ring: a turning arc · dots: three breathing dots · bars: an iOS-style petal wheel · pulse: a soft expanding disc */
  kind?: "ring" | "dots" | "bars" | "pulse";
  /** Width and height in pixels. Defaults to 20. */
  size?: number;
  /** Accessible name. Defaults to "Loading". */
  label?: string;
  /** Override any UI text. Merged over `spinnerLabels`. */
  labels?: Partial<SpinnerLabels>;
  /** Accessibility features to add here. `calm` and `reduceMotion` stop the turning and show a still mark (the name is still announced). Adds to the person's own settings, never removes them. */
  accessibilityFeatures?: AccessibilityFeaturesProp;
  ref?: Ref<HTMLSpanElement>;
};

/**
 * Shows that something is working. Colour follows the text colour. Every kind
 * is a compositor loop (transform and opacity only) that pauses off-screen.
 */
export function Spinner({ kind = "ring", size = 20, label: labelProp, labels, className, style, ref, accessibilityFeatures, ...rest }: SpinnerProps) {
  const { a11y, rootProps } = useA11yProps(accessibilityFeatures);
  const localStill = a11y.calm || a11y.reduceMotion;
  const label = labelProp ?? { ...spinnerLabels, ...labels }.loading;
  const root = useRef<HTMLSpanElement>(null);
  useImperativeHandle(ref, () => root.current!);
  const { reduce } = useLoop(
    root,
    (el) => {
      if (localStill) return [];
      const parts = Array.from(el.querySelectorAll<HTMLElement | SVGElement>("[data-part]"));
      const n = parts.length;
      if (kind === "ring") return parts.map((p) => p.animate([{ transform: "rotate(0deg)" }, { transform: "rotate(360deg)" }], { duration: 900, iterations: Infinity, easing: "linear" }));
      if (kind === "dots")
        return parts.map((p, i) =>
          p.animate(
            [{ transform: "scale(0.6)", opacity: 0.35 }, { transform: "scale(1)", opacity: 1 }, { transform: "scale(0.6)", opacity: 0.35 }],
            { duration: 1000, iterations: Infinity, easing: "ease-in-out", delay: i * 160 },
          ),
        );
      if (kind === "bars")
        return parts.map((p, i) => p.animate([{ opacity: 1 }, { opacity: 0.2 }], { duration: 800, iterations: Infinity, easing: "linear", delay: (i / n) * 800 - 800 }));
      return parts.map((p, i) =>
        p.animate([{ transform: "scale(0)", opacity: 0.6 }, { transform: "scale(1)", opacity: 0 }], { duration: 1400, iterations: Infinity, easing: "cubic-bezier(0.22, 1, 0.36, 1)", delay: i * 700 }),
      );
    },
    [kind, localStill],
  );
  const still = reduce || localStill;

  return (
    <span ref={root} role="status" aria-label={label} {...rest} {...rootProps} className={cn("inline-grid place-items-center text-accent", className)} style={{ ...rootProps.style, width: size, height: size, ...style }}>
      {kind === "ring" && (
        <svg data-part width={size} height={size} viewBox="0 0 24 24" aria-hidden>
          <circle cx="12" cy="12" r="9.5" fill="none" stroke="currentColor" strokeOpacity="0.18" strokeWidth="2.5" />
          <path d="M21.5 12a9.5 9.5 0 0 0-9.5-9.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      )}
      {kind === "dots" && (
        <span className="flex items-center" style={{ gap: Math.max(3, Math.round(size / 5)) * 0.7 }} aria-hidden>
          {[0, 1, 2].map((i) => {
            const d = Math.max(3, Math.round(size / 5));
            return <span key={i} data-part className="rounded-full bg-current" style={{ width: d, height: d }} />;
          })}
        </span>
      )}
      {kind === "bars" && (
        <span className="relative block" style={{ width: size, height: size }} aria-hidden>
          {Array.from({ length: 8 }, (_, i) => (
            <span
              key={i}
              className="absolute left-1/2 top-0"
              style={{ width: size * 0.1, height: size * 0.28, marginLeft: -size * 0.05, transformOrigin: `50% ${size / 2}px`, transform: `rotate(${45 * i}deg)` }}
            >
              <span data-part className="block size-full rounded-full bg-current" style={still ? { opacity: 0.25 + 0.75 * (1 - i / 8) } : undefined} />
            </span>
          ))}
        </span>
      )}
      {kind === "pulse" && (
        <span className="relative block" style={{ width: size, height: size }} aria-hidden>
          {[0, 1].map((i) => (
            <span key={i} data-part className="absolute inset-0 rounded-full bg-current" style={still ? { transform: "scale(0.55)", opacity: 0.5 - i * 0.3 } : { transform: "scale(0)" }} />
          ))}
        </span>
      )}
    </span>
  );
}
