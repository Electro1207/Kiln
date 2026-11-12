import type { Category } from "../types";
import { ButtonDemo, CopyDemo, GroupDemo, HoldDemo, IconButtonDemo, LinkDemo, SegmentedDemo, ToggleDemo } from "./parts/actions";

export const category: Category = {
  id: "actions",
  name: "Actions",
  summary: "Things people press.",
  entries: [
    { id: "button", name: "Button", summary: "The main way to act: five variants, three sizes, icons, and a loading state that keeps its width.", files: ["src/kiln/components/buttons/Button.tsx", "src/kiln/motion.ts", "src/kiln/cn.ts"], Demo: ButtonDemo },
    { id: "icon-button", name: "Icon button", summary: "A square or round button that shows only an icon and is named for screen readers.", files: ["src/kiln/components/buttons/IconButton.tsx", "src/kiln/motion.ts", "src/kiln/cn.ts"], Demo: IconButtonDemo },
    { id: "button-group", name: "Button group and split button", summary: "Related buttons joined into one strip, and a main action with its alternatives in a menu.", files: ["src/kiln/components/buttons/ButtonGroup.tsx", "src/kiln/components/buttons/SplitButton.tsx", "src/kiln/motion.ts", "src/kiln/cn.ts"], Demo: GroupDemo },
    { id: "segmented-control", name: "Segmented control", summary: "Switch between views; the selection fades onto the one you pick.", files: ["src/kiln/components/buttons/SegmentedControl.tsx", "src/kiln/controllable.ts", "src/kiln/motion.ts", "src/kiln/cn.ts"], Demo: SegmentedDemo },
    { id: "toggle-button", name: "Toggle button", summary: "A button that stays on, with its icon swapping as it does.", files: ["src/kiln/components/buttons/ToggleButton.tsx", "src/kiln/controllable.ts", "src/kiln/motion.ts", "src/kiln/cn.ts"], Demo: ToggleDemo },
    { id: "copy-button", name: "Copy button", summary: "Copies text and confirms with a drawn tick.", files: ["src/kiln/components/buttons/CopyButton.tsx", "src/kiln/motion.ts", "src/kiln/cn.ts"], Demo: CopyDemo },
    { id: "link", name: "Link", summary: "Inline text link with an underline that draws in from the left.", files: ["src/kiln/components/buttons/Link.tsx", "src/kiln/cn.ts"], Demo: LinkDemo },
    { id: "hold-button", name: "Hold to confirm", summary: "For actions that cannot be undone: fills while held, rewinds when released early.", files: ["src/kiln/components/buttons/HoldButton.tsx", "src/kiln/motion.ts", "src/kiln/cn.ts"], Demo: HoldDemo },
  ],
};
