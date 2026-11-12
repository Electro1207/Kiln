import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Eye, ShoppingBag } from "lucide-react";
import type { Category } from "../types";
import { Stage } from "../ui";
import { fade } from "../../kiln/motion";
import { ProductGallery } from "../../kiln/components/commerce/ProductGallery";
import { ProductQuickView, type QuickViewProduct } from "../../kiln/components/commerce/ProductQuickView";
import { CartDrawer } from "../../kiln/components/commerce/CartDrawer";
import { CheckoutForm, type Promo } from "../../kiln/components/commerce/CheckoutForm";
import { ReviewsSummary, type Review } from "../../kiln/components/commerce/ReviewsSummary";
import { CategoryFilters, emptyFilters, type Facet, type FilterValue } from "../../kiln/components/commerce/CategoryFilters";
import { OrderHistory, type Order } from "../../kiln/components/commerce/OrderHistory";
import { Button } from "../../kiln/components/buttons/Button";
import { cartTotals, formatMoney, type CartLine } from "../../kiln/components/commerce/commerce";
import { PRODUCTS, byId, imagesFor, line, thumb, type DemoProduct } from "./commerce-data";

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
const PRICING = { shipping: 795, freeShippingAt: 7500, taxRate: 0.0825 };

function toQuickView(p: DemoProduct): QuickViewProduct {
  return {
    id: p.id, name: p.name, price: p.price, compareAt: p.compareAt, description: p.description, rating: p.rating,
    colours: p.colours.map((c) => ({ value: c.value, name: c.name, light: c.light, images: imagesFor(p, c.value) })),
    sizes: p.sizes,
  };
}

const TEAPOT_DIR = `${import.meta.env.BASE_URL}demo/teapot/`;
const TEAPOT = (["front", "back", "lid", "handle", "relief"] as const).map((v) => ({
  src: `${TEAPOT_DIR}${v}.jpg`,
  thumb: `${TEAPOT_DIR}thumbs/${v}.jpg`,
  alt: {
    front: "Crimson stoneware teapot with green vine leaves and yellow grapes in relief, spout to the left",
    back: "The same teapot from the other side, handle to the left",
    lid: "Close-up of the lid and its twig-shaped knob",
    handle: "Close-up of the crabstock handle, modelled as a branch",
    relief: "Close-up of the moulded vine leaves and grapes",
  }[v],
}));

function GalleryDemo() {
  return (
    <Stage>
      <div className="grid w-full max-w-3xl items-start gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)] md:gap-10">
        <ProductGallery images={TEAPOT} />
        <div className="flex flex-col gap-2 md:pt-2">
          <p className="text-[13px] text-muted">The Mad Hatter collection</p>
          <h4 className="text-xl font-semibold tracking-[-0.01em] text-ink">Six o’clock teapot</h4>
          <p className="text-lg text-ink tabular">{formatMoney(18500)}</p>
          <p className="text-sm text-muted">Salt-glazed stoneware with vines in relief and a branch for a handle. It’s always tea-time, so it never gets washed up.</p>
          <p className="mt-2 text-[13px] text-muted">Hover the picture to look closer, swipe it on a phone, or use the arrow keys.</p>
          <p className="mt-3 text-xs leading-5 text-muted">
            Photographs: <a href="https://www.metmuseum.org/art/collection/search/8346" target="_blank" rel="noreferrer" className="underline decoration-line-strong underline-offset-2 hover:text-ink">Teapot, British, ca. 1765</a>, The Metropolitan Museum of Art, CC0. Cropped and resized.
          </p>
        </div>
      </div>
    </Stage>
  );
}

