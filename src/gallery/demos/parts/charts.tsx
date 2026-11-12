import { useState } from "react";
import { Stage } from "../../ui";
import { DonutChart } from "../../../kiln/components/charts/DonutChart";
import { AreaChart } from "../../../kiln/components/charts/AreaChart";
import { Sparkline } from "../../../kiln/components/charts/Sparkline";
import { GaugeChart } from "../../../kiln/components/charts/GaugeChart";
import { BarChart } from "../../../kiln/components/charts/BarChart";
import { LineChart } from "../../../kiln/components/charts/LineChart";
import { Button } from "../../../kiln/components/buttons/Button";
import { FunnelChart } from "../../../kiln/components/charts/FunnelChart";
import { RadarChart } from "../../../kiln/components/charts/RadarChart";
import { TreemapChart } from "../../../kiln/components/charts/TreemapChart";
import { YearHeatmap } from "../../../kiln/components/charts/YearHeatmap";
import { SankeyChart } from "../../../kiln/components/charts/SankeyChart";
import { cn } from "../../../kiln/cn";


export function DonutDemo() {
  return (
    <Stage>
      <div className="w-full max-w-lg rounded-card bg-surface p-5 sm:p-6">
        <DonutChart
          title="The Fellowship of the Ring, by people"
          centreLabel="Fellowship"
          data={[
            { label: "Hobbits", value: 4 },
            { label: "Men", value: 2 },
            { label: "Wizards", value: 1 },
            { label: "Elves", value: 1 },
            { label: "Dwarves", value: 1 },
          ]}
        />
      </div>
    </Stage>
  );
}

const WEEKS = Array.from({ length: 12 }, (_, i) => `Week ${i + 1}`);
const XWING = [8, 9, 11, 12, 12, 14, 15, 17, 18, 19, 21, 22];
const YWING = [4, 4, 5, 5, 6, 6, 6, 7, 7, 8, 8, 8];
const AWING = [0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 6];

export function AreaDemo() {
  return (
    <Stage>
      <div className="w-full max-w-2xl rounded-card bg-surface p-5 sm:p-6">
        <AreaChart
          title="Rebel starfighters ready for launch at Yavin 4, by type, over twelve weeks"
          labels={WEEKS}
          series={[
            { name: "X-wing", values: XWING },
            { name: "Y-wing", values: YWING },
            { name: "A-wing", values: AWING },
          ]}
        />
        <p className="mt-3 text-xs text-muted">Move along the chart, or focus it and use the arrow keys.</p>
      </div>
    </Stage>
  );
}

function walk(seed: number, start: number, drift: number) {
  let s = seed, v = start;
  return Array.from({ length: 30 }, () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    v = Math.max(1, v * (1 + drift + ((s / 4294967296) - 0.5) * 0.06));
    return Math.round(v * 100) / 100;
  });
}

const CORPS = [
  { name: "Weyland-Yutani", ticker: "WYC", values: walk(11, 182.4, 0.004) },
  { name: "Tyrell Corporation", ticker: "TYR", values: walk(29, 96.1, 0.002) },
  { name: "Cyberdyne Systems", ticker: "CYB", values: walk(47, 64.8, -0.006) },
  { name: "InGen", ticker: "ING", values: walk(83, 41.2, -0.011) },
  { name: "Omni Consumer Products", ticker: "OCP", values: walk(5, 120.7, 0.003) },
];

