import { useMemo, useState } from "react";
import type { Category } from "../types";
import { Stage, Variant } from "../ui";
import { TreeView, type TreeNode } from "../../kiln/components/workspace/TreeView";
import { KanbanBoard, type KanbanColumn } from "../../kiln/components/workspace/KanbanBoard";
import { SortableList } from "../../kiln/components/workspace/SortableList";
import { ResizablePanels } from "../../kiln/components/workspace/ResizablePanels";
import { CalendarMonth, type CalEvent } from "../../kiln/components/workspace/CalendarMonth";
import { FilterBar, type FilterValues } from "../../kiln/components/workspace/FilterBar";


const park: TreeNode[] = [
  {
    id: "control", name: "control-room", children: [
      { id: "security", name: "security.ts", meta: "4 KB" },
      { id: "doors", name: "door-locks.ts", meta: "2 KB" },
      { id: "fences", name: "perimeter-fences.ts", meta: "6 KB" },
      { id: "whte", name: "whte_rbt.obj", meta: "13 KB" },
    ],
  },
  {
    id: "paddocks", name: "paddocks", children: [
      { id: "rex", name: "tyrannosaurus.md", meta: "9 KB" },
      { id: "raptors", name: "velociraptor-pen.md", meta: "11 KB" },
      { id: "brachio", name: "brachiosaurus.md", meta: "3 KB" },
      {
        id: "embryos", name: "embryos", children: [
          { id: "barbasol", name: "barbasol-can.png", meta: "820 KB" },
          { id: "manifest", name: "cold-storage.json", meta: "1 KB" },
        ],
      },
    ],
  },
  {
    id: "visitor", name: "visitor-centre", children: [
      { id: "tour", name: "tour-script.md", meta: "5 KB" },
      { id: "giftshop", name: "gift-shop.png", meta: "1.2 MB" },
    ],
  },
  { id: "readme", name: "README.md", meta: "2 KB" },
];

const previews: Record<string, string> = {
  whte: "Nedry’s backdoor. Running it turns off the fences and the door locks. Ah ah ah, you didn’t say the magic word.",
  rex: "Paddock 9. Do not stop the tour vehicles at the fence. Mind the goat.",
  raptors: "The pen is fed by crane. The raptors test the fences for weaknesses, systematically. They remember.",
  barbasol: "Fifteen species, one shaving-foam can, a cooling time of 36 hours.",
};

function TreeDemo() {
  const [sel, setSel] = useState<string | null>("whte");
  const all = useMemo(() => {
    const m = new Map<string, TreeNode>();
    const walk = (l: TreeNode[]) => l.forEach((n) => { m.set(n.id, n); if (n.children) walk(n.children); });
    walk(park);
    return m;
  }, []);
  const node = sel ? all.get(sel) : null;
  return (
    <Stage align="start" className="p-0 sm:p-0">
      <div className="grid w-full overflow-hidden rounded-card bg-surface sm:grid-cols-[280px_1fr]">
        <div className="p-2">
          <TreeView label="Isla Nublar files" nodes={park} selected={sel} onSelect={setSel} defaultExpanded={["control", "paddocks"]} />
        </div>
        <div className="flex flex-col gap-2 bg-raised/60 p-6">
          <p className="text-sm font-semibold text-ink">{node?.name ?? "Nothing selected"}</p>
          <p className="max-w-prose text-sm text-ink">
            {node?.children ? `${node.children.length} items` : (sel && previews[sel]) || "No preview for this file."}
          </p>
        </div>
      </div>
    </Stage>
  );
}

