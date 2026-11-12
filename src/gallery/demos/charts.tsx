import type { Category } from "../types";
import { AreaDemo, BarDemo, DonutDemo, FunnelDemo, GaugeDemo, LineDemo, RadarDemo, SankeyDemo, SparkDemo, TreemapDemo, YearDemo } from "./parts/charts";

export const category: Category = {
  id: "charts",
  name: "Charts",
  summary: "Small, quiet charts with one hue on the data that matters.",
  entries: [
    { id: "bar-chart", name: "Bar chart", summary: "Bars that grow from the baseline, with the current period in the accent.", files: ["src/kiln/components/charts/BarChart.tsx", "src/kiln/cn.ts", "src/kiln/motion.ts"], Demo: BarDemo },
    { id: "line-chart", name: "Line chart", summary: "A line that wipes in, with a cursor that follows the pointer or the arrow keys.", files: ["src/kiln/components/charts/LineChart.tsx", "src/kiln/cn.ts", "src/kiln/motion.ts"], Demo: LineDemo },
    { id: "area-chart", name: "Stacked area", summary: "Layers of a total over time, with a readout of every layer under the cursor.", files: ["src/kiln/components/charts/AreaChart.tsx", "src/kiln/cn.ts", "src/kiln/motion.ts"], Demo: AreaDemo },
    { id: "donut", name: "Donut", summary: "Parts of a whole, drawn in one after another; hover a segment or its legend row.", files: ["src/kiln/components/charts/DonutChart.tsx", "src/kiln/components/shared/Anchored.tsx", "src/kiln/cn.ts", "src/kiln/motion.ts"], Demo: DonutDemo },
    { id: "sparkline", name: "Sparkline", summary: "A word-sized trend for running text and table cells.", files: ["src/kiln/components/charts/Sparkline.tsx", "src/kiln/cn.ts", "src/kiln/motion.ts"], Demo: SparkDemo },
    { id: "gauge", name: "Gauge", summary: "A half-ring meter with an optional target mark; the fill stops dead on its value.", files: ["src/kiln/components/charts/GaugeChart.tsx", "src/kiln/components/data-display/NumberTicker.tsx", "src/kiln/cn.ts", "src/kiln/motion.ts"], Demo: GaugeDemo },
    { id: "funnel", name: "Funnel", summary: "Stages that narrow, with how many went on at each step.", files: ["src/kiln/components/charts/FunnelChart.tsx", "src/kiln/cn.ts", "src/kiln/motion.ts"], Demo: FunnelDemo },
    { id: "radar", name: "Radar", summary: "Scores on spokes for one or two series; the spoke nearest the pointer is read out.", files: ["src/kiln/components/charts/RadarChart.tsx", "src/kiln/cn.ts", "src/kiln/motion.ts"], Demo: RadarDemo },
    { id: "treemap", name: "Treemap", summary: "Parts of a whole as tiles sized by value; hover reads out a tile without flicker across the gaps.", files: ["src/kiln/components/charts/TreemapChart.tsx", "src/kiln/cn.ts", "src/kiln/motion.ts"], Demo: TreemapDemo },
    { id: "year-heatmap", name: "Year calendar heatmap", summary: "A whole year of daily counts with weekday and month labels.", files: ["src/kiln/components/charts/YearHeatmap.tsx", "src/kiln/cn.ts", "src/kiln/motion.ts"], Demo: YearDemo },
    { id: "sankey", name: "Sankey", summary: "Amounts flowing between columns; hover a node or band to bring its connections forward.", files: ["src/kiln/components/charts/SankeyChart.tsx", "src/kiln/cn.ts", "src/kiln/motion.ts"], Demo: SankeyDemo },
  ],
};
