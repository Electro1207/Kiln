import type { ReactNode } from "react";
import { CircleAlert, CircleCheck, CornerDownLeft, Info, Search } from "lucide-react";
import { Switch } from "../../kiln/components/choice-controls/Switch";
import { Slider } from "../../kiln/components/choice-controls/Slider";
import { Rating } from "../../kiln/components/choice-controls/Rating";
import { Checkbox } from "../../kiln/components/choice-controls/Checkbox";
import { Button } from "../../kiln/components/buttons/Button";
import { ButtonGroup } from "../../kiln/components/buttons/ButtonGroup";
import { SegmentedControl } from "../../kiln/components/buttons/SegmentedControl";
import { Badge } from "../../kiln/components/status/Badge";
import { Progress } from "../../kiln/components/status/Progress";
import { ProgressRing } from "../../kiln/components/status/ProgressRing";
import { Meter } from "../../kiln/components/status/Meter";
import { Tabs } from "../../kiln/components/wayfinding/Tabs";
import { BarChart } from "../../kiln/components/charts/BarChart";
import { LineChart } from "../../kiln/components/charts/LineChart";
import { DonutChart } from "../../kiln/components/charts/DonutChart";
import { GaugeChart } from "../../kiln/components/charts/GaugeChart";
import { Sparkline } from "../../kiln/components/charts/Sparkline";
import { OTPInput } from "../../kiln/components/text-input/OTPInput";
import { SearchField } from "../../kiln/components/text-input/SearchField";
import { AvatarGroup } from "../../kiln/components/data-display/Avatar";
import { Stat } from "../../kiln/components/data-display/Stat";
import { Kbd } from "../../kiln/components/data-display/Kbd";
import { NumberTicker } from "../../kiln/components/data-display/NumberTicker";
import { DatePicker } from "../../kiln/components/pickers/DatePicker";
import { Alert } from "../../kiln/components/notices/Alert";
import { cn } from "../../kiln/cn";

/* The faces of the orbit. Each piece is a real Kiln component, driven by one small number (`tick`)
   that the scene bumps every couple of seconds, so the props change and the component animates itself.
   Nothing here owns state: a tick is the only thing that ever changes. */

export type Piece = { id: string; render: (tick: number) => ReactNode };

const noop = () => {};
const pick = <T,>(xs: T[], n: number) => xs[n % xs.length];

function Switchboard({ tick }: { tick: number }) {
  return <Switch checked={tick % 2 === 0} onCheckedChange={noop} label="Flux capacitor" description="Needs 1.21 gigawatts" labelFirst />;
}

function Palette({ tick }: { tick: number }) {
  const rows = [["Open the pod bay doors", "HAL"], ["Take the red pill", "↵"], ["Set the time circuits", "T"]];
  return (
    <div className="-mx-1 space-y-1">
      <div className="flex items-center gap-2 rounded-control bg-raised px-2.5 py-2 text-[13px] text-muted">
        <Search className="size-4" /> Search the galaxy…
      </div>
      {rows.map(([label, key], i) => (
        <div key={label} className={cn("flex items-center justify-between rounded-control px-2.5 py-1.5 text-[13px] transition-colors duration-200", i === tick % 3 ? "bg-active text-ink" : "text-muted")}>
          <span className="truncate">{label}</span>
          {i === tick % 3 ? <CornerDownLeft className="size-3.5" /> : <Kbd size="sm">{key}</Kbd>}
        </div>
      ))}
    </div>
  );
}

const TOASTS = [
  { icon: <CircleCheck className="size-4 text-positive" />, title: "Ring destroyed", note: "Mount Doom has seen better days." },
  { icon: <Info className="size-4 text-info" />, title: "Warp drive charged", note: "Make it so, Number One." },
  { icon: <CircleAlert className="size-4 text-warning" />, title: "Shields at 12%", note: "Pulling out of the asteroid field." },
];

function ToastCard({ tick }: { tick: number }) {
  const t = pick(TOASTS, tick);
  return (
    <div className="flex items-start gap-3 rounded-[10px] bg-elevated p-3">
      <span className="mt-0.5">{t.icon}</span>
      <div className="min-w-0">
        <p className="text-[13.5px] font-medium leading-tight">{t.title}</p>
        <p className="mt-0.5 text-[12.5px] leading-snug text-muted">{t.note}</p>
      </div>
    </div>
  );
}

