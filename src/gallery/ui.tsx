/* Layout helpers for demos only. Not part of the library. */
import { forwardRef, type ReactNode } from "react";
import { Button, type ButtonProps } from "../kiln/components/buttons/Button";
import { IconButton, type IconButtonProps } from "../kiln/components/buttons/IconButton";
import { useToast } from "../kiln/components/notices/Toast";
import { cn } from "../kiln/cn";

/** The well a demo sits in. Centres its content and wraps on small screens. */
export function Stage({ children, className, align = "center" }: { children: ReactNode; className?: string; align?: "center" | "start" }) {
  return (
    <div
      className={cn(
        "flex min-h-40 flex-wrap gap-4 rounded-card bg-raised p-5 sm:p-8",
        align === "center" ? "items-center justify-center" : "items-start justify-start",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** A labelled group of variants inside a Stage. */
export function Variant({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-3", className)}>
      <span className="text-xs text-muted">{label}</span>
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </div>
  );
}

const QUIPS = [
  "Roads? Where we're going, we don't need roads.",
  "I'll be back.",
  "Do. Or do not. There is no try.",
  "Life, uh, finds a way.",
  "I have a bad feeling about this.",
  "Nobody puts Baby in a corner.",
  "Say hello to my little friend.",
  "I love the smell of napalm in the morning.",
];
const quip = (label: string) => QUIPS[[...label].reduce((a, c) => a + c.charCodeAt(0), 0) % QUIPS.length];

/** A demo button that answers a click with a toast, so a button that stands for an action still does something. */
export const Btn = forwardRef<HTMLButtonElement, ButtonProps & { children?: ReactNode; say?: string }>(function Btn({ say, children, onClick, ...rest }, ref) {
  const { toast } = useToast();
  const label = say ?? (typeof children === "string" ? children : "Done");
  return <Button ref={ref} {...rest} onClick={(e) => { onClick?.(e); toast({ title: label, description: quip(label) }); }}>{children}</Button>;
});

/** The icon-only version of Btn; the toast is named after the aria-label. */
export const IBtn = forwardRef<HTMLButtonElement, IconButtonProps>(function IBtn({ onClick, ...props }, ref) {
  const { toast } = useToast();
  const label = props["aria-label"] ?? "Done";
  return <IconButton ref={ref} {...props} onClick={(e) => { onClick?.(e); toast({ title: label, description: quip(label) }); }} />;
});
