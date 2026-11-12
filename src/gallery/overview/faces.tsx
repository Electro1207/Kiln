import { CircleAlert, CircleCheck, CornerDownLeft, Info, Search } from "lucide-react";
import { Switch } from "../../kiln/components/choice-controls/Switch";
import { Kbd } from "../../kiln/components/data-display/Kbd";
import { cn } from "../../kiln/cn";
import { noop, pick } from "./helpers";

export function Switchboard({ tick }: { tick: number }) {
  return <Switch checked={tick % 2 === 0} onCheckedChange={noop} label="Flux capacitor" description="Needs 1.21 gigawatts" labelFirst />;
}

export function Palette({ tick }: { tick: number }) {
  const rows = [["Open the pod bay doors", "HAL"], ["Take the red pill", "↵"], ["Set the time circuits", "T"]];
  return (
    <div className="-mx-1 space-y-1">
      <div className="flex items-center gap-2 rounded-control bg-raised px-2.5 py-2 text-[13px] text-muted">
        <Search className="size-4" /> Search the galaxy…
      </div>
      {rows.map(([label, key], i) => (
        <div key={label} className={cn("flex items-center justify-between rounded-control px-2.5 py-1.5 text-[13px] transition-colors duration-200", i === tick % 3 ? "bg-active text-ink" : "text-muted")}>
          <span className="truncate">{label}</span>
          {i === tick % 3 ? <CornerDownLeft className="size-3.5" /> : <Kbd size="sm">{key}</Kbd>}
        </div>
      ))}
    </div>
  );
}

const TOASTS = [
  { icon: <CircleCheck className="size-4 text-positive" />, title: "Ring destroyed", note: "Mount Doom has seen better days." },
  { icon: <Info className="size-4 text-info" />, title: "Warp drive charged", note: "Make it so, Number One." },
  { icon: <CircleAlert className="size-4 text-warning" />, title: "Shields at 12%", note: "Pulling out of the asteroid field." },
];

export function ToastCard({ tick }: { tick: number }) {
  const t = pick(TOASTS, tick);
  return (
    <div className="flex items-start gap-3 rounded-[10px] bg-elevated p-3">
      <span className="mt-0.5">{t.icon}</span>
      <div className="min-w-0">
        <p className="text-[13.5px] font-medium leading-tight">{t.title}</p>
        <p className="mt-0.5 text-[12.5px] leading-snug text-muted">{t.note}</p>
      </div>
    </div>
  );
}
