import { forwardRef, useCallback, useEffect, useImperativeHandle, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { motion } from "motion/react";
import { Download, Eraser, Undo2 } from "lucide-react";
import { cn } from "../../cn";
import { fade } from "../../motion";
import { Button } from "../buttons/Button";

type Pt = { x: number; y: number; w: number };
type Stroke = Pt[];

/** Icons used by SignaturePad. Pass a partial via `icons` to replace them. */
export interface SignaturePadIcons {
  /** Undo button. */
  undo: ReactNode;
  /** Clear button. */
  clear: ReactNode;
  /** Download button. */
  download: ReactNode;
}
export const signaturePadIcons: SignaturePadIcons = { undo: <Undo2 />, clear: <Eraser />, download: <Download /> };

/** Text used by SignaturePad. Pass a partial via `labels` to translate or reword. */
export interface SignaturePadLabels {
  /** Heading when the `label` prop is not given. */
  label: string;
  /** Status text with no strokes. */
  empty: string;
  /** Status text with strokes: "3 strokes". */
  strokes: (count: number) => string;
  /** Hint inside the empty pad. */
  signHere: string;
  /** aria-label of the canvas once signed. */
  signed: (label: string) => string;
  /** aria-label of the canvas while empty. */
  emptyHint: (label: string) => string;
  /** Undo button. */
  undo: string;
  /** Clear button. */
  clear: string;
  /** Download button. */
  download: string;
}
export const signaturePadLabels: SignaturePadLabels = {
  label: "Signature",
  empty: "Empty",
  strokes: (n) => `${n} ${n === 1 ? "stroke" : "strokes"}`,
  signHere: "Sign here",
  signed: (label) => `${label}, signed`,
  emptyHint: (label) => `${label}, empty. Draw with a pointer to sign.`,
  undo: "Undo",
  clear: "Clear",
  download: "Download PNG",
};

export type SignaturePadHandle = {
  /** PNG of the signature on a transparent ground, trimmed to the ink with a margin. */
  toDataURL: () => string | null;
  clear: () => void;
  isEmpty: () => boolean;
};

/**
 * Sign with a finger, pen or mouse. Strokes are drawn straight onto a canvas as
 * the pointer moves (no re-rendering), thicker with pen pressure or when moving
 * slowly, and smoothed through midpoints. Undo removes the last stroke.
 */
export const SignaturePad = forwardRef<SignaturePadHandle, {
  label?: string;
  /** Called when the signature changes (after each stroke, undo or clear). */
  onChange?: (empty: boolean) => void;
  /** Stroke width range in CSS pixels. */
  minWidth?: number;
  maxWidth?: number;
  height?: number;
  className?: string;
  /** File name used by the built-in Download button. Leave out to hide it. */
  downloadName?: string;
  /** Override any UI text. Merged over `signaturePadLabels`. */
  labels?: Partial<SignaturePadLabels>;
  /** Replace any built-in icon. Merged over `signaturePadIcons`. */
  icons?: Partial<SignaturePadIcons>;
}>(function SignaturePad({ label: labelProp, onChange, minWidth = 1.2, maxWidth = 3.6, height = 200, className, downloadName, labels, icons }, ref) {
  const l = { ...signaturePadLabels, ...labels };
  const ic = useMemo(() => ({ ...signaturePadIcons, ...icons }), [icons]);
  const label = labelProp ?? l.label;
  const canvas = useRef<HTMLCanvasElement>(null);
  const strokes = useRef<Stroke[]>([]);
  const live = useRef<{ stroke: Stroke; last: { x: number; y: number; t: number }; w: number } | null>(null);
  const [count, setCount] = useState(0);

  const ink = () => getComputedStyle(document.documentElement).getPropertyValue("--k-ink").trim() || "#141413";

  const segment = (g: CanvasRenderingContext2D, a: Pt, b: Pt, c: Pt) => {
    const m1 = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
    const m2 = { x: (b.x + c.x) / 2, y: (b.y + c.y) / 2 };
    g.lineWidth = (a.w + b.w + c.w) / 3;
    g.beginPath();
    g.moveTo(m1.x, m1.y);
    g.quadraticCurveTo(b.x, b.y, m2.x, m2.y);
    g.stroke();
  };
  const dot = (g: CanvasRenderingContext2D, p: Pt) => { g.beginPath(); g.arc(p.x, p.y, p.w / 2, 0, Math.PI * 2); g.fill(); };

  const ctx = () => {
    const c = canvas.current;
    const g = c?.getContext("2d");
    if (!c || !g) return null;
    const colour = ink();
    g.strokeStyle = colour; g.fillStyle = colour; g.lineCap = "round"; g.lineJoin = "round";
    return g;
  };

  const redraw = useCallback(() => {
    const c = canvas.current;
    if (!c) return;
    const dpr = window.devicePixelRatio || 1;
    const w = c.clientWidth, h = c.clientHeight;
    if (c.width !== Math.round(w * dpr) || c.height !== Math.round(h * dpr)) { c.width = Math.round(w * dpr); c.height = Math.round(h * dpr); }
    const g = ctx();
    if (!g) return;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, w, h);
    for (const s of strokes.current) {
      if (s.length === 1) { dot(g, s[0]); continue; }
      for (let i = 1; i < s.length - 1; i++) segment(g, s[i - 1], s[i], s[i + 1]);
      g.lineWidth = s[0].w; g.beginPath(); g.moveTo(s[0].x, s[0].y); g.lineTo((s[0].x + s[1].x) / 2, (s[0].y + s[1].y) / 2); g.stroke();
      const n = s.length;
      g.lineWidth = s[n - 1].w; g.beginPath(); g.moveTo((s[n - 2].x + s[n - 1].x) / 2, (s[n - 2].y + s[n - 1].y) / 2); g.lineTo(s[n - 1].x, s[n - 1].y); g.stroke();
    }
  }, []);

  useLayoutEffect(() => {
    const c = canvas.current;
    if (!c) return;
    const ro = new ResizeObserver(() => redraw());
    ro.observe(c);
    redraw();
    return () => ro.disconnect();
  }, [redraw]);

  useEffect(() => {
    const mo = new MutationObserver(() => requestAnimationFrame(redraw));
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "style"] });
    return () => mo.disconnect();
  }, [redraw]);

  const changed = () => { setCount(strokes.current.length); onChange?.(strokes.current.length === 0); };

  const widthFor = (pressure: number, pointerType: string, speed: number, prev: number) => {
    // A pen reports real pressure; a mouse reports 0.5 while pressed, and touch varies by device.
    const target = pointerType === "pen" && pressure > 0
      ? minWidth + (maxWidth - minWidth) * pressure
      : maxWidth - (maxWidth - minWidth) * Math.min(1, speed / 2.2);
    return prev * 0.7 + target * 0.3;
  };

  const point = (e: PointerEvent | React.PointerEvent) => {
    const r = canvas.current!.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const onDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const p = point(e);
    const w0 = (minWidth + maxWidth) / 2;
    const first = { ...p, w: w0 };
    live.current = { stroke: [first], last: { ...p, t: e.timeStamp }, w: w0 };
    strokes.current.push(live.current.stroke);
    const g = ctx();
    if (g) dot(g, first);
  };

  const onMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const L = live.current;
    if (!L) return;
    const g = ctx();
    if (!g) return;
    // Coalesced events carry every sample the hardware made between frames: smoother curves.
    const co = e.nativeEvent.getCoalescedEvents?.();
    const events = co && co.length ? co : [e.nativeEvent];
    for (const ev of events) {
      const p = point(ev);
      const dt = Math.max(1, ev.timeStamp - L.last.t);
      const dist = Math.hypot(p.x - L.last.x, p.y - L.last.y);
      if (dist < 0.8) continue;
      L.w = widthFor(ev.pressure, ev.pointerType, dist / dt, L.w);
      L.stroke.push({ ...p, w: L.w });
      L.last = { ...p, t: ev.timeStamp };
      const s = L.stroke;
      if (s.length >= 3) segment(g, s[s.length - 3], s[s.length - 2], s[s.length - 1]);
    }
  };

  const onUp = () => {
    if (!live.current) return;
    live.current = null;
    redraw();
    changed();
  };

  const undo = () => { strokes.current.pop(); redraw(); changed(); };
  const clear = () => { strokes.current = []; redraw(); changed(); };

  const toDataURL = () => {
    const all = strokes.current.flat();
    if (!all.length) return null;
    const pad = 12;
    const minX = Math.min(...all.map((p) => p.x - p.w)) - pad, minY = Math.min(...all.map((p) => p.y - p.w)) - pad;
    const maxX = Math.max(...all.map((p) => p.x + p.w)) + pad, maxY = Math.max(...all.map((p) => p.y + p.w)) + pad;
    const scale = 2;
    const out = document.createElement("canvas");
    out.width = Math.ceil((maxX - minX) * scale); out.height = Math.ceil((maxY - minY) * scale);
    const g = out.getContext("2d");
    if (!g) return null;
    g.setTransform(scale, 0, 0, scale, -minX * scale, -minY * scale);
    // Exports are always dark ink, whatever the theme, so they read on paper.
    g.strokeStyle = "#141413"; g.fillStyle = "#141413"; g.lineCap = "round"; g.lineJoin = "round";
    for (const s of strokes.current) {
      if (s.length === 1) { dot(g, s[0]); continue; }
      for (let i = 1; i < s.length - 1; i++) segment(g, s[i - 1], s[i], s[i + 1]);
      g.lineWidth = s[0].w; g.beginPath(); g.moveTo(s[0].x, s[0].y); g.lineTo((s[0].x + s[1].x) / 2, (s[0].y + s[1].y) / 2); g.stroke();
      const n = s.length;
      g.lineWidth = s[n - 1].w; g.beginPath(); g.moveTo((s[n - 2].x + s[n - 1].x) / 2, (s[n - 2].y + s[n - 1].y) / 2); g.lineTo(s[n - 1].x, s[n - 1].y); g.stroke();
    }
    return out.toDataURL("image/png");
  };

  useImperativeHandle(ref, () => ({ toDataURL, clear, isEmpty: () => strokes.current.length === 0 }));

  const download = () => {
    const url = toDataURL();
    if (!url || !downloadName) return;
    const a = document.createElement("a");
    a.href = url; a.download = downloadName.endsWith(".png") ? downloadName : `${downloadName}.png`;
    a.click();
  };

  return (
    <div className={cn("flex w-full flex-col gap-2.5", className)}>
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-sm font-medium text-ink">{label}</span>
        <span className="text-[13px] text-muted" aria-live="polite">{count ? l.strokes(count) : l.empty}</span>
      </div>
      <div className="relative overflow-hidden rounded-card bg-surface" style={{ height }}>
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-x-6 bottom-8 flex items-end gap-3 text-faint"
          initial={false}
          animate={{ opacity: count ? 0 : 1 }}
          transition={fade}
        >
          <span className="text-lg leading-none">×</span>
          <span className="pb-0.5 text-sm">{l.signHere}</span>
        </motion.span>
        <canvas
          ref={canvas}
          role="img"
          aria-label={count ? l.signed(label) : l.emptyHint(label)}
          className="absolute inset-0 size-full cursor-crosshair touch-none"
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
        />
      </div>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="ghost" leading={ic.undo} onClick={undo} disabled={!count}>{l.undo}</Button>
        <Button size="sm" variant="ghost" leading={ic.clear} onClick={clear} disabled={!count}>{l.clear}</Button>
        {downloadName && <Button size="sm" variant="secondary" leading={ic.download} onClick={download} disabled={!count} className="ml-auto">{l.download}</Button>}
      </div>
    </div>
  );
});