function ProductCard({ p, onQuick }: { p: DemoProduct; onQuick?: () => void }) {
  return (
    <div className="group flex min-w-0 flex-col gap-3">
      <div className="relative overflow-hidden rounded-card bg-raised">
        <img decoding="async" src={thumb(p).src} alt={thumb(p).alt} className="aspect-square w-full object-cover transition-transform duration-500 ease-out-soft group-hover:scale-[1.03]" />
        {p.compareAt && <span className="absolute left-3 top-3 rounded-full bg-btn-danger px-2.5 py-1 text-xs font-medium text-btn-danger-ink">Sale</span>}
        {onQuick && (
          <span className="absolute inset-x-3 bottom-3 opacity-100 transition-opacity duration-200 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
            <Button size="sm" variant="secondary" leading={<Eye />} className="w-full bg-elevated" onClick={onQuick}>Quick view</Button>
          </span>
        )}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium text-ink">{p.name}</p>
        <p className="truncate text-[13px] text-muted">{p.film}</p>
        <p className="mt-1 text-sm text-ink tabular">
          {p.compareAt && <span className="mr-1.5 text-muted line-through">{formatMoney(p.compareAt)}</span>}
          {formatMoney(p.price)}
        </p>
      </div>
    </div>
  );
}

function QuickViewDemo() {
  const [open, setOpen] = useState<DemoProduct | null>(null);
  const [inCart, setInCart] = useState(0);
  const picks = [byId("cantina-tee"), byId("ecto-cap"), byId("hoverboard")];
  return (
    <Stage className="flex-col">
      <p className="self-end text-[13px] text-muted" aria-live="polite"><ShoppingBag className="mr-1 inline size-4 align-[-3px]" />{inCart} in cart</p>
      <div className="grid w-full grid-cols-1 gap-6 sm:grid-cols-3">
        {picks.map((p) => <ProductCard key={p.id} p={p} onQuick={() => setOpen(p)} />)}
      </div>
      {open && (
        <ProductQuickView
          key={open.id}
          product={toQuickView(open)}
          open={!!open}
          onOpenChange={(v) => !v && setOpen(null)}
          onAdd={async (it) => { await wait(700); setInCart((n) => n + it.quantity); }}
        />
      )}
    </Stage>
  );
}

const START: CartLine[] = [line("cantina-tee", 1, 0, "M"), line("ingen-mug", 2, 0), line("nostromo-poster", 1, 1)];

function CartDemo() {
  const [open, setOpen] = useState(false);
  const [lines, setLines] = useState(START);
  const count = lines.reduce((n, l) => n + l.quantity, 0);
  return (
    <Stage className="flex-col">
      <div className="flex flex-wrap justify-center gap-3">
        <Button leading={<ShoppingBag />} onClick={() => setOpen(true)}>Open cart · {count}</Button>
        <Button variant="ghost" onClick={() => setLines(START)}>Refill the cart</Button>
      </div>
      <p className="max-w-md text-center text-[13px] text-muted">Shipping is $7.95, free from $75. Tax is 8.25% of the subtotal. Remove the mugs to watch free shipping slip away.</p>
      <CartDrawer open={open} onOpenChange={setOpen} lines={lines} onChange={setLines} pricing={PRICING} onCheckout={() => setOpen(false)} />
    </Stage>
  );
}

const PROMOS: Record<string, Promo> = {
  "88MPH": { code: "88MPH", rate: 0.1, label: "88MPH · 10% off" },
  WHOYOUGONNACALL: { code: "WHOYOUGONNACALL", rate: 0.15, label: "WHOYOUGONNACALL · 15% off" },
};

function CheckoutDemo() {
  const lines = [line("hoverboard", 1, 0), line("cantina-tee", 2, 1, "L"), line("dino-mug", 1, 0)];
  return (
    <Stage align="start">
      <div className="w-full">
        <CheckoutForm
          lines={lines}
          taxRate={PRICING.taxRate}
          delivery={[
            { id: "standard", label: "Standard", description: "5 to 7 working days", price: 795, freeAt: 7500 },
            { id: "express", label: "Express", description: "2 working days", price: 1495 },
            { id: "delorean", label: "DeLorean", description: "Arrives before you order it", price: 8800 },
          ]}
          countries={[
            { value: "us", label: "United States" },
            { value: "uk", label: "United Kingdom" },
            { value: "nz", label: "New Zealand (Middle-earth)" },
            { value: "ca", label: "Canada" },
          ]}
          checkPromo={(c) => PROMOS[c] ?? null}
          onPlaceOrder={() => wait(1200)}
        />
        <p className="mt-4 text-[13px] text-muted">Try the codes 88MPH or WHOYOUGONNACALL.</p>
      </div>
    </Stage>
  );
}

