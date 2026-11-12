import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, Copy, Download, RotateCcw } from "lucide-react";
import { Button } from "../../kiln/components/buttons/Button";
import { Switch } from "../../kiln/components/choice-controls/Switch";
import { cn } from "../../kiln/cn";
import { springSnappy, fade } from "../../kiln/motion";
import { useStudio } from "./context";
import { buttonFills, contrast, FIELDS, PRESETS, tokensFile, type ModeKey, type Palette, type StudioTheme } from "./tokens";

/** Cross-fade every colour for a moment while a whole palette swaps. */
function tint(run: () => void) {
  const root = document.documentElement;
  root.classList.add("k-tinting");
  run();
  window.setTimeout(() => root.classList.remove("k-tinting"), 460);
}

const RADII = [
  { v: 0, label: "Square" },
  { v: 4, label: "4" },
  { v: 8, label: "8" },
  { v: 12, label: "12" },
  { v: 999, label: "Round" },
];

export function ThemeStudio() {
  const { theme, setTheme, reset, edited } = useStudio();
  const [copied, setCopied] = useState(false);
  const active = PRESETS.find((p) => JSON.stringify(p.theme) === JSON.stringify(theme))?.id;

  const setColour = (mode: ModeKey, key: keyof Palette, value: string | undefined) =>
    setTheme({ ...theme, [mode]: { ...theme[mode], [key]: value } });

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(tokensFile(theme));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch { /* clipboard blocked */ }
  };
  const download = () => {
    const url = URL.createObjectURL(new Blob([tokensFile(theme)], { type: "text/css" }));
    const a = Object.assign(document.createElement("a"), { href: url, download: "tokens.css" });
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-12">
      <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-xl space-y-2">
          <h1 className="text-[22px] font-semibold tracking-[-0.01em]">Theme studio</h1>
          <p className="text-[15px] text-ink">
            Pick the colours for light and dark mode. Every component on every page changes as you go, and the result is a new{" "}
            <code className="rounded bg-raised px-1.5 py-0.5 font-mono text-[13px]">src/kiln/tokens.css</code> to drop into any project.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={copy} leading={copied ? <Check /> : <Copy />}>
            {copied ? "Copied" : "Copy tokens.css"}
          </Button>
          <Button variant="secondary" onClick={download} leading={<Download />}>Download</Button>
          <AnimatePresence initial={false}>
            {edited && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={springSnappy}>
                <Button variant="ghost" onClick={() => tint(reset)} leading={<RotateCcw />}>Reset</Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      <section aria-labelledby="presets" className="space-y-4">
        <h2 id="presets" className="text-base font-semibold">Start from a preset</h2>
        <div role="radiogroup" aria-labelledby="presets" className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
          {PRESETS.map((p) => {
            const on = active === p.id;
            return (
              <motion.button
                key={p.id}
                type="button"
                role="radio"
                aria-checked={on}
                whileTap={{ scale: 0.98 }}
                onClick={() => tint(() => setTheme(p.theme))}
                className="group relative rounded-card p-3 text-left"
              >
                <motion.span aria-hidden initial={false} animate={{ opacity: on ? 1 : 0 }} transition={fade}
                    className="pointer-events-none absolute inset-0 z-10 border-2 border-accent"
                    style={{ borderRadius: 14 }}
                  />
                <span className="relative flex h-16 overflow-hidden rounded-[10px]">
                  <Swatches p={p.theme.light} />
                  <Swatches p={p.theme.dark} />
                </span>
                <span className="relative mt-2.5 block text-sm font-medium">{p.name}</span>
              </motion.button>
            );
          })}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <ModePanel mode="light" theme={theme} onChange={setColour} />
        <ModePanel mode="dark" theme={theme} onChange={setColour} />
      </div>

      <section aria-labelledby="radius" className="space-y-4">
        <h2 id="radius" className="text-base font-semibold">Corner radius</h2>
        <div role="radiogroup" aria-labelledby="radius" className="inline-flex flex-wrap rounded-full bg-raised p-1">
          {RADII.map((r) => {
            const on = theme.radius === r.v;
            return (
              <button
                key={r.v}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => setTheme({ ...theme, radius: r.v })}
                className={cn("relative h-9 min-w-14 rounded-full px-4 text-[13px] font-medium transition-colors", on ? "text-ink" : "text-muted hover:text-ink")}
              >
                <motion.span aria-hidden initial={false} animate={{ opacity: on ? 1 : 0 }} transition={fade} className="pointer-events-none absolute inset-0 bg-elevated" style={{ borderRadius: 999 }} />
                <span className="relative z-[1]">{r.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="preview" className="space-y-4">
        <h2 id="preview" className="text-base font-semibold">Both modes, side by side</h2>
        <div className="grid gap-4 lg:grid-cols-2">
          <Preview mode="light" />
          <Preview mode="dark" />
        </div>
      </section>
    </div>
  );
}

function Swatches({ p }: { p: Palette }) {
  return (
    <span className="flex flex-1">
      <span className="flex-[2]" style={{ background: p.ground }} />
      <span className="flex-[2]" style={{ background: p.surface }} />
      <span className="flex-[2]" style={{ background: p.accent }} />
      <span className="flex-1" style={{ background: p.ink }} />
    </span>
  );
}

function ModePanel({ mode, theme, onChange }: { mode: ModeKey; theme: StudioTheme; onChange: (m: ModeKey, k: keyof Palette, v: string | undefined) => void }) {
  const p = theme[mode];
  const ratio = contrast(p.ink, p.surface);
  const accentRatio = contrast(p.accent, p.surface);
  return (
    <section aria-labelledby={`mode-${mode}`} className="rounded-card bg-raised p-5 sm:p-6">
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <h2 id={`mode-${mode}`} className="text-base font-semibold">{mode === "light" ? "Light mode" : "Dark mode"}</h2>
        <p className="text-xs text-muted tabular">
          Text <Ratio r={ratio} min={7} /> · Accent <Ratio r={accentRatio} min={3} />
        </p>
      </div>
      <div className="grid gap-x-6 gap-y-1 sm:grid-cols-2">
        {FIELDS.map((f) => (
          <ColourField key={f.key} id={`${mode}-${f.key}`} label={f.label} value={p[f.key] ?? ""} onChange={(v) => onChange(mode, f.key, v)} />
        ))}
      </div>
      <ButtonFields mode={mode} p={p} onChange={onChange} />
    </section>
  );
}

/** Button fills: derived from Accent and Negative unless the person sets their own. */
function ButtonFields({ mode, p, onChange }: { mode: ModeKey; p: Palette; onChange: (m: ModeKey, k: keyof Palette, v: string | undefined) => void }) {
  const derived = buttonFills({ ...p, button: undefined, dangerButton: undefined }, mode);
  const rows: { key: "button" | "dangerButton"; label: string }[] = [
    { key: "button", label: "Button" },
    { key: "dangerButton", label: "Danger" },
  ];
  return (
    <div className="mt-5">
      <h3 className="mb-1 text-sm font-semibold">Buttons</h3>
      <p className="mb-2 text-xs text-muted">Worked out from Accent and Negative so white text stays readable. Set a colour to use your own.</p>
      <div className="grid gap-x-6 gap-y-1 sm:grid-cols-2">
        {rows.map((r) => (
          <div key={r.key} className="flex flex-col">
            <ColourField id={`${mode}-${r.key}`} label={r.label} value={p[r.key] ?? derived[r.key]} onChange={(v) => onChange(mode, r.key, v)} />
            <motion.button
              type="button"
              initial={false}
              animate={{ opacity: p[r.key] ? 1 : 0 }}
              transition={{ duration: 0.2 }}
              tabIndex={p[r.key] ? 0 : -1}
              aria-hidden={!p[r.key]}
              onClick={() => onChange(mode, r.key, undefined)}
              className="-mt-1 mb-1 self-start pl-11 text-xs text-accent underline-offset-4 hover:underline"
            >
              Back to automatic
            </motion.button>
          </div>
        ))}
      </div>
    </div>
  );
}

function Ratio({ r, min }: { r: number; min: number }) {
  return <span className={r >= min ? "text-positive" : "text-negative"}>{r.toFixed(1)}:1</span>;
}

function ColourField({ id, label, value, onChange }: { id: string; label: string; value: string; onChange: (v: string) => void }) {
  const [draft, setDraft] = useState<string | null>(null);
  const commit = (v: string) => {
    const hex = v.startsWith("#") ? v : `#${v}`;
    if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(hex)) onChange(hex.toLowerCase());
    setDraft(null);
  };
  return (
    <div className="flex h-12 items-center gap-3">
      <label className="relative size-8 shrink-0 cursor-pointer overflow-hidden rounded-full ring-1 ring-line-strong ring-inset" style={{ background: value }}>
        <span className="sr-only">{label} colour</span>
        <input type="color" value={value.length === 4 ? value : value.slice(0, 7)} onChange={(e) => onChange(e.target.value)} className="absolute inset-0 cursor-pointer opacity-0" />
      </label>
      <label htmlFor={id} className="flex-1 text-sm">{label}</label>
      <input
        id={id}
        value={draft ?? value}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={(e) => commit(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && commit((e.target as HTMLInputElement).value)}
        spellCheck={false}
        className="h-8 w-24 rounded-control border border-line-strong bg-surface px-2 text-[13px] tabular text-ink outline-none transition-colors focus:border-accent"
      />
    </div>
  );
}

function Preview({ mode }: { mode: ModeKey }) {
  const [on, setOn] = useState(mode === "dark");
  return (
    <div className={cn(mode, "rounded-card bg-ground p-3 text-ink")}>
      <div className="space-y-5 rounded-sheet border border-line bg-surface p-5">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="font-semibold">Millennium Falcon repairs</p>
            <p className="text-[13px] text-muted">Invoice MF-1977 · Han Solo · due 4 May</p>
          </div>
          <span className="shrink-0 rounded-full bg-warning-soft px-2.5 py-0.5 text-xs font-medium text-warning">Overdue</span>
        </div>
        <div className="flex items-baseline justify-between rounded-card bg-raised px-4 py-3">
          <span className="text-[13px] text-muted">Hyperdrive motivator, parts and labour</span>
          <span className="text-2xl tabular">€4,280.00</span>
        </div>
        <Switch checked={on} onCheckedChange={setOn} label="Remind him before Jabba does" description="Sent three days before the due date." labelFirst />
        <div className="flex flex-wrap gap-2">
          <Button size="sm">Mark as paid</Button>
          <Button size="sm" variant="secondary">Download PDF</Button>
          <Button size="sm" variant="danger">Write it off</Button>
        </div>
      </div>
    </div>
  );
}
