import type { Category } from "../types";
import { AlertDialogDemo, DialogDemo, DrawerDemo, HoverCardDemo, LightboxDemo, PopoverDemo, ToastDemo, TooltipDemo } from "./parts/overlays";

export const category: Category = {
  id: "overlays",
  name: "Overlays",
  summary: "Things that float above the page: windows, sheets, panels, hints and notifications.",
  entries: [
    { id: "dialog", name: "Dialog", summary: "A modal window that grows in from 96%; on a phone it becomes a bottom sheet you can drag away.", files: ["src/kiln/components/overlays/Dialog.tsx", "src/kiln/components/shared/useOverlay.ts", "src/kiln/components/buttons/Button.tsx", "src/kiln/motion.ts", "src/kiln/cn.ts"], Demo: DialogDemo },
    { id: "alert-dialog", name: "Alert dialog", summary: "A confirmation that must be answered, with a spinner while the action runs.", files: ["src/kiln/components/overlays/AlertDialog.tsx", "src/kiln/components/overlays/Dialog.tsx", "src/kiln/components/shared/useOverlay.ts", "src/kiln/components/buttons/Button.tsx", "src/kiln/motion.ts", "src/kiln/cn.ts"], Demo: AlertDialogDemo },
    { id: "drawer", name: "Drawer", summary: "A panel from the left, right or bottom edge. Flick it back to close.", files: ["src/kiln/components/overlays/Drawer.tsx", "src/kiln/components/shared/useOverlay.ts", "src/kiln/motion.ts", "src/kiln/cn.ts"], Demo: DrawerDemo },
    { id: "popover", name: "Popover", summary: "A small panel tied to its trigger that flips to stay on screen.", files: ["src/kiln/components/overlays/Popover.tsx", "src/kiln/components/shared/useOverlay.ts", "src/kiln/motion.ts", "src/kiln/cn.ts"], Demo: PopoverDemo },
    { id: "tooltip", name: "Tooltip", summary: "A short label on hover or keyboard focus; once one is open, its neighbours open instantly.", files: ["src/kiln/components/overlays/Tooltip.tsx", "src/kiln/components/shared/useOverlay.ts", "src/kiln/motion.ts", "src/kiln/cn.ts"], Demo: TooltipDemo },
    { id: "hover-card", name: "Hover card", summary: "A rich preview of a person or link that stays while you read it.", files: ["src/kiln/components/overlays/HoverCard.tsx", "src/kiln/components/shared/useOverlay.ts", "src/kiln/motion.ts", "src/kiln/cn.ts"], Demo: HoverCardDemo },
    { id: "toast", name: "Toast", summary: "Notifications that stack like iOS: hover to fan out, swipe to dismiss, timers pause while you read.", files: ["src/kiln/components/notices/Toast.tsx", "src/kiln/components/shared/useOverlay.ts", "src/kiln/motion.ts", "src/kiln/cn.ts"], Demo: ToastDemo },
    { id: "lightbox", name: "Lightbox", summary: "A picture grows from its thumbnail to the full screen and back. Arrow keys step through.", files: ["src/kiln/components/overlays/Lightbox.tsx", "src/kiln/components/shared/useOverlay.ts", "src/kiln/motion.ts", "src/kiln/cn.ts"], Demo: LightboxDemo },
  ],
};
