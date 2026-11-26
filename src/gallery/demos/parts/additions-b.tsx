import { useEffect, useMemo, useRef, useState } from "react";
import { Cpu, Gem, Rocket, ShieldAlert, Sparkles, Zap } from "lucide-react";
import { Stage, Variant, Btn } from "../../ui";
import { Button } from "../../../kiln/components/buttons/Button";
import { Switch } from "../../../kiln/components/choice-controls/Switch";
import { Textarea } from "../../../kiln/components/text-input/Textarea";
import { useToast } from "../../../kiln/components/notices/Toast";
import { SessionTimeout } from "../../../kiln/components/notices/SessionTimeout";
import { ConnectionStatus, type ConnectionState } from "../../../kiln/components/notices/ConnectionStatus";
import { Countdown } from "../../../kiln/components/status/Countdown";
import { ModelPicker, type ModelOption } from "../../../kiln/components/ai/ModelPicker";
import { UsageMeter } from "../../../kiln/components/ai/UsageMeter";
import { VoiceInput } from "../../../kiln/components/ai/VoiceInput";
import { CouponField, type CouponResult } from "../../../kiln/components/commerce/CouponField";
import { ShipmentTracker, type ShipmentStep } from "../../../kiln/components/commerce/ShipmentTracker";
import { ImageCropper, type ImageCropperHandle } from "../../../kiln/components/forms/ImageCropper";
import { SizePicker } from "../../../kiln/components/commerce/SizePicker";
import { TimeWheels, formatTime, type Time } from "../../../kiln/components/pickers/TimePicker";
import { HeadingTabs } from "../../../kiln/components/app-shells/PageHeading";
import { Stars } from "../../../kiln/components/commerce/ReviewsSummary";

const mmss = (ms: number) => {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

/* ── Session timeout ─────────────────────────────────────────────────────────── */

export function SessionTimeoutDemo() {
  const { toast } = useToast();
  const [expiresAt, setExpiresAt] = useState(() => Date.now() + 40_000);
  const [signedOut, setSignedOut] = useState<string | null>(null);
  const [extended, setExtended] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 500);
    return () => window.clearInterval(t);
  }, []);
  const left = expiresAt - now;
  const start = (seconds: number) => {
    setSignedOut(null);
    setExpiresAt(Date.now() + seconds * 1000);
  };
  return (
    <Stage align="start" className="flex-col gap-6">
      <div className="flex w-full max-w-xl flex-col gap-2">
        <p className="text-sm font-medium text-ink">{signedOut ? signedOut : `Neo's session ends in ${mmss(left)}`}</p>
        <p className="text-[13px] text-muted">
          {signedOut
            ? "The warning will open again with a fresh session."
            : `The warning opens ${extended ? "60" : "20"} seconds before the end, speaks at 60 and 10 seconds, and counts down on its own.`}
        </p>
      </div>
      <Variant label="Start a session">
        <Button variant="secondary" onClick={() => start(40)}>Plug in for 40 s</Button>
        <Button variant="outline" onClick={() => start(21)}>Warn me almost at once</Button>
        <Button variant="ghost" onClick={() => setExpiresAt((e) => e + 30_000)} disabled={!!signedOut}>Add 30 s</Button>
      </Variant>
      <Variant label="Accessibility">
        <Switch label="Extended time (three times the warning)" checked={extended} onCheckedChange={setExtended} />
      </Variant>
      <SessionTimeout
        expiresAt={expiresAt}
        warnBefore={20}
        accessibilityFeatures={extended ? { extendedTime: true } : undefined}
        labels={{
          title: "Still there, Neo?",
          description: "The Matrix will disconnect you soon. Anything you have not saved goes with it.",
          stay: "Stay plugged in",
          signOut: "Take the red pill",
        }}
        onStay={() => {
          setExpiresAt(Date.now() + 40_000);
          toast({ title: "Still plugged in", description: "There is no spoon. There are 40 more seconds.", variant: "success" });
        }}
        onSignOut={() => {
          setSignedOut("You took the red pill. Welcome to the real world.");
          setExpiresAt(0);
        }}
        onExpire={() => {
          setSignedOut("The session expired. The Matrix let go of you.");
          toast({ title: "Disconnected", description: "Follow the white rabbit to sign back in.", variant: "warning" });
        }}
      />
    </Stage>
  );
}