const REVIEWS: Review[] = [
  { id: "r1", author: "Luke S.", rating: 5, date: "2026-10-02", title: "Fits like it was made on Tatooine", body: "Bought it to wear to the cantina. Got a few looks, nobody's arm came off. Would buy again.", helpful: 42, verified: true },
  { id: "r2", author: "Han S.", rating: 5, date: "2026-09-18", title: "I've got a good feeling about this", body: "Washed it twelve times in under twelve parsecs. Print is still sharp.", helpful: 31, verified: true },
  { id: "r3", author: "Ben K.", rating: 4, date: "2026-08-30", title: "Not the shirt you're looking for", body: "Wanted the sand colour, sent the navy. Liked it anyway. Runs slightly long.", helpful: 18 },
  { id: "r4", author: "Greedo", rating: 2, date: "2026-07-11", title: "Shot first", body: "Shirt shrank in the wash. Or I didn't read the label. Hard to say who went first.", helpful: 9 },
  { id: "r5", author: "Wuher", rating: 3, date: "2026-10-21", title: "We don't serve their kind here", body: "Fine shirt. Customer brought a droid in while wearing it though.", helpful: 12, verified: true },
  { id: "r6", author: "Figrin D'an", rating: 5, date: "2026-11-04", title: "Finally, band merch", body: "Printed the right tour dates. Six stars if the scale went that high.", helpful: 27, verified: true },
  { id: "r7", author: "Leia O.", rating: 4, date: "2026-09-02", title: "Into the garbage chute? No, the wardrobe", body: "Soft cotton, sensible cut. Slightly scruffy-looking but in a good way.", helpful: 15 },
  { id: "r8", author: "C-3PO", rating: 1, date: "2026-06-14", title: "We're doomed", body: "The odds of this fitting a protocol droid are approximately 3,720 to 1.", helpful: 23 },
];

function ReviewsDemo() {
  const [wrote, setWrote] = useState(false);
  return (
    <Stage align="start" className="flex-col">
      <ReviewsSummary reviews={REVIEWS} onWrite={() => setWrote(true)} />
      <AnimatePresence>
        {wrote && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={fade} className="text-[13px] text-muted" role="status">
            The review form would open here.
          </motion.p>
        )}
      </AnimatePresence>
    </Stage>
  );
}

