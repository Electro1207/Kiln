import { forwardRef, useCallback, useEffect, useImperativeHandle, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { motion } from "motion/react";
import { Download, Eraser, PenLine, Type, Undo2 } from "lucide-react";
import { cn } from "../../cn";
import { fade } from "../../motion";
import { useA11yProps, type AccessibilityFeaturesProp } from "../../a11y";
import { announce } from "../accessibility/announce";
import { Button } from "../buttons/Button";

type Pt = { x: number; y: number; w: number };
type Stroke = Pt[];

/** Icons used by SignaturePad. Pass a partial via `icons` to replace them. */
/* Allowed exception to "tokens only": the PNG export is always dark ink so it reads on paper in either theme,
   and a canvas cannot read a CSS variable for the exported copy. On screen the ink comes from --k-ink. */
const EXPORT_INK = "#141413";

export interface SignaturePadIcons {
  /** Undo button. */
  undo: ReactNode;
  /** Clear button. */
  clear: ReactNode;
  /** Download button. */
  download: ReactNode;
  /** Button that switches to typing a name. */
  typeMode: ReactNode;
  /** Button that switches back to drawing. */
  drawMode: ReactNode;
}
export const signaturePadIcons: SignaturePadIcons = { undo: <Undo2 />, clear: <Eraser />, download: <Download />, typeMode: <Type />, drawMode: <PenLine /> };

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
  /** Button that switches to typing a name. */
  typeInstead: string;
  /** Button that switches back to drawing. */
  drawInstead: string;
  /** Label of the name field in typed mode. */
  typedLabel: string;
  /** Placeholder of the name field. */
  typedPlaceholder: string;
  /** Status text in typed mode with a name. */
  typed: string;
  /** Announced when the mode changes: "Typing your signature". */
  modeTyped: string;
  /** Announced when the mode changes: "Drawing your signature". */
  modeDrawn: string;
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
  typeInstead: "Type instead",
  drawInstead: "Draw instead",
  typedLabel: "Type your name",
  typedPlaceholder: "Your name",
  typed: "Typed",
  modeTyped: "Typing your signature",
  modeDrawn: "Drawing your signature",
};

const SCRIPT = '"Snell Roundhand", "Segoe Script", "Brush Script MT", "Lucida Handwriting", "Apple Chancery", cursive';

