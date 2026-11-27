import { forwardRef, useMemo, type AnchorHTMLAttributes, type ReactNode } from "react";
import { cn } from "../../cn";
import { useA11yProps, type AccessibilityFeaturesProp } from "../../a11y";

/** Icons used by Link. Pass a partial via `icons` to replace any. */
export interface LinkIcons {
  /** The arrow shown when `external`. */
  external: ReactNode;
}
export const linkIcons: LinkIcons = {
  external: (
    <svg viewBox="0 0 12 12">
      <path d="M4 2.5h5.5V8M9.5 2.5 2.5 9.5" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  ),
};

/** Text link whose underline draws in from the left on hover and focus. */
export const Link = forwardRef<HTMLAnchorElement, AnchorHTMLAttributes<HTMLAnchorElement> & { children: ReactNode; tone?: "accent" | "ink"; external?: boolean; /** Replace any built-in icon. Merged over `linkIcons`. */ icons?: Partial<LinkIcons>; /** Accessibility features to add for this link. `reduceMotion` and `calm` keep the underline and arrow still (the underline just appears); `strongFocus` is answered by the page CSS. Adds to the person's own settings, never removes them. */ accessibilityFeatures?: AccessibilityFeaturesProp }>(
  function Link({ children, className, tone = "accent", external, icons, accessibilityFeatures, ...rest }, ref) {
    const { a11y, rootProps } = useA11yProps(accessibilityFeatures);
    const still = a11y.reduceMotion || a11y.calm;
    const ic = useMemo(() => ({ ...linkIcons, ...icons }), [icons]);
    return (
      <a
        ref={ref}
        {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
        {...rootProps}
        className={cn(
          "group relative inline-flex items-center gap-1 font-medium outline-offset-4",
          tone === "accent" ? "text-accent" : "text-ink",
          className,
        )}
        {...rest}
        style={{ ...rootProps.style, ...rest.style }}
      >
        <span className="relative">
          {children}
          <span
            aria-hidden
            className={cn("absolute inset-x-0 -bottom-0.5 h-px origin-right scale-x-0 bg-current transition-transform duration-500 ease-out-soft",
              still && "!transition-none",
              "group-hover:origin-left group-hover:scale-x-100 group-focus-visible:origin-left group-focus-visible:scale-x-100")}
          />
        </span>
        {external && (
          <span className={cn("grid transition-transform duration-300 ease-out-soft [&>svg]:size-3", !still && "group-hover:-translate-y-0.5 group-hover:translate-x-0.5")} aria-hidden>
            {ic.external}
          </span>
        )}
      </a>
    );
  },
);
