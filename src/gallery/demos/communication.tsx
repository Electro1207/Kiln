import type { Category } from "../types";
import { ChatDemo, CommentDemo, CookieDemo, NotificationCenterDemo, TourDemo, UndoDemo } from "./parts/communication";

export const category: Category = {
  id: "communication",
  name: "Communication",
  summary: "Where people talk to each other and the product talks to them: inboxes, chat, comments, guidance and consent.",
  entries: [
    { id: "notification-center", name: "Notification center", summary: "A bell that opens an inbox with All, Unread and Mentions; opened notices fade to read.", files: ["src/kiln/components/notices/NotificationCenter.tsx", "src/kiln/components/notices/NotificationBell.tsx", "src/kiln/components/overlays/Popover.tsx", "src/kiln/components/data-display/Avatar.tsx", "src/kiln/components/shared/useOverlay.ts", "src/kiln/motion.ts", "src/kiln/cn.ts"], Demo: NotificationCenterDemo },
    { id: "chat-thread", name: "Chat thread", summary: "Messages grouped by sender, a typing indicator, and a pill that takes you down to new messages.", files: ["src/kiln/components/communication/ChatThread.tsx", "src/kiln/components/data-display/Avatar.tsx", "src/kiln/motion.ts", "src/kiln/cn.ts", "src/kiln/components/shared/useLoop.ts"], Demo: ChatDemo },
    { id: "comment-thread", name: "Comment thread", summary: "Nested replies, reactions whose counts roll, and Edit or Delete on your own comments.", files: ["src/kiln/components/communication/CommentThread.tsx", "src/kiln/components/data-display/Avatar.tsx", "src/kiln/components/buttons/Button.tsx", "src/kiln/components/menus/DropdownMenu.tsx", "src/kiln/components/shared/Anchored.tsx", "src/kiln/motion.ts", "src/kiln/cn.ts"], Demo: CommentDemo },
    { id: "product-tour", name: "Product tour", summary: "Coach marks: a hairline spotlight dims the page around one feature and eases onto the next, following it as the page scrolls.", files: ["src/kiln/components/guidance/ProductTour.tsx", "src/kiln/components/buttons/Button.tsx", "src/kiln/components/shared/useOverlay.ts", "src/kiln/motion.ts", "src/kiln/cn.ts"], Demo: TourDemo },
    { id: "cookie-consent", name: "Cookie consent", summary: "A corner card with equal Accept and Reject; Choose opens the categories in place.", files: ["src/kiln/components/notices/CookieConsent.tsx", "src/kiln/components/choice-controls/Switch.tsx", "src/kiln/components/buttons/Button.tsx", "src/kiln/components/shared/useOverlay.ts", "src/kiln/motion.ts", "src/kiln/cn.ts", "src/kiln/controllable.ts"], Demo: CookieDemo },
    { id: "undo-bar", name: "Undo bar", summary: "“Removed X · Undo” with a ring counting down; it pauses while you hover.", files: ["src/kiln/components/notices/UndoBar.tsx", "src/kiln/motion.ts", "src/kiln/cn.ts"], Demo: UndoDemo },
  ],
};