const jobs: KanbanColumn[] = [
  {
    id: "calls", title: "Calls", cards: [
      { id: "library", title: "Free-floating full-torso vapour, New York Public Library", tag: { label: "Class 4", tone: "warning" }, assignee: "Ray Stantz", meta: "Today" },
      { id: "fridge", title: "Something in the refrigerator, 55 Central Park West", tag: { label: "Unknown", tone: "neutral" }, assignee: "Peter Venkman" },
      { id: "subway", title: "Ectoplasm in the subway tunnel under First Avenue", tag: { label: "Slime", tone: "info" }, meta: "Fri" },
    ],
  },
  {
    id: "route", title: "On the way", cards: [
      { id: "sedgewick", title: "Slimer on the 12th floor of the Sedgewick Hotel", tag: { label: "Class 5", tone: "negative" }, assignee: "Egon Spengler", meta: "$5,000" },
    ],
  },
  {
    id: "trapped", title: "Trapped", cards: [
      { id: "gozer", title: "Gozer the Gozerian, rooftop of Spook Central", tag: { label: "Deity", tone: "negative" }, assignee: "Winston Zeddemore" },
      { id: "stay-puft", title: "Stay Puft Marshmallow Man, Columbus Circle", tag: { label: "Class 7", tone: "warning" }, meta: "Cleanup due" },
    ],
  },
  { id: "contained", title: "In containment", cards: [] },
];

function KanbanDemo() {
  const [cols, setCols] = useState(jobs);
  return (
    <Stage align="start" className="p-0 sm:p-0">
      <div className="w-full rounded-card bg-surface p-3 sm:p-4">
        <KanbanBoard columns={cols} onChange={setCols} />
      </div>
    </Stage>
  );
}

type Walker = { id: string; name: string; role: string };
const fellowship: Walker[] = [
  { id: "gandalf", name: "Gandalf", role: "Wizard, leads the way" },
  { id: "aragorn", name: "Aragorn", role: "Ranger of the North" },
  { id: "frodo", name: "Frodo Baggins", role: "Ring-bearer" },
  { id: "sam", name: "Samwise Gamgee", role: "Gardener, carries the pans" },
  { id: "legolas", name: "Legolas", role: "Elf of Mirkwood" },
  { id: "gimli", name: "Gimli", role: "Dwarf, son of Glóin" },
  { id: "boromir", name: "Boromir", role: "Captain of Gondor" },
  { id: "merry", name: "Merry Brandybuck", role: "Hobbit" },
  { id: "pippin", name: "Pippin Took", role: "Hobbit, fool of a Took" },
];

function SortableDemo() {
  const [order, setOrder] = useState(fellowship);
  return (
    <Stage>
      <div className="w-full max-w-md">
        <SortableList
          label="Marching order through Moria"
          items={order}
          onReorder={setOrder}
          getKey={(w) => w.id}
          getLabel={(w) => w.name}
          renderItem={(w, i) => (
            <div className="flex items-baseline gap-3">
              <span className="w-5 shrink-0 text-right text-[13px] text-muted tabular">{i + 1}</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-ink">{w.name}</span>
                <span className="block truncate text-[13px] text-muted">{w.role}</span>
              </span>
            </div>
          )}
        />
      </div>
    </Stage>
  );
}

function PanelsDemo() {
  const list = (
    <div className="flex flex-col gap-1 p-3">
      <p className="px-2 pb-1 text-xs text-muted">MU-TH-UR 6000</p>
      {["Special order 937", "Crew status", "Course correction", "Signal from LV-426"].map((t, i) => (
        <div key={t} className={i === 0 ? "rounded-control bg-active px-2 py-1.5 text-sm font-medium text-ink" : "px-2 py-1.5 text-sm text-ink"}>{t}</div>
      ))}
    </div>
  );
  const message = (
    <div className="p-5">
      <p className="text-sm font-semibold text-ink">Special order 937</p>
      <p className="mt-1 text-xs text-muted">Science officer’s eyes only</p>
      <p className="mt-4 max-w-prose text-sm leading-relaxed text-ink">
        Nostromo rerouted to new co-ordinates. Investigate life form. Gather specimen. Priority one: insure return of organism
        for analysis. All other considerations secondary. Crew expendable.
      </p>
    </div>
  );
  const reply = (
    <div className="p-5">
      <p className="text-sm text-muted">Reply</p>
      <p className="mt-2 text-sm text-ink">Request clarification on science inability to neutralise alien.</p>
      <p className="mt-2 text-sm text-ink">Unable to clarify.</p>
    </div>
  );
  return (
    <Stage className="p-0 sm:p-0">
      <div className="h-[420px] w-full overflow-hidden rounded-card bg-surface">
        <ResizablePanels
          label="Resize the message list"
          defaultSize={32}
          minFirst={150}
          minSecond={220}
          first={list}
          second={<ResizablePanels direction="vertical" label="Resize the reply" defaultSize={62} minFirst={140} minSecond={100} first={message} second={reply} />}
        />
      </div>
    </Stage>
  );
}

