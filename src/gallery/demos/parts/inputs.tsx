import { useState } from "react";
import { AtSign, Globe, Heart, Mail } from "lucide-react";
import { Stage, Variant } from "../../ui";
import { TextField } from "../../../kiln/components/text-input/TextField";
import { Textarea } from "../../../kiln/components/text-input/Textarea";
import { PasswordField } from "../../../kiln/components/text-input/PasswordField";
import { SearchField } from "../../../kiln/components/text-input/SearchField";
import { Checkbox } from "../../../kiln/components/choice-controls/Checkbox";
import { CheckboxGroup } from "../../../kiln/components/choice-controls/CheckboxGroup";
import { RadioGroup } from "../../../kiln/components/choice-controls/RadioGroup";
import { Switch } from "../../../kiln/components/choice-controls/Switch";
import { Slider } from "../../../kiln/components/choice-controls/Slider";
import { NumberField } from "../../../kiln/components/text-input/NumberField";
import { OTPInput } from "../../../kiln/components/text-input/OTPInput";
import { Rating } from "../../../kiln/components/choice-controls/Rating";
import { ColorSwatches } from "../../../kiln/components/choice-controls/ColorSwatches";
import { Button } from "../../../kiln/components/buttons/Button";

export function TextFieldDemo() {
  const [email, setEmail] = useState("marty@hillvalley");
  const [error, setError] = useState<string | undefined>();
  const check = () => setError(/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(email) ? undefined : "That address won't reach 1985. Try marty@hillvalley.com");
  return (
    <Stage className="flex-col" align="start">
      <div className="grid w-full gap-6 md:grid-cols-2">
        <TextField label="Full name" placeholder="Ellen Ripley" hint="As it appears on your Weyland-Yutani badge." clearable defaultValue="Ellen Ripley" />
        <TextField label="Ship's homepage" leading={<Globe />} placeholder="nostromo.example" optional />
        <div className="flex flex-col gap-3">
          <TextField
            label="Email"
            leading={<Mail />}
            value={email}
            onChange={(e) => { setEmail(e.target.value); if (error) setError(undefined); }}
            onClear={() => setEmail("")}
            clearable
            error={error}
            onKeyDown={(e) => e.key === "Enter" && check()}
          />
          <Button size="sm" variant="secondary" className="self-start" onClick={check}>Check the flux address</Button>
        </div>
        <TextField label="Call sign" leading={<AtSign />} defaultValue="red-five" disabled hint="Call signs are assigned by Rogue Leader." />
      </div>
      <Variant label="Sizes" className="w-full">
        <TextField size="sm" aria-label="Small" placeholder="Small, for toolbars" containerClassName="w-[200px]" />
        <TextField aria-label="Medium" placeholder="Medium, the default" containerClassName="w-[200px]" />
        <TextField size="lg" aria-label="Large" placeholder="Large, for heroes" containerClassName="w-[220px]" />
      </Variant>
    </Stage>
  );
}

export function TextareaDemo() {
  const [text, setText] = useState("Help me, Obi-Wan Kenobi. You're my only hope.");
  return (
    <Stage align="start">
      <div className="w-full max-w-lg">
        <Textarea label="Message for the R2 unit" value={text} onChange={(e) => setText(e.target.value)} maxLength={280} showCount minRows={2} maxRows={8} hint="Grows as you write, up to eight lines." />
      </div>
      <Variant label="Sizes" className="w-full">
        {(["sm", "md", "lg"] as const).map((sz) => (
          <Textarea key={sz} size={sz} aria-label={`Message, ${sz}`} placeholder={`Message, ${sz}`} minRows={2} containerClassName="w-[200px]" />
        ))}
      </Variant>
    </Stage>
  );
}

export function PasswordDemo() {
  const [pw, setPw] = useState("");
  const [current, setCurrent] = useState("swordfish");
  return (
    <Stage align="start">
      <div className="grid w-full gap-6 md:grid-cols-2">
        <PasswordField label="Current password" value={current} onValueChange={setCurrent} />
        <PasswordField label="New password" value={pw} onValueChange={setPw} meter placeholder="Try Mellon-Speak-Friend-1!" />
      </div>
    </Stage>
  );
}

