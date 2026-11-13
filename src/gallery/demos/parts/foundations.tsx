import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, type Transition } from "motion/react";
import { Archive, Check, FilePlus2, Moon, Play, Search, Settings, UserPlus } from "lucide-react";
import { Stage, Variant, Btn } from "../../ui";
import { Button } from "../../../kiln/components/buttons/Button";
import { ThemeSwitcher, ThemeToggle } from "../../../kiln/components/primitives/ThemeToggle";
import { ScrollArea } from "../../../kiln/components/primitives/ScrollArea";
import { CommandPalette, type CommandItem } from "../../../kiln/components/menus/CommandPalette";
import { springBouncy, springFirm, springSnappy, springSoft, easeOut } from "../../../kiln/motion";
import { useTheme } from "../../../kiln/theme";
import { ColorwayPicker } from "../../../kiln/components/primitives/ColorwayPicker";
import { Colorway } from "../../../kiln/components/primitives/Colorway";
import type { ColorwayTheme } from "../../../kiln/colorway";
import { Badge } from "../../../kiln/components/status/Badge";
import { Slider } from "../../../kiln/components/choice-controls/Slider";

const TOKENS: { name: string; cls: string; note: string }[] = [
  { name: "ground", cls: "bg-ground", note: "Frame" },
  { name: "surface", cls: "bg-surface", note: "Sheets, cards" },
  { name: "raised", cls: "bg-raised", note: "Wells, hovers" },
  { name: "active", cls: "bg-active", note: "Pressed" },
  { name: "line", cls: "bg-line", note: "Edges" },
  { name: "line-strong", cls: "bg-line-strong", note: "Control borders" },
  { name: "ink", cls: "bg-ink", note: "Text" },
  { name: "muted", cls: "bg-muted", note: "Secondary text" },
  { name: "accent", cls: "bg-accent", note: "Actions" },
  { name: "accent-soft", cls: "bg-accent-soft", note: "Selected tint" },
  { name: "positive", cls: "bg-positive", note: "Success" },
  { name: "negative", cls: "bg-negative", note: "Errors" },
  { name: "warning", cls: "bg-warning", note: "Caution" },
  { name: "info", cls: "bg-info", note: "Information" },
];

function useComputed(varName: string) {
  const { resolved } = useTheme();
  const [v, setV] = useState("");
  useEffect(() => {
    const read = () => setV(getComputedStyle(document.documentElement).getPropertyValue(varName).trim());
    read();
    const mo = new MutationObserver(read);
    mo.observe(document.head, { childList: true, subtree: true, characterData: true });
    return () => mo.disconnect();
  }, [varName, resolved]);
  return v;
}

function TokenSwatch({ t }: { t: (typeof TOKENS)[number] }) {
  const value = useComputed(`--k-${t.name}`);
  const [copied, setCopied] = useState(false);
  return (
    <motion.button
      type="button"
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.97 }}
      transition={springSnappy}
      onClick={() => {
        navigator.clipboard?.writeText(`var(--k-${t.name})`).catch(() => {});
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1200);
      }}
      className="group flex flex-col gap-2 text-left"
      aria-label={`Copy var(--k-${t.name})`}
    >
      <span className={`relative block h-16 w-full rounded-card ring-1 ring-line ring-inset ${t.cls}`}>
        <AnimatePresence>
          {copied && (
            <motion.span
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={springSnappy}
              className="absolute inset-0 grid place-items-center"
            >
              <span className="grid size-7 place-items-center rounded-full bg-surface text-ink"><Check className="size-4" /></span>
            </motion.span>
          )}
        </AnimatePresence>
      </span>
      <span className="text-[13px] font-medium">{t.name}</span>
      <span className="-mt-2 text-xs text-muted tabular">{t.note} · {value}</span>
    </motion.button>
  );
}

export function Tokens() {
  return (
    <Stage align="start" className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-4 xl:grid-cols-7">
      {TOKENS.map((t) => <TokenSwatch key={t.name} t={t} />)}
    </Stage>
  );
}

export function Type() {
  const rows = [
    { size: "text-[44px] leading-[1.02] tracking-[-0.03em] font-semibold", label: "Display · 44 / 600", text: "Roads? Where we’re going…" },
    { size: "text-[22px] font-semibold tracking-[-0.01em]", label: "Title · 22 / 600", text: "Flux capacitor settings" },
    { size: "text-base font-semibold", label: "Section · 16 / 600", text: "Time circuits" },
    { size: "text-sm", label: "Body · 14 / 400", text: "Set the destination time, bring the DeLorean to 88 miles per hour, and keep 1.21 gigawatts on hand for the return trip." },
    { size: "text-xs text-muted", label: "Small · 12 / 400", text: "Last changed by Emmett Brown, 5 November 1955" },
  ];
  return (
    <Stage align="start" className="flex-col gap-6">
      {rows.map((r) => (
        <div key={r.label} className="grid w-full gap-1 sm:grid-cols-[180px_1fr] sm:items-baseline sm:gap-6">
          <span className="text-xs text-muted">{r.label}</span>
          <span className={r.size}>{r.text}</span>
        </div>
      ))}
    </Stage>
  );
}

