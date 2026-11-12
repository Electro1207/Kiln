import { useRef, useState } from "react";
import {
  Archive, BarChart3, Copy, FileText, FolderInput, Home, Inbox, Link2, Pencil, Settings, Star, Trash2, Users, MoreHorizontal, FileImage,
} from "lucide-react";
import { Stage, Variant, Btn } from "../../ui";
import { Button } from "../../../kiln/components/buttons/Button";
import { Navbar } from "../../../kiln/components/menus/Navbar";
import { ThemeToggle } from "../../../kiln/components/primitives/ThemeToggle";
import { Tabs } from "../../../kiln/components/wayfinding/Tabs";
import { Breadcrumbs } from "../../../kiln/components/wayfinding/Breadcrumbs";
import { Pagination, type PaginationLabels } from "../../../kiln/components/wayfinding/Pagination";
import { Stepper } from "../../../kiln/components/wayfinding/Stepper";
import { DropdownMenu, type MenuEntry } from "../../../kiln/components/menus/DropdownMenu";
import { ContextMenu } from "../../../kiln/components/menus/ContextMenu";
import { Accordion } from "../../../kiln/components/wayfinding/Accordion";
import { SidebarNav } from "../../../kiln/components/menus/SidebarNav";
import { DocsNav, type DocsNavSection } from "../../../kiln/components/menus/DocsNav";
import { BackToTop } from "../../../kiln/components/wayfinding/BackToTop";


function Mark({ name = "Spook Central" }: { name?: string }) {
  return (
    <span className="flex items-center gap-2 text-[15px] font-semibold tracking-[-0.01em] text-ink">
      <svg viewBox="0 0 24 24" className="size-6" aria-hidden>
        <rect width="24" height="24" rx="6" fill="var(--k-accent)" />
        <path d="M6 16.5c2.2-5.6 9.8-5.6 12 0" fill="none" stroke="var(--k-on-accent)" strokeWidth="2" strokeLinecap="round" />
        <circle cx="12" cy="8.5" r="2" fill="var(--k-on-accent)" />
      </svg>
      {name}
    </span>
  );
}

const navLinks = [
  { label: "Services", href: "#services" },
  { label: "Containment", href: "#containment" },
  { label: "Crew", href: "#crew" },
  { label: "Rates", href: "#rates" },
];

export function NavbarDemo() {
  const [current, setCurrent] = useState("#services");
  const bar = (
    <Navbar
      contained
      brand={<Mark />}
      links={navLinks}
      current={current}
      onNavigate={setCurrent}
      action={<Btn size="sm">Who you gonna call?</Btn>}
      utility={<ThemeToggle />}
    />
  );
  return (
    <Stage align="start" className="flex-col">
      <Variant label="Desktop" className="w-full">
        <div className="w-full overflow-hidden rounded-card border border-line">{bar}</div>
      </Variant>
      <Variant label="Phone width — open the menu" className="w-full">
        <div className="relative h-[380px] w-full max-w-[390px] overflow-hidden rounded-card border border-line bg-surface">
          {bar}
          <div className="space-y-3 px-5 pt-6">
            <p className="text-[22px] font-semibold leading-tight tracking-[-0.01em]">We’re ready to believe you</p>
            <p className="text-sm text-muted">Hauntings, possessions and full-roaming vapours anywhere in Manhattan. Our crew answers 24 hours a day from the old firehouse on North Moore Street.</p>
            <div className="mt-2 flex aspect-[7/4] w-full flex-col justify-end gap-1 rounded-control bg-raised p-4">
              <span className="text-[13px] text-muted">Ecto-1, en route</span>
              <span className="text-3xl font-semibold tracking-[-0.03em] text-ink tabular">11 min</span>
              <span className="text-[13px] text-ink">To 55 Central Park West</span>
            </div>
          </div>
        </div>
      </Variant>
    </Stage>
  );
}

