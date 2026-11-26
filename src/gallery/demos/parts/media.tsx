import { useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValue, useTransform } from "motion/react";
import { Bookmark, ListVideo, ScanSearch } from "lucide-react";
import { Stage, Variant } from "../../ui";
import { Kbd } from "../../../kiln/components/data-display/Kbd";
import { Button } from "../../../kiln/components/buttons/Button";
import { springSoft } from "../../../kiln/motion";
import { VideoPlayer, VideoPlayerControl, useVideoTime, type VideoMarker, type VideoPlayerHandle } from "../../../kiln/components/media/VideoPlayer";

const V = `${import.meta.env.BASE_URL}demo/video/`;
const CLIP = 40;
const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

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

function DefaultPlayer() {
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

const CHAPTERS = [
  { start: 0, title: "Out of the burrow" },
  { start: 10, title: "Among the flowers" },
  { start: 20, title: "A butterfly" },
  { start: 30, title: "The apple" },
];
const CUES = [
  { start: 0.5, end: 3, text: "[birdsong]" },
  { start: 7.2, end: 9.6, text: "[contented sigh]" },
  { start: 10.2, end: 14.4, text: "[sniffing the flowers]\nMmm." },
  { start: 20, end: 24, text: "[a butterfly flutters past]" },
  { start: 31, end: 35, text: "[crunch]" },
];
const MOMENTS: VideoMarker[] = [
  { time: 4, label: "1" },
  { time: 13, label: "2" },
  { time: 22, label: "3", tone: "neutral" },
  { time: 33, label: "4", tone: "danger" },
];

/** The same player with its title hidden and most controls off. */
function MinimalPlayer() {
  return (
    <VideoPlayer
      title="Big Buck Bunny"
      src={`${V}bbb-480.webm`}
      poster={`${V}bbb-poster.jpg`}
      showTitle={false}
      skipButtons={false}
      volume={false}
      speed={false}
      pip={false}
      captions={false}
    />
  );
}

/** Split timeline, chapters, markers, cues, controls of its own, a panel in the overlay and a shortcut. */
function PlayheadPlayer() {
  const [panel, setPanel] = useState(false);
  const [moments, setMoments] = useState(MOMENTS);
  const [asked, setAsked] = useState<number | null>(null);
  const ask = (p: VideoPlayerHandle) => {
    p.pause();
    setAsked(p.currentTime);
    setPanel(true);
  };
  const bookmark = (p: VideoPlayerHandle) =>
    setMoments((m) => (m.length >= 9 ? m : [...m, { time: p.currentTime, label: String(m.length + 1), tone: "accent" as const }].sort((a, b) => a.time - b.time).map((x, i) => ({ ...x, label: String(i + 1) }))));
  return (
    <VideoPlayer
      title="Big Buck Bunny"
      src={`${V}bbb-480.webm`}
      poster={`${V}bbb-poster.jpg`}
      showTitle={false}
      timelineSplit
      chapters={CHAPTERS}
      showChapterTitle
      markers={moments}
      cues={CUES}
      previews={{ src: `${V}bbb-previews.jpg`, cols: 5, interval: 2, width: 160, height: 90 }}
      shortcuts={[{ keys: ["W"], label: "Ask about this frame" }]}
      onKeyDown={(e, p) => {
        if (e.key.toLowerCase() === "w" && !e.metaKey && !e.ctrlKey && !e.altKey) {
          e.preventDefault();
          ask(p);
        }
      }}
      controlsStart={(p) => (
        <>
          <VideoPlayerControl label="Ask about this frame" keyHint="w" onClick={() => ask(p)}><ScanSearch /></VideoPlayerControl>
          <VideoPlayerControl label="Bookmark this moment" onClick={() => bookmark(p)}><Bookmark /></VideoPlayerControl>
        </>
      )}
      controlsEnd={() => (
        <VideoPlayerControl label="Moments" active={panel} onClick={() => setPanel((v) => !v)}><ListVideo /></VideoPlayerControl>
      )}
      overlay={(p) => (
        <AnimatePresence>
          {panel && (
            <motion.aside
              key="moments"
              aria-label="Moments"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, transition: { duration: 0.14 } }}
              transition={springSoft}
              className="pointer-events-auto absolute bottom-[88px] right-3 top-3 flex w-[min(240px,62%)] flex-col gap-1 overflow-y-auto rounded-[14px] bg-surface p-2 text-white ring-1 ring-white/10"
            >
              <p className="px-2 pb-1 pt-1.5 text-[13px] font-semibold">Moments</p>
              {asked !== null && (
                <p className="mx-1 mb-1 rounded-[8px] bg-white/10 px-2.5 py-2 text-[12.5px] leading-snug text-white/85">
                  You asked about the frame at <span className="tabular font-semibold text-white">{fmt(asked)}</span>.
                </p>
              )}
              {moments.map((m) => (
                <button
                  key={m.time}
                  type="button"
                  onClick={() => p.seek(m.time)}
                  className="flex h-9 shrink-0 items-center gap-2.5 rounded-[8px] px-2 text-left text-[13px] outline-none transition-colors hover:bg-white/[0.08] focus-visible:bg-white/[0.08]"
                >
                  <span className="grid size-5 place-items-center rounded-full bg-white/15 text-[11px] font-bold tabular">{m.label}</span>
                  <span className="flex-1 tabular">{fmt(m.time)}</span>
                </button>
              ))}
            </motion.aside>
          )}
        </AnimatePresence>
      )}
    />
  );
}

