import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { Check, ShoppingBag } from "lucide-react";
import { cn } from "../../cn";
import { easeOut } from "../../motion";
import { Dialog } from "../overlays/Dialog";
import { ProductGallery } from "./ProductGallery";
import { ColorSwatches } from "../choice-controls/ColorSwatches";
import { SizePicker, type SizeOption } from "./SizePicker";
import { NumberField } from "../text-input/NumberField";
import { Button } from "../buttons/Button";
import { formatMoney, type ProductImage } from "./commerce";

export type QuickViewProduct = {
  id: string;
  name: string;
  /** Cents. */
  price: number;
  /** Cents; shown struck through when higher than price. */
  compareAt?: number;
  description: string;
  colours: { value: string; name: string; light?: boolean; images: ProductImage[] }[];
  sizes?: SizeOption[];
  rating?: { average: number; count: number };
  currency?: string;
};

export type AddToCart = { productId: string; colour: string; size: string | null; quantity: number };

/** Text used by ProductQuickView. Pass a partial via `labels` to translate or reword. */
export interface ProductQuickViewLabels {
  /** Rating line, e.g. "4.5 out of 5 · 120 reviews". */
  rating: (average: string, count: string) => string;
  /** Colour swatches heading. */
  colour: string;
  /** Error when adding without a size. */
  chooseSize: string;
  /** Quantity field label. */
  quantity: string;
  /** Add button, given the formatted line total. */
  addToCart: (total: string) => string;
  /** Add button once added. */
  added: string;
  /** Screen-reader announcement after adding, given the product name. */
  addedAnnounce: (name: string) => string;
}
export const productQuickViewLabels: ProductQuickViewLabels = {
  rating: (average, count) => `${average} out of 5 · ${count} reviews`,
  colour: "Colour",
  chooseSize: "Choose a size first.",
  quantity: "Quantity",
  addToCart: (total) => `Add to cart · ${total}`,
  added: "Added to cart",
  addedAnnounce: (name) => `${name} added to cart`,
};

/** Text swaps hand over rather than overlap. */
const textSwap = (show: boolean) => (show ? { duration: 0.18, delay: 0.08, ease: easeOut } : { duration: 0.09, ease: easeOut });

/**
 * A product in a dialog: gallery, colour, size, quantity and add to cart. The
 * button confirms in place, then returns to normal.
 */
export function ProductQuickView({ product, open, onOpenChange, onAdd, labels }: {
  product: QuickViewProduct;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  /** Resolve when the item is in the cart. */
  onAdd: (item: AddToCart) => Promise<void> | void;
  /** Override any UI text. Merged over `productQuickViewLabels`. */
  labels?: Partial<ProductQuickViewLabels>;
}) {
  const l = { ...productQuickViewLabels, ...labels };
  const [colour, setColour] = useState(product.colours[0].value);
  const [size, setSize] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [state, setState] = useState<"idle" | "adding" | "added">("idle");
  const [missingSize, setMissingSize] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  useEffect(() => { if (open) { setState("idle"); setMissingSize(false); } }, [open]);

  const c = product.colours.find((x) => x.value === colour) ?? product.colours[0];
  const money = (n: number) => formatMoney(n, product.currency);

  const add = async () => {
    if (product.sizes && !size) { setMissingSize(true); return; }
    setState("adding");
    await onAdd({ productId: product.id, colour, size, quantity: qty });
    setState("added");
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setState("idle"), 1800);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} title={product.name} size="lg" className="sm:max-w-4xl">
      <div className="grid gap-6 pb-1 md:grid-cols-2 md:gap-8">
        <ProductGallery key={c.value} images={c.images} />
        <div className="flex min-w-0 flex-col gap-5">
          <div>
            <p className="flex items-baseline gap-2.5">
              <span className="text-2xl font-semibold tracking-[-0.01em] text-ink tabular">{money(product.price)}</span>
              {product.compareAt && product.compareAt > product.price && (
                <span className="text-sm text-muted line-through tabular">{money(product.compareAt)}</span>
              )}
            </p>
            {product.rating && (
              <p className="mt-1 text-[13px] text-muted">
                {l.rating(product.rating.average.toFixed(1), product.rating.count.toLocaleString())}
              </p>
            )}
            <p className="mt-3 text-sm text-ink">{product.description}</p>
          </div>
          <ColorSwatches label={l.colour} value={colour} onChange={setColour} swatches={product.colours.map(({ value, name, light }) => ({ value, name, light }))} />
          {product.sizes && (
            <div className="flex flex-col gap-2">
              <SizePicker sizes={product.sizes} value={size} onChange={(v) => { setSize(v); setMissingSize(false); }} />
              <p className={cn("min-h-5 text-[13px] transition-opacity duration-200", missingSize ? "text-negative opacity-100" : "opacity-0")} role={missingSize ? "alert" : undefined}>
                {missingSize ? l.chooseSize : ""}
              </p>
            </div>
          )}
          <div className="flex flex-wrap items-end gap-3">
            <NumberField label={l.quantity} value={qty} onChange={setQty} min={1} max={9} />
            <Button size="lg" onClick={add} loading={state === "adding"} className="min-w-0 flex-1" leading={undefined}>
              <span className="grid justify-items-center [&>*]:[grid-area:1/1]">
                <motion.span className="inline-flex items-center gap-2" initial={false} animate={{ opacity: state === "added" ? 0 : 1 }} transition={textSwap(state !== "added")} aria-hidden={state === "added"}>
                  <ShoppingBag className="size-4" /> {l.addToCart(money(product.price * qty))}
                </motion.span>
                <motion.span className="inline-flex items-center gap-2" initial={false} animate={{ opacity: state === "added" ? 1 : 0 }} transition={textSwap(state === "added")} aria-hidden={state !== "added"}>
                  <Check className="size-4" /> {l.added}
                </motion.span>
              </span>
            </Button>
          </div>
          <span className="sr-only" aria-live="polite">{state === "added" ? l.addedAnnounce(product.name) : ""}</span>
        </div>
      </div>
    </Dialog>
  );
}
