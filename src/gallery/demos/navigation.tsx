import type { Category } from "../types";
import { AccordionDemo, BackToTopDemo, BreadcrumbsDemo, ContextDemo, DocsNavDemo, MenuDemo, NavbarDemo, PaginationDemo, SidebarDemo, StepperDemo, TabsDemo } from "./parts/navigation";

export const category: Category = {
  id: "navigation",
  name: "Navigation",
  summary: "Getting around: bars, tabs, trails, menus and steps.",
  entries: [
    { id: "navbar", name: "Navbar", summary: "Wordmark, links and one action; on a phone the links fold into a menu with a morphing button.", files: ["src/kiln/components/menus/Navbar.tsx", "src/kiln/components/buttons/Button.tsx", "src/kiln/motion.ts", "src/kiln/cn.ts"], Demo: NavbarDemo },
    { id: "tabs", name: "Tabs", summary: "A line or a fill fades onto the chosen tab; panels slide in from the side you moved towards.", files: ["src/kiln/components/wayfinding/Tabs.tsx", "src/kiln/controllable.ts", "src/kiln/motion.ts", "src/kiln/cn.ts"], Demo: TabsDemo },
    { id: "breadcrumbs", name: "Breadcrumbs", summary: "Where you are. When space runs out, the middle levels fold into a menu.", files: ["src/kiln/components/wayfinding/Breadcrumbs.tsx", "src/kiln/components/menus/DropdownMenu.tsx", "src/kiln/components/shared/Anchored.tsx", "src/kiln/motion.ts", "src/kiln/cn.ts"], Demo: BreadcrumbsDemo },
    { id: "pagination", name: "Pagination", summary: "Pages with gaps; the current page’s fill fades in place, and on a phone it becomes “6 of 24”.", files: ["src/kiln/components/wayfinding/Pagination.tsx", "src/kiln/controllable.ts", "src/kiln/motion.ts", "src/kiln/cn.ts"], Demo: PaginationDemo },
    { id: "stepper", name: "Stepper", summary: "Progress through a flow; the line fills as each step is finished.", files: ["src/kiln/components/wayfinding/Stepper.tsx", "src/kiln/motion.ts", "src/kiln/cn.ts"], Demo: StepperDemo },
    { id: "dropdown-menu", name: "Dropdown menu", summary: "Actions with icons, shortcuts, ticks and a submenu. Arrow keys, type to jump, Esc to close.", files: ["src/kiln/components/menus/DropdownMenu.tsx", "src/kiln/components/shared/Anchored.tsx", "src/kiln/motion.ts", "src/kiln/cn.ts"], Demo: MenuDemo },
    { id: "context-menu", name: "Context menu", summary: "The same menu, opened at the pointer with a right-click.", files: ["src/kiln/components/menus/ContextMenu.tsx", "src/kiln/components/menus/DropdownMenu.tsx", "src/kiln/components/shared/Anchored.tsx", "src/kiln/motion.ts", "src/kiln/cn.ts"], Demo: ContextDemo },
    { id: "accordion", name: "Accordion", summary: "Questions that open to their answers with a smooth change of height.", files: ["src/kiln/components/wayfinding/Accordion.tsx", "src/kiln/controllable.ts", "src/kiln/motion.ts", "src/kiln/cn.ts"], Demo: AccordionDemo },
    { id: "sidebar-nav", name: "Sidebar", summary: "Side navigation with nested groups that folds into an icon rail.", files: ["src/kiln/components/menus/SidebarNav.tsx", "src/kiln/motion.ts", "src/kiln/cn.ts", "src/kiln/controllable.ts"], Demo: SidebarDemo },
    { id: "docs-nav", name: "Docs navigation", summary: "The sidebar this gallery uses: labelled sections of collapsible groups, a filter field (with an optional shortcut key), counts, and an active row whose fill fades in place.", files: ["src/kiln/components/menus/DocsNav.tsx", "src/kiln/components/text-input/SearchField.tsx", "src/kiln/components/primitives/ScrollArea.tsx", "src/kiln/motion.ts", "src/kiln/cn.ts", "src/kiln/controllable.ts"], Demo: DocsNavDemo },
    { id: "back-to-top", name: "Back to top", summary: "Appears once you have scrolled; its ring fills with your progress down the page.", files: ["src/kiln/components/wayfinding/BackToTop.tsx", "src/kiln/motion.ts", "src/kiln/cn.ts"], Demo: BackToTopDemo },
  ],
};
