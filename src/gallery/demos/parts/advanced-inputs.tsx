import { useCallback, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Stage, Variant } from "../../ui";
import { fade } from "../../../kiln/motion";
import { ColorPicker, ColorPickerPanel } from "../../../kiln/components/choice-controls/ColorPicker";
import { PhoneInput, toE164, type PhoneValue } from "../../../kiln/components/text-input/PhoneInput";
import { CurrencyInput } from "../../../kiln/components/text-input/CurrencyInput";
import { BookingSlots } from "../../../kiln/components/pickers/BookingSlots";
import { SignaturePad, type SignaturePadHandle } from "../../../kiln/components/pickers/SignaturePad";
import { MentionsTextarea, type Mentionable } from "../../../kiln/components/text-input/MentionsTextarea";
import { RichTextEditor } from "../../../kiln/components/text-input/RichTextEditor";
import { Button } from "../../../kiln/components/buttons/Button";

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/** Shows a component's output value, as code. */
function Output({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex w-full min-w-0 flex-col gap-1.5">
      <span className="text-[13px] text-muted">{label}</span>
      <pre className="max-h-40 overflow-auto whitespace-pre-wrap break-all rounded-control bg-surface px-3 py-2 font-mono text-[12.5px] leading-5 text-ink">{children}</pre>
    </div>
  );
}

export function ColorDemo() {
  const [hull, setHull] = useState("#5e6b6e");
  const [blade, setBlade] = useState("#2f8ff0");
  const [saved, setSaved] = useState(["#5e6b6e", "#c9b27c", "#2b2d2f", "#b3261e", "#e8e3d6", "#3b6fd1cc"]);
  return (
    <Stage align="start" className="gap-10">
      <div className="flex flex-col gap-3">
        <span className="text-sm font-medium text-ink">Nostromo hull paint</span>
        <div className="rounded-sheet bg-surface p-4">
          <ColorPickerPanel value={hull} onChange={setHull} swatches={saved} onSwatchesChange={setSaved} />
        </div>
      </div>
      <div className="flex min-w-0 flex-col gap-6">
        <ColorPicker label="Lightsaber blade" value={blade} onChange={setBlade} swatches={["#2f8ff0", "#2fbf5a", "#8a3ff0", "#e5302f", "#f2c94c", "#ffffff"]} />
        <div className="flex flex-col gap-2">
          <span className="text-[13px] text-muted">Preview</span>
          <div className="flex items-center gap-3">
            <span className="h-2.5 w-36 rounded-full" style={{ background: blade }} aria-hidden />
            <span className="h-5 w-10 rounded-[4px] bg-ink/80" aria-hidden />
          </div>
        </div>
        <Output label="Values">{`hull:  ${hull}\nblade: ${blade}`}</Output>
      </div>
    </Stage>
  );
}

export function PhoneDemo() {
  const [v, setV] = useState<PhoneValue>({ country: "US", national: "2125552368" });
  const [w, setW] = useState<PhoneValue>({ country: "GB", national: "" });
  return (
    <Stage align="start" className="flex-col">
      <div className="grid w-full gap-6 md:grid-cols-2">
        <PhoneInput label="Ghostbusters hotline" value={v} onChange={setV} hint="Who you gonna call?" />
        <PhoneInput label="Your number" value={w} onChange={setW} hint="Type digits; spaces appear on their own." />
      </div>
      <Variant label="Sizes" className="w-full">
        {(["sm", "md", "lg"] as const).map((sz) => (
          <PhoneInput key={sz} size={sz} label={`Size ${sz}`} defaultValue={{ country: "US", national: "" }} className="w-[260px]" />
        ))}
      </Variant>
      <Output label="Stored as E.164">{`${toE164(v) || "—"}\n${toE164(w) || "—"}`}</Output>
    </Stage>
  );
}

export function CurrencyDemo() {
  const [usd, setUsd] = useState<number | null>(1000000);
  const [eur, setEur] = useState<number | null>(8800);
  const [jpy, setJpy] = useState<number | null>(1985);
  return (
    <Stage align="start" className="flex-col">
      <div className="grid w-full gap-6 md:grid-cols-3">
        <CurrencyInput label="Bounty on Han Solo" value={usd} onChange={setUsd} currency="USD" locale="en-US" hint="Jabba pays on delivery." />
        <CurrencyInput label="DeLorean parts" value={eur} onChange={setEur} currency="EUR" locale="de-DE" hint="German formatting: 1.234,56 €" />
        <CurrencyInput label="Tokyo arcade tokens" value={jpy} onChange={setJpy} currency="JPY" locale="ja-JP" hint="Yen has no minor unit." />
      </div>
      <Variant label="Sizes" className="w-full">
        {(["sm", "md", "lg"] as const).map((sz) => (
          <CurrencyInput key={sz} size={sz} label={`Size ${sz}`} defaultValue={4200} className="w-[200px]" />
        ))}
      </Variant>
      <Output label="Stored in minor units">{`usd: ${usd ?? "null"}\neur: ${eur ?? "null"}\njpy: ${jpy ?? "null"}`}</Output>
    </Stage>
  );
}

