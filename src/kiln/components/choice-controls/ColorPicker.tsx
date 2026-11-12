import { useEffect, useLayoutEffect, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent as RPointerEvent, type ReactNode } from "react";
import { motion, useMotionValue, useMotionValueEvent, useTransform, type MotionValue } from "motion/react";
import { Pipette, Plus } from "lucide-react";
import { cn } from "../../cn";
import { fade } from "../../motion";
import { SegmentedControl } from "../buttons/SegmentedControl";
import { AnchoredLayer, panelClass } from "../shared/Anchored";

export type HSVA = { h: number; s: number; v: number; a: number };
type RGB = { r: number; g: number; b: number };

const clamp = (n: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, n));

/** The checkerboard that shows through transparent colours. */
const checker = { background: "repeating-conic-gradient(#d6d6d6 0 25%, #ffffff 0 50%) 0 0 / 8px 8px" };

export function hsvToRgb({ h, s, v }: HSVA): RGB {
  const f = (n: number) => {
    const k = (n + h / 60) % 6;
    return v - v * s * Math.max(0, Math.min(k, 4 - k, 1));
  };
  return { r: Math.round(f(5) * 255), g: Math.round(f(3) * 255), b: Math.round(f(1) * 255) };
}

export function rgbToHsv({ r, g, b }: RGB): Omit<HSVA, "a"> {
  const R = r / 255, G = g / 255, B = b / 255;
  const max = Math.max(R, G, B), d = max - Math.min(R, G, B);
  let h = 0;
  if (d) h = max === R ? ((G - B) / d) % 6 : max === G ? (B - R) / d + 2 : (R - G) / d + 4;
  return { h: (h * 60 + 360) % 360, s: max ? d / max : 0, v: max };
}

