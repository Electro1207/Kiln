import { forwardRef, type AnchorHTMLAttributes, type ButtonHTMLAttributes, type HTMLAttributes, type ReactNode } from "react";
import { motion } from "motion/react";
import { cn } from "../../cn";
import { fade, springSnappy } from "../../motion";
import { useControllable } from "../../controllable";
import { useA11yProps, type AccessibilityFeaturesProp } from "../../a11y";

export type BottomTab = {
  id: string;
  label: string;
  icon: ReactNode;
  /** A count (shown as a number, `99+` above 99), or `true` for a plain dot. */
  badge?: number | boolean;
  /** Render a link to this address instead of a button. */
  href?: string;
  disabled?: boolean;
};

/** Text used by BottomTabBar. Pass a partial via `labels` to translate or reword. */
export interface BottomTabBarLabels {
  /** aria-label of the navigation. */
  nav: string;
  /** Read after a tab's name when it has a count: "Inbox, 3 new". */
  badge: (count: number) => string;
  /** Read after a tab's name when it has a dot badge. */
  dot: string;
}
export const bottomTabBarLabels: BottomTabBarLabels = { nav: "Main", badge: (n) => `${n} new`, dot: "new activity" };

export type BottomTabBarProps = Omit<HTMLAttributes<HTMLElement>, "onChange" | "children"> & {
  /** Three to five tabs. */
  items: BottomTab[];
  /** Controlled id of the current tab. Leave out and use `defaultValue` to let it keep its own. */
  value?: string;
  defaultValue?: string;
  onChange?: (id: string) => void;
  /** `fixed` pins it to the bottom of the window (default), `sticky` to the bottom of its scroller, `inline` leaves it where it is. */
  position?: "fixed" | "sticky" | "inline";
  /** Show the names under the icons. Default true. */
  showLabels?: boolean;
  /** Override any UI text. Merged over `bottomTabBarLabels`. */
  labels?: Partial<BottomTabBarLabels>;
  /** Turn accessibility features on for this component only. */
  accessibilityFeatures?: AccessibilityFeaturesProp;
};

/** The navigation along the bottom of a phone app. Targets are at least 48px, and it keeps clear of the home indicator. */
export const BottomTabBar = forwardRef<HTMLElement, BottomTabBarProps>(function BottomTabBar(
  { items, value, defaultValue, onChange, position = "fixed", showLabels = true, labels, accessibilityFeatures, className, style, ...rest },
  ref,
) {
  const l = { ...bottomTabBarLabels, ...labels };
  const { rootProps } = useA11yProps(accessibilityFeatures);
  const [current, setCurrent] = useControllable<string>(value, defaultValue ?? items[0]?.id ?? "", onChange);
  return (
    <nav
      ref={ref}
      aria-label={l.nav}
      {...rest}
      {...rootProps}
      style={{ ...rootProps.style, ...style }}
      className={cn(
        "z-40 border-t border-line bg-surface pb-[env(safe-area-inset-bottom)]",
        position === "fixed" && "fixed inset-x-0 bottom-0",
        position === "sticky" && "sticky bottom-0",
        className,
      )}
    >
      <ul className="mx-auto flex max-w-xl items-stretch">
        {items.map((t) => {
          const on = t.id === current;
          const count = typeof t.badge === "number" ? t.badge : null;
          const hasBadge = t.badge === true || (count != null && count > 0);
          const name = hasBadge ? `${t.label}, ${count != null ? l.badge(count) : l.dot}` : undefined;
          const common = {
            "aria-current": on ? ("page" as const) : undefined,
            "aria-label": name,
            className: cn(
              "group relative flex min-h-14 min-w-12 w-full flex-col items-center justify-center gap-0.5 px-1 py-1.5 text-[0.6875rem] font-medium leading-tight transition-colors duration-200",
              on ? "text-ink" : "text-muted hover:text-ink",
              t.disabled && "pointer-events-none opacity-45",
            ),
          };
          const body = (
            <>
              <span className="relative grid h-8 w-14 place-items-center">
                <motion.span aria-hidden initial={false} animate={{ opacity: on ? 1 : 0 }} transition={fade} className="pointer-events-none absolute inset-0 rounded-full bg-accent-soft" />
                <motion.span className="relative z-[1] grid [&>svg]:size-[22px]" whileTap={{ scale: 0.9 }} transition={springSnappy}>{t.icon}</motion.span>
                {hasBadge && (
                  <span
                    aria-hidden
                    className={cn(
                      "absolute z-[2] grid place-items-center rounded-full bg-btn-danger font-semibold text-btn-danger-ink tabular",
                      count != null ? "right-1.5 top-0 h-4 min-w-4 px-1 text-[0.625rem]" : "right-3.5 top-1 size-2.5",
                    )}
                  >
                    {count != null ? (count > 99 ? "99+" : count) : null}
                  </span>
                )}
              </span>
              {showLabels && <span className="max-w-full truncate">{t.label}</span>}
            </>
          );
          return (
            <li key={t.id} className="flex min-w-0 flex-1">
              {t.href ? (
                <a href={t.href} {...(common as AnchorHTMLAttributes<HTMLAnchorElement>)} aria-label={name ?? (showLabels ? undefined : t.label)} onClick={() => setCurrent(t.id)}>{body}</a>
              ) : (
                <button type="button" disabled={t.disabled} {...(common as ButtonHTMLAttributes<HTMLButtonElement>)} aria-label={name ?? (showLabels ? undefined : t.label)} onClick={() => setCurrent(t.id)}>{body}</button>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
});
