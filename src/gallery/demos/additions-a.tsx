import type { Category } from "../types";
import {
  BottomTabBarDemo, CascaderDemo, ErrorSummaryDemo, FieldsetDemo, MaskedInputDemo, MenubarDemo, TableOfContentsDemo,
  ToolbarDemo, TransferListDemo, TypeToConfirmDialogDemo,
} from "./parts/additions-a";

export const category: Category = {
  id: "additions-a",
  name: "Additions A",
  summary: "Forms, pickers, overlays and navigation that fill the gaps: error summaries, masks, transfer lists, cascaders, toolbars and menu bars.",
  entries: [
    { id: "error-summary", name: "Error summary", summary: "Everything wrong with a form in one alert that takes focus; each line links to its field.", files: ["src/kiln/components/forms/ErrorSummary.tsx", "src/kiln/cn.ts", "src/kiln/motion.ts", "src/kiln/a11y.tsx", "src/kiln/controllable.ts"], Demo: ErrorSummaryDemo },
    { id: "fieldset", name: "Fieldset", summary: "A real fieldset and legend for a group of fields, with a description and a group error tied to it.", files: ["src/kiln/components/forms/Fieldset.tsx", "src/kiln/cn.ts", "src/kiln/components/notices/FieldMessage.tsx", "src/kiln/motion.ts", "src/kiln/a11y.tsx", "src/kiln/controllable.ts"], Demo: FieldsetDemo },
    { id: "masked-input", name: "Masked input", summary: "A text field that formats as you type (phone, plate, card) and keeps the caret where you are.", files: ["src/kiln/components/text-input/MaskedInput.tsx", "src/kiln/cn.ts", "src/kiln/controllable.ts", "src/kiln/a11y.tsx", "src/kiln/components/text-input/TextField.tsx", "src/kiln/motion.ts", "src/kiln/components/shared/Field.tsx"], Demo: MaskedInputDemo },
    { id: "transfer-list", name: "Transfer list", summary: "Two listboxes with move buttons, filters and multi-select: pick several, send them across.", files: ["src/kiln/components/pickers/TransferList.tsx", "src/kiln/cn.ts", "src/kiln/motion.ts", "src/kiln/controllable.ts", "src/kiln/a11y.tsx", "src/kiln/components/accessibility/announce.ts", "src/kiln/components/buttons/IconButton.tsx", "src/kiln/components/text-input/TextField.tsx", "src/kiln/components/shared/Field.tsx"], Demo: TransferListDemo },
    { id: "cascader", name: "Cascader", summary: "Choose one leaf of a tree through side-by-side columns, with arrow keys across them.", files: ["src/kiln/components/pickers/Cascader.tsx", "src/kiln/cn.ts", "src/kiln/motion.ts", "src/kiln/controllable.ts", "src/kiln/a11y.tsx", "src/kiln/components/shared/Anchored.tsx"], Demo: CascaderDemo },
    { id: "type-to-confirm-dialog", name: "Type-to-confirm dialog", summary: "A confirmation whose button stays off until the person types the name of what they are deleting.", files: ["src/kiln/components/overlays/TypeToConfirmDialog.tsx", "src/kiln/cn.ts", "src/kiln/a11y.tsx", "src/kiln/controllable.ts", "src/kiln/components/accessibility/announce.ts", "src/kiln/components/buttons/Button.tsx", "src/kiln/motion.ts", "src/kiln/components/text-input/TextField.tsx", "src/kiln/components/shared/Field.tsx", "src/kiln/components/overlays/Dialog.tsx", "src/kiln/components/shared/useOverlay.ts"], Demo: TypeToConfirmDialogDemo },
    { id: "toolbar", name: "Toolbar", summary: "A row of tools that is one Tab stop; arrows move between buttons and toggles.", files: ["src/kiln/components/menus/Toolbar.tsx", "src/kiln/cn.ts", "src/kiln/motion.ts", "src/kiln/controllable.ts", "src/kiln/a11y.tsx"], Demo: ToolbarDemo },
    { id: "menubar", name: "Menubar", summary: "File, Edit, View: a menu bar where arrows move between menus, and a menu opens with the down key.", files: ["src/kiln/components/menus/Menubar.tsx", "src/kiln/cn.ts", "src/kiln/controllable.ts", "src/kiln/a11y.tsx", "src/kiln/components/menus/DropdownMenu.tsx", "src/kiln/motion.ts", "src/kiln/components/shared/Anchored.tsx"], Demo: MenubarDemo },
    { id: "bottom-tab-bar", name: "Bottom tab bar", summary: "Phone navigation along the bottom edge: three to five tabs, badges, 48px targets.", files: ["src/kiln/components/menus/BottomTabBar.tsx", "src/kiln/cn.ts", "src/kiln/motion.ts", "src/kiln/controllable.ts", "src/kiln/a11y.tsx"], Demo: BottomTabBarDemo },
    { id: "table-of-contents", name: "Table of contents", summary: "The headings of a long article, with the one you are reading marked as you scroll.", files: ["src/kiln/components/wayfinding/TableOfContents.tsx", "src/kiln/cn.ts", "src/kiln/motion.ts", "src/kiln/controllable.ts", "src/kiln/a11y.tsx"], Demo: TableOfContentsDemo },
  ],
};
