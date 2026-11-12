import { useState } from "react";
import { Stage } from "../../ui";
import { Kbd } from "../../../kiln/components/data-display/Kbd";
import { VideoPlayer } from "../../../kiln/components/media/VideoPlayer";

const V = `${import.meta.env.BASE_URL}demo/video/`;

const SHORTCUTS: Array<[string[], string]> = [
  [["Space", "K"], "Play or pause"],
  [["J", "L"], "Back or forward 10 seconds"],
  [["←", "→"], "Back or forward 5 seconds"],
  [["↑", "↓"], "Volume"],
  [["M"], "Mute"],
  [["C"], "Captions"],
  [["F"], "Full screen"],
  [["T"], "Theater mode"],
  [["0", "9"], "Jump to 0% … 90%"],
  [["<", ">"], "Slower or faster"],
];

export function VideoDemo() {
  const [theater, setTheater] = useState(false);
  return (
    <Stage className="flex-col items-stretch">
      <div className={theater ? "w-full transition-[max-width] duration-500 ease-out-soft" : "mx-auto w-full max-w-3xl"}>
        <VideoPlayer
          title="Big Buck Bunny"
          poster={`${V}bbb-poster.jpg`}
          renditions={[
            { label: "720p", height: 720, src: `${V}bbb-720.webm` },
            { label: "480p", height: 480, src: `${V}bbb-480.webm` },
            { label: "360p", height: 360, src: `${V}bbb-360.webm` },
          ]}
          initialQuality="480p"
          captions={{ src: `${V}bbb-captions.en.vtt`, label: "English (sounds)", lang: "en" }}
          chapters={[
            { start: 0, title: "Out of the burrow" },
            { start: 10, title: "Among the flowers" },
            { start: 20, title: "A butterfly" },
            { start: 30, title: "The apple" },
          ]}
          previews={{ src: `${V}bbb-previews.jpg`, cols: 5, interval: 2, width: 160, height: 90 }}
          theater={theater}
          onTheaterChange={setTheater}
        />
        <p className="mt-3 text-[13px] leading-5 text-muted">
          <a href="https://commons.wikimedia.org/wiki/File:Big_Buck_Bunny_4K.webm" target="_blank" rel="noreferrer" className="underline decoration-line-strong underline-offset-2 hover:text-ink">
            “Big Buck Bunny”
          </a>{" "}
          by the Blender Foundation (www.bigbuckbunny.org),{" "}
          <a href="https://creativecommons.org/licenses/by/3.0/" target="_blank" rel="noreferrer" className="underline decoration-line-strong underline-offset-2 hover:text-ink">CC BY 3.0</a>, via Wikimedia Commons.
          Modified: trimmed to 1:00–1:40, resized to 360p, 480p and 720p, re-encoded at 30 fps; captions and preview frames added.
        </p>
      </div>
      <dl className="mx-auto grid w-full max-w-3xl grid-cols-1 gap-x-8 gap-y-2 text-[13px] sm:grid-cols-2">
        {SHORTCUTS.map(([keys, what]) => (
          <div key={what} className="flex items-center justify-between gap-3">
            <dt className="text-muted">{what}</dt>
            <dd className="flex gap-1">{keys.map((k) => <Kbd key={k}>{k}</Kbd>)}</dd>
          </div>
        ))}
      </dl>
    </Stage>
  );
}
