import { useState } from "react";
import { motion } from "motion/react";
import { cn } from "../../cn";
import { easeOut } from "../../motion";

export type AspectImageProps = {
  src: string;
  alt: string;
  /** width / height, e.g. 16 / 9. */
  ratio?: number;
  /** A tiny version of the same picture (about 24px wide), shown blurred until the real one arrives. */
  placeholder?: string;
  width?: number;
  height?: number;
  rounded?: boolean;
  caption?: string;
  className?: string;
};

/**
 * Reserves its space before the picture loads (no layout shift), shows a
 * blurred thumbnail, then fades the sharp picture in over it.
 */
export function AspectImage({ src, alt, ratio = 16 / 9, placeholder, width = 1200, height, rounded = true, caption, className }: AspectImageProps) {
  const [loaded, setLoaded] = useState(false);
  const img = (
    <div className={cn("relative w-full overflow-hidden bg-raised", rounded && "rounded-card", className)} style={{ aspectRatio: ratio }}>
      {placeholder && (
        <img decoding="async"
          src={placeholder}
          alt=""
          aria-hidden
          className="absolute inset-0 size-full scale-110 object-cover blur-xl"
          width={24}
          height={Math.round(24 / ratio)}
        />
      )}
      <motion.img
        src={src}
        alt={alt}
        width={width}
        height={height ?? Math.round(width / ratio)}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
        ref={(el) => {
          if (el?.complete && el.naturalWidth > 0 && !loaded) setLoaded(true);
        }}
        className="absolute inset-0 size-full object-cover"
        initial={false}
        animate={{ opacity: loaded ? 1 : 0, scale: loaded ? 1 : 1.03 }}
        transition={{ duration: 0.7, ease: easeOut }}
      />
    </div>
  );
  if (!caption) return img;
  return (
    <figure className="flex w-full flex-col gap-2">
      {img}
      <figcaption className="text-xs text-muted">{caption}</figcaption>
    </figure>
  );
}
