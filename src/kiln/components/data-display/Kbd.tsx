import { useEffect, useState, type HTMLAttributes, type ReactNode, type Ref } from "react";
import { cn } from "../../cn";
import type { Size } from "../../controllable";

export type KbdProps = Omit<HTMLAttributes<HTMLElement>, "children"> & {
  children: ReactNode;
  /** A KeyboardEvent.key to listen for; the key dips while it is held. */
  listen?: string;
  /** Height and text size. Defaults to md. */
  size?: Size;
  ref?: Ref<HTMLElement>;
};

const kbdSizes: Record<Size, string> = {
  sm: "h-5 min-w-5 px-1 text-[11px]",
  md: "h-6 min-w-6 px-1.5 text-xs",
  lg: "h-7 min-w-7 px-2 text-[13px]",
};

/** A keyboard key. With `listen`, it presses down when you press the real key. Other props go to the `<kbd>`. */
export function Kbd({ children, listen, size = "md", className, ref, ...rest }: KbdProps) {
  const [down, setDown] = useState(false);
  useEffect(() => {
    if (!listen) return;
    const match = (e: KeyboardEvent) => e.key.toLowerCase() === listen.toLowerCase();
    const d = (e: KeyboardEvent) => match(e) && setDown(true);
    const u = (e: KeyboardEvent) => match(e) && setDown(false);
    const reset = () => setDown(false);
    window.addEventListener("keydown", d);
    window.addEventListener("keyup", u);
    window.addEventListener("blur", reset);
    return () => {
      window.removeEventListener("keydown", d);
      window.removeEventListener("keyup", u);
      window.removeEventListener("blur", reset);
    };
  }, [listen]);
  return (
    <kbd
      ref={ref}
      {...rest}
      className={cn(
        "inline-flex items-center justify-center rounded-[6px] border border-b-2 border-line-strong bg-surface font-sans font-medium text-muted",
        kbdSizes[size],
        "transition-[background-color,color,border-color] duration-100 ease-out-soft",
        down && "border-b-line bg-raised text-ink",
        className,
      )}
    >
      <span className={cn("inline-block transition-transform duration-100 ease-out-soft", down && "translate-y-px")}>{children}</span>
    </kbd>
  );
}
