/* Infinite decorative loops (orbits, beams, carets) run as Web Animations so
   transform and opacity loops stay on the compositor. They pause while their
   root is off-screen and never start under reduced motion or calm.

   Every instance on a page shares one IntersectionObserver (per margin) and, through useA11y,
   one set of system listeners, so a table of 200 spinners costs one observer, not 200. */

import { useEffect, useRef, useState, type RefObject } from "react";
import { useA11y } from "../../a11y";

/** True when motion should be reduced: the system asks for it, or the person (AccessibilityMenu),
    a scope or the component's own `accessibilityFeatures` does. */
export function usePrefersReducedMotion() {
  return useA11y().reduceMotion;
}

type Shared = { io: IntersectionObserver; subs: Map<Element, Set<(on: boolean) => void>> };
const observers = new Map<string, Shared>();

function watch(el: Element, margin: string, cb: (on: boolean) => void) {
  let shared = observers.get(margin);
  if (!shared) {
    const subs: Shared["subs"] = new Map();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) subs.get(e.target)?.forEach((f) => f(e.isIntersecting));
      },
      { rootMargin: margin },
    );
    shared = { io, subs };
    observers.set(margin, shared);
  }
  const { io, subs } = shared;
  let set = subs.get(el);
  if (!set) {
    set = new Set();
    subs.set(el, set);
    io.observe(el);
  } else {
    // A second watcher of the same element still needs its first answer.
    io.unobserve(el);
    io.observe(el);
  }
  set.add(cb);
  return () => {
    set.delete(cb);
    if (set.size) return;
    subs.delete(el);
    io.unobserve(el);
    if (subs.size === 0) {
      io.disconnect();
      observers.delete(margin);
    }
  };
}

/** True while the element is at least partly on screen. */
export function useOnScreen(ref: RefObject<Element | null>, margin = "80px") {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    return watch(el, margin, setOn);
  }, [ref, margin]);
  return on;
}

/**
 * Starts the animations `setup` returns, plays them only while `root` is on
 * screen, and cancels them on unmount or when `deps` change.
 */
export function useLoop(
  root: RefObject<Element | null>,
  setup: (root: Element) => Animation[],
  deps: unknown[],
) {
  // Calm holds loops still too: nothing moves on its own.
  const a11y = useA11y();
  const reduce = a11y.reduceMotion || a11y.calm;
  const visible = useOnScreen(root);
  const shown = useRef(visible);
  shown.current = visible;
  const anims = useRef<Animation[]>([]);

  useEffect(() => {
    const el = root.current;
    if (!el || reduce || typeof el.animate !== "function") return;
    const list = setup(el);
    if (!shown.current) for (const a of list) a.pause();
    anims.current = list;
    return () => {
      for (const a of list) a.cancel();
      anims.current = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduce, ...deps]);

  useEffect(() => {
    for (const a of anims.current) {
      if (visible) a.play();
      else a.pause();
    }
  }, [visible]);

  return { reduce, visible };
}
