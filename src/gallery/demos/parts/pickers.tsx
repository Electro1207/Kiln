import { useState } from "react";
import { Map as MapIcon, Moon, Sun, Swords } from "lucide-react";
import { Stage, Variant } from "../../ui";
import { Select } from "../../../kiln/components/pickers/Select";
import { Combobox } from "../../../kiln/components/pickers/Combobox";
import { TagInput } from "../../../kiln/components/pickers/TagInput";
import { Calendar, DatePicker, DateRangePicker, addDays, startOfDay, type DateRange } from "../../../kiln/components/pickers/DatePicker";
import { TimePicker, type Time } from "../../../kiln/components/pickers/TimePicker";
import { FileDropzone } from "../../../kiln/components/pickers/FileDropzone";
import { ChipFilter } from "../../../kiln/components/pickers/ChipFilter";


export function SelectDemo() {
  const [route, setRoute] = useState<string | null>("kessel");
  const [side, setSide] = useState<string | null>(null);
  return (
    <Stage>
      <div className="grid w-full max-w-xl gap-6 sm:grid-cols-2">
        <Select
          label="Hyperspace route"
          value={route}
          onChange={setRoute}
          options={[
            { value: "kessel", label: "Kessel Run", hint: "Under 12 parsecs" },
            { value: "corellian", label: "Corellian Run", hint: "Core to Outer Rim" },
            { value: "hydian", label: "Hydian Way", hint: "Longest trade route" },
            { value: "perlemian", label: "Perlemian Trade Route", hint: "Coruscant to Ossus" },
            { value: "rimma", label: "Rimma Trade Route", hint: "Via Sullust" },
            { value: "maw", label: "Through the Maw", hint: "Closed: black hole cluster", disabled: true },
            { value: "triellus", label: "Triellus Trade Route", hint: "Hutt Space" },
          ]}
        />
        <Select
          label="Allegiance"
          value={side}
          onChange={setSide}
          placeholder="Undecided"
          options={[
            { value: "light", label: "Light side", icon: <Sun /> },
            { value: "dark", label: "Dark side", icon: <Moon /> },
            { value: "smuggler", label: "Just here for the money", icon: <Swords /> },
          ]}
        />
      </div>
      <Variant label="Sizes" className="w-full">
        {(["sm", "md", "lg"] as const).map((sz) => (
          <Select key={sz} size={sz} aria-label={`Ship, ${sz}`} className="w-[200px]" defaultValue="falcon" options={[
            { value: "falcon", label: "Millennium Falcon" },
            { value: "xwing", label: "X-wing" },
            { value: "slave", label: "Firespray" },
          ]} />
        ))}
      </Variant>
    </Stage>
  );
}

const places = [
  ["Hobbiton", "The Shire"], ["Bree", "Eriador"], ["Weathertop", "Eriador"], ["Rivendell", "Eriador"],
  ["Moria", "Misty Mountains"], ["Lothlórien", "Rhovanion"], ["Fangorn", "Rohan"], ["Edoras", "Rohan"],
  ["Helm’s Deep", "Rohan"], ["Isengard", "Nan Curunír"], ["Minas Tirith", "Gondor"], ["Osgiliath", "Gondor"],
  ["Dol Amroth", "Gondor"], ["Minas Morgul", "Mordor"], ["Mount Doom", "Mordor"], ["Erebor", "Rhovanion"],
  ["Mirkwood", "Rhovanion"], ["Grey Havens", "Lindon"],
].map(([label, hint]) => ({ value: label.toLowerCase(), label, hint }));

export function ComboboxDemo() {
  const [place, setPlace] = useState<string | null>(null);
  const picked = places.find((c) => c.value === place);
  return (
    <Stage>
      <div className="flex w-full max-w-sm flex-col gap-3">
        <Combobox
          label="Set out for"
          options={places}
          value={place}
          onChange={setPlace}
          placeholder="Type a place"
          emptyText={(q) => `“${q}” isn’t on any map of Middle-earth`}
        />
        <p className="flex items-center gap-2 text-[13px] text-muted">
          <MapIcon className="size-4 shrink-0" />
          {picked ? (picked.hint === "Mordor" ? "One does not simply walk into Mordor." : `${picked.label}, ${picked.hint}`) : "Try “min”, “ri” or “doom”"}
        </p>
      </div>
      <Variant label="Sizes" className="w-full">
        {(["sm", "md", "lg"] as const).map((sz) => (
          <Combobox key={sz} size={sz} label={`Size ${sz}`} options={places} placeholder={`Place, ${sz}`} className="w-[200px]" />
        ))}
      </Variant>
    </Stage>
  );
}