function CalendarDemo() {
  const events = useMemo<CalEvent[]>(() => {
    const t = new Date();
    const d = (n: number) => new Date(t.getFullYear(), t.getMonth(), t.getDate() + n);
    return [
      { id: "1", date: d(0), title: "Experiment at Twin Pines Mall", time: "01:15", place: "Parking lot", tone: "accent" },
      { id: "2", date: d(0), title: "Pick up plutonium", time: "09:00", place: "Doc’s lab", tone: "negative" },
      { id: "3", date: d(0), title: "Band audition", time: "14:30", place: "Hill Valley High", tone: "info" },
      { id: "4", date: d(0), title: "Skateboard repair", time: "17:00", tone: "positive" },
      { id: "5", date: d(2), title: "Enchantment Under the Sea dance", time: "20:00", place: "School gym", tone: "info" },
      { id: "6", date: d(2), title: "Lightning strikes clock tower", time: "22:04", place: "Courthouse square", tone: "warning" },
      { id: "7", date: d(5), title: "Biff’s car wax appointment", time: "10:00", tone: "positive" },
      { id: "8", date: d(-3), title: "Save the clock tower collection", time: "12:00", place: "Town square", tone: "accent" },
      { id: "9", date: d(9), title: "Mr. Fusion service", time: "08:30", tone: "warning" },
      { id: "10", date: d(13), title: "Test hoverboard over the pond", time: "16:00", tone: "info" },
      { id: "11", date: d(-8), title: "Pay Doc’s gigawatt bill", tone: "negative" },
    ];
  }, []);
  return (
    <Stage className="p-0 sm:p-0">
      <div className="w-full rounded-card bg-surface p-4 sm:p-5">
        <CalendarMonth events={events} />
      </div>
    </Stage>
  );
}

type Dino = { name: string; diet: "carnivore" | "herbivore"; paddock: string; status: "contained" | "loose"; length: number };
const dinos: Dino[] = [
  { name: "Tyrannosaurus rex", diet: "carnivore", paddock: "Paddock 9", status: "loose", length: 12.3 },
  { name: "Velociraptor (big one)", diet: "carnivore", paddock: "Raptor pen", status: "contained", length: 1.8 },
  { name: "Velociraptor", diet: "carnivore", paddock: "Raptor pen", status: "loose", length: 1.8 },
  { name: "Dilophosaurus", diet: "carnivore", paddock: "Paddock 6", status: "loose", length: 3.0 },
  { name: "Triceratops", diet: "herbivore", paddock: "Paddock 4", status: "contained", length: 9.0 },
  { name: "Brachiosaurus", diet: "herbivore", paddock: "Paddock 2", status: "contained", length: 22.0 },
  { name: "Gallimimus", diet: "herbivore", paddock: "Paddock 3", status: "loose", length: 6.0 },
  { name: "Parasaurolophus", diet: "herbivore", paddock: "Paddock 2", status: "contained", length: 9.5 },
];

