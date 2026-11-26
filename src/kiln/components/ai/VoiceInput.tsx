import { forwardRef, useEffect, useMemo, useRef, useState, type HTMLAttributes, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Mic, MicOff } from "lucide-react";
import { cn } from "../../cn";
import { fade, press, springSnappy } from "../../motion";
import { useControllable, type Size } from "../../controllable";
import { useA11yProps, type AccessibilityFeaturesProp } from "../../a11y";
import { announce } from "../accessibility/announce";

export type VoiceStatus = "idle" | "starting" | "listening" | "denied" | "unsupported" | "error";

/** Text used by VoiceInput. Pass a partial via `labels` to translate or reword. */
export interface VoiceInputLabels {
  /** Name of the mic button (it keeps one name; `aria-pressed` carries the state). */
  button: string;
  /** Under the button while idle. */
  idle: string;
  /** While asking for the microphone. */
  starting: string;
  /** While listening and no words have come yet. */
  listening: string;
  /** When the person blocked the microphone. */
  denied: string;
  /** When the browser has no microphone to offer. */
  unsupported: string;
  /** When the microphone failed for another reason. */
  error: string;
  /** Spoken when listening starts. */
  started: string;
  /** Spoken when it stops. */
  stopped: string;
}
export const voiceInputLabels: VoiceInputLabels = {
  button: "Voice input",
  idle: "Tap to talk",
  starting: "Waiting for the microphone…",
  listening: "Listening…",
  denied: "The microphone is blocked. Allow it in your browser's site settings, or type instead.",
  unsupported: "This browser cannot use a microphone. Type instead.",
  error: "The microphone stopped working. Try again, or type instead.",
  started: "Listening",
  stopped: "Stopped listening",
};

/** Icons used by VoiceInput. Pass a partial via `icons` to swap any of them. */
export interface VoiceInputIcons {
  /** The mic. */
  mic: ReactNode;
  /** The mic while blocked or missing. */
  micOff: ReactNode;
}
export const voiceInputIcons: VoiceInputIcons = { mic: <Mic />, micOff: <MicOff /> };

export type VoiceInputProps = Omit<HTMLAttributes<HTMLDivElement>, "children" | "onError"> & {
  /** Whether the microphone is on. Leave out to let it keep its own. */
  listening?: boolean;
  defaultListening?: boolean;
  onListeningChange?: (listening: boolean) => void;
  /** The recording as a Blob when listening stops. Recording only starts when this is given. */
  onAudio?: (audio: Blob) => void;
  /** Words as they are recognised, where the browser has SpeechRecognition. `final` is false for a guess still changing. */
  onTranscript?: (text: string, final: boolean) => void;
  /** The microphone could not start (blocked, missing or failed). The input stays usable. */
  onError?: (status: "denied" | "unsupported" | "error") => void;
  /** BCP 47 language for recognition. Default the page language. */
  lang?: string;
  /** How many level bars to draw. Default 18. */
  bars?: number;
  /** Button size. Default md. */
  size?: Size;
  /** Show the status line under the button. Default true. */
  showStatus?: boolean;
  disabled?: boolean;
  /** Override any UI text. Merged over `voiceInputLabels`. */
  labels?: Partial<VoiceInputLabels>;
  /** Replace any built-in icon. Merged over `voiceInputIcons`. */
  icons?: Partial<VoiceInputIcons>;
  /** Accessibility features to add for this input only (`calm` shows one still level instead of moving bars). Adds to the person's own settings, never removes them. */
  accessibilityFeatures?: AccessibilityFeaturesProp;
};

type RecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((e: { resultIndex: number; results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }> }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
};
type RecognitionCtor = new () => RecognitionLike;

const buttonSizes: Record<Size, string> = { sm: "size-8 [&>span>svg]:size-4", md: "size-10 [&>span>svg]:size-[18px]", lg: "size-12 [&>span>svg]:size-5" };
const MIN = 0.14;

/**
 * A mic button with a live level meter. The bars are driven by motion values, so no React state
 * changes while it listens. It copes with a blocked or missing microphone by saying so and
 * leaving the rest of your form alone, and it hands you the recording and, where the browser can, the words.
 */
