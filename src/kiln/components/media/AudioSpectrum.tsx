import { forwardRef, useEffect, useRef, type HTMLAttributes, type RefObject } from "react";
import { motion } from "motion/react";
import { Pause, Play } from "lucide-react";
import { cn } from "../../cn";
import { fade, press, springSnappy } from "../../motion";
import { useControllable, type Size } from "../../controllable";
import { useA11yProps, type AccessibilityFeaturesProp } from "../../a11y";

/** Text used by AudioSpectrum. Pass a partial via `labels` to translate or reword. */
export interface AudioSpectrumLabels {
  /** Name of the play button while paused. */
  play: string;
  /** Name of the play button while playing. */
  pause: string;
  /** Name of the meter picture, read by screen readers. */
  meter: string;
}
export const audioSpectrumLabels: AudioSpectrumLabels = { play: "Play", pause: "Pause", meter: "Live spectrum of the sound" };

export type AudioSpectrumProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  /** An audio file (a URL, or a `blob:` URL from a file picker). The component plays it itself and shows a play button. */
  src?: string;
  /** An `<audio>` or `<video>` somebody else plays. The sound keeps playing as before. */
  media?: RefObject<HTMLMediaElement | null>;
  /** A live `MediaStream`, such as the microphone. It is only measured, never played back (that would echo). */
  stream?: MediaStream | null;
  /** Whether `src` is playing. Leave out to let it keep its own. */
  playing?: boolean;
  defaultPlaying?: boolean;
  onPlayingChange?: (playing: boolean) => void;
  /** How many bars. Default 32. */
  bars?: number;
  /** `bars` grow up from the floor; `mirrored` grows both ways from the middle. Default bars. */
  variant?: "bars" | "mirrored";
  /** Height of the meter. Default md. */
  size?: Size;
  /** Show a thin cap that holds the recent peak of each bar, then falls. Default true. */
  showPeaks?: boolean;
  /** Analyser `smoothingTimeConstant`, 0 to 1. Default 0.7. */
  smoothing?: number;
  /** Analyser `fftSize`, a power of two from 32 to 32768. Default 2048. */
  fftSize?: number;
  /** `crossOrigin` of the hidden `<audio>` made for `src`. Default "anonymous", which a cross-origin file must allow with CORS headers or the bars stay flat. */
  crossOrigin?: "anonymous" | "use-credentials";
  /** Override any UI text. Merged over `audioSpectrumLabels`. */
  labels?: Partial<AudioSpectrumLabels>;
  /**
   * Hide the meter from screen readers (the play button stays). Use it when the meter sits beside a player
   * or mic control that already says what is happening, so it isn't read out as an extra picture. Default false.
   */
  decorative?: boolean;
  /** Accessibility features to add for this meter only (`calm`, `reduceMotion` and `noFlashing` swap the moving bars for one still level bar; `highContrast` makes the peak caps solid). Adds to the person's own settings, never removes them. */
  accessibilityFeatures?: AccessibilityFeaturesProp;
};

const MIN = 0.04;
const LOW = 40;
const HIGH = 16000;
const RISE = 0.55;
const FALL = 0.15;
const HOLD_MS = 450;
const heights: Record<Size, string> = { sm: "h-12", md: "h-20", lg: "h-32" };
const buttonSizes: Record<Size, string> = { sm: "size-8 [&>span>svg]:size-4", md: "size-10 [&>span>svg]:size-[18px]", lg: "size-12 [&>span>svg]:size-5" };
const CAP = 2;

type Ctor = typeof AudioContext;
const audioContextCtor = (): Ctor | undefined => (typeof window === "undefined" ? undefined : window.AudioContext ?? (window as unknown as { webkitAudioContext?: Ctor }).webkitAudioContext);

/** `createMediaElementSource` works once per element, so each element keeps its context and source here for good. */
const elementGraphs = new WeakMap<HTMLMediaElement, { ctx: AudioContext; source: MediaElementAudioSourceNode }>();
function graphFor(el: HTMLMediaElement) {
  let g = elementGraphs.get(el);
  if (!g) {
    const Ctx = audioContextCtor();
    if (!Ctx) return null;
    const ctx = new Ctx();
    const source = ctx.createMediaElementSource(el);
    // The element's own sound goes straight to the speakers; the analyser only listens in.
    source.connect(ctx.destination);
    g = { ctx, source };
    elementGraphs.set(el, g);
  }
  return g;
}

