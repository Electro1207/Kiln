import { type ReactNode } from "react";
import { cn } from "../../cn";

/** Text used by PoweredByKiln. Pass a partial via `labels` to translate or reword. */
export interface PoweredByKilnLabels {
  /** The words before the name. */
  prefix: string;
  /** Read by screen readers, as the link opens a new tab. */
  newTab: string;
}
export const poweredByKilnLabels: PoweredByKilnLabels = { prefix: "Powered by", newTab: "(opens in a new tab)" };

export type PoweredByKilnProps = {
  /** Where it links. Default the Kiln gallery. */
  href?: string;
  /** Shown after the name, e.g. "0.4.0". Leave out for none. */
  version?: string;
  /** "sm" for a footer line, "md" to stand on its own. Default "sm". */
  size?: "sm" | "md";
  /** Replace the Kiln mark. */
  mark?: ReactNode;
  className?: string;
  /** Override any UI text. Merged over `poweredByKilnLabels`. */
  labels?: Partial<PoweredByKilnLabels>;
};

/** The Kiln mark: a rounded K on the accent, the same as the site's favicon. */
export function KilnMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden className={cn("shrink-0", className)}>
      <rect width="32" height="32" rx="8" className="fill-accent" />
      <path d="M11 8v16M21.5 8l-8.4 8.4 8.4 7.6" fill="none" strokeWidth="4.2" strokeLinecap="round" strokeLinejoin="round" className="stroke-on-accent" />
    </svg>
  );
}

/**
 * A small credit that says a site was built with Kiln, for a footer or an about page. It takes the
 * colour of the text around it, so it sits on any background; the mark tips up on hover.
 */
export function PoweredByKiln({ href = "https://usekiln.pages.dev", version, size = "sm", mark, className, labels }: PoweredByKilnProps) {
  const l = { ...poweredByKilnLabels, ...labels };
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={cn(
        "group inline-flex w-fit items-center rounded-full border border-current/20 font-medium outline-none transition-colors duration-200 hover:border-current/45 focus-visible:ring-2 focus-visible:ring-accent",
        size === "sm" ? "h-7 gap-1.5 pl-1 pr-2.5 text-xs" : "h-9 gap-2 pl-1.5 pr-3.5 text-sm",
        className,
      )}
    >
      <span className={cn("relative grid place-items-center", size === "sm" ? "size-5" : "size-6")}>
        {mark ?? <KilnMark className="size-full transition-transform duration-300 ease-out group-hover:-rotate-6 group-hover:scale-110 motion-reduce:transition-none" />}
      </span>
      <span>
        <span className="opacity-70">{l.prefix}</span> Kiln
        {version && <span className="opacity-60 tabular"> v{version}</span>}
      </span>
      <span className="sr-only">{l.newTab}</span>
    </a>
  );
}
