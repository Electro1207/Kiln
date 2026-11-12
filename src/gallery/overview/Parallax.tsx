import { useRef, type ImgHTMLAttributes } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { cn } from "../../kiln/cn";
import { useScenes, useSheet } from "./sheet";

/** A photograph that drifts inside its frame as the frame crosses the sheet: the window moves, the view lags. */
export function ParallaxImg({ className, depth = 0.08, ...img }: ImgHTMLAttributes<HTMLImageElement> & { depth?: number }) {
  const box = useRef<HTMLDivElement>(null);
  const sheet = useSheet(box);
  const scenes = useScenes();
  const { scrollYProgress } = useScroll({ target: box, container: sheet, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [`${-depth * 100}%`, `${depth * 100}%`]);
  return (
    <div ref={box} className="absolute inset-0 overflow-hidden">
      {scenes ? (
        <motion.img decoding="async" loading="lazy" {...(img as object)} className={cn("size-full object-cover", className)} style={{ y, scale: 1 + depth * 2.2, willChange: "transform" }} />
      ) : (
        <img decoding="async" loading="lazy" {...img} className={cn("size-full object-cover", className)} />
      )}
    </div>
  );
}
