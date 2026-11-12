import { useCallback, useRef, useState } from "react";

/** The size scale every control shares. `md` is always the default. */
export type Size = "sm" | "md" | "lg";

/**
 * One piece of state that works both controlled and uncontrolled.
 *
 * Pass `value` to control it from outside; leave it undefined and pass `defaultValue` to let the
 * component keep it. `onChange` fires either way, with the new value.
 *
 * ```ts
 * const [open, setOpen] = useControllable(props.open, props.defaultOpen ?? false, props.onOpenChange);
 * ```
 */
export function useControllable<T>(value: T | undefined, defaultValue: T, onChange?: (next: T) => void) {
  const [inner, setInner] = useState(defaultValue);
  const controlled = value !== undefined;
  const current = controlled ? value : inner;
  const latest = useRef(current);
  latest.current = current;
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const set = useCallback(
    (next: T | ((prev: T) => T)) => {
      const v = typeof next === "function" ? (next as (prev: T) => T)(latest.current) : next;
      if (Object.is(v, latest.current)) return;
      if (!controlled) setInner(v);
      latest.current = v;
      onChangeRef.current?.(v);
    },
    [controlled],
  );
  return [current, set] as const;
}
