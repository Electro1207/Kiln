import type { Category } from "../types";
import { AvatarDemo, CodeDemo, ComparisonDemo, DataGridDemo, DescriptionDemo, HeatDemo, InvoiceDemo, KbdDemo, ListDemo, PlayerDemo, StatDemo, TableDemo, TagDemo, TickerDemo, TimelineDemo } from "./parts/data";

export const category: Category = {
  id: "data",
  name: "Data display",
  summary: "Ways to show people, records, figures, documents and code.",
  entries: [
    { id: "avatar", name: "Avatar", summary: "A person as a picture or initials, each with a colour of their own, alone or in a group.", files: ["src/kiln/components/data-display/Avatar.tsx", "src/kiln/cn.ts", "src/kiln/motion.ts"], Demo: AvatarDemo },
    { id: "table", name: "Table", summary: "Sortable, selectable rows that glide to their new order; the header stays put while the body scrolls.", files: ["src/kiln/components/tables/Table.tsx", "src/kiln/cn.ts", "src/kiln/motion.ts"], Demo: TableDemo },
    { id: "data-grid", name: "Data grid", summary: "Filter, sort, choose columns, change density, page through and act on a selection. The first column stays put.", files: ["src/kiln/components/tables/DataGrid.tsx", "src/kiln/components/tables/Table.tsx", "src/kiln/components/text-input/SearchField.tsx", "src/kiln/components/buttons/SegmentedControl.tsx", "src/kiln/components/menus/DropdownMenu.tsx", "src/kiln/components/shared/Anchored.tsx", "src/kiln/components/wayfinding/Pagination.tsx", "src/kiln/components/buttons/Button.tsx", "src/kiln/cn.ts", "src/kiln/motion.ts", "src/kiln/controllable.ts"], Demo: DataGridDemo },
    { id: "description-list", name: "Description list", summary: "The details of one thing as terms and values; values people paste elsewhere can be copied.", files: ["src/kiln/components/data-display/DescriptionList.tsx", "src/kiln/components/buttons/CopyButton.tsx", "src/kiln/cn.ts", "src/kiln/motion.ts"], Demo: DescriptionDemo },
    { id: "comparison-table", name: "Comparison table", summary: "Plans across, features down, with the plan names held at the top as you scroll.", files: ["src/kiln/components/tables/ComparisonTable.tsx", "src/kiln/cn.ts"], Demo: ComparisonDemo },
    { id: "list", name: "List", summary: "Rows with a leading picture and trailing detail; swipe left for actions.", files: ["src/kiln/components/data-display/List.tsx", "src/kiln/cn.ts", "src/kiln/motion.ts"], Demo: ListDemo },
    { id: "timeline", name: "Timeline", summary: "An activity feed whose entries rise in one after another.", files: ["src/kiln/components/data-display/Timeline.tsx", "src/kiln/cn.ts", "src/kiln/motion.ts"], Demo: TimelineDemo },
    { id: "stat", name: "Stat", summary: "A key figure that counts up once it comes into view, with its change against the last period.", files: ["src/kiln/components/data-display/Stat.tsx", "src/kiln/cn.ts", "src/kiln/motion.ts"], Demo: StatDemo },
    { id: "number-ticker", name: "Number ticker", summary: "Digits that roll to their new value, like a departure board.", files: ["src/kiln/components/data-display/NumberTicker.tsx", "src/kiln/cn.ts", "src/kiln/motion.ts"], Demo: TickerDemo },
    { id: "heat-strip", name: "Activity strip", summary: "Half a year of daily counts at a glance; the readout follows the pointer without flicker.", files: ["src/kiln/components/data-display/HeatStrip.tsx", "src/kiln/cn.ts", "src/kiln/motion.ts"], Demo: HeatDemo },
    { id: "media-player", name: "Media player", summary: "An audio player that scrubs along the track\u2019s real waveform, with skip, playback speed and volume.", files: ["src/kiln/components/media/MediaPlayer.tsx", "src/kiln/components/choice-controls/Slider.tsx", "src/kiln/cn.ts", "src/kiln/motion.ts", "src/kiln/controllable.ts"], Demo: PlayerDemo },
    { id: "invoice", name: "Invoice", summary: "An invoice or receipt as a document, with totals computed from its lines.", files: ["src/kiln/components/commerce/Invoice.tsx", "src/kiln/cn.ts", "src/kiln/motion.ts"], Demo: InvoiceDemo },
    { id: "code-block", name: "Code block", summary: "Highlighted code with line numbers and a copy button.", files: ["src/kiln/components/data-display/CodeBlock.tsx", "src/kiln/components/buttons/CopyButton.tsx", "src/kiln/cn.ts", "src/kiln/motion.ts"], Demo: CodeDemo },
    { id: "kbd", name: "Keyboard key", summary: "A key cap that presses down when the real key does.", files: ["src/kiln/components/data-display/Kbd.tsx", "src/kiln/cn.ts", "src/kiln/controllable.ts"], Demo: KbdDemo },
    { id: "tag", name: "Tag", summary: "Labels in six tones, removable; in a TagGroup they make room for each other smoothly.", files: ["src/kiln/components/data-display/Tag.tsx", "src/kiln/cn.ts", "src/kiln/motion.ts", "src/kiln/controllable.ts"], Demo: TagDemo },
  ],
};
