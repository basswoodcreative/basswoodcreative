// Dev-only: the exhibit capture pipeline, proven 2026-07-07 (record: bwc
// vault, "Phase 5 / 54"). Recaptures the live-product screenshots for the
// Selected Work exhibits and stages them in design/assets/ + public/work/.
// Captures are claims: eyeball each output before committing, and update
// the FIG. captions' dates in app/components/work.tsx to the capture date.
//
// Needs Playwright:
//   npm i -D playwright && npx playwright install chromium
//
// Not captured here: chat-assistant.jpg — the chatbot ships to non-U.S.
// markets only and this pipeline runs from a U.S. egress (the app's
// /ip/status gate also detects VPNs), so that capture is Phil's product
// screenshot, supplied manually.

import { copyFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

let chromium;
try {
  ({ chromium } = await import("playwright"));
} catch {
  console.error(
    "scripts/capture.mjs needs Playwright:\n  npm i -D playwright && npx playwright install chromium"
  );
  process.exit(1);
}

// Per-site overlay/banner dismissal: selectors are removed from the DOM
// before the shot. Sites change — refresh these when a capture comes out
// with chrome in it.
const TARGETS = [
  {
    url: "https://app.sky.money",
    out: "sky-money-app.jpg",
    remove: ["[role=dialog]", "[class*=overlay i]", "[class*=banner i]"],
  },
  {
    url: "https://vote.sky.money",
    out: "vote-sky-money.jpg",
    remove: ["[role=dialog]", "[class*=banner i]"],
  },
  {
    url: "https://vote.makerdao.com",
    out: "vote-makerdao.jpg",
    remove: ["[role=dialog]", "[class*=migration i]", "[class*=banner i]"],
  },
];

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1280, height: 800 },
  deviceScaleFactor: 2,
});

for (const t of TARGETS) {
  const page = await ctx.newPage();
  console.log(`capturing ${t.url} …`);
  await page.goto(t.url, { waitUntil: "networkidle", timeout: 60_000 });
  await page.waitForTimeout(2500);
  await page.evaluate((sels) => {
    sels.forEach((s) => document.querySelectorAll(s).forEach((n) => n.remove()));
  }, t.remove);
  await page.waitForTimeout(300);
  const jpg = await page.screenshot({ type: "jpeg", quality: 72 });
  const staged = join(ROOT, "design/assets", t.out);
  writeFileSync(staged, jpg);
  copyFileSync(staged, join(ROOT, "public/work", t.out));
  console.log(`  → design/assets/${t.out} + public/work/${t.out} (${(jpg.length / 1024).toFixed(0)}KB)`);
  await page.close();
}

await browser.close();
console.log("done — review each image, then update the FIG. capture dates in work.tsx");