function FilterDemo() {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<FilterValues>({ status: ["loose"] });
  const [sort, setSort] = useState("name");
  const rows = dinos
    .filter((d) => d.name.toLowerCase().includes(query.trim().toLowerCase()))
    .filter((d) => Object.entries(filters).every(([k, v]) => !v.length || v.includes(String(d[k as keyof Dino]))))
    .sort((a, b) => (sort === "length" ? b.length - a.length : sort === "paddock" ? a.paddock.localeCompare(b.paddock) : a.name.localeCompare(b.name)));
  return (
    <Stage align="start" className="flex-col">
      <FilterBar
        searchLabel="Search the island"
        query={query}
        onQueryChange={setQuery}
        filters={filters}
        onFiltersChange={setFilters}
        fields={[
          { id: "status", label: "Status", options: [{ value: "contained", label: "Contained" }, { value: "loose", label: "Loose" }] },
          { id: "diet", label: "Diet", options: [{ value: "carnivore", label: "Carnivore" }, { value: "herbivore", label: "Herbivore" }] },
          { id: "paddock", label: "Paddock", options: [...new Set(dinos.map((d) => d.paddock))].map((p) => ({ value: p, label: p })) },
        ]}
        sorts={[{ id: "name", label: "Name" }, { id: "length", label: "Length" }, { id: "paddock", label: "Paddock" }]}
        sort={sort}
        onSortChange={setSort}
        views={[
          { id: "all", label: "Whole island", filters: {} },
          { id: "loose", label: "On the loose", filters: { status: ["loose"] } },
          { id: "teeth", label: "Carnivores", filters: { diet: ["carnivore"] }, sort: "length" },
        ]}
        summary={`${rows.length} of ${dinos.length}`}
      />
      <Variant label="Results" className="w-full">
        <ul className="flex w-full flex-col gap-1.5">
          {rows.map((d) => (
            <li key={d.name} className="flex items-center gap-3 rounded-control bg-surface px-3 py-2 text-sm">
              <span className="min-w-0 flex-1 truncate text-ink">{d.name}</span>
              <span className="hidden w-28 text-muted sm:block">{d.paddock}</span>
              <span className="w-14 text-right text-muted tabular">{d.length} m</span>
              <span className={d.status === "loose" ? "w-20 text-right text-negative" : "w-20 text-right text-muted"}>{d.status === "loose" ? "Loose" : "Contained"}</span>
            </li>
          ))}
          {rows.length === 0 && <li className="rounded-control bg-surface px-3 py-3 text-sm text-muted">No dinosaurs match. Life, uh, finds a way.</li>}
        </ul>
      </Variant>
    </Stage>
  );
}

export const category: Category = {
  id: "workspace",
  name: "Workspace",
  summary: "Tools people work in: trees, boards, lists, split panes, calendars and filters.",
  entries: [
    { id: "tree-view", name: "Tree view", summary: "A file explorer with the full keyboard model of a tree; folders open with a smooth change of height.", files: ["src/kiln/components/workspace/TreeView.tsx", "src/kiln/motion.ts", "src/kiln/cn.ts"], Demo: TreeDemo },
    { id: "kanban-board", name: "Kanban board", summary: "Drag cards within and between columns, or move them from each card’s menu. Counts follow.", files: ["src/kiln/components/workspace/KanbanBoard.tsx", "src/kiln/components/menus/DropdownMenu.tsx", "src/kiln/components/shared/Anchored.tsx", "src/kiln/motion.ts", "src/kiln/cn.ts"], Demo: KanbanDemo },
    { id: "sortable-list", name: "Sortable list", summary: "Reorder by dragging a handle, or focus the handle and use the arrow keys.", files: ["src/kiln/components/workspace/SortableList.tsx", "src/kiln/motion.ts", "src/kiln/cn.ts"], Demo: SortableDemo },
    { id: "resizable-panels", name: "Resizable panels", summary: "Split panes with a draggable divider: arrow keys, limits, and a double-click to reset.", files: ["src/kiln/components/workspace/ResizablePanels.tsx", "src/kiln/motion.ts", "src/kiln/cn.ts"], Demo: PanelsDemo },
    { id: "calendar-month", name: "Calendar month", summary: "A month of events with a day agenda; months and days slide the way you move.", files: ["src/kiln/components/workspace/CalendarMonth.tsx", "src/kiln/components/shared/Anchored.tsx", "src/kiln/motion.ts", "src/kiln/cn.ts"], Demo: CalendarDemo },
    { id: "filter-bar", name: "Filter bar", summary: "Search, filter chips with their own editors, a sort menu and saved views.", files: ["src/kiln/components/workspace/FilterBar.tsx", "src/kiln/components/menus/DropdownMenu.tsx", "src/kiln/components/shared/Anchored.tsx", "src/kiln/motion.ts", "src/kiln/cn.ts", "src/kiln/controllable.ts"], Demo: FilterDemo },
  ],
};
