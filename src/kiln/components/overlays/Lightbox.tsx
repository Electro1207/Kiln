import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, animate, motion, useMotionValue, useTransform, type MotionValue, type PanInfo } from "motion/react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "../../cn";
import { easeOut, fade, springFirm } from "../../motion";
import { Portal, useModalLayer } from "../shared/useOverlay";

/** Text used by Lightbox. Pass a partial via `labels` to translate or reword. */
export interface LightboxLabels {
  /** aria-label of a thumbnail button. */
  open: (alt: string) => string;
  /** aria-label of the close button. */
  close: string;
  /** aria-label of the previous button. */
  previous: string;
  /** aria-label of the next button. */
  next: string;
  /** "2 of 9" counter beside the caption. */
  count: (index: number, total: number) => string;
}
export const lightboxLabels: LightboxLabels = {
  open: (alt) => `Open ${alt}`,
  close: "Close",
  previous: "Previous picture",
  next: "Next picture",
  count: (i, n) => `${i} of ${n}`,
};

export type LightboxImage = {
  src: string;
  /** A small version for the row (about 640px wide). Keeps the page light; the full src opens. */
  thumb?: string;
  alt: string;
  /** Natural size; sets the thumbnail's shape so opening it never stretches the picture. */
  width: number;
  height: number;
  caption?: string;
};

export type LightboxProps = {
  images: LightboxImage[];
  /** Thumbnail row height in px. */
  rowHeight?: number;
  /** Gap between thumbnails in px. */
  gap?: number;
  /** Thumbnail corner radius in px. */
  radius?: number;
  /** Override any UI text. Merged over `lightboxLabels`. */
  labels?: Partial<LightboxLabels>;
  className?: string;
};

/**
 * A row of pictures; click one and it grows into the full screen from where it sits.
 * Arrow keys or a swipe step through (pictures cross-fade in place), and Esc, the close
 * button or a click puts the picture shown back into its own thumbnail.
 *
 * The grow and the return are one transform (translate + scale) on the big picture,
 * measured from the thumbnail at that moment, so nothing re-lays out while it moves.
 */
export function Lightbox({ images, rowHeight = 168, gap = 8, radius = 10, labels, className }: LightboxProps) {
  const l = { ...lightboxLabels, ...labels };
  const [index, setIndex] = useState<number | null>(null);
  // The thumbnail standing in for the open picture is hidden, so the picture never appears twice.
  const [hidden, setHidden] = useState<number | null>(null);
  // Once a picture has been opened its full version is decoded, so its thumbnail uses it:
  // the return then lands on a sharp picture instead of swapping to a soft one.
  const [sharp, setSharp] = useState<Set<number>>(() => new Set());
  const thumbs = useRef<Array<HTMLImageElement | null>>([]);
  const opening = useRef(false);

  const open = (i: number) => {
    if (opening.current || index !== null) return;
    opening.current = true;
    // Decode the full picture first, so no frame of the grow waits on the decoder.
    const im = new Image();
    im.src = images[i].src;
    im.decode().catch(() => {}).finally(() => {
      opening.current = false;
      setSharp((s) => (s.has(i) ? s : new Set(s).add(i)));
      setIndex(i);
      setHidden(i);
    });
  };

  const rectOf = useCallback((i: number) => thumbs.current[i]?.getBoundingClientRect() ?? null, []);

  return (
    <>
      <ul className={cn("flex flex-wrap", className)} style={{ gap }}>
        {images.map((img, i) => (
          <li key={img.src} className="min-w-0" style={{ flexGrow: img.width / img.height, flexBasis: (rowHeight * img.width) / img.height }}>
            <button
              type="button"
              onClick={() => open(i)}
              aria-label={l.open(img.alt)}
              className="group block w-full cursor-zoom-in overflow-hidden focus-visible:outline-offset-4"
              style={{ borderRadius: radius }}
            >
              <img
                ref={(el) => { thumbs.current[i] = el; }}
                src={sharp.has(i) ? img.src : img.thumb ?? img.src}
                alt=""
                decoding="async"
                loading="lazy"
                draggable={false}
                style={{ aspectRatio: `${img.width} / ${img.height}`, opacity: hidden === i ? 0 : 1 }}
                className="block w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.025]"
              />
            </button>
          </li>
        ))}
        <li aria-hidden className="grow-[10]" />
      </ul>
      {index !== null && (
        <Portal>
          <Viewer
            images={images}
            index={index}
            radius={radius}
            l={l}
            rectOf={rectOf}
            onIndex={(i) => { setIndex(i); setHidden(i); }}
            onClosed={() => { setIndex(null); setHidden(null); }}
          />
        </Portal>
      )}
    </>
  );
}

type ViewerProps = {
  images: LightboxImage[];
  index: number;
  radius: number;
  l: LightboxLabels;
  rectOf: (i: number) => DOMRect | null;
  onIndex: (i: number) => void;
  onClosed: () => void;
};

