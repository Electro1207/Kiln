import { useState } from "react";
import {
  Bell, CalendarDays, Download, Filter, Ghost, LayoutDashboard, Mail, MapPin, Mountain, MoreHorizontal, Pencil, Phone, Plane, Plus,
  Radar, Rocket, Search, Share2, Snowflake, Target, Trees, Users, Zap, Gavel, Shield,
} from "lucide-react";
import type { Category } from "../types";
import { Stage, Variant, Btn, IBtn } from "../ui";
import { AppShell } from "../../kiln/components/app-shells/AppShell";
import { StackedLayout } from "../../kiln/components/app-shells/StackedLayout";
import { PageHeading, SectionHeading } from "../../kiln/components/app-shells/PageHeading";
import { CardHeading, CollapsingActions } from "../../kiln/components/app-shells/HeadingParts";
import { Breadcrumbs } from "../../kiln/components/wayfinding/Breadcrumbs";
import { PeopleGrid, ProjectGrid } from "../../kiln/components/app-shells/GridList";
import { StackedList, type StackedRow } from "../../kiln/components/app-shells/StackedList";
import { CommentFeed, type FeedEntry } from "../../kiln/components/communication/CommentFeed";
import { WeekCalendar, type CalendarEvent } from "../../kiln/components/workspace/WeekCalendar";
import { GanttChart } from "../../kiln/components/workspace/GanttChart";
import { Avatar } from "../../kiln/components/data-display/Avatar";
import { Badge } from "../../kiln/components/status/Badge";
import { SegmentedControl } from "../../kiln/components/buttons/SegmentedControl";
import { Stat } from "../../kiln/components/data-display/Stat";
import { BarChart } from "../../kiln/components/charts/BarChart";
import { Card, CardHeader } from "../../kiln/components/cards/Card";
import { cn } from "../../kiln/cn";


/** A product's mark: an icon on a pale tile in the accent. */
function Mark({ icon, name, compact }: { icon: React.ReactNode; name: string; compact?: boolean }) {
  return (
    <span className="flex min-w-0 items-center gap-2.5">
      <span className="grid size-8 shrink-0 place-items-center rounded-[9px] bg-accent-soft text-accent [&>svg]:size-[18px]">{icon}</span>
      <span className={cn("truncate text-[15px] font-semibold text-ink transition-opacity duration-200", compact && "opacity-0")}>{name}</span>
    </span>
  );
}

/** A framed preview at a realistic scale. */
function Frame({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("w-full overflow-hidden rounded-sheet border border-line", className)}>{children}</div>;
}

/** A StackedList whose rows report which one was opened. */
function OpenList({ label, rows, className }: { label: string; rows: StackedRow[]; className?: string }) {
  const [opened, setOpened] = useState<string | null>(null);
  return (
    <div className="w-full">
      <StackedList label={label} rows={rows} onOpen={setOpened} className={className} />
      <p className="px-4 py-2 text-[13px] text-muted tabular" aria-live="polite">
        {opened ? `Opened ${rows.find((r) => r.id === opened)?.label}` : "Select a row to open it"}
      </p>
    </div>
  );
}

const SQUADRONS: StackedRow[] = [
  { id: "red", label: "Red Squadron", title: "Red Squadron", subtitle: "T-65B X-wing · Wedge Antilles", leading: <Avatar name="Wedge Antilles" />, status: <Badge tone="positive" dot>Ready</Badge>, detail: "12 of 12 fighters" },
  { id: "gold", label: "Gold Squadron", title: "Gold Squadron", subtitle: "BTL-A4 Y-wing · Lando Calrissian", leading: <Avatar name="Lando Calrissian" />, status: <Badge tone="positive" dot>Ready</Badge>, detail: "8 of 8 fighters" },
  { id: "green", label: "Green Squadron", title: "Green Squadron", subtitle: "RZ-1 A-wing · Arvel Crynyd", leading: <Avatar name="Arvel Crynyd" />, status: <Badge tone="warning" dot>Refuelling</Badge>, detail: "6 of 8 fighters" },
  { id: "blue", label: "Blue Squadron", title: "Blue Squadron", subtitle: "A/SF-01 B-wing · Ten Numb", leading: <Avatar name="Ten Numb" />, status: <Badge tone="negative" dot>In repair</Badge>, detail: "4 of 6 fighters" },
];

