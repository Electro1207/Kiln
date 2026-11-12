import type { Category } from "../types";
import { AlertDemo, BadgeDemo, BannerDemo, BellDemo, EmptyStateDemo, FieldMessageDemo, MeterDemo, ProgressDemo, ProgressRingDemo, SkeletonDemo, SpinnerDemo } from "./parts/feedback";

export const category: Category = {
  id: "feedback",
  name: "Feedback",
  summary: "How the interface tells people what is happening: status, progress, waiting and nothing-yet.",
  entries: [
    { id: "alert", name: "Alert", summary: "A calm inline card; the tone lives in the icon. Dismissing it folds the space shut without a jump.", files: ["src/kiln/components/notices/Alert.tsx", "src/kiln/motion.ts", "src/kiln/cn.ts"], Demo: AlertDemo },
    { id: "banner", name: "Banner", summary: "A full-width announcement for the top of an app that slides down into the space it opens.", files: ["src/kiln/components/notices/Banner.tsx", "src/kiln/motion.ts", "src/kiln/cn.ts"], Demo: BannerDemo },
    { id: "badge", name: "Badge and status dot", summary: "Short statuses and counts, and a presence dot that breathes when something is live.", files: ["src/kiln/components/status/Badge.tsx", "src/kiln/components/status/StatusDot.tsx", "src/kiln/cn.ts", "src/kiln/components/shared/useLoop.ts", "src/kiln/controllable.ts"], Demo: BadgeDemo },
    { id: "progress", name: "Progress bar", summary: "Fills on a spring when the amount is known; runs a band when it isn’t.", files: ["src/kiln/components/status/Progress.tsx", "src/kiln/motion.ts", "src/kiln/cn.ts", "src/kiln/components/shared/useLoop.ts"], Demo: ProgressDemo },
    { id: "progress-ring", name: "Progress ring", summary: "A circular gauge whose arc and number move on the same spring.", files: ["src/kiln/components/status/ProgressRing.tsx", "src/kiln/motion.ts", "src/kiln/cn.ts"], Demo: ProgressRingDemo },
    { id: "spinner", name: "Spinner", summary: "Four ways to say “working”, all following the text colour.", files: ["src/kiln/components/status/Spinner.tsx", "src/kiln/components/shared/useLoop.ts", "src/kiln/cn.ts"], Demo: SpinnerDemo },
    { id: "skeleton", name: "Skeleton", summary: "Placeholders that hold the shape of content still loading, then cross-fade to it.", files: ["src/kiln/components/status/Skeleton.tsx", "src/kiln/cn.ts", "src/kiln/components/shared/useLoop.ts"], Demo: SkeletonDemo },
    { id: "empty-state", name: "Empty state", summary: "What a page shows when it has nothing yet, and the one thing to do next.", files: ["src/kiln/components/status/EmptyState.tsx", "src/kiln/motion.ts", "src/kiln/cn.ts", "src/kiln/components/shared/useLoop.ts"], Demo: EmptyStateDemo },
    { id: "field-message", name: "Field message", summary: "The hint or error under a field; it slides in and the space opens smoothly.", files: ["src/kiln/components/notices/FieldMessage.tsx", "src/kiln/motion.ts", "src/kiln/cn.ts"], Demo: FieldMessageDemo },
    { id: "meter", name: "Meter", summary: "How much of a limit is used, split by kind, turning amber then red as it fills.", files: ["src/kiln/components/status/Meter.tsx", "src/kiln/motion.ts", "src/kiln/cn.ts"], Demo: MeterDemo },
    { id: "notification-bell", name: "Notification bell", summary: "An unread count that rolls and bumps; the bell rings once when it goes up.", files: ["src/kiln/components/notices/NotificationBell.tsx", "src/kiln/motion.ts", "src/kiln/cn.ts"], Demo: BellDemo },
  ],
};
