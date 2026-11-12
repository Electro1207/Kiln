import type { Category } from "../types";
import { CalendarDemo, FilterDemo, KanbanDemo, PanelsDemo, SortableDemo, TreeDemo } from "./parts/workspace";

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
