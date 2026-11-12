import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, ChevronDown, RotateCcw, Truck } from "lucide-react";
import { cn } from "../../cn";
import { easeOut, fade, springSnappy } from "../../motion";
import { Badge, type BadgeTone } from "../status/Badge";
import { Button } from "../buttons/Button";
import { formatMoney, type ProductImage } from "./commerce";

export type OrderStatus = "processing" | "shipped" | "delivered" | "cancelled";

export type Order = {
  id: string;
  /** ISO date the order was placed. */
  placed: string;
  status: OrderStatus;
  /** Cents. */
  total: number;
  items: { name: string; variant?: string; quantity: number; image: ProductImage }[];
  /** Tracking steps, oldest first. `done` marks the ones that have happened. */
  tracking?: { label: string; detail?: string; date?: string; done: boolean }[];
  carrier?: string;
};

const statusTone: Record<OrderStatus, BadgeTone> = {
  processing: "warning",
  shipped: "info",
  delivered: "positive",
  cancelled: "neutral",
};

/** Text used by OrderHistory. Pass a partial via `labels` to translate or reword. */
export interface OrderHistoryLabels {
  /** Status badge text per order status. */
  status: Record<OrderStatus, string>;
  /** Heading of the order id. */
  order: string;
  /** Heading of the placed date. */
  placed: string;
  /** Heading of the total. */
  total: string;
  /** aria-label of the items list, given the item count. */
  itemsCount: (count: number) => string;
  /** Quantity text, e.g. "Qty 2". */
  qty: (n: number) => string;
  /** Tracking toggle when closed. */
  trackOrder: string;
  /** Tracking toggle when open. */
  hideTracking: string;
  /** Reorder button. */
  buyAgain: string;
  /** Reorder button once done. */
  addedToCart: string;
  /** Screen-reader announcement after reordering, given the order id. */
  reorderAnnounce: (id: string) => string;
}
export const orderHistoryLabels: OrderHistoryLabels = {
  status: { processing: "Processing", shipped: "On its way", delivered: "Delivered", cancelled: "Cancelled" },
  order: "Order",
  placed: "Placed",
  total: "Total",
  itemsCount: (count) => `${count} items`,
  qty: (n) => `Qty ${n}`,
  trackOrder: "Track order",
  hideTracking: "Hide tracking",
  buyAgain: "Buy again",
  addedToCart: "Added to cart",
  reorderAnnounce: (id) => `Items from order ${id} added to cart`,
};

/** Text swaps hand over rather than overlap. */
const textSwap = (show: boolean) => (show ? { duration: 0.18, delay: 0.08, ease: easeOut } : { duration: 0.09, ease: easeOut });

/**
 * Past orders. Each shows its status, items and two actions: tracking folds
 * open beneath the order, and reorder confirms in place.
 */
export interface OrderHistoryIcons {
  /** Track button. */
  track: ReactNode;
  /** Chevron on the track button; turns over when open. */
  expand: ReactNode;
  /** Buy again button. */
  reorder: ReactNode;
  /** Confirmation after buying again. */
  added: ReactNode;
}
export const orderHistoryIcons: OrderHistoryIcons = { track: <Truck />, expand: <ChevronDown />, reorder: <RotateCcw />, added: <Check /> };

export function OrderHistory({ orders, onReorder, currency = "USD", locale, labels, icons }: {
  orders: Order[];
  onReorder: (order: Order) => Promise<void> | void;
  currency?: string;
  /** BCP 47 locale for dates. Defaults to "en-US". */
  locale?: string;
  /** Override any UI text. Merged over `orderHistoryLabels`. */
  labels?: Partial<OrderHistoryLabels>;
  /** Replace any built-in icon. Merged over `orderHistoryIcons`. */
  icons?: Partial<OrderHistoryIcons>;
}) {
  const l = { ...orderHistoryLabels, ...labels };
  const ic = useMemo(() => ({ ...orderHistoryIcons, ...icons }), [icons]);
  return (
    <ul className="flex w-full flex-col gap-4">
      {orders.map((o) => <OrderCard key={o.id} order={o} onReorder={onReorder} currency={currency} locale={locale} l={l} ic={ic} />)}
    </ul>
  );
}

