import { type ReactNode } from "react";
import { cn } from "../../cn";
import { Accordion, type AccordionItem } from "../wayfinding/Accordion";

export type FAQSectionProps = {
  title: ReactNode;
  description?: ReactNode;
  /** Shown under the description, e.g. a contact link. */
  footer?: ReactNode;
  items: AccordionItem[];
  className?: string;
};

/** Questions on the right, the heading and a way to ask more on the left. */
export function FAQSection({ title, description, footer, items, className }: FAQSectionProps) {
  return (
    <section className={cn("@container w-full", className)}>
      <div className="grid gap-8 @3xl:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] @3xl:gap-12">
        <div className="@3xl:sticky @3xl:top-6 @3xl:self-start">
          <h2 className="text-2xl font-semibold tracking-[-0.02em] text-ink text-balance @2xl:text-[1.75rem]">{title}</h2>
          {description && <p className="mt-3 text-[15px] leading-relaxed text-ink">{description}</p>}
          {footer && <div className="mt-5 text-sm text-muted">{footer}</div>}
        </div>
        <Accordion items={items} defaultOpen={[items[0]?.id]} />
      </div>
    </section>
  );
}