export const VoiceInput = forwardRef<HTMLDivElement, VoiceInputProps>(function VoiceInput(
  {
    listening: listeningProp, defaultListening = false, onListeningChange, onAudio, onTranscript, onError, lang, bars = 18, size = "md", showStatus = true,
    disabled, labels, icons, accessibilityFeatures, className, style, ...rest
  },
  ref,
) {
  const l = { ...voiceInputLabels, ...labels };
  const ic = useMemo(() => ({ ...voiceInputIcons, ...icons }), [icons]);
  const { a11y, rootProps } = useA11yProps(accessibilityFeatures);
  const [listening, setListening] = useControllable(listeningProp, defaultListening, onListeningChange);
  const [status, setStatus] = useState<VoiceStatus>("idle");
  const [heard, setHeard] = useState("");
  // The bars are written straight to the DOM each frame (a transform, nothing else): no React state, no layout.
  const barEls = useRef<(HTMLSpanElement | null)[]>([]);
  const calm = a11y.calm;
  const latest = useRef({ onAudio, onTranscript, onError, setListening, lang });
  useEffect(() => {
    latest.current = { onAudio, onTranscript, onError, setListening, lang };
  });

  useEffect(() => {
    if (!listening) {
      setStatus((s) => (s === "denied" || s === "unsupported" || s === "error" ? s : "idle"));
      return;
    }
    const media = typeof navigator === "undefined" ? undefined : navigator.mediaDevices;
    if (!media || typeof media.getUserMedia !== "function") {
      setStatus("unsupported");
      latest.current.onError?.("unsupported");
      latest.current.setListening(false);
      return;
    }
    let cancelled = false;
    let stream: MediaStream | null = null;
    let ctx: AudioContext | null = null;
    let raf = 0;
    let recorder: MediaRecorder | null = null;
    let recognition: RecognitionLike | null = null;
    const chunks: Blob[] = [];
    const barNodes = barEls.current;
    setStatus("starting");
    setHeard("");

    media
      .getUserMedia({ audio: true })
      .then((s) => {
        if (cancelled) {
          s.getTracks().forEach((t) => t.stop());
          return;
        }
        stream = s;
        setStatus("listening");
        announce(l.started);
        const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (Ctx && !calm) {
          ctx = new Ctx();
          const src = ctx.createMediaStreamSource(s);
          const analyser = ctx.createAnalyser();
          analyser.fftSize = 128;
          analyser.smoothingTimeConstant = 0.6;
          src.connect(analyser);
          const data = new Uint8Array(analyser.frequencyBinCount);
          const usable = Math.floor(data.length * 0.7);
          const eased = Array.from({ length: bars }, () => MIN);
          const frame = () => {
            analyser.getByteFrequencyData(data);
            for (let i = 0; i < bars; i++) {
              // Each bar reads a slice of the lower speech bands; ease up quickly and down slowly.
              const from = Math.floor((i / bars) * usable);
              const to = Math.max(from + 1, Math.floor(((i + 1) / bars) * usable));
              let peak = 0;
              for (let k = from; k < to; k++) if (data[k] > peak) peak = data[k];
              const target = Math.max(MIN, Math.min(1, (peak / 255) * 1.15));
              eased[i] += (target - eased[i]) * (target > eased[i] ? 0.55 : 0.18);
              const el = barEls.current[i];
              if (el) el.style.transform = `scaleY(${eased[i].toFixed(3)})`;
            }
            raf = requestAnimationFrame(frame);
          };
          raf = requestAnimationFrame(frame);
        }
        if (latest.current.onAudio && typeof MediaRecorder !== "undefined") {
          try {
            recorder = new MediaRecorder(s);
            recorder.ondataavailable = (e) => e.data.size && chunks.push(e.data);
            recorder.onstop = () => latest.current.onAudio?.(new Blob(chunks, { type: recorder?.mimeType || "audio/webm" }));
            recorder.start();
          } catch {
            recorder = null;
          }
        }
        const SR = (window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor });
        const Rec = SR.SpeechRecognition ?? SR.webkitSpeechRecognition;
        if (Rec && latest.current.onTranscript) {
          try {
            recognition = new Rec();
            recognition.lang = latest.current.lang ?? document.documentElement.lang ?? "en-US";
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.onresult = (e) => {
              let text = "";
              let final = true;
              for (let i = e.resultIndex; i < e.results.length; i++) {
                text += e.results[i][0].transcript;
                if (!e.results[i].isFinal) final = false;
              }
              setHeard(text.trim());
              latest.current.onTranscript?.(text.trim(), final);
            };
            // A refused recognition service must not end the recording that is already running.
            recognition.onerror = () => {};
            recognition.start();
          } catch {
            recognition = null;
          }
        }
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const name = (err as { name?: string } | null)?.name;
        const kind = name === "NotAllowedError" || name === "SecurityError" ? "denied" : name === "NotFoundError" || name === "NotSupportedError" ? "unsupported" : "error";
        setStatus(kind);
        latest.current.onError?.(kind);
        latest.current.setListening(false);
      });

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      try { recognition?.stop(); } catch { /* already stopped */ }
      if (recorder && recorder.state !== "inactive") recorder.stop();
      stream?.getTracks().forEach((t) => t.stop());
      void ctx?.close().catch(() => {});
      barNodes.forEach((el) => el && (el.style.transform = `scaleY(${MIN})`));
      if (stream) announce(l.stopped);
    };
    // The labels only feed announcements, so a new label object must not restart the microphone.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listening, calm, bars]);

  const blocked = status === "denied" || status === "unsupported" || status === "error";
  const text =
    status === "denied" ? l.denied
    : status === "unsupported" ? l.unsupported
    : status === "error" ? l.error
    : status === "starting" ? l.starting
    : status === "listening" ? heard || l.listening
    : l.idle;
  const live = listening && status === "listening";

  return (
    <div ref={ref} {...rest} {...rootProps} className={cn("flex min-w-0 flex-col gap-2", className)} style={{ ...rootProps.style, ...style }}>
      <div className="flex items-center gap-3">
        <motion.button
          type="button"
          aria-label={l.button}
          aria-pressed={listening}
          disabled={disabled}
          whileTap={disabled ? undefined : press}
          transition={springSnappy}
          onClick={() => {
            if (blocked) setStatus("idle");
            setListening(!listening);
          }}
          className={cn(
            "relative inline-grid shrink-0 place-items-center rounded-full transition-[background-color,color] duration-200 ease-out-soft disabled:opacity-50 [&>*]:[grid-area:1/1]",
            listening ? "bg-btn-primary text-btn-primary-ink hover:bg-btn-primary-hover" : "border border-line-strong text-ink hover:bg-raised",
            buttonSizes[size],
          )}
        >
          <motion.span aria-hidden initial={false} animate={{ opacity: blocked ? 0 : 1 }} transition={fade} className="grid place-items-center">{ic.mic}</motion.span>
          <motion.span aria-hidden initial={false} animate={{ opacity: blocked ? 1 : 0 }} transition={fade} className="grid place-items-center">{ic.micOff}</motion.span>
        </motion.button>

        {/* The meter holds its room whether or not it is listening, so nothing shifts when it starts. */}
        <div aria-hidden className="flex h-8 items-center gap-[3px]" style={{ width: bars * 7 - 3 }}>
          {Array.from({ length: bars }, (_, i) => (
            <span
              key={i}
              ref={(el) => {
                barEls.current[i] = el;
              }}
              className="h-full w-1 origin-center rounded-full bg-accent transition-opacity duration-200 ease-out-soft"
              style={{ opacity: live ? 1 : 0.25, transform: `scaleY(${calm && live ? 0.55 : MIN})` }}
            />
          ))}
        </div>
      </div>

      {showStatus && (
        <div className="grid min-h-5 [&>*]:[grid-area:1/1]">
          <AnimatePresence initial={false}>
            <motion.p
              key={status === "listening" && heard ? "heard" : status}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={fade}
              role={blocked ? "alert" : undefined}
              className={cn("text-[0.8125rem] leading-5", blocked ? "text-negative" : "text-muted")}
            >
              {text}
            </motion.p>
          </AnimatePresence>
        </div>
      )}
    </div>
  );
});
