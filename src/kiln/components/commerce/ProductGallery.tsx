import { useEffect, useId, useRef, useState, type KeyboardEvent, type PointerEvent as RPointerEvent } from "react";
import { animate, motion, useMotionValue, type PanInfo } from "motion/react";
import { cn } from "../../cn";
import { fade, springSoft } from "../../motion";
import type { ProductImage } from "./commerce";

/** Text used by ProductGallery. Pass a partial via `labels` to translate or reword. */
export interface ProductGalleryLabels {
  /** aria-roledescription of the main picture group. */
  gallery: string;
  /** aria-label of the main picture group, e.g. "Picture 2 of 5: alt". */
  picture: (index: number, count: number, alt: string) => string;
  /** aria-label of the thumbnail tablist. */
  pictures: string;
}
export const productGalleryLabels: ProductGalleryLabels = {
  gallery: "gallery",
  picture: (i, n, alt) => `Picture ${i} of ${n}: ${alt}`,
  pictures: "Pictures",
};

/**
 * A product's pictures: one large, thumbnails beneath. On a mouse, the large
 * picture magnifies under the pointer; on touch, swipe between pictures; with a
 * keyboard, the arrow keys. Pictures cross-fade; nothing slides across another.
 */
export function ProductGallery({
  images, value, onChange, zoom = 2.2, className, ratio = 1, labels,
}: {
  images: ProductImage[];
  /** Controlled index; leave out to let the gallery keep its own. */
  value?: number;
  onChange?: (i: number) => void;
  /** Magnification under the pointer. 1 turns it off. */
  zoom?: number;
  className?: string;
  /** Width / height of the main picture. */
  ratio?: number;
  /** Override any UI text. Merged over `productGalleryLabels`. */
  labels?: Partial<ProductGalleryLabels>;
}) {
  const l = { ...productGalleryLabels, ...labels };
  const id = useId();
  const [inner, setInner] = useState(0);
  const index = value ?? inner;
  const go = (i: number) => {
    const n = (i + images.length) % images.length;
    if (value === undefined) setInner(n);
    onChange?.(n);
  };

  // Zoom lens: the magnified copy is scaled and translated so the point under
  // the pointer stays under the pointer. Transform only.
  const stage = useRef<HTMLDivElement>(null);
  const [fine, setFine] = useState(false);
  const [lens, setLens] = useState(false);
  const zx = useMotionValue(0);
  const zy = useMotionValue(0);
  const scale = useMotionValue(1);
  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const set = () => setFine(mq.matches);
    set();
    mq.addEventListener("change", set);
    return () => mq.removeEventListener("change", set);
  }, []);

  const aim = (e: RPointerEvent) => {
    const r = stage.current!.getBoundingClientRect();
    const px = Math.min(Math.max(e.clientX - r.left, 0), r.width);
    const py = Math.min(Math.max(e.clientY - r.top, 0), r.height);
    zx.set((r.width / 2 - px) * (zoom - 1));
    zy.set((r.height / 2 - py) * (zoom - 1));
  };
  const enter = (e: RPointerEvent) => {
    if (!fine || zoom <= 1 || e.pointerType !== "mouse") return;
    aim(e);
    setLens(true);
    animate(scale, zoom, springSoft);
  };
  const leave = () => {
    if (!lens) return;
    setLens(false);
    animate(scale, 1, springSoft);
  };

  const onKey = (e: KeyboardEvent) => {
    if (e.key === "ArrowRight") { e.preventDefault(); go(index + 1); }
    if (e.key === "ArrowLeft") { e.preventDefault(); go(index - 1); }
  };

  const onSwipe = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -50 || info.velocity.x < -400) go(index + 1);
    else if (info.offset.x > 50 || info.velocity.x > 400) go(index - 1);
  };

  const current = images[index];

  return (
    <div className={cn("flex min-w-0 flex-col gap-3", className)}>
      <div
        ref={stage}
        role="group"
        aria-roledescription={l.gallery}
        aria-label={l.picture(index + 1, images.length, current?.alt ?? "")}
        tabIndex={0}
        onKeyDown={onKey}
        onPointerEnter={enter}
        onPointerMove={(e) => lens && aim(e)}
        onPointerLeave={leave}
        className={cn("relative w-full overflow-hidden rounded-card bg-raised outline-offset-2", lens ? "cursor-zoom-out" : fine && zoom > 1 ? "cursor-zoom-in" : "")}
        style={{ aspectRatio: ratio, borderRadius: 12 }}
      >
        {/* Every picture is mounted and stacked; only opacity changes, so a swap never flashes. */}
        <motion.div
          className="absolute inset-0 grid touch-pan-y [&>*]:[grid-area:1/1]"
          drag={fine ? false : "x"}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.18}
          dragMomentum={false}
          onDragEnd={onSwipe}
          style={{ x: 0 }}
        >
          {images.map((im, i) => (
            <motion.img decoding="async"
              key={im.src}
              src={im.src}
              alt={i === index ? im.alt : ""}
              aria-hidden={i !== index}
              draggable={false}
              initial={false}
              animate={{ opacity: i === index ? 1 : 0 }}
              /* The new picture fades in on top while the old one stays fully opaque beneath it,
                 then the old one hides once covered, so the swap never dims through grey. */
              transition={i === index ? fade : { duration: 0, delay: 0.22 }}
              className={cn("pointer-events-none size-full select-none object-cover", i === index ? "z-[1]" : "z-0")}
              style={i === index ? { x: zx, y: zy, scale } : undefined}
            />
          ))}
        </motion.div>
        {images.length > 1 && (
          <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center gap-1.5 sm:hidden" aria-hidden>
            {images.map((im, i) => (
              <motion.span key={im.src} className="size-1.5 rounded-full bg-ink" initial={false} animate={{ opacity: i === index ? 0.9 : 0.25 }} transition={fade} />
            ))}
          </div>
        )}
      </div>

      {images.length > 1 && (
        <div role="tablist" aria-label={l.pictures} className="flex gap-2.5 overflow-x-auto p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {images.map((im, i) => {
            const on = i === index;
            return (
              <button
                key={im.src}
                type="button"
                role="tab"
                id={`${id}-t${i}`}
                aria-selected={on}
                aria-label={im.alt}
                tabIndex={on ? 0 : -1}
                onClick={() => go(i)}
                onKeyDown={(e) => {
                  if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
                    e.preventDefault();
                    const n = (i + (e.key === "ArrowRight" ? 1 : -1) + images.length) % images.length;
                    go(n);
                    (e.currentTarget.parentElement?.children[n] as HTMLElement | undefined)?.focus();
                  }
                }}
                className="group relative aspect-square min-w-14 max-w-20 flex-1 rounded-[10px] outline-offset-2"
              >
                <span className="absolute inset-0 overflow-hidden rounded-[10px] bg-raised">
                  <img decoding="async" loading="lazy" src={im.thumb ?? im.src} alt="" draggable={false} className={cn("size-full object-cover transition-opacity duration-200", on ? "opacity-100" : "opacity-70 group-hover:opacity-100")} />
                </span>
                <motion.span aria-hidden initial={false} animate={{ opacity: on ? 1 : 0 }} transition={fade} className="pointer-events-none absolute -inset-1 rounded-[13px] border-2 border-ink" />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