const PRESETS: { name: string; t: Transition; use: string }[] = [
  { name: "springSoft (= spring)", t: springSoft, use: "The house spring. Almost everything." },
  { name: "springFirm", t: springFirm, use: "Stops at an edge: thumbs, rings, drawers" },
  { name: "springSnappy", t: springSnappy, use: "Tiny marks: ticks, chevrons, icon swaps" },
  { name: "springBouncy", t: springBouncy, use: "Rare rewards: a rating star" },
  { name: "easeOut tween", t: { duration: 0.5, ease: easeOut }, use: "Opacity and colour" },
];

export function MotionPresets() {
  const [right, setRight] = useState(false);
  const track = useRef<HTMLDivElement>(null);
  const [travel, setTravel] = useState(0);
  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setTravel(el.clientWidth - 40));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return (
    <Stage align="start" className="flex-col gap-5">
      <Button size="sm" variant="secondary" leading={<Play />} onClick={() => setRight((r) => !r)}>
        Play all
      </Button>
      <div className="w-full space-y-4">
        {PRESETS.map((p, i) => (
          <div key={p.name} className="grid gap-2 sm:grid-cols-[200px_1fr] sm:items-center sm:gap-6">
            <div>
              <div className="text-[13px] font-medium">{p.name}</div>
              <div className="text-xs text-muted">{p.use}</div>
            </div>
            <div ref={i === 0 ? track : undefined} className="relative h-10 rounded-full bg-surface">
              <motion.div
                className="absolute left-1 top-1 size-8 rounded-full bg-accent"
                initial={false}
                animate={{ x: right ? travel : 0 }}
                transition={p.t}
              />
            </div>
          </div>
        ))}
      </div>
    </Stage>
  );
}

export function ThemeDemo() {
  return (
    <Stage className="gap-10">
      <Variant label="Icon toggle"><ThemeToggle className="bg-surface" /></Variant>
      <Variant label="Three-way switch"><ThemeSwitcher /></Variant>
    </Stage>
  );
}

const CHANGES = [
  ["25 Mar", "The Ring goes into the fire. Sauron offline."],
  ["15 Mar", "Battle of the Pelennor Fields"],
  ["13 Mar", "Frodo taken at Cirith Ungol"],
  ["4 Mar", "Rohan rides out of Helm’s Deep"],
  ["26 Feb", "The Fellowship breaks at Amon Hen"],
  ["15 Jan", "Gandalf falls with the Balrog"],
  ["25 Dec", "The Fellowship leaves Rivendell"],
  ["25 Oct", "The Council of Elrond"],
  ["20 Oct", "Frodo reaches the Ford of Bruinen"],
  ["6 Oct", "Weathertop, a bad night"],
  ["29 Sep", "Supper at the Prancing Pony"],
  ["23 Sep", "Frodo leaves Bag End"],
];

export function ScrollDemo() {
  return (
    <Stage className="gap-8">
      <Variant label="Scroll area · the thumb appears while scrolling" className="w-full max-w-sm">
        <ScrollArea className="h-64 w-full rounded-card bg-surface" viewportClassName="p-4">
          <ol className="space-y-1">
            {CHANGES.map(([d, t]) => (
              <li key={t} className="flex gap-4 rounded-control px-2 py-2 transition-colors hover:bg-raised">
                <span className="w-14 shrink-0 text-xs text-muted tabular">{d}</span>
                <span className="text-sm">{t}</span>
              </li>
            ))}
          </ol>
        </ScrollArea>
      </Variant>
      <Variant label="Native scrollbar · styled globally in kiln.css" className="w-full max-w-sm">
        <div className="h-64 w-full overflow-y-auto rounded-card bg-surface p-4">
          {CHANGES.map(([d, t]) => (
            <p key={t} className="py-2 text-sm"><span className="mr-3 text-xs text-muted tabular">{d}</span>{t}</p>
          ))}
        </div>
      </Variant>
    </Stage>
  );
}

