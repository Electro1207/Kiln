import { forwardRef, type AnchorHTMLAttributes, type ReactNode } from "react";
import { cn } from "../../cn";

/** Text link whose underline draws in from the left on hover and focus. */
export const Link = forwardRef<HTMLAnchorElement, AnchorHTMLAttributes<HTMLAnchorElement> & { children: ReactNode; tone?: "accent" | "ink"; external?: boolean }>(
  function Link({ children, className, tone = "accent", external, ...rest }, ref) {
    return (
      <a
        ref={ref}
        {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
        className={cn(
          "group relative inline-flex items-center gap-1 font-medium outline-offset-4",
          tone === "accent" ? "text-accent" : "text-ink",
          className,
        )}
        {...rest}
      >
        <span className="relative">
          {children}
          <span
            aria-hidden
            className={"absolute inset-x-0 -bottom-0.5 h-px origin-right scale-x-0 bg-current transition-transform duration-500 ease-out-soft group-hover:origin-left group-hover:scale-x-100 group-focus-visible:origin-left group-focus-visible:scale-x-100"}
          />
        </span>
        {external && (
          <svg viewBox="0 0 12 12" className="size-3 transition-transform duration-300 ease-out-soft group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden>
            <path d="M4 2.5h5.5V8M9.5 2.5 2.5 9.5" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
        )}
      </a>
    );
  },
);