function AppShellDemo() {
  const [page, setPage] = useState("missions");
  return (
    <Stage className="p-3 sm:p-6">
      <Frame>
        <AppShell
          height={620}
          value={page}
          onNavigate={setPage}
          brand={(c) => <Mark icon={<Rocket />} name="Rebel Command" compact={c} />}
          nav={[
            {
              items: [
                { id: "overview", label: "Overview", icon: <LayoutDashboard /> },
                { id: "missions", label: "Missions", icon: <Target />, badge: 3 },
                { id: "pilots", label: "Pilots", icon: <Users /> },
                { id: "fleet", label: "Fleet", icon: <Plane /> },
                { id: "intel", label: "Intel", icon: <Radar /> },
              ],
            },
            {
              label: "Bases",
              items: [
                { id: "echo", label: "Echo Base, Hoth", icon: <Snowflake /> },
                { id: "yavin", label: "Great Temple, Yavin 4", icon: <Trees /> },
                { id: "dantooine", label: "Dantooine", icon: <Mountain /> },
              ],
            },
          ]}
          topBar={
            <>
              <button type="button" onClick={() => setPage("intel")} className="hidden h-9 w-64 items-center gap-2 rounded-full border border-line-strong bg-surface px-3 text-sm text-faint transition-colors hover:border-faint @2xl:flex">
                <Search className="size-4" /> Search missions
              </button>
              <IBtn icon={<Bell />} variant="ghost" aria-label="Notifications" />
              <Avatar name="Mon Mothma" size="sm" />
            </>
          }
          footer={(c) => (
            <div className="flex items-center gap-3 rounded-control px-2 py-1.5">
              <Avatar name="Mon Mothma" size="sm" status="online" />
              <span className={cn("min-w-0 transition-opacity duration-200", c && "opacity-0")}>
                <span className="block truncate text-sm font-medium text-ink">Mon Mothma</span>
                <span className="block truncate text-xs text-muted">Chief of State</span>
              </span>
            </div>
          )}
        >
          <div className="flex flex-col gap-6 p-5 @3xl:p-8">
            <PageHeading
              above={<Breadcrumbs items={[{ label: "Missions", href: "#/_/dashboard" }, { label: "Endor" }]} />}
              title="Battle of Endor"
              meta={[
                { icon: <MapPin />, label: "Forest moon of Endor" },
                { icon: <CalendarDays />, label: "Launch in 6 hours" },
                { icon: <Shield />, label: "Shield generator up" },
              ]}
              actions={
                <CollapsingActions
                  actions={[
                    { label: "Share", icon: <Share2 /> },
                    { label: "Edit", icon: <Pencil /> },
                    { label: "Launch", icon: <Rocket />, primary: true },
                  ]}
                />
              }
            />
            <div className="grid grid-cols-2 gap-x-6 gap-y-6 @2xl:grid-cols-3">
              <Stat label="Fighters ready" value={30} note="of 34" />
              <Stat label="Capital ships" value={23} delta={0.15} note="since Hoth" />
              <Stat label="Pilots on roster" value={112} />
            </div>
            <div className="flex flex-col gap-3">
              <h2 className="text-sm font-semibold text-ink">Squadrons</h2>
              <OpenList label="Squadrons" rows={SQUADRONS} />
            </div>
          </div>
        </AppShell>
      </Frame>
    </Stage>
  );
}

const CALLS: StackedRow[] = [
  { id: "c1", label: "Sedgewick Hotel", title: "Sedgewick Hotel, 12th floor", subtitle: "Class 5 full-roaming vapor", leading: <Avatar name="Peter Venkman" />, status: <Badge tone="warning" dot>En route</Badge>, detail: "18:42" },
  { id: "c2", label: "New York Public Library", title: "New York Public Library", subtitle: "Free-floating, full-torso apparition", leading: <Avatar name="Ray Stantz" />, status: <Badge tone="positive" dot>Captured</Badge>, detail: "16:05" },
  { id: "c3", label: "55 Central Park West", title: "55 Central Park West, apt 14A", subtitle: "Refrigerator, terror dog", leading: <Avatar name="Egon Spengler" />, status: <Badge tone="negative" dot>Escalated</Badge>, detail: "15:30" },
  { id: "c4", label: "Fort Detmerring", title: "Fort Detmerring", subtitle: "Routine inspection", leading: <Avatar name="Winston Zeddemore" />, status: <Badge tone="neutral" dot>Scheduled</Badge>, detail: "Tomorrow" },
];

