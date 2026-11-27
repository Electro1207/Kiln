import { type ReactNode } from "react";
import { cn } from "../../cn";
import { useA11yProps, type AccessibilityFeaturesProp } from "../../a11y";

export type BentoGridProps = {
  children: ReactNode;
  className?: string;
  /** Accessibility features to add for this grid only. Adds to the person's own settings, never removes them. */
  accessibilityFeatures?: AccessibilityFeaturesProp;
};

/** A six-column grid that tiles take spans of; one column on phones, three on tablets. */
export function BentoGrid({ children, className, accessibilityFeatures }: BentoGridProps) {
  const { rootProps } = useA11yProps(accessibilityFeatures);
  return (
    <div {...rootProps} className="@container w-full">
      <div className={cn("grid grid-cols-1 gap-4 @2xl:grid-cols-2 @4xl:grid-cols-6", className)}>{children}</div>
    </div>
  );
}

export type BentoTileProps = {
  title: string;
  body: string;
  /** The live picture at the top of the tile. */
  visual: ReactNode;
  /** Span classes for the wide layout, e.g. "@4xl:col-span-4 @4xl:row-span-2". */
  span?: string;
  className?: string;
  /** Accessibility features to add for this tile only. Adds to the person's own settings, never removes them. */
  accessibilityFeatures?: AccessibilityFeaturesProp;
};

/** One tile of a BentoGrid: title, body and an optional visual. `span` sets how many columns it takes. */
export function BentoTile({ title, body, visual, span = "@4xl:col-span-2", className, accessibilityFeatures }: BentoTileProps) {
  const { rootProps } = useA11yProps(accessibilityFeatures);
  return (
    <article {...rootProps} className={cn("flex min-w-0 flex-col overflow-hidden rounded-sheet bg-surface", span, className)}>
      <div className="relative min-h-44 flex-1 overflow-hidden bg-raised/60">{visual}</div>
      <div className="p-5 @2xl:p-6">
        <h3 className="text-[0.9375rem] font-semibold text-ink">{title}</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-ink">{body}</p>
      </div>
    </article>
  );
}
