import { useCallback, useMemo, useState } from "react";
import { Bot, Globe2, Keyboard, Mail, MessageSquare, Radio, Rocket, Search, Smartphone, User } from "lucide-react";
import type { Category } from "../types";
import { Stage } from "../ui";
import { Button } from "../../kiln/components/buttons/Button";
import { Avatar } from "../../kiln/components/data-display/Avatar";
import { VirtualList, type VirtualGroup } from "../../kiln/components/tables/VirtualList";
import { InfiniteFeed } from "../../kiln/components/tables/InfiniteFeed";
import { FileManager, type FMNode } from "../../kiln/components/workspace/FileManager";
import { OnboardingWizard } from "../../kiln/components/guidance/OnboardingWizard";
import { SpotlightSearch, type SpotlightItem } from "../../kiln/components/menus/SpotlightSearch";
import { NotificationPreferences, type PrefValue } from "../../kiln/components/workspace/NotificationPreferences";
import { KeyboardShortcutsSheet } from "../../kiln/components/guidance/KeyboardShortcutsSheet";
import { TextField } from "../../kiln/components/text-input/TextField";
import { RadioGroup } from "../../kiln/components/choice-controls/RadioGroup";
import { Select } from "../../kiln/components/pickers/Select";


type System = { id: string; name: string; population: number; note?: string };

function rng(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
}

const SECTORS = ["Core Worlds", "Colonies", "Inner Rim", "Expansion Region", "Mid Rim", "Outer Rim Territories", "Wild Space", "Unknown Regions"];
const ROOTS = ["Tatoo", "Alder", "Corel", "Kash", "Naboo", "Dagob", "Bespin", "Endor", "Hoth", "Yavin", "Kessel", "Mustaf", "Geono", "Jakku", "Ryloth", "Sullust", "Mon Cala", "Felucia", "Utapau", "Dantoo", "Ord Mant", "Ilum", "Lothal", "Scarif"];
const SUFFIX = ["ine", "aan", "ia", "yyk", "o", "ah", "is", "or", "on", "ar", "ell", "ari", "us", "eth"];
const NUMERALS = ["", " II", " III", " IV", " V", " VI", " VII", " Prime", " Minor"];
const NOTES = ["Imperial garrison reported in orbit.", "Rebel safe house, ask for Bail.", "Moisture farms; no droids allowed in the cantina.", "Do not land during the sandstorm season.", "Home of the best pilot in the Outer Rim."];

function makeGalaxy(): VirtualGroup<System>[] {
  const r = rng(1977);
  const per = 1250;
  const taken = new Map<string, number>();
  const unique = (n: string) => {
    const k = (taken.get(n) ?? 0) + 1;
    taken.set(n, k);
    return k === 1 ? n : `${n}-${String.fromCharCode(96 + Math.min(k, 26))}${k > 26 ? k : ""}`;
  };
  return SECTORS.map((s, si) => ({
    id: s,
    label: s,
    items: Array.from({ length: per }, (_, i) => {
      const name = unique(`${ROOTS[Math.floor(r() * ROOTS.length)]}${SUFFIX[Math.floor(r() * SUFFIX.length)]}${NUMERALS[Math.floor(r() * NUMERALS.length)]}`);
      return {
        id: `${si}-${i}`,
        name,
        population: Math.round(10 ** (3 + r() * 8)),
        note: r() < 0.18 ? NOTES[Math.floor(r() * NOTES.length)] : undefined,
      };
    }).sort((a, b) => a.name.localeCompare(b.name)),
  }));
}

const fmtPop = new Intl.NumberFormat("en-GB", { notation: "compact", maximumFractionDigits: 1 });