export function TagInputDemo() {
  const [tags, setTags] = useState(["Piloting", "Droid repair"]);
  return (
    <Stage className="flex-col">
      <div className="w-full max-w-md">
        <TagInput
          label="Crew skills"
          value={tags}
          onChange={setTags}
          max={6}
          placeholder="Add a skill"
          suggestions={["Astrogation", "Blaster marksmanship", "Droid repair", "Hyperdrive tuning", "Lightsaber forms", "Piloting", "Sabacc", "Shyriiwook", "Slicing", "Smuggling"]}
        />
      </div>
      <Variant label="Sizes" className="w-full">
        {(["sm", "md", "lg"] as const).map((sz) => (
          <TagInput key={sz} size={sz} label={`Size ${sz}`} defaultValue={["Sabacc"]} placeholder="Add" className="w-[200px]" />
        ))}
      </Variant>
    </Stage>
  );
}

export function DateDemo() {
  const [date, setDate] = useState<Date | null>(() => new Date(2015, 9, 21));
  const [today] = useState(() => startOfDay(new Date()));
  const [stay, setStay] = useState<DateRange>(() => ({ start: addDays(today, 9), end: addDays(today, 13) }));
  const [flux, setFlux] = useState<Date | null>(() => new Date(1985, 9, 26));
  return (
    <Stage className="flex-col">
      <Variant label="Calendar, uncontrolled (starts on the Enchantment Under the Sea dance) and controlled (you own the date)" className="w-full">
        <Calendar defaultValue={new Date(1955, 10, 12)} defaultMonth={new Date(1955, 10, 1)} />
        <div className="flex flex-col items-center gap-2">
          <Calendar value={flux} onChange={setFlux} />
          <button type="button" onClick={() => setFlux(new Date(1985, 9, 26))} className="text-xs text-muted underline underline-offset-2 hover:text-ink">Reset to October 26, 1985</button>
        </div>
      </Variant>
      <div className="grid w-full max-w-xl gap-6 sm:grid-cols-2">
        <DatePicker label="Destination time" value={date} onChange={setDate} />
        <DateRangePicker label="Isla Nublar visit" value={stay} onChange={setStay} min={today} />
      </div>
      <Variant label="Sizes" className="w-full">
        {(["sm", "md", "lg"] as const).map((sz) => (
          <DatePicker key={sz} size={sz} placeholder={`Date, ${sz}`} className="w-[200px]" />
        ))}
      </Variant>
    </Stage>
  );
}

export function TimeDemo() {
  const [t, setT] = useState<Time | null>({ hours: 22, minutes: 4 });
  return (
    <Stage className="flex-col">
      <div className="w-full max-w-56">
        <TimePicker label="Lightning strikes the clock tower" value={t} onChange={setT} minuteStep={1} />
      </div>
      <p className="text-[13px] text-muted">Hill Valley, Saturday 12 November 1955</p>
      <Variant label="Sizes" className="w-full">
        {(["sm", "md", "lg"] as const).map((sz) => (
          <TimePicker key={sz} size={sz} placeholder={`Time, ${sz}`} className="w-[200px]" />
        ))}
      </Variant>
    </Stage>
  );
}

export function DropzoneDemo() {
  return (
    <Stage>
      <div className="w-full max-w-lg">
        <FileDropzone accept="image/*,.pdf" maxSize={10 * 1024 * 1024} label="Drop the Death Star plans here or browse" />
      </div>
    </Stage>
  );
}

export function ChipDemo() {
  const [many, setMany] = useState<string[]>(["autobot"]);
  const [one, setOne] = useState<string | null>("red");
  return (
    <Stage align="start">
      <div className="flex flex-col gap-6">
        <Variant label="Several at once">
          <ChipFilter
            label="Faction"
            value={many}
            onChange={setMany}
            options={[
              { value: "autobot", label: "Autobots", count: 24 },
              { value: "decepticon", label: "Decepticons", count: 19 },
              { value: "dinobot", label: "Dinobots", count: 5 },
              { value: "maximal", label: "Maximals", count: 8 },
            ]}
          />
        </Variant>
        <Variant label="One at a time">
          <ChipFilter
            multiple={false}
            label="Pill"
            value={one}
            onChange={setOne}
            options={[
              { value: "red", label: "Red pill" },
              { value: "blue", label: "Blue pill" },
            ]}
          />
        </Variant>
      </div>
    </Stage>
  );
}
