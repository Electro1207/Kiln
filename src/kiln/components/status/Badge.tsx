import type { HTMLAttributes, ReactNode } from "react";
import type { Size } from "../../controllable";
import { cn } from "../../cn";

export type BadgeTone = "neutral" | "accent" | "positive" | "negative" | "warning" | "info";

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: BadgeTone;
  /** "soft" is a tinted fill; "solid" is a full fill for counts and rare emphasis. */
  variant?: "soft" | "solid";
  /** A leading dot in the tone's colour. */
  dot?: boolean;
  size?: Size;
  children: ReactNode;
};

const badgeSizes: Record<Size, string> = {
  sm: "h-5 px-2 text-[11.5px]",
  md: "h-6 px-2.5 text-xs",
  lg: "h-7 px-3 text-[13px]",
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
export function Badge({ tone = "neutral", variant = "soft", dot, size = "md", children, className, ...rest }: BadgeProps) {
  return (
    <span
      {...rest}
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
