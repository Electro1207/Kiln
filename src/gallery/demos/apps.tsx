import type { Category } from "../types";
import { FeedDemo, FileManagerDemo, PrefsDemo, ShortcutsDemo, SpotlightDemo, VirtualDemo, WizardDemo } from "./parts/apps";

export const category: Category = {
  id: "apps",
  name: "App patterns",
  summary: "Bigger pieces of working apps: long lists, feeds, files, setup, search and settings.",
  entries: [
    { id: "virtual-list", name: "Virtual list", summary: "10,000 rows of mixed heights with sticky group headers; only what is near the viewport is drawn.", files: ["src/kiln/components/tables/VirtualList.tsx", "src/kiln/cn.ts"], Demo: VirtualDemo },
    { id: "infinite-feed", name: "Infinite feed", summary: "Loads the next page as you near the end, with skeleton rows and no jump in scroll position.", files: ["src/kiln/components/tables/InfiniteFeed.tsx", "src/kiln/components/status/Skeleton.tsx", "src/kiln/cn.ts", "src/kiln/components/shared/useLoop.ts", "src/kiln/motion.ts"], Demo: FeedDemo },
    { id: "file-manager", name: "File manager", summary: "Grid or list, breadcrumbs, Shift and Ctrl/Cmd selection, drag onto folders, rename in place, a context menu.", files: ["src/kiln/components/workspace/FileManager.tsx", "src/kiln/components/menus/DropdownMenu.tsx", "src/kiln/components/shared/Anchored.tsx", "src/kiln/components/buttons/SegmentedControl.tsx", "src/kiln/controllable.ts", "src/kiln/motion.ts", "src/kiln/cn.ts"], Demo: FileManagerDemo },
    { id: "onboarding-wizard", name: "Onboarding wizard", summary: "Steps that check themselves, Back that keeps your answers, and a summary with links back.", files: ["src/kiln/components/guidance/OnboardingWizard.tsx", "src/kiln/components/buttons/Button.tsx", "src/kiln/motion.ts", "src/kiln/cn.ts"], Demo: WizardDemo },
    { id: "spotlight-search", name: "Spotlight search", summary: "A search window with categories, recent searches and a live preview of the highlighted result.", files: ["src/kiln/components/menus/SpotlightSearch.tsx", "src/kiln/components/shared/useOverlay.ts", "src/kiln/components/pickers/Combobox.tsx", "src/kiln/controllable.ts", "src/kiln/components/shared/Anchored.tsx", "src/kiln/motion.ts", "src/kiln/cn.ts", "src/kiln/components/shared/Field.tsx"], Demo: SpotlightDemo },
    { id: "notification-preferences", name: "Notification preferences", summary: "Events against channels, with select-all for each row and column; cards on a phone.", files: ["src/kiln/components/workspace/NotificationPreferences.tsx", "src/kiln/motion.ts", "src/kiln/cn.ts"], Demo: PrefsDemo },
    { id: "keyboard-shortcuts", name: "Keyboard shortcuts", summary: "Press ? for a filterable, grouped list of every shortcut.", files: ["src/kiln/components/guidance/KeyboardShortcutsSheet.tsx", "src/kiln/components/overlays/Dialog.tsx", "src/kiln/components/shared/useOverlay.ts", "src/kiln/motion.ts", "src/kiln/cn.ts"], Demo: ShortcutsDemo },
  ],
};
