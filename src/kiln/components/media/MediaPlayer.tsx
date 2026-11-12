import { memo, useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { motion, useMotionValue, useMotionValueEvent, useTransform } from "motion/react";
import { Volume1, Volume2, VolumeX } from "lucide-react";
import { cn } from "../../cn";
import { useControllable } from "../../controllable";
import { easeInOut, fade, springSnappy, springSoft } from "../../motion";
import { Slider } from "../choice-controls/Slider";

/** Text used by MediaPlayer. Pass a partial via `labels` to translate or reword. */
export interface MediaPlayerLabels {
  /** aria-label of the player group. */
  player: (title: string, artist: string) => string;
  /** aria-label of the seek bar. */
  seek: string;
  /** Spoken position of the seek bar. */
  position: (current: string, total: string) => string;
  /** aria-label of the speed button. */
  speed: (rate: number, nextRate: number) => string;
  /** Skip-back button. */
  back15: string;
  /** Skip-forward button. */
  forward15: string;
  /** Play button label. */
  play: string;
  /** Pause button label. */
  pause: string;
  /** Mute button label. */
  mute: string;
  /** Unmute button label. */
  unmute: string;
  /** aria-label of the volume slider. */
  volume: string;
}
export const mediaPlayerLabels: MediaPlayerLabels = {
  player: (t, a) => `Player: ${t} by ${a}`,
  seek: "Seek",
  position: (c, t) => `${c} of ${t}`,
  speed: (r, n) => `Playback speed ${r}×. Change to ${n}×`,
  back15: "Back 15 seconds",
  forward15: "Forward 15 seconds",
  play: "Play",
  pause: "Pause",
  mute: "Mute",
  unmute: "Unmute",
  volume: "Volume",
};

export type MediaPlayerProps = {
  title: string;
  artist: string;
  /** Length in seconds. The file's own length wins once it loads. */
  duration: number;
  cover?: { src: string; alt: string };
  /**
   * A real audio file (a video file works too; only its sound plays). Without
   * one the player runs a silent clock of `duration` seconds, so the controls
   * can be designed and tested without a track.
   */
  src?: string;
  /**
   * Loudness of the track from 0 to 1, evenly spaced from start to end; drawn
   * as the waveform you scrub. Work it out once (decodeAudioData, then the RMS
   * of each slice) and pass the numbers. Without it the bar is drawn flat.
   */
  peaks?: number[];
  /** Override any UI text. Merged over `mediaPlayerLabels`. */
  labels?: Partial<MediaPlayerLabels>;
  className?: string;
  /** Controlled playback. Leave out and use `defaultPlaying` to let the player keep its own. */
  playing?: boolean;
  /** Whether it starts playing when uncontrolled. Browsers may refuse autoplay, which reports `false`. */
  defaultPlaying?: boolean;
  /** Fires when playback starts or stops, including when the track ends or the browser blocks play. */
  onPlayingChange?: (playing: boolean) => void;
  /** Controlled volume from 0 to 100. */
  volume?: number;
  /** Starting volume from 0 to 100 when uncontrolled. Default 70. */
  defaultVolume?: number;
  /** Fires with the new volume (0 to 100) when the slider moves. */
  onVolumeChange?: (volume: number) => void;
  /** Controlled mute. */
  muted?: boolean;
  /** Whether it starts muted when uncontrolled. */
  defaultMuted?: boolean;
  /** Fires when mute toggles, including when the volume slider unmutes it. */
  onMutedChange?: (muted: boolean) => void;
  /**
   * Controlled position in seconds. Changing it seeks; the audio element stays the source of truth
   * while playing, so only values that differ from the last reported time cause a seek.
   */
  currentTime?: number;
  /** Starting position in seconds when uncontrolled. */
  defaultCurrentTime?: number;
  /** Fires on every seek and about once a second while playing, with the exact position in seconds. */
  onTimeChange?: (time: number) => void;
};

const fmt = (s: number) => {
  const t = Math.max(0, Math.floor(s));
  return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, "0")}`;
};

const RATES = [1, 1.25, 1.5, 2, 0.75];
const FLAT = Array.from({ length: 64 }, () => 0.22);

const PLAY = ["M7 5 L12.5 8.21 L12.5 15.79 L7 19 Z", "M12.5 8.21 L19 12 L19 12 L12.5 15.79 Z"];
const PAUSE = ["M6 5 L10 5 L10 19 L6 19 Z", "M14 5 L18 5 L18 19 L14 19 Z"];

/**
 * An audio player: the cover, what is playing, and a waveform of the track's
 * real loudness that you scrub with the pointer or the arrow keys. Back and
 * forward fifteen seconds, playback speed for spoken word, and volume. All of
 * it moves on transforms: the played part of the waveform is revealed by two
 * opposite translations, never by changing a width.
 */
export function MediaPlayer({
  title, artist, duration, cover, src, peaks, labels, className,
  playing: playingProp, defaultPlaying = false, onPlayingChange,
  volume: volumeProp, defaultVolume = 70, onVolumeChange,
  muted: mutedProp, defaultMuted = false, onMutedChange,
  currentTime, defaultCurrentTime = 0, onTimeChange,
}: MediaPlayerProps) {
  const l = { ...mediaPlayerLabels, ...labels };
  const [playing, setPlaying] = useControllable(playingProp, defaultPlaying, onPlayingChange);
  const [volume, setVolume] = useControllable(volumeProp, defaultVolume, onVolumeChange);
  const [muted, setMuted] = useControllable(mutedProp, defaultMuted, onMutedChange);
  const [rate, setRate] = useState(1);
  const [scrubbing, setScrubbing] = useState(false);
  const [hovering, setHovering] = useState(false);
  const time = useMotionValue(currentTime ?? defaultCurrentTime);
  const hoverFrac = useMotionValue(0);
  const audio = useRef<HTMLAudioElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [len, setLen] = useState(duration);
  const bars = peaks?.length ? peaks : FLAT;

  const played = useTransform(time, (t) => Math.min(1, t / len));
  // The reveal: an outer window slides in from the left while its contents slide the opposite way, so the bars stay put.
  const outerX = useTransform(played, (p) => `${(p - 1) * 100}%`);
  const innerX = useTransform(played, (p) => `${(1 - p) * 100}%`);
  const hoverOuterX = useTransform(hoverFrac, (p) => `${(p - 1) * 100}%`);
  const hoverInnerX = useTransform(hoverFrac, (p) => `${(1 - p) * 100}%`);
  const nowText = useTransform(time, fmt);
  const leftText = useTransform(time, (t) => `−${fmt(len - t)}`);
  const [second, setSecond] = useState(() => Math.floor(time.get()));
  const onTimeRef = useRef(onTimeChange);
  onTimeRef.current = onTimeChange;
  // The last position we reported, so a parent echoing it back is not mistaken for a seek.
  const reported = useRef(time.get());
  const lastSecond = useRef(Math.floor(time.get()));
  const report = (t: number) => {
    reported.current = t;
    onTimeRef.current?.(t);
  };
  useMotionValueEvent(time, "change", (t) => {
    const s = Math.floor(t);
    setSecond((v) => (v === s ? v : s));
  });

  // The clock runs only while playing or scrubbing, so an idle player costs nothing per frame.
  useEffect(() => {
    if (!playing && !scrubbing) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const delta = now - last;
      last = now;
      const a = audio.current;
      if (a && src) {
        if (!scrubbing) {
          time.set(a.currentTime);
          const sec = Math.floor(a.currentTime);
          if (sec !== lastSecond.current) {
            lastSecond.current = sec;
            report(a.currentTime);
          }
        }
      } else if (playing && !scrubbing) {
        const next = time.get() + (delta / 1000) * rate;
        if (next >= len) {
          time.set(len);
          report(len);
          setPlaying(false);
        } else {
          time.set(next);
          if (Math.floor(next) !== lastSecond.current) {
            lastSecond.current = Math.floor(next);
            report(next);
          }
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, scrubbing, src, len, rate, time, setPlaying]);

  useEffect(() => {
    const a = audio.current;
    if (!a || !src) return;
    if (playing) a.play().catch((err) => { if (err?.name !== "AbortError") setPlaying(false); });
    else a.pause();
  }, [playing, src, setPlaying]);
  useEffect(() => {
    if (audio.current) audio.current.volume = muted ? 0 : volume / 100;
  }, [volume, muted]);
  useEffect(() => {
    if (audio.current) audio.current.playbackRate = rate;
  }, [rate]);

  const jump = (t: number) => {
    const v = Math.max(0, Math.min(len, t));
    time.set(v);
    lastSecond.current = Math.floor(v);
    if (audio.current && src) audio.current.currentTime = v;
    return v;
  };
  const seek = (t: number) => report(jump(t));
  useEffect(() => {
    if (currentTime === undefined || currentTime === reported.current) return;
    reported.current = currentTime;
    jump(currentTime);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTime]);
  const toggle = () => {
    if (!playing && time.get() >= len - 0.05) seek(0);
    setPlaying((p) => !p);
  };

  const frac = (e: PointerEvent) => {
    const r = track.current!.getBoundingClientRect();
    return Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
  };

  const onKey = (e: KeyboardEvent) => {
    const step = { ArrowRight: 5, ArrowLeft: -5, ArrowUp: 5, ArrowDown: -5, PageUp: 30, PageDown: -30 }[e.key];
    if (step != null) {
      e.preventDefault();
      seek(time.get() + step);
    } else if (e.key === "Home") { e.preventDefault(); seek(0); }
    else if (e.key === "End") { e.preventDefault(); seek(len); }
    else if (e.key === " " || e.key === "k") { e.preventDefault(); toggle(); }
  };

  const vol = muted ? 0 : volume;
  const nextRate = RATES[(RATES.indexOf(rate) + 1) % RATES.length];


  return (
    <div
      className={cn("w-full min-w-0 rounded-[20px] border border-line bg-surface p-4 sm:p-5", className)}
      role="group"
      aria-label={l.player(title, artist)}
    >
      {src && (
        <audio
          ref={audio}
          src={src}
          preload="metadata"
          onLoadedMetadata={(e) => {
            setLen(e.currentTarget.duration || duration);
            if (time.get() > 0) e.currentTarget.currentTime = time.get();
          }}
          onEnded={() => setPlaying(false)}
        />
      )}

      <div className="flex items-center gap-4">
        {cover && (
          <div className="relative size-[76px] shrink-0 sm:size-[96px]">
            <motion.img
              decoding="async"
              src={cover.src}
              alt={cover.alt}
              width={192}
              height={192}
              className="size-full rounded-[12px] bg-raised object-cover"
              initial={false}
              animate={{ scale: playing ? 1 : 0.94 }}
              transition={springSoft}
            />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-[17px] font-semibold leading-6 text-ink">{title}</p>
              <p className="truncate text-sm text-muted">{artist}</p>
            </div>
            <Equalizer playing={playing} />
          </div>
        </div>
      </div>

      <div
        ref={track}
        role="slider"
        tabIndex={0}
        aria-label={l.seek}
        aria-valuemin={0}
        aria-valuemax={Math.round(len)}
        aria-valuenow={second}
        aria-valuetext={l.position(fmt(second), fmt(len))}
        onKeyDown={onKey}
        onPointerEnter={(e) => {
          if (e.pointerType === "mouse") setHovering(true);
          hoverFrac.set(frac(e));
        }}
        onPointerLeave={() => setHovering(false)}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          setScrubbing(true);
          seek(frac(e) * len);
        }}
        onPointerMove={(e) => {
          const f = frac(e);
          hoverFrac.set(f);
          if (scrubbing) seek(f * len);
        }}
        onPointerUp={(e) => {
          e.currentTarget.releasePointerCapture(e.pointerId);
          setScrubbing(false);
        }}
        onPointerCancel={() => setScrubbing(false)}
        className="relative mt-4 h-11 cursor-pointer touch-none rounded-[6px] outline-none focus-visible:ring-2 focus-visible:ring-focus-edge focus-visible:ring-offset-4 focus-visible:ring-offset-surface"
      >
        <Bars bars={bars} tone="bg-active" />
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 overflow-hidden"
          style={{ x: hoverOuterX }}
          initial={false}
          animate={{ opacity: hovering && !scrubbing ? 1 : 0 }}
          transition={fade}
        >
          <motion.div className="size-full" style={{ x: hoverInnerX }}>
            <Bars bars={bars} tone="bg-line-strong" />
          </motion.div>
        </motion.div>
        <motion.div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden" style={{ x: outerX }}>
          <motion.div className="size-full" style={{ x: innerX }}>
            <Bars bars={bars} tone="bg-accent" />
          </motion.div>
        </motion.div>
      </div>
      <div className="mt-1.5 flex justify-between text-xs text-muted tabular" aria-hidden>
        <motion.span>{nowText}</motion.span>
        <motion.span>{leftText}</motion.span>
      </div>

      <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <div className="flex">
          <motion.button
            type="button"
            onClick={() => setRate(nextRate)}
            aria-label={l.speed(rate, nextRate)}
            whileTap={{ scale: 0.94 }}
            transition={springSnappy}
            className="h-8 min-w-12 rounded-full bg-raised px-2.5 text-[13px] font-semibold tabular text-ink transition-colors duration-200 hover:bg-active"
          >
            {rate}×
          </motion.button>
        </div>

        <div className="flex items-center gap-2">
          <RoundBtn label={l.back15} onClick={() => seek(time.get() - 15)}>
            <SkipGlyph dir={-1} />
          </RoundBtn>
          <motion.button
            type="button"
            onClick={toggle}
            aria-label={playing ? l.pause : l.play}
            whileTap={{ scale: 0.92 }}
            transition={springSnappy}
            className="grid size-14 place-items-center rounded-full bg-btn-primary text-btn-primary-ink transition-colors duration-200 hover:bg-btn-primary-hover"
          >
            <svg viewBox="0 0 24 24" className="size-6" aria-hidden>
              {[0, 1].map((k) => (
                <motion.path key={k} fill="currentColor" initial={false} animate={{ d: playing ? PAUSE[k] : PLAY[k] }} transition={springSnappy} />
              ))}
            </svg>
          </motion.button>
          <RoundBtn label={l.forward15} onClick={() => seek(time.get() + 15)}>
            <SkipGlyph dir={1} />
          </RoundBtn>
        </div>

        <div className="flex min-w-0 items-center justify-end gap-1.5">
          <RoundBtn label={muted ? l.unmute : l.mute} onClick={() => setMuted((m) => !m)}>
            <span className="grid size-[18px] [&>*]:[grid-area:1/1]">
              {[
                { on: vol === 0, el: <VolumeX className="size-[18px]" /> },
                { on: vol > 0 && vol < 50, el: <Volume1 className="size-[18px]" /> },
                { on: vol >= 50, el: <Volume2 className="size-[18px]" /> },
              ].map((v, i) => (
                <motion.span key={i} className="grid" initial={false} animate={{ opacity: v.on ? 1 : 0 }} transition={fade}>
                  {v.el}
                </motion.span>
              ))}
            </span>
          </RoundBtn>
          <Slider
            className="hidden w-20 sm:block"
            ariaLabel={l.volume}
            value={[vol]}
            onChange={([v]) => {
              setVolume(v);
              if (v > 0) setMuted(false);
            }}
          />
        </div>
      </div>
    </div>
  );
}

/* Drawn once per track: the clock never re-renders the bars, it only moves the windows over them. */
const Bars = memo(function Bars({ bars, tone }: { bars: number[]; tone: string }) {
  return (
    <span className="flex h-full w-full items-center gap-[2px]">
      {bars.map((p, i) => (
        <span key={i} className={cn("min-w-0 flex-1 rounded-full", tone)} style={{ height: `${Math.max(0.1, Math.min(1, p)) * 100}%` }} />
      ))}
    </span>
  );
});

/** Three bars that dance while it plays and settle low when it stops. */
function Equalizer({ playing }: { playing: boolean }) {
  return (
    <span aria-hidden className="mt-1.5 flex h-4 shrink-0 items-end gap-[3px]">
      {[0.7, 0.95, 0.8].map((d, i) => (
        <motion.span
          key={i}
          className="h-full w-[3px] origin-bottom rounded-full bg-accent"
          initial={false}
          animate={playing ? { scaleY: [0.3, 1, 0.45, 0.85, 0.3] } : { scaleY: 0.25 }}
          transition={playing ? { duration: d * 1.1, repeat: Infinity, ease: easeInOut, delay: i * 0.12 } : springSoft}
        />
      ))}
    </span>
  );
}

function SkipGlyph({ dir }: { dir: -1 | 1 }) {
  return (
    <svg viewBox="0 0 24 24" className="size-[22px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <g transform={dir < 0 ? "" : "translate(24 0) scale(-1 1)"}>
        <path d="M4 12a8 8 0 1 0 2.6-5.9" />
        <path d="M4 3.5v4.5h4.5" />
      </g>
      <text x="12" y="15.4" textAnchor="middle" fontSize="7.5" fontWeight="700" fill="currentColor" stroke="none" fontFamily="IBM Plex Sans, sans-serif">15</text>
    </svg>
  );
}

function RoundBtn({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <motion.button
      type="button"
      aria-label={label}
      onClick={onClick}
      whileTap={{ scale: 0.9 }}
      transition={springSnappy}
      className="grid size-10 place-items-center rounded-full text-muted transition-colors duration-200 hover:bg-raised hover:text-ink"
    >
      {children}
    </motion.button>
  );
}
