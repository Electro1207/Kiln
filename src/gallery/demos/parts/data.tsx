import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Archive, Car, FileText, Plus, Power, Printer, Sparkles, Terminal, Trash2, Undo2, Zap, Snowflake, Ban } from "lucide-react";
import { Stage, Variant, Btn } from "../../ui";
import { Avatar, AvatarGroup } from "../../../kiln/components/data-display/Avatar";
import { Table, type Column } from "../../../kiln/components/tables/Table";
import { List, ListItem } from "../../../kiln/components/data-display/List";
import { Timeline } from "../../../kiln/components/data-display/Timeline";
import { Stat } from "../../../kiln/components/data-display/Stat";
import { NumberTicker } from "../../../kiln/components/data-display/NumberTicker";
import { HeatStrip } from "../../../kiln/components/data-display/HeatStrip";
import { CodeBlock } from "../../../kiln/components/data-display/CodeBlock";
import { Kbd } from "../../../kiln/components/data-display/Kbd";
import { Tag, TagGroup, type TagTone } from "../../../kiln/components/data-display/Tag";
import { Button } from "../../../kiln/components/buttons/Button";
import { DataGrid, type GridColumn } from "../../../kiln/components/tables/DataGrid";
import { DescriptionList } from "../../../kiln/components/data-display/DescriptionList";
import { ComparisonTable } from "../../../kiln/components/tables/ComparisonTable";
import { MediaPlayer } from "../../../kiln/components/media/MediaPlayer";
import { Invoice } from "../../../kiln/components/commerce/Invoice";
import { spring } from "../../../kiln/motion";


const FELLOWSHIP = [
  { name: "Frodo Baggins", src: `${import.meta.env.BASE_URL}demo/photos/portrait-young.webp` },
  { name: "Samwise Gamgee" },
  { name: "Gandalf", src: `${import.meta.env.BASE_URL}demo/photos/portrait-old.webp` },
  { name: "Aragorn" },
  { name: "Legolas" },
  { name: "Gimli" },
  { name: "Boromir" },
  { name: "Meriadoc Brandybuck" },
  { name: "Peregrin Took" },
];

export function AvatarDemo() {
  return (
    <Stage align="start" className="flex-col sm:flex-row sm:gap-12">
      <Variant label="Sizes and status">
        <Avatar name="Luke Skywalker" src={`${import.meta.env.BASE_URL}demo/photos/portrait-young.webp`} size="lg" status="online" />
        <Avatar name="Leia Organa" size="md" status="away" />
        <Avatar name="Han Solo" size="sm" status="busy" />
        <Avatar name="Ellen Ripley" size="md" status="offline" />
      </Variant>
      <Variant label="Any size in pixels">
        <Avatar name="Sarah Connor" size={20} />
        <Avatar name="Kyle Reese" size={64} status="online" />
        <Avatar name="John Connor" src={`${import.meta.env.BASE_URL}demo/photos/portrait-old.webp`} size={80} />
      </Variant>
      <Variant label="The Fellowship (hover or focus to fan out)">
        <AvatarGroup people={FELLOWSHIP} max={5} />
      </Variant>
    </Stage>
  );
}