export function TabsDemo() {
  const row = (k: string, v: string) => (
    <div className="flex items-baseline justify-between gap-4 py-2 text-sm">
      <span className="text-muted">{k}</span>
      <span className="text-ink tabular">{v}</span>
    </div>
  );
  return (
    <Stage align="start" className="flex-col">
      <Variant label="Underline" className="w-full max-w-lg">
        <Tabs
          label="Ship record"
          items={[
            { id: "overview", label: "Overview", content: <div>{row("Ship", "Millennium Falcon, YT-1300f")}{row("Owner", "Han Solo")}{row("Co-pilot", "Chewbacca")}{row("Hyperdrive", "Class 0.5")}</div> },
            { id: "log", label: "Log", count: 4, content: <ul className="space-y-2 text-sm text-ink"><li>Left Mos Eisley in a hurry, docking bay 94</li><li>Pulled into the Death Star by a tractor beam</li><li>Hid from Star Destroyers on an asteroid</li><li>Hyperdrive failed again near Hoth</li></ul> },
            { id: "debts", label: "Debts", content: <div>{row("Owed to", "Jabba the Hutt")}{row("Cargo dumped", "Kessel spice")}{row("Outstanding", "17,000 credits")}</div> },
            { id: "carbonite", label: "Carbonite", disabled: true, content: null },
          ]}
        />
      </Variant>
      <Variant label="Pill">
        <Tabs
          variant="pill"
          label="Captures"
          items={[
            { id: "d", label: "Day", content: <p className="text-sm text-ink">7 ghosts trapped today, including one Class 5 full-roaming vapour.</p> },
            { id: "w", label: "Week", content: <p className="text-sm text-ink">31 ghosts trapped this week. The Sedgewick Hotel called twice.</p> },
            { id: "m", label: "Month", content: <p className="text-sm text-ink">118 ghosts this month. The containment unit is nearly full.</p> },
          ]}
        />
      </Variant>
      <Variant label="Sizes">
        {(["sm", "lg"] as const).map((sz) => (
          <Tabs key={sz} size={sz} variant="pill" label={`Captures, ${sz}`} items={[
            { id: "d", label: "Day", content: null },
            { id: "w", label: "Week", content: null },
            { id: "m", label: "Month", content: null },
          ]} />
        ))}
      </Variant>
    </Stage>
  );
}

const trail = [
  { label: "Middle-earth", href: "#/_/navbar" },
  { label: "Eriador", href: "#/_/tabs" },
  { label: "The Shire", href: "#/_/pagination" },
  { label: "Hobbiton", href: "#/_/stepper" },
  { label: "Bag End" },
];

export function BreadcrumbsDemo() {
  return (
    <Stage align="start" className="flex-col">
      <Variant label="Room to spare" className="w-full">
        <Breadcrumbs items={trail} />
      </Variant>
      <Variant label="Narrow — the middle folds into a menu" className="w-full">
        <div className="w-full max-w-[300px] rounded-control bg-surface px-3 py-2.5">
          <Breadcrumbs items={trail} />
        </div>
      </Variant>
    </Stage>
  );
}

const klingonPagination: Partial<PaginationLabels> = {
  nav: "paghmey",
  previous: "pa' paq",
  next: "veb paq",
  page: (p) => `paq ${p}`,
  pageOf: (p, n) => `paq ${p} vo' ${n}`,
  of: (n) => `vo' ${n}`,
};

export function PaginationDemo() {
  const [page, setPage] = useState(6);
  return (
    <Stage className="flex-col">
      <Pagination page={page} pageCount={24} onChange={setPage} />
      <p className="text-[13px] text-muted tabular">Showing raptor sightings {(page - 1) * 20 + 1}–{Math.min(page * 20, 472)} of 472</p>
      <Pagination page={page} pageCount={24} onChange={setPage} labels={klingonPagination} />
      <p className="text-[13px] text-muted">tlhIngan Hol: the same control with <code>labels</code> overridden</p>
    </Stage>
  );
}

const checkout = [
  { label: "Vehicle", description: "DeLorean DMC-12" },
  { label: "Power", description: "1.21 gigawatts" },
  { label: "Destination", description: "Set the time circuits" },
  { label: "Speed", description: "88 miles per hour" },
];

export function StepperDemo() {
  const [step, setStep] = useState(1);
  return (
    <Stage align="start" className="flex-col">
      <Variant label="Horizontal" className="w-full">
        <div className="flex w-full flex-col gap-6">
          <Stepper steps={checkout} current={step} onStepClick={setStep} />
          <div className="flex justify-between gap-3">
            <Button variant="ghost" disabled={step === 0} onClick={() => setStep((s) => Math.max(0, s - 1))}>Back</Button>
            <Button onClick={() => setStep((s) => Math.min(checkout.length, s + 1))} disabled={step === checkout.length}>
              {step >= checkout.length - 1 ? "Go to 2015" : "Continue"}
            </Button>
          </div>
        </div>
      </Variant>
      <Variant label="Vertical, for tracking">
        <Stepper
          orientation="vertical"
          current={2}
          steps={[
            { label: "Left the Shire", description: "23 September" },
            { label: "Council of Elrond", description: "Rivendell, 25 October" },
            { label: "Through Moria", description: "15 January" },
            { label: "Mount Doom" },
          ]}
        />
      </Variant>
    </Stage>
  );
}