/**
 * A live frequency meter. The bars are the real spectrum of the sound (an `AnalyserNode`, read every frame),
 * so with silence they sit flat. Give it a file (`src`), a media element you control (`media`) or the
 * microphone (`stream`). Each bar is only a transform written straight to the DOM, so nothing re-renders while it plays.
 */
export const AudioSpectrum = forwardRef<HTMLDivElement, AudioSpectrumProps>(function AudioSpectrum(
  {
    src, media, stream, playing: playingProp, defaultPlaying = false, onPlayingChange, bars = 32, variant = "bars", size = "md", showPeaks = true,
    smoothing = 0.7, fftSize = 2048, crossOrigin = "anonymous", labels, decorative = false, accessibilityFeatures, className, style, ...rest
  },
  ref,
) {
  const l = { ...audioSpectrumLabels, ...labels };
  const { a11y, rootProps } = useA11yProps(accessibilityFeatures);
  // Bars that change many times a second count as motion and, for some people, as flicker: all three get the still level.
  const calm = a11y.calm || a11y.reduceMotion || a11y.noFlashing;
  const meterA11y = decorative ? { "aria-hidden": true } : { role: "img", "aria-label": l.meter };
  const capTone = a11y.highContrast ? "bg-ink" : "bg-ink/60";
  const [playing, setPlaying] = useControllable(playingProp, defaultPlaying, onPlayingChange);
  const own = !stream && src !== undefined;
  const audioRef = useRef<HTMLAudioElement>(null);
  const meterRef = useRef<HTMLDivElement>(null);
  const barEls = useRef<(HTMLSpanElement | null)[]>([]);
  const capEls = useRef<(HTMLSpanElement | null)[]>([]);
  const capEls2 = useRef<(HTMLSpanElement | null)[]>([]);
  const levelEl = useRef<HTMLSpanElement>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const mirrored = variant === "mirrored";

  // Keep the hidden audio element in step with `playing`. A new file always starts paused.
  useEffect(() => {
    const el = audioRef.current;
    if (!own || !el) return;
    if (playing) {
      void ctxRef.current?.resume();
      el.play().catch(() => setPlaying(false));
    } else el.pause();
  }, [own, playing, setPlaying]);
  const firstSrc = useRef(true);
  useEffect(() => {
    if (firstSrc.current) {
      firstSrc.current = false;
      return;
    }
    setPlaying(false);
  }, [src, setPlaying]);

  useEffect(() => {
    const el = stream ? null : own ? audioRef.current : media?.current ?? null;
    if (!stream && !el) return;
    const bandCount = bars;
    const barNodes = barEls.current;
    const capNodes = capEls.current;
    const capNodes2 = capEls2.current;
    const levelNode = levelEl.current;
    const eased = Array.from({ length: bandCount }, () => MIN);
    const caps = Array.from({ length: bandCount }, () => MIN);
    const holdUntil = Array.from({ length: bandCount }, () => 0);
    let height = meterRef.current?.clientHeight ?? 0;
    const ro = typeof ResizeObserver === "undefined" || !meterRef.current ? null : new ResizeObserver(() => (height = meterRef.current?.clientHeight ?? 0));
    if (ro && meterRef.current) ro.observe(meterRef.current);

    let analyser: AnalyserNode | null = null;
    let data = new Uint8Array(0);
    let ranges: [number, number][] = [];
    let ctx: AudioContext | null = null;
    let teardownGraph = () => {};
    let raf = 0;
    let timer = 0;
    let last = 0;
    let disposed = false;

    const connect = (c: AudioContext, input: AudioNode) => {
      const a = c.createAnalyser();
      a.fftSize = fftSize;
      a.smoothingTimeConstant = smoothing;
      input.connect(a);
      analyser = a;
      ctx = c;
      ctxRef.current = c;
      data = new Uint8Array(a.frequencyBinCount);
      // Bars are spaced by octave, so the bass does not take half of them.
      const binHz = c.sampleRate / a.fftSize;
      ranges = Array.from({ length: bandCount }, (_, i) => {
        const f0 = LOW * Math.pow(HIGH / LOW, i / bandCount);
        const f1 = LOW * Math.pow(HIGH / LOW, (i + 1) / bandCount);
        const from = Math.min(data.length - 1, Math.floor(f0 / binHz));
        return [from, Math.min(data.length, Math.max(from + 1, Math.ceil(f1 / binHz)))];
      });
      teardownGraph = () => {
        try { input.disconnect(a); } catch { /* already gone */ }
      };
    };

    const ensure = () => {
      if (analyser || disposed) return;
      try {
        if (stream) {
          const Ctx = audioContextCtor();
          if (!Ctx) return;
          const c = new Ctx();
          const input = c.createMediaStreamSource(stream);
          connect(c, input);
          // The microphone is measured only. Connecting it to the speakers would feed back.
          const closeCtx = teardownGraph;
          teardownGraph = () => {
            closeCtx();
            void c.close().catch(() => {});
          };
        } else if (el) {
          const g = graphFor(el);
          if (g) connect(g.ctx, g.source);
        }
      } catch {
        /* no Web Audio, or the element is already wired elsewhere: the bars just stay flat */
      }
    };
    const resume = () => void ctx?.resume().catch(() => {});

    const level = () => {
      if (!analyser) return 0;
      analyser.getByteFrequencyData(data);
      let sum = 0;
      for (let k = 0; k < data.length; k++) sum += data[k];
      return sum / (data.length * 255);
    };
    const active = () => (stream ? true : !!el && !el.paused && !el.ended);

    const write = (now: number) => {
      const live = !!analyser && active();
      if (live) analyser!.getByteFrequencyData(data);
      let moving = false;
      for (let i = 0; i < bandCount; i++) {
        let target = MIN;
        if (live) {
          const [from, to] = ranges[i];
          let peak = 0;
          for (let k = from; k < to; k++) if (data[k] > peak) peak = data[k];
          // Highs carry less energy than lows; a gentle tilt keeps the right of the meter readable.
          target = Math.max(MIN, Math.min(1, (peak / 255) * (1.05 + 0.3 * (i / bandCount))));
        }
        eased[i] += (target - eased[i]) * (target > eased[i] ? RISE : FALL);
        if (Math.abs(target - eased[i]) < 0.002) eased[i] = target;
        if (eased[i] >= caps[i]) {
          caps[i] = eased[i];
          holdUntil[i] = now + HOLD_MS;
        } else if (now > holdUntil[i]) caps[i] = Math.max(eased[i], caps[i] - 0.012 * ((now - last) / 16.7 || 1));
        if (eased[i] > MIN || caps[i] > eased[i] + 0.002) moving = true;
        const bar = barNodes[i];
        if (bar) bar.style.transform = `scaleY(${eased[i].toFixed(3)})`;
        const c1 = capEls.current[i];
        if (c1) {
          const y = mirrored ? (caps[i] * height) / 2 : Math.max(0, caps[i] * height - CAP);
          c1.style.transform = `translateY(${(-y).toFixed(1)}px)`;
        }
        const c2 = capEls2.current[i];
        if (c2) c2.style.transform = `translateY(${Math.max(0, (caps[i] * height) / 2 - CAP).toFixed(1)}px)`;
      }
      last = now;
      return live || moving;
    };

    const loop = (now: number) => {
      raf = 0;
      if (write(now)) raf = requestAnimationFrame(loop);
    };
    const start = () => {
      if (calm || raf || disposed) return;
      raf = requestAnimationFrame(loop);
    };
    const onPlay = () => {
      ensure();
      resume();
      start();
    };

    if (calm) {
      // One still level, a few times a second: no per-frame motion at all.
      const tick = () => {
        const v = active() ? Math.min(1, level() * 3) : 0;
        if (levelEl.current) levelEl.current.style.transform = `scaleX(${Math.max(MIN, v).toFixed(3)})`;
      };
      timer = window.setInterval(tick, 250);
    }

    if (stream) onPlay();
    else if (el) {
      el.addEventListener("play", onPlay);
      el.addEventListener("playing", onPlay);
      if (!el.paused) onPlay();
    }

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      window.clearInterval(timer);
      ro?.disconnect();
      el?.removeEventListener("play", onPlay);
      el?.removeEventListener("playing", onPlay);
      teardownGraph();
      if (ctxRef.current === ctx) ctxRef.current = null;
      barNodes.forEach((b) => b && (b.style.transform = `scaleY(${MIN})`));
      capNodes.forEach((c) => c && (c.style.transform = "translateY(0)"));
      capNodes2.forEach((c) => c && (c.style.transform = "translateY(0)"));
      if (levelNode) levelNode.style.transform = `scaleX(${MIN})`;
      // The file's own element goes away with the component, and so does its context. An element somebody else owns keeps its (cached) one.
      if (own && el) {
        window.setTimeout(() => {
          if (el.isConnected) return;
          const g = elementGraphs.get(el);
          if (g) void g.ctx.close().catch(() => {});
          elementGraphs.delete(el);
        }, 0);
      }
    };
  }, [stream, media, own, bars, fftSize, smoothing, calm, mirrored]);

  const barStyle = { transform: `scaleY(${MIN})` };
  return (
    <div ref={ref} {...rest} {...rootProps} className={cn("flex min-w-0 items-center gap-3", className)} style={{ ...rootProps.style, ...style }}>
      {own && (
        <>
          <audio
            ref={audioRef}
            src={src}
            crossOrigin={crossOrigin}
            preload="auto"
            onEnded={() => setPlaying(false)}
            onError={() => setPlaying(false)}
          />
          <motion.button
            type="button"
            aria-label={playing ? l.pause : l.play}
            whileTap={press}
            transition={springSnappy}
            onClick={() => {
              void ctxRef.current?.resume();
              setPlaying(!playing);
            }}
            className={cn(
              "relative inline-grid shrink-0 place-items-center rounded-full bg-btn-primary text-btn-primary-ink transition-[background-color] duration-200 ease-out-soft hover:bg-btn-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent [&>*]:[grid-area:1/1]",
              buttonSizes[size],
            )}
          >
            <motion.span aria-hidden initial={false} animate={{ opacity: playing ? 0 : 1 }} transition={fade} className="grid place-items-center"><Play className="fill-current" /></motion.span>
            <motion.span aria-hidden initial={false} animate={{ opacity: playing ? 1 : 0 }} transition={fade} className="grid place-items-center"><Pause className="fill-current" /></motion.span>
          </motion.button>
        </>
      )}

      {calm ? (
        <div {...meterA11y} className={cn("flex min-w-0 flex-1 items-center", heights[size])}>
          <div className="h-2 w-full overflow-hidden rounded-full bg-raised">
            <span ref={levelEl} className="block h-full w-full origin-left rounded-full bg-accent" style={{ transform: `scaleX(${MIN})` }} />
          </div>
        </div>
      ) : (
        <div ref={meterRef} {...meterA11y} className={cn("flex min-w-0 flex-1 items-center gap-[2px] sm:gap-[3px]", heights[size])}>
          {Array.from({ length: bars }, (_, i) => (
            <span key={i} className="relative h-full min-w-0 flex-1 overflow-visible">
              <span
                ref={(el) => {
                  barEls.current[i] = el;
                }}
                className={cn("absolute inset-0 rounded-[2px] bg-accent", mirrored ? "origin-center" : "origin-bottom")}
                style={barStyle}
              />
              {showPeaks && (
                <span
                  ref={(el) => {
                    capEls.current[i] = el;
                  }}
                  className={cn("absolute inset-x-0 h-[2px] rounded-full", capTone, mirrored ? "top-1/2" : "bottom-0")}
                  style={{ transform: "translateY(0)" }}
                />
              )}
              {showPeaks && mirrored && (
                <span
                  ref={(el) => {
                    capEls2.current[i] = el;
                  }}
                  className={cn("absolute inset-x-0 top-1/2 h-[2px] rounded-full", capTone)}
                  style={{ transform: "translateY(0)" }}
                />
              )}
            </span>
          ))}
        </div>
      )}
    </div>
  );
});