type Invoice = { id: string; client: string; issued: string; status: "Paid" | "Due" | "Overdue" | "Draft"; amount: number };
const INVOICES: Invoice[] = [
  { id: "GB-1984-001", client: "The Sedgewick Hotel", issued: "1984-06-08", status: "Paid", amount: 5000 },
  { id: "GB-1984-002", client: "New York Public Library", issued: "1984-06-22", status: "Paid", amount: 3250 },
  { id: "GB-1984-003", client: "Dana Barrett, 55 Central Park West", issued: "1984-07-03", status: "Overdue", amount: 1800 },
  { id: "GB-1984-004", client: "Stay Puft Marshmallow Corp.", issued: "1984-07-19", status: "Due", amount: 2310.5 },
  { id: "GB-1984-005", client: "Shandor Building co-op board", issued: "1984-08-02", status: "Due", amount: 12850 },
  { id: "GB-1984-006", client: "Office of the Mayor", issued: "1984-08-14", status: "Paid", amount: 7400 },
  { id: "GB-1984-007", client: "Columbia University, Psychology", issued: "1984-09-01", status: "Draft", amount: 640 },
];
const statusTone: Record<Invoice["status"], TagTone> = { Paid: "positive", Due: "neutral", Overdue: "negative", Draft: "info" };
const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const day = (iso: string) => new Date(iso + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" });

export function TableDemo() {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const columns: Column<Invoice>[] = [
    { key: "id", header: "Invoice", sortValue: (r) => r.id, render: (r) => <span className="tabular font-medium">{r.id}</span> },
    { key: "client", header: "Client", sortValue: (r) => r.client, render: (r) => r.client },
    { key: "issued", header: "Issued", sortValue: (r) => r.issued, render: (r) => <span className="tabular text-muted">{day(r.issued)}</span> },
    { key: "status", header: "Status", sortValue: (r) => r.status, render: (r) => <Tag tone={statusTone[r.status]} initial={false} layout={false}>{r.status}</Tag> },
    { key: "amount", header: "Amount", align: "right", sortValue: (r) => r.amount, render: (r) => usd.format(r.amount) },
  ];
  const total = INVOICES.filter((i) => selected.has(i.id)).reduce((s, i) => s + i.amount, 0);
  return (
    <Stage className="flex-col items-stretch">
      <div className="flex h-9 items-center justify-between gap-3">
        <span className="text-sm text-muted">Ghostbusters, Inc. invoices, summer 1984. Click a header to sort.</span>
        <AnimatePresence>
          {selected.size > 0 && (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }} transition={spring} className="flex items-center gap-3">
              <span className="tabular whitespace-nowrap text-sm text-ink">
                {selected.size} selected · {usd.format(total)}
              </span>
              <Button size="sm" variant="secondary" onClick={() => setSelected(new Set())}>Clear</Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <Table caption="Ghostbusters invoices, 1984" rows={INVOICES} columns={columns} rowKey={(r) => r.id} selectable selected={selected} onSelectedChange={setSelected} />
    </Stage>
  );
}

const FILES = [
  { id: "f1", title: "Death Star technical readout.pdf", description: "Shared by Jyn Erso", trailing: "2.4 MB" },
  { id: "f2", title: "Flux capacitor schematic.dwg", description: "Edited by Emmett Brown", trailing: "18 MB" },
  { id: "f3", title: "Paddock 9 fence report.xlsx", description: "Waiting on Ray Arnold", trailing: "310 KB" },
  { id: "f4", title: "Nostromo crew manifest.docx", description: "Edited by Ellen Ripley yesterday", trailing: "12 KB" },
];

export function ListDemo() {
  const [items, setItems] = useState(FILES);
  const remove = (id: string) => setItems((xs) => xs.filter((x) => x.id !== id));
  return (
    <Stage className="flex-col items-stretch">
      <span className="text-sm text-muted">Swipe a row left on touch, or focus it with Tab, for its actions.</span>
      <List label="Recent files" className="w-full max-w-lg self-center">
        <AnimatePresence initial={false}>
          {items.map((f) => (
            <ListItem
              key={f.id}
              title={f.title}
              description={f.description}
              trailing={f.trailing}
              leading={
                <span className="grid size-9 place-items-center rounded-control bg-raised text-muted">
                  <FileText className="size-4" />
                </span>
              }
              actions={[
                { label: "Archive", icon: <Archive />, tone: "neutral", onSelect: () => remove(f.id) },
                { label: "Delete", icon: <Trash2 />, tone: "danger", onSelect: () => remove(f.id) },
              ]}
            />
          ))}
        </AnimatePresence>
        {items.length === 0 && <li className="px-4 py-6 text-center text-sm text-muted">No recent files. These aren't the files you're looking for.</li>}
      </List>
      <div className="grid h-8 place-items-center">
        <AnimatePresence>
          {items.length < FILES.length && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Button size="sm" variant="ghost" leading={<Undo2 />} onClick={() => setItems(FILES)}>Restore files</Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Stage>
  );
}

export function TimelineDemo() {
  return (
    <Stage align="start">
      <Timeline
        className="w-full max-w-lg"
        items={[
          { id: "1", icon: <Power />, tone: "positive", title: <>Ray Arnold restarted the main power</>, time: "19:12", dateTime: "1993-06-11T19:12", body: "“Hold on to your butts.”" },
          { id: "2", icon: <Zap />, tone: "negative", title: "Fences on paddock 9 lost power", time: "19:05", dateTime: "1993-06-11T19:05" },
          { id: "3", icon: <Car />, tone: "warning", title: "Tour vehicles stopped at the Tyrannosaur paddock", time: "18:58", dateTime: "1993-06-11T18:58" },
          { id: "4", icon: <Terminal />, title: <>Dennis Nedry ran <b className="font-medium">whte_rabbit.obj</b></>, time: "18:51", dateTime: "1993-06-11T18:51", body: "“Ah ah ah, you didn't say the magic word.”" },
          { id: "5", icon: <Sparkles />, tone: "accent", title: "John Hammond welcomed the endorsement team", time: "11:30", dateTime: "1993-06-11T11:30", body: "“Welcome to Jurassic Park.”" },
        ]}
      />
    </Stage>
  );
}

export function StatDemo() {
  const [run, setRun] = useState(0);
  return (
    <Stage className="flex-col items-stretch">
      <span className="text-sm text-muted">Ghostbusters, Inc., third quarter of 1984.</span>
      <div key={run} className="grid grid-cols-2 gap-x-6 gap-y-8 lg:grid-cols-4">
        <Stat locale="en-US" label="Revenue" value={48210} format={{ style: "currency", currency: "USD", maximumFractionDigits: 0 }} delta={0.124} note="vs Q2" />
        <Stat label="Captures" value={128} delta={0.061} note="vs Q2" />
        <Stat locale="en-US" label="Average job" value={376.64} format={{ style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 }} delta={0.059} />
        <Stat label="Repeat hauntings" value={1.8} format={{ maximumFractionDigits: 1, minimumFractionDigits: 1 }} delta={-0.15} invert note="lower is better" />
      </div>
      <Button size="sm" variant="ghost" className="self-start" onClick={() => setRun((r) => r + 1)}>Count again</Button>
    </Stage>
  );
}

const TRIPS = [
  { year: 1955, label: "November 5, 1955" },
  { year: 1985, label: "October 26, 1985" },
  { year: 2015, label: "October 21, 2015" },
  { year: 1885, label: "September 2, 1885" },
];

export function TickerDemo() {
  const [i, setI] = useState(1);
  return (
    <Stage className="flex-col gap-5">
      <div className="flex flex-col items-center gap-1">
        <span className="text-xs text-muted">Destination time</span>
        <NumberTicker value={TRIPS[i].year} format={{ useGrouping: false }} className="text-[56px] font-medium tracking-tight text-ink" />
        <span className="tabular text-sm text-muted">{TRIPS[i].label}</span>
      </div>
      <div className="flex flex-wrap justify-center gap-2" role="group" aria-label="Set destination">
        {TRIPS.map((t, k) => (
          <Button key={t.year} size="sm" variant={k === i ? "primary" : "secondary"} onClick={() => setI(k)} aria-pressed={k === i}>
            {t.year}
          </Button>
        ))}
      </div>
    </Stage>
  );
}

function seeded(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
}

export function HeatDemo() {
  const days = useMemo(() => {
    const r = seeded(1984);
    const end = new Date("1984-11-17T12:00:00");
    return Array.from({ length: 26 * 7 }, (_, i) => {
      const d = new Date(end);
      d.setDate(end.getDate() - (26 * 7 - 1 - i));
      const night = d.getDay() === 5 || d.getDay() === 6;
      const v = r();
      const season = 0.4 + (i / (26 * 7)) * 0.9;
      return { date: d.toISOString().slice(0, 10), count: Math.floor(v * v * 7 * season + (night ? 2 * v : 0)) };
    });
  }, []);
  return (
    <Stage>
      <div className="w-full max-w-2xl">
        <HeatStrip days={days} unit="sightings" />
      </div>
    </Stage>
  );
}

const SAMPLE = `import { GaugeChart } from "./kiln/components/charts/GaugeChart";

const GIGAWATTS = 1.21;

export function TimeCircuits({ mph }: { mph: number }) {
  // "Where we're going, we don't need roads."
  return (
    <GaugeChart value={mph} max={100} target={88} label="Speed" unit="mph" />
  );
}`;

export function CodeDemo() {
  return (
    <Stage>
      <CodeBlock code={SAMPLE} filename="TimeCircuits.tsx" className="max-w-2xl" />
    </Stage>
  );
}

export function KbdDemo() {
  const rows: { keys: string[]; listen: string[]; does: string }[] = [
    { keys: ["Ctrl", "K"], listen: ["Control", "k"], does: "Make the jump to lightspeed" },
    { keys: ["Shift", "?"], listen: ["Shift", "?"], does: "Ask the Oracle" },
    { keys: ["Esc"], listen: ["Escape"], does: "Close the blast doors" },
  ];
  return (
    <Stage className="flex-col items-stretch">
      <span className="text-sm text-muted">Press the keys: they press down with you.</span>
      <dl className="mx-auto flex w-full max-w-sm flex-col gap-3">
        {rows.map((r) => (
          <div key={r.does} className="flex items-center justify-between gap-4">
            <dt className="text-sm text-ink">{r.does}</dt>
            <dd className="flex gap-1">
              {r.keys.map((k, i) => (
                <Kbd key={k} listen={r.listen[i]}>{k}</Kbd>
              ))}
            </dd>
          </div>
        ))}
      </dl>
      <Variant label="Sizes">
        {(["sm", "md", "lg"] as const).map((sz) => (
          <Kbd key={sz} size={sz}>{sz === "sm" ? "Esc" : sz === "md" ? "Enter" : "Shift"}</Kbd>
        ))}
      </Variant>
    </Stage>
  );
}

const FACTIONS: { label: string; tone: TagTone }[] = [
  { label: "Rebel Alliance", tone: "accent" },
  { label: "Galactic Empire", tone: "negative" },
  { label: "Autobots", tone: "info" },
  { label: "Decepticons", tone: "warning" },
  { label: "Fellowship", tone: "positive" },
  { label: "Ghostbusters", tone: "neutral" },
];

export function TagDemo() {
  const [tags, setTags] = useState(FACTIONS.slice(0, 3));
  const left = FACTIONS.filter((s) => !tags.some((t) => t.label === s.label));
  return (
    <Stage className="flex-col">
      <TagGroup label="Chosen factions" className="min-h-8 justify-center">
        {tags.map((t) => (
          <Tag key={t.label} tone={t.tone} onRemove={() => setTags((xs) => xs.filter((x) => x.label !== t.label))}>
            {t.label}
          </Tag>
        ))}
      </TagGroup>
      <TagGroup label="More factions" className="min-h-8 justify-center">
        {left.map((s) => (
          <motion.button
            key={s.label}
            type="button"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={spring}
            onClick={() => setTags((xs) => [...xs, s])}
            className="inline-flex h-7 items-center gap-1 rounded-full border border-dashed border-line-strong bg-surface px-2.5 text-[13px] text-muted transition-colors duration-200 hover:text-ink"
          >
            <Plus className="size-3.5" aria-hidden />
            {s.label}
          </motion.button>
        ))}
      </TagGroup>
      <Variant label="Sizes">
        {(["sm", "md", "lg"] as const).map((sz) => (
          <Tag key={sz} size={sz} tone="accent">{`Rebel Alliance, ${sz}`}</Tag>
        ))}
      </Variant>
    </Stage>
  );
}

type Ship = { name: string; reg: string; model: string; maker: string; hyperdrive: number | null; crew: number; cost: number | null; status: "In service" | "Docked" | "Destroyed" | "Missing" };
const SHIPS: Ship[] = [
  { name: "Millennium Falcon", reg: "YT-492727ZED", model: "YT-1300 light freighter", maker: "Corellian Engineering Corp.", hyperdrive: 0.5, crew: 4, cost: 100000, status: "In service" },
  { name: "Red Five", reg: "T65-RS-005", model: "T-65B X-wing", maker: "Incom Corporation", hyperdrive: 1, crew: 1, cost: 149999, status: "In service" },
  { name: "Gold Leader", reg: "BTL-GS-001", model: "BTL-A4 Y-wing", maker: "Koensayr Manufacturing", hyperdrive: 1, crew: 2, cost: 134999, status: "Destroyed" },
  { name: "Green Leader", reg: "RZ1-GS-001", model: "RZ-1 A-wing", maker: "Alliance Underground Engineering", hyperdrive: 1, crew: 1, cost: 175000, status: "In service" },
  { name: "Blade Wing", reg: "ASF-01-118", model: "A/SF-01 B-wing", maker: "Slayn & Korpil", hyperdrive: 2, crew: 1, cost: 220000, status: "Docked" },
  { name: "Tantive IV", reg: "CR90-AL-004", model: "CR90 corvette", maker: "Corellian Engineering Corp.", hyperdrive: 2, crew: 165, cost: 3500000, status: "Missing" },
  { name: "Home One", reg: "MC80-HO-001", model: "MC80 star cruiser", maker: "Mon Calamari Shipyards", hyperdrive: 1, crew: 5402, cost: 104000000, status: "In service" },
  { name: "Slave I", reg: "FS31-JF-001", model: "Firespray-31 patrol craft", maker: "Kuat Systems Engineering", hyperdrive: 3, crew: 1, cost: 150000, status: "Docked" },
  { name: "Executor", reg: "SSD-EX-001", model: "Executor-class Star Dreadnought", maker: "Kuat Drive Yards", hyperdrive: 2, crew: 279144, cost: 1143350000, status: "Destroyed" },
  { name: "Devastator", reg: "ISD-DV-021", model: "Imperial I-class Star Destroyer", maker: "Kuat Drive Yards", hyperdrive: 2, crew: 47060, cost: 150000000, status: "In service" },
  { name: "Tydirium", reg: "LAM-T4A-339", model: "Lambda-class shuttle", maker: "Sienar Fleet Systems", hyperdrive: 1, crew: 6, cost: 240000, status: "Docked" },
  { name: "Death Star", reg: "DS1-OBS-001", model: "DS-1 Orbital Battle Station", maker: "Imperial Dept. of Military Research", hyperdrive: 4, crew: 342953, cost: 1000000000000, status: "Destroyed" },
  { name: "Ghost", reg: "VCX-100-GH", model: "VCX-100 light freighter", maker: "Corellian Engineering Corp.", hyperdrive: 1, crew: 6, cost: null, status: "In service" },
  { name: "Naboo Royal Starship", reg: "J327-NB-001", model: "J-type 327 Nubian", maker: "Theed Palace Engineering Corps", hyperdrive: 1.8, crew: 8, cost: null, status: "Docked" },
  { name: "Scimitar", reg: "SI-RS-001", model: "Sith Infiltrator", maker: "Republic Sienar Systems", hyperdrive: 1.5, crew: 1, cost: 55000000, status: "Destroyed" },
  { name: "Radiant VII", reg: "CCC-RV-007", model: "Consular-class cruiser", maker: "Corellian Engineering Corp.", hyperdrive: 2, crew: 9, cost: null, status: "Destroyed" },
  { name: "Bright Hope", reg: "GR75-BH-003", model: "GR-75 medium transport", maker: "Gallofree Yards", hyperdrive: 4, crew: 6, cost: null, status: "In service" },
  { name: "Razor Crest", reg: "ST70-RC-001", model: "ST-70 assault ship", maker: "Republic Engineering", hyperdrive: 1, crew: 1, cost: null, status: "Destroyed" },
  { name: "Outrider", reg: "YT2400-OR", model: "YT-2400 light freighter", maker: "Corellian Engineering Corp.", hyperdrive: 0.75, crew: 3, cost: null, status: "Missing" },
  { name: "Ebon Hawk", reg: "D6-EH-001", model: "Dynamic-class freighter", maker: "Core Systems Shipyards", hyperdrive: 1, crew: 3, cost: null, status: "Docked" },
];
const shipTone: Record<Ship["status"], TagTone> = { "In service": "positive", Docked: "neutral", Destroyed: "negative", Missing: "warning" };
const credits = (n: number | null) => (n == null ? <span className="text-faint">—</span> : `${n.toLocaleString("en-US")} cr`);

export function DataGridDemo() {
  const [ships, setShips] = useState(SHIPS);
  const [note, setNote] = useState("");
  const columns: GridColumn<Ship>[] = [
    { key: "name", header: "Ship", width: 180, sortValue: (r) => r.name, render: (r) => <span className="font-medium">{r.name}</span> },
    { key: "reg", header: "Registry", sortValue: (r) => r.reg, render: (r) => <span className="font-mono text-[13px] text-muted">{r.reg}</span> },
    { key: "model", header: "Model", width: 200, sortValue: (r) => r.model, render: (r) => r.model },
    { key: "maker", header: "Manufacturer", width: 220, hidden: true, sortValue: (r) => r.maker, render: (r) => r.maker },
    { key: "hyperdrive", header: "Hyperdrive", align: "right", sortValue: (r) => r.hyperdrive ?? 99, render: (r) => (r.hyperdrive == null ? <span className="text-faint">—</span> : `Class ${r.hyperdrive}`) },
    { key: "crew", header: "Crew", align: "right", sortValue: (r) => r.crew, render: (r) => r.crew.toLocaleString("en-US") },
    { key: "cost", header: "Cost", align: "right", width: 150, sortValue: (r) => r.cost ?? -1, render: (r) => credits(r.cost) },
    { key: "status", header: "Status", sortValue: (r) => r.status, render: (r) => <Tag tone={shipTone[r.status]} initial={false} layout={false}>{r.status}</Tag> },
  ];
  return (
    <Stage className="flex-col items-stretch">
      <DataGrid
        caption="Fleet registry"
        noun={["ship", "ships"]}
        rows={ships}
        columns={columns}
        rowKey={(r) => r.reg}
        pageSize={8}
        bulkActions={[
          { label: "Send to Hoth", icon: <Snowflake />, onRun: (ids) => setNote(`${ids.length} ${ids.length === 1 ? "ship" : "ships"} sent to Echo Base, Hoth.`) },
          {
            label: "Decommission",
            icon: <Ban />,
            tone: "danger",
            onRun: (ids) => {
              setShips((s) => s.filter((x) => !ids.includes(x.reg)));
              setNote(`${ids.length} decommissioned.`);
            },
          },
        ]}
      />
      <div className="flex h-8 items-center justify-between gap-3 text-sm" aria-live="polite">
        <span className="text-muted">{note}</span>
        {ships.length < SHIPS.length && (
          <Button size="sm" variant="ghost" leading={<Undo2 />} onClick={() => { setShips(SHIPS); setNote(""); }}>Restore fleet</Button>
        )}
      </div>
    </Stage>
  );
}

export function DescriptionDemo() {
  return (
    <Stage>
      <DescriptionList
        title="DeLorean DMC-12"
        className="max-w-xl"
        items={[
          { term: "Owner", value: "Dr. Emmett L. Brown" },
          { term: "Address", value: "1640 Riverside Drive, Hill Valley, California" },
          { term: "Licence plate", value: "OUTATIME", copy: "OUTATIME", mono: true },
          { term: "Destination time", value: "October 21, 2015, 4:29 PM", copy: "2015-10-21T16:29" },
          { term: "Power required", value: "1.21 gigawatts" },
          { term: "Speed required", value: "88 miles per hour" },
        ]}
      />
    </Stage>
  );
}

export function ComparisonDemo() {
  return (
    <Stage>
      <ComparisonTable
        caption="Jedi training plans compared"
        maxHeight={460}
        plans={[
          { id: "padawan", name: "Padawan", price: "Free", note: "For younglings", action: <Btn size="sm" variant="secondary" className="w-full">Begin</Btn> },
          { id: "knight", name: "Knight", price: "40 credits / month", note: "Most chosen", featured: true, action: <Btn size="sm" className="w-full">Choose Knight</Btn> },
          { id: "master", name: "Master", price: "120 credits / month", note: "Council approval needed", action: <Btn size="sm" variant="secondary" className="w-full">Apply</Btn> },
        ]}
        groups={[
          {
            title: "Training",
            rows: [
              { feature: "Lightsaber drills with a remote", values: { padawan: true, knight: true, master: true } },
              { feature: "Sessions with Yoda", values: { padawan: "1 a month", knight: "Weekly", master: "Daily" } },
              { feature: "Lightsaber forms", values: { padawan: "Form I", knight: "Forms I–IV", master: "All seven" } },
              { feature: "Dagobah swamp retreat", values: { padawan: false, knight: true, master: true } },
            ],
          },
          {
            title: "The Order",
            rows: [
              { feature: "Jedi Archives", values: { padawan: "Public halls", knight: "Full archive", master: "Full archive" } },
              { feature: "Holocron vault", values: { padawan: false, knight: false, master: true } },
              { feature: "Seat on the Jedi Council", values: { padawan: false, knight: false, master: true } },
            ],
          },
        ]}
      />
    </Stage>
  );
}

/* Loudness of the excerpt's soundtrack, measured once from the file (RMS of 72 slices). */
const BBB_PEAKS = [0.2,0.54,0.29,0.36,0.3,0.66,0.32,0.41,0.6,0.43,0.55,0.26,0.71,0.48,0.63,0.89,0.57,0.42,0.44,0.48,0.45,0.23,0.58,0.63,0.31,0.3,0.49,0.36,0.35,0.73,0.74,0.7,0.64,0.59,0.72,0.42,0.39,0.5,1,0.9,0.59,0.65,0.73,0.47,0.4,0.59,0.73,0.68,0.59,0.8,0.85,0.19,0.06,0.01,0.01,0,0.03,0,0,0,0,0.01,0.05,0.05,0.01,0.01,0.12,0.18,0.1,0.14,0.05,0.13];

export function PlayerDemo() {
  const V = `${import.meta.env.BASE_URL}demo/video/`;
  const [playing, setPlaying] = useState(false);
  const [vol, setVol] = useState(40);
  const [at, setAt] = useState(0);
  return (
    <Stage className="flex-col">
      <MediaPlayer
        className="max-w-[460px]"
        title="Big Buck Bunny, morning"
        artist="Jan Morgenstern · Blender Foundation"
        duration={40}
        src={`${V}bbb-360.webm`}
        peaks={BBB_PEAKS}
        cover={{ src: `${V}bbb-poster.jpg`, alt: "Big Buck Bunny standing in a meadow" }}
      />
      <MediaPlayer
        className="max-w-[460px]"
        title="Controlled: Great Scott"
        artist="Back to the Future"
        duration={40}
        src={`${V}bbb-360.webm`}
        peaks={BBB_PEAKS}
        playing={playing}
        onPlayingChange={setPlaying}
        volume={vol}
        onVolumeChange={setVol}
        currentTime={at}
        onTimeChange={setAt}
      />
      <div className="flex max-w-[460px] flex-wrap items-center justify-center gap-2">
        <Button size="sm" variant="outline" onClick={() => setPlaying((p) => !p)}>{playing ? "Pause" : "Play"} from outside</Button>
        <Button size="sm" variant="outline" onClick={() => setAt(0)}>Back to 1955</Button>
        <Button size="sm" variant="outline" onClick={() => setVol(100)}>Turn it up to 11</Button>
      </div>
      <MediaPlayer
        className="max-w-[460px]"
        title="Uncontrolled: starts quiet"
        artist="Wayne's World"
        duration={40}
        src={`${V}bbb-360.webm`}
        peaks={BBB_PEAKS}
        defaultVolume={25}
        defaultCurrentTime={12}
      />
      <p className="max-w-[460px] text-center text-xs leading-5 text-muted">
        Soundtrack of{" "}
        <a href="https://commons.wikimedia.org/wiki/File:Big_Buck_Bunny_4K.webm" target="_blank" rel="noreferrer" className="underline decoration-line-strong underline-offset-2 hover:text-ink">“Big Buck Bunny”</a>{" "}
        (1:00–1:40), music by Jan Morgenstern, © Blender Foundation,{" "}
        <a href="https://creativecommons.org/licenses/by/3.0/" target="_blank" rel="noreferrer" className="underline decoration-line-strong underline-offset-2 hover:text-ink">CC BY 3.0</a>. The waveform is the clip's measured loudness.
      </p>
    </Stage>
  );
}

export function InvoiceDemo() {
  const [paid, setPaid] = useState(false);
  return (
    <Stage>
      <Invoice
        className="max-w-3xl"
        number="GB-1984-001"
        issued="1984-06-08"
        due="1984-07-08"
        paid={paid}
        from={{ name: "Ghostbusters, Inc.", lines: ["14 North Moore Street", "New York, NY 10013", "(212) 555-2368"] }}
        to={{ name: "The Sedgewick Hotel", lines: ["Attn: the hotel manager", "Fifth Avenue, New York, NY"] }}
        items={[
          { description: "Entrapment", detail: "Class 5 full-roaming vapor, 12th floor ballroom", qty: 1, unit: 4000 },
          { description: "Proton charging and storage of the beast", detail: "This week's special", qty: 1, unit: 1000 },
        ]}
        taxRate={0.0825}
        taxLabel="NY sales tax"
        notes={<>“We came, we saw, we kicked its ass!” Pay by cheque to Ghostbusters, Inc. within 30 days.</>}
        actions={
          <>
            <Button size="sm" variant="ghost" leading={<Printer />} onClick={() => window.print()}>Print</Button>
            <Button size="sm" variant={paid ? "secondary" : "primary"} onClick={() => setPaid((p) => !p)}>
              {paid ? "Mark as unpaid" : "Mark as paid"}
            </Button>
          </>
        }
      />
    </Stage>
  );
}
