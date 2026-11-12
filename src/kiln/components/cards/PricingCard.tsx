import { motion } from "motion/react";
import { Check } from "lucide-react";
import { cn } from "../../cn";
import { fade } from "../../motion";
import { Button } from "../buttons/Button";
import { NumberTicker } from "../data-display/NumberTicker";

export type Billing = "monthly" | "yearly";

/** Text used by BillingToggle. Pass a partial via `labels` to translate or reword. */
export interface BillingToggleLabels {
  /** aria-label of the radio group. */
  billingPeriod: string;
  /** Option label for monthly billing. */
  monthly: string;
  /** Option label for yearly billing. */
  yearly: string;
}
export const billingToggleLabels: BillingToggleLabels = { billingPeriod: "Billing period", monthly: "Monthly", yearly: "Yearly" };

/** Monthly / yearly switch with a sliding thumb. */
export function BillingToggle({ value, onChange, saving, labels }: {
  value: Billing;
  onChange: (b: Billing) => void;
  saving?: string;
  /** Override any UI text. Merged over `billingToggleLabels`. */
  labels?: Partial<BillingToggleLabels>;
}) {
  const l = { ...billingToggleLabels, ...labels };
  const opts: { id: Billing; label: string }[] = [
    { id: "monthly", label: l.monthly },
    { id: "yearly", label: l.yearly },
  ];
  return (
    <div role="radiogroup" aria-label={l.billingPeriod} className="inline-flex rounded-full bg-active p-1 dark:bg-ground">
      {opts.map((o) => {
        const on = value === o.id;
        return (
          <button
            key={o.id}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(o.id)}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight" || e.key === "ArrowLeft") onChange(value === "monthly" ? "yearly" : "monthly");
            }}
            tabIndex={on ? 0 : -1}
            className={cn("relative h-8 rounded-full px-4 text-[13px] font-medium transition-colors", on ? "text-ink" : "text-muted hover:text-ink")}
          >
            {/* The thumb has no z-index; every label sits on z-[1], so the thumb never covers a label it passes. */}
            <motion.span aria-hidden initial={false} animate={{ opacity: on ? 1 : 0 }} transition={fade} className="pointer-events-none absolute inset-0 bg-elevated" style={{ borderRadius: 999 }} />
            <span className="relative z-[1]">
              {o.label}
              {o.id === "yearly" && saving && <span className="ml-1.5 text-accent">{saving}</span>}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/** Text used by PricingCard. Pass a partial via `labels` to translate or reword. */
export interface PricingCardLabels {
  /** Badge on a `featured` plan. */
  featured: string;
  /** Text after the price; `yearly` is true when the plan is billed yearly and not free. */
  perMonth: (yearly: boolean) => string;
}
export const pricingCardLabels: PricingCardLabels = {
  featured: "Most chosen",
  perMonth: (yearly) => `per month${yearly ? ", billed yearly" : ""}`,
};

export type PricingCardProps = {
  name: string;
  description: string;
  /** Price per month for each billing period. */
  price: Record<Billing, number>;
  billing: Billing;
  currency?: string;
  features: string[];
  cta: string;
  featured?: boolean;
  onSelect?: () => void;
  className?: string;
  /** Locale for the price format. Defaults to NumberTicker's. */
  locale?: string;
  /** Override any UI text. Merged over `pricingCardLabels`. */
  labels?: Partial<PricingCardLabels>;
};

/** One plan in a pricing table: name, price, features and a call to action. `featured` raises it. */
export function PricingCard({ name, description, price, billing, currency = "EUR", features, cta, featured, onSelect, className, locale, labels }: PricingCardProps) {
  const l = { ...pricingCardLabels, ...labels };
  return (
    <div
      className={cn(
        "flex min-w-0 flex-col gap-6 rounded-card border p-6",
        featured ? "border-accent bg-surface" : "border-line bg-surface",
        className,
      )}
    >
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-base font-semibold text-ink">{name}</h3>
          {featured && <span className="rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-medium text-accent">{l.featured}</span>}
        </div>
        <p className="text-sm text-muted">{description}</p>
      </div>
      <div className="flex items-baseline gap-1.5">
        <NumberTicker
          value={price[billing]}
          locale={locale}
          format={{ style: "currency", currency, maximumFractionDigits: 0 }}
          className="text-[40px] font-medium tracking-tight text-ink"
        />
        <span className="text-sm text-muted">{l.perMonth(price[billing] > 0 && billing === "yearly")}</span>
      </div>
      <Button variant={featured ? "primary" : "secondary"} onClick={onSelect} className="w-full">
        {cta}
      </Button>
      <ul className="flex flex-col gap-2.5 text-sm text-ink">
        {features.map((f) => (
          <li key={f} className="flex gap-2.5">
            <Check className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
            {f}
          </li>
        ))}
      </ul>
    </div>
  );
}
