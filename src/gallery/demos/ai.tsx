import type { Category } from "../types";
import { ActionsDemo, ConversationDemo, PromptDemo, ReasoningDemo, SourcesDemo, StreamingDemo, SuggestionsDemo, ToolCallDemo } from "./parts/ai";

export const category: Category = {
  id: "ai",
  name: "AI interfaces",
  summary: "The pieces of an assistant: a composer, streaming answers, its reasoning, sources, tool approvals and feedback.",
  entries: [
    { id: "conversation", name: "Conversation", summary: "Everything working together: empty state with starters, reasoning, a streamed answer, sources and actions.", files: ["src/kiln/components/ai/PromptInput.tsx", "src/kiln/components/ai/StreamingText.tsx", "src/kiln/components/ai/Reasoning.tsx", "src/kiln/components/ai/Citation.tsx", "src/kiln/components/ai/MessageActions.tsx", "src/kiln/components/ai/ChatMessage.tsx", "src/kiln/components/ai/Suggestions.tsx", "src/kiln/motion.ts", "src/kiln/cn.ts", "src/kiln/components/overlays/Tooltip.tsx", "src/kiln/components/shared/useOverlay.ts", "src/kiln/components/buttons/CopyButton.tsx", "src/kiln/components/overlays/HoverCard.tsx", "src/kiln/components/shared/useLoop.ts", "src/kiln/components/menus/DropdownMenu.tsx", "src/kiln/components/shared/Anchored.tsx"], Demo: ConversationDemo },
    { id: "prompt-input", name: "Prompt input", summary: "Grows with its text, carries attachments, picks a model, and turns Send into Stop.", files: ["src/kiln/components/ai/PromptInput.tsx", "src/kiln/components/menus/DropdownMenu.tsx", "src/kiln/components/shared/Anchored.tsx", "src/kiln/motion.ts", "src/kiln/cn.ts"], Demo: PromptDemo },
    { id: "streaming-message", name: "Streaming message", summary: "An answer that writes itself in token by token; earlier text never re-renders.", files: ["src/kiln/components/ai/StreamingText.tsx", "src/kiln/components/ai/ChatMessage.tsx", "src/kiln/components/data-display/CodeBlock.tsx", "src/kiln/components/buttons/CopyButton.tsx", "src/kiln/motion.ts", "src/kiln/cn.ts", "src/kiln/components/shared/useLoop.ts"], Demo: StreamingDemo },
    { id: "reasoning", name: "Reasoning", summary: "The model’s thinking behind one line: open while it works, folded when it’s done.", files: ["src/kiln/components/ai/Reasoning.tsx", "src/kiln/components/shared/useLoop.ts", "src/kiln/motion.ts", "src/kiln/cn.ts"], Demo: ReasoningDemo },
    { id: "sources", name: "Sources and citations", summary: "Inline citation chips with a hover card, and the list of everything it read.", files: ["src/kiln/components/ai/Citation.tsx", "src/kiln/components/overlays/HoverCard.tsx", "src/kiln/components/shared/useOverlay.ts", "src/kiln/motion.ts", "src/kiln/cn.ts"], Demo: SourcesDemo },
    { id: "tool-call", name: "Tool call", summary: "A tool the assistant wants to run, with its arguments, waiting for Approve or Deny.", files: ["src/kiln/components/ai/ToolCall.tsx", "src/kiln/components/buttons/Button.tsx", "src/kiln/motion.ts", "src/kiln/cn.ts"], Demo: ToolCallDemo },
    { id: "suggestions", name: "Suggestions", summary: "Prompt starters as chips; they scroll sideways on a phone.", files: ["src/kiln/components/ai/Suggestions.tsx", "src/kiln/motion.ts", "src/kiln/cn.ts"], Demo: SuggestionsDemo },
    { id: "message-actions", name: "Message actions", summary: "Copy, rate up or down, and regenerate, under an answer.", files: ["src/kiln/components/ai/MessageActions.tsx", "src/kiln/components/buttons/CopyButton.tsx", "src/kiln/components/overlays/Tooltip.tsx", "src/kiln/components/shared/useOverlay.ts", "src/kiln/motion.ts", "src/kiln/cn.ts"], Demo: ActionsDemo },
  ],
};
