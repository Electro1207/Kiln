import { type ReactNode } from "react";
import { motion } from "motion/react";
import { cn } from "../../cn";
import { fade } from "../../motion";
import { useA11yProps, type AccessibilityFeaturesProp } from "../../a11y";

export type HeadingTab = { id: string; label: string; count?: number };
type TabsProp = { items: HeadingTab[]; value: string; onChange: (id: string) => void; label: string };

/** Link-style tabs under a heading. Each tab owns its underline, which fades in and out. */
export function HeadingTabs({ items, value, onChange, label }: TabsProp) {
  return (
    <div
      role="tablist"
      aria-label={label}
      className="-mx-1 flex gap-5 overflow-x-auto px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {items.map((t) => {
        const on = t.id === value;
        return (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={on}
            tabIndex={on ? 0 : -1}
            onClick={() => onChange(t.id)}
            onKeyDown={(e) => {
              const i = items.findIndex((x) => x.id === t.id);
              const to = e.key === "ArrowRight" ? items[(i + 1) % items.length] : e.key === "ArrowLeft" ? items[(i - 1 + items.length) % items.length] : e.key === "Home" ? items[0] : e.key === "End" ? items[items.length - 1] : null;
              if (!to) return;
              e.preventDefault();
              onChange(to.id);
              requestAnimationFrame(() => (e.currentTarget.parentElement?.querySelector(`[data-tab="${to.id}"]`) as HTMLElement | null)?.focus());
            }}
            data-tab={t.id}
            className={cn(
              "relative flex h-11 shrink-0 items-center gap-1.5 text-sm transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-accent",
              on ? "font-medium text-ink" : "text-muted hover:text-ink",
            )}
          >
            {t.label}
            {t.count != null && <span className="rounded-full bg-active px-1.5 text-xs text-muted tabular">{t.count}</span>}
            <motion.span
              aria-hidden
              initial={false}
              animate={{ opacity: on ? 1 : 0 }}
              transition={fade}
              className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-ink"
            />
          </button>
        );
      })}
    </div>
  );
}

export type SectionHeadingProps = {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  tabs?: TabsProp;
  /** Centre one heading on a page at most. */
  align?: "start" | "center";
  as?: "h1" | "h2" | "h3";
  size?: "md" | "lg";
  className?: string;
  /** Accessibility features to add for this one component. Adds to the person's own settings, never removes them. */
  accessibilityFeatures?: AccessibilityFeaturesProp;
};

/** A section's title with a line of description, optional actions and tabs. */
export function SectionHeading({ title, description, actions, tabs, align = "start", as: Tag = "h2", size = "md", className, accessibilityFeatures }: SectionHeadingProps) {
  const { rootProps } = useA11yProps(accessibilityFeatures);
  const centred = align === "center";
  return (
    <div {...rootProps} className={cn("@container flex w-full flex-col gap-4", centred && "items-center text-center", className)}>
      <div className={cn("flex w-full flex-col gap-4 @2xl:flex-row @2xl:items-end @2xl:justify-between", centred && "@2xl:flex-col @2xl:items-center")}>
        <div className={cn("min-w-0 max-w-2xl", centred && "mx-auto")}>
          <Tag className={cn("font-semibold tracking-[-0.025em] text-ink text-balance", size === "lg" ? "text-3xl leading-[1.1] @2xl:text-[2.75rem]" : "text-2xl leading-tight @2xl:text-[1.75rem]")}>
            {title}
          </Tag>
          {description && <p className="mt-3 text-[0.9375rem] leading-relaxed text-ink @2xl:text-base">{description}</p>}
        </div>
        {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
      </div>
      {tabs && (
        <div className="relative w-full">
          <span aria-hidden className="absolute inset-x-0 bottom-0 h-px bg-line" />
          <HeadingTabs {...tabs} />
        </div>
      )}
    </div>
  );
}

export type PageMeta = { icon?: ReactNode; label: ReactNode };

export type PageHeadingProps = {
  title: ReactNode;
  /** A trail above the title, e.g. <Breadcrumbs/>. */
  above?: ReactNode;
  meta?: PageMeta[];
  actions?: ReactNode;
  tabs?: TabsProp;
  /** A picture or avatar before the title. */
  leading?: ReactNode;
  className?: string;
  /** Accessibility features to add for this one component. Adds to the person's own settings, never removes them. */
  accessibilityFeatures?: AccessibilityFeaturesProp;
};

/** The top of an app or content page: title, facts about it, actions and tabs. */
export function PageHeading({ title, above, meta, actions, tabs, leading, className, accessibilityFeatures }: PageHeadingProps) {
  const { rootProps } = useA11yProps(accessibilityFeatures);
  return (
    <div {...rootProps} className={cn("@container flex w-full flex-col gap-4", className)}>
      {above}
      <div className="flex flex-col gap-4 @2xl:flex-row @2xl:items-center @2xl:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          {leading && <div className="shrink-0">{leading}</div>}
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-semibold tracking-[-0.02em] text-ink @2xl:text-[1.75rem]">{title}</h1>
            {meta && meta.length > 0 && (
              <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-1.5">
                {meta.map((m, i) => (
                  <li key={i} className="flex items-center gap-1.5 text-[0.8125rem] text-muted [&>svg]:size-4 [&>svg]:shrink-0">
                    {m.icon}
                    <span>{m.label}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
      </div>
      {tabs && (
        <div className="relative">
          <span aria-hidden className="absolute inset-x-0 bottom-0 h-px bg-line" />
          <HeadingTabs {...tabs} />
        </div>
      )}
    </div>
  );
}
