import { useMemo, type CSSProperties, type ReactNode } from "react";
import { cn } from "../../cn";
import { useTheme } from "../../theme";
import { colorwayColors, colorwayTokens, radiusTokens, type ColorwayTheme, type ColorwayColors } from "../../colorway";

export type ColorwayProps = {
  children?: ReactNode;
  /** The colours, for whichever mode is showing. Pass `colorway` instead to give light and dark their own. */
  colors?: ColorwayColors;
  /** A whole colorway, with light and dark colours (and a radius). Wins over `colors`. */
  colorway?: ColorwayTheme;
  /** Force a mode for this part of the page. Default: the page's mode. */
  mode?: "light" | "dark";
  /** Element to render. Default `div`. */
  as?: "div" | "section" | "article" | "aside" | "header" | "footer";
  className?: string;
  style?: CSSProperties;
  id?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
};

/**
 * Colorways one part of a page in its own colours: pass a ground, an ink and an accent (or a whole
 * colorway), and every Kiln component inside takes them, buttons and focus rings included, worked out
 * so text stays readable. The box itself takes the ground and the ink. Nothing outside changes.
 */
export function Colorway({ children, colors, colorway, mode, as: Tag = "div", className, style, ...rest }: ColorwayProps) {
  const { resolved } = useTheme();
  const m = mode ?? resolved;
  const vars = useMemo(() => {
    const c = colorway ? colorwayColors(colorway, m) : colors;
    if (!c) return {};
    return { ...colorwayTokens(c, m), ...(colorway?.radius != null ? radiusTokens(colorway.radius) : {}) };
  }, [colors, colorway, m]);
  return (
    <Tag {...rest} className={cn("bg-ground text-ink", m === "dark" && "dark", className)} style={{ ...vars, colorScheme: m, ...style } as CSSProperties}>
      {children}
    </Tag>
  );
}