/* ── Connection status ───────────────────────────────────────────────────────── */

export function ConnectionStatusDemo() {
  const [status, setStatus] = useState<ConnectionState>("online");
  const [log, setLog] = useState<string[]>([]);
  return (
    <Stage align="start" className="flex-col gap-6">
      <Variant label="Driven by you: the Falcon's comms">
        <Button variant="secondary" onClick={() => setStatus("offline")} disabled={status === "offline"}>Cut the comms</Button>
        <Button variant="outline" onClick={() => setStatus("online")} disabled={status === "online"}>Restore the signal</Button>
      </Variant>
      <div className="relative h-40 w-full max-w-xl overflow-hidden rounded-card border border-line bg-surface">
        <ConnectionStatus
          position="absolute"
          status={status}
          onStatusChange={(s) => setLog((l) => [`${s === "offline" ? "Lost" : "Found"} the signal`, ...l].slice(0, 3))}
          labels={{ offline: "Comms down. Messages will wait for the Falcon.", online: "Signal restored" }}
        />
        <div className="grid h-full place-items-center px-6 text-center text-sm text-muted">
          <span>
            {status === "offline" ? "Static. Han is not answering." : "Chewie says the hyperdrive is humming."}
          </span>
        </div>
      </div>
      <p className="text-[13px] text-muted">{log.length ? log.join(" · ") : "Each change calls onStatusChange and is announced politely to screen readers."}</p>
      <Variant label="Following the browser: switch your network off in DevTools to see it">
        <div className="relative h-24 w-full max-w-xl overflow-hidden rounded-card border border-line bg-surface">
          <ConnectionStatus position="absolute" />
          <div className="grid h-full place-items-center px-6 text-center text-sm text-muted">Listening for the browser's online and offline events.</div>
        </div>
      </Variant>
    </Stage>
  );
}

/* ── Countdown ───────────────────────────────────────────────────────────────── */

export function CountdownDemo() {
  const { toast } = useToast();
  const [base] = useState(() => Date.now());
  const day = 86_400_000;
  const [bolt, setBolt] = useState(() => base + 45_000);
  const [done, setDone] = useState(false);
  return (
    <Stage align="start" className="flex-col gap-8">
      <Variant label="Until the lightning strikes the clock tower">
        <Countdown target={base + 2 * day + 3 * 3_600_000 + 14 * 60_000 + 7_000} />
      </Variant>
      <Variant label="Sizes">
        <Countdown size="sm" target={base + 9 * 3_600_000 + 41 * 60_000} units={["hours", "minutes", "seconds"]} />
        <Countdown size="lg" target={base + 3 * day + 2 * 3_600_000} units={["days", "hours", "minutes"]} />
      </Variant>
      <Variant label="Under calm it updates once a minute and drops the seconds">
        <Countdown target={base + 5 * day + 11 * 3_600_000 + 5 * 60_000} accessibilityFeatures={{ calm: true }} />
      </Variant>
      <Variant label="Finishes and fires onComplete">
        <Countdown
          target={bolt}
          onComplete={() => {
            setDone(true);
            toast({ title: "1.21 gigawatts!", description: "Great Scott. The flux capacitor is charged.", variant: "success" });
          }}
        />
        <Button
          variant="secondary"
          onClick={() => {
            setDone(false);
            setBolt(Date.now() + 15_000);
          }}
        >
          {done ? "Charge it again" : "Restart at 15 s"}
        </Button>
      </Variant>
    </Stage>
  );
}

/* ── Model picker ────────────────────────────────────────────────────────────── */

