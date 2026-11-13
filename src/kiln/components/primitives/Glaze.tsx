import { useMemo, type CSSProperties, type ReactNode } from "react";
import { cn } from "../../cn";
import { useTheme } from "../../theme";
import { glazeColors, glazeTokens, radiusTokens, type GlazeTheme, type GlazeColors } from "../../glaze";

export type GlazeProps = {
  children?: ReactNode;
  /** The colours, for whichever mode is showing. Pass `glaze` instead to give light and dark their own. */
  colors?: GlazeColors;
  /** A whole glaze, with light and dark colours (and a radius). Wins over `colors`. */
  glaze?: GlazeTheme;
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
 * Glazes one part of a page in its own colours: pass a ground, an ink and an accent (or a whole
 * glaze), and every Kiln component inside takes them, buttons and focus rings included, worked out
 * so text stays readable. The box itself takes the ground and the ink. Nothing outside changes.
 */
export function Glaze({ children, colors, glaze, mode, as: Tag = "div", className, style, ...rest }: GlazeProps) {
  const { resolved } = useTheme();
  const m = mode ?? resolved;
  const vars = useMemo(() => {
    const c = glaze ? glazeColors(glaze, m) : colors;
    if (!c) return {};
    return { ...glazeTokens(c, m), ...(glaze?.radius != null ? radiusTokens(glaze.radius) : {}) };
  }, [colors, glaze, m]);
  return (
    <Tag {...rest} className={cn("bg-ground text-ink", m === "dark" && "dark", className)} style={{ ...vars, colorScheme: m, ...style } as CSSProperties}>
      {children}
    </Tag>
  );
}
