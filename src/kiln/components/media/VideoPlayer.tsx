import { createContext, useCallback, useContext, useEffect, useId, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type ReactNode } from "react";
import { AnimatePresence, motion, useMotionValue, useMotionValueEvent, useTransform, type MotionValue } from "motion/react";
import { Captions, Check, ChevronLeft, ChevronRight, Keyboard, Maximize, Minimize, PictureInPicture2, RectangleHorizontal, RotateCcw, Settings, Volume1, Volume2, VolumeX, X } from "lucide-react";
import { cn } from "../../cn";
import { easeOut, fade, springFirm, springSnappy, springSoft } from "../../motion";

export type VideoRendition = { label: string; src: string; height: number };
export type VideoChapter = { start: number; title: string };
type Previews = { src: string; cols: number; interval: number; width: number; height: number };

/**
 * Text used by VideoPlayer. Pass a partial via `labels` to translate or reword.
 * Control labels that end in a key hint such as " (k)" keep it as a tooltip;
 * the hint is dropped from the accessible name.
 */
export interface VideoPlayerLabels {
  /** aria-label of the player. */
  player: (title: string) => string;
  /** aria-label of the big play button on the poster. */
  playTitle: (title: string) => string;
  /** " · 5 chapters" text on the poster. */
  chapterCount: (count: number) => string;
  /** Loading spinner label. */
  loading: string;
  /** End screen line above the title. */
  youWatched: string;
  /** End screen button. */
  watchAgain: string;
  /** aria-label of the time toggle when remaining time shows. */
  showTotal: string;
  /** aria-label of the time toggle when total length shows. */
  showRemaining: string;
  /** Play control. */
  play: string;
  /** Pause control. */
  pause: string;
  /** Skip back control. */
  back10: string;
  /** Skip forward control. */
  forward10: string;
  /** Mute control. */
  mute: string;
  /** Unmute control. */
  unmute: string;
  /** Captions toggle. */
  captionsToggle: string;
  /** Settings button and menu name. */
  settings: string;
  /** Picture-in-picture button. */
  pictureInPicture: string;
  /** Theater button when theater is on. */
  defaultView: string;
  /** Theater button when theater is off. */
  theaterMode: string;
  /** Full-screen button when full screen. */
  exitFullscreen: string;
  /** Full-screen button. */
  fullscreen: string;
  /** Flash message when captions turn on. */
  captionsOn: string;
  /** Flash message when captions turn off. */
  captionsOff: string;
  /** Flash message when sound turns on. */
  soundOn: string;
  /** Flash message when muted. */
  muted: string;
  /** Flash message at 1x speed. */
  normalSpeed: string;
  /** Title and aria-label of the shortcuts sheet, and its settings row. */
  keyboardShortcuts: string;
  /** aria-label of the shortcuts close button. */
  closeShortcuts: string;
  /** Shortcut rows: keys separated by two spaces, then what they do. */
  shortcuts: Array<[string, string]>;
  /** aria-label of the seek slider. */
  seek: string;
  /** Spoken position of the seek slider. */
  position: (current: string, total: string) => string;
  /** aria-label of the volume slider. */
  volume: string;
  /** Settings row and page title for speed. */
  playbackSpeed: string;
  /** Speed value at 1x. */
  normal: string;
  /** aria-label of the speed choices. */
  speeds: string;
  /** Hint under the speed choices. */
  speedHint: string;
  /** Settings row and page title for quality. */
  quality: string;
  /** Badge on high-definition renditions. */
  hd: string;
  /** Settings row and page title for captions. */
  captions: string;
  /** Captions-off choice and value. */
  off: string;
  /** Heading of the caption size choices. */
  textSize: string;
  /** aria-label of the caption size choices. */
  captionTextSize: string;
  /** aria-label per caption size. */
  captionSizes: { S: string; M: string; L: string };
  /** Settings row and page title for chapters. */
  chapters: string;
}
export const videoPlayerLabels: VideoPlayerLabels = {
  player: (t) => `Video player: ${t}`,
  playTitle: (t) => `Play ${t}`,
  chapterCount: (n) => `${n} chapters`,
  loading: "Loading",
  youWatched: "You watched",
  watchAgain: "Watch again",
  showTotal: "Show total length",
  showRemaining: "Show time remaining",
  play: "Play (k)",
  pause: "Pause (k)",
  back10: "Back 10 seconds (j)",
  forward10: "Forward 10 seconds (l)",
  mute: "Mute (m)",
  unmute: "Unmute (m)",
  captionsToggle: "Captions (c)",
  settings: "Settings",
  pictureInPicture: "Picture in picture",
  defaultView: "Default view (t)",
  theaterMode: "Theater mode (t)",
  exitFullscreen: "Exit full screen (f)",
  fullscreen: "Full screen (f)",
  captionsOn: "Captions on",
  captionsOff: "Captions off",
  soundOn: "Sound on",
  muted: "Muted",
  normalSpeed: "Normal speed",
  keyboardShortcuts: "Keyboard shortcuts",
  closeShortcuts: "Close shortcuts",
  shortcuts: [
    ["Space  K", "Play or pause"],
    ["J  L", "Back or forward 10 s"],
    ["←  →", "Back or forward 5 s"],
    ["↑  ↓", "Volume"],
    ["M", "Mute"],
    ["C", "Captions"],
    ["F", "Full screen"],
    ["T", "Theater mode"],
    ["0 … 9", "Jump to 0% … 90%"],
    ["<  >", "Slower or faster"],
    ["?", "These shortcuts"],
  ],
  seek: "Seek",
  position: (c, t) => `${c} of ${t}`,
  volume: "Volume",
  playbackSpeed: "Playback speed",
  normal: "Normal",
  speeds: "Speeds",
  speedHint: "Or press < and > while it plays.",
  quality: "Quality",
  hd: "HD",
  captions: "Captions",
  off: "Off",
  textSize: "Text size",
  captionTextSize: "Caption text size",
  captionSizes: { S: "Small", M: "Medium", L: "Large" },
  chapters: "Chapters",
};

export type VideoPlayerProps = {
  title: string;
  /** A short line under the title on the poster and the top bar (a series, an episode, a credit). */
  subtitle?: string;
  renditions: VideoRendition[];
  /** Label of the rendition to start with. Defaults to the middle one. */
  initialQuality?: string;
  poster?: string;
  /** A WebVTT captions file. */
  captions?: { src: string; label: string; lang: string };
  chapters?: VideoChapter[];
  /** A sprite of preview frames for the scrubber: `cols` across, one frame every `interval` seconds. */
  previews?: Previews;
  /** Theater mode is the page's to lay out; the player only asks for it. */
  theater?: boolean;
  onTheaterChange?: (v: boolean) => void;
  /** Override any UI text. Merged over `videoPlayerLabels`. */
  labels?: Partial<VideoPlayerLabels>;
  /** Replace any built-in icon. Merged over `videoPlayerIcons`. */
  icons?: Partial<VideoPlayerIcons>;
  className?: string;
};

