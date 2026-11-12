/* Infinite decorative loops (orbits, beams, carets) run as Web Animations so
   transform and opacity loops stay on the compositor. They pause while their
   root is off-screen and never start under reduced motion. */

import { useEffect, useState, type RefObject } from "react";

export function usePrefersReducedMotion() {
  const [reduce, setReduce] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const on = () => setReduce(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return reduce;
}

/** True while the element is at least partly on screen. */
export function useOnScreen(ref: RefObject<Element | null>, margin = "80px") {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setOn(e.isIntersecting), { rootMargin: margin });
    io.observe(el);
    return () => io.disconnect();
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
  const reduce = usePrefersReducedMotion();
  const visible = useOnScreen(root);
  const [anims, setAnims] = useState<Animation[]>([]);

  useEffect(() => {
    const el = root.current;
    if (!el || reduce || typeof el.animate !== "function") return;
    const list = setup(el);
    for (const a of list) a.pause();
    setAnims(list);
    return () => {
      for (const a of list) a.cancel();
      setAnims([]);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduce, ...deps]);

  useEffect(() => {
    for (const a of anims) {
      if (visible) a.play();
      else a.pause();
    }
  }, [visible, anims]);

  return { reduce, visible };
}
