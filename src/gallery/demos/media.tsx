import type { Category } from "../types";
import { VideoDemo } from "./parts/media";

export const category: Category = {
  id: "media",
  name: "Media",
  summary: "Players for video and sound, built for keyboards, thumbs and long sessions.",
  entries: [
    {
      id: "video-player",
      name: "Video player",
      summary: "Chapters and frame previews on the scrubber, speed and quality that keep your place, captions, picture-in-picture, theater and full screen.",
      files: ["src/kiln/components/media/VideoPlayer.tsx", "src/kiln/motion.ts", "src/kiln/cn.ts"],
      Demo: VideoDemo,
    },
  ],
};