/** Icons used by VideoPlayer. Pass a partial via `icons` to swap any of them. */
export interface VideoPlayerIcons {
  /** Play button and the flash on the video. `null` keeps the built-in glyph, which morphs into the pause bars. Set either slot and the two cross-fade instead. */
  play: ReactNode;
  /** Pause button, see `play`. */
  pause: ReactNode;
  /** Back ten seconds. */
  back10: ReactNode;
  /** Forward ten seconds. */
  forward10: ReactNode;
  /** Volume at 50 or above. `null` on all three volume slots keeps the built-in speaker, which animates between levels. */
  volume: ReactNode;
  /** Volume below 50, see `volume`. */
  volumeLow: ReactNode;
  /** Muted or at zero, see `volume`. */
  mute: ReactNode;
  /** Captions toggle. */
  captions: ReactNode;
  /** Settings button; it turns while the menu is open. */
  settings: ReactNode;
  /** Picture in picture. */
  pictureInPicture: ReactNode;
  /** Theater mode toggle. */
  theater: ReactNode;
  /** Enter fullscreen. */
  fullscreen: ReactNode;
  /** Leave fullscreen. */
  exitFullscreen: ReactNode;
  /** Keyboard shortcuts row in settings. */
  shortcuts: ReactNode;
  /** Close button of the shortcuts sheet. */
  close: ReactNode;
  /** Forward arrow: settings rows and the skip readout. */
  next: ReactNode;
  /** Back arrow: settings pages and the skip readout. */
  previous: ReactNode;
  /** Tick on the selected settings choice. */
  check: ReactNode;
  /** The chevron repeated three times in the double-tap seek ripple (points right). */
  seek: ReactNode;
  /** Watch again, on the end screen. */
  replay: ReactNode;
  /** Buffering spinner. The wrapper spins it. */
  spinner: ReactNode;
}
const skip10 = (dir: -1 | 1) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <g transform={dir < 0 ? "" : "translate(24 0) scale(-1 1)"}>
      <path d="M4 12a8 8 0 1 0 2.6-5.9" />
      <path d="M4 3.5v4.5h4.5" />
    </g>
    <text x="12" y="15.4" textAnchor="middle" fontSize="7.5" fontWeight="700" fill="currentColor" stroke="none" fontFamily="IBM Plex Sans, sans-serif">10</text>
  </svg>
);
export const videoPlayerIcons: VideoPlayerIcons = {
  play: null,
  pause: null,
  back10: skip10(-1),
  forward10: skip10(1),
  volume: null,
  volumeLow: null,
  mute: null,
  captions: <Captions />,
  settings: <Settings />,
  pictureInPicture: <PictureInPicture2 />,
  theater: <RectangleHorizontal />,
  fullscreen: <Maximize />,
  exitFullscreen: <Minimize />,
  shortcuts: <Keyboard />,
  close: <X />,
  next: <ChevronRight />,
  previous: <ChevronLeft />,
  check: <Check />,
  seek: <ChevronRight />,
  replay: <RotateCcw />,
  spinner: (
    <svg viewBox="0 0 48 48" aria-hidden>
      <circle cx="24" cy="24" r="20" fill="none" stroke="currentColor" strokeOpacity="0.2" strokeWidth="3.5" />
      <path d="M44 24a20 20 0 0 0-20-20" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
    </svg>
  ),
};
const VideoIconsContext = createContext<VideoPlayerIcons>(videoPlayerIcons);
const useVideoIcons = () => useContext(VideoIconsContext);

const SPEEDS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
const HIDE_AFTER = 2600;
/* Clicks in the outer 30% on either side seek on a double click; the middle plays and pauses. */
const SIDE = 0.3;
const DOUBLE_MS = 300;

const fmt = (s: number) => {
  const t = Math.max(0, Math.floor(s || 0));
  const m = Math.floor(t / 60);
  return `${m}:${String(t % 60).padStart(2, "0")}`;
};

const chapterAt = (chapters: VideoChapter[], t: number) => {
  let c = chapters[0];
  for (const ch of chapters) if (t >= ch.start) c = ch;
  return c;
};

/** Background style for one frame of the preview sprite, drawn at any size. */
function frameStyle(p: Previews, t: number, w: number) {
  const scale = w / p.width;
  const i = Math.max(0, Math.floor(t / p.interval));
  return {
    width: w,
    height: p.height * scale,
    backgroundImage: `url(${p.src})`,
    backgroundSize: `${p.cols * w}px auto`,
    backgroundPosition: `${-(i % p.cols) * w}px ${-Math.floor(i / p.cols) * p.height * scale}px`,
    backgroundRepeat: "no-repeat",
  } as const;
}

const PLAY = ["M7 4.5 L12.6 7.9 L12.6 16.1 L7 19.5 Z", "M12.6 7.9 L19.5 12 L19.5 12 L12.6 16.1 Z"];
const PAUSE = ["M6 5 L10 5 L10 19 L6 19 Z", "M14 5 L18 5 L18 19 L14 19 Z"];

const CAPTION_SIZES = { S: "text-[13px] sm:text-[15px]", M: "text-[15px] sm:text-[18px]", L: "text-[18px] sm:text-[24px]" } as const;
type CaptionSize = keyof typeof CAPTION_SIZES;

type Page = "main" | "speed" | "quality" | "captions" | "chapters";

/** The caption track, set to "hidden" so its cues load and fire without the browser drawing them. */
function captionTrack(v: HTMLVideoElement) {
  const track = v.textTracks[0];
  if (track) track.mode = "hidden";
  return track;
}

/**
 * A video player in the house style. A poster with the title and one play
 * button; then a quiet top bar (title and chapter) and a bottom bar with a
 * chaptered scrubber, frame previews, elapsed and remaining time. Double click
 * either side to skip ten seconds (again to keep going), the middle for full
 * screen. Settings hold speed, quality that keeps your place, captions with a
 * text size, and a chapter list with frames. Keyboard: Space/K, J/L, arrows,
 * M, C, F, T, 0–9, < and >, and ? for the list. Controls fade on idle; nothing
 * moves that shouldn't, and every menu renders inside the player so it works
 * in full screen.
 */
