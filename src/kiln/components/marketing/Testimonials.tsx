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
        <span className="block text-[0.8125rem] text-muted">{t.role}</span>
      </span>
    </figcaption>
  );
}

/** Deals items into `n` columns, each into the one that is shortest so far, so the columns end level. */
function deal<T>(items: T[], n: number, weight: (t: T) => number) {
  const cols = Array.from({ length: n }, () => ({ h: 0, items: [] as T[] }));
  for (const it of items) {
    const c = cols.reduce((a, b) => (b.h < a.h ? b : a));
    c.items.push(it);
    c.h += weight(it);
  }
  return cols.map((c) => c.items);
}

/* One arrangement per width, switched by container queries. Dealing the cards ourselves (instead of CSS
   columns, which Safari balances differently and can cut a card off at the foot) ends the columns level
   in every browser. */
const LAYOUTS = [
  { n: 1, className: "flex @2xl:hidden" },
  { n: 2, className: "hidden @2xl:flex @4xl:hidden" },
  { n: 3, className: "hidden @4xl:flex" },
];
/** A card's height, roughly: its padding and name, plus a line per ~38 characters of quote. */
const weight = (t: Testimonial) => 4 + Math.ceil(t.quote.length / 38);

/** One quotation set large, then the rest in columns. */
export function Testimonials({ title, description, items, className }: TestimonialsProps) {
  const [lead, ...rest] = items;
  return (
    <section className={cn("@container w-full", className)}>
      <h2 className="text-2xl font-semibold tracking-[-0.02em] text-ink text-balance @2xl:text-[1.75rem]">{title}</h2>
      {description && <p className="mt-3 max-w-xl text-[0.9375rem] leading-relaxed text-ink">{description}</p>}
      {lead && (
        <figure className="mt-8 rounded-sheet bg-surface p-6 @2xl:p-10">
          <blockquote className="max-w-3xl text-xl leading-snug tracking-[-0.01em] text-ink @2xl:text-[1.625rem]">“{lead.quote}”</blockquote>
          <div className="mt-6">
            <Person t={lead} size="lg" />
          </div>
        </figure>
      )}
      {LAYOUTS.map(({ n, className: shown }) => (
        <div key={n} className={cn("mt-4 items-start gap-4", shown)}>
          {deal(rest, n, weight).map((col, i) => (
            <div key={i} className="flex min-w-0 flex-1 flex-col gap-4">
              {col.map((t) => (
                <figure key={t.name} className="rounded-card bg-surface p-5">
                  <blockquote className="text-[0.9375rem] leading-relaxed text-ink">“{t.quote}”</blockquote>
                  <div className="mt-4">
                    <Person t={t} />
                  </div>
                </figure>
              ))}
            </div>
          ))}
        </div>
      ))}
    </section>
  );
}
