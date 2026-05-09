/**
 * Capture marketing screenshots for the Sentry homepage.
 *
 * Usage:
 *   1. In one terminal:  npm run dev
 *   2. In another:       SCREENSHOT_PASSWORD='your-password' npm run screenshots
 *
 * What it does:
 *   - Launches Chromium at 1440x900
 *   - Signs in with SENTRY_AUTH_USER_EMAIL + SCREENSHOT_PASSWORD
 *   - For each module in MODULES, clicks the sidebar item and saves a PNG
 *   - Output goes to public/marketing/screenshots/{filename}.png
 *
 * Note:
 *   Most modules need onboarding completed and some seed data to look
 *   meaningful. Run through the app once before capturing so the modules
 *   have something to show.
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { config as loadEnv } from "dotenv";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
loadEnv({ path: join(ROOT, ".env") });

const BASE = process.env.SENTRY_BASE_URL || "http://localhost:3000";
const EMAIL = process.env.SENTRY_AUTH_USER_EMAIL;
const PASSWORD = process.env.SCREENSHOT_PASSWORD;
const OUT_DIR = join(ROOT, "public", "marketing", "screenshots");

if (!EMAIL || !PASSWORD) {
  console.error("Missing SENTRY_AUTH_USER_EMAIL (in .env) or SCREENSHOT_PASSWORD (in shell env).");
  process.exit(1);
}

mkdirSync(OUT_DIR, { recursive: true });

// All 18 modules. Sidebar labels exactly as rendered (see src/data/nav.ts).
// "file" is the output filename keyed by module id for stable references.
const MODULES = [
  { label: "Dashboard", file: "dashboard.png" },
  { label: "Threat Intel", file: "threatintel.png" },
  { label: "Organization", file: "onboard.png" },
  { label: "Assessment", file: "assessment.png" },
  { label: "IR Planner", file: "irplan.png" },
  { label: "Stakeholders", file: "stakeholders.png" },
  { label: "Policies", file: "policies.png" },
  { label: "Commander", file: "commander.png" },
  { label: "Incident Log", file: "incidentlog.png" },
  { label: "Tasks", file: "tasks.png" },
  { label: "Tickets", file: "tickets.png" },
  { label: "Forensics", file: "forensics.png" },
  { label: "Playbooks", file: "playbooks.png" },
  { label: "Tabletop", file: "tabletop.png" },
  { label: "Pen Testing", file: "pentesting.png" },
  { label: "Integrations", file: "integrations.png" },
  { label: "Communications", file: "comms.png" },
  { label: "Access Control", file: "access.png" },
];

async function main() {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();

  console.log("→ Signing in at", BASE + "/login");
  await page.goto(BASE + "/login", { waitUntil: "networkidle" });
  await page.locator('input[type="email"]').fill(EMAIL);
  await page.locator('input[autocomplete="current-password"]').fill(PASSWORD);
  await Promise.all([
    page.waitForURL(/\/app/, { timeout: 15000 }),
    page.getByRole("button", { name: /sign in/i }).click(),
  ]);
  console.log("✓ Authenticated");

  // Marketing homepage shot
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await page.waitForTimeout(400);
  await page.screenshot({ path: join(OUT_DIR, "homepage.png"), fullPage: false });
  console.log("✓ homepage.png");

  // Each module
  await page.goto(BASE + "/app", { waitUntil: "networkidle" });
  for (const m of MODULES) {
    try {
      const link = page.getByRole("button", { name: new RegExp("^" + m.label + "$", "i") })
        .or(page.locator(`text=${m.label}`).first());
      await link.first().click({ timeout: 6000 });
      await page.waitForTimeout(700);
      await page.screenshot({ path: join(OUT_DIR, m.file) });
      console.log(`✓ ${m.file}`);
    } catch (err) {
      console.warn(`  – Skipped ${m.label}: ${err.message.split("\n")[0]}`);
    }
  }

  await browser.close();
  console.log("\nDone. Files written to public/marketing/screenshots/");
  console.log("Reload the homepage; the showcase will pick them up automatically.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