export function SearchDemo() {
  const [q, setQ] = useState("");
  const all = ["Dilophosaurus", "Velociraptor", "Tyrannosaurus rex", "Triceratops", "Brachiosaurus", "Gallimimus", "Parasaurolophus"];
  const hits = q ? all.filter((a) => a.toLowerCase().includes(q.toLowerCase())) : [];
  return (
    <Stage className="flex-col">
      <div className="w-full max-w-md">
        <SearchField value={q} onValueChange={setQ} placeholder="Search the park's residents" shortcut="/" aria-label="Search the park's residents" />
        <Variant label="Sizes" className="mt-6">
          <SearchField size="sm" aria-label="Small search" className="w-[180px]" />
          <SearchField size="lg" aria-label="Large search" className="w-[220px]" />
        </Variant>
        <p className="mt-3 min-h-5 px-3.5 text-[13px] text-muted" aria-live="polite">
          {q ? (hits.length ? hits.join(" · ") : "Nothing matches. Life finds a way, though.") : "Try “saur”"}
        </p>
      </div>
    </Stage>
  );
}

export function CheckboxDemo() {
  const [terms, setTerms] = useState(false);
  const [news, setNews] = useState(true);
  const [notify, setNotify] = useState<string[]>(["mentions"]);
  return (
    <Stage align="start">
      <div className="grid w-full gap-8 md:grid-cols-2">
        <div className="flex flex-col gap-4">
          <Checkbox checked={terms} onCheckedChange={setTerms} label="I agree to the InGen waiver" />
          <Checkbox checked={news} onCheckedChange={setNews} label="The Daily Prophet, by owl" description="One delivery every morning before breakfast." />
          <Checkbox checked={false} onCheckedChange={() => {}} label="Access to Area 51 hangar 18" description="Not available at your clearance level." disabled />
          <Variant label="Sizes">
            <Checkbox size="sm" defaultChecked label="Small" />
            <Checkbox defaultChecked label="Medium" />
            <Checkbox size="lg" defaultChecked label="Large" />
          </Variant>
        </div>
        <CheckboxGroup
          label="Signal me when"
          value={notify}
          onChange={setNotify}
          selectAllLabel="Every alert"
          options={[
            { value: "mentions", label: "The bat signal is lit" },
            { value: "replies", label: "Slimer is seen on the 12th floor" },
            { value: "assigned", label: "The DeLorean reaches 88 mph" },
            { value: "digest", label: "The Decepticons land" },
          ]}
        />
      </div>
    </Stage>
  );
}

export function RadioDemo() {
  const [ship, setShip] = useState("standard");
  const [plan, setPlan] = useState("studio");
  return (
    <Stage align="start" className="flex-col gap-10">
      <RadioGroup label="Route to Mordor" value={ship} onChange={setShip} options={[
        { value: "standard", label: "Through Moria", description: "Dark, fast, and something is waiting", aside: "40 days" },
        { value: "express", label: "Fly the eagles", description: "Not an option, apparently", aside: "1 day", disabled: true },
        { value: "collect", label: "Over Caradhras", description: "Snow, wind and Saruman's voice", aside: "58 days" },
      ]} className="w-full max-w-md" />
      <RadioGroup variant="card" columns={3} label="Ghostbusters service plan" value={plan} onChange={setPlan} className="w-full" options={[
        { value: "solo", label: "One proton pack", description: "A single bust, one containment unit", aside: "$5,000" },
        { value: "studio", label: "Full crew", description: "Four busters and the Ecto-1, call-outs 24/7", aside: "$12,000" },
        { value: "agency", label: "Citywide", description: "Every borough, plus a Stay Puft clause", aside: "$40,000" },
      ]} />
      <div className="flex flex-wrap gap-10">
        {(["sm", "md", "lg"] as const).map((sz) => (
          <RadioGroup key={sz} size={sz} label={sz === "sm" ? "Small" : sz === "md" ? "Medium" : "Large"} defaultValue="red" options={[
            { value: "red", label: "Red pill" },
            { value: "blue", label: "Blue pill" },
          ]} />
        ))}
      </div>
    </Stage>
  );
}

export function SwitchDemo() {
  const [a, setA] = useState(true);
  const [b, setB] = useState(false);
  const [c, setC] = useState(true);
  return (
    <Stage align="start" className="flex-col gap-6">
      <div className="flex items-center gap-5">
        <Switch size="sm" checked={a} onCheckedChange={setA} />
        <Switch checked={b} onCheckedChange={setB} />
        <Switch size="lg" checked={c} onCheckedChange={setC} />
      </div>
      <div className="flex w-full max-w-md flex-col gap-5">
        <Switch labelFirst checked={a} onCheckedChange={setA} label="Retinal scan at the blast doors" description="Ask for a second check whenever someone boards from a new ship." />
        <Switch labelFirst checked={b} onCheckedChange={setB} label="Show me as in carbonite after 10 minutes" />
        <Switch labelFirst checked={false} onCheckedChange={() => {}} disabled label="Skynet uplink" description="Disabled. We have all seen how that goes." />
      </div>
    </Stage>
  );
}