export function MenuDemo() {
  const [starred, setStarred] = useState(true);
  const [archived, setArchived] = useState(false);
  const [last, setLast] = useState("Nothing chosen yet");
  const items: MenuEntry[] = [
    { label: "Rename", icon: <Pencil />, shortcut: "F2", onSelect: () => setLast("Renamed") },
    { label: "Duplicate", icon: <Copy />, shortcut: "Ctrl D", onSelect: () => setLast("Duplicated, just in case") },
    { label: "Copy link", icon: <Link2 />, onSelect: () => setLast("Link copied") },
    {
      type: "submenu",
      label: "Send to",
      icon: <FolderInput />,
      items: [
        { type: "label", label: "Rebel bases" },
        { label: "Yavin 4", onSelect: () => setLast("Sent to Yavin 4") },
        { label: "Echo Base, Hoth", onSelect: () => setLast("Sent to Echo Base") },
        { label: "Dantooine", onSelect: () => setLast("They’re on Dantooine") },
      ],
    },
    { type: "separator" },
    { type: "checkbox", label: "Starred", checked: starred, onCheckedChange: setStarred },
    { type: "checkbox", label: "Show archived", checked: archived, onCheckedChange: setArchived },
    { type: "separator" },
    { label: "Archive", icon: <Archive />, onSelect: () => setLast("Archived") },
    { label: "Delete", icon: <Trash2 />, shortcut: "Del", danger: true, onSelect: () => setLast("Help me, Obi-Wan Kenobi. You’re my only hope.") },
  ];
  return (
    <Stage className="flex-col">
      <div className="flex flex-wrap items-center justify-center gap-3">
        <DropdownMenu
          label="File actions"
          items={items}
          trigger={({ open, ...p }) => (
            <Button variant="outline" trailing={<MoreHorizontal />} {...p} className={open ? "bg-raised" : undefined}>
              Actions
            </Button>
          )}
        />
        <DropdownMenu
          label="Quick"
          placement="bottom-end"
          items={[
            { label: "Add to favourites", icon: <Star />, onSelect: () => setLast("Favourited") },
            { label: "Share with R2-D2", icon: <Users />, onSelect: () => setLast("R2-D2 has the plans") },
          ]}
          trigger={(p) => (
            <button {...p} aria-label="More" className="grid size-10 place-items-center rounded-control text-muted transition-colors hover:bg-surface hover:text-ink">
              <MoreHorizontal className="size-4" />
            </button>
          )}
        />
      </div>
      <p className="text-[13px] text-muted" aria-live="polite">{last}</p>
    </Stage>
  );
}

export function ContextDemo() {
  const [last, setLast] = useState<string | null>(null);
  return (
    <Stage className="flex-col">
      <ContextMenu
        label="Death-Star-plans.pdf"
        items={[
          { label: "Open", icon: <FileText />, onSelect: () => setLast("Opened") },
          { label: "Rename", icon: <Pencil />, shortcut: "F2", onSelect: () => setLast("Renaming") },
          { label: "Copy link", icon: <Link2 />, onSelect: () => setLast("Link copied") },
          { type: "separator" },
          { label: "Delete", icon: <Trash2 />, danger: true, onSelect: () => setLast("It’s a trap!") },
        ]}
      >
        <div className="flex w-64 max-w-full cursor-context-menu flex-col items-center gap-3 rounded-card bg-surface px-6 py-8 text-center transition-colors hover:bg-surface/80">
          <span className="grid size-12 place-items-center rounded-control bg-raised text-muted">
            <FileImage className="size-5" />
          </span>
          <span className="text-sm text-ink">Death-Star-plans.pdf</span>
          <span className="text-xs text-muted">Right-click, or focus and press Shift F10</span>
        </div>
      </ContextMenu>
      <p className="h-5 text-[13px] text-muted" aria-live="polite">{last}</p>
    </Stage>
  );
}

export function AccordionDemo() {
  const faq = [
    { id: "light", title: "Can my mogwai go out in the sun?", content: "No. Keep them out of bright light. Sunlight will kill them, and even a camera flash upsets them." },
    { id: "water", title: "Can I give it a bath?", content: "Don’t get them wet, not even a drop. Water makes them multiply, and the new ones are rarely as sweet as Gizmo." },
    { id: "midnight", title: "When is the last feed?", content: "Never feed them after midnight. Every time zone counts, and so does a late snack from the fridge." },
    { id: "returns", title: "Can I bring it back to the shop?", content: "Mr. Wing doesn’t take returns. He warned you, and he will remind you that with a mogwai comes much responsibility." },
  ];
  return (
    <Stage align="start" className="flex-col">
      <Variant label="Lines, one open at a time" className="w-full max-w-xl">
        <Accordion items={faq} defaultOpen={["light"]} />
      </Variant>
      <Variant label="Cards, several open" className="w-full max-w-xl">
        <Accordion items={faq.slice(0, 3)} type="multiple" variant="cards" />
      </Variant>
    </Stage>
  );
}

