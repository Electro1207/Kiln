import type { ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "../../cn";
import { fade, springSoft } from "../../motion";

/** Text used by Invoice. Pass a partial via `labels` to translate or reword. */
export interface InvoiceLabels {
  /** aria-label of the article, given the invoice number. */
  invoice: (number: string) => string;
  /** Heading. */
  title: string;
  issued: string;
  due: string;
  from: string;
  billTo: string;
  /** Table column headings. */
  description: string;
  qty: string;
  price: string;
  amount: string;
  subtotal: string;
  /** Total row once paid, and before. */
  paid: string;
  amountDue: string;
  /** Text of the PAID stamp. */
  stamp: string;
  /** Screen-reader announcement when marked paid. */
  markedPaid: string;
}
export const invoiceLabels: InvoiceLabels = {
  invoice: (n) => `Invoice ${n}`,
  title: "Invoice",
  issued: "Issued",
  due: "Due",
  from: "From",
  billTo: "Bill to",
  description: "Description",
  qty: "Qty",
  price: "Price",
  amount: "Amount",
  subtotal: "Subtotal",
  paid: "Paid",
  amountDue: "Amount due",
  stamp: "Paid",
  markedPaid: "Invoice marked as paid",
};

export type InvoiceLine = { description: string; detail?: string; qty: number; unit: number };
export type InvoiceParty = { name: string; lines: string[] };

export type InvoiceProps = {
  number: string;
  issued: string;
  due: string;
  from: InvoiceParty;
  to: InvoiceParty;
  items: InvoiceLine[];
  /** Fraction, e.g. 0.0825. */
  taxRate?: number;
  taxLabel?: string;
  currency?: string;
  locale?: string;
  paid?: boolean;
  /** Payment details, terms, a thank-you line. */
  notes?: ReactNode;
  /** Buttons for the top bar (print, download, mark paid). */
  actions?: ReactNode;
  /** Override any UI text. Merged over `invoiceLabels`. */
  labels?: Partial<InvoiceLabels>;
  className?: string;
};

/** An invoice or receipt as a document. Totals are computed from the lines. */
export function Invoice({
  number, issued, due, from, to, items, taxRate = 0, taxLabel = "Tax", currency = "USD", locale = "en-US", paid, notes, actions, className, labels,
}: InvoiceProps) {
  const lb = { ...invoiceLabels, ...labels };
  const money = new Intl.NumberFormat(locale, { style: "currency", currency });
  const date = (iso: string) => new Date(iso + "T12:00:00").toLocaleDateString(locale, { day: "numeric", month: "long", year: "numeric" });
  const subtotal = items.reduce((s, i) => s + i.qty * i.unit, 0);
  const tax = Math.round(subtotal * taxRate * 100) / 100;
  const total = subtotal + tax;

  return (
    <article className={cn("relative w-full overflow-hidden rounded-card border border-line bg-surface text-ink", className)} aria-label={lb.invoice(number)}>
      {actions && <div className="flex flex-wrap items-center justify-end gap-2 border-b border-line px-5 py-3 sm:px-8">{actions}</div>}
      <div className="flex flex-col gap-8 p-5 sm:p-8">
        <header className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <h3 className="text-[22px] font-semibold tracking-tight">{lb.title}</h3>
            <p className="tabular mt-1 text-sm text-muted">{number}</p>
          </div>
          <dl className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm">
            <dt className="text-muted">{lb.issued}</dt>
            <dd className="tabular text-right">{date(issued)}</dd>
            <dt className="text-muted">{lb.due}</dt>
            <dd className="tabular text-right">{date(due)}</dd>
          </dl>
        </header>

        <div className="grid gap-6 text-sm sm:grid-cols-2">
          {[[lb.from, from], [lb.billTo, to] as const].map(([k, p], idx) => (
            <div key={idx}>
              <p className="text-muted">{k as string}</p>
              <p className="mt-1 font-medium">{(p as InvoiceParty).name}</p>
              {(p as InvoiceParty).lines.map((l) => (
                <p key={l} className="text-muted">{l}</p>
              ))}
            </div>
          ))}
        </div>

        <table className="w-full border-separate border-spacing-0 text-sm">
          <thead className="max-sm:sr-only">
            <tr className="text-muted">
              <th scope="col" className="border-b border-line pb-2 text-left font-medium">{lb.description}</th>
              <th scope="col" className="w-16 border-b border-line pb-2 text-right font-medium">{lb.qty}</th>
              <th scope="col" className="w-28 border-b border-line pb-2 text-right font-medium">{lb.price}</th>
              <th scope="col" className="w-28 border-b border-line pb-2 text-right font-medium">{lb.amount}</th>
            </tr>
          </thead>
          <tbody>
            {items.map((i) => (
              <tr key={i.description} className="max-sm:grid max-sm:grid-cols-[1fr_auto] max-sm:border-b max-sm:border-line max-sm:py-3">
                <td className="py-3 align-top max-sm:col-span-2 max-sm:py-0 sm:border-b sm:border-line sm:pr-4">
                  <span className="block font-medium">{i.description}</span>
                  {i.detail && <span className="block text-[13px] text-muted">{i.detail}</span>}
                </td>
                <td className="tabular py-3 text-right align-top max-sm:hidden sm:border-b sm:border-line">{i.qty}</td>
                <td className="tabular py-3 text-right align-top max-sm:col-start-1 max-sm:py-0 max-sm:text-left max-sm:text-muted sm:border-b sm:border-line">
                  <span className="sm:hidden">{i.qty} × </span>
                  {money.format(i.unit)}
                </td>
                <td className="tabular py-3 text-right align-top max-sm:col-start-2 max-sm:row-start-2 max-sm:py-0 sm:border-b sm:border-line">
                  {money.format(i.qty * i.unit)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex flex-col-reverse gap-8 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-sm text-[13px] text-muted">{notes}</div>
          <dl className="tabular grid min-w-60 grid-cols-[1fr_auto] gap-x-8 gap-y-1.5 text-sm">
            <dt className="text-muted">{lb.subtotal}</dt>
            <dd className="text-right">{money.format(subtotal)}</dd>
            {taxRate > 0 && (
              <>
                <dt className="text-muted">
                  {taxLabel} ({+(taxRate * 100).toFixed(3)}%)
                </dt>
                <dd className="text-right">{money.format(tax)}</dd>
              </>
            )}
            <dt className="mt-2 border-t border-line pt-3 font-semibold">{paid ? lb.paid : lb.amountDue}</dt>
            <dd className="mt-2 border-t border-line pt-3 text-right text-base font-semibold">{money.format(total)}</dd>
          </dl>
        </div>
      </div>

      <AnimatePresence>
        {paid && (
          <motion.div
            key="stamp"
            aria-hidden
            className="pointer-events-none absolute right-6 top-24 sm:right-12 sm:top-28"
            initial={{ opacity: 0, scale: 1.25, rotate: -14 }}
            animate={{ opacity: 1, scale: 1, rotate: -10 }}
            exit={{ opacity: 0, scale: 0.95, transition: fade }}
            transition={springSoft}
          >
            <span className="block rounded-[6px] border-[3px] border-positive px-3 py-1 text-2xl font-semibold tracking-tight text-positive">
              {lb.stamp}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
      <span className="sr-only" aria-live="polite">{paid ? lb.markedPaid : ""}</span>
    </article>
  );
}
