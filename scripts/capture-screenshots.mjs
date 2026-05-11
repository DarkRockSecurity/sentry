/**
 * Capture marketing screenshots for the Sentry homepage.
 *
 * Usage:
 *   1. In one terminal:  npm run dev
 *   2. In another:       npm run screenshots
 *      (SENTRY_AUTH_USER_EMAIL + SCREENSHOT_PASSWORD must be in .env;
 *       scripts/create-accounts.mjs populates both.)
 *
 * What it does:
 *   - Launches Chromium at 1440x900
 *   - Signs in via Supabase password auth
 *   - For each module, navigates via window.__sentryStore.setState({ page })
 *     (the in-app router uses Zustand state, not URL routing — DOM-based
 *     sidebar clicks are fragile because lucide icons add accessible text)
 *   - Output goes to public/marketing/screenshots/{file}.png
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
  console.error("Missing SENTRY_AUTH_USER_EMAIL or SCREENSHOT_PASSWORD in .env.");
  console.error("Run: node scripts/create-accounts.mjs");
  process.exit(1);
}

mkdirSync(OUT_DIR, { recursive: true });

// Module id matches the Zustand `page` state and the sidebar item ids.
const MODULES = [
  { id: "dash",         file: "dashboard.png" },
  { id: "threatintel",  file: "threatintel.png" },
  { id: "onboard",      file: "onboard.png" },
  { id: "assess",       file: "assessment.png" },
  { id: "irplan",       file: "irplan.png" },
  { id: "stakeholders", file: "stakeholders.png" },
  { id: "policies",     file: "policies.png" },
  { id: "commander",    file: "commander.png" },
  { id: "incidentlog",  file: "incidentlog.png" },
  { id: "tasks",        file: "tasks.png" },
  { id: "tickets",      file: "tickets.png" },
  { id: "forensics",    file: "forensics.png" },
  { id: "playbooks",    file: "playbooks.png" },
  { id: "tabletop",     file: "tabletop.png" },
  { id: "pentesting",   file: "pentesting.png" },
  { id: "integrations", file: "integrations.png" },
  { id: "comms",        file: "comms.png" },
  { id: "access",       file: "access.png" },
];

async function main() {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();

  console.log(`→ Signing in at ${BASE}/login as ${EMAIL}`);
  await page.goto(BASE + "/login", { waitUntil: "networkidle" });
  await page.locator('input[type="email"]').fill(EMAIL);
  await page.locator('input[autocomplete="current-password"]').fill(PASSWORD);
  await Promise.all([
    page.waitForURL(/\/app/, { timeout: 15000 }),
    page.getByRole("button", { name: /sign in/i }).click(),
  ]);
  console.log("✓ Authenticated");

  // Wait for the app to fully hydrate (TenantStateProvider exposes __sentryStore).
  await page.waitForFunction(() => !!window.__sentryStore, { timeout: 15000 });
  console.log("✓ Store handle available");

  // Marketing homepage shot
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  await page.screenshot({ path: join(OUT_DIR, "homepage.png"), fullPage: false });
  console.log("✓ homepage.png");

  // Each module — navigate via the store, not DOM clicks
  await page.goto(BASE + "/app", { waitUntil: "networkidle" });
  await page.waitForFunction(() => !!window.__sentryStore, { timeout: 15000 });

  // Make sure the sidebar is open and groups are expanded so screenshots
  // reflect what an active user sees.
  await page.evaluate(() => {
    const s = window.__sentryStore;
    s.setState({ sidebarOpen: true, collapsedGroups: {} });
  });

  let ok = 0, fail = 0;
  for (const m of MODULES) {
    try {
      await page.evaluate((id) => window.__sentryStore.setState({ page: id }), m.id);
      // Give modules with charts / async fetches a moment to settle.
      await page.waitForTimeout(900);
      await page.screenshot({ path: join(OUT_DIR, m.file) });
      console.log(`✓ ${m.file}`);
      ok++;
    } catch (err) {
      console.warn(`  – Skipped ${m.id}: ${(err && err.message ? err.message : err).toString().split("\n")[0]}`);
      fail++;
    }
  }

  await browser.close();
  console.log(`\nDone. ${ok} captured, ${fail} skipped.`);
  console.log(`Files in public/marketing/screenshots/`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
