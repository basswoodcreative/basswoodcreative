// Dev-only: renders the 1200×630 Open Graph card to app/opengraph-image.png
// (Next's file convention injects the og:image tags). Re-run only when the
// identity changes. Needs Playwright:
//   npm i -D playwright && npx playwright install chromium
// The card is built from the site's own identity: dark panel ground, board
// traces with a lit pad, leaf mark + silk wordmark, display headline with
// the gradient full stop (Decision 12).

import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

let chromium;
try {
  ({ chromium } = await import("playwright"));
} catch {
  console.error(
    "scripts/og.mjs needs Playwright:\n  npm i -D playwright && npx playwright install chromium"
  );
  process.exit(1);
}

const html = `<!doctype html>
<html><head><meta charset="utf-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@600&family=IBM+Plex+Mono:wght@400;500&display=block');
  * { margin: 0; box-sizing: border-box; }
  body {
    width: 1200px; height: 630px; overflow: hidden; position: relative;
    background: #15161A; color: #ECEDEF;
    font-family: 'Bricolage Grotesque', sans-serif;
  }
  .traces { position: absolute; inset: 0; }
  .wordmark {
    position: absolute; top: 64px; left: 72px;
    display: flex; align-items: center; gap: 14px;
    font-family: 'IBM Plex Mono', monospace; font-size: 17px;
    letter-spacing: .16em; color: #ECEDEF;
  }
  h1 {
    position: absolute; left: 72px; top: 236px;
    font-size: 92px; font-weight: 600; letter-spacing: -0.015em;
    line-height: 1.04; color: #ECEDEF;
  }
  h1 .stop {
    background: linear-gradient(100deg, #D97706, #DB2777);
    -webkit-background-clip: text; background-clip: text; color: transparent;
  }
  .url {
    position: absolute; left: 72px; bottom: 64px;
    font-family: 'IBM Plex Mono', monospace; font-size: 16px;
    letter-spacing: .12em; color: #9BA0A8;
  }
</style></head>
<body>
  <svg class="traces" viewBox="0 0 1200 630" fill="none" aria-hidden="true">
    <g stroke="#33353B" stroke-width="1.5">
      <path d="M1200 90 H960 L900 150 H790"/>
      <path d="M1200 210 H1020 L960 270 H790"/>
      <path d="M1200 390 H990 L930 330 H790"/>
      <path d="M1200 500 H1040 L980 560 H810"/>
      <path d="M775 150 H720 L672 198"/>
      <path d="M774 270 H672"/>
      <path d="M783 560 H720 L672 512"/>
      <path d="M672 198 V630"/>
    </g>
    <circle cx="782" cy="150" r="11" fill="#15161A" stroke="#33353B" stroke-width="1.5"/>
    <circle cx="782" cy="150" r="4.5" fill="#33353B"/>
    <circle cx="782" cy="390" r="11" fill="#15161A" stroke="#33353B" stroke-width="1.5"/>
    <circle cx="782" cy="390" r="4.5" fill="#33353B"/>
    <circle cx="781" cy="270" r="13" fill="#15161A" stroke="#D97706" stroke-width="2"/>
    <circle cx="781" cy="270" r="5.5" fill="#DB2777"/>
    <circle cx="672" cy="270" r="3.5" fill="#33353B"/>
    <circle cx="672" cy="512" r="3.5" fill="#33353B"/>
  </svg>
  <div class="wordmark">
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#D97706" stroke-width="1.5">
      <path d="M12 21 C12 21 4 15 4 9 C4 5.5 6.5 3.5 9 3.5 C10.3 3.5 11.4 4.1 12 5 C12.6 4.1 13.7 3.5 15 3.5 C17.5 3.5 20 5.5 20 9 C20 15 12 21 12 21 Z"/>
      <path d="M12 5 L12 21"/>
    </svg>
    BASSWOOD CREATIVE
  </div>
  <h1>Protocol-grade<br>frontends<span class="stop">.</span></h1>
  <div class="url">BASSWOODCREATIVE.COM</div>
</body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.setContent(html, { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(300);
const png = await page.screenshot({ type: "png" });
writeFileSync(join(ROOT, "app/opengraph-image.png"), png);
await browser.close();
console.log(`og card written: app/opengraph-image.png (${(png.length / 1024).toFixed(0)}KB)`);
