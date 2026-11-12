import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { Category } from "../types";
import { Stage } from "../ui";
import { spring } from "../../kiln/motion";
import { AuthForms } from "../../kiln/components/forms/AuthForms";
import { SettingsRow, SettingsSection } from "../../kiln/components/forms/SettingsSection";
import { SaveBar } from "../../kiln/components/forms/SaveBar";
import { InlineEdit } from "../../kiln/components/forms/InlineEdit";
import { AvatarUpload } from "../../kiln/components/forms/AvatarUpload";
import { KeyValueEditor, newRow, type KeyValueRow } from "../../kiln/components/forms/KeyValueEditor";
import { MessageComposer, type Attachment } from "../../kiln/components/communication/MessageComposer";
import { TextField } from "../../kiln/components/text-input/TextField";
import { Switch } from "../../kiln/components/choice-controls/Switch";
import { RadioGroup } from "../../kiln/components/choice-controls/RadioGroup";

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

function AuthDemo() {
  return (
    <Stage>
      <AuthForms
        copy={{
          "sign-in": { title: "Sign in to the Rebellion", subtitle: "Welcome back, pilot. The base is on Hoth this week.", submit: "Sign in" },
          "sign-up": { title: "Join the Rebel Alliance", subtitle: "Every great rebellion starts with an account.", submit: "Enlist" },
          forgot: { title: "Lost your clearance code?", subtitle: "We'll send a reset link to your comlink address.", submit: "Send reset link" },
        }}
        providers={[
          { label: "Continue with Holonet", onClick: () => {} },
          { label: "Continue with a code cylinder", onClick: () => {} },
        ]}
        onSubmit={async (mode, v) => {
          await wait(1100);
          if (mode !== "forgot" && !v.email.includes("@")) throw new Error("That comlink address is missing an @.");
          if (mode === "sign-in" && v.password === "12345") throw new Error("One, two, three, four, five? That's the kind of thing an idiot would have on his luggage!");
        }}
      />
    </Stage>
  );
}

type Ship = { name: string; captain: string; hyperdrive: "1" | "0.5" | "2"; shields: boolean; autopilot: boolean };
const SHIP: Ship = { name: "Millennium Falcon", captain: "Han Solo", hyperdrive: "0.5", shields: true, autopilot: false };

function SettingsDemo() {
  const [saved, setSaved] = useState(SHIP);
  const [draft, setDraft] = useState(SHIP);
  const [saving, setSaving] = useState(false);
  const dirty = useMemo(() => JSON.stringify(saved) !== JSON.stringify(draft), [saved, draft]);
  const set = <K extends keyof Ship>(k: K, v: Ship[K]) => setDraft((d) => ({ ...d, [k]: v }));
  return (
    <Stage align="start" className="relative flex-col gap-10 overflow-hidden pb-24 sm:pb-24">
      <SettingsSection title="Ship" description="Shown on your docking requests and in the Mos Eisley registry.">
        <TextField label="Ship name" value={draft.name} onChange={(e) => set("name", e.target.value)} />
        <TextField label="Captain" value={draft.captain} onChange={(e) => set("captain", e.target.value)} hint="Co-pilots are managed under Crew." />
      </SettingsSection>
      <SettingsSection title="Hyperdrive" description="The class rating the navicomputer plans jumps with." aside={<>Currently class {saved.hyperdrive}. Kessel Run in under 12 parsecs.</>}>
        <RadioGroup label="Class" value={draft.hyperdrive} onChange={(v) => set("hyperdrive", v)} options={[
          { value: "0.5", label: "Class 0.5", description: "Modified. She'll make point five past lightspeed." },
          { value: "1", label: "Class 1", description: "Standard military rating." },
          { value: "2", label: "Class 2", description: "Imperial freighters. Reliable, slow." },
        ]} />
      </SettingsSection>
      <SettingsSection title="Systems" description="Changes apply on the next jump.">
        <SettingsRow title="Deflector shields" description="Raise them automatically when a Star Destroyer is in range." control={<Switch checked={draft.shields} onCheckedChange={(v) => set("shields", v)} />} />
        <SettingsRow title="Let the Wookiee win" description="Hand control to Chewbacca during holochess." control={<Switch checked={draft.autopilot} onCheckedChange={(v) => set("autopilot", v)} />} />
      </SettingsSection>
      <SaveBar
        dirty={dirty}
        saving={saving}
        onReset={() => setDraft(saved)}
        onSave={async () => { setSaving(true); await wait(900); setSaved(draft); setSaving(false); }}
      />
    </Stage>
  );
}

