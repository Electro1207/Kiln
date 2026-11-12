import { Children, useRef, type ReactNode } from "react";
import { cn } from "../../cn";
import { useLoop } from "../shared/useLoop";

export type OrbitingCirclesProps = {
  children: ReactNode;
  /** Distance from the centre, px. */
  radius: number;
  /** Seconds for one lap. */
  duration?: number;
  reverse?: boolean;
  /** Size of each orbiting item, px. */
  itemSize?: number;
  /** Draw the orbit's ring. */
  path?: boolean;
  className?: string;
};

/**
 * Items circling a centre. Each lap is one compositor animation per item, so
 * the orbit costs nothing on the main thread; items stay upright, sit still
 * under reduced motion and stop while off-screen. Place inside a relative
 * container and put the centrepiece in its middle.
 */
export function OrbitingCircles({ children, radius, duration = 24, reverse, itemSize = 40, path = true, className }: OrbitingCirclesProps) {
  const root = useRef<HTMLDivElement>(null);
  const items = Children.toArray(children);
  const angle = (i: number) => (360 / items.length) * i;
  const place = (a: number) => `rotate(${a}deg) translateX(${radius}px) rotate(${-a}deg)`;

  useLoop(
    root,
    (el) =>
      Array.from(el.querySelectorAll<HTMLElement>("[data-orbit]")).map((node, i) => {
        const a = angle(i);
        const end = reverse ? a - 360 : a + 360;
        return node.animate([{ transform: place(a) }, { transform: place(end) }], { duration: duration * 1000, iterations: Infinity, easing: "linear" });
      }),
    [items.length, radius, duration, reverse],
  );

  return (
    <div ref={root} aria-hidden className={cn("pointer-events-none absolute inset-0", className)}>
      {path && (
        <span
          className="absolute left-1/2 top-1/2 rounded-full border border-line-strong/70"
          style={{ width: radius * 2, height: radius * 2, marginLeft: -radius, marginTop: -radius }}
        />
      )}
      {items.map((child, i) => (
        <span
          key={i}
          data-orbit
          className="absolute left-1/2 top-1/2 grid place-items-center will-change-transform"
          style={{ width: itemSize, height: itemSize, marginLeft: -itemSize / 2, marginTop: -itemSize / 2, transform: place(angle(i)) }}
        >
          {child}
        </span>
      ))}
    </div>
  );
}