const PEOPLE = [{ name: "Frodo Baggins" }, { name: "Samwise Gamgee" }, { name: "Gandalf the Grey" }, { name: "Legolas" }, { name: "Gimli" }, { name: "Aragorn" }, { name: "Boromir" }];
const DATES = [new Date(1985, 9, 26), new Date(1955, 10, 5), new Date(2015, 9, 21)];
const BARS = [6, 11, 19, 27, 22, 31, 38].map((v, i) => ({ label: ["Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][i], value: v }));
const LINE = [12, 18, 15, 26, 31, 28, 44, 52].map((v, i) => ({ label: `Day ${i + 1}`, value: v }));

export const PIECES: Piece[] = [
  { id: "switch", render: (t) => <Switchboard tick={t} /> },
  { id: "slider", render: (t) => <Slider label="Deflector shields" value={[pick([64, 88, 31, 52], t)]} onChange={noop} format={(n) => `${n}%`} /> },
  { id: "bar-chart", render: () => <BarChart title="Ghosts captured per month" data={BARS} height={118} /> },
  { id: "tabs", render: (t) => (
    <Tabs label="Ship record" size="sm" value={pick(["overview", "log", "debts"], t)} onChange={noop} items={[
      { id: "overview", label: "Overview", content: <p className="pt-3 text-[13px] text-muted">Millennium Falcon, YT-1300f. Han Solo, owner.</p> },
      { id: "log", label: "Log", content: <p className="pt-3 text-[13px] text-muted">Left Mos Eisley in a hurry, bay 94.</p> },
      { id: "debts", label: "Debts", content: <p className="pt-3 text-[13px] text-muted">17,000 credits, owed to Jabba.</p> },
    ]} />
  ) },
  { id: "rating", render: (t) => (
    <div className="space-y-2">
      <p className="text-[13px] text-muted">Blade Runner, the final cut</p>
      <Rating value={pick([5, 3, 4, 2], t)} onChange={noop} label="Rate Blade Runner" />
    </div>
  ) },
  { id: "progress", render: (t) => <Progress label="Decoding the Matrix" valueText={`${pick([24, 58, 86, 100], t)}%`} value={pick([24, 58, 86, 100], t)} /> },
  { id: "otp-input", render: (t) => <OTPInput length={4} value={"1985".slice(0, t % 5)} onChange={noop} label="Clock tower code" /> },
  { id: "badge", render: (t) => (
    <div className="flex flex-wrap gap-1.5">
      <Badge tone="positive" dot>Ring destroyed</Badge>
      <Badge tone={t % 2 ? "warning" : "info"}>Beam me up</Badge>
      <Badge tone="negative">Dead end</Badge>
      <Badge tone="accent" variant="solid">{12 + (t % 5)}</Badge>
      <Badge>Neutral</Badge>
    </div>
  ) },
  { id: "avatar", render: (t) => (
    <div className="space-y-2">
      <AvatarGroup people={PEOPLE} max={4 + (t % 2)} />
      <p className="text-[13px] text-muted">{pick(["Nine walkers set out", "Gandalf is late", "One does not simply"], t)}</p>
    </div>
  ) },
  { id: "command-palette", render: (t) => <Palette tick={t} /> },
  { id: "gauge", render: (t) => <GaugeChart value={pick([62, 88, 74], t)} max={100} target={88} label="DeLorean speed" unit="mph" /> },
  { id: "button-group", render: (t) => (
    <ButtonGroup label="Pick a side">
      {["Rebels", "Empire", "Scum"].map((s, i) => (
        <Button key={s} size="sm" variant={i === t % 3 ? "primary" : "secondary"} tabIndex={-1}>{s}</Button>
      ))}
    </ButtonGroup>
  ) },
  { id: "toast", render: (t) => <ToastCard tick={t} /> },
  { id: "date-picker", render: (t) => <DatePicker label="Destination time" value={pick(DATES, t)} onChange={noop} /> },
  { id: "donut", render: () => <DonutChart title="The Fellowship" centreLabel="Nine" size={132} thickness={16} data={[{ label: "Hobbits", value: 4 }, { label: "Men", value: 2 }, { label: "Wizard", value: 1 }, { label: "Elf", value: 1 }, { label: "Dwarf", value: 1 }]} /> },
  { id: "line-chart", render: () => <LineChart title="PKE readings" data={LINE} height={104} /> },
  { id: "segmented-control", render: (t) => (
    <SegmentedControl label="Speed" fullWidth value={pick(["light", "ludicrous", "plaid"], t)} onChange={noop} options={[{ value: "light", label: "Light" }, { value: "ludicrous", label: "Ludicrous" }, { value: "plaid", label: "Plaid" }]} />
  ) },
  { id: "stat", render: (t) => <Stat label="Dinosaurs counted" value={pick([244, 238, 241], t)} delta={pick([0.025, -0.01, 0.012], t)} note="238 expected" /> },
  { id: "progress-ring", render: (t) => <div className="flex justify-center"><ProgressRing value={pick([32, 78, 100, 55], t)} size={96} label="Flux capacitor charge" /></div> },
  { id: "meter", render: (t) => <Meter label="Containment grid" value={pick([9, 14, 17.5], t)} max={20} unit="TJ" decimals={1} /> },
  { id: "alert", render: () => <Alert tone="info" title="Containment at 85%">Empty the traps before Friday.</Alert> },
  { id: "sparkline", render: (t) => (
    <div className="flex items-end justify-between gap-3">
      <div><p className="whitespace-nowrap text-[13px] text-muted">Weyland-Yutani</p><p className="text-xl font-medium tabular">{pick(["$214", "$221", "$218"], t)}</p></div>
      <Sparkline label="Share price" trend width={72} height={36} values={[8, 9, 7, 11, 10, 14, 13, 17, pick([16, 19, 18], t)]} />
    </div>
  ) },
  { id: "checkbox", render: (t) => <Checkbox checked={t % 2 === 0} onCheckedChange={noop} label="I agree to the InGen waiver" /> },
  { id: "search-field", render: () => <SearchField value="" onValueChange={noop} placeholder="Search the park's residents" shortcut="/" aria-label="Search" /> },
  { id: "number-ticker", render: (t) => (
    <div className="flex items-baseline justify-between"><span className="text-[13px] text-muted">Year</span><span className="text-4xl font-medium tracking-[-0.03em]"><NumberTicker value={pick([1985, 1955, 2015, 1885], t)} format={{ useGrouping: false }} /></span></div>
  ) },
];
