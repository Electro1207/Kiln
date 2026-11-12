import { useState, type FormEvent, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown, CreditCard, Lock, Tag as TagIcon } from "lucide-react";
import { cn } from "../../cn";
import { easeOut, fade, springSnappy } from "../../motion";
import { TextField } from "../text-input/TextField";
import { RadioGroup } from "../choice-controls/RadioGroup";
import { Select, type SelectOption } from "../pickers/Select";
import { Button } from "../buttons/Button";
import { cartTotals, formatMoney, type CartLine } from "./commerce";

export type DeliveryOption = {
  id: string;
  label: string;
  description: string;
  /** Cents. */
  price: number;
  /** Free at or above this subtotal (cents). */
  freeAt?: number;
};

export type Promo = { code: string; rate: number; label: string };

export type CheckoutDetails = {
  email: string;
  name: string;
  address: string;
  city: string;
  postcode: string;
  country: string;
  delivery: string;
  promo: string | null;
};

/** Text used by CheckoutForm. Pass a partial via `labels` to translate or reword. */
export interface CheckoutFormLabels {
  /** Section headings. */
  contact: string;
  shippingAddress: string;
  delivery: string;
  payment: string;
  /** Contact fields. */
  email: string;
  emailHint: string;
  fullName: string;
  address: string;
  city: string;
  postcode: string;
  country: string;
  /** Group label of the delivery radio cards. */
  deliveryMethod: string;
  /** Aside shown on a free delivery option and the free shipping total. */
  free: string;
  /** Validation errors. */
  emailError: string;
  nameError: string;
  addressError: string;
  cityError: string;
  postcodeError: string;
  /** Submit button text, given the formatted total. */
  placeOrder: (total: string) => string;
  /** Submit button text once the order is placed. */
  orderPlaced: string;
  /** Status message after the order is placed. */
  orderPlacedNote: string;
  /** aria-label of the summary sidebar. */
  orderSummary: string;
  /** Heading of the summary (wide screens). */
  orderSummaryTitle: string;
  /** Phone summary toggle texts. */
  showSummary: string;
  hideSummary: string;
  /** Promo field aria-label and placeholder. */
  promoCode: string;
  /** Promo apply button. */
  apply: string;
  /** Promo error. */
  promoError: string;
  /** Promo remove button. */
  remove: string;
  /** Summary rows. */
  subtotal: string;
  shippingRow: (method: string) => string;
  tax: string;
  total: string;
  /** Demo card texts. */
  demoBanner: string;
  demoCardGroup: string;
  cardNumber: string;
  demoExpiryGroup: string;
  expiry: string;
  demoCodeGroup: string;
  securityCode: string;
  demoNote: string;
}
export const checkoutFormLabels: CheckoutFormLabels = {
  contact: "Contact",
  shippingAddress: "Shipping address",
  delivery: "Delivery",
  payment: "Payment",
  email: "Email",
  emailHint: "Your receipt and tracking go here.",
  fullName: "Full name",
  address: "Address",
  city: "Town or city",
  postcode: "Postcode",
  country: "Country",
  deliveryMethod: "Delivery method",
  free: "Free",
  emailError: "Enter an email we can send the receipt to.",
  nameError: "Who is this going to?",
  addressError: "Add a street address.",
  cityError: "Add a town or city.",
  postcodeError: "Add a postcode.",
  placeOrder: (total) => `Place order · ${total}`,
  orderPlaced: "Order placed",
  orderPlacedNote: "Order placed. This is a demo, so nothing was charged and nothing will ship.",
  orderSummary: "Order summary",
  orderSummaryTitle: "Order summary",
  showSummary: "Show order summary",
  hideSummary: "Hide order summary",
  promoCode: "Promo code",
  apply: "Apply",
  promoError: "That code doesn't work here. These aren't the codes you're looking for.",
  remove: "Remove",
  subtotal: "Subtotal",
  shippingRow: (method) => `Shipping · ${method}`,
  tax: "Tax",
  total: "Total",
  demoBanner: "Demo — no payment is taken",
  demoCardGroup: "Demo card number, not editable",
  cardNumber: "Card number",
  demoExpiryGroup: "Demo expiry, not editable",
  expiry: "Expiry",
  demoCodeGroup: "Demo security code, not editable",
  securityCode: "Security code",
  demoNote: "These fields are pictures of fields. Put your payment provider's secure fields here.",
};

/**
 * Contact, address, delivery and a payment step beside a summary that stays
 * in view. The payment fields are display only: this component never takes
 * card details. Wire a real payment provider's own fields in their place.
 */
