/* Shared types and arithmetic for the commerce components. Money is kept in
   minor units (cents) everywhere so totals always add up to the cent. */

export type ProductImage = { src: string; alt: string; /** A small version for thumbnails; the full src is used when left out. */ thumb?: string };

export type CartLine = {
  id: string;
  name: string;
  /** e.g. "Black · L". */
  variant?: string;
  /** Unit price in cents. */
  price: number;
  quantity: number;
  image: ProductImage;
  /** Most that can be bought. */
  max?: number;
};

export type Totals = {
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  /** Cents still needed for free shipping, 0 once reached. */
  toFreeShipping: number;
};

export type TotalsOptions = {
  /** Flat shipping in cents, waived at or above `freeShippingAt`. */
  shipping: number;
  freeShippingAt?: number;
  /** e.g. 0.0825 for 8.25%. Applied to the discounted subtotal. */
  taxRate: number;
  /** Fraction off the subtotal, e.g. 0.1. */
  discountRate?: number;
};

/** One place that does the sums, so the cart, the checkout and the summary always agree. */
export function cartTotals(lines: CartLine[], o: TotalsOptions): Totals {
  const subtotal = lines.reduce((s, l) => s + l.price * l.quantity, 0);
  const discount = Math.round(subtotal * (o.discountRate ?? 0));
  const free = o.freeShippingAt != null && subtotal >= o.freeShippingAt;
  const shipping = subtotal === 0 || free ? 0 : o.shipping;
  const tax = Math.round((subtotal - discount) * o.taxRate);
  return {
    subtotal,
    discount,
    shipping,
    tax,
    total: subtotal - discount + shipping + tax,
    toFreeShipping: o.freeShippingAt == null ? 0 : Math.max(0, o.freeShippingAt - subtotal),
  };
}

export function formatMoney(cents: number, currency = "USD", locale = "en-US") {
  return new Intl.NumberFormat(locale, { style: "currency", currency }).format(cents / 100);
}