function StackedLayoutDemo() {
  const [page, setPage] = useState("dispatch");
  return (
    <Stage className="p-3 sm:p-6">
      <Frame>
        <StackedLayout
          height={600}
          brand={<Mark icon={<Ghost />} name="Ghostbusters" />}
          links={[
            { id: "dispatch", label: "Dispatch" },
            { id: "clients", label: "Clients" },
            { id: "equipment", label: "Equipment" },
            { id: "invoices", label: "Invoices" },
          ]}
          value={page}
          onNavigate={setPage}
          actions={
            <>
              <IBtn icon={<Bell />} variant="ghost" aria-label="Notifications" />
              <Avatar name="Janine Melnitz" size="sm" />
            </>
          }
          header={
            <PageHeading
              title="Dispatch"
              meta={[
                { icon: <MapPin />, label: "14 North Moore Street" },
                { icon: <Zap />, label: "3 crews out" },
              ]}
              actions={
                <CollapsingActions
                  actions={[
                    { label: "Filter", icon: <Filter /> },
                    { label: "Export", icon: <Download /> },
                    { label: "New call", icon: <Plus />, primary: true },
                  ]}
                />
              }
            />
          }
        >
          <div className="p-4 @3xl:p-6">
            <OpenList label="Today's calls" rows={CALLS} />
          </div>
        </StackedLayout>
      </Frame>
    </Stage>
  );
}

function HeadingsDemo() {
  return (
    <Stage align="start" className="flex-col gap-8">
      <Variant label="Page heading (on phones the secondary actions fold into a menu)" className="w-full">
        <div className="w-full">
          <div className="min-w-0 rounded-card bg-surface p-5 sm:p-6">
            <PageHeading
              above={<Breadcrumbs items={[{ label: "Warehouse", href: "#/_/stacked-list" }, { label: "Aisle 27", href: "#/_/stacked-list" }, { label: "Crate 9906753" }]} />}
              title="Crate 9906753"
              meta={[
                { icon: <MapPin />, label: "Government warehouse, Washington" },
                { icon: <CalendarDays />, label: "Stored 1936" },
              ]}
              actions={<CollapsingActions actions={[{ label: "Edit", icon: <Pencil /> }, { label: "Share", icon: <Share2 /> }, { label: "Open crate", icon: <Gavel />, primary: true }]} />}
            />
          </div>
        </div>
      </Variant>
      <Variant label="Section heading" className="w-full">
        <div className="w-full rounded-card bg-surface p-5 sm:p-6">
          <SectionHeading title="Top men" description="Who is working on it right now." actions={<Btn size="sm" variant="secondary">Assign</Btn>} />
        </div>
      </Variant>
      <Variant label="Card headings" className="w-full">
        <div className="grid w-full gap-4 md:grid-cols-2">
          <Card>
            <CardHeading
              leading={<Avatar name="Egon Spengler" />}
              title="Egon Spengler"
              meta="Posted in Containment · 2 hours ago"
              action={<IBtn icon={<MoreHorizontal />} variant="ghost" size="sm" aria-label="Post options" />}
            />
            <p className="mt-3 text-sm text-ink">“Don't cross the streams.” I mean it this time.</p>
          </Card>
          <Card>
            <CardHeading
              title="Ring-bearer's progress"
              meta="Updated by Gandalf"
              action={<Btn size="sm" variant="secondary">View map</Btn>}
            />
            <p className="mt-3 text-sm text-ink">Rivendell to Mordor: about 1,350 miles on foot.</p>
          </Card>
        </div>
      </Variant>
    </Stage>
  );
}

const TEAM = [
  { name: "Peter Venkman", role: "Parapsychologist" },
  { name: "Ray Stantz", role: "Occult engineer" },
  { name: "Egon Spengler", role: "Physicist" },
  { name: "Winston Zeddemore", role: "Field technician" },
  { name: "Janine Melnitz", role: "Dispatch" },
  { name: "Louis Tully", role: "Accountant" },
];