export function VideoPlayer({
  title, subtitle, renditions, initialQuality, poster, captions, chapters = [], previews, theater = false, onTheaterChange, labels, icons, className,
}: VideoPlayerProps) {
  const l = { ...videoPlayerLabels, ...labels };
  const ic = useMemo(() => ({ ...videoPlayerIcons, ...icons }), [icons]);
  const root = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [quality, setQuality] = useState(initialQuality ?? renditions[Math.floor(renditions.length / 2)].label);
  const rendition = renditions.find((r) => r.label === quality) ?? renditions[0];

  const [playing, setPlaying] = useState(false);
  const [started, setStarted] = useState(false);
  const [ended, setEnded] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [duration, setDuration] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [muted, setMuted] = useState(false);
  const [volumeState, setVolumeState] = useState(0.8);
  const [cc, setCc] = useState(false);
  const [ccSize, setCcSize] = useState<CaptionSize>("M");
  const [cue, setCue] = useState<string | null>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [menu, setMenu] = useState<Page | null>(null);
  const [help, setHelp] = useState(false);
  const [active, setActive] = useState(true);
  const [scrubbing, setScrubbing] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [remaining, setRemaining] = useState(true);
  const [flash, setFlash] = useState<{ key: number; node: ReactNode; round?: boolean } | null>(null);

  const time = useMotionValue(0);
  const buffered = useMotionValue(0);
  const volume = useMotionValue(0.8);

  useEffect(() => {
    const v = video.current;
    if (!v || (!playing && !scrubbing)) return;
    let raf = 0;
    const tick = () => {
      time.set(v.currentTime);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, scrubbing, time]);

  const resume = useRef<{ t: number; play: boolean } | null>(null);
  useEffect(() => {
    const v = video.current;
    if (!v) return;
    let waitTimer = 0;
    const measure = () => {
      if (v.buffered.length && v.duration) buffered.set(v.buffered.end(v.buffered.length - 1) / v.duration);
    };
    const on: Record<string, () => void> = {
      loadedmetadata: () => {
        setDuration(v.duration);
        if (resume.current) {
          v.currentTime = resume.current.t;
          if (resume.current.play) void v.play();
          resume.current = null;
        }
        v.playbackRate = speed;
        v.volume = volume.get();
      },
      play: () => {
        setPlaying(true);
        setStarted(true);
        setEnded(false);
      },
      pause: () => setPlaying(false),
      ended: () => {
        setPlaying(false);
        setEnded(true);
      },
      waiting: () => {
        window.clearTimeout(waitTimer);
        waitTimer = window.setTimeout(() => setWaiting(true), 180);
      },
      playing: () => {
        window.clearTimeout(waitTimer);
        setWaiting(false);
      },
      canplay: () => {
        window.clearTimeout(waitTimer);
        setWaiting(false);
      },
      seeked: () => time.set(v.currentTime),
      progress: measure,
      timeupdate: measure,
    };
    for (const [k, f] of Object.entries(on)) v.addEventListener(k, f);
    return () => {
      window.clearTimeout(waitTimer);
      for (const [k, f] of Object.entries(on)) v.removeEventListener(k, f);
    };
  }, [rendition.src, speed, time, buffered, volume]);

  useEffect(() => {
    const track = video.current && captionTrack(video.current);
    if (!track) return;
    const onCue = () => {
      const c = track.activeCues?.[0] as VTTCue | undefined;
      setCue(c ? c.text : null);
    };
    track.addEventListener("cuechange", onCue);
    return () => track.removeEventListener("cuechange", onCue);
  }, [rendition.src]);

  useEffect(() => {
    const on = () => setFullscreen(document.fullscreenElement === root.current);
    document.addEventListener("fullscreenchange", on);
    return () => document.removeEventListener("fullscreenchange", on);
  }, []);

  const hideTimer = useRef<number | undefined>(undefined);
  const wake = useCallback(() => {
    setActive(true);
    window.clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => setActive(false), HIDE_AFTER);
  }, []);
  useEffect(() => () => window.clearTimeout(hideTimer.current), []);
  const showControls = started && (!playing || active || menu !== null || scrubbing || help);

  const say = (node: ReactNode, round = false) => setFlash({ key: performance.now(), node, round });
  // Keep keyboard focus on the player, even when the button that was clicked goes away.
  const keepFocus = () => {
    if (!root.current?.contains(document.activeElement) || document.activeElement === document.body) root.current?.focus({ preventScroll: true });
  };
  const toggle = () => {
    const v = video.current;
    if (!v) return;
    if (v.paused || v.ended) void v.play();
    else v.pause();
  };
  const seekTo = (t: number) => {
    const v = video.current;
    if (!v) return;
    const to = Math.max(0, Math.min(v.duration || duration, t));
    v.currentTime = to;
    time.set(to);
    setEnded(false);
  };
  const skip = (d: number, quiet = false) => {
    seekTo((video.current?.currentTime ?? 0) + d);
    if (!quiet) say(<SkipLabel seconds={d} />);
  };
  const setVol = (x: number, announce = false) => {
    const v = video.current;
    const n = Math.max(0, Math.min(1, x));
    volume.set(n);
    setVolumeState(n);
    if (v) {
      v.volume = n;
      v.muted = n === 0;
    }
    setMuted(n === 0);
    if (announce) say(<span className="tabular">Volume {Math.round(n * 100)}%</span>);
  };
  const toggleMute = () => {
    const v = video.current;
    if (!v) return;
    const next = !muted;
    v.muted = next;
    setMuted(next);
    if (!next && volume.get() === 0) setVol(0.5);
  };
  const changeSpeed = (s: number) => {
    setSpeed(s);
    if (video.current) video.current.playbackRate = s;
  };
  const changeQuality = (label: string) => {
    const v = video.current;
    if (!v || label === quality) return;
    resume.current = { t: v.currentTime, play: !v.paused };
    setWaiting(true);
    setQuality(label);
  };
  const toggleFullscreen = () => {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void root.current?.requestFullscreen?.();
  };
  const togglePip = async () => {
    const v = video.current;
    if (!v || !document.pictureInPictureEnabled) return;
    if (document.pictureInPictureElement) await document.exitPictureInPicture();
    else await v.requestPictureInPicture().catch(() => {});
  };
  const setCaptions = (on: boolean) => {
    setCc(on);
    say(<span>{on ? l.captionsOn : l.captionsOff}</span>);
  };

  const onKey = (e: ReactKeyboardEvent) => {
    if (e.target instanceof HTMLElement && e.target.closest("[data-player-menu]")) return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const k = e.key;
    const onSlider = !!(e.target as HTMLElement).closest("[role=slider]");
    const handled = (() => {
      if (k === "Escape" && help) return setHelp(false), true;
      if (k === "Escape" && menu) return setMenu(null), true;
      if (k === "?") return setHelp((h) => !h), true;
      if (k === " " || k === "k" || k === "K") {
        if (e.target instanceof HTMLButtonElement && k === " ") return false;
        toggle();
        say(<PlayGlyph playing={!playing} size={30} />, true);
        return true;
      }
      if (k === "j" || k === "J") return skip(-10), true;
      if (k === "l" || k === "L") return skip(10), true;
      if (k === "ArrowLeft" && !onSlider) return skip(-5), true;
      if (k === "ArrowRight" && !onSlider) return skip(5), true;
      if (k === "ArrowUp" && !onSlider) return setVol(volume.get() + 0.05, true), true;
      if (k === "ArrowDown" && !onSlider) return setVol(volume.get() - 0.05, true), true;
      if (k === "m" || k === "M") return toggleMute(), say(<span>{muted ? l.soundOn : l.muted}</span>), true;
      if (k === "f" || k === "F") return toggleFullscreen(), true;
      if ((k === "c" || k === "C") && captions) return setCaptions(!cc), true;
      if ((k === "t" || k === "T") && onTheaterChange) return onTheaterChange(!theater), true;
      if (k === "Home") return seekTo(0), true;
      if (k === "End") return seekTo(duration), true;
      if (k === ">" || k === "<") {
        const i = SPEEDS.indexOf(speed) + (k === ">" ? 1 : -1);
        const s = SPEEDS[Math.max(0, Math.min(SPEEDS.length - 1, i))];
        changeSpeed(s);
        say(<span className="tabular">{s === 1 ? l.normalSpeed : `${s}×`}</span>);
        return true;
      }
      if (/^[0-9]$/.test(k)) return seekTo((duration * Number(k)) / 10), true;
      return false;
    })();
    if (handled) {
      e.preventDefault();
      if (started) wake();
    }
  };

  const lastUp = useRef<{ t: number; zone: -1 | 0 | 1 } | null>(null);
  const run = useRef<{ t: number; side: -1 | 1; total: number } | null>(null);
  const pending = useRef<number | undefined>(undefined);
  const [ripple, setRipple] = useState<{ key: number; side: -1 | 1; total: number; x: number; y: number } | null>(null);
  useEffect(() => () => window.clearTimeout(pending.current), []);
  useEffect(() => {
    if (!ripple) return;
    const k = ripple.key;
    const t = window.setTimeout(() => setRipple((r) => (r?.key === k ? null : r)), 800);
    return () => window.clearTimeout(t);
  }, [ripple]);

  const seekRun = (side: -1 | 1, x: number, y: number) => {
    const now = performance.now();
    const r = run.current && run.current.side === side && now - run.current.t < 900 ? run.current : { t: now, side, total: 0 };
    r.t = now;
    r.total += 10;
    run.current = r;
    skip(side * 10, true);
    setRipple({ key: now, side, total: r.total, x, y });
  };

  const onSurfaceUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    keepFocus();
    if (menu) return setMenu(null);
    const r = e.currentTarget.getBoundingClientRect();
    const fx = (e.clientX - r.left) / r.width;
    const px = e.clientX - r.left, py = e.clientY - r.top;
    const zone: -1 | 0 | 1 = fx < SIDE ? -1 : fx > 1 - SIDE ? 1 : 0;
    const now = performance.now();
    const prev = lastUp.current;
    const double = !!prev && now - prev.t < DOUBLE_MS && prev.zone === zone;
    lastUp.current = { t: now, zone };
    const inRun = zone !== 0 && run.current?.side === zone && now - run.current.t < 900;

    if (e.pointerType === "mouse") {
      if (zone === 0) {
        if (double) {
          toggle();
          toggleFullscreen();
          lastUp.current = null;
          return;
        }
        toggle();
        say(<PlayGlyph playing={!playing} size={30} />, true);
        return;
      }
      // The sides wait a beat, so a double click can seek instead.
      if (double || inRun) {
        window.clearTimeout(pending.current);
        seekRun(zone, px, py);
        return;
      }
      window.clearTimeout(pending.current);
      const wasPlaying = playing;
      pending.current = window.setTimeout(() => {
        toggle();
        say(<PlayGlyph playing={!wasPlaying} size={30} />, true);
      }, DOUBLE_MS);
      return;
    }
    if (zone !== 0 && (double || inRun)) {
      seekRun(zone, px, py);
      return;
    }
    if (active && playing) setActive(false);
    else wake();
  };

  const playedMv = useTransform(time, (t) => (duration ? t / duration : 0));
  const currentChapter = useTransform(time, (t) => chapterAt(chapters, t)?.title ?? "");

  return (
    <VideoIconsContext value={ic}>
      <div
        ref={root}
        tabIndex={0}
        role="region"
        aria-label={l.player(title)}
        aria-keyshortcuts="Space K J L M C F T ?"
        onKeyDown={onKey}
        onPointerMove={(e) => e.pointerType === "mouse" && started && wake()}
        onPointerLeave={() => playing && setActive(false)}
        onFocus={() => started && wake()}
        className={cn(
          // The player is always dark inside: its controls sit on picture, whatever the page theme.
          "dark group/player relative isolate aspect-video w-full select-none overflow-hidden bg-black text-ink outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-ground",
          fullscreen ? "rounded-none" : "rounded-[18px]",
          started && !showControls && "cursor-none",
          className,
        )}
      >
        <video
          ref={video}
          key={rendition.src}
          src={rendition.src}
          poster={poster}
          preload="metadata"
          playsInline
          className="absolute inset-0 size-full object-contain"
          aria-label={title}
        >
          {captions && <track kind="captions" src={captions.src} srcLang={captions.lang} label={captions.label} default />}
        </video>

        <div className="absolute inset-0" onPointerUp={onSurfaceUp} aria-hidden />

        <AnimatePresence>
          {ripple && (
            <motion.div
              key={`${ripple.side}`}
              aria-hidden
              className={cn("pointer-events-none absolute inset-y-0 w-[38%] overflow-hidden", ripple.side < 0 ? "left-0 rounded-r-[50%]" : "right-0 rounded-l-[50%]")}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.35, ease: easeOut } }}
              transition={{ duration: 0.12, ease: easeOut }}
            >
              <div className="absolute inset-0 bg-white/[0.08]" />
              <div className="absolute inset-0 grid place-items-center">
                <div className="flex flex-col items-center gap-1.5 text-white">
                  <SeekChevrons side={ripple.side} k={ripple.key} />
                  <span className="text-[13px] font-semibold tabular">{ripple.total} seconds</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {ripple && (
            <motion.span
              key={ripple.key}
              aria-hidden
              className="pointer-events-none absolute size-40 rounded-full bg-white/20"
              style={{ left: ripple.x - 80, top: ripple.y - 80 }}
              initial={{ scale: 0, opacity: 1 }}
              animate={{ scale: 2.2, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: easeOut }}
            />
          )}
        </AnimatePresence>

        <motion.div
          aria-live="polite"
          className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center px-6 pb-5"
          initial={false}
          animate={{ y: showControls ? -88 : 0 }}
          transition={springSoft}
        >
          <AnimatePresence>
            {cc && cue && !previewing && (
              <motion.p
                key={cue}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.12 } }}
                transition={fade}
                className={cn("max-w-[80%] whitespace-pre-line rounded-[8px] bg-black/75 px-3.5 py-1.5 text-center font-medium leading-snug text-white", CAPTION_SIZES[ccSize])}
              >
                {cue}
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>

        <AnimatePresence>
          {!started && (
            <motion.div key="poster" className="absolute inset-0" initial={false} exit={{ opacity: 0, transition: { duration: 0.3, ease: easeOut } }}>
              <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 to-transparent" />
              <motion.button
                type="button"
                aria-label={l.playTitle(title)}
                onClick={() => {
                  toggle();
                  root.current?.focus({ preventScroll: true });
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={springSoft}
                className="absolute left-1/2 top-1/2 -ml-8 -mt-8 grid size-16 place-items-center rounded-full bg-white text-black shadow-[0_8px_30px_rgba(0,0,0,0.35)] sm:-ml-10 sm:-mt-10 sm:size-20"
              >
                <span className="ml-1 grid"><PlayGlyph playing={false} size={30} /></span>
              </motion.button>
              <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-4 text-white sm:p-6">
                <div className="min-w-0">
                  <p className="truncate text-lg font-semibold tracking-[-0.01em] sm:text-[26px] sm:leading-8">{title}</p>
                  {subtitle && <p className="mt-0.5 truncate text-[13px] text-white/75 sm:text-[15px]">{subtitle}</p>}
                </div>
                <p className="shrink-0 text-[13px] font-medium tabular text-white/80">
                  {duration ? fmt(duration) : ""}
                  {chapters.length > 0 && <span className="hidden sm:inline"> · {l.chapterCount(chapters.length)}</span>}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {waiting && (
            <motion.div key="wait" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={fade} className="pointer-events-none absolute inset-0 grid place-items-center" role="status" aria-label={l.loading}>
              <span className="grid animate-spin text-white [&>svg]:size-11" aria-hidden>{ic.spinner}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {flash && (
            <motion.div
              key={flash.key}
              aria-hidden
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: [0, 1, 1, 0], scale: [0.85, 1, 1.02, 1.1] }}
              transition={{ duration: 0.8, times: [0, 0.15, 0.6, 1], ease: easeOut }}
              onAnimationComplete={() => setFlash((f) => (f?.key === flash.key ? null : f))}
              className={cn(
                "pointer-events-none absolute left-1/2 top-1/2 grid place-items-center bg-black/55 font-semibold text-white",
                flash.round ? "-ml-9 -mt-9 size-[72px] rounded-full" : "-translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full px-4 py-2.5 text-sm",
              )}
            >
              {flash.node}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {ended && (
            <motion.div key="end" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={fade} className="absolute inset-0 grid place-items-center bg-black/70 p-4">
              <div className="flex w-full max-w-[640px] flex-col items-center text-center text-white">
                <p className="text-[13px] text-white/70">{l.youWatched}</p>
                <p className="mt-0.5 text-lg font-semibold sm:text-xl">{title}</p>
                <motion.button
                  type="button"
                  onClick={() => {
                    seekTo(0);
                    void video.current?.play();
                  }}
                  whileTap={{ scale: 0.96 }}
                  transition={springSoft}
                  className="mt-4 inline-flex h-10 items-center gap-2 rounded-full bg-white px-5 text-sm font-semibold text-black"
                >
                  <span className="grid [&>svg]:size-4" aria-hidden>{ic.replay}</span> {l.watchAgain}
                </motion.button>
                {previews && chapters.length > 1 && (
                  <div className="mt-6 hidden w-full grid-cols-4 gap-3 sm:grid">
                    {chapters.map((c, i) => (
                      <motion.button
                        key={c.start}
                        type="button"
                        onClick={() => {
                          seekTo(c.start);
                          void video.current?.play();
                        }}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ ...springSoft, delay: 0.08 + i * 0.05 }}
                        className="group/ch text-left"
                      >
                        <span className="block w-fit overflow-hidden rounded-[8px] ring-1 ring-white/15 transition-[box-shadow] group-hover/ch:ring-white/60">
                          <span className="block transition-transform duration-500 ease-out-soft group-hover/ch:scale-[1.04]" style={frameStyle(previews, c.start + 1, 140)} />
                        </span>
                        <span className="mt-1.5 block truncate text-[12px] font-medium text-white">{c.title}</span>
                        <span className="block text-[11px] tabular text-white/60">{fmt(c.start)}</span>
                      </motion.button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          aria-hidden={!showControls}
          initial={false}
          animate={{ opacity: showControls && !ended ? 1 : 0 }}
          transition={{ duration: showControls ? 0.18 : 0.45, ease: easeOut }}
          className="pointer-events-none absolute inset-x-0 top-0"
        >
          <div aria-hidden className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/60 to-transparent" />
          <div className="relative flex items-start gap-3 px-4 pt-3.5 text-white sm:px-5 sm:pt-4">
            <div className="min-w-0">
              <p className="truncate text-[15px] font-semibold sm:text-base">{title}</p>
              {chapters.length > 0 && <motion.p className="truncate text-[13px] text-white/70">{currentChapter}</motion.p>}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={false}
          animate={{ opacity: showControls && !ended ? 1 : 0 }}
          transition={{ duration: showControls ? 0.18 : 0.45, ease: easeOut }}
          className={cn("absolute inset-x-0 bottom-0", (!showControls || ended) && "pointer-events-none")}
        >
          <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/75 via-black/35 to-transparent" />
          <div className="relative px-3 pb-2 sm:px-5 sm:pb-3">
            <div className="flex items-center gap-3">
              <TimeText time={time} className="w-10 text-left" />
              <Scrubber
                time={time}
                played={playedMv}
                buffered={buffered}
                duration={duration}
                chapters={chapters}
                previews={previews}
                onSeek={seekTo}
                onScrub={setScrubbing}
                onPreview={setPreviewing}
                l={l}
              />
              <button
                type="button"
                onClick={() => setRemaining((r) => !r)}
                aria-label={remaining ? l.showTotal : l.showRemaining}
                className="w-11 shrink-0 rounded-[6px] text-right text-[12.5px] font-medium tabular text-white/75 transition-colors hover:text-white"
              >
                {remaining ? <RemainingText time={time} duration={duration} /> : fmt(duration)}
              </button>
            </div>
            <div className="mt-1 flex items-center gap-0.5 text-white sm:gap-1">
              <CtlButton label={playing ? l.pause : l.play} onClick={toggle}>
                <PlayGlyph playing={playing} size={22} />
              </CtlButton>
              <CtlButton label={l.back10} onClick={() => skip(-10)} className="hidden sm:grid [&>svg]:size-[22px]">
                {ic.back10}
              </CtlButton>
              <CtlButton label={l.forward10} onClick={() => skip(10)} className="hidden sm:grid [&>svg]:size-[22px]">
                {ic.forward10}
              </CtlButton>
              <VolumeControl volume={volume} level={volumeState} muted={muted} onToggle={toggleMute} onChange={setVol} l={l} />
              <span className="flex-1" />
              {speed !== 1 && (
                <button type="button" onClick={() => setMenu("speed")} className="mr-1 hidden h-6 items-center rounded-full bg-white/15 px-2 text-[11.5px] font-semibold tabular text-white sm:flex">
                  {speed}×
                </button>
              )}
              {captions && (
                <CtlButton label={l.captionsToggle} onClick={() => setCaptions(!cc)} pressed={cc}>
                  <span className="relative grid [&>svg]:size-[21px]">
                    {ic.captions}
                    <motion.span aria-hidden initial={false} animate={{ opacity: cc ? 1 : 0 }} transition={fade} className="absolute -bottom-1.5 left-1/2 h-0.5 w-4 -translate-x-1/2 rounded-full bg-white" />
                  </span>
                </CtlButton>
              )}
              <CtlButton label={l.settings} onClick={() => setMenu(menu ? null : "main")} pressed={menu !== null} dataMenuButton>
                <motion.span initial={false} animate={{ rotate: menu ? 60 : 0 }} transition={springSoft} className="grid [&>svg]:size-[20px]">
                  {ic.settings}
                </motion.span>
              </CtlButton>
              <CtlButton label={l.pictureInPicture} onClick={togglePip} className="hidden sm:grid [&>svg]:size-[20px]">
                {ic.pictureInPicture}
              </CtlButton>
              {onTheaterChange && !fullscreen && (
                <CtlButton label={theater ? l.defaultView : l.theaterMode} onClick={() => onTheaterChange(!theater)} className="hidden md:grid" pressed={theater}>
                  <span className={cn("grid transition-transform duration-300 ease-out-soft [&>svg]:size-[21px]", theater ? "scale-x-[0.8]" : "scale-x-110")}>{ic.theater}</span>
                </CtlButton>
              )}
              <CtlButton label={fullscreen ? l.exitFullscreen : l.fullscreen} onClick={toggleFullscreen}>
                <span className="grid [&>*]:[grid-area:1/1]">
                  <motion.span initial={false} animate={{ opacity: fullscreen ? 0 : 1, scale: fullscreen ? 0.8 : 1 }} transition={springSnappy} className="grid [&>svg]:size-[19px]">{ic.fullscreen}</motion.span>
                  <motion.span initial={false} animate={{ opacity: fullscreen ? 1 : 0, scale: fullscreen ? 1 : 0.8 }} transition={springSnappy} className="grid [&>svg]:size-[19px]">{ic.exitFullscreen}</motion.span>
                </span>
              </CtlButton>
            </div>
          </div>
        </motion.div>

        <SettingsPanel
          page={menu}
          setPage={setMenu}
          speed={speed}
          onSpeed={changeSpeed}
          quality={quality}
          qualities={renditions}
          onQuality={changeQuality}
          captions={captions}
          cc={cc}
          onCc={setCaptions}
          ccSize={ccSize}
          onCcSize={setCcSize}
          chapters={chapters}
          previews={previews}
          time={time}
          onChapter={(t) => {
            seekTo(t);
            setMenu(null);
          }}
          onShortcuts={() => {
            setMenu(null);
            setHelp(true);
          }}
          rootRef={root}
          l={l}
        />

        <AnimatePresence>
          {help && (
            <motion.div
              key="help"
              data-player-menu
              role="dialog"
              aria-label={l.keyboardShortcuts}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.14, ease: easeOut } }}
              transition={fade}
              onKeyDown={(e) => {
                if (e.key === "Escape" || e.key === "?") {
                  e.stopPropagation();
                  setHelp(false);
                  root.current?.focus({ preventScroll: true });
                }
              }}
              className="absolute inset-0 z-30 grid place-items-center bg-black/75 p-4"
              onPointerUp={(e) => e.target === e.currentTarget && setHelp(false)}
            >
              <motion.div
                initial={{ scale: 0.97, y: 6 }}
                animate={{ scale: 1, y: 0 }}
                transition={springSoft}
                className="max-h-full w-full max-w-[520px] overflow-y-auto rounded-[14px] bg-surface p-4 text-white ring-1 ring-white/10 sm:p-5"
              >
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-[15px] font-semibold">{l.keyboardShortcuts}</p>
                  <button
                    type="button"
                    autoFocus
                    aria-label={l.closeShortcuts}
                    onClick={() => {
                      setHelp(false);
                      root.current?.focus({ preventScroll: true });
                    }}
                    className="grid size-8 place-items-center rounded-full text-white/80 transition-colors hover:bg-white/10 hover:text-white [&>svg]:size-4"
                  >
                    {ic.close}
                  </button>
                </div>
                <dl className="grid grid-cols-1 gap-x-6 gap-y-1.5 text-[13px] sm:grid-cols-2">
                  {l.shortcuts.map(([keys, what]) => (
                    <div key={what} className="flex items-center justify-between gap-3">
                      <dt className="text-white/75">{what}</dt>
                      <dd className="flex gap-1">
                        {keys.split("  ").map((k) => (
                          <kbd key={k} className="min-w-6 rounded-[5px] bg-white/10 px-1.5 text-center text-[12px] font-medium leading-6 text-white">{k}</kbd>
                        ))}
                      </dd>
                    </div>
                  ))}
                </dl>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </VideoIconsContext>
  );
}

function CtlButton({ label, onClick, children, className, pressed, dataMenuButton }: { label: string; onClick: () => void; children: ReactNode; className?: string; pressed?: boolean; dataMenuButton?: boolean }) {
  return (
    <motion.button
      type="button"
      aria-label={label.replace(/ \(.\)$/, "")}
      title={label}
      aria-pressed={pressed}
      data-player-menu-button={dataMenuButton || undefined}
      onClick={onClick}
      whileTap={{ scale: 0.88 }}
      transition={springSoft}
      className={cn("grid size-9 shrink-0 place-items-center rounded-full text-white/90 transition-colors hover:bg-white/[0.12] hover:text-white sm:size-10", className)}
    >
      {children}
    </motion.button>
  );
}

function StaticShape({ paths }: { paths: string[] }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden fill="currentColor">
      {paths.map((d, k) => <path key={k} d={d} />)}
    </svg>
  );
}

function PlayGlyph({ playing, size }: { playing: boolean; size: number }) {
  const ic = useVideoIcons();
  if (ic.play !== null || ic.pause !== null) {
    return (
      <span className="grid [&>*]:[grid-area:1/1] [&_svg]:size-full" style={{ width: size, height: size }} aria-hidden>
        <motion.span className="grid" initial={false} animate={{ opacity: playing ? 0 : 1 }} transition={fade}>{ic.play ?? <StaticShape paths={PLAY} />}</motion.span>
        <motion.span className="grid" initial={false} animate={{ opacity: playing ? 1 : 0 }} transition={fade}>{ic.pause ?? <StaticShape paths={PAUSE} />}</motion.span>
      </span>
    );
  }
  const d = playing ? PAUSE : PLAY;
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden fill="currentColor">
      <motion.path initial={false} animate={{ d: d[0] }} transition={springFirm} />
      <motion.path initial={false} animate={{ d: d[1] }} transition={springFirm} />
    </svg>
  );
}

function SkipLabel({ seconds }: { seconds: number }) {
  const ic = useVideoIcons();
  return (
    <span className="flex items-center gap-1.5 tabular text-white">
      {seconds < 0 ? <span className="grid [&>svg]:size-4" aria-hidden>{ic.previous}</span> : null}
      {Math.abs(seconds)} seconds
      {seconds > 0 ? <span className="grid [&>svg]:size-4" aria-hidden>{ic.next}</span> : null}
    </span>
  );
}

/** Three chevrons that light in turn, pointing the way you are seeking. */
function SeekChevrons({ side, k }: { side: -1 | 1; k: number }) {
  const ic = useVideoIcons();
  const order = side < 0 ? [2, 1, 0] : [0, 1, 2];
  return (
    <span className={cn("flex", side < 0 && "rotate-180")}>
      {order.map((n, i) => (
        <motion.span
          key={`${k}-${n}`}
          className="-mx-1 grid [&>svg]:size-5 [&>svg]:[stroke-width:2.5]"
          initial={{ opacity: 0.25 }}
          animate={{ opacity: [0.25, 1, 0.25] }}
          transition={{ duration: 0.5, delay: i * 0.09, ease: easeOut }}
        >
          {ic.seek}
        </motion.span>
      ))}
    </span>
  );
}

function TimeText({ time, className }: { time: MotionValue<number>; className?: string }) {
  const now = useTransform(time, fmt);
  return <motion.span className={cn("shrink-0 text-[12.5px] font-medium tabular text-white/90", className)}>{now}</motion.span>;
}

function RemainingText({ time, duration }: { time: MotionValue<number>; duration: number }) {
  const left = useTransform(time, (t) => `−${fmt(duration - t)}`);
  return <motion.span>{left}</motion.span>;
}

type ScrubberProps = {
  time: MotionValue<number>;
  played: MotionValue<number>;
  buffered: MotionValue<number>;
  duration: number;
  chapters: VideoChapter[];
  previews?: Previews;
  onSeek: (t: number) => void;
  onScrub: (v: boolean) => void;
  /** The hover preview is showing (captions step aside). */
  onPreview?: (v: boolean) => void;
  l: VideoPlayerLabels;
};

function Scrubber({ time, played, buffered, duration, chapters, previews, onSeek, onScrub, onPreview, l }: ScrubberProps) {
  const track = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState(false);
  const [drag, setDrag] = useState(false);
  const hoverFrac = useMotionValue(0);
  const width = useMotionValue(1);
  const id = useId();
  const segments = useMemo(() => {
    const starts = chapters.length ? chapters.map((c) => c.start) : [0];
    return starts.map((s, i) => ({ start: s, end: i < starts.length - 1 ? starts[i + 1] : duration || 1, title: chapters[i]?.title }));
  }, [chapters, duration]);

  const hoverTime = useTransform(hoverFrac, (f) => f * duration);
  const bubbleX = useTransform([hoverFrac, width], ([f, w]: number[]) => {
    const half = previews ? previews.width / 2 : 28;
    // The bubble may overhang the track a little, never the player.
    return Math.max(half - 52, Math.min(w - half + 52, f * w));
  });
  const hoverText = useTransform(hoverTime, fmt);
  const hoverChapter = useTransform(hoverTime, (t) => chapterAt(chapters, t)?.title ?? "");
  const spritePos = useTransform(hoverTime, (t) => {
    if (!previews) return "0 0";
    const i = Math.min(Math.floor(t / previews.interval), 10_000);
    return `${-(i % previews.cols) * previews.width}px ${-Math.floor(i / previews.cols) * previews.height}px`;
  });
  const knobX = useTransform([played, width], ([p, w]: number[]) => p * w);

  const frac = (clientX: number) => {
    const r = track.current!.getBoundingClientRect();
    width.set(r.width);
    return Math.max(0, Math.min(1, (clientX - r.left) / r.width));
  };
  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const ro = new ResizeObserver(() => width.set(el.getBoundingClientRect().width));
    ro.observe(el);
    return () => ro.disconnect();
  }, [width]);

  const [valueNow, setValueNow] = useState(0);
  useMotionValueEvent(time, "change", (t) => {
    const s = Math.floor(t);
    setValueNow((v) => (v === s ? v : s));
  });

  const lifted = hover || drag;
  return (
    <div
      ref={track}
      className="group/scrub relative flex h-6 min-w-0 flex-1 cursor-pointer items-center touch-none outline-none"
      onPointerEnter={(e) => {
        if (e.pointerType === "mouse") {
          setHover(true);
          onPreview?.(true);
        }
        // Set the position on entry too: controls that just reappeared get no move event first.
        hoverFrac.set(frac(e.clientX));
      }}
      onPointerLeave={() => {
        setHover(false);
        onPreview?.(false);
      }}
      onPointerMove={(e) => {
        const f = frac(e.clientX);
        hoverFrac.set(f);
        if (drag) onSeek(f * duration);
      }}
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        setDrag(true);
        onScrub(true);
        const f = frac(e.clientX);
        hoverFrac.set(f);
        onSeek(f * duration);
      }}
      onPointerUp={() => {
        setDrag(false);
        onScrub(false);
      }}
      onPointerCancel={() => {
        setDrag(false);
        onScrub(false);
      }}
      role="slider"
      tabIndex={0}
      aria-label={l.seek}
      aria-valuemin={0}
      aria-valuemax={Math.floor(duration)}
      aria-valuenow={valueNow}
      aria-valuetext={l.position(fmt(valueNow), fmt(duration))}
      aria-describedby={id}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
          e.preventDefault();
          e.stopPropagation();
          onSeek(time.get() + (e.key === "ArrowRight" ? 5 : -5));
        }
      }}
    >
      <motion.div
        className="flex h-[6px] w-full origin-center gap-[3px] group-focus-visible/scrub:outline group-focus-visible/scrub:outline-2 group-focus-visible/scrub:outline-offset-4 group-focus-visible/scrub:outline-white/70"
        initial={false}
        animate={{ scaleY: lifted ? 1 : 0.6 }}
        transition={springFirm}
      >
        {segments.map((s) => (
          <Segment key={s.start} start={s.start} end={s.end} duration={duration} time={time} buffered={buffered} hoverTime={hoverTime} hovering={lifted} />
        ))}
      </motion.div>

      <motion.span
        aria-hidden
        className="pointer-events-none absolute left-0 top-1/2 -ml-[7px] -mt-[7px] size-[14px] rounded-full bg-white shadow-[0_1px_4px_rgba(0,0,0,0.4)]"
        style={{ x: knobX }}
        initial={false}
        animate={{ scale: lifted ? 1 : 0.7 }}
        transition={springSnappy}
      />

      <motion.div
        id={id}
        aria-hidden
        className="pointer-events-none absolute bottom-full left-0 mb-3"
        style={{ x: bubbleX }}
        initial={false}
        animate={{ opacity: hover ? 1 : 0, y: hover ? 0 : 4 }}
        transition={fade}
      >
        <div className="-translate-x-1/2">
          {previews && (
            <motion.div
              className="overflow-hidden rounded-[10px] bg-black shadow-[0_10px_30px_rgba(0,0,0,0.45)] ring-1 ring-white/25"
              style={{
                width: previews.width,
                height: previews.height,
                backgroundImage: `url(${previews.src})`,
                backgroundPosition: spritePos,
                backgroundRepeat: "no-repeat",
              }}
            />
          )}
          <div className="mt-2 flex items-baseline justify-center gap-2 text-white">
            {chapters.length > 0 && <motion.span className="max-w-[160px] truncate text-[12px] font-semibold">{hoverChapter}</motion.span>}
            <motion.span className="text-[12px] font-medium tabular text-white/75">{hoverText}</motion.span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function Segment({ start, end, duration, time, buffered, hoverTime, hovering }: {
  start: number; end: number; duration: number; time: MotionValue<number>; buffered: MotionValue<number>; hoverTime: MotionValue<number>; hovering: boolean;
}) {
  const len = Math.max(end - start, 0.001);
  const part = (t: number) => Math.max(0, Math.min(1, (t - start) / len));
  const playedX = useTransform(time, (t) => `${(part(t) - 1) * 100}%`);
  const bufferedX = useTransform(buffered, (b) => `${(part(b * duration) - 1) * 100}%`);
  const hoverX = useTransform(hoverTime, (t) => `${(part(t) - 1) * 100}%`);
  return (
    <div className="relative h-full overflow-hidden rounded-full bg-white/20" style={{ flexGrow: len, flexBasis: 0 }}>
      <motion.div className="absolute inset-0 bg-white/30" style={{ x: bufferedX }} />
      <motion.div className="absolute inset-0 bg-white/35" style={{ x: hoverX }} initial={false} animate={{ opacity: hovering ? 1 : 0 }} transition={fade} />
      <motion.div className="absolute inset-0 bg-accent" style={{ x: playedX }} />
    </div>
  );
}

function VolumeControl({ volume, level, muted, onToggle, onChange, l }: { volume: MotionValue<number>; level: number; muted: boolean; onToggle: () => void; onChange: (v: number, announce?: boolean) => void; l: VideoPlayerLabels }) {
  const track = useRef<HTMLDivElement>(null);
  const shown = useTransform(volume, (v) => (muted ? 0 : v));
  const fillX = useTransform(shown, (v) => `${(v - 1) * 100}%`);
  const knob = useTransform(shown, (v) => v * 72);
  const dragging = useRef(false);
  const from = (x: number) => {
    const r = track.current!.getBoundingClientRect();
    return (x - r.left) / r.width;
  };
  const silent = muted || level === 0;
  const ic = useVideoIcons();
  const custom = ic.volume !== null || ic.volumeLow !== null || ic.mute !== null;
  return (
    <div className="group/vol flex items-center">
      <CtlButton label={silent ? l.unmute : l.mute} onClick={onToggle}>
        {custom ? (
          <span className="grid [&>*]:[grid-area:1/1] [&_svg]:size-[22px]" aria-hidden>
            {[
              { on: silent, el: ic.mute ?? <VolumeX /> },
              { on: !silent && level < 0.5, el: ic.volumeLow ?? <Volume1 /> },
              { on: !silent && level >= 0.5, el: ic.volume ?? <Volume2 /> },
            ].map((v, i) => (
              <motion.span key={i} className="grid" initial={false} animate={{ opacity: v.on ? 1 : 0 }} transition={fade}>{v.el}</motion.span>
            ))}
          </span>
        ) : (
          <svg viewBox="0 0 24 24" className="size-[22px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M11 5 6.5 9H3.5v6h3l4.5 4V5Z" fill="currentColor" stroke="none" />
            <motion.path d="M15.5 9.5a3.5 3.5 0 0 1 0 5" initial={false} animate={{ opacity: silent ? 0 : 1 }} transition={fade} />
            <motion.path d="M18 7a7 7 0 0 1 0 10" initial={false} animate={{ opacity: silent || level < 0.5 ? 0 : 1 }} transition={fade} />
            <motion.g initial={false} animate={{ opacity: silent ? 1 : 0, scale: silent ? 1 : 0.6 }} transition={springSnappy} style={{ originX: "19px", originY: "12px" }}>
              <path d="m16 9.5 5 5M21 9.5l-5 5" />
            </motion.g>
          </svg>
        )}
      </CtlButton>
      <div
        ref={track}
        role="slider"
        tabIndex={0}
        aria-label={l.volume}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round((muted ? 0 : level) * 100)}
        className="relative ml-0.5 mr-2 hidden h-8 w-[72px] cursor-pointer items-center touch-none outline-none sm:flex"
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          dragging.current = true;
          onChange(from(e.clientX));
        }}
        onPointerMove={(e) => dragging.current && onChange(from(e.clientX))}
        onPointerUp={() => (dragging.current = false)}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight" || e.key === "ArrowUp") { e.preventDefault(); e.stopPropagation(); onChange(volume.get() + 0.05); }
          if (e.key === "ArrowLeft" || e.key === "ArrowDown") { e.preventDefault(); e.stopPropagation(); onChange(volume.get() - 0.05); }
        }}
      >
        <div className="relative h-1 w-full overflow-hidden rounded-full bg-white/25">
          <motion.div className="absolute inset-0 bg-white" style={{ x: fillX }} />
        </div>
        <motion.span aria-hidden className="absolute left-0 top-1/2 -ml-1.5 -mt-1.5 size-3 rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.4)] transition-transform duration-200 group-hover/vol:scale-110" style={{ x: knob }} />
      </div>
    </div>
  );
}

