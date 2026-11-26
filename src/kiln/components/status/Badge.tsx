import type { HTMLAttributes, ReactNode } from "react";
import type { Size } from "../../controllable";
import { cn } from "../../cn";
import { useA11yProps, type AccessibilityFeaturesProp } from "../../a11y";

export type BadgeTone = "neutral" | "accent" | "positive" | "negative" | "warning" | "info";

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: BadgeTone;
  /** "soft" is a tinted fill; "solid" is a full fill for counts and rare emphasis. */
  variant?: "soft" | "solid";
  /** A leading dot in the tone's colour. */
  dot?: boolean;
  size?: Size;
  children: ReactNode;
  /** Accessibility features to add here. Adds to the person's own settings, never removes them. */
  accessibilityFeatures?: AccessibilityFeaturesProp;
};

const badgeSizes: Record<Size, string> = {
  sm: "h-5 px-2 text-[0.7188rem]",
  md: "h-6 px-2.5 text-xs",
  lg: "h-7 px-3 text-[0.8125rem]",
};

const soft: Record<BadgeTone, string> = {
  neutral: "bg-active text-ink",
  accent: "bg-accent-soft text-accent",
  positive: "bg-positive-soft text-positive",
  negative: "bg-negative-soft text-negative",
  warning: "bg-warning-soft text-warning",
  info: "bg-info-soft text-info",
};

/* Solid fills come from the button tokens, so they read the same in both themes.
   Signal tones without a button fill fall back to their soft look. */
const solid: Record<BadgeTone, string> = {
  neutral: "bg-btn-secondary text-btn-secondary-ink",
  accent: "bg-btn-primary text-btn-primary-ink",
  negative: "bg-btn-danger text-btn-danger-ink",
  positive: soft.positive,
  warning: soft.warning,
  info: soft.info,
};

const dotColour: Record<BadgeTone, string> = {
  neutral: "bg-muted",
  accent: "bg-accent",
  positive: "bg-positive",
  negative: "bg-negative",
  warning: "bg-warning",
  info: "bg-info",
};

/** A short status or count. */
export function Badge({ tone = "neutral", variant = "soft", dot, size = "md", children, className, accessibilityFeatures, style, ...rest }: BadgeProps) {
  const { rootProps } = useA11yProps(accessibilityFeatures);
  return (
    <span
      {...rest}
      {...rootProps}
      style={{ ...rootProps.style, ...style }}
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full font-medium tabular",
        badgeSizes[size],
        variant === "soft" ? soft[tone] : solid[tone],
        className,
      )}
    >
      {dot && <span aria-hidden className={cn("size-1.5 rounded-full", variant === "solid" && (tone === "neutral" || tone === "accent" || tone === "negative") ? "bg-current" : dotColour[tone])} />}
      {children}
    </span>
  );
}