function GridListDemo() {
  return (
    <Stage align="start" className="flex-col gap-8">
      <Variant label="People" className="w-full">
        <PeopleGrid
          people={TEAM.map((p) => ({
            id: p.name,
            name: p.name,
            role: p.role,
            avatar: <Avatar name={p.name} size="lg" />,
            badge: p.name === "Louis Tully" ? <Badge tone="info">Keymaster</Badge> : undefined,
            actions: [
              { label: "Email", icon: <Mail />, href: "mailto:keymaster@ecto.example" },
              { label: "Call", icon: <Phone />, href: "tel:2125552368" },
            ],
          }))}
        />
      </Variant>
      <Variant label="Projects" className="w-full">
        <ProjectGrid
          projects={[
            { id: "ds2", name: "Death Star II", initials: "DS", hue: 0, meta: "Endor orbit · 61% built" },
            { id: "jp", name: "Jurassic Park", initials: "JP", hue: 140, meta: "Isla Nublar · opening delayed" },
            { id: "sk", name: "Skynet", initials: "SK", hue: 210, meta: "Cyberdyne · ahead of schedule" },
            { id: "nx", name: "Nexus-6 line", initials: "N6", hue: 35, meta: "Tyrell Corp. · four-year lifespan" },
          ].map((p) => ({
            ...p,
            href: "#/_/gantt",
            menu: <IBtn icon={<MoreHorizontal />} variant="ghost" size="sm" aria-label={`${p.name} options`} />,
          }))}
        />
      </Variant>
    </Stage>
  );
}

const CREW: StackedRow[] = [
  { id: "dallas", label: "Dallas", title: "Arthur Dallas", subtitle: "Captain", leading: <Avatar name="Arthur Dallas" />, status: <Badge tone="positive" dot>On duty</Badge>, detail: "Bridge" },
  { id: "kane", label: "Kane", title: "Gilbert Kane", subtitle: "Executive officer", leading: <Avatar name="Gilbert Kane" />, status: <Badge tone="negative" dot>Med bay</Badge>, detail: "Do not open" },
  { id: "ripley", label: "Ripley", title: "Ellen Ripley", subtitle: "Warrant officer", leading: <Avatar name="Ellen Ripley" />, status: <Badge tone="positive" dot>On duty</Badge>, detail: "Bridge" },
  { id: "ash", label: "Ash", title: "Ash", subtitle: "Science officer", leading: <Avatar name="Ash" />, status: <Badge tone="warning" dot>Lab</Badge>, detail: "Special order 937" },
  { id: "lambert", label: "Lambert", title: "Joan Lambert", subtitle: "Navigator", leading: <Avatar name="Joan Lambert" />, status: <Badge tone="positive" dot>On duty</Badge>, detail: "Bridge" },
  { id: "parker", label: "Parker", title: "Dennis Parker", subtitle: "Chief engineer", leading: <Avatar name="Dennis Parker" />, status: <Badge tone="neutral" dot>Engineering</Badge>, detail: "Asking about bonuses" },
  { id: "jones", label: "Jones", title: "Jones", subtitle: "Ship's cat", leading: <Avatar name="Jones" />, status: <Badge tone="neutral" dot>Missing</Badge>, detail: "Last seen: hold" },
];

function StackedListDemo() {
  const [mode, setMode] = useState<"open" | "select">("open");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [opened, setOpened] = useState<string | null>(null);
  return (
    <Stage className="flex-col items-stretch">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SegmentedControl<"open" | "select">
          size="sm"
          label="List mode"
          value={mode}
          onChange={(m) => { setMode(m); setSelected(new Set()); }}
          options={[{ value: "open", label: "Open" }, { value: "select", label: "Select" }]}
        />
        <span className="tabular text-sm text-muted" aria-live="polite">
          {mode === "select" ? `${selected.size} selected` : opened ? `Opened ${CREW.find((c) => c.id === opened)?.label}` : "USCSS Nostromo, crew of seven"}
        </span>
      </div>
      <StackedList
        label="Nostromo crew"
        rows={CREW}
        selected={mode === "select" ? selected : undefined}
        onSelectedChange={mode === "select" ? setSelected : undefined}
        onOpen={setOpened}
      />
    </Stage>
  );
}