/** Draw `text` in a script stack, shrunk to fit `maxW`; returns its measured width and font size. */
function drawTyped(g: CanvasRenderingContext2D, text: string, maxW: number, baseline: number, x: number, size: number) {
  let px = size;
  g.font = `italic 400 ${px}px ${SCRIPT}`;
  const w0 = g.measureText(text).width;
  if (w0 > maxW) { px = Math.max(12, (px * maxW) / w0); g.font = `italic 400 ${px}px ${SCRIPT}`; }
  g.textBaseline = "alphabetic";
  g.fillText(text, x, baseline);
  return { width: g.measureText(text).width, px };
}

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
  /** Accessibility features to add for this pad only (adds to the person's settings). */
  accessibilityFeatures?: AccessibilityFeaturesProp;
}>(function SignaturePad({ label: labelProp, onChange, minWidth = 1.2, maxWidth = 3.6, height = 200, className, downloadName, labels, icons, accessibilityFeatures }, ref) {
  const { rootProps } = useA11yProps(accessibilityFeatures);
  const l = { ...signaturePadLabels, ...labels };
  const ic = useMemo(() => ({ ...signaturePadIcons, ...icons }), [icons]);
  const label = labelProp ?? l.label;
  const canvas = useRef<HTMLCanvasElement>(null);
  const strokes = useRef<Stroke[]>([]);
  const live = useRef<{ stroke: Stroke; last: { x: number; y: number; t: number }; w: number } | null>(null);
  const [count, setCount] = useState(0);
  const [mode, setMode] = useState<"draw" | "type">("draw");
  const [typed, setTyped] = useState("");
  const typedRef = useRef({ mode, typed });
  typedRef.current = { mode, typed };
  const has = mode === "type" ? typed.trim().length > 0 : count > 0;

  const ink = () => getComputedStyle(document.documentElement).getPropertyValue("--k-ink").trim() || EXPORT_INK;

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
    const t = typedRef.current;
    if (t.mode === "type") {
      if (t.typed.trim()) drawTyped(g, t.typed.trim(), w - 48, h * 0.62, 24, Math.min(64, h * 0.4));
      return;
    }
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

  useEffect(() => {
    redraw();
    onChange?.(mode === "type" ? !typed.trim() : strokes.current.length === 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, typed]);

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
  const clear = () => {
    strokes.current = [];
    setTyped("");
    redraw();
    changed();
  };
  const switchMode = () => {
    const next = mode === "draw" ? "type" : "draw";
    setMode(next);
    announce(next === "type" ? l.modeTyped : l.modeDrawn);
  };

  const toDataURL = () => {
    if (mode === "type") {
      const text = typed.trim();
      if (!text) return null;
      const probe = document.createElement("canvas").getContext("2d");
      if (!probe) return null;
      const size = 64, pad = 12, scale = 2;
      probe.font = `italic 400 ${size}px ${SCRIPT}`;
      const w = Math.ceil(probe.measureText(text).width) + pad * 2, h = size * 1.5 + pad * 2;
      const out = document.createElement("canvas");
      out.width = w * scale; out.height = Math.ceil(h * scale);
      const g = out.getContext("2d");
      if (!g) return null;
      g.scale(scale, scale);
      g.fillStyle = EXPORT_INK;
      drawTyped(g, text, w, pad + size * 1.1, pad, size);
      return out.toDataURL("image/png");
    }
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
    g.strokeStyle = EXPORT_INK; g.fillStyle = EXPORT_INK; g.lineCap = "round"; g.lineJoin = "round";
    for (const s of strokes.current) {
      if (s.length === 1) { dot(g, s[0]); continue; }
      for (let i = 1; i < s.length - 1; i++) segment(g, s[i - 1], s[i], s[i + 1]);
      g.lineWidth = s[0].w; g.beginPath(); g.moveTo(s[0].x, s[0].y); g.lineTo((s[0].x + s[1].x) / 2, (s[0].y + s[1].y) / 2); g.stroke();
      const n = s.length;
      g.lineWidth = s[n - 1].w; g.beginPath(); g.moveTo((s[n - 2].x + s[n - 1].x) / 2, (s[n - 2].y + s[n - 1].y) / 2); g.lineTo(s[n - 1].x, s[n - 1].y); g.stroke();
    }
    return out.toDataURL("image/png");
  };

  useImperativeHandle(ref, () => ({ toDataURL, clear, isEmpty: () => (mode === "type" ? !typed.trim() : strokes.current.length === 0) }));

  const download = () => {
    const url = toDataURL();
    if (!url || !downloadName) return;
    const a = document.createElement("a");
    a.href = url; a.download = downloadName.endsWith(".png") ? downloadName : `${downloadName}.png`;
    a.click();
  };

  return (
    <div {...rootProps} className={cn("flex w-full flex-col gap-2.5", className)}>
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-sm font-medium text-ink">{label}</span>
        <span className="text-[0.8125rem] text-muted" aria-live="polite">{mode === "type" ? (has ? l.typed : l.empty) : count ? l.strokes(count) : l.empty}</span>
      </div>
      {mode === "type" && (
        <input
          type="text"
          autoComplete="name"
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          aria-label={l.typedLabel}
          placeholder={l.typedPlaceholder}
          className="k-ctl-md w-full rounded-control border border-line-strong bg-surface px-3 text-ink placeholder:text-faint"
        />
      )}
      <div className="relative overflow-hidden rounded-card bg-surface" style={{ height }}>
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-x-6 bottom-8 flex items-end gap-3 text-faint"
          initial={false}
          animate={{ opacity: has || mode === "type" ? 0 : 1 }}
          transition={fade}
        >
          <span className="text-lg leading-none">×</span>
          <span className="pb-0.5 text-sm">{l.signHere}</span>
        </motion.span>
        <canvas
          ref={canvas}
          role="img"
          aria-label={has ? l.signed(label) : l.emptyHint(label)}
          className={cn("absolute inset-0 size-full touch-none", mode === "type" ? "pointer-events-none" : "cursor-crosshair")}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
        />
      </div>
      <div className="flex flex-wrap gap-2">
        {mode === "draw" && <Button size="sm" variant="ghost" leading={ic.undo} onClick={undo} disabled={!count}>{l.undo}</Button>}
        <Button size="sm" variant="ghost" leading={ic.clear} onClick={clear} disabled={!has}>{l.clear}</Button>
        <Button size="sm" variant="ghost" leading={mode === "draw" ? ic.typeMode : ic.drawMode} onClick={switchMode}>{mode === "draw" ? l.typeInstead : l.drawInstead}</Button>
        {downloadName && <Button size="sm" variant="secondary" leading={ic.download} onClick={download} disabled={!has} className="ml-auto">{l.download}</Button>}
      </div>
    </div>
  );
});