export function CheckoutForm({
  lines, delivery, countries, taxRate, currency = "USD", checkPromo, onPlaceOrder, paymentSlot, labels,
}: {
  lines: CartLine[];
  delivery: DeliveryOption[];
  countries: SelectOption[];
  taxRate: number;
  currency?: string;
  /** Return the promo for a code, or null if it isn't valid. */
  checkPromo: (code: string) => Promo | null;
  onPlaceOrder: (details: CheckoutDetails) => Promise<void>;
  /** Your payment provider's fields. Without it, a clearly marked demo card shows. */
  paymentSlot?: ReactNode;
  /** Override any UI text. Merged over `checkoutFormLabels`. */
  labels?: Partial<CheckoutFormLabels>;
}) {
  const l = { ...checkoutFormLabels, ...labels };
  const [f, setF] = useState({ email: "", name: "", address: "", city: "", postcode: "", country: countries[0]?.value ?? "" });
  const [errors, setErrors] = useState<Partial<Record<keyof typeof f, string>>>({});
  const [method, setMethod] = useState(delivery[0].id);
  const [promo, setPromo] = useState<Promo | null>(null);
  const [state, setState] = useState<"idle" | "placing" | "done">("idle");

  const opt = delivery.find((d) => d.id === method) ?? delivery[0];
  const t = cartTotals(lines, { shipping: opt.price, freeShippingAt: opt.freeAt, taxRate, discountRate: promo?.rate });
  const money = (n: number) => formatMoney(n, currency);
  const set = (k: keyof typeof f) => (v: string) => { setF((s) => ({ ...s, [k]: v })); setErrors((e) => ({ ...e, [k]: undefined })); };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.email)) next.email = l.emailError;
    if (!f.name.trim()) next.name = l.nameError;
    if (!f.address.trim()) next.address = l.addressError;
    if (!f.city.trim()) next.city = l.cityError;
    if (!f.postcode.trim()) next.postcode = l.postcodeError;
    setErrors(next);
    if (Object.keys(next).length) return;
    setState("placing");
    await onPlaceOrder({ ...f, delivery: method, promo: promo?.code ?? null });
    setState("done");
  };

  const summary = <Summary lines={lines} t={t} money={money} promo={promo} setPromo={setPromo} checkPromo={checkPromo} shippingLabel={opt.label} l={l} />;

  return (
    <form onSubmit={submit} noValidate className="grid w-full gap-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start lg:gap-10">
      <MobileSummary total={money(t.total)} l={l}>{summary}</MobileSummary>

      <div className="flex min-w-0 flex-col gap-8">
        <Section title={l.contact}>
          <TextField label={l.email} type="email" autoComplete="email" value={f.email} onChange={(e) => set("email")(e.target.value)} error={errors.email} hint={l.emailHint} />
        </Section>

        <Section title={l.shippingAddress}>
          <TextField label={l.fullName} autoComplete="name" value={f.name} onChange={(e) => set("name")(e.target.value)} error={errors.name} />
          <TextField label={l.address} autoComplete="street-address" value={f.address} onChange={(e) => set("address")(e.target.value)} error={errors.address} />
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField label={l.city} autoComplete="address-level2" value={f.city} onChange={(e) => set("city")(e.target.value)} error={errors.city} />
            <TextField label={l.postcode} autoComplete="postal-code" value={f.postcode} onChange={(e) => set("postcode")(e.target.value)} error={errors.postcode} />
          </div>
          <Select label={l.country} options={countries} value={f.country} onChange={set("country")} />
        </Section>

        <Section title={l.delivery}>
          <RadioGroup
            label={l.deliveryMethod}
            variant="card"
            columns={delivery.length >= 3 ? 3 : 2}
            value={method}
            onChange={setMethod}
            options={delivery.map((d) => {
              const free = d.freeAt != null && t.subtotal >= d.freeAt;
              return { value: d.id, label: d.label, description: d.description, aside: free || d.price === 0 ? l.free : money(d.price) };
            })}
          />
        </Section>

        <Section title={l.payment}>
          {paymentSlot ?? <DemoCard l={l} />}
        </Section>

        <div className="flex flex-col gap-3">
          <Button type="submit" size="lg" loading={state === "placing"} disabled={state === "done"} className="w-full" leading={<Lock />}>
            {state === "done" ? l.orderPlaced : l.placeOrder(money(t.total))}
          </Button>
          <AnimatePresence initial={false}>
            {state === "done" && (
              <motion.p key="done" role="status" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, ease: easeOut }} className="rounded-card bg-positive-soft px-4 py-3 text-sm text-positive">
                {l.orderPlacedNote}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>

      <aside className="hidden lg:sticky lg:top-6 lg:block" aria-label={l.orderSummary}>
        <div className="rounded-sheet bg-surface p-5">{summary}</div>
      </aside>
    </form>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <h3 className="text-base font-semibold text-ink">{title}</h3>
      {children}
    </section>
  );
}