const COUNCIL: FeedEntry[] = [
  { kind: "event", id: "e1", icon: <Users />, text: "Elrond called a council of Elves, Men and Dwarves", time: "Oct 25, 10:00" },
  { kind: "comment", id: "c1", author: "Boromir", time: "10:42", body: "One does not simply walk into Mordor." },
  { kind: "comment", id: "c2", author: "Frodo Baggins", time: "11:05", body: "I will take it. I will take the Ring to Mordor. Though… I do not know the way." },
  { kind: "comment", id: "c3", author: "Gandalf", time: "11:06", body: "I will help you bear this burden, Frodo Baggins, as long as it is yours to bear." },
  { kind: "comment", id: "c4", author: "Aragorn", time: "11:07", body: "If by my life or death I can protect you, I will. You have my sword." },
  { kind: "comment", id: "c5", author: "Legolas", time: "11:07", body: "And you have my bow." },
  { kind: "comment", id: "c6", author: "Gimli", time: "11:07", body: "And my axe!" },
];

function CommentFeedDemo() {
  const [entries, setEntries] = useState(COUNCIL);
  return (
    <Stage align="start">
      <div className="w-full max-w-xl">
        <CommentFeed
          entries={entries}
          me={{ name: "Samwise Gamgee" }}
          onComment={(t) =>
            setEntries((e) => [...e, { kind: "comment", id: `n${e.length}`, author: "Samwise Gamgee", time: "Just now", body: t }])
          }
        />
        <p className="mt-3 text-xs text-muted">Try: Mr. Frodo is not going anywhere without me.</p>
      </div>
    </Stage>
  );
}

const at = (d: number, h: number, m = 0) => new Date(1955, 10, d, h, m);
const WEEK = Array.from({ length: 7 }, (_, i) => new Date(1955, 10, 7 + i));
const EVENTS: CalendarEvent[] = [
  { id: "e1", title: "Homeroom", start: at(7, 8), end: at(7, 9), location: "Hill Valley High", tone: "info" },
  { id: "e2", title: "Find Doc Brown", start: at(7, 15), end: at(7, 17), location: "1640 Riverside Drive" },
  { id: "e3", title: "Plan the dance with George", start: at(8, 19), end: at(8, 21), location: "Doc's garage", tone: "positive" },
  { id: "e4", title: "Lunch", start: at(9, 12), end: at(9, 13), location: "Lou's Café", tone: "warning" },
  { id: "e5", title: "George asks Lorraine", start: at(9, 12, 15), end: at(9, 12, 45), location: "Lou's Café", tone: "accent" },
  { id: "e6", title: "Measure the clock tower cable", start: at(10, 16), end: at(10, 18), location: "Courthouse square", tone: "positive" },
  { id: "e7", title: "Rehearse the parking-lot rescue", start: at(11, 20), end: at(11, 21, 30), location: "Hill Valley High", tone: "info" },
  { id: "e8", title: "Enchantment Under the Sea dance", start: at(12, 20), end: at(12, 23), location: "Gymnasium" },
  { id: "e9", title: "George meets Biff", start: at(12, 21, 30), end: at(12, 22), location: "Parking lot", tone: "warning" },
  { id: "e10", title: "Lightning strikes the clock tower", start: at(12, 22, 4), end: at(12, 22, 30), location: "Courthouse", tone: "negative" },
];

function CalendarDemo() {
  const [sel, setSel] = useState<CalendarEvent | null>(EVENTS[9]);
  const t = (d: Date) => d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  return (
    <Stage className="flex-col items-stretch">
      <WeekCalendar days={WEEK} events={EVENTS} now={at(12, 21, 47)} startHour={7} endHour={24} height={480} onSelect={setSel} selectedId={sel?.id} />
      <div className="flex min-h-12 items-center justify-between gap-4 rounded-card bg-surface px-4 py-3 text-sm" aria-live="polite">
        {sel ? (
          <>
            <span className="min-w-0">
              <span className="block truncate font-medium text-ink">{sel.title}</span>
              <span className="block truncate text-muted">
                {sel.start.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}, {t(sel.start)} to {t(sel.end)}
              </span>
            </span>
            <span className="shrink-0 text-muted">{sel.location}</span>
          </>
        ) : (
          <span className="text-muted">Pick an event.</span>
        )}
      </div>
    </Stage>
  );
}

