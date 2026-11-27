import { defineConfig, devices } from "@playwright/test";

/* Smoke test of every gallery demo. `npm run test:smoke` builds the site, serves dist on :5199
   and loads each gallery page in light, dark and at phone width. */
export default defineConfig({
  testDir: "tests",
  testMatch: "*.spec.ts",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  timeout: 60_000,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: { baseURL: "http://localhost:5199", trace: "retain-on-failure" },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run build && npx vite preview --port 5199 --strictPort",
    url: "http://localhost:5199/sitemap.xml",
    reuseExistingServer: !process.env.CI,
    timeout: 300_000,
  },
});
