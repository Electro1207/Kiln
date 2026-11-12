import { type ReactNode } from "react";
import { cn } from "../../cn";

export type CTASectionProps = {
  title: ReactNode;
  body?: ReactNode;
  /** The main action. Rendered as a link styled for the variant. */
  primary: { label: string; href: string };
  secondary?: { label: string; href: string };
  /** field: a whole block of the brand's fill, centred. split: text left, actions right, on a quiet ground. */
  variant?: "field" | "split";
  /** A picture beside the text in the split variant. */
  aside?: ReactNode;
  className?: string;
};

/** The closing call to action of a page. */
export function CTASection({ title, body, primary, secondary, variant = "field", aside, className }: CTASectionProps) {
  if (variant === "field") {
    return (
      <section className={cn("@container w-full overflow-hidden rounded-sheet bg-btn-primary px-6 py-14 text-center text-btn-primary-ink @2xl:px-12 @2xl:py-20", className)}>
        <h2 className="mx-auto max-w-2xl text-3xl font-semibold leading-[1.1] tracking-[-0.025em] text-balance @2xl:text-[2.75rem]">{title}</h2>
        {body && <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed opacity-90">{body}</p>}
        <div className="mt-8 flex flex-col items-center justify-center gap-3 @md:flex-row">
          <a
            href={primary.href}
            className="inline-flex h-11 w-full items-center justify-center rounded-control bg-btn-primary-ink px-6 text-[15px] font-medium text-btn-primary transition-opacity duration-200 hover:opacity-90 @md:w-auto"
          >
            {primary.label}
          </a>
          {secondary && (
            <a href={secondary.href} className="inline-flex h-11 items-center px-4 text-[15px] font-medium underline-offset-4 hover:underline">
              {secondary.label} <span aria-hidden className="ml-1.5">→</span>
            </a>
          )}
        </div>
      </section>
    );
  }
  return (
    <section className={cn("@container w-full overflow-hidden rounded-sheet bg-surface", className)}>
      <div className={cn("grid items-center gap-8 p-6 @2xl:p-10", !!aside && "@3xl:grid-cols-2 @3xl:gap-10")}>
        <div className="flex flex-col gap-6">
          <div>
            <h2 className="text-3xl font-semibold leading-[1.1] tracking-[-0.025em] text-ink text-balance @2xl:text-4xl">{title}</h2>
            {body && <p className="mt-4 max-w-xl text-base leading-relaxed text-ink">{body}</p>}
          </div>
          <div className="flex flex-col gap-3 @md:flex-row @md:items-center">
            <a href={primary.href} className="inline-flex h-11 items-center justify-center rounded-control bg-btn-primary px-6 text-[15px] font-medium text-btn-primary-ink transition-colors duration-200 hover:bg-btn-primary-hover">
              {primary.label}
            </a>
            {secondary && (
              <a href={secondary.href} className="inline-flex h-11 items-center justify-center rounded-control bg-btn-secondary px-5 text-[15px] font-medium text-btn-secondary-ink transition-colors duration-200 hover:bg-btn-secondary-hover">
                {secondary.label}
              </a>
            )}
          </div>
        </div>
        {aside && <div className="min-w-0">{aside}</div>}
      </div>
    </section>
  );
}