function VirtualDemo() {
  const galaxy = useMemo(makeGalaxy, []);
  const [picked, setPicked] = useState<string | null>(null);
  const rowHeight = useCallback((s: System) => (s.note ? 64 : 44), []);
  return (
    <Stage align="start" className="flex-col">
      <VirtualList
        label="Galactic registry, 10,000 systems"
        groups={galaxy}
        height={440}
        className="w-full"
        rowHeight={rowHeight}
        getKey={(s) => s.id}
        getLabel={(s) => s.name}
        onSelect={(s) => setPicked(s.name)}
        renderRow={(s) => (
          <div className="flex h-full items-center gap-3 px-2">
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm text-ink">{s.name}</span>
              {s.note && <span className="block truncate text-[13px] text-muted">{s.note}</span>}
            </span>
            <span className="shrink-0 text-[13px] text-muted tabular">{fmtPop.format(s.population)} beings</span>
          </div>
        )}
      />
      <p className="text-[13px] text-muted" aria-live="polite">
        {picked ? `Set course for ${picked}.` : "Scroll, or focus the list and use the arrow keys, Page Up/Down, Home and End. Enter sets a course."}
      </p>
    </Stage>
  );
}

type Post = { id: string; who: string; when: string; text: string };
const POSTERS = ["Leia Organa", "Han Solo", "Luke Skywalker", "Lando Calrissian", "Wedge Antilles", "Mon Mothma", "Admiral Ackbar", "Chewbacca"];
const LINES = [
  "Briefing moved to hangar 4. Bring your own caf.",
  "Whoever parked an X-wing across two landing pads, please move it.",
  "The shield generator on Endor is back online. Again.",
  "Reminder: the Kessel Run is not a valid route for supply drops.",
  "Lost: one astromech, blue and white, answers to ‘R2’. Very opinionated.",
  "Tauntaun stables need volunteers before the night freeze.",
  "New sabacc table in the mess. House rules on the wall.",
  "Medical frigate is taking appointments for bacta checks.",
  "Echo Base canteen is out of blue milk until Thursday.",
  "Training sims open for Gold Squadron from 06:00.",
];

function makePage(cursor: string | null): { items: Post[]; next: string | null } {
  const page = cursor ? Number(cursor) : 0;
  const r = rng(42 + page);
  const items = Array.from({ length: 8 }, (_, i) => ({
    id: `p${page}-${i}`,
    who: POSTERS[Math.floor(r() * POSTERS.length)],
    when: `${page * 8 + i + 2} min ago`,
    text: LINES[Math.floor(r() * LINES.length)],
  }));
  return { items, next: page < 5 ? String(page + 1) : null };
}

function FeedDemo() {
  const load = useCallback((cursor: string | null) => new Promise<{ items: Post[]; next: string | null }>((res) => setTimeout(() => res(makePage(cursor)), 900)), []);
  return (
    <Stage align="start" className="p-0 sm:p-0">
      <InfiniteFeed
        label="Alliance bulletin board"
        height={460}
        className="w-full"
        load={load}
        getKey={(p) => p.id}
        endText="You’ve read everything. May the Force be with you."
        renderItem={(p) => (
          <div className="flex gap-3 rounded-card bg-surface p-4">
            <Avatar name={p.who} />
            <div className="min-w-0">
              <p className="text-sm">
                <span className="font-medium text-ink">{p.who}</span> <span className="text-muted">· {p.when}</span>
              </p>
              <p className="mt-1 text-sm leading-relaxed text-ink">{p.text}</p>
            </div>
          </div>
        )}
      />
    </Stage>
  );
}