const FAMILY: Record<string, { label: string; swatch: string; light?: boolean }> = {
  dark: { label: "Dark", swatch: "#1f1f22" },
  light: { label: "Light", swatch: "#ece8df", light: true },
  warm: { label: "Warm", swatch: "#c9874a" },
  blue: { label: "Blue", swatch: "#3b6fd1" },
  pink: { label: "Pink", swatch: "#e86fa0" },
};
const familyOf = (hex: string): string => {
  const n = parseInt(hex.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255;
  if (r > 200 && g > 190) return "light";
  if (r > 200 && b > 140 && g < 140) return "pink";
  if (b > r + 30) return "blue";
  if (r + g + b < 200) return "dark";
  return "warm";
};

function FiltersDemo() {
  const count = (pred: (p: DemoProduct) => boolean) => PRODUCTS.filter(pred).length;
  const facets: Facet[] = useMemo(() => [
    { id: "film", label: "Film", type: "checks", options: [...new Set(PRODUCTS.map((p) => p.film))].sort().map((f) => ({ value: f, label: f, count: count((p) => p.film === f) })) },
    { id: "category", label: "Category", type: "checks", options: ["Apparel", "Drinkware", "Collectibles", "Posters"].map((c) => ({ value: c, label: c, count: count((p) => p.category === c) })) },
    { id: "colour", label: "Colour", type: "colours", options: Object.entries(FAMILY).map(([k, f]) => ({ value: k, label: f.label, swatch: f.swatch, light: f.light, count: count((p) => p.colours.some((c) => familyOf(c.value) === k)) })) },
    { id: "price", label: "Price", type: "range", min: 0, max: 150, step: 5, format: (n) => `$${n}` },
  ], []);
  const [v, setV] = useState<FilterValue>(() => emptyFilters(facets));
  const results = PRODUCTS.filter((p) => {
    const film = v.film as string[], cat = v.category as string[], col = v.colour as string[];
    const [lo, hi] = v.price as [number, number];
    return (!film.length || film.includes(p.film))
      && (!cat.length || cat.includes(p.category))
      && (!col.length || p.colours.some((c) => col.includes(familyOf(c.value))))
      && p.price / 100 >= lo && p.price / 100 <= hi;
  });
  return (
    <Stage align="start">
      <CategoryFilters facets={facets} value={v} onChange={setV} resultCount={results.length}>
        {/* Results don't fly across each other: the old set fades out, the new set fades in. */}
        <AnimatePresence initial={false} mode="wait">
          <motion.ul
            key={results.map((p) => p.id).join("|")}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] } }}
            exit={{ opacity: 0, transition: { duration: 0.1 } }}
            className="grid grid-cols-2 gap-x-4 gap-y-6 md:grid-cols-3"
          >
            {results.map((p) => <li key={p.id}><ProductCard p={p} /></li>)}
          </motion.ul>
        </AnimatePresence>
        {results.length === 0 && <p className="rounded-card bg-surface p-6 text-center text-sm text-muted">Nothing matches. Clear a filter or two; life finds a way.</p>}
      </CategoryFilters>
    </Stage>
  );
}

function order(id: string, placed: string, status: Order["status"], items: [string, number, number, string?][], tracking?: Order["tracking"], carrier?: string): Order {
  const lines = items.map(([pid, q, ci, size]) => line(pid, q, ci, size));
  return {
    id, placed, status, carrier, tracking,
    total: cartTotals(lines, PRICING).total,
    items: lines.map((l) => ({ name: l.name, variant: l.variant, quantity: l.quantity, image: l.image })),
  };
}

const ORDERS: Order[] = [
  order("KLN-1985-1021", "2026-11-08", "shipped", [["hoverboard", 1, 0], ["flux-poster", 1, 0]], [
    { label: "Order placed", date: "2026-11-08", done: true },
    { label: "Packed at Hill Valley depot", date: "2026-11-09", done: true },
    { label: "In transit", detail: "Passed through the clock tower", date: "2026-11-10", done: true },
    { label: "Out for delivery", done: false },
    { label: "Delivered", done: false },
  ], "Doc Brown Express · tracking OUTATIME"),
  order("KLN-1984-0611", "2026-10-14", "delivered", [["ecto-cap", 2, 1], ["ingen-mug", 1, 1]], [
    { label: "Order placed", date: "2026-10-14", done: true },
    { label: "Shipped", date: "2026-10-15", done: true },
    { label: "Delivered", detail: "Left with the Keymaster", date: "2026-10-18", done: true },
  ], "Ecto Freight"),
  order("KLN-1979-0525", "2026-09-30", "cancelled", [["nostromo-poster", 1, 0]]),
];

function OrdersDemo() {
  return (
    <Stage align="start">
      <div className="w-full max-w-2xl">
        <OrderHistory orders={ORDERS} onReorder={() => wait(700)} />
      </div>
    </Stage>
  );
}