/** Buttons outside the player calling its ref, and a readout and playhead driven by `useVideoTime`. */
function DrivenPlayer() {
  const player = useRef<VideoPlayerHandle>(null);
  const time = useVideoTime(player);
  const readout = useTransform(time, fmt);
  const bar = useTransform(time, (t) => t / CLIP);
  const timeUpdates = useMotionValue(0);
  const count = useTransform(timeUpdates, (n) => `${n}`);
  const [log, setLog] = useState<string[]>([]);
  const [fast, setFast] = useState(false);
  const note = (e: string) => setLog((l) => [e, ...l].slice(0, 5));
  return (
    <div className="flex flex-col gap-3">
      <VideoPlayer
        ref={player}
        title="Big Buck Bunny"
        src={`${V}bbb-480.webm`}
        poster={`${V}bbb-poster.jpg`}
        onPlay={() => note("play")}
        onPause={() => note("pause")}
        onEnded={() => note("ended")}
        onSeek={(t) => note(`seek ${fmt(t)}`)}
        onRateChange={(r) => note(`rate ${r}×`)}
        onVolumeChange={(v) => note(`volume ${Math.round(v.volume * 100)}%${v.muted ? " (muted)" : ""}`)}
        onFullscreenChange={(f) => note(f ? "fullscreen" : "left fullscreen")}
        onTimeUpdate={() => timeUpdates.set(timeUpdates.get() + 1)}
      />
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="secondary" onClick={() => void player.current?.play()}>Play</Button>
        <Button size="sm" variant="secondary" onClick={() => player.current?.pause()}>Pause</Button>
        <Button size="sm" variant="secondary" onClick={() => player.current?.seek(20)}>Jump to 0:20</Button>
        <Button size="sm" variant="secondary" onClick={() => { player.current?.setRate(fast ? 1 : 2); setFast(!fast); }}>{fast ? "Normal speed" : "Double speed"}</Button>
        <Button size="sm" variant="secondary" onClick={() => player.current?.setVolume(0.3)}>Volume 30%</Button>
        <Button size="sm" variant="secondary" onClick={() => player.current?.enterFullscreen()}>Full screen</Button>
      </div>
      <div className="flex items-center gap-3 text-[13px]">
        <motion.span className="w-10 tabular font-medium">{readout}</motion.span>
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-active">
          <motion.div className="h-full origin-left rounded-full bg-btn-primary" style={{ scaleX: bar }} />
        </div>
        <span className="w-12 text-right tabular text-muted">{fmt(CLIP)}</span>
      </div>
      <p className="min-h-5 text-[13px] text-muted" aria-live="polite">
        <motion.span className="tabular">{count}</motion.span> time updates{log.length ? " · " : ""}
        <span key={log[0]} className="tabular">{log.join(" · ")}</span>
      </p>
    </div>
  );
}

export function VideoDemo() {
  return (
    <div className="flex flex-col gap-6">
      <DefaultPlayer />
      <Stage className="flex-col items-stretch">
        <Variant label="Minimal: the title hidden, one source, most controls off" className="mx-auto w-full max-w-3xl">
          <div className="w-full"><MinimalPlayer /></div>
        </Variant>
      </Stage>
      <Stage className="flex-col items-stretch">
        <Variant label="Playhead-style: split timeline, chapters, markers, cues, controls and a panel of your own. Press W." className="mx-auto w-full max-w-3xl">
          <div className="w-full"><PlayheadPlayer /></div>
        </Variant>
      </Stage>
      <Stage className="flex-col items-stretch">
        <Variant label="Driven from outside: the ref and useVideoTime" className="mx-auto w-full max-w-3xl">
          <div className="w-full"><DrivenPlayer /></div>
        </Variant>
      </Stage>
    </div>
  );
}
