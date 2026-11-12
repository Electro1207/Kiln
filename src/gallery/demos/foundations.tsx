import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, type Transition } from "motion/react";
import { Archive, Check, FilePlus2, Moon, Play, Search, Settings, UserPlus } from "lucide-react";
import type { Category } from "../types";
import { Stage, Variant } from "../ui";
import { Button } from "../../kiln/components/buttons/Button";
import { ThemeSwitcher, ThemeToggle } from "../../kiln/components/primitives/ThemeToggle";
import { ScrollArea } from "../../kiln/components/primitives/ScrollArea";
import { CommandPalette, type CommandItem } from "../../kiln/components/menus/CommandPalette";
import { springBouncy, springFirm, springSnappy, springSoft, easeOut } from "../../kiln/motion";
import { useTheme } from "../../kiln/theme";

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

function Tokens() {
  return (
    <Stage align="start" className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-4 xl:grid-cols-7">
      {TOKENS.map((t) => <TokenSwatch key={t.name} t={t} />)}
    </Stage>
  );
}

function Type() {
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

function MotionPresets() {
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

function ThemeDemo() {
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

function ScrollDemo() {
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

function PaletteDemo() {
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

export const category: Category = {
  id: "foundations",
  name: "Foundations",
  summary: "The tokens, type and motion every component is built from, and the pieces that run the whole page.",
  entries: [
    { id: "colour-tokens", name: "Colour tokens", summary: "Every colour in the library; click one to copy its variable. Edit them in tokens.css or the Theme studio.", files: ["src/kiln/tokens.css", "src/kiln/kiln.css"], Demo: Tokens },
    { id: "type-scale", name: "Type scale", summary: "IBM Plex Sans in five sizes; most screens need only three.", files: ["src/kiln/kiln.css"], Demo: Type },
    { id: "motion-presets", name: "Motion presets", summary: "The springs every component shares, so the whole library moves with one voice.", files: ["src/kiln/motion.ts"], Demo: MotionPresets },
    { id: "theme-toggle", name: "Theme toggle", summary: "Switches light and dark; the new theme opens as a circle from the button.", files: ["src/kiln/components/primitives/ThemeToggle.tsx", "src/kiln/theme.tsx", "src/kiln/motion.ts", "src/kiln/cn.ts"], Demo: ThemeDemo },
    { id: "scroll-area", name: "Scroll area & scrollbar", summary: "An overlay scrollbar that fades in while you scroll, plus thin token-coloured native scrollbars everywhere.", files: ["src/kiln/components/primitives/ScrollArea.tsx", "src/kiln/motion.ts", "src/kiln/cn.ts"], Demo: ScrollDemo },
    { id: "command-palette", name: "Command palette", summary: "A keyboard-first launcher with grouped results; the highlight fades between rows.", files: ["src/kiln/components/menus/CommandPalette.tsx", "src/kiln/motion.ts", "src/kiln/cn.ts"], Demo: PaletteDemo },
  ],
};
