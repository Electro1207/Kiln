import { useState, type HTMLAttributes, type ReactNode, type Ref } from "react";
import { motion } from "motion/react";
import { cn } from "../../cn";
import { springFirm } from "../../motion";

export type AvatarSize = "sm" | "md" | "lg";
export type AvatarStatus = "online" | "away" | "busy" | "offline";

/** Text used by Avatar. Pass a partial via `labels` to translate or reword. */
export interface AvatarLabels {
  /** Presence names by status. */
  status: Record<AvatarStatus, string>;
  /** Accessible name when a status is set. */
  nameWithStatus: (name: string, status: string) => string;
}
export const avatarLabels: AvatarLabels = {
  status: { online: "online", away: "away", busy: "busy", offline: "offline" },
  nameWithStatus: (name, status) => `${name}, ${status}`,
};

export type AvatarProps = Omit<HTMLAttributes<HTMLSpanElement>, "children"> & {
  /** Used for the initials, the colour and the accessible name. */
  name: string;
  /** Photo; the initials show until it loads, and stay if it fails. */
  src?: string;
  /** `sm` 28px, `md` 36px, `lg` 48px, or any number of pixels. */
  size?: AvatarSize | number;
  status?: AvatarStatus;
  ref?: Ref<HTMLSpanElement>;
  /** Override any UI text. Merged over `avatarLabels`. */
  labels?: Partial<AvatarLabels>;
};

/** Inline style and dot size for a numeric avatar size. */
function custom(px: number) {
  return { style: { width: px, height: px, fontSize: Math.round(px * 0.38) }, dot: px < 32 ? "size-2" : px < 44 ? "size-2.5" : "size-3" };
}

const sizes: Record<AvatarSize, string> = {
  sm: "size-7 text-[11px]",
  md: "size-9 text-[13px]",
  lg: "size-12 text-base",
};
const dot: Record<AvatarSize, string> = { sm: "size-2", md: "size-2.5", lg: "size-3" };
const statusColour: Record<AvatarStatus, string> = {
  online: "bg-positive",
  away: "bg-warning",
  busy: "bg-negative",
  offline: "bg-faint",
};

/** A stable hue per name, so a person keeps their colour everywhere. */
export function hueFor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 360;
  return h;
}

export function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
}

/** A person's photo, or their initials on a colour of their own. */
export function Avatar({ name, src, size = "md", status, className, ref, labels, ...rest }: AvatarProps) {
  const l = { ...avatarLabels, ...labels };
  const num = typeof size === "number" ? custom(size) : null;
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const hue = hueFor(name);
  return (
    <span ref={ref} {...rest} className={cn("relative inline-flex shrink-0", className)}>
      <span
        className={cn("relative grid place-items-center overflow-hidden rounded-full font-medium", num ? "" : sizes[size as AvatarSize])}
        style={{
          ...num?.style,
          backgroundColor: `light-dark(hsl(${hue} 60% 90%), hsl(${hue} 30% 24%))`,
          color: `light-dark(hsl(${hue} 45% 28%), hsl(${hue} 60% 84%))`,
        }}
        role="img"
        aria-label={status ? l.nameWithStatus(name, l.status[status]) : name}
      >
        <span aria-hidden>{initials(name)}</span>
        {src && !failed && (
          <motion.img decoding="async"
            src={src}
            alt=""
            width={num ? size as number : 48}
            height={num ? size as number : 48}
            className="absolute inset-0 size-full object-cover"
            initial={false}
            animate={{ opacity: loaded ? 1 : 0 }}
            transition={{ duration: 0.3 }}
            onLoad={() => setLoaded(true)}
            onError={() => setFailed(true)}
            ref={(el) => {
              if (el?.complete && el.naturalWidth > 0 && !loaded) setLoaded(true);
            }}
          />
        )}
      </span>
      {status && (
        <span
          aria-hidden
          className={cn("absolute bottom-0 right-0 rounded-full ring-2 ring-surface", num ? num.dot : dot[size as AvatarSize], statusColour[status])}
        />
      )}
    </span>
  );
}

/** Text used by AvatarGroup. Pass a partial via `labels` to translate or reword. */
export interface AvatarGroupLabels {
  /** aria-label of the group, given the people count and their names. */
  people: (count: number, names: string[]) => string;
}
export const avatarGroupLabels: AvatarGroupLabels = { people: (count, names) => `${count} people: ${names.join(", ")}` };

export type AvatarGroupProps = {
  people: { name: string; src?: string }[];
  max?: number;
  size?: AvatarSize;
  className?: string;
  extra?: ReactNode;
  /** Override any UI text. Merged over `avatarGroupLabels`. */
  labels?: Partial<AvatarGroupLabels>;
};

/** Overlapping avatars that fan out on hover or focus. The hover zone is the
    fanned-out width, reserved up front, so spreading never moves an avatar out
    from under the pointer. */
export function AvatarGroup({ people, max = 5, size = "md", className, labels }: AvatarGroupProps) {
  const l = { ...avatarGroupLabels, ...labels };
  const [open, setOpen] = useState(false);
  const shown = people.slice(0, max);
  const rest = people.length - shown.length;
  const px = size === "sm" ? 28 : size === "md" ? 36 : 48;
  const overlap = size === "sm" ? 8 : size === "md" ? 10 : 14;
  const spread = overlap - 2;
  const count = shown.length + (rest > 0 ? 1 : 0);
  const reserve = (count - 1) * spread;
  return (
    <div
      className={cn("relative inline-flex items-center rounded-full", className)}
      style={{ paddingRight: reserve }}
      onPointerEnter={() => setOpen(true)}
      onPointerLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
      tabIndex={0}
      role="group"
      aria-label={l.people(people.length, people.map((p) => p.name))}
    >
      {shown.map((p, i) => (
        <motion.span
          key={p.name}
          className="relative inline-flex rounded-full ring-2 ring-surface"
          style={{ zIndex: count - i, marginLeft: i === 0 ? 0 : -overlap }}
          initial={false}
          animate={{ x: open ? i * spread : 0 }}
          transition={springFirm}
        >
          <Avatar name={p.name} src={p.src} size={size} />
        </motion.span>
      ))}
      {rest > 0 && (
        <motion.span
          className="tabular relative inline-flex items-center justify-center rounded-full bg-btn-secondary font-medium text-btn-secondary-ink ring-2 ring-surface"
          style={{ marginLeft: -overlap, width: px, height: px, fontSize: size === "lg" ? 15 : size === "md" ? 12 : 10.5 }}
          initial={false}
          animate={{ x: open ? shown.length * spread : 0 }}
          transition={springFirm}
          aria-hidden
        >
          +{rest}
        </motion.span>
      )}
    </div>
  );
}
