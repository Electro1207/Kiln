import { createContext, useContext } from "react";
import type { StudioTheme } from "./tokens";

export type Ctx = { theme: StudioTheme; setTheme: (t: StudioTheme) => void; reset: () => void; edited: boolean };
export const StudioContext = createContext<Ctx | null>(null);

export function useStudio() {
  const c = useContext(StudioContext);
  if (!c) throw new Error("useStudio needs <StudioProvider>");
  return c;
}