const SHIPS: DocsNavSection[] = [
  {
    id: "fleet",
    label: "Fleets",
    groups: [
      { id: "rebel", label: "Rebel Alliance", items: [{ id: "x-wing", label: "X-wing" }, { id: "y-wing", label: "Y-wing" }, { id: "falcon", label: "Millennium Falcon" }, { id: "tantive", label: "Tantive IV" }] },
      { id: "empire", label: "Galactic Empire", items: [{ id: "tie", label: "TIE fighter" }, { id: "destroyer", label: "Star Destroyer" }, { id: "death-star", label: "Death Star" }] },
    ],
  },
  {
    id: "other",
    label: "Elsewhere",
    groups: [
      { id: "serenity", label: "Serenity", items: [{ id: "firefly", label: "Firefly class" }, { id: "reavers", label: "Reaver sightings" }] },
      { id: "nostromo", label: "Nostromo", items: [{ id: "mother", label: "Mother" }, { id: "jones", label: "Jones the cat" }] },
      { id: "manifest", label: "Manifest" },
    ],
  },
];

export function DocsNavDemo() {
  const [value, setValue] = useState("falcon");
  return (
    <Stage align="start" className="p-0 sm:p-0">
      <div className="flex h-[460px] w-full overflow-hidden rounded-card sm:w-[300px]">
        <DocsNav
          sections={SHIPS}
          value={value}
          onSelect={(id) => setValue(id)}
          shortcut=""
          groupClick="toggle"
          placeholder="Filter ships"
          emptyText="No ship by that name."
          aria-label="Fleet"
        />
      </div>
    </Stage>
  );
}

export function SidebarDemo() {
  const [value, setValue] = useState("comms");
  return (
    <Stage align="start" className="p-0 sm:p-0">
      <div className="flex h-[460px] w-full overflow-hidden rounded-card">
        <SidebarNav
          value={value}
          onChange={setValue}
          header={(collapsed) => (collapsed ? null : <Mark name="Nostromo" />)}
          sections={[
            {
              items: [
                { id: "bridge", label: "Bridge", icon: <Home /> },
                { id: "comms", label: "Comms", icon: <Inbox />, badge: 4 },
                { id: "systems", label: "Systems", icon: <BarChart3 />, children: [{ id: "s-engines", label: "Engines" }, { id: "s-life", label: "Life support" }, { id: "s-cargo", label: "Cargo, 20 million tons" }] },
              ],
            },
            {
              label: "Ship",
              items: [
                { id: "crew", label: "Crew of seven", icon: <Users /> },
                { id: "logs", label: "Mother’s logs", icon: <FileText /> },
                { id: "settings", label: "Settings", icon: <Settings /> },
              ],
            },
          ]}
        />
        <div className="grid flex-1 place-items-center bg-surface p-6 text-sm text-muted">
          <span>
            Showing <span className="font-medium text-ink">{value.startsWith("s-") ? "Systems / " + value.slice(2) : value}</span>
          </span>
        </div>
      </div>
    </Stage>
  );
}

const notes = [
  ["5 November 1955", "Hit my head on the sink hanging a clock. Woke up with a picture in my mind: the flux capacitor."],
  ["The power problem", "The capacitor needs 1.21 gigawatts. Plutonium is impossible to come by in 1955. Great Scott!"],
  ["Lightning", "A bolt of lightning will strike the clock tower at 22:04 on Saturday. If we could harness it…"],
  ["The cable", "Run a line from the clock tower to the street lamps. Marty must hit the wire at exactly 88 miles per hour."],
  ["Timing", "Leave the car at the starting line by 21:58. Allow six minutes to reach the wire."],
  ["Risks", "The temporal displacement leaves fire trails. Pedestrians should be warned."],
  ["Paradoxes", "Marty must not meet his past self. The encounter could create a time paradox."],
  ["Mr. Fusion", "Future upgrade: a home energy reactor that runs on banana peels and stale beer."],
  ["Hover conversion", "Roads? Where we’re going, we don’t need roads."],
  ["21 October 2015", "Avoid buying sports almanacs. Avoid Biff in all decades."],
  ["Spare parts", "Keep a second chip for the time circuits. The first one melted."],
  ["Last entry", "Your future is whatever you make it, so make it a good one."],
];

export function BackToTopDemo() {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <Stage className="p-0 sm:p-0">
      <div className="relative h-80 w-full overflow-hidden rounded-card bg-surface">
        <div ref={ref} className="h-full overflow-y-auto px-6 py-6 sm:px-10">
          <p className="mb-6 text-sm text-muted">Doc Brown’s notebook. Scroll it: the button appears after a little way down and its ring shows how far you are.</p>
          {notes.map(([title, body]) => (
            <div key={title} className="mb-6 max-w-prose">
              <h4 className="mb-1 text-[15px] font-semibold text-ink">{title}</h4>
              <p className="text-sm leading-relaxed text-ink">{body}</p>
            </div>
          ))}
        </div>
        <BackToTop container={ref} threshold={160} position="inline" />
      </div>
    </Stage>
  );
}
