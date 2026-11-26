import { forwardRef, useEffect, useMemo, useRef, useState, type HTMLAttributes, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Wifi, WifiOff } from "lucide-react";
import { cn } from "../../cn";
import { easeOut, fade, springFirm } from "../../motion";
import { useA11yProps, type AccessibilityFeaturesProp } from "../../a11y";
import { announce } from "../accessibility/announce";

export type ConnectionState = "online" | "offline";

/** Text used by ConnectionStatus. Pass a partial via `labels` to translate or reword. */
export interface ConnectionStatusLabels {
  /** Shown while the connection is down. */
  offline: string;
  /** Shown for a moment once it is back. */
  online: string;
}
export const connectionStatusLabels: ConnectionStatusLabels = { offline: "You are offline. Changes will wait.", online: "Back online" };

/** Icons used by ConnectionStatus. Pass a partial via `icons` to swap any of them. */
export interface ConnectionStatusIcons {
  /** Beside the offline text. */
  offline: ReactNode;
  /** Beside "Back online". */
  online: ReactNode;
}
export const connectionStatusIcons: ConnectionStatusIcons = { offline: <WifiOff />, online: <Wifi /> };

export type ConnectionStatusProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  /** Force the state (to drive it from your own socket or a fetch). Leave out to follow the browser's online and offline events. */
  status?: ConnectionState;
  /** Called whenever the state changes, from the browser or from `status`. */
  onStatusChange?: (status: ConnectionState) => void;
  /** How long "Back online" stays, in ms. Default 2400; three times longer under `extendedTime`. */
  recoveredFor?: number;
  /** "fixed" pins it to the top of the window; "absolute" to the top of the nearest positioned parent. Default fixed. */
  position?: "fixed" | "absolute";
  /** Override any UI text. Merged over `connectionStatusLabels`. */
  labels?: Partial<ConnectionStatusLabels>;
  /** Replace any built-in icon. Merged over `connectionStatusIcons`. */
  icons?: Partial<ConnectionStatusIcons>;
  /** Accessibility features to add for this pill only. Adds to the person's own settings, never removes them. */
  accessibilityFeatures?: AccessibilityFeaturesProp;
};

function useBrowserOnline(enabled: boolean): ConnectionState {
  const [on, setOn] = useState(() => (typeof navigator === "undefined" ? true : navigator.onLine));
  useEffect(() => {
    if (!enabled) return;
    const up = () => setOn(true);
    const down = () => setOn(false);
    window.addEventListener("online", up);
    window.addEventListener("offline", down);
    return () => {
      window.removeEventListener("online", up);
      window.removeEventListener("offline", down);
    };
  }, [enabled]);
  return on ? "online" : "offline";
}

/**
 * A small pill that slides in from the top when the connection drops, and turns into
 * "Back online" for a moment before it fades away. Screen readers get a polite announcement.
 */
export const ConnectionStatus = forwardRef<HTMLDivElement, ConnectionStatusProps>(function ConnectionStatus(
  { status: statusProp, onStatusChange, recoveredFor = 2400, position = "fixed", labels, icons, accessibilityFeatures, className, style, ...rest },
  ref,
) {
  const l = { ...connectionStatusLabels, ...labels };
  const ic = useMemo(() => ({ ...connectionStatusIcons, ...icons }), [icons]);
  const { a11y, rootProps } = useA11yProps(accessibilityFeatures);
  const browser = useBrowserOnline(statusProp === undefined);
  const status = statusProp ?? browser;
  // "Back online" shows only on the way back from offline; derived while rendering, not in an effect.
  const [seen, setSeen] = useState<ConnectionState>(status);
  const [recovered, setRecovered] = useState(false);
  if (seen !== status) {
    setSeen(status);
    setRecovered(status === "online" && seen === "offline");
  }
  const last = useRef<ConnectionState>(status);
  const onChange = useRef(onStatusChange);
  useEffect(() => {
    onChange.current = onStatusChange;
  });

  useEffect(() => {
    if (last.current === status) return;
    const was = last.current;
    last.current = status;
    onChange.current?.(status);
    if (status === "offline") announce(l.offline);
    else if (was === "offline") announce(l.online);
  }, [status, l.offline, l.online]);

  useEffect(() => {
    if (!recovered) return;
    const t = window.setTimeout(() => setRecovered(false), recoveredFor * (a11y.extendedTime ? 3 : 1));
    return () => window.clearTimeout(t);
  }, [recovered, recoveredFor, a11y.extendedTime]);

  const visible = status === "offline" || recovered;
  const showOffline = status === "offline";
  const slide = a11y.reduceMotion ? 0 : -16;

  return (
    <div
      ref={ref}
      {...rest}
      {...rootProps}
      className={cn("pointer-events-none inset-x-0 top-3 z-[60] flex justify-center px-4", position === "fixed" ? "fixed" : "absolute", className)}
      style={{ ...rootProps.style, ...style }}
    >
      <AnimatePresence initial={false}>
        {visible && (
          <motion.div
            key="pill"
            initial={{ opacity: 0, y: slide }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, transition: { duration: 0.24, ease: easeOut } }}
            transition={springFirm}
            className="pointer-events-auto inline-grid max-w-full rounded-full border border-line bg-surface py-2 pl-3 pr-4 text-[0.8438rem] leading-5 text-ink shadow-float [&>*]:[grid-area:1/1]"
          >
            <motion.span
              aria-hidden={!showOffline}
              initial={false}
              animate={{ opacity: showOffline ? 1 : 0 }}
              transition={fade}
              className="flex items-center justify-center gap-2"
            >
              <span className="grid shrink-0 text-warning [&>svg]:size-4" aria-hidden>{ic.offline}</span>
              <span className="min-w-0">{l.offline}</span>
            </motion.span>
            <motion.span
              aria-hidden={showOffline}
              initial={false}
              animate={{ opacity: showOffline ? 0 : 1 }}
              transition={fade}
              className="flex items-center justify-center gap-2"
            >
              <span className="grid shrink-0 text-positive [&>svg]:size-4" aria-hidden>{ic.online}</span>
              <span className="min-w-0">{l.online}</span>
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});