const drive: FMNode[] = [
  { id: "plans", name: "Death Star plans", kind: "folder", parent: null, modified: "0 BBY" },
  { id: "briefings", name: "Mission briefings", kind: "folder", parent: null, modified: "Yesterday" },
  { id: "droids", name: "Droid manuals", kind: "folder", parent: null, modified: "3 days ago" },
  { id: "dagobah", name: "Dagobah", kind: "folder", parent: null, modified: "Last month" },
  { id: "f1", name: "Death-Star-schematics.pdf", kind: "file", parent: "plans", size: 18_400_000, modified: "0 BBY" },
  { id: "f2", name: "thermal-exhaust-port.png", kind: "file", parent: "plans", size: 2_100_000, modified: "0 BBY" },
  { id: "f3", name: "Yavin-4-attack-run.key", kind: "file", parent: "briefings", size: 6_800_000, modified: "Yesterday" },
  { id: "f4", name: "Hoth-evacuation-plan.pdf", kind: "file", parent: "briefings", size: 1_200_000, modified: "Today" },
  { id: "f5", name: "R2-D2-maintenance.md", kind: "file", parent: "droids", size: 48_000, modified: "3 days ago" },
  { id: "f6", name: "C-3PO-etiquette-protocols.pdf", kind: "file", parent: "droids", size: 9_600_000, modified: "Last week" },
  { id: "f7", name: "Tauntaun-care.docx", kind: "file", parent: null, size: 220_000, modified: "Today" },
  { id: "f8", name: "Echo-Base-floorplan.png", kind: "file", parent: null, size: 3_400_000, modified: "Today" },
  { id: "f9", name: "Rogue-Squadron-roster.txt", kind: "file", parent: null, size: 4_000, modified: "Today" },
  { id: "f10", name: "shield-generator-config.json", kind: "file", parent: null, size: 12_000, modified: "Today" },
];

function FileManagerDemo() {
  const [last, setLast] = useState("Double-click a folder to open it; right-click for more.");
  return (
    <Stage align="start" className="flex-col">
      <FileManager initial={drive} rootName="Alliance drive" onOpenFile={(f) => setLast(`Opening ${f.name}…`)} className="w-full" />
      <p className="text-[13px] text-muted" aria-live="polite">{last}</p>
    </Stage>
  );
}

type Recruit = { name: string; callsign: string; squadron: "red" | "gold" | "rogue"; droid: string | null; [k: string]: unknown };
const squadrons = { red: "Red Squadron", gold: "Gold Squadron", rogue: "Rogue Squadron" } as const;
const droids = [
  { value: "r2", label: "R2-D2", hint: "Opinionated, very brave" },
  { value: "r5", label: "R5-D4", hint: "Has a bad motivator" },
  { value: "bb8", label: "BB-8", hint: "Rolls, does not do stairs" },
  { value: "chopper", label: "C1-10P", hint: "Chopper. Bites." },
];

function WizardDemo() {
  return (
    <Stage align="start">
      <div className="w-full max-w-xl">
        <OnboardingWizard<Recruit>
          initial={{ name: "", callsign: "", squadron: "red", droid: null }}
          finishLabel="Join the Alliance"
          onFinish={() => new Promise((r) => setTimeout(r, 900))}
          steps={[
            {
              id: "pilot",
              title: "Who’s flying?",
              description: "Your name as it will appear on the mission board.",
              validate: (v) => ({
                name: v.name.trim() ? undefined : "We need a name for the roster",
                callsign: /^[A-Za-z]+ \d{1,2}$/.test(v.callsign.trim()) ? undefined : "A word and a number, like “Red 5”",
              }),
              render: ({ values, set, errors }) => (
                <div className="grid gap-4">
                  <TextField label="Full name" autoComplete="name" value={values.name} onChange={(e) => set({ name: e.target.value })} error={errors.name} />
                  <TextField label="Call sign" placeholder="Red 5" value={values.callsign} onChange={(e) => set({ callsign: e.target.value })} error={errors.callsign} />
                </div>
              ),
            },
            {
              id: "squadron",
              title: "Pick a squadron",
              render: ({ values, set }) => (
                <RadioGroup
                  label="Squadron"
                  variant="card"
                  value={values.squadron}
                  onChange={(s) => set({ squadron: s })}
                  options={[
                    { value: "red", label: "Red Squadron", description: "X-wings. Trench runs a speciality." },
                    { value: "gold", label: "Gold Squadron", description: "Y-wings. Slow, sturdy, carries the bombs." },
                    { value: "rogue", label: "Rogue Squadron", description: "Snowspeeders on Hoth. Bring a tow cable." },
                  ]}
                />
              ),
            },
            {
              id: "droid",
              title: "Choose an astromech",
              description: "Every fighter needs one to fix things mid-flight.",
              validate: (v) => ({ droid: v.droid ? undefined : "Pick a droid before launch" }),
              render: ({ values, set, errors }) => (
                <div className="grid gap-2">
                  <Select label="Astromech" placeholder="Choose a droid" options={droids} value={values.droid} onChange={(d) => set({ droid: d })} />
                  {errors.droid && <p role="alert" className="text-[13px] text-negative">{errors.droid}</p>}
                </div>
              ),
            },
          ]}
          summary={(v, goTo) => (
            <dl className="grid gap-2 text-sm">
              {[
                ["Pilot", `${v.name} (${v.callsign})`, 0],
                ["Squadron", squadrons[v.squadron], 1],
                ["Astromech", droids.find((d) => d.value === v.droid)?.label ?? "—", 2],
              ].map(([k, val, step]) => (
                <div key={k as string} className="flex items-center justify-between gap-3 rounded-control bg-raised px-3 py-2.5">
                  <dt className="text-muted">{k as string}</dt>
                  <dd className="flex min-w-0 items-center gap-3">
                    <span className="truncate text-ink">{val as string}</span>
                    <button type="button" onClick={() => goTo(step as number)} className="shrink-0 text-[13px] text-accent underline-offset-4 hover:underline">
                      Change
                    </button>
                  </dd>
                </div>
              ))}
            </dl>
          )}
        />
      </div>
    </Stage>
  );
}

