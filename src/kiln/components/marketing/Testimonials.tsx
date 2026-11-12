import { type ReactNode } from "react";
import { cn } from "../../cn";
import { Avatar } from "../data-display/Avatar";

export type Testimonial = { quote: string; name: string; role: string };

export type TestimonialsProps = {
  title: ReactNode;
  description?: ReactNode;
  /** The first one is set large; the rest fill columns below it. */
  items: Testimonial[];
  className?: string;
};

function Person({ t, size = "md" }: { t: Testimonial; size?: "md" | "lg" }) {
  return (
    <figcaption className="flex items-center gap-3">
      <Avatar name={t.name} size={size} />
      <span className="min-w-0">
        <span className="block text-sm font-medium text-ink">{t.name}</span>
        <span className="block text-[13px] text-muted">{t.role}</span>
      </span>
    </figcaption>
  );
}

/** One quotation set large, then the rest in columns. */
export function Testimonials({ title, description, items, className }: TestimonialsProps) {
  const [lead, ...rest] = items;
  return (
    <section className={cn("@container w-full", className)}>
      <h2 className="text-2xl font-semibold tracking-[-0.02em] text-ink text-balance @2xl:text-[1.75rem]">{title}</h2>
      {description && <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-ink">{description}</p>}
      {lead && (
        <figure className="mt-8 rounded-sheet bg-surface p-6 @2xl:p-10">
          <blockquote className="max-w-3xl text-xl leading-snug tracking-[-0.01em] text-ink @2xl:text-[1.625rem]">“{lead.quote}”</blockquote>
          <div className="mt-6">
            <Person t={lead} size="lg" />
          </div>
        </figure>
      )}
      <div className="mt-4 columns-1 gap-4 @2xl:columns-2 @4xl:columns-3">
        {rest.map((t) => (
          <figure key={t.name} className="mb-4 break-inside-avoid rounded-card bg-surface p-5">
            <blockquote className="text-[15px] leading-relaxed text-ink">“{t.quote}”</blockquote>
            <div className="mt-4">
              <Person t={t} />
            </div>
          </figure>
        ))}
      </div>
    </section>
  );
}
