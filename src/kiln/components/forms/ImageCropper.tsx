import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import { animate, motion, useMotionValue } from "motion/react";
import { cn } from "../../cn";
import { springFirm } from "../../motion";
import { Slider } from "../choice-controls/Slider";

/** Text used by ImageCropper. Pass a partial via `labels` to translate or reword. */
export interface ImageCropperLabels {
  /** aria-label of the crop area. */
  crop: string;
  /** Label of the zoom slider. */
  zoom: string;
}
export const imageCropperLabels: ImageCropperLabels = {
  crop: "Crop picture. Drag or use the arrow keys to move it, plus and minus to zoom.",
  zoom: "Zoom",
};

export type ImageCropperHandle = {
  /** Render the visible square to a PNG data URL of `size` × `size` pixels. */
  toDataURL: (size?: number) => string | null;
};

/**
 * Pan by dragging (or arrow keys), zoom with the slider, the wheel or + and −.
 * The picture always covers the round frame: it eases back if pushed past an edge.
 */
export const ImageCropper = forwardRef<ImageCropperHandle, {
  src: string;
  /** Diameter of the frame in px. */
  size?: number;
  maxZoom?: number;
  shape?: "round" | "square";
  className?: string;
  /** Override any UI text. Merged over `imageCropperLabels`. */
  labels?: Partial<ImageCropperLabels>;
}>(function ImageCropper({ src, size = 240, maxZoom = 3, shape = "round", className, labels }, ref) {
  const l = { ...imageCropperLabels, ...labels };
  const stage = useRef<HTMLDivElement>(null);
  const imgEl = useRef<HTMLImageElement | null>(null);
  const [natural, setNatural] = useState<{ w: number; h: number } | null>(null);
  const [zoom, setZoom] = useState(1);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const scale = useMotionValue(1);
  const drag = useRef<{ px: number; py: number; x: number; y: number } | null>(null);

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      imgEl.current = img;
      setNatural({ w: img.naturalWidth, h: img.naturalHeight });
      setZoom(1); x.set(0); y.set(0);
    };
    img.src = src;
  }, [src, x, y]);

  const base = natural ? size / Math.min(natural.w, natural.h) : 1;
  const limits = useCallback((z: number) => {
    if (!natural) return { mx: 0, my: 0 };
    return { mx: Math.max(0, (natural.w * base * z - size) / 2), my: Math.max(0, (natural.h * base * z - size) / 2) };
  }, [natural, base, size]);
  const clamp = (v: number, m: number) => Math.min(m, Math.max(-m, v));

  useEffect(() => {
    animate(scale, zoom, springFirm);
    const { mx, my } = limits(zoom);
    animate(x, clamp(x.get(), mx), springFirm);
    animate(y, clamp(y.get(), my), springFirm);
  }, [zoom, limits, scale, x, y]);

  const setZoomClamped = (z: number) => setZoom(Math.min(maxZoom, Math.max(1, Number(z.toFixed(3)))));

  // The wheel listener must be non-passive to stop the page scrolling.
  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => { e.preventDefault(); setZoom((z) => Math.min(maxZoom, Math.max(1, z * Math.exp(-e.deltaY * 0.0015)))); };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [maxZoom]);

  useImperativeHandle(ref, () => ({
    toDataURL: (out = 512) => {
      const img = imgEl.current;
      if (!img || !natural) return null;
      const k = base * scale.get();
      const side = size / k;
      const sx = natural.w / 2 - x.get() / k - side / 2;
      const sy = natural.h / 2 - y.get() / k - side / 2;
      const c = document.createElement("canvas");
      c.width = out; c.height = out;
      const g = c.getContext("2d");
      if (!g) return null;
      g.imageSmoothingQuality = "high";
      if (shape === "round") { g.beginPath(); g.arc(out / 2, out / 2, out / 2, 0, Math.PI * 2); g.clip(); }
      g.drawImage(img, sx, sy, side, side, 0, 0, out, out);
      return c.toDataURL("image/png");
    },
  }), [natural, base, size, shape, scale, x, y]);

  const onKey = (e: React.KeyboardEvent) => {
    const step = e.shiftKey ? 40 : 10;
    const { mx, my } = limits(zoom);
    const pan = (dx: number, dy: number) => { e.preventDefault(); animate(x, clamp(x.get() + dx, mx), springFirm); animate(y, clamp(y.get() + dy, my), springFirm); };
    if (e.key === "ArrowLeft") pan(step, 0);
    else if (e.key === "ArrowRight") pan(-step, 0);
    else if (e.key === "ArrowUp") pan(0, step);
    else if (e.key === "ArrowDown") pan(0, -step);
    else if (e.key === "+" || e.key === "=") { e.preventDefault(); setZoomClamped(zoom + 0.1); }
    else if (e.key === "-") { e.preventDefault(); setZoomClamped(zoom - 0.1); }
  };

  const r = size / 2;
  return (
    <div className={cn("flex flex-col items-center gap-5", className)}>
      <div
        ref={stage}
        role="application"
        aria-label={l.crop}
        tabIndex={0}
        onKeyDown={onKey}
        onPointerDown={(e) => {
          (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
          drag.current = { px: e.clientX, py: e.clientY, x: x.get(), y: y.get() };
        }}
        onPointerMove={(e) => {
          const d = drag.current;
          if (!d) return;
          const { mx, my } = limits(zoom);
          // Past an edge the picture follows at a third of the speed, then eases back on release.
          const soft = (v: number, m: number) => (Math.abs(v) <= m ? v : Math.sign(v) * (m + (Math.abs(v) - m) / 3));
          x.set(soft(d.x + e.clientX - d.px, mx));
          y.set(soft(d.y + e.clientY - d.py, my));
        }}
        onPointerUp={() => {
          drag.current = null;
          const { mx, my } = limits(zoom);
          animate(x, clamp(x.get(), mx), springFirm);
          animate(y, clamp(y.get(), my), springFirm);
        }}
        onPointerCancel={() => { drag.current = null; }}
        className="relative cursor-grab touch-none select-none overflow-hidden rounded-card bg-ink/90 outline-offset-4 active:cursor-grabbing"
        style={{ width: size + 64, height: size + 64, borderRadius: 12 }}
      >
        {natural && (
          <motion.img decoding="async"
            src={src}
            alt=""
            draggable={false}
            className="pointer-events-none absolute left-1/2 top-1/2 max-w-none"
            style={{
              width: natural.w * base,
              height: natural.h * base,
              marginLeft: (-natural.w * base) / 2,
              marginTop: (-natural.h * base) / 2,
              x, y, scale,
            }}
          />
        )}
        <svg className="pointer-events-none absolute inset-0 size-full" aria-hidden>
          <path
            fillRule="evenodd"
            className="fill-black/55"
            d={`M0 0h${size + 64}v${size + 64}H0z ` + (shape === "round"
              ? `M${32 + r} 32a${r} ${r} 0 1 0 0.001 0z`
              : `M32 32h${size}v${size}H32z`)}
          />
          {shape === "round"
            ? <circle cx={32 + r} cy={32 + r} r={r - 0.75} fill="none" stroke="white" strokeOpacity="0.7" strokeWidth="1.5" />
            : <rect x="32.75" y="32.75" width={size - 1.5} height={size - 1.5} fill="none" stroke="white" strokeOpacity="0.7" strokeWidth="1.5" />}
        </svg>
      </div>
      <Slider
        label={l.zoom}
        value={[Math.round(zoom * 100)]}
        onChange={([v]) => setZoomClamped(v / 100)}
        min={100}
        max={maxZoom * 100}
        step={5}
        format={(n) => `${n}%`}
        className="w-full max-w-[280px]"
      />
    </div>
  );
});