function Card({ title, lines }: { title: string; lines: [string, string][] }) {
  return (
    <div>
      <p className="text-lg font-semibold tracking-[-0.01em] text-ink">{title}</p>
      <dl className="mt-3 grid gap-2 text-sm">
        {lines.map(([k, v]) => (
          <div key={k} className="flex justify-between gap-4 rounded-control bg-elevated px-3 py-2">
            <dt className="text-muted">{k}</dt>
            <dd className="text-right text-ink">{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

const archive: SpotlightItem[] = [
  { id: "leia", title: "Leia Organa", subtitle: "General, Rebel Alliance", category: "People", icon: <User />, keywords: "princess alderaan", preview: <Card title="Leia Organa" lines={[["Rank", "General"], ["Homeworld", "Alderaan"], ["Known for", "Hiding plans in astromechs"]]} /> },
  { id: "han", title: "Han Solo", subtitle: "Captain, Millennium Falcon", category: "People", icon: <User />, keywords: "smuggler", preview: <Card title="Han Solo" lines={[["Ship", "Millennium Falcon"], ["Co-pilot", "Chewbacca"], ["Debts", "Jabba the Hutt"]]} /> },
  { id: "luke", title: "Luke Skywalker", subtitle: "Red 5", category: "People", icon: <User />, keywords: "jedi tatooine", preview: <Card title="Luke Skywalker" lines={[["Call sign", "Red 5"], ["Homeworld", "Tatooine"], ["Astromech", "R2-D2"]]} /> },
  { id: "ackbar", title: "Admiral Ackbar", subtitle: "Fleet commander", category: "People", icon: <User />, preview: <Card title="Admiral Ackbar" lines={[["Flagship", "Home One"], ["Homeworld", "Mon Cala"], ["Famous for", "Spotting traps"]]} /> },
  { id: "falcon", title: "Millennium Falcon", subtitle: "YT-1300f light freighter", category: "Ships", icon: <Rocket />, preview: <Card title="Millennium Falcon" lines={[["Class", "YT-1300f"], ["Hyperdrive", "Class 0.5"], ["Kessel Run", "Under 12 parsecs"]]} /> },
  { id: "xwing", title: "T-65 X-wing", subtitle: "Starfighter", category: "Ships", icon: <Rocket />, preview: <Card title="T-65 X-wing" lines={[["Crew", "1 pilot, 1 astromech"], ["Weapons", "4 laser cannons"], ["Squadrons", "Red, Rogue"]]} /> },
  { id: "home1", title: "Home One", subtitle: "MC80 star cruiser", category: "Ships", icon: <Rocket />, preview: <Card title="Home One" lines={[["Class", "MC80"], ["Commander", "Admiral Ackbar"], ["Battle", "Endor"]]} /> },
  { id: "yavin", title: "Yavin 4", subtitle: "Jungle moon, Gordian Reach", category: "Planets", icon: <Globe2 />, preview: <Card title="Yavin 4" lines={[["Base", "Great Temple"], ["Climate", "Humid jungle"], ["Known for", "The attack on the Death Star"]]} /> },
  { id: "hoth", title: "Hoth", subtitle: "Ice planet, Anoat sector", category: "Planets", icon: <Globe2 />, preview: <Card title="Hoth" lines={[["Base", "Echo Base"], ["Climate", "Very cold"], ["Wildlife", "Tauntauns, wampas"]]} /> },
  { id: "endor", title: "Endor", subtitle: "Forest moon", category: "Planets", icon: <Globe2 />, preview: <Card title="Endor" lines={[["Natives", "Ewoks"], ["Installation", "Shield generator"], ["Terrain", "Forest"]]} /> },
  { id: "r2", title: "R2-D2", subtitle: "Astromech droid", category: "Droids", icon: <Bot />, preview: <Card title="R2-D2" lines={[["Model", "R2 series"], ["Counterpart", "C-3PO"], ["Carried", "The Death Star plans"]]} /> },
  { id: "3po", title: "C-3PO", subtitle: "Protocol droid", category: "Droids", icon: <Bot />, preview: <Card title="C-3PO" lines={[["Model", "3PO series"], ["Languages", "Over six million"], ["Odds", "Always quoted"]]} /> },
];

function SpotlightDemo() {
  const [open, setOpen] = useState(false);
  const [last, setLast] = useState<string | null>(null);
  return (
    <Stage className="flex-col">
      <Button leading={<Search />} onClick={() => setOpen(true)}>Search the archives</Button>
      <p className="text-[13px] text-muted" aria-live="polite">{last ? `Opened ${last}` : "Try “ho”, or use Tab to switch categories."}</p>
      <SpotlightSearch open={open} onOpenChange={setOpen} items={archive} categories={["People", "Ships", "Planets", "Droids"]} onPick={(i) => setLast(i.title)} placeholder="Search people, ships, planets and droids" />
    </Stage>
  );
}

function PrefsDemo() {
  const [v, setV] = useState<PrefValue>({
    briefing: { email: true, push: true, comlink: true },
    cancelled: { email: true, push: true },
    probe: { push: true, comlink: true, holonet: true },
    shield: { email: true },
    mention: { push: true, holonet: true },
    dm: { push: true },
  });
  return (
    <Stage align="start">
      <NotificationPreferences
        value={v}
        onChange={setV}
        channels={[
          { id: "email", label: "Email", icon: <Mail /> },
          { id: "push", label: "Push", icon: <Smartphone /> },
          { id: "comlink", label: "Comlink", icon: <Radio /> },
          { id: "holonet", label: "Holonet", icon: <MessageSquare /> },
        ]}
        groups={[
          { label: "Missions", events: [{ id: "briefing", label: "New mission briefing" }, { id: "cancelled", label: "Mission called off", description: "Including “it’s a trap”" }] },
          { label: "Base", events: [{ id: "probe", label: "Imperial probe droid detected" }, { id: "shield", label: "Shield generator status" }] },
          { label: "Crew", events: [{ id: "mention", label: "Someone mentions you" }, { id: "dm", label: "Direct messages" }] },
        ]}
      />
    </Stage>
  );
}

function ShortcutsDemo() {
  const [open, setOpen] = useState(false);
  return (
    <Stage className="flex-col">
      <Button variant="secondary" leading={<Keyboard />} onClick={() => setOpen(true)}>Keyboard shortcuts</Button>
      <p className="text-[13px] text-muted">Or press <kbd className="rounded-[4px] bg-surface px-1.5 font-sans text-xs text-ink">?</kbd> anywhere on this page.</p>
      <KeyboardShortcutsSheet
        open={open}
        onOpenChange={setOpen}
        groups={[
          { title: "General", shortcuts: [{ keys: ["Ctrl", "K"], label: "Search the archives" }, { keys: ["?"], label: "Show this list" }, { keys: ["Esc"], label: "Close a window" }] },
          { title: "Go to", shortcuts: [{ keys: ["G", "B"], label: "Briefing room", sequence: true }, { keys: ["G", "H"], label: "Hangar", sequence: true }, { keys: ["G", "M"], label: "Medical bay", sequence: true }] },
          { title: "Cockpit", shortcuts: [{ keys: ["Ctrl", "J"], label: "Jump to hyperspace" }, { keys: ["S"], label: "Raise deflector shields" }, { keys: ["Shift", "F"], label: "Lock S-foils in attack position" }, { keys: ["T"], label: "Target the exhaust port" }] },
          { title: "Comms", shortcuts: [{ keys: ["R"], label: "Reply to Red Leader" }, { keys: ["Ctrl", "Enter"], label: "Send transmission" }, { keys: ["M"], label: "Mute C-3PO" }] },
        ]}
      />
    </Stage>
  );
}

export const category: Category = {
  id: "apps",
  name: "App patterns",
  summary: "Bigger pieces of working apps: long lists, feeds, files, setup, search and settings.",
  entries: [
    { id: "virtual-list", name: "Virtual list", summary: "10,000 rows of mixed heights with sticky group headers; only what is near the viewport is drawn.", files: ["src/kiln/components/tables/VirtualList.tsx", "src/kiln/cn.ts"], Demo: VirtualDemo },
    { id: "infinite-feed", name: "Infinite feed", summary: "Loads the next page as you near the end, with skeleton rows and no jump in scroll position.", files: ["src/kiln/components/tables/InfiniteFeed.tsx", "src/kiln/components/status/Skeleton.tsx", "src/kiln/cn.ts", "src/kiln/components/shared/useLoop.ts", "src/kiln/motion.ts"], Demo: FeedDemo },
    { id: "file-manager", name: "File manager", summary: "Grid or list, breadcrumbs, Shift and Ctrl/Cmd selection, drag onto folders, rename in place, a context menu.", files: ["src/kiln/components/workspace/FileManager.tsx", "src/kiln/components/menus/DropdownMenu.tsx", "src/kiln/components/shared/Anchored.tsx", "src/kiln/components/buttons/SegmentedControl.tsx", "src/kiln/controllable.ts", "src/kiln/motion.ts", "src/kiln/cn.ts"], Demo: FileManagerDemo },
    { id: "onboarding-wizard", name: "Onboarding wizard", summary: "Steps that check themselves, Back that keeps your answers, and a summary with links back.", files: ["src/kiln/components/guidance/OnboardingWizard.tsx", "src/kiln/components/buttons/Button.tsx", "src/kiln/motion.ts", "src/kiln/cn.ts"], Demo: WizardDemo },
    { id: "spotlight-search", name: "Spotlight search", summary: "A search window with categories, recent searches and a live preview of the highlighted result.", files: ["src/kiln/components/menus/SpotlightSearch.tsx", "src/kiln/components/shared/useOverlay.ts", "src/kiln/components/pickers/Combobox.tsx", "src/kiln/controllable.ts", "src/kiln/components/shared/Anchored.tsx", "src/kiln/motion.ts", "src/kiln/cn.ts", "src/kiln/components/shared/Field.tsx"], Demo: SpotlightDemo },
    { id: "notification-preferences", name: "Notification preferences", summary: "Events against channels, with select-all for each row and column; cards on a phone.", files: ["src/kiln/components/workspace/NotificationPreferences.tsx", "src/kiln/motion.ts", "src/kiln/cn.ts"], Demo: PrefsDemo },
    { id: "keyboard-shortcuts", name: "Keyboard shortcuts", summary: "Press ? for a filterable, grouped list of every shortcut.", files: ["src/kiln/components/guidance/KeyboardShortcutsSheet.tsx", "src/kiln/components/overlays/Dialog.tsx", "src/kiln/components/shared/useOverlay.ts", "src/kiln/motion.ts", "src/kiln/cn.ts"], Demo: ShortcutsDemo },
  ],
};
