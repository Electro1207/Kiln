import type { Category } from "../types";
import { DiffDemo, JSONDemo, LogDemo, TerminalDemo, TerminalScriptDemo } from "./parts/devtools";

export const category: Category = {
  id: "devtools",
  name: "Developer tools",
  summary: "Diffs, data, terminals and logs: the screens engineers live in.",
  entries: [
    { id: "diff-viewer", name: "Diff viewer", summary: "Two versions side by side or unified, with the changed words marked and unchanged stretches folded away.", files: ["src/kiln/components/dev-tools/DiffViewer.tsx", "src/kiln/components/buttons/SegmentedControl.tsx", "src/kiln/cn.ts", "src/kiln/motion.ts", "src/kiln/controllable.ts"], Demo: DiffDemo },
    { id: "json-viewer", name: "JSON viewer", summary: "A document as a tree: fold branches, copy any path or value, and search to open what matches.", files: ["src/kiln/components/dev-tools/JSONViewer.tsx", "src/kiln/components/buttons/CopyButton.tsx", "src/kiln/cn.ts", "src/kiln/motion.ts"], Demo: JSONDemo },
    { id: "terminal", name: "Terminal", summary: "Scrollback with coloured output, a typed prompt with a blinking caret, and auto-scroll that lets go when you scroll up.", files: ["src/kiln/components/dev-tools/Terminal.tsx", "src/kiln/cn.ts", "src/kiln/motion.ts"], Demo: TerminalDemo },
    { id: "terminal-script", name: "Terminal script", summary: "A scripted session played in a terminal: commands typed at a human pace, output line by line, then a live prompt.", files: ["src/kiln/components/dev-tools/TerminalScript.tsx", "src/kiln/components/dev-tools/Terminal.tsx", "src/kiln/components/shared/useLoop.ts", "src/kiln/cn.ts", "src/kiln/motion.ts"], Demo: TerminalScriptDemo },
    { id: "log-stream", name: "Log stream", summary: "A live tail with level filters that pauses under the pointer and renders only the rows in view.", files: ["src/kiln/components/dev-tools/LogStream.tsx", "src/kiln/cn.ts", "src/kiln/motion.ts"], Demo: LogDemo },
  ],
};