export function SparkDemo() {
  const wy = CORPS[0].values;
  const change = (v: number[]) => v[v.length - 1] / v[0] - 1;
  return (
    <Stage className="flex-col items-stretch">
      <p className="mx-auto max-w-xl text-sm text-ink">
        Weyland-Yutani closed at <span className="tabular font-medium">{wy[wy.length - 1].toFixed(2)}</span>{" "}
        <Sparkline values={wy} label={`Weyland-Yutani, last 30 days`} />, {change(wy) >= 0 ? "up" : "down"}{" "}
        <span className="tabular">{Math.abs(change(wy) * 100).toFixed(1)}%</span> on the month. Building better worlds, slowly.
      </p>
      <div className="mx-auto w-full max-w-xl overflow-x-auto rounded-card border border-line bg-surface">
        <table className="w-full min-w-[420px] border-separate border-spacing-0 text-sm">
          <caption className="sr-only">Share prices, last 30 days</caption>
          <thead>
            <tr className="text-muted">
              <th scope="col" className="h-10 border-b border-line px-4 text-left font-medium">Company</th>
              <th scope="col" className="h-10 border-b border-line px-4 text-left font-medium">30 days</th>
              <th scope="col" className="h-10 border-b border-line px-4 text-right font-medium">Price</th>
              <th scope="col" className="h-10 border-b border-line px-4 text-right font-medium">Change</th>
            </tr>
          </thead>
          <tbody>
            {CORPS.map((c) => {
              const ch = change(c.values);
              return (
                <tr key={c.ticker}>
                  <td className="h-12 border-b border-line px-4 [tr:last-child_&]:border-b-0">
                    <span className="block font-medium text-ink">{c.name}</span>
                    <span className="block text-xs text-muted">{c.ticker}</span>
                  </td>
                  <td className="h-12 border-b border-line px-4 [tr:last-child_&]:border-b-0">
                    <Sparkline values={c.values} trend label={`${c.name}, last 30 days, ${ch >= 0 ? "up" : "down"} ${Math.abs(ch * 100).toFixed(1)}%`} />
                  </td>
                  <td className="tabular h-12 border-b border-line px-4 text-right text-ink [tr:last-child_&]:border-b-0">{c.values[c.values.length - 1].toFixed(2)}</td>
                  <td className={cn("tabular h-12 border-b border-line px-4 text-right font-medium [tr:last-child_&]:border-b-0", ch >= 0 ? "text-positive" : "text-negative")}>
                    {ch >= 0 ? "+" : "−"}{Math.abs(ch * 100).toFixed(1)}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Stage>
  );
}

export function GaugeDemo() {
  const [mph, setMph] = useState(35);
  return (
    <Stage className="flex-col gap-6">
      <div className="flex flex-wrap items-end justify-center gap-10">
        <GaugeChart value={mph} max={100} target={88} targetLabel="88 mph" label="DeLorean speed" unit="mph" />
        <GaugeChart value={mph >= 88 ? 1.21 : 0.12} max={1.5} decimals={2} dangerAt={1.21} label="Flux capacitor" unit="GW" size={200} />
      </div>
      <div className="flex flex-wrap justify-center gap-2" role="group" aria-label="Set speed">
        <Button size="sm" variant="secondary" onClick={() => setMph(0)}>Brake</Button>
        <Button size="sm" variant="secondary" onClick={() => setMph(35)}>Cruise</Button>
        <Button size="sm" onClick={() => setMph(88)}>Floor it</Button>
      </div>
    </Stage>
  );
}

export function BarDemo() {
  return (
    <Stage>
      <div className="w-full max-w-xl rounded-card bg-surface p-5 sm:p-6">
        <BarChart
          title="Ghosts captured per month, June to November 1984"
          data={[
            { label: "Jun", value: 6 },
            { label: "Jul", value: 11 },
            { label: "Aug", value: 19 },
            { label: "Sep", value: 27 },
            { label: "Oct", value: 41 },
            { label: "Nov", value: 34 },
          ]}
        />
      </div>
    </Stage>
  );
}

const PKE = [12, 14, 13, 18, 21, 20, 26, 31, 30, 38, 46, 58];
const PKE_SEDGEWICK = [9, 10, 12, 11, 13, 12, 14, 13, 15, 14, 16, 15];

export function LineDemo() {
  return (
    <Stage>
      <div className="w-full max-w-xl rounded-card bg-surface p-5 sm:p-6">
        <LineChart
          title="PKE readings at 55 Central Park West over twelve days, against the Sedgewick Hotel"
          data={PKE.map((v, i) => ({ label: `Day ${i + 1}`, value: v }))}
          compare={PKE_SEDGEWICK}
          format={(v) => `${v} PKE`}
        />
        <p className="mt-3 text-xs text-muted">Dashed line: the Sedgewick Hotel over the same days. Move along the chart, or focus it and use the arrow keys.</p>
      </div>
    </Stage>
  );
}

export function FunnelDemo() {
  return (
    <Stage>
      <div className="w-full max-w-2xl rounded-card bg-surface p-5 sm:p-6">
        <FunnelChart
          title="Zion recruitment, 2199: from potential to freed"
          stages={[
            { label: "Potentials spotted", value: 2400 },
            { label: "Contacted", value: 1180 },
            { label: "Offered the pill", value: 640 },
            { label: "Took the red pill", value: 310 },
            { label: "Freed", value: 230 },
          ]}
        />
      </div>
    </Stage>
  );
}

export function RadarDemo() {
  return (
    <Stage>
      <div className="w-full max-w-md rounded-card bg-surface p-5 sm:p-6">
        <RadarChart
          title="Pilot ratings out of 10, Luke Skywalker against Han Solo"
          axes={["Piloting", "Blasters", "The Force", "Diplomacy", "Mechanics", "Luck"]}
          series={[
            { name: "Luke Skywalker", values: [8, 6, 9, 5, 7, 7] },
            { name: "Han Solo", values: [10, 9, 1, 4, 8, 9] },
          ]}
          size={300}
        />
      </div>
    </Stage>
  );
}

export function TreemapDemo() {
  return (
    <Stage>
      <div className="w-full max-w-3xl rounded-card bg-surface p-5 sm:p-6">
        <TreemapChart
          title="Death Star budget, billions of credits"
          format={(v) => `${v.toLocaleString("en-US")} bn cr`}
          items={[
            { label: "Superlaser", value: 312 },
            { label: "Reactor core", value: 176 },
            { label: "Hyperdrive", value: 148 },
            { label: "Turbolasers", value: 94 },
            { label: "TIE hangars", value: 88 },
            { label: "Tractor beams", value: 61 },
            { label: "Crew quarters", value: 59 },
            { label: "Detention blocks", value: 39 },
            { label: "Trash compactors", value: 22 },
            { label: "Thermal exhaust port", value: 1 },
          ]}
        />
      </div>
    </Stage>
  );
}

function yearDays() {
  let seed = 1997;
  const r = () => ((seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296);
  const out: { date: string; count: number }[] = [];
  const end = new Date(Date.UTC(1997, 11, 31));
  for (let d = new Date(Date.UTC(1997, 0, 1)); d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
    const iso = d.toISOString().slice(0, 10);
    const dow = d.getUTCDay();
    const after = iso > "1997-08-29";
    const ramp = Math.min(1, (d.getUTCMonth() + 1) / 8);
    const v = after ? 0 : Math.floor(r() * r() * 9 * (0.4 + ramp) + (dow === 0 || dow === 6 ? 0 : 1));
    out.push({ date: iso, count: v });
  }
  return out;
}
const SKYNET_YEAR = yearDays();

export function YearDemo() {
  return (
    <Stage>
      <div className="w-full max-w-4xl rounded-card bg-surface p-5 sm:p-6">
        <YearHeatmap days={SKYNET_YEAR} unit="commits by humans" locale="en-US" />
      </div>
    </Stage>
  );
}

export function SankeyDemo() {
  return (
    <Stage>
      <div className="w-full max-w-4xl rounded-card bg-surface p-5 sm:p-6">
        <SankeyChart
          title="Ghostbusters, Inc., third quarter of 1984: where the money came from and went"
          format={(v) => `$${v.toLocaleString("en-US")}`}
          height={300}
          nodes={[
            { id: "hotels", label: "Hotels", column: 0 },
            { id: "libraries", label: "Libraries", column: 0 },
            { id: "homes", label: "Homes", column: 0 },
            { id: "city", label: "City contracts", column: 0 },
            { id: "gb", label: "Ghostbusters", column: 1 },
            { id: "salaries", label: "Salaries", column: 2 },
            { id: "containment", label: "Containment", column: 2 },
            { id: "loan", label: "Ray's mortgage", column: 2 },
            { id: "profit", label: "Profit", column: 2 },
            { id: "ecto", label: "Ecto-1", column: 2 },
          ]}
          links={[
            { from: "hotels", to: "gb", value: 18400 },
            { from: "libraries", to: "gb", value: 6250 },
            { from: "homes", to: "gb", value: 9300 },
            { from: "city", to: "gb", value: 14260 },
            { from: "gb", to: "salaries", value: 19600 },
            { from: "gb", to: "containment", value: 12800 },
            { from: "gb", to: "loan", value: 6000 },
            { from: "gb", to: "profit", value: 5460 },
            { from: "gb", to: "ecto", value: 4350 },
          ]}
        />
      </div>
    </Stage>
  );
}
