import type { Category } from "../types";
import { AccessibilityMenuDemo, AccessibilityScopeDemo, LiveAnnouncerDemo, SkipLinkDemo, VisuallyHiddenDemo } from "./parts/accessibility";


export const category: Category = {
  id: "accessibility",
  name: "Accessibility",
  summary: "What people can switch on, and what you can build in: settings, scopes, skip links and announcements.",
  entries: [
    { id: "accessibility-menu", name: "Accessibility menu", summary: "Profiles and fine-tune switches that people set once; saved on the device and applied to the whole page.", files: ["src/kiln/components/accessibility/AccessibilityMenu.tsx", "src/kiln/a11y.tsx", "src/kiln/components/accessibility/announce.ts", "src/kiln/components/buttons/Button.tsx", "src/kiln/components/buttons/IconButton.tsx", "src/kiln/components/buttons/SegmentedControl.tsx", "src/kiln/components/choice-controls/Switch.tsx", "src/kiln/components/overlays/Popover.tsx", "src/kiln/components/shared/useOverlay.ts", "src/kiln/controllable.ts", "src/kiln/motion.ts", "src/kiln/cn.ts"], Demo: AccessibilityMenuDemo },
    { id: "accessibility-scope", name: "Accessibility scope and prop", summary: "Turn features on for one subtree with AccessibilityScope, or for one component with accessibilityFeatures.", files: ["src/kiln/a11y.tsx", "src/kiln/cn.ts", "src/kiln/controllable.ts"], Demo: AccessibilityScopeDemo },
    { id: "skip-link", name: "Skip link", summary: "Hidden until a keyboard user reaches it, then it fades in and jumps past the navigation.", files: ["src/kiln/components/accessibility/SkipLink.tsx", "src/kiln/cn.ts", "src/kiln/a11y.tsx", "src/kiln/controllable.ts"], Demo: SkipLinkDemo },
    { id: "visually-hidden", name: "Visually hidden", summary: "Text for screen readers that the screen does not show, optionally revealed on focus.", files: ["src/kiln/components/accessibility/VisuallyHidden.tsx", "src/kiln/cn.ts", "src/kiln/a11y.tsx", "src/kiln/controllable.ts"], Demo: VisuallyHiddenDemo },
    { id: "live-announcer", name: "Live announcer", summary: "Tell screen readers something without moving focus: polite or assertive, repeats are read again.", files: ["src/kiln/components/accessibility/announce.ts"], Demo: LiveAnnouncerDemo },
  ],
};