function rgbToHsl({ r, g, b }: RGB) {
  const R = r / 255, G = g / 255, B = b / 255;
  const max = Math.max(R, G, B), min = Math.min(R, G, B), l = (max + min) / 2, d = max - min;
  const s = d ? d / (1 - Math.abs(2 * l - 1)) : 0;
  let h = 0;
  if (d) h = max === R ? ((G - B) / d) % 6 : max === G ? (B - R) / d + 2 : (R - G) / d + 4;
  return { h: Math.round((h * 60 + 360) % 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hslToRgb(h: number, s: number, l: number): RGB {
  s /= 100; l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1));
  return { r: Math.round(f(0) * 255), g: Math.round(f(8) * 255), b: Math.round(f(4) * 255) };
}

const hex2 = (n: number) => Math.round(n).toString(16).padStart(2, "0");

export function toHex(c: HSVA) {
  const { r, g, b } = hsvToRgb(c);
  return `#${hex2(r)}${hex2(g)}${hex2(b)}${c.a < 1 ? hex2(c.a * 255) : ""}`;
}

/** Parse #rgb, #rrggbb, #rrggbbaa, rgb()/rgba() and hsl()/hsla(). */
export function parseColor(input: string): HSVA | null {
  const s = input.trim().toLowerCase();
  let m = s.match(/^#?([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/);
  if (m) {
    let h = m[1];
    if (h.length === 3) h = [...h].map((c) => c + c).join("");
    const rgb = { r: parseInt(h.slice(0, 2), 16), g: parseInt(h.slice(2, 4), 16), b: parseInt(h.slice(4, 6), 16) };
    return { ...rgbToHsv(rgb), a: h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1 };
  }
  m = s.match(/^rgba?\(\s*(\d+)[ ,]+(\d+)[ ,]+(\d+)(?:[ ,/]+([\d.]+%?))?\s*\)$/);
  if (m) {
    const a = m[4] == null ? 1 : m[4].endsWith("%") ? parseFloat(m[4]) / 100 : parseFloat(m[4]);
    return { ...rgbToHsv({ r: clamp(+m[1], 0, 255), g: clamp(+m[2], 0, 255), b: clamp(+m[3], 0, 255) }), a: clamp(a) };
  }
  m = s.match(/^hsla?\(\s*([\d.]+)(?:deg)?[ ,]+([\d.]+)%[ ,]+([\d.]+)%(?:[ ,/]+([\d.]+%?))?\s*\)$/);
  if (m) {
    const a = m[4] == null ? 1 : m[4].endsWith("%") ? parseFloat(m[4]) / 100 : parseFloat(m[4]);
    return { ...rgbToHsv(hslToRgb(+m[1] % 360, clamp(+m[2], 0, 100), clamp(+m[3], 0, 100))), a: clamp(a) };
  }
  return null;
}

const HUE_RAIL = "linear-gradient(90deg, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)";

type Format = "hex" | "rgb" | "hsl";

/** Icons used by ColorPicker and ColorPickerPanel. Pass a partial via `icons` to replace any. */
export interface ColorPickerIcons {
  /** Screen eyedropper button. */
  dropper: ReactNode;
  /** Button that saves the current colour as a swatch. */
  add: ReactNode;
}
export const colorPickerIcons: ColorPickerIcons = { dropper: <Pipette />, add: <Plus /> };

/** Text used by ColorPicker and ColorPickerPanel. Pass a partial via `labels` to translate or reword. */
export interface ColorPickerLabels {
  /** Name of the hue slider. */
  hue: string;
  /** Name of the opacity slider. */
  opacity: string;
  /** Spoken value of the hue slider. */
  degrees: (n: number) => string;
  /** Spoken value of the opacity slider. */
  percent: (n: number) => string;
  /** aria-label of the format switch. */
  colourFormat: string;
  /** Hex format option and the caption under the hex field. */
  hex: string;
  /** RGB format option. */
  rgb: string;
  /** HSL format option. */
  hsl: string;
  /** aria-label of the eyedropper button. */
  pickFromScreen: string;
  /** Tooltip of the eyedropper button. */
  pickFromScreenTitle: string;
  /** Heading above the saved swatches. */
  saved: string;
  /** aria-label of a saved swatch; receives its colour. */
  useColour: (colour: string) => string;
  /** aria-label and tooltip of the save button. */
  saveColour: string;
  /** Name of the saturation and brightness area. */
  area: string;
  /** Spoken value of the area, in percent. */
  areaValue: (saturation: number, brightness: number) => string;
  /** aria-label of the hex field. */
  hexCode: string;
  /** aria-label of the opacity field. */
  opacityPercent: string;
  /** Caption under the opacity field. */
  alpha: string;
  /** aria-label of the picker's trigger button; receives the `label` and current value. */
  trigger: (label: string, value: string) => string;
}
export const colorPickerLabels: ColorPickerLabels = {
  hue: "Hue",
  opacity: "Opacity",
  degrees: (n) => `${n} degrees`,
  percent: (n) => `${n} percent`,
  colourFormat: "Colour format",
  hex: "Hex",
  rgb: "RGB",
  hsl: "HSL",
  pickFromScreen: "Pick a colour from the screen",
  pickFromScreenTitle: "Pick from screen",
  saved: "Saved",
  useColour: (c) => `Use ${c}`,
  saveColour: "Save this colour",
  area: "Saturation and brightness",
  areaValue: (s, b) => `Saturation ${s}%, brightness ${b}%`,
  hexCode: "Hex code",
  opacityPercent: "Opacity, percent",
  alpha: "Alpha %",
  trigger: (label, value) => `${label}: ${value}. Change`,
};

type EyeDropperCtor = new () => { open: () => Promise<{ sRGBHex: string }> };

/**
 * Saturation and brightness area, hue and alpha sliders, typed values and saved
 * swatches. Dragging moves motion values only, so nothing re-renders mid-drag;
 * `onChange` fires when a change is committed (release, Enter, a swatch).
 */
export function ColorPickerPanel({
  value, onChange, swatches, onSwatchesChange, alpha = true, className, labels, icons,
}: {
  value: string;
  onChange: (hex: string) => void;
  swatches?: string[];
  onSwatchesChange?: (s: string[]) => void;
  alpha?: boolean;
  className?: string;
  /** Override any UI text. Merged over `colorPickerLabels`. */
  labels?: Partial<ColorPickerLabels>;
  /** Replace any built-in icon. Merged over `colorPickerIcons`. */
  icons?: Partial<ColorPickerIcons>;
}) {
  const l = { ...colorPickerLabels, ...labels };
  const ic = useMemo(() => ({ ...colorPickerIcons, ...icons }), [icons]);
  const start = parseColor(value) ?? { h: 0, s: 0, v: 0, a: 1 };
  const h = useMotionValue(start.h);
  const s = useMotionValue(start.s);
  const v = useMotionValue(start.v);
  const a = useMotionValue(start.a);
  const [format, setFormat] = useState<Format>("hex");
  const emitted = useRef(value);
  const hasDropper = typeof window !== "undefined" && "EyeDropper" in window;

  const read = (): HSVA => ({ h: h.get(), s: s.get(), v: v.get(), a: alpha ? a.get() : 1 });
  const commit = () => { const hex = toHex(read()); emitted.current = hex; onChange(hex); };
  const setAll = (c: HSVA) => { h.set(c.h); s.set(c.s); v.set(c.v); a.set(c.a); };

  // A value set from outside (not one this panel emitted) moves the controls.
  useEffect(() => {
    if (value === emitted.current) return;
    const c = parseColor(value);
    if (c) { setAll(c); emitted.current = value; }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const rgba = useTransform(() => { const { r, g, b } = hsvToRgb(read()); return `rgba(${r}, ${g}, ${b}, ${alpha ? a.get() : 1})`; });
  const solid = useTransform(() => { const { r, g, b } = hsvToRgb(read()); return `rgb(${r}, ${g}, ${b})`; });
  const hueColour = useTransform(h, (x) => `hsl(${x} 100% 50%)`);

  const pickFromScreen = async () => {
    const Ctor = (window as unknown as { EyeDropper?: EyeDropperCtor }).EyeDropper;
    if (!Ctor) return;
    try {
      const { sRGBHex } = await new Ctor().open();
      const c = parseColor(sRGBHex);
      if (c) { setAll({ ...c, a: a.get() }); commit(); }
    } catch { /* cancelled */ }
  };

  return (
    <div className={cn("flex w-full max-w-[280px] flex-col gap-3.5", className)}>
      <Area s={s} v={v} hueColour={hueColour} solid={solid} onCommit={commit} t={l} />
      <div className="flex items-center gap-3">
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <Track label={l.hue} value={h} max={360} step={1} onCommit={commit} format={(n) => l.degrees(Math.round(n))} background={HUE_RAIL} thumbColour={hueColour} />
          {alpha && <Track label={l.opacity} value={a} max={1} step={0.01} onCommit={commit} format={(n) => l.percent(Math.round(n * 100))} alphaOf={solid} thumbColour={rgba} />}
        </div>
        <span className="relative size-10 shrink-0 overflow-hidden rounded-control" aria-hidden>
          <span className="absolute inset-0" style={checker} />
          <motion.span className="absolute inset-0" style={{ backgroundColor: rgba }} />
        </span>
      </div>

      <div className="flex items-center gap-2">
        <SegmentedControl size="sm" label={l.colourFormat} value={format} onChange={setFormat}
          options={[{ value: "hex", label: l.hex }, { value: "rgb", label: l.rgb }, { value: "hsl", label: l.hsl }]} />
        {hasDropper && (
          <button type="button" onClick={pickFromScreen} aria-label={l.pickFromScreen} title={l.pickFromScreenTitle}
            className="ml-auto grid size-8 place-items-center rounded-control text-muted transition-colors hover:bg-raised hover:text-ink [&>svg]:size-4">
            {ic.dropper}
          </button>
        )}
      </div>
      <Fields t={l} format={format} h={h} s={s} v={v} a={a} alpha={alpha} read={read} setAll={setAll} commit={commit} />

      {swatches && (
        <div className="flex flex-col gap-2">
          <span className="text-[13px] font-medium text-muted">{l.saved}</span>
          <div className="flex flex-wrap gap-2">
            {swatches.map((c) => (
              <button key={c} type="button" aria-label={l.useColour(c)} title={c}
                onClick={() => { const p = parseColor(c); if (p) { setAll(p); commit(); } }}
                className="relative size-7 overflow-hidden rounded-[7px] transition-transform duration-200 hover:scale-110">
                <span className="absolute inset-0" style={checker} aria-hidden />
                <span className="absolute inset-0" style={{ background: c }} aria-hidden />
                <span className="pointer-events-none absolute inset-0 rounded-[7px] ring-1 ring-inset ring-ink/15" aria-hidden />
              </button>
            ))}
            {onSwatchesChange && (
              <button type="button" aria-label={l.saveColour} title={l.saveColour}
                onClick={() => { const hex = toHex(read()); if (!swatches.includes(hex)) onSwatchesChange([...swatches, hex].slice(-14)); }}
                className="grid size-7 place-items-center rounded-[7px] border border-dashed border-line-strong text-muted transition-colors hover:border-faint hover:text-ink [&>svg]:size-3.5">
                {ic.add}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/** Measures an element's size into motion values, so thumbs can be placed with transforms. */
function useSize(ref: React.RefObject<HTMLElement | null>) {
  const w = useMotionValue(0);
  const hgt = useMotionValue(0);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => { w.set(el.clientWidth); hgt.set(el.clientHeight); });
    ro.observe(el);
    w.set(el.clientWidth); hgt.set(el.clientHeight);
    return () => ro.disconnect();
  }, [ref, w, hgt]);
  return [w, hgt] as const;
}

function Area({ s, v, hueColour, solid, onCommit, t }: {
  t: ColorPickerLabels;
  s: MotionValue<number>; v: MotionValue<number>;
  hueColour: MotionValue<string>; solid: MotionValue<string>; onCommit: () => void;
}) {
  const box = useRef<HTMLDivElement>(null);
  const rect = useRef<DOMRect | null>(null);
  const [w, hh] = useSize(box);
  const x = useTransform(() => s.get() * w.get());
  const y = useTransform(() => (1 - v.get()) * hh.get());
  const [label, setLabel] = useState("");
  const describe = () => setLabel(t.areaValue(Math.round(s.get() * 100), Math.round(v.get() * 100)));

  const at = (e: RPointerEvent) => {
    const r = rect.current!;
    s.set(clamp((e.clientX - r.left) / r.width));
    v.set(1 - clamp((e.clientY - r.top) / r.height));
  };
  const onKey = (e: KeyboardEvent) => {
    const d = e.shiftKey ? 0.1 : 0.01;
    const map: Record<string, [number, number]> = { ArrowRight: [d, 0], ArrowLeft: [-d, 0], ArrowUp: [0, d], ArrowDown: [0, -d] };
    const m = map[e.key];
    if (!m) return;
    e.preventDefault();
    s.set(clamp(s.get() + m[0]));
    v.set(clamp(v.get() + m[1]));
    describe();
    onCommit();
  };

  return (
    <div
      ref={box}
      className="relative h-44 w-full cursor-crosshair touch-none select-none rounded-card"
      onPointerDown={(e) => {
        if (e.button !== 0) return;
        e.currentTarget.setPointerCapture(e.pointerId);
        rect.current = e.currentTarget.getBoundingClientRect();
        at(e);
        (e.currentTarget.querySelector("[role=slider]") as HTMLElement | null)?.focus({ preventScroll: true, focusVisible: false } as FocusOptions);
      }}
      onPointerMove={(e) => { if (rect.current) at(e); }}
      onPointerUp={() => { if (rect.current) { rect.current = null; describe(); onCommit(); } }}
      onPointerCancel={() => { rect.current = null; }}
    >
      <motion.div className="absolute inset-0 overflow-hidden rounded-card" style={{ backgroundColor: hueColour }}>
        <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, #fff, rgba(255,255,255,0))" }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(0deg, #000, rgba(0,0,0,0))" }} />
      </motion.div>
      <motion.div
        role="slider"
        tabIndex={0}
        aria-label={t.area}
        aria-valuetext={label || undefined}
        aria-valuenow={Math.round(s.get() * 100)}
        onKeyDown={onKey}
        onFocus={describe}
        className="absolute -left-2.5 -top-2.5 size-5 rounded-full border-[3px] border-white outline-offset-2 ring-1 ring-black/25"
        style={{ x, y, backgroundColor: solid }}
      />
    </div>
  );
}

function Track({ label, value, max, step, onCommit, format, background, alphaOf, thumbColour }: {
  label: string; value: MotionValue<number>; max: number; step: number; onCommit: () => void; format: (n: number) => string;
  background?: string; alphaOf?: MotionValue<string>; thumbColour: MotionValue<string>;
}) {
  const box = useRef<HTMLDivElement>(null);
  const rect = useRef<DOMRect | null>(null);
  const [w] = useSize(box);
  const x = useTransform(() => (value.get() / max) * Math.max(0, w.get() - 16));
  const fadeTo = useTransform(() => (alphaOf ? `linear-gradient(90deg, transparent, ${alphaOf.get()})` : "none"));
  const [text, setText] = useState(format(value.get()));

  const at = (e: RPointerEvent) => {
    const r = rect.current!;
    value.set(clamp((e.clientX - r.left - 8) / Math.max(1, r.width - 16)) * max);
  };
  const onKey = (e: KeyboardEvent) => {
    const big = e.shiftKey ? 10 : 1;
    let n = value.get();
    if (e.key === "ArrowRight" || e.key === "ArrowUp") n += step * big;
    else if (e.key === "ArrowLeft" || e.key === "ArrowDown") n -= step * big;
    else if (e.key === "Home") n = 0;
    else if (e.key === "End") n = max;
    else return;
    e.preventDefault();
    value.set(clamp(n, 0, max));
    setText(format(value.get()));
    onCommit();
  };

  return (
    <div
      ref={box}
      className="relative h-4 w-full touch-none select-none"
      onPointerDown={(e) => {
        if (e.button !== 0) return;
        e.currentTarget.setPointerCapture(e.pointerId);
        rect.current = e.currentTarget.getBoundingClientRect();
        at(e);
      }}
      onPointerMove={(e) => { if (rect.current) at(e); }}
      onPointerUp={() => { if (rect.current) { rect.current = null; setText(format(value.get())); onCommit(); } }}
      onPointerCancel={() => { rect.current = null; }}
    >
      <div className="absolute inset-0 overflow-hidden rounded-full">
        {alphaOf && <span className="absolute inset-0" style={checker} />}
        <motion.span className="absolute inset-0" style={{ background: background ?? fadeTo }} />
      </div>
      <motion.div
        role="slider"
        tabIndex={0}
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={Math.round(value.get() * 100) / 100}
        aria-valuetext={text}
        onKeyDown={onKey}
        onFocus={() => setText(format(value.get()))}
        className="absolute left-0 top-0 size-4 rounded-full border-[3px] border-white outline-offset-2 ring-1 ring-black/25"
        style={{ x, backgroundColor: thumbColour }}
      />
    </div>
  );
}

/** Text fields that follow the motion values by writing to the DOM directly (no re-render while dragging). */
function Fields({ t, format, h, s, v, a, alpha, read, setAll, commit }: {
  t: ColorPickerLabels;
  format: Format; h: MotionValue<number>; s: MotionValue<number>; v: MotionValue<number>; a: MotionValue<number>;
  alpha: boolean; read: () => HSVA; setAll: (c: HSVA) => void; commit: () => void;
}) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const values = (): string[] => {
    const c = read();
    const rgb = hsvToRgb(c);
    const al = String(Math.round(c.a * 100));
    if (format === "hex") return [toHex({ ...c, a: 1 }).slice(1).toUpperCase(), al];
    if (format === "rgb") return [String(rgb.r), String(rgb.g), String(rgb.b), al];
    const hsl = rgbToHsl(rgb);
    return [String(hsl.h), String(hsl.s), String(hsl.l), al];
  };
  const write = () => {
    const vals = values();
    refs.current.forEach((el, i) => { if (el && document.activeElement !== el && vals[i] != null) el.value = vals[i]; });
  };
  useMotionValueEvent(h, "change", write);
  useMotionValueEvent(s, "change", write);
  useMotionValueEvent(v, "change", write);
  useMotionValueEvent(a, "change", write);
  useEffect(write);

  const apply = () => {
    const vals = refs.current.map((el) => el?.value ?? "");
    const al = alpha ? clamp(Number(vals[vals.length - 1]) / 100) : 1;
    let c: HSVA | null = null;
    if (format === "hex") c = parseColor(vals[0]);
    else if (format === "rgb") c = parseColor(`rgb(${vals[0]}, ${vals[1]}, ${vals[2]})`);
    else c = parseColor(`hsl(${vals[0]}, ${vals[1]}%, ${vals[2]}%)`);
    if (c && !Number.isNaN(al)) { setAll({ ...c, a: al }); commit(); }
    write();
  };

  const labels = format === "hex" ? ["Hex"] : format === "rgb" ? ["R", "G", "B"] : ["H", "S", "L"];
  const all = alpha ? [...labels, "A"] : labels;
  return (
    <motion.div key={format} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={fade} className="flex gap-1.5">
      {all.map((l, i) => (
        <label key={l} className={cn("flex min-w-0 flex-col gap-1", l === "Hex" ? "flex-[2.4]" : "flex-1")}>
          <input
            ref={(el) => { refs.current[i] = el; }}
            defaultValue=""
            aria-label={l === "A" ? t.opacityPercent : l === "Hex" ? t.hexCode : l}
            inputMode={l === "Hex" ? "text" : "numeric"}
            spellCheck={false}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); apply(); } }}
            onBlur={apply}
            className="h-8 w-full min-w-0 rounded-control border border-line-strong bg-surface px-2 text-center text-[13px] text-ink tabular outline-none transition-[border-color,box-shadow] focus:border-accent focus:ring-[3px] focus:ring-accent/20"
          />
          <span className="text-center text-[11.5px] text-muted">{l === "A" ? t.alpha : l === "Hex" ? t.hex : l}</span>
        </label>
      ))}
    </motion.div>
  );
}

/** A swatch button that opens the picker in a popover. */
export function ColorPicker({ value, onChange, label = "Colour", swatches, onSwatchesChange, alpha = true, className, labels, icons }: {
  value: string;
  onChange: (hex: string) => void;
  label?: string;
  swatches?: string[];
  onSwatchesChange?: (s: string[]) => void;
  alpha?: boolean;
  className?: string;
  /** Override any UI text. Merged over `colorPickerLabels`. */
  labels?: Partial<ColorPickerLabels>;
  /** Replace any built-in icon. Merged over `colorPickerIcons`. */
  icons?: Partial<ColorPickerIcons>;
}) {
  const l = { ...colorPickerLabels, ...labels };
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <span className="text-sm font-medium text-ink">{label}</span>
      <button
        ref={trigger}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={l.trigger(label, value)}
        onClick={() => setOpen((o) => !o)}
        className="flex h-10 w-48 items-center gap-2.5 rounded-control border border-line-strong bg-surface px-2 text-sm text-ink transition-colors hover:border-faint"
      >
        <span className="relative size-6 shrink-0 overflow-hidden rounded-[6px]" aria-hidden>
          <span className="absolute inset-0" style={checker} />
          <span className="absolute inset-0" style={{ background: value }} />
          <span className="absolute inset-0 rounded-[6px] ring-1 ring-inset ring-ink/15" />
        </span>
        <span className="tabular uppercase">{value}</span>
      </button>
      <AnchoredLayer open={open} onClose={() => setOpen(false)} anchor={trigger} placement="bottom-start" role="dialog" aria-label={label} className={cn(panelClass, "w-[304px] p-3")}>
        <ColorPickerPanel value={value} onChange={onChange} swatches={swatches} onSwatchesChange={onSwatchesChange} alpha={alpha} labels={labels} icons={icons} />
      </AnchoredLayer>
    </div>
  );
}