function GanttDemo() {
  return (
    <Stage>
      <GanttChart
        title="The Quest of the Ring, Third Age 3018 to 3019"
        from="3018-10-20"
        to="3019-04-07"
        today="3019-03-10"
        dayWidth={8}
        tasks={[
          { id: "council", name: "Council of Elrond", start: "3018-10-25", end: "3018-10-25", milestone: true, owner: "Elrond" },
          { id: "scouts", name: "Scouts search the lands", start: "3018-10-26", end: "3018-12-17", progress: 1, after: ["council"], owner: "Rangers and Elves" },
          { id: "depart", name: "Leave Rivendell", start: "3018-12-25", end: "3018-12-25", milestone: true, after: ["scouts"], owner: "The Fellowship" },
          { id: "caradhras", name: "Hollin and Caradhras", start: "3018-12-26", end: "3019-01-12", progress: 1, after: ["depart"], owner: "Gandalf" },
          { id: "moria", name: "Mines of Moria", start: "3019-01-13", end: "3019-01-15", progress: 1, after: ["caradhras"], owner: "Gandalf" },
          { id: "lorien", name: "Rest in Lothlórien", start: "3019-01-17", end: "3019-02-16", progress: 1, after: ["moria"], owner: "Galadriel" },
          { id: "anduin", name: "Down the Anduin", start: "3019-02-16", end: "3019-02-25", progress: 1, after: ["lorien"], owner: "Aragorn" },
          { id: "breaking", name: "Breaking of the Fellowship", start: "3019-02-26", end: "3019-02-26", milestone: true, after: ["anduin"] },
          { id: "mordor", name: "Frodo and Sam to Mordor", start: "3019-02-26", end: "3019-03-25", progress: 0.5, after: ["breaking"], owner: "Frodo, Sam (and Gollum)" },
          { id: "rohan", name: "Ride to Minas Tirith", start: "3019-03-02", end: "3019-03-15", progress: 0.65, after: ["breaking"], owner: "Aragorn, Théoden" },
          { id: "doom", name: "Destroy the Ring", start: "3019-03-25", end: "3019-03-25", milestone: true, after: ["mordor"] },
        ]}
      />
    </Stage>
  );
}

function DashboardDemo() {
  return (
    <Stage className="p-3 sm:p-6">
      <div className="@container flex w-full flex-col gap-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-[22px] font-semibold tracking-tight text-ink">Dispatch overview</h2>
            <p className="text-sm text-muted">Ghostbusters, Inc. · Saturday, June 30, 1984</p>
          </div>
          <Btn size="sm" leading={<Plus />}>New call</Btn>
        </div>
        <div className="grid grid-cols-1 gap-4 @lg:grid-cols-2 @4xl:grid-cols-4">
          <Card><Stat label="Calls today" value={37} delta={0.32} note="vs last Saturday" /></Card>
          <Card><Stat label="Captures" value={14} delta={0.17} note="vs last Saturday" /></Card>
          <Card><Stat label="Containment unit load" value={82} format={{ style: "unit", unit: "percent" }} delta={0.09} invert note="warn at 85%" /></Card>
          <Card><Stat locale="en-US" label="Billed today" value={5270} format={{ style: "currency", currency: "USD", maximumFractionDigits: 0 }} delta={0.21} /></Card>
        </div>
        <div className="grid grid-cols-1 gap-4 @4xl:grid-cols-[1.4fr_1fr]">
          <Card>
            <CardHeader title="Captures per day" description="Last two weeks" />
            <BarChart
              className="mt-4"
              height={180}
              title="Captures per day, last two weeks"
              data={[6, 8, 7, 9, 11, 10, 12, 9, 13, 12, 15, 11, 16, 14].map((v, i) => ({ label: `${17 + i}`, value: v }))}
            />
          </Card>
          <Card padded={false} className="flex flex-col overflow-hidden">
            <div className="p-5 pb-3">
              <CardHeader title="Open calls" description="Oldest first" />
            </div>
            <OpenList label="Open calls" rows={CALLS.slice(0, 3)} className="rounded-none border-x-0 border-b-0" />
          </Card>
        </div>
      </div>
    </Stage>
  );
}

