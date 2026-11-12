import { useMemo, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Minus, Plus, ShoppingBag, Truck, X } from "lucide-react";
import { cn } from "../../cn";
import { easeOut, springFirm, springSoft } from "../../motion";

/** Text swaps hand over rather than overlap. */
const textSwap = (show: boolean) => (show ? { duration: 0.18, delay: 0.08, ease: easeOut } : { duration: 0.09, ease: easeOut });
import { Drawer } from "../overlays/Drawer";
import { Button } from "../buttons/Button";
import { cartTotals, formatMoney, type CartLine, type TotalsOptions } from "./commerce";

/** Text used by CartDrawer. Pass a partial via `labels` to translate or reword. */
export interface CartDrawerLabels {
  /** Summary row: subtotal. */
  subtotal: string;
  /** Summary row: shipping. */
  shipping: string;
  /** Shipping value when it costs nothing. */
  free: string;
  /** Summary row: tax, given the formatted rate (e.g. "8.25%"). */
  tax: (rate: string) => string;
  /** Summary row: total. */
  total: string;
  /** Checkout button text, given the formatted total. */
  checkout: (total: string) => string;
  /** Free-shipping hint, given the formatted amount still needed. Rendered around the amount. */
  addForFreeShipping: (amount: ReactNode) => ReactNode;
  /** Message once free shipping is reached. */
  shipsFree: string;
  /** aria-label of the free-shipping progress bar. */
  towardsFreeShipping: string;
  /** Empty state heading. */
  emptyTitle: string;
  /** Empty state body. */
  emptyBody: string;
  /** Empty state button. */
  continueShopping: string;
  /** aria-label of the list of cart lines. */
  itemsList: string;
  /** Visible text of a row's remove button. */
  remove: string;
  /** aria-label of a row's remove button. */
  removeItem: (name: string) => string;
  /** aria-label of a row's quantity group. */
  quantityOf: (name: string) => string;
  /** aria-label of the quantity minus button. */
  fewer: string;
  /** aria-label of the quantity plus button. */
  more: string;
}
export const cartDrawerLabels: CartDrawerLabels = {
  subtotal: "Subtotal",
  shipping: "Shipping",
  free: "Free",
  tax: (rate) => `Tax (${rate})`,
  total: "Total",
  checkout: (total) => `Check out · ${total}`,
  addForFreeShipping: (amount) => <>Add {amount} more for free shipping</>,
  shipsFree: "Your order ships free",
  towardsFreeShipping: "Towards free shipping",
  emptyTitle: "Your cart is empty",
  emptyBody: "Nothing in here but a faint smell of Bantha. Find something you like.",
  continueShopping: "Continue shopping",
  itemsList: "Items in your cart",
  remove: "Remove",
  removeItem: (name) => `Remove ${name}`,
  quantityOf: (name) => `Quantity of ${name}`,
  fewer: "One fewer",
  more: "One more",
};

/**
 * The cart as a drawer from the right. Quantities step in place, removed rows
 * fold away, and the summary and the free-shipping bar follow every change.
 */
export interface CartDrawerIcons {
  /** Free-shipping bar. */
  shipping: ReactNode;
  /** Empty-state badge. */
  empty: ReactNode;
  /** Remove button on a line. */
  remove: ReactNode;
  /** Quantity stepper, decrease. */
  fewer: ReactNode;
  /** Quantity stepper, increase. */
  more: ReactNode;
}
export const cartDrawerIcons: CartDrawerIcons = { shipping: <Truck />, empty: <ShoppingBag />, remove: <X />, fewer: <Minus />, more: <Plus /> };