export const category: Category = {
  id: "commerce",
  name: "Commerce",
  summary: "A shop's moving parts: product pages, cart, checkout, reviews, filters and orders.",
  entries: [
    { id: "product-gallery", name: "Product gallery", summary: "Large picture, thumbnails, a magnifier under the pointer, swipe on phones, arrow keys.", files: ["src/kiln/components/commerce/ProductGallery.tsx", "src/kiln/components/commerce/commerce.ts", "src/kiln/motion.ts", "src/kiln/cn.ts"], Demo: GalleryDemo },
    { id: "product-quick-view", name: "Quick view", summary: "A product in a dialog: gallery, colour, size with sold-out sizes struck, quantity and add to cart.", files: ["src/kiln/components/commerce/ProductQuickView.tsx", "src/kiln/components/commerce/SizePicker.tsx", "src/kiln/components/commerce/ProductGallery.tsx", "src/kiln/components/overlays/Dialog.tsx", "src/kiln/components/commerce/commerce.ts", "src/kiln/components/shared/useOverlay.ts", "src/kiln/motion.ts", "src/kiln/cn.ts", "src/kiln/controllable.ts", "src/kiln/components/buttons/Button.tsx", "src/kiln/components/text-input/NumberField.tsx", "src/kiln/components/choice-controls/ColorSwatches.tsx"], Demo: QuickViewDemo },
    { id: "cart-drawer", name: "Cart drawer", summary: "Line items, steppers, rows that fold away, a free-shipping bar and totals that add up.", files: ["src/kiln/components/commerce/CartDrawer.tsx", "src/kiln/components/overlays/Drawer.tsx", "src/kiln/components/commerce/commerce.ts", "src/kiln/components/shared/useOverlay.ts", "src/kiln/motion.ts", "src/kiln/cn.ts", "src/kiln/components/buttons/Button.tsx"], Demo: CartDemo },
    { id: "checkout-form", name: "Checkout", summary: "Contact, address, delivery and a demo payment step beside a summary that stays in view.", files: ["src/kiln/components/commerce/CheckoutForm.tsx", "src/kiln/components/commerce/commerce.ts", "src/kiln/components/buttons/Button.tsx", "src/kiln/motion.ts", "src/kiln/cn.ts", "src/kiln/components/pickers/Select.tsx", "src/kiln/components/shared/Anchored.tsx", "src/kiln/controllable.ts", "src/kiln/components/choice-controls/RadioGroup.tsx", "src/kiln/components/text-input/TextField.tsx", "src/kiln/components/shared/Field.tsx"], Demo: CheckoutDemo },
    { id: "reviews-summary", name: "Reviews", summary: "Average, a distribution that grows in, sorting and helpful votes.", files: ["src/kiln/components/commerce/ReviewsSummary.tsx", "src/kiln/components/buttons/SegmentedControl.tsx", "src/kiln/controllable.ts", "src/kiln/motion.ts", "src/kiln/cn.ts", "src/kiln/components/buttons/Button.tsx"], Demo: ReviewsDemo },
    { id: "category-filters", name: "Category filters", summary: "Facets with counts, a price range and colours; chips for what's on; a drawer on phones.", files: ["src/kiln/components/commerce/CategoryFilters.tsx", "src/kiln/components/choice-controls/Slider.tsx", "src/kiln/components/choice-controls/Checkbox.tsx", "src/kiln/controllable.ts", "src/kiln/motion.ts", "src/kiln/cn.ts", "src/kiln/components/buttons/Button.tsx", "src/kiln/components/overlays/Drawer.tsx", "src/kiln/components/shared/useOverlay.ts"], Demo: FiltersDemo },
    { id: "order-history", name: "Order history", summary: "Past orders with status, items, tracking that folds open and buy again.", files: ["src/kiln/components/commerce/OrderHistory.tsx", "src/kiln/components/status/Badge.tsx", "src/kiln/components/commerce/commerce.ts", "src/kiln/controllable.ts", "src/kiln/cn.ts", "src/kiln/components/buttons/Button.tsx", "src/kiln/motion.ts"], Demo: OrdersDemo },
  ],
};
