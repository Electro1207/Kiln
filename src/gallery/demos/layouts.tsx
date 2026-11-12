import type { Category } from "../types";
import { AppShellDemo, CalendarDemo, CommentFeedDemo, DashboardDemo, GanttDemo, GridListDemo, HeadingsDemo, StackedLayoutDemo, StackedListDemo } from "./parts/layouts";

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