export function CartDrawer({
  open, onOpenChange, lines, onChange, pricing, currency = "USD", onCheckout, onContinue, title = "Your cart", labels, icons,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  lines: CartLine[];
  onChange: (lines: CartLine[]) => void;
  pricing: TotalsOptions;
  currency?: string;
  onCheckout: () => void;
  /** "Continue shopping" in the empty state. Defaults to closing. */
  onContinue?: () => void;
  title?: string;
  /** Override any UI text. Merged over `cartDrawerLabels`. */
  labels?: Partial<CartDrawerLabels>;
  /** Replace any built-in icon. Merged over `cartDrawerIcons`. */
  icons?: Partial<CartDrawerIcons>;
}) {
  const l = { ...cartDrawerLabels, ...labels };
  const ic = useMemo(() => ({ ...cartDrawerIcons, ...icons }), [icons]);
  const t = cartTotals(lines, pricing);
  const money = (n: number) => formatMoney(n, currency);
  const count = lines.reduce((s, l) => s + l.quantity, 0);
  const setQty = (id: string, q: number) => onChange(lines.map((l) => (l.id === id ? { ...l, quantity: q } : l)));
  const remove = (id: string) => onChange(lines.filter((l) => l.id !== id));
  const progress = pricing.freeShippingAt ? Math.min(1, t.subtotal / pricing.freeShippingAt) : 1;

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      title={count ? `${title} (${count})` : title}
      width={420}
      footer={lines.length > 0 ? (
        <div className="flex w-full flex-col gap-4">
          <dl className="flex flex-col gap-2 text-sm">
            <Row label={l.subtotal} value={money(t.subtotal)} />
            <Row label={l.shipping} value={t.shipping === 0 ? l.free : money(t.shipping)} />
            <Row label={l.tax(`${(pricing.taxRate * 100).toFixed(2).replace(/\.?0+$/, "")}%`)} value={money(t.tax)} />
            <div className="mt-1 flex items-baseline justify-between gap-4 pt-2 text-base font-semibold text-ink">
              <dt>{l.total}</dt>
              <dd className="tabular">{money(t.total)}</dd>
            </div>
          </dl>
          <Button size="lg" className="w-full" onClick={onCheckout}>{l.checkout(money(t.total))}</Button>
        </div>
      ) : undefined}
    >
      <div className="flex min-h-full flex-col">
        {pricing.freeShippingAt != null && lines.length > 0 && (
          <div className="mb-2 rounded-card bg-raised p-3.5">
            <p className="flex items-center gap-2 text-[13px] text-ink">
              <span className="inline-flex shrink-0 text-muted [&>svg]:size-4" aria-hidden>{ic.shipping}</span>
              <span className="grid [&>*]:[grid-area:1/1]">
                <motion.span initial={false} animate={{ opacity: t.toFreeShipping > 0 ? 1 : 0 }} transition={textSwap(t.toFreeShipping > 0)} aria-hidden={t.toFreeShipping === 0}>
                  {l.addForFreeShipping(<span className="font-medium tabular">{money(t.toFreeShipping)}</span>)}
                </motion.span>
                <motion.span initial={false} animate={{ opacity: t.toFreeShipping === 0 ? 1 : 0 }} transition={textSwap(t.toFreeShipping === 0)} aria-hidden={t.toFreeShipping > 0}>
                  {l.shipsFree}
                </motion.span>
              </span>
            </p>
            <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-active" role="progressbar" aria-label={l.towardsFreeShipping} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress * 100)}>
              <motion.div className={cn("h-full origin-left transition-colors duration-300", progress >= 1 ? "bg-positive" : "bg-btn-primary")} initial={false} animate={{ scaleX: progress }} transition={springFirm} />
            </div>
          </div>
        )}

        <AnimatePresence initial={false} mode="wait">
          {lines.length === 0 ? (
            <motion.div key="empty" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={springSoft}
              className="flex flex-1 flex-col items-center justify-center gap-3 px-8 pb-10 text-center">
              <span className="grid size-14 place-items-center rounded-full bg-raised text-muted [&>svg]:size-6">{ic.empty}</span>
              <p className="text-base font-medium text-ink">{l.emptyTitle}</p>
              <p className="max-w-60 text-sm text-muted">{l.emptyBody}</p>
              <Button variant="secondary" className="mt-2" onClick={() => (onContinue ? onContinue() : onOpenChange(false))}>{l.continueShopping}</Button>
            </motion.div>
          ) : (
            <motion.ul key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.12 } }} className="flex flex-col" aria-label={l.itemsList}>
              <AnimatePresence initial={false}>
                {lines.map((ln) => (
                  <motion.li
                    key={ln.id}
                    exit={{ opacity: 0, height: 0, transition: { opacity: { duration: 0.12 }, height: { duration: 0.28, ease: easeOut, delay: 0.08 } } }}
                    className="overflow-hidden"
                  >
                    <div className="flex gap-3.5 py-3.5">
                      <img decoding="async" src={ln.image.src} alt={ln.image.alt} className="size-20 shrink-0 rounded-[10px] bg-raised object-cover" />
                      <div className="flex min-w-0 flex-1 flex-col">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-ink">{ln.name}</p>
                            {ln.variant && <p className="truncate text-[13px] text-muted">{ln.variant}</p>}
                          </div>
                          <p className="shrink-0 text-sm font-medium text-ink tabular">{money(ln.price * ln.quantity)}</p>
                        </div>
                        <div className="mt-auto flex items-center justify-between gap-3 pt-2">
                          <Stepper value={ln.quantity} max={ln.max ?? 9} name={ln.name} labels={l} icons={ic} onChange={(q) => setQty(ln.id, q)} />
                          <button type="button" onClick={() => remove(ln.id)} aria-label={l.removeItem(ln.name)}
                            className="inline-flex h-8 items-center gap-1 rounded-control px-2 text-[13px] text-muted transition-colors hover:bg-raised hover:text-ink">
                            <span className="inline-flex [&>svg]:size-3.5" aria-hidden>{ic.remove}</span> {l.remove}
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.li>
                ))}
              </AnimatePresence>
            </motion.ul>
          )}
        </AnimatePresence>
      </div>
    </Drawer>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="text-muted">{label}</dt>
      <dd className="text-ink tabular">{value}</dd>
    </div>
  );
}

/** A compact stepper for cart rows. At 1, the minus becomes unavailable; Remove is beside it. */
function Stepper({ value, onChange, max, name, labels, icons }: { value: number; onChange: (v: number) => void; max: number; name: string; labels: CartDrawerLabels; icons: CartDrawerIcons }) {
  const btn = "grid size-8 place-items-center [&>svg]:size-3.5 text-muted transition-colors hover:text-ink disabled:opacity-35 disabled:hover:text-muted";
  return (
    <div className="inline-flex h-8 items-center rounded-control bg-raised" role="group" aria-label={labels.quantityOf(name)}>
      <button type="button" aria-label={labels.fewer} disabled={value <= 1} onClick={() => onChange(value - 1)} className={btn}>{icons.fewer}</button>
      <span className="w-6 text-center text-sm font-medium text-ink tabular" aria-live="polite">{value}</span>
      <button type="button" aria-label={labels.more} disabled={value >= max} onClick={() => onChange(value + 1)} className={btn}>{icons.more}</button>
    </div>
  );
}