type PanelProps = {
  page: Page | null;
  setPage: (v: Page | null) => void;
  speed: number;
  onSpeed: (s: number) => void;
  quality: string;
  qualities: VideoRendition[];
  onQuality: (q: string) => void;
  captions?: VideoPlayerProps["captions"];
  cc: boolean;
  onCc: (on: boolean) => void;
  ccSize: CaptionSize;
  onCcSize: (s: CaptionSize) => void;
  chapters: VideoChapter[];
  previews?: Previews;
  time: MotionValue<number>;
  onChapter: (t: number) => void;
  onShortcuts: () => void;
  rootRef: React.RefObject<HTMLDivElement | null>;
  l: VideoPlayerLabels;
};

/**
 * Settings, inside the player. Every page shares one cell, so the panel keeps
 * one size and pages cross-fade in place: nothing slides and nothing jumps.
 * On a phone it covers the picture; on wider screens it sits above the bar.
 */
function SettingsPanel(p: PanelProps) {
  const { page, setPage, l } = p;
  const ic = useVideoIcons();
  const panel = useRef<HTMLDivElement>(null);
  const [now, setNow] = useState(0);

  useEffect(() => {
    if (!page) return;
    const onDown = (e: PointerEvent) => {
      const t = e.target as Element;
      if (panel.current?.contains(t) || t.closest?.("[data-player-menu-button]")) return;
      setPage(null);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [page, setPage]);

  useEffect(() => {
    if (!page) return;
    setNow(p.time.get());
    // Move focus into the page only for keyboard users; a mouse click leaves no highlighted row behind.
    const viaKeys = document.activeElement?.matches(":focus-visible");
    if (viaKeys) requestAnimationFrame(() => panel.current?.querySelector<HTMLElement>(`[data-page="${page}"] [role^=menuitem]`)?.focus({ preventScroll: true }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const shown = page ?? "main";
  const close = () => {
    setPage(null);
    p.rootRef.current?.focus({ preventScroll: true });
  };
  const row = "flex h-10 w-full shrink-0 items-center gap-3 rounded-[8px] px-3 text-left text-[13.5px] text-white outline-none transition-colors hover:bg-white/[0.08] focus-visible:bg-white/[0.08]";
  const current = chapterAt(p.chapters, now);

  const pages: Array<[Page, ReactNode]> = [
    [
      "main",
      <>
        <MainRow label={l.playbackSpeed} value={p.speed === 1 ? l.normal : `${p.speed}×`} onClick={() => setPage("speed")} cls={row} />
        <MainRow label={l.quality} value={p.quality} onClick={() => setPage("quality")} cls={row} />
        {p.captions && <MainRow label={l.captions} value={p.cc ? p.captions.label.replace(/ \(.*\)$/, "") : l.off} onClick={() => setPage("captions")} cls={row} />}
        {p.chapters.length > 0 && <MainRow label={l.chapters} value={String(p.chapters.length)} onClick={() => setPage("chapters")} cls={row} />}
        <button type="button" role="menuitem" className={cn(row, "text-white/80")} onClick={p.onShortcuts}>
          <span className="grid text-white/60 [&>svg]:size-4" aria-hidden>{ic.shortcuts}</span>
          <span className="flex-1">{l.keyboardShortcuts}</span>
          <kbd className="rounded-[5px] bg-white/10 px-1.5 text-[11px] leading-5 text-white/80">?</kbd>
        </button>
      </>,
    ],
    [
      "speed",
      <>
        <BackRow title={l.playbackSpeed} onClick={() => setPage("main")} cls={row} />
        <div className="grid grid-cols-4 gap-1.5 px-1.5 pt-1" role="group" aria-label={l.speeds}>
          {SPEEDS.map((s) => (
            <button
              key={s}
              type="button"
              role="menuitemradio"
              aria-checked={s === p.speed}
              onClick={() => p.onSpeed(s)}
              className="relative h-10 rounded-[8px] text-[13px] font-medium tabular outline-none transition-colors hover:bg-white/[0.08] focus-visible:ring-2 focus-visible:ring-white/60"
            >
              <motion.span aria-hidden initial={false} animate={{ opacity: s === p.speed ? 1 : 0 }} transition={fade} className="pointer-events-none absolute inset-0 rounded-[8px] bg-white" />
              <span className={cn("relative z-[1] transition-colors duration-200", s === p.speed ? "text-black" : "text-white")}>{`${s}×`}</span>
            </button>
          ))}
        </div>
        <p className="px-3 pt-3 text-[12px] leading-4 text-white/55">{l.speedHint}</p>
      </>,
    ],
    [
      "quality",
      <>
        <BackRow title={l.quality} onClick={() => setPage("main")} cls={row} />
        {[...p.qualities].sort((a, b) => b.height - a.height).map((q) => (
          <button key={q.label} type="button" role="menuitemradio" aria-checked={q.label === p.quality} className={row} onClick={() => { p.onQuality(q.label); close(); }}>
            <Tick on={q.label === p.quality} />
            <span className="flex-1">{q.label}</span>
            {q.height >= 720 && <span className="rounded-[4px] bg-white/15 px-1 text-[10px] font-bold leading-4">{l.hd}</span>}
          </button>
        ))}
      </>,
    ],
    [
      "captions",
      <>
        <BackRow title={l.captions} onClick={() => setPage("main")} cls={row} />
        <button type="button" role="menuitemradio" aria-checked={!p.cc} className={row} onClick={() => p.onCc(false)}>
          <Tick on={!p.cc} /> <span className="flex-1">{l.off}</span>
        </button>
        {p.captions && (
          <button type="button" role="menuitemradio" aria-checked={p.cc} className={row} onClick={() => p.onCc(true)}>
            <Tick on={p.cc} /> <span className="flex-1">{p.captions.label}</span>
          </button>
        )}
        <p className="px-3 pb-1.5 pt-2.5 text-[12px] font-medium text-white/55">{l.textSize}</p>
        <div className="grid grid-cols-3 gap-1.5 px-1.5" role="group" aria-label={l.captionTextSize}>
          {(Object.keys(CAPTION_SIZES) as CaptionSize[]).map((s) => (
            <button
              key={s}
              type="button"
              role="menuitemradio"
              aria-checked={s === p.ccSize}
              aria-label={l.captionSizes[s]}
              onClick={() => { p.onCcSize(s); if (!p.cc) p.onCc(true); }}
              className="relative h-9 rounded-[8px] outline-none transition-colors hover:bg-white/[0.08] focus-visible:ring-2 focus-visible:ring-white/60"
            >
              <motion.span aria-hidden initial={false} animate={{ opacity: s === p.ccSize ? 1 : 0 }} transition={fade} className="pointer-events-none absolute inset-0 rounded-[8px] bg-white" />
              <span className={cn("relative z-[1] font-semibold transition-colors duration-200", s === p.ccSize ? "text-black" : "text-white", { S: "text-[11px]", M: "text-[13px]", L: "text-[16px]" }[s])}>Aa</span>
            </button>
          ))}
        </div>
      </>,
    ],
    [
      "chapters",
      <>
        <BackRow title={l.chapters} onClick={() => setPage("main")} cls={row} />
        {p.chapters.map((c) => {
          const on = current?.start === c.start;
          return (
            <button key={c.start} type="button" role="menuitem" aria-current={on || undefined} className={cn(row, "h-12 gap-3")} onClick={() => p.onChapter(c.start)}>
              {p.previews ? (
                <span className={cn("shrink-0 overflow-hidden rounded-[5px] ring-1", on ? "ring-white" : "ring-white/15")} style={frameStyle(p.previews, c.start + 1, 56)} />
              ) : null}
              <span className="min-w-0 flex-1">
                <span className={cn("block truncate", on && "font-semibold")}>{c.title}</span>
                <span className="block text-[11.5px] tabular text-white/55">{fmt(c.start)}</span>
              </span>
            </button>
          );
        })}
      </>,
    ],
  ];

  return (
    <AnimatePresence>
      {page && (
        <motion.div
          ref={panel}
          data-player-menu
          role="menu"
          aria-label={l.settings}
          initial={{ opacity: 0, y: 6, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 4, scale: 0.98, transition: { duration: 0.14, ease: easeOut } }}
          transition={springSoft}
          style={{ transformOrigin: "100% 100%" }}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              e.stopPropagation();
              if (page !== "main") setPage("main");
              else close();
            }
            if (e.key === "ArrowDown" || e.key === "ArrowUp") {
              e.preventDefault();
              const items = Array.from(panel.current!.querySelectorAll<HTMLElement>(`[data-page="${page}"] [role^=menuitem]`));
              const i = items.indexOf(document.activeElement as HTMLElement);
              items[(i + (e.key === "ArrowDown" ? 1 : items.length - 1)) % items.length]?.focus();
            }
          }}
          className="absolute inset-2 z-20 overflow-y-auto overscroll-contain rounded-[14px] bg-surface p-1.5 text-white shadow-float ring-1 ring-white/10 sm:inset-auto sm:bottom-[84px] sm:right-4 sm:max-h-[calc(100%-100px)] sm:w-[272px]"
        >
          <div className="grid [&>*]:[grid-area:1/1]">
            {pages.map(([id, body]) => {
              const on = shown === id;
              return (
                <motion.div
                  key={id}
                  data-page={id}
                  initial={false}
                  animate={{ opacity: on ? 1 : 0 }}
                  transition={{ duration: on ? 0.22 : 0.12, ease: easeOut, delay: on ? 0.06 : 0 }}
                  className={cn("flex flex-col self-start", !on && "pointer-events-none")}
                  aria-hidden={!on}
                  inert={!on}
                >
                  {body}
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function MainRow({ label, value, onClick, cls }: { label: string; value: string; onClick: () => void; cls: string }) {
  const ic = useVideoIcons();
  return (
    <button type="button" role="menuitem" aria-haspopup="menu" className={cls} onClick={onClick}>
      <span className="flex-1">{label}</span>
      <span className="tabular text-white/60">{value}</span>
      <span className="grid text-white/50 [&>svg]:size-4" aria-hidden>{ic.next}</span>
    </button>
  );
}

function BackRow({ title, onClick, cls }: { title: string; onClick: () => void; cls: string }) {
  const ic = useVideoIcons();
  return (
    <>
      <button type="button" role="menuitem" className={cn(cls, "gap-2 font-semibold")} onClick={onClick}>
        <span className="grid [&>svg]:size-4" aria-hidden>{ic.previous}</span>
        {title}
      </button>
      <div className="mx-1.5 my-1 h-px shrink-0 bg-white/10" />
    </>
  );
}

function Tick({ on }: { on: boolean }) {
  const ic = useVideoIcons();
  return (
    <motion.span initial={false} animate={{ opacity: on ? 1 : 0, scale: on ? 1 : 0.7 }} transition={springSnappy} className="grid size-4 place-items-center [&>svg]:size-4">
      {ic.check}
    </motion.span>
  );
}