function InlineEditDemo() {
  const [title, setTitle] = useState("Operation Ghostbusters");
  const [venue, setVenue] = useState("550 Central Park West, apartment 22A");
  const [owner, setOwner] = useState("Dr. Peter Venkman");
  return (
    <Stage align="start">
      <div className="flex w-full max-w-xl flex-col gap-4 rounded-sheet bg-surface p-5">
        <InlineEdit label="Case title" value={title} onChange={setTitle} textClassName="text-[22px] font-semibold tracking-[-0.01em]" />
        <dl className="grid grid-cols-[96px_minmax(0,1fr)] items-baseline gap-x-4 gap-y-2 text-sm">
          <dt className="text-muted">Location</dt>
          <dd className="min-w-0"><InlineEdit label="Location" value={venue} onChange={setVenue} /></dd>
          <dt className="text-muted">Lead</dt>
          <dd className="min-w-0"><InlineEdit label="Lead" value={owner} onChange={setOwner} /></dd>
          <dt className="text-muted">Status</dt>
          <dd className="px-0 text-ink">Gatekeeper located. Keymaster at large.</dd>
        </dl>
      </div>
    </Stage>
  );
}

/** Two suns over the dunes, drawn on a canvas so the demo needs no files. */
function tatooine(): string {
  const c = document.createElement("canvas");
  c.width = 960; c.height = 640;
  const g = c.getContext("2d")!;
  g.fillStyle = "#e9b26b"; g.fillRect(0, 0, 960, 640);
  g.fillStyle = "#f2c98a"; g.fillRect(0, 0, 960, 300);
  g.fillStyle = "#fff4dc"; g.beginPath(); g.arc(420, 230, 46, 0, 7); g.fill();
  g.fillStyle = "#ffe2a8"; g.beginPath(); g.arc(540, 270, 30, 0, 7); g.fill();
  g.fillStyle = "#c98a4a"; g.beginPath(); g.moveTo(0, 420); g.quadraticCurveTo(260, 330, 520, 410); g.quadraticCurveTo(760, 470, 960, 380); g.lineTo(960, 640); g.lineTo(0, 640); g.fill();
  g.fillStyle = "#a86b37"; g.beginPath(); g.moveTo(0, 520); g.quadraticCurveTo(380, 450, 960, 540); g.lineTo(960, 640); g.lineTo(0, 640); g.fill();
  g.fillStyle = "#5b3a20"; g.fillRect(460, 430, 10, 40); g.beginPath(); g.arc(465, 424, 7, 0, 7); g.fill();
  return c.toDataURL("image/png");
}

function AvatarDemo() {
  const [pic, setPic] = useState<string | null>(null);
  return (
    <Stage>
      <AvatarUpload name="Luke Skywalker" value={pic} onChange={setPic} sample={tatooine} />
    </Stage>
  );
}

function KeyValueDemo() {
  const [rows, setRows] = useState<KeyValueRow[]>(() => [
    newRow("FLUX_CAPACITOR_GW", "1.21"),
    newRow("DELOREAN_TARGET_MPH", "88"),
    newRow("DOC_BROWN_PAGER", "555-4385", true),
    newRow("PLUTONIUM_SUPPLIER", "Libyan nationalists", true),
  ]);
  return (
    <Stage align="start">
      <div className="w-full max-w-2xl rounded-sheet bg-surface p-4 sm:p-5">
        <KeyValueEditor rows={rows} onChange={setRows} />
      </div>
    </Stage>
  );
}

type Msg = { id: number; from: "dave" | "hal"; text: string; files: Attachment[] };

