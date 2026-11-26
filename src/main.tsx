import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { MotionConfig } from "motion/react";
import "./index.css";
import { ThemeProvider } from "./kiln/theme";
import { AccessibilityProvider } from "./kiln/a11y";
import App from "./gallery/App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <MotionConfig reducedMotion="user">
        <AccessibilityProvider>
          <App />
        </AccessibilityProvider>
      </MotionConfig>
    </ThemeProvider>
  </StrictMode>,
);