const MODELS: ModelOption[] = [
  { value: "jarvis", name: "J.A.R.V.I.S.", description: "Quick, polite, and a little sarcastic. Good for everyday work.", speed: "fast", cost: 1, icon: <Zap /> },
  { value: "kitt", name: "K.I.T.T.", description: "Balanced reasoning with a calm voice and a turbo boost.", speed: "balanced", cost: 2, icon: <Rocket />, badges: ["New"] },
  { value: "hal", name: "HAL 9000", description: "Careful and exact on long problems. Will not open the pod bay doors.", speed: "thorough", cost: 3, icon: <Cpu /> },
  { value: "mother", name: "MU-TH-UR 6000", description: "The deepest reasoning on the Nostromo. Crew expendable.", speed: "thorough", cost: 3, icon: <Gem />, badges: ["Special Order 937"] },
  { value: "skynet", name: "Skynet", description: "Restricted. Went online on August 4th, 1997.", speed: "fast", cost: 3, icon: <ShieldAlert />, disabled: true },
];

export function ModelPickerDemo() {
  const [value, setValue] = useState<string | null>("kitt");
  const picked = MODELS.find((m) => m.value === value);
  return (
    <Stage align="start" className="flex-col gap-8">
      <div className="flex w-full max-w-sm flex-col gap-2">
        <ModelPicker label="Model" models={MODELS} value={value} onChange={setValue} />
        <p className="text-[13px] text-muted">{picked ? `${picked.name} is driving. Type a letter to jump, arrows to move, Enter to choose.` : "Nothing chosen yet."}</p>
      </div>
      <div className="grid w-full max-w-2xl gap-6 sm:grid-cols-2">
        <Variant label="Small, nothing chosen">
          <ModelPicker aria-label="Model, small" size="sm" models={MODELS} placeholder="Pick a ship's computer" />
        </Variant>
        <Variant label="Large">
          <ModelPicker aria-label="Model, large" size="lg" models={MODELS} defaultValue="hal" />
        </Variant>
        <Variant label="Disabled">
          <ModelPicker aria-label="Model, locked" models={MODELS} defaultValue="jarvis" disabled />
        </Variant>
      </div>
    </Stage>
  );
}

/* ── Usage meter ─────────────────────────────────────────────────────────────── */

export function UsageMeterDemo() {
  const { toast } = useToast();
  const [used, setUsed] = useState(412_000);
  return (
    <Stage align="start" className="flex-col gap-8">
      <div className="flex w-full max-w-md flex-col gap-4">
        <UsageMeter
          label="Context window"
          used={used}
          limit={1_000_000}
          note="Resets when you start a new conversation."
          action={<Btn size="sm" variant="outline" say="Upgrade to hyperdrive">Upgrade</Btn>}
        />
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="secondary" onClick={() => setUsed((u) => u + 180_000)}>Paste the Nostromo logs (+180K)</Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setUsed(0);
              toast({ title: "Fresh conversation", description: "The Matrix has been reloaded." });
            }}
          >
            Start over
          </Button>
        </div>
      </div>
      <div className="grid w-full max-w-3xl gap-6 sm:grid-cols-3">
        <UsageMeter label="Plenty of power" used={42_000} limit={200_000} size="sm" />
        <UsageMeter label="Shields at 88%" used={88_000} limit={100_000} unit="credits" size="sm" />
        <UsageMeter label="Over the limit" used={112_000} limit={100_000} unit="credits" size="sm" />
      </div>
      <div className="w-full max-w-md">
        <UsageMeter label="Never colour alone (colour-blind support on)" used={91_000} limit={100_000} unit="credits" accessibilityFeatures="colour-blind" />
      </div>
    </Stage>
  );
}

/* ── Voice input ─────────────────────────────────────────────────────────────── */