function OrderCard({ order: o, onReorder, currency, locale, l, ic }: { order: Order; onReorder: (o: Order) => Promise<void> | void; currency: string; locale?: string; l: OrderHistoryLabels; ic: OrderHistoryIcons }) {
  const [open, setOpen] = useState(false);
  const [re, setRe] = useState<"idle" | "busy" | "done">("idle");
  const t = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(t.current), []);
  const tone = statusTone[o.status];
  const date = (d: string) => new Date(d + "T12:00:00").toLocaleDateString(locale ?? "en-US", { month: "short", day: "numeric", year: "numeric" });
  const count = o.items.reduce((n, i) => n + i.quantity, 0);

  const reorder = async () => {
    setRe("busy");
    await onReorder(o);
    setRe("done");
    window.clearTimeout(t.current);
    t.current = window.setTimeout(() => setRe("idle"), 1800);
  };

  return (
    <li className="overflow-hidden rounded-sheet bg-surface">
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 px-4 pt-4 sm:px-5 sm:pt-5">
        <dl className="flex flex-wrap gap-x-8 gap-y-2 text-[13px]">
          <div><dt className="text-muted">{l.order}</dt><dd className="font-medium text-ink tabular">{o.id}</dd></div>
          <div><dt className="text-muted">{l.placed}</dt><dd className="text-ink">{date(o.placed)}</dd></div>
          <div><dt className="text-muted">{l.total}</dt><dd className="font-medium text-ink tabular">{formatMoney(o.total, currency)}</dd></div>
        </dl>
        <Badge tone={tone} dot>{l.status[o.status]}</Badge>
      </div>

      <ul className="flex flex-col gap-3 px-4 py-4 sm:px-5" aria-label={l.itemsCount(count)}>
        {o.items.map((it) => (
          <li key={it.name + (it.variant ?? "")} className="flex items-center gap-3">
            <img decoding="async" src={it.image.src} alt={it.image.alt} className={cn("size-14 shrink-0 rounded-[10px] bg-raised object-cover", o.status === "cancelled" && "opacity-60")} />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-ink">{it.name}</span>
              <span className="block truncate text-[13px] text-muted">{[it.variant, l.qty(it.quantity)].filter(Boolean).join(" · ")}</span>
            </span>
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap gap-2 px-4 pb-4 sm:px-5">
        {o.tracking && o.status !== "cancelled" && (
          <Button size="sm" variant="secondary" leading={ic.track} aria-expanded={open} onClick={() => setOpen((v) => !v)}
            trailing={<motion.span initial={false} animate={{ rotate: open ? 180 : 0 }} transition={springSnappy} className="grid [&>svg]:size-6">{ic.expand}</motion.span>}>
            <span className="grid [&>*]:[grid-area:1/1]">
              <motion.span initial={false} animate={{ opacity: open ? 0 : 1 }} transition={textSwap(!open)} aria-hidden={open}>{l.trackOrder}</motion.span>
              <motion.span initial={false} animate={{ opacity: open ? 1 : 0 }} transition={textSwap(open)} aria-hidden={!open}>{l.hideTracking}</motion.span>
            </span>
          </Button>
        )}
        <Button size="sm" variant="ghost" loading={re === "busy"} onClick={reorder}>
          <span className="grid justify-items-center [&>*]:[grid-area:1/1]">
            <motion.span className="inline-flex items-center gap-1.5" initial={false} animate={{ opacity: re === "done" ? 0 : 1 }} transition={textSwap(re !== "done")} aria-hidden={re === "done"}><span className="inline-flex [&>svg]:size-4">{ic.reorder}</span> {l.buyAgain}</motion.span>
            <motion.span className="inline-flex items-center gap-1.5 text-positive" initial={false} animate={{ opacity: re === "done" ? 1 : 0 }} transition={textSwap(re === "done")} aria-hidden={re !== "done"}><span className="inline-flex [&>svg]:size-4">{ic.added}</span> {l.addedToCart}</motion.span>
          </span>
        </Button>
        <span className="sr-only" aria-live="polite">{re === "done" ? l.reorderAnnounce(o.id) : ""}</span>
      </div>

      <AnimatePresence initial={false}>
        {open && o.tracking && (
          <motion.div key="track" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            transition={{ height: { duration: 0.32, ease: easeOut }, opacity: fade }} className="overflow-hidden">
            <div className="mx-4 mb-4 rounded-card bg-raised p-4 sm:mx-5">
              {o.carrier && <p className="mb-3 text-[13px] text-muted">{o.carrier}</p>}
              <ol className="flex flex-col">
                {o.tracking.map((step, i) => {
                  const last = i === o.tracking!.length - 1;
                  const current = step.done && (last || !o.tracking![i + 1].done);
                  return (
                    <li key={step.label} className="grid grid-cols-[20px_minmax(0,1fr)] gap-x-3">
                      <span className="flex flex-col items-center">
                        <span className={cn("mt-1 grid size-3.5 shrink-0 place-items-center rounded-full", step.done ? "bg-btn-primary" : "bg-active")}>
                          {current && <span className="size-1.5 rounded-full bg-btn-primary-ink" />}
                        </span>
                        {!last && <span className={cn("my-1 w-0.5 flex-1 rounded-full", o.tracking![i + 1].done ? "bg-btn-primary" : "bg-active")} />}
                      </span>
                      <span className={cn("pb-4", last && "pb-0")}>
                        <span className={cn("block text-sm", step.done ? "font-medium text-ink" : "text-muted")}>{step.label}</span>
                        {(step.detail || step.date) && <span className="block text-[13px] text-muted">{[step.detail, step.date && date(step.date)].filter(Boolean).join(" · ")}</span>}
                      </span>
                    </li>
                  );
                })}
              </ol>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
}
