import type { Category } from "../types";
import { ChipDemo, ComboboxDemo, DateDemo, DropzoneDemo, SelectDemo, TagInputDemo, TimeDemo } from "./parts/pickers";

export const category: Category = {
  id: "pickers",
  name: "Selection & pickers",
  summary: "Choosing from lists, dates, times and files.",
  entries: [
    { id: "select", name: "Select", summary: "A custom listbox: arrow keys, type to jump, a tick on the chosen row.", files: ["src/kiln/components/pickers/Select.tsx", "src/kiln/components/shared/Anchored.tsx", "src/kiln/controllable.ts", "src/kiln/motion.ts", "src/kiln/cn.ts"], Demo: SelectDemo },
    { id: "combobox", name: "Combobox", summary: "Type to filter a long list; matches are marked and rows glide as the list narrows.", files: ["src/kiln/components/pickers/Combobox.tsx", "src/kiln/components/shared/Anchored.tsx", "src/kiln/controllable.ts", "src/kiln/motion.ts", "src/kiln/cn.ts", "src/kiln/components/shared/Field.tsx"], Demo: ComboboxDemo },
    { id: "tag-input", name: "Tag input", summary: "Several values in one field. Backspace marks the last tag, a second press removes it.", files: ["src/kiln/components/pickers/TagInput.tsx", "src/kiln/components/pickers/Combobox.tsx", "src/kiln/components/shared/Anchored.tsx", "src/kiln/controllable.ts", "src/kiln/motion.ts", "src/kiln/cn.ts", "src/kiln/components/shared/Field.tsx"], Demo: TagInputDemo },
    { id: "date-picker", name: "Date picker", summary: "A calendar that slides by month, for one date or a range with presets.", files: ["src/kiln/components/pickers/DatePicker.tsx", "src/kiln/components/shared/Anchored.tsx", "src/kiln/motion.ts", "src/kiln/cn.ts", "src/kiln/components/shared/Field.tsx", "src/kiln/controllable.ts"], Demo: DateDemo },
    { id: "time-picker", name: "Time picker", summary: "Two scroll-snapping wheels, driven by native scrolling.", files: ["src/kiln/components/pickers/TimePicker.tsx", "src/kiln/components/shared/Anchored.tsx", "src/kiln/motion.ts", "src/kiln/cn.ts", "src/kiln/components/shared/Field.tsx", "src/kiln/controllable.ts"], Demo: TimeDemo },
    { id: "file-dropzone", name: "File dropzone", summary: "Drag files in or browse; each upload reports progress and can be retried or removed.", files: ["src/kiln/components/pickers/FileDropzone.tsx", "src/kiln/motion.ts", "src/kiln/cn.ts"], Demo: DropzoneDemo },
    { id: "chip-filter", name: "Chip filter", summary: "Toggle chips for filtering, one or several at a time.", files: ["src/kiln/components/pickers/ChipFilter.tsx", "src/kiln/motion.ts", "src/kiln/cn.ts"], Demo: ChipDemo },
  ],
};