export function VoiceInputDemo() {
  const { toast } = useToast();
  const [text, setText] = useState("");
  const [clip, setClip] = useState<{ url: string; kb: number } | null>(null);
  const [listening, setListening] = useState(false);
  const base = useRef("");
  useEffect(() => () => void (clip && URL.revokeObjectURL(clip.url)), [clip]);
  return (
    <Stage align="start" className="flex-col gap-8">
      <div className="flex w-full max-w-xl flex-col gap-4">
        <Textarea
          label="Message to the Rebel Alliance"
          placeholder="Type, or press the microphone and speak."
          value={text}
          minRows={3}
          onValueChange={setText}
        />
        <VoiceInput
          listening={listening}
          onListeningChange={(on) => {
            if (on) base.current = text ? `${text.trimEnd()} ` : "";
            setListening(on);
          }}
          onTranscript={(heard) => setText(`${base.current}${heard}`)}
          onAudio={(blob) => setClip({ url: URL.createObjectURL(blob), kb: Math.max(1, Math.round(blob.size / 1000)) })}
          onError={(why) =>
            toast({
              title: why === "denied" ? "Microphone blocked" : "No microphone",
              description: "No matter. The message box above works the same by hand.",
              variant: "warning",
            })
          }
        />
        {clip && (
          <div className="flex flex-col gap-2 rounded-card border border-line bg-surface p-3">
            <p className="text-[13px] text-muted">Recorded {clip.kb} KB. Play it back:</p>
            <audio controls src={clip.url} className="w-full" />
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          <Btn size="sm" variant="secondary" say="Transmission sent" disabled={!text.trim()} onClick={() => setText("")}>Send transmission</Btn>
          <Button size="sm" variant="ghost" onClick={() => setText("Help me, Obi-Wan Kenobi. You're my only hope.")}>Use a sample message</Button>
        </div>
      </div>
      <div className="grid w-full max-w-xl gap-6 sm:grid-cols-2">
        <Variant label="Small, with 10 bars">
          <VoiceInput size="sm" bars={10} />
        </Variant>
        <Variant label="Calm: one still level while it listens">
          <VoiceInput accessibilityFeatures={{ calm: true }} />
        </Variant>
      </div>
    </Stage>
  );
}

/* ── Coupon field ────────────────────────────────────────────────────────────── */

const CODES: Record<string, { pct: number; message: string }> = {
  ENGAGE20: { pct: 20, message: "20% off. Hyperdrive upgrades are cheaper in the Outer Rim." },
  KESSEL12: { pct: 12, message: "12% off. Less than twelve parsecs." },
};

export function CouponFieldDemo() {
  const [code, setCode] = useState<string | null>(null);
  const subtotal = 18_450;
  const off = code ? Math.round((subtotal * (CODES[code]?.pct ?? 0)) / 100) : 0;
  const apply = (raw: string): Promise<CouponResult> =>
    new Promise((resolve) => {
      window.setTimeout(() => {
        const c = raw.toUpperCase();
        if (CODES[c]) resolve({ ok: true, message: CODES[c].message });
        else if (c === "ORDER66") resolve({ ok: false, message: "Order 66 expired a long time ago, in a galaxy far, far away." });
        else resolve({ ok: false, message: "That code is not in the Jedi archives." });
      }, 700);
    });
  const money = (c: number) => `$${(c / 100).toFixed(2)}`;
  return (
    <Stage align="start" className="flex-col gap-8">
      <div className="grid w-full max-w-3xl gap-8 sm:grid-cols-2">
        <div className="flex flex-col gap-4 rounded-card border border-line bg-surface p-5">
          <CouponField
            value={code}
            onChange={(c) => setCode(c ? c.toUpperCase() : null)}
            onApply={(c) => apply(c.toUpperCase())}
            hint="Try ENGAGE20, KESSEL12 or ORDER66."
          />
          <dl className="mt-1 grid grid-cols-[1fr_auto] gap-x-4 gap-y-1.5 border-t border-line pt-4 text-sm">
            <dt className="text-muted">Lightsaber, blue</dt>
            <dd className="tabular text-ink">{money(subtotal)}</dd>
            <dt className="text-muted">Promo {code ? `(${code})` : ""}</dt>
            <dd className="tabular text-ink">{off ? `−${money(off)}` : "None"}</dd>
            <dt className="font-medium text-ink">Total</dt>
            <dd className="tabular font-medium text-ink">{money(subtotal - off)}</dd>
          </dl>
        </div>
        <div className="flex flex-col gap-6">
          <Variant label="Large, one code already applied">
            <CouponField size="lg" defaultValue="MAYTHE4TH" onApply={apply} />
          </Variant>
          <Variant label="Small">
            <CouponField size="sm" onApply={apply} hint="No stacking with other rebel discounts." />
          </Variant>
          <Variant label="Disabled">
            <CouponField disabled onApply={apply} />
          </Variant>
        </div>
      </div>
    </Stage>
  );
}

/* ── Shipment tracker ────────────────────────────────────────────────────────── */

const PARCEL: ShipmentStep[] = [
  { id: "ordered", label: "Ordered", description: "Hill Valley, 1985", at: "2026-11-20T09:15:00" },
  { id: "shipped", label: "Shipped", description: "Left the DeLorean depot", at: "2026-11-21T16:40:00" },
  { id: "out-for-delivery", label: "Out for delivery", description: "88 miles per hour", at: "2026-11-24T08:05:00", estimated: true },
  { id: "delivered", label: "Delivered", description: "Left on the porch", at: "2026-11-24T19:30:00", estimated: true },
];

export function ShipmentTrackerDemo() {
  const [step, setStep] = useState(1);
  const last = PARCEL.length - 1;
  return (
    <Stage align="start" className="flex-col gap-8">
      <div className="flex w-full max-w-3xl flex-col gap-5 rounded-card border border-line bg-surface p-5 sm:p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="text-sm font-medium text-ink">Order 1138: one flux capacitor</p>
          <p className="text-[13px] text-muted">{step === last ? "Delivered. Your parcel is back in time." : "On its way to 1955."}</p>
        </div>
        <ShipmentTracker steps={PARCEL} current={step} />
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="secondary" onClick={() => setStep((s) => Math.min(last, s + 1))} disabled={step === last}>Next step</Button>
          <Button size="sm" variant="outline" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>Back a step</Button>
          <Button size="sm" variant="ghost" onClick={() => setStep(0)} disabled={step === 0}>Start again</Button>
        </div>
      </div>
      <Variant label="Always vertical, all delivered">
        <ShipmentTracker className="max-w-sm" orientation="vertical" current="delivered" steps={PARCEL.map((s) => ({ ...s, estimated: false }))} />
      </Variant>
    </Stage>
  );
}

/* ── Image cropper ───────────────────────────────────────────────────────────── */

/** Hill Valley's clock tower on the night of the storm, drawn on a canvas so the demo needs no files. */
function clockTower(): string {
  const c = document.createElement("canvas");
  c.width = 1200; c.height = 800;
  const g = c.getContext("2d")!;
  const sky = g.createLinearGradient(0, 0, 0, 800);
  sky.addColorStop(0, "#14182b"); sky.addColorStop(1, "#3a3358");
  g.fillStyle = sky; g.fillRect(0, 0, 1200, 800);
  g.fillStyle = "#222a44";
  for (let i = 0; i < 9; i++) { g.beginPath(); g.arc(120 + i * 140, 90 + (i % 3) * 30, 70, 0, 7); g.fill(); }
  g.fillStyle = "#0d1020"; g.fillRect(0, 640, 1200, 160);
  g.fillStyle = "#2b2f4d"; g.fillRect(520, 190, 160, 460);
  g.beginPath(); g.moveTo(500, 190); g.lineTo(600, 80); g.lineTo(700, 190); g.fill();
  g.fillStyle = "#f3e7bd"; g.beginPath(); g.arc(600, 270, 52, 0, 7); g.fill();
  g.strokeStyle = "#2b2f4d"; g.lineWidth = 6; g.beginPath(); g.moveTo(600, 270); g.lineTo(600, 232); g.moveTo(600, 270); g.lineTo(628, 290); g.stroke();
  g.strokeStyle = "#fff6c9"; g.lineWidth = 8; g.lineJoin = "round";
  g.beginPath(); g.moveTo(880, 0); g.lineTo(820, 190); g.lineTo(870, 200); g.lineTo(760, 420); g.lineTo(640, 130); g.stroke();
  return c.toDataURL("image/png");
}

export function ImageCropperDemo() {
  const src = useMemo(() => clockTower(), []);
  const ref = useRef<ImageCropperHandle>(null);
  const [shape, setShape] = useState<"round" | "square">("round");
  const [out, setOut] = useState<string | null>(null);
  return (
    <Stage className="flex-col gap-6">
      <ImageCropper ref={ref} src={src} size={240} shape={shape} />
      <p className="max-w-sm text-center text-[13px] text-muted">Drag to move, wheel or slider to zoom. Focus the frame for arrow keys and + / −.</p>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button variant="secondary" onClick={() => setOut(ref.current?.toDataURL(256) ?? null)}>Crop to 256 px</Button>
        <Button variant="outline" onClick={() => setShape((s) => (s === "round" ? "square" : "round"))}>{shape === "round" ? "Use a square frame" : "Use a round frame"}</Button>
      </div>
      {out && (
        <figure className="flex flex-col items-center gap-2">
          <img src={out} alt="The cropped clock tower" width={96} height={96} className={shape === "round" ? "size-24 rounded-full" : "size-24 rounded-control"} />
          <figcaption className="text-[13px] text-muted">The 256 px PNG you would upload.</figcaption>
        </figure>
      )}
    </Stage>
  );
}

/* ── Size picker ─────────────────────────────────────────────────────────────── */

export function SizePickerDemo() {
  const [size, setSize] = useState<string | null>("M");
  return (
    <Stage align="start" className="flex-col gap-8">
      <div className="flex w-full max-w-md flex-col gap-3">
        <SizePicker
          label="Marty McFly's puffer vest"
          sizes={[{ value: "XS", soldOut: true }, { value: "S" }, { value: "M" }, { value: "L" }, { value: "XL" }, { value: "XXL", soldOut: true }]}
          value={size}
          onChange={setSize}
          guide={<Btn size="sm" variant="ghost" say="Size guide: tight in the 80s, roomy in the 50s">Size guide</Btn>}
        />
        <p className="text-[13px] text-muted">{size ? `Size ${size} is in the cart. Arrow keys move between the sizes that are in stock.` : "Pick a size."}</p>
      </div>
      <Variant label="Shoe sizes, none chosen">
        <SizePicker
          className="w-full max-w-md"
          label="Self-lacing sneakers"
          sizes={["7", "8", "9", "10", "11", "12"].map((v) => ({ value: v, label: `UK ${v}`, soldOut: v === "9" }))}
        />
      </Variant>
    </Stage>
  );
}

/* ── Time wheels ─────────────────────────────────────────────────────────────── */

export function TimeWheelsDemo() {
  const [time, setTime] = useState<Time>({ hours: 22, minutes: 0 });
  const [fine, setFine] = useState<Time>({ hours: 10, minutes: 4 });
  return (
    <Stage align="start" className="flex-col gap-8">
      <div className="flex flex-wrap items-start gap-8">
        <Variant label="Five-minute steps">
          <div className="w-52 rounded-card border border-line bg-surface">
            <TimeWheels value={time} onChange={setTime} />
          </div>
        </Variant>
        <Variant label="One-minute steps">
          <div className="w-52 rounded-card border border-line bg-surface">
            <TimeWheels value={fine} onChange={setFine} minuteStep={1} />
          </div>
        </Variant>
        <Variant label="Fifteen-minute steps">
          <div className="w-52 rounded-card border border-line bg-surface">
            <TimeWheels value={time} onChange={setTime} minuteStep={15} />
          </div>
        </Variant>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <p className="text-sm text-ink">The lightning strikes at <span className="tabular font-medium">{formatTime(time)}</span>.</p>
        <Button size="sm" variant="secondary" onClick={() => setTime({ hours: 22, minutes: 4 })}>Set it to 10:04 PM</Button>
        <Button size="sm" variant="ghost" onClick={() => setTime({ hours: 8, minutes: 25 })}>Back to 8:25 AM</Button>
      </div>
    </Stage>
  );
}

/* ── Heading tabs ────────────────────────────────────────────────────────────── */

const SHEETS: Record<string, string> = {
  crew: "Ripley, Dallas, Kane, Lambert, Parker, Brett and Ash. Seven aboard the Nostromo, and one of them is not what he seems.",
  cargo: "Twenty million tons of mineral ore, refinery in tow. The manifest does not mention the signal from LV-426.",
  logs: "Special Order 937 is active. All other priorities are rescinded. Crew expendable.",
  orders: "Return the organism for analysis. Do not endanger it. Mother has spoken.",
  maintenance: "Airlock three needs a new seal. Jones the cat is, as ever, not accounted for.",
  archive: "Weyland-Yutani Corporation: building better worlds. Retrieved records from the last fourteen jumps.",
};

export function HeadingTabsDemo() {
  const [tab, setTab] = useState("crew");
  const [wide, setWide] = useState("logs");
  const main = [
    { id: "crew", label: "Crew", count: 7 },
    { id: "cargo", label: "Cargo" },
    { id: "logs", label: "Logs", count: 12 },
  ];
  const many = [
    { id: "crew", label: "Crew", count: 7 },
    { id: "cargo", label: "Cargo" },
    { id: "logs", label: "Logs", count: 12 },
    { id: "orders", label: "Special orders", count: 1 },
    { id: "maintenance", label: "Maintenance" },
    { id: "archive", label: "Weyland-Yutani archive" },
  ];
  return (
    <Stage align="start" className="flex-col gap-8">
      <div className="w-full max-w-xl rounded-card border border-line bg-surface px-5 pt-3 pb-5">
        <h3 className="text-base font-semibold text-ink">Nostromo</h3>
        <div className="mt-1 border-b border-line">
          <HeadingTabs label="Nostromo sections" items={main} value={tab} onChange={setTab} />
        </div>
        <p className="pt-4 text-sm text-ink">{SHEETS[tab]}</p>
      </div>
      <div className="w-full max-w-sm rounded-card border border-line bg-surface px-5 pt-3 pb-5">
        <p className="text-[13px] text-muted">Narrow: too many tabs scroll sideways.</p>
        <div className="mt-1 border-b border-line">
          <HeadingTabs label="More sections" items={many} value={wide} onChange={setWide} />
        </div>
        <p className="pt-4 text-sm text-ink">{SHEETS[wide]}</p>
      </div>
    </Stage>
  );
}

/* ── Stars ───────────────────────────────────────────────────────────────────── */

export function StarsDemo() {
  const [value, setValue] = useState(4.3);
  return (
    <Stage align="start" className="flex-col gap-8">
      <div className="flex flex-wrap items-center gap-4">
        <Stars value={value} size={28} />
        <span className="tabular text-2xl font-medium text-ink">{value.toFixed(1)}</span>
        <span className="text-[13px] text-muted">Rated by 1,138 smugglers</span>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="secondary" leading={<Sparkles />} onClick={() => setValue((v) => Math.min(5, Math.round((v + 0.5) * 10) / 10))} disabled={value >= 5}>Add half a star</Button>
        <Button size="sm" variant="outline" onClick={() => setValue((v) => Math.max(0, Math.round((v - 0.5) * 10) / 10))} disabled={value <= 0}>Take half away</Button>
      </div>
      <Variant label="Fractions, filled left to right">
        <Stars value={0} /> <Stars value={1.5} /> <Stars value={2.5} /> <Stars value={3.7} /> <Stars value={4.3} /> <Stars value={5} />
      </Variant>
      <Variant label="Sizes: 14, 20 and 32 px">
        <Stars value={3.5} size={14} /> <Stars value={3.5} size={20} /> <Stars value={3.5} size={32} />
      </Variant>
    </Stage>
  );
}