export const category: Category = {
  id: "layouts",
  name: "Layouts & app shells",
  summary: "Whole-screen layouts, headings and the lists, calendars and boards that live in them.",
  entries: [
    { id: "app-shell", name: "Sidebar layout", summary: "A tinted frame with a collapsible sidebar and a top bar around a sheet; a drawer on phones. Collapsing slides the sheet, it never animates a width.", files: ["src/kiln/components/app-shells/AppShell.tsx", "src/kiln/components/overlays/Drawer.tsx", "src/kiln/cn.ts", "src/kiln/motion.ts", "src/kiln/components/shared/useOverlay.ts"], Demo: AppShellDemo },
    { id: "stacked-layout", name: "Stacked layout", summary: "One top bar, the page heading on the ground, then the content on a sheet; the links fold into a panel on phones.", files: ["src/kiln/components/app-shells/StackedLayout.tsx", "src/kiln/cn.ts", "src/kiln/motion.ts"], Demo: StackedLayoutDemo },
    { id: "headings-layout", name: "Headings", summary: "Page, section and card headings; a page's secondary actions fold into a menu when it gets narrow.", files: ["src/kiln/components/app-shells/PageHeading.tsx", "src/kiln/components/app-shells/HeadingParts.tsx", "src/kiln/components/wayfinding/Breadcrumbs.tsx", "src/kiln/components/menus/DropdownMenu.tsx", "src/kiln/components/buttons/Button.tsx", "src/kiln/cn.ts", "src/kiln/motion.ts", "src/kiln/components/shared/Anchored.tsx"], Demo: HeadingsDemo },
    { id: "grid-list", name: "Grid lists", summary: "People as cards with a split footer of actions, and projects as compact tiles.", files: ["src/kiln/components/app-shells/GridList.tsx", "src/kiln/cn.ts", "src/kiln/motion.ts"], Demo: GridListDemo },
    { id: "stacked-list", name: "Stacked list", summary: "Rows with a picture, two lines each side and a chevron; switch to select mode for checkboxes.", files: ["src/kiln/components/app-shells/StackedList.tsx", "src/kiln/components/tables/Table.tsx", "src/kiln/cn.ts", "src/kiln/motion.ts", "src/kiln/controllable.ts"], Demo: StackedListDemo },
    { id: "comment-feed", name: "Comment feed", summary: "A thread of comments and events with a box to add one; new comments rise into place.", files: ["src/kiln/components/communication/CommentFeed.tsx", "src/kiln/components/data-display/Avatar.tsx", "src/kiln/components/buttons/Button.tsx", "src/kiln/cn.ts", "src/kiln/motion.ts"], Demo: CommentFeedDemo },
    { id: "week-calendar", name: "Week calendar", summary: "Events on a time grid, overlapping ones side by side, a line for now; one day at a time on phones.", files: ["src/kiln/components/workspace/WeekCalendar.tsx", "src/kiln/cn.ts", "src/kiln/motion.ts"], Demo: CalendarDemo },
    { id: "gantt", name: "Gantt chart", summary: "Task bars over dates with dependency arrows and a line for today; hover a task to bring its chain forward.", files: ["src/kiln/components/workspace/GanttChart.tsx", "src/kiln/cn.ts", "src/kiln/motion.ts"], Demo: GanttDemo },
    { id: "dashboard", name: "Dashboard screen", summary: "An overview screen built from Stat, BarChart, Card and StackedList: colour on the data, not the chrome.", files: ["src/kiln/components/data-display/Stat.tsx", "src/kiln/components/charts/BarChart.tsx", "src/kiln/components/cards/Card.tsx", "src/kiln/components/app-shells/StackedList.tsx", "src/kiln/cn.ts", "src/kiln/motion.ts", "src/kiln/components/tables/Table.tsx", "src/kiln/controllable.ts"], Demo: DashboardDemo },
  ],
};