/** Looks like card fields so the flow reads true, but holds no inputs at all. */
function DemoCard({ l }: { l: CheckoutFormLabels }) {
  const box = "flex h-10 items-center gap-2 rounded-control border border-line bg-raised px-3 text-sm text-muted tabular";
  return (
    <div className="flex flex-col gap-4 rounded-card bg-surface p-4">
      <p className="flex items-center gap-2 rounded-control bg-warning-soft px-3 py-2 text-[13px] font-medium text-warning">
        <Lock className="size-3.5 shrink-0" aria-hidden /> {l.demoBanner}
      </p>
      <div className="flex flex-col gap-2" aria-label={l.demoCardGroup} role="group">
        <span className="text-sm font-medium text-ink">{l.cardNumber}</span>
        <div className={box} aria-readonly="true"><CreditCard className="size-4 shrink-0" aria-hidden /> 4242 4242 4242 4242</div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2" role="group" aria-label={l.demoExpiryGroup}>
          <span className="text-sm font-medium text-ink">{l.expiry}</span>
          <div className={box} aria-readonly="true">10 / 28</div>
        </div>
        <div className="flex flex-col gap-2" role="group" aria-label={l.demoCodeGroup}>
          <span className="text-sm font-medium text-ink">{l.securityCode}</span>
          <div className={box} aria-readonly="true">•••</div>
        </div>
      </div>
      <p className="text-[13px] text-muted">{l.demoNote}</p>
    </div>
  );
}

function Summary({ lines, t, money, promo, setPromo, checkPromo, shippingLabel, l }: {
  l: CheckoutFormLabels;
  lines: CartLine[];
  t: ReturnType<typeof cartTotals>;
  money: (n: number) => string;
  promo: Promo | null;
  setPromo: (p: Promo | null) => void;
  checkPromo: (code: string) => Promo | null;
  shippingLabel: string;
}) {
  const [code, setCode] = useState("");
  const [err, setErr] = useState<string | undefined>();
  const apply = () => {
    const p = checkPromo(code.trim());
    if (p) { setPromo(p); setErr(undefined); setCode(""); }
    else setErr(l.promoError);
  };
  return (
    <div className="flex flex-col gap-5">
      {/* On a phone the fold's toggle already says "order summary". */}
      <h3 className="hidden text-base font-semibold text-ink lg:block">{l.orderSummaryTitle}</h3>
      <ul className="flex flex-col gap-3.5">
        {lines.map((ln) => (
          <li key={ln.id} className="flex items-center gap-3">
            <span className="relative shrink-0">
              <img decoding="async" src={ln.image.src} alt="" className="size-14 rounded-[10px] bg-raised object-cover" />
              <span className="absolute -right-1.5 -top-1.5 grid size-5 place-items-center rounded-full bg-btn-secondary text-[11px] font-medium text-btn-secondary-ink tabular">{ln.quantity}</span>
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-ink">{ln.name}</span>
              {ln.variant && <span className="block truncate text-[13px] text-muted">{ln.variant}</span>}
            </span>
            <span className="shrink-0 text-sm text-ink tabular">{money(ln.price * ln.quantity)}</span>
          </li>
        ))}
      </ul>
      <div className="flex items-start gap-2">
        <TextField
          aria-label={l.promoCode}
          placeholder={l.promoCode}
          leading={<TagIcon />}
          value={code}
          onChange={(e) => { setCode(e.target.value.toUpperCase()); setErr(undefined); }}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); apply(); } }}
          error={err}
          containerClassName="flex-1"
        />
        <Button type="button" variant="secondary" onClick={apply} disabled={!code.trim()}>{l.apply}</Button>
      </div>
      <dl className="flex flex-col gap-2 text-sm">
        <Line label={l.subtotal} value={money(t.subtotal)} />
        <AnimatePresence initial={false}>
          {promo && (
            <motion.div key="promo" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={fade} className="flex items-baseline justify-between gap-4">
              <dt className="flex items-center gap-2 text-muted">
                {promo.label}
                <button type="button" onClick={() => setPromo(null)} className="text-[13px] text-accent hover:underline">{l.remove}</button>
              </dt>
              <dd className="text-positive tabular">−{money(t.discount)}</dd>
            </motion.div>
          )}
        </AnimatePresence>
        <Line label={l.shippingRow(shippingLabel)} value={t.shipping === 0 ? l.free : money(t.shipping)} />
        <Line label={l.tax} value={money(t.tax)} />
        <div className="mt-1 flex items-baseline justify-between gap-4 pt-2 text-base font-semibold text-ink">
          <dt>{l.total}</dt>
          <dd className="tabular">{money(t.total)}</dd>
        </div>
      </dl>
    </div>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="min-w-0 truncate text-muted">{label}</dt>
      <dd className="shrink-0 text-ink tabular">{value}</dd>
    </div>
  );
}

function MobileSummary({ total, children, l }: { total: string; children: ReactNode; l: CheckoutFormLabels }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-sheet bg-surface lg:hidden">
      <button type="button" aria-expanded={open} onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-sm">
        <span className="flex items-center gap-2 font-medium text-accent">
          {open ? l.hideSummary : l.showSummary}
          <motion.span initial={false} animate={{ rotate: open ? 180 : 0 }} transition={springSnappy} className="grid"><ChevronDown className="size-4" /></motion.span>
        </span>
        <span className="font-semibold text-ink tabular">{total}</span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div key="s" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ height: { duration: 0.32, ease: easeOut }, opacity: { duration: 0.2 } }} className={cn("overflow-hidden")}>
            <div className="px-4 pb-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