export function SliderDemo() {
  const [vol, setVol] = useState([7]);
  const [price, setPrice] = useState([40, 180]);
  const [guests, setGuests] = useState([9]);
  return (
    <Stage align="start" className="flex-col gap-10">
      <Slider label="Amp volume" value={vol} onChange={setVol} min={0} max={11} format={(n) => (n === 11 ? "11, one louder" : String(n))} className="max-w-md" />
      <Slider label="Bounty on Han Solo" value={price} onChange={setPrice} min={0} max={300} step={5} format={(n) => `${n}k credits`} className="max-w-md" />
      <Slider label="Members of the Fellowship" value={guests} onChange={setGuests} min={1} max={9} step={1} showTicks className="max-w-md" />
    </Stage>
  );
}

export function NumberDemo() {
  const [qty, setQty] = useState(3);
  const [watts, setWatts] = useState(1.21);
  return (
    <Stage className="gap-10">
      <NumberField label="Proton packs" value={qty} onChange={setQty} min={0} max={4} />
      <NumberField label="Flux capacitor" value={watts} onChange={setWatts} min={0} max={2} step={0.01} suffix="GW" />
      <Variant label="Sizes">
        <NumberField size="sm" defaultValue={2} min={0} />
        <NumberField size="lg" defaultValue={2} min={0} />
      </Variant>
    </Stage>
  );
}

export function OTPDemo() {
  const [code, setCode] = useState("");
  const [state, setState] = useState<"idle" | "ok" | "bad">("idle");
  return (
    <Stage className="flex-col">
      <OTPInput
        value={code}
        onChange={(v) => { setCode(v); setState("idle"); }}
        onComplete={(v) => setState(v === "121985" ? "ok" : "bad")}
        error={state === "bad"}
        label="Enter the code from the clock tower flyer"
      />
      <p className={state === "bad" ? "text-[13px] text-negative" : state === "ok" ? "text-[13px] text-positive" : "text-[13px] text-muted"} aria-live="polite">
        {state === "ok" ? "Great Scott. Verified." : state === "bad" ? "That isn't the date. Try 121985." : "Paste works too. The demo code is 121985."}
      </p>
    </Stage>
  );
}

export function RatingDemo() {
  const [r, setR] = useState(4);
  const [sizes, setSizes] = useState({ sm: 3, md: 4, lg: 5, px: 2 });
  return (
    <Stage className="gap-12">
      <Rating label="Rate your stay at the Overlook" value={r} onChange={setR} labels={["Redrum", "Cold", "All work, no play", "Grand", "Stay forever"]} />
      <Rating label="Average from 1,138 Mos Eisley cantina guests" value={4} readOnly size={20} />
      <Variant label="Custom icon" className="w-full">
        <Rating
          label="How much did you love Ghost in the Shell"
          value={r}
          onChange={setR}
          icons={{ star: <Heart fill="currentColor" />, starOff: <Heart /> }}
        />
      </Variant>
      <Variant label="Sizes" className="w-full">
        <div className="flex flex-wrap items-end gap-x-10 gap-y-6">
        {([["sm", "Jaws"], ["md", "Alien"], ["lg", "Blade Runner"]] as const).map(([sz, film]) => (
          <Rating key={sz} size={sz} label={`${film}, ${sz}`} value={sizes[sz]} onChange={(v) => setSizes((o) => ({ ...o, [sz]: v }))} />
        ))}
        <Rating size={44} label="Tron, 44px" value={sizes.px} onChange={(v) => setSizes((o) => ({ ...o, px: v }))} />
        </div>
      </Variant>
    </Stage>
  );
}

export function SwatchDemo() {
  const [c, setC] = useState("#2f63b0");
  return (
    <Stage>
      <ColorSwatches label="Lightsaber crystal" value={c} onChange={setC} swatches={[
        { value: "#2f63b0", name: "Blue, Obi-Wan" },
        { value: "#1e7b4f", name: "Green, Yoda" },
        { value: "#7a3fb0", name: "Purple, Mace Windu" },
        { value: "#c4242a", name: "Red, Sith" },
        { value: "#a86f0c", name: "Yellow, Temple Guard" },
        { value: "#3d3d3a", name: "Black, the Darksaber" },
        { value: "#e9e4d8", name: "White, Ahsoka", light: true },
      ]} />
    </Stage>
  );
}