function Viewer({ images, index, radius, l, rectOf, onIndex, onClosed }: ViewerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [closing, setClosing] = useState(false);
  const closingRef = useRef(false);
  const [origin] = useState(index);
  const img = images[index];
  const [size, setSize] = useState(() => viewport());
  useEffect(() => {
    const on = () => setSize(viewport());
    window.addEventListener("resize", on);
    return () => window.removeEventListener("resize", on);
  }, []);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const scale = useMotionValue(1);
  // Keeps the corners looking like the thumbnail's while scaled down.
  const corner = useTransform(scale, (s) => `${Math.max(radius, 14) / Math.max(s, 0.01)}px`);
  const morphTo = (i: number, el: HTMLElement | null) => {
    const from = rectOf(i);
    if (!from || !el) return null;
    const to = el.getBoundingClientRect();
    return {
      x: from.left + from.width / 2 - (to.left + to.width / 2),
      y: from.top + from.height / 2 - (to.top + to.height / 2),
      s: from.width / to.width,
    };
  };
  const stage = useRef<HTMLDivElement>(null);
  const backdrop = useMotionValue(0);

  useLayoutEffect(() => {
    const m = morphTo(origin, stage.current);
    if (m) { x.set(m.x); y.set(m.y); scale.set(m.s); }
    animate(x, 0, springFirm);
    animate(y, 0, springFirm);
    animate(scale, 1, springFirm);
    animate(backdrop, 1, fade);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const close = useCallback(() => {
    if (closingRef.current) return;
    closingRef.current = true;
    setClosing(true);
    // Measure the target as it stands now (untransformed), then fly into the thumbnail of the picture shown.
    const m = morphTo(index, stage.current);
    animate(backdrop, 0, { duration: 0.26, ease: easeOut });
    if (!m) { animate(scale, 0.96, { duration: 0.2 }).then(onClosed); return; }
    animate(x, m.x, springFirm);
    animate(y, m.y, springFirm);
    animate(scale, m.s, springFirm).then(onClosed);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, onClosed]);

  useModalLayer(ref, close);

  const step = useCallback(
    (d: number) => { if (!closingRef.current) onIndex((index + d + images.length) % images.length); },
    [index, images.length, onIndex],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [step]);

  const onSwipe = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -60 || info.velocity.x < -500) step(1);
    else if (info.offset.x > 60 || info.velocity.x > 500) step(-1);
    else if (info.offset.y > 90 || info.velocity.y > 600) close();
  };

  const box = fit(img, size);

  return (
    <div
      ref={ref}
      role="dialog"
      aria-modal="true"
      aria-label={img.alt}
      tabIndex={-1}
      className={cn("fixed inset-0 z-50 grid place-items-center outline-none", closing && "pointer-events-none")}
    >
      <motion.div aria-hidden className="absolute inset-0 bg-ground/95" style={{ opacity: backdrop }} onClick={close} />

      <figure className="relative flex flex-col items-center gap-3">
        <motion.div
          ref={stage}
          className="grid touch-none [&>*]:[grid-area:1/1]"
          style={{ width: box.w, height: box.h }}
          drag={closing ? false : true}
          dragSnapToOrigin
          dragElastic={0.12}
          dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
          onDragEnd={onSwipe}
        >
          <AnimatePresence initial={false}>
            <motion.img
              key={index}
              src={img.src}
              alt={img.alt}
              draggable={false}
              decoding="async"
              onClick={close}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: fade }}
              exit={{ opacity: 0, transition: { duration: 0.2, ease: easeOut } }}
              style={{ x, y, scale, borderRadius: corner, width: box.w, height: box.h, willChange: "transform" }}
              className="block cursor-zoom-out select-none object-cover"
            />
          </AnimatePresence>
        </motion.div>
        <motion.figcaption
          style={{ opacity: backdrop }}
          className="grid max-w-[min(640px,90vw)] px-4 text-center text-sm text-muted [&>*]:[grid-area:1/1]"
        >
          <AnimatePresence initial={false}>
            <motion.span key={index} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={fade}>
              {img.caption ?? img.alt}
              <span className="tabular ml-2">{l.count(index + 1, images.length)}</span>
            </motion.span>
          </AnimatePresence>
        </motion.figcaption>
      </figure>

      <>
        <ViewerButton label={l.close} className="right-4 top-4" opacity={backdrop} onClick={close}>
          <X className="size-5" />
        </ViewerButton>
        {images.length > 1 && (
          <>
            <ViewerButton label={l.previous} className="left-3 top-1/2 -translate-y-1/2 sm:left-6" opacity={backdrop} onClick={() => step(-1)}>
              <ChevronLeft className="size-5" />
            </ViewerButton>
            <ViewerButton label={l.next} className="right-3 top-1/2 -translate-y-1/2 sm:right-6" opacity={backdrop} onClick={() => step(1)}>
              <ChevronRight className="size-5" />
            </ViewerButton>
          </>
        )}
      </>
    </div>
  );
}

function ViewerButton({ label, className, opacity, onClick, children }: { label: string; className: string; opacity: MotionValue<number>; onClick: () => void; children: React.ReactNode }) {
  return (
    <motion.button
      type="button"
      aria-label={label}
      onClick={onClick}
      style={{ opacity }}
      whileTap={{ scale: 0.92 }}
      className={cn("absolute grid size-11 place-items-center rounded-full bg-surface text-ink shadow-float transition-colors hover:bg-raised", className)}
    >
      {children}
    </motion.button>
  );
}

function viewport() {
  return { w: window.innerWidth, h: window.innerHeight };
}

function fit(img: LightboxImage, { w, h }: { w: number; h: number }) {
  const maxW = Math.min(w - (w < 640 ? 24 : 160), 1400);
  const maxH = h - (w < 640 ? 120 : 140);
  const r = Math.min(maxW / img.width, maxH / img.height);
  return { w: Math.round(img.width * r), h: Math.round(img.height * r) };
}