export function BookingDemo() {
  // Doc's lab is open weekdays 9:00 to 17:00 Hill Valley time (UTC-8), with a few slots taken.
  // Slots are real instants; the visitor sees the ones that fall on their chosen day in
  // their own time zone, which can include the host's previous or next day.
  const getSlots = useCallback((day: Date, minutes: number) => {
    const out: Date[] = [];
    for (const shift of [-1, 0, 1]) {
      const hostDay = new Date(day.getFullYear(), day.getMonth(), day.getDate() + shift);
      const dow = hostDay.getDay();
      if (dow === 0 || dow === 6) continue;
      for (let m = 9 * 60; m + minutes <= 17 * 60; m += 30) {
        const seed = (hostDay.getDate() * 31 + m) % 7;
        if (seed === 2 || seed === 5) continue;
        // 9:00 at UTC-8 is 17:00 UTC.
        const at = new Date(Date.UTC(hostDay.getFullYear(), hostDay.getMonth(), hostDay.getDate(), 17 + Math.floor(m / 60), m % 60));
        if (at.getFullYear() === day.getFullYear() && at.getMonth() === day.getMonth() && at.getDate() === day.getDate() && at.getTime() > Date.now()) out.push(at);
      }
    }
    return out.sort((x, y) => x.getTime() - y.getTime());
  }, []);
  const [max] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 60);
    return d;
  });
  return (
    <Stage align="start">
      <BookingSlots
        title="Flux capacitor calibration"
        host={{ name: "Dr. Emmett Brown", role: "Brown Labs, Hill Valley" }}
        description="Bring the DeLorean and 1.21 gigawatts. Plutonium not provided."
        durations={[15, 30, 60]}
        getSlots={getSlots}
        max={max}
        onBook={() => wait(900)}
      />
    </Stage>
  );
}

export function SignatureDemo() {
  const pad = useRef<SignaturePadHandle>(null);
  const [png, setPng] = useState<string | null>(null);
  const [empty, setEmpty] = useState(true);
  return (
    <Stage align="start" className="gap-8">
      <div className="flex w-full max-w-lg flex-col gap-3">
        <p className="text-sm text-ink">I accept that the Ghostbusters are not responsible for slime on the carpet, the ceiling, or the cat.</p>
        <SignaturePad ref={pad} label="Signature" onChange={setEmpty} downloadName="ghostbusters-waiver" />
        <Button className="self-start" disabled={empty} onClick={() => setPng(pad.current?.toDataURL() ?? null)}>Sign the waiver</Button>
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <span className="text-[13px] text-muted">Saved PNG</span>
        <div className="grid min-h-32 place-items-center rounded-card bg-white p-4">
          <AnimatePresence mode="wait" initial={false}>
            {png ? <motion.img decoding="async" key={png} src={png} alt="The saved signature" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={fade} className="max-h-28 max-w-full" />
              : <motion.span key="none" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={fade} className="text-[13px] text-neutral-500">Nothing signed yet</motion.span>}
          </AnimatePresence>
        </div>
      </div>
    </Stage>
  );
}

const CREW: Mentionable[] = [
  { id: "u1", name: "Luke Skywalker", handle: "redfive", detail: "Rogue Squadron" },
  { id: "u2", name: "Leia Organa", handle: "leia", detail: "Command" },
  { id: "u3", name: "Han Solo", handle: "han", detail: "Millennium Falcon" },
  { id: "u4", name: "Chewbacca", handle: "chewie", detail: "Millennium Falcon" },
  { id: "u5", name: "Lando Calrissian", handle: "lando", detail: "Cloud City" },
  { id: "u6", name: "Obi-Wan Kenobi", handle: "ben", detail: "Tatooine" },
  { id: "u7", name: "R2-D2", handle: "r2", detail: "Astromech" },
];

export function MentionsDemo() {
  const [v, setV] = useState({ text: "", mentions: [] as string[] });
  const [note, setNote] = useState("Dude, where's my car? @[Han Solo](u3) saw it last.");
  return (
    <Stage align="start" className="flex-col">
      <div className="w-full max-w-xl">
        <MentionsTextarea people={CREW} onChange={setV} label="Briefing for the Death Star run" placeholder="Type @ to tag a pilot. Try @lu or @chew." />
      </div>
      <Output label="Value">{v.text ? `${v.text}\n\nmentions: [${v.mentions.join(", ")}]` : "—"}</Output>
      <div className="w-full max-w-xl">
        <MentionsTextarea people={CREW} defaultValue="Wax on, wax off. @[Obi-Wan Kenobi](u6) approves." label="Uncontrolled, with a starting value" minRows={2} />
      </div>
      <div className="flex w-full max-w-xl flex-col gap-2">
        <MentionsTextarea people={CREW} value={note} onValueChange={setNote} label="Controlled: you own the text" minRows={2} />
        <div className="flex items-center gap-3">
          <Button size="sm" variant="outline" onClick={() => setNote("")}>Reset</Button>
          <Output label="Serialised">{note || "—"}</Output>
        </div>
      </div>
    </Stage>
  );
}

export function RichTextDemo() {
  const start = "<p>Marty, the time circuits need <strong>1.21 gigawatts</strong>. Sources, in order of preference:</p><ul><li>Plutonium</li><li>A bolt of lightning</li></ul><blockquote>Roads? Where we're going, we don't need roads.</blockquote>";
  const [html, setHtml] = useState(start);
  return (
    <Stage align="start" className="flex-col">
      <div className="w-full max-w-2xl">
        <RichTextEditor label="Note to Marty" defaultHTML={start} onChange={setHtml} />
        <p className="mt-2 text-[13px] text-muted">Markdown works too: **bold**, *italic*, `code`, ~~strike~~, and “- ”, “1. ” or “&gt; ” at the start of a line.</p>
      </div>
      <Output label="HTML out">{html}</Output>
    </Stage>
  );
}
