import { forwardRef, type AnchorHTMLAttributes, type MouseEvent } from "react";
import { cn } from "../../cn";

/** Text used by SkipLink. Pass a partial via `labels` to translate or reword. */
export interface SkipLinkLabels {
  /** The link's text when no children are given. */
  label: string;
}
export const skipLinkLabels: SkipLinkLabels = { label: "Skip to content" };

export type SkipLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  /** The id of the main region, as a hash. Default "#main". */
  href?: string;
  /** Override any UI text. Merged over `skipLinkLabels`. */
  labels?: Partial<SkipLinkLabels>;
};

/**
 * The first thing a keyboard user can reach: it jumps past the navigation to the main content.
 * Hidden until focused, then it fades in at the top left. Put it first in the page.
 */
export const SkipLink = forwardRef<HTMLAnchorElement, SkipLinkProps>(function SkipLink(
  { href = "#main", labels, className, children, onClick, ...rest },
  ref,
) {
  const l = { ...skipLinkLabels, ...labels };
  const go = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented || !href.startsWith("#") || href.length < 2) return;
    // Jump without touching the address, so a router that reads the hash never sees it.
    const target = document.getElementById(decodeURIComponent(href.slice(1)));
    if (!target) return;
    e.preventDefault();
    if (!target.hasAttribute("tabindex") && !/^(a|button|input|select|textarea)$/i.test(target.tagName)) target.tabIndex = -1;
    target.focus({ preventScroll: true });
    target.scrollIntoView({ block: "start" });
  };
  return (
    <a
      {...rest}
      ref={ref}
      href={href}
      onClick={go}
      className={cn(
        "fixed left-3 top-3 z-[100] rounded-control bg-btn-primary px-4 py-2 text-sm font-medium text-btn-primary-ink shadow-float",
        "pointer-events-none opacity-0 transition-opacity duration-200 ease-out-soft",
        "focus:pointer-events-auto focus:opacity-100",
        className,
      )}
    >
      {children ?? l.label}
    </a>
  );
});