function ComposerDemo() {
  const [msgs, setMsgs] = useState<Msg[]>([
    { id: 1, from: "dave", text: "Open the pod bay doors, HAL.", files: [] },
    { id: 2, from: "hal", text: "I'm sorry, Dave. I'm afraid I can't do that.", files: [] },
  ]);
  return (
    <Stage align="start">
      <div className="flex w-full max-w-xl flex-col gap-4">
        <ul className="flex flex-col gap-2" aria-live="polite">
          <AnimatePresence initial={false}>
            {msgs.map((m) => (
              <motion.li key={m.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={spring}
                className={m.from === "dave" ? "max-w-[85%] self-end rounded-card bg-btn-primary px-3.5 py-2 text-sm text-btn-primary-ink" : "max-w-[85%] self-start rounded-card bg-surface px-3.5 py-2 text-sm text-ink"}>
                <span className="whitespace-pre-wrap">{m.text}</span>
                {m.files.length > 0 && <span className="mt-1 block text-xs opacity-80">{m.files.map((f) => f.name).join(", ")}</span>}
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
        <MessageComposer
          placeholder="Message HAL 9000"
          onSend={(text, files) => {
            const id = Date.now();
            setMsgs((m) => [...m, { id, from: "dave", text, files }]);
            window.setTimeout(() => setMsgs((m) => [...m, { id: id + 1, from: "hal", text: "This mission is too important for me to allow you to jeopardize it.", files: [] }]), 900);
          }}
        />
      </div>
    </Stage>
  );
}

export const category: Category = {
  id: "forms",
  name: "Forms & flows",
  summary: "Whole patterns built from the inputs: signing in, settings, editing in place, uploads and messages.",
  entries: [
    { id: "auth-forms", name: "Sign in, sign up, reset", summary: "One card for all three; fields come and go and the card eases to its new height.", files: ["src/kiln/components/forms/AuthForms.tsx", "src/kiln/components/text-input/TextField.tsx", "src/kiln/components/text-input/PasswordField.tsx", "src/kiln/components/shared/Field.tsx", "src/kiln/components/buttons/Button.tsx", "src/kiln/controllable.ts", "src/kiln/motion.ts", "src/kiln/cn.ts"], Demo: AuthDemo },
    { id: "settings-section", name: "Settings section", summary: "Label column beside a panel of controls, and a bar that rises when there are unsaved changes.", files: ["src/kiln/components/forms/SettingsSection.tsx", "src/kiln/components/forms/SaveBar.tsx", "src/kiln/components/buttons/Button.tsx", "src/kiln/motion.ts", "src/kiln/cn.ts"], Demo: SettingsDemo },
    { id: "inline-edit", name: "Inline edit", summary: "Click or press Enter to edit text where it sits; Escape puts it back.", files: ["src/kiln/components/forms/InlineEdit.tsx", "src/kiln/controllable.ts", "src/kiln/cn.ts"], Demo: InlineEditDemo },
    { id: "avatar-upload", name: "Avatar upload and cropper", summary: "Upload, then drag and zoom inside a round frame; the result is a 512px PNG.", files: ["src/kiln/components/forms/AvatarUpload.tsx", "src/kiln/components/forms/ImageCropper.tsx", "src/kiln/components/choice-controls/Slider.tsx", "src/kiln/controllable.ts", "src/kiln/motion.ts", "src/kiln/cn.ts", "src/kiln/components/buttons/Button.tsx"], Demo: AvatarDemo },
    { id: "key-value-editor", name: "Key–value editor", summary: "Environment-variable rows with validation and secrets that stay masked until revealed.", files: ["src/kiln/components/forms/KeyValueEditor.tsx", "src/kiln/controllable.ts", "src/kiln/components/buttons/Button.tsx", "src/kiln/motion.ts", "src/kiln/cn.ts"], Demo: KeyValueDemo },
    { id: "message-composer", name: "Message composer", summary: "Grows with the text, holds attachments, and its send button fills in when there is something to send.", files: ["src/kiln/components/communication/MessageComposer.tsx", "src/kiln/motion.ts", "src/kiln/cn.ts"], Demo: ComposerDemo },
  ],
};