export function PaletteDemo() {
  const [open, setOpen] = useState(false);
  const [last, setLast] = useState<string | null>(null);
  const items: CommandItem[] = [
    { id: "new", label: "Plot a course for Alderaan", group: "Create", icon: <FilePlus2 />, hint: "N", onSelect: () => setLast("Plot a course for Alderaan") },
    { id: "invite", label: "Invite a Wookiee co-pilot", group: "Create", icon: <UserPlus />, onSelect: () => setLast("Invite a Wookiee co-pilot") },
    { id: "search", label: "Search for these droids", group: "Go to", icon: <Search />, keywords: "not the droids you are looking for", onSelect: () => setLast("Search for these droids") },
    { id: "settings", label: "Hyperdrive settings", group: "Go to", icon: <Settings />, hint: "G S", onSelect: () => setLast("Hyperdrive settings") },
    { id: "archive", label: "Archive the Death Star plans", group: "Actions", icon: <Archive />, onSelect: () => setLast("Archive the Death Star plans") },
    { id: "dark", label: "Switch to the dark side", group: "Actions", icon: <Moon />, keywords: "theme light dark mode", onSelect: () => setLast("Switch to the dark side") },
  ];
  return (
    <Stage className="flex-col">
      <Button variant="outline" leading={<Search />} onClick={() => setOpen(true)}>Open command palette</Button>
      <p className="h-5 text-[13px] text-muted">
        <AnimatePresence mode="wait" initial={false}>
          <motion.span key={last ?? "none"} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.18 }} className="inline-block">
            {last ? <>Ran “{last}”</> : <>The gallery’s own search uses it too: press Ctrl K or ⌘K.</>}
          </motion.span>
        </AnimatePresence>
      </p>
      <CommandPalette open={open} onOpenChange={setOpen} items={items} placeholder="Search the galaxy…" />
    </Stage>
  );
}

/* Colorways from films: each is a ground, an ink and an accent per mode; Kiln works out the rest. */
const FILM_COLORWAYS: ColorwayTheme[] = [
  { id: "tatooine", name: "Tatooine", radius: 10,
    light: { ground: "#efe3cf", ink: "#2b1d10", accent: "#b5541b" },
    dark: { ground: "#1a130c", ink: "#f1e4cf", accent: "#f0a35a" } },
  { id: "ecto", name: "Ecto-1", radius: 6,
    light: { ground: "#eef4ea", ink: "#13200f", accent: "#3f8f1e" },
    dark: { ground: "#0c120a", ink: "#e5f0dd", accent: "#8fe05c" } },
  { id: "nostromo", name: "Nostromo", radius: 2,
    light: { ground: "#eef1f0", ink: "#0f1514", accent: "#1d6e5f" },
    dark: { ground: "#070b0a", ink: "#cfe8de", accent: "#5fe0b5" } },
  { id: "delorean", name: "DeLorean", radius: 999,
    light: { ground: "#f1f2f4", ink: "#15171c", accent: "#2457d6" },
    dark: { ground: "#0c0e12", ink: "#e9ecf2", accent: "#ff8a3d" } },
];

function ColorwayCard() {
  return (
    <div className="w-full max-w-sm space-y-4 rounded-card border border-line bg-surface p-5">
      <div className="flex items-center justify-between">
        <p className="font-semibold">Flux capacitor</p>
        <Badge tone="positive" dot>Fluxing</Badge>
      </div>
      <Slider label="Gigawatts" min={0} max={2.21} step={0.01} defaultValue={[1.21]} format={(n) => n.toFixed(2)} />
      <div className="flex gap-2">
        <Btn>Hit 88 mph</Btn>
        <Btn variant="secondary">Park at the mall</Btn>
      </div>
    </div>
  );
}

export function ColorwayPickerDemo() {
  const [colorway, setColorway] = useState(FILM_COLORWAYS[0].id);
  const chosen = FILM_COLORWAYS.find((g) => g.id === colorway)!;
  return (
    <Stage className="flex-col items-stretch">
      <ColorwayPicker colorways={FILM_COLORWAYS} value={colorway} onChange={setColorway} labels={{ label: "Recolour this card" }} />
      <Colorway colorway={chosen} className="grid place-items-center rounded-card p-6 transition-colors duration-300 sm:p-10">
        <ColorwayCard />
      </Colorway>
      <p className="text-sm text-muted">Given to ThemeProvider as <code className="font-mono text-ink">colorways</code>, the same picker recolours the whole page, opening the new colours from the swatch you press.</p>
    </Stage>
  );
}

export function ColorwayDemo() {
  return (
    <Stage align="start" className="grid gap-4 sm:grid-cols-2">
      <Colorway colors={{ ground: "#14532d", ink: "#ecfdf5", accent: "#86efac" }} className="rounded-card p-5">
        <p className="mb-3 text-sm text-muted">colors: ground, ink and accent</p>
        <ColorwayCard />
      </Colorway>
      <Colorway colorway={FILM_COLORWAYS[3]} mode="dark" className="rounded-card p-5">
        <p className="mb-3 text-sm text-muted">colorway=&#123;DeLorean&#125; mode="dark"</p>
        <ColorwayCard />
      </Colorway>
    </Stage>
  );
}
