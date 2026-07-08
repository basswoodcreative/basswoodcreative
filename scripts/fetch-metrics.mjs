// Prebuild metrics fetch (Phase 5, B2).
//
// Pulls the official Sky analytics figures at build time and writes
// app/data/snapshot.json — the single source the proof band reads.
// The committed snapshot is the last-known-good: if the upstream API is
// down or returns something malformed, this script warns and exits 0,
// the committed file stays untouched, and the deploy proceeds with the
// older (still truthfully dated) figures. No fake-live, ever.
//
// Also appends one entry per calendar month to app/data/metrics-history.json
// when run in a new month — the long-run record beyond the API's window.
// That file only persists when committed (Phil's manual monthly chore).
//
// Collection of record: bwc vault, "18 Metrics Collection Guide".

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SNAPSHOT = join(ROOT, "app/data/snapshot.json");
const HISTORY = join(ROOT, "app/data/metrics-history.json");

const API = process.env.METRICS_API ?? "https://info-sky.blockanalitica.com/api/v1";
// Headers observed on info.skyeco.com's own calls to this API.
const HEADERS = { Accept: "application/json", "atlas-restricted": "false" };

function num(v, name) {
  const n = Number(v);
  if (!Number.isFinite(n)) throw new Error(`${name} is not numeric: ${v}`);
  return n;
}

function readJson(path) {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch {
    return null;
  }
}

async function getJson(url) {
  const res = await fetch(url, { headers: HEADERS, signal: AbortSignal.timeout(25_000) });
  if (!res.ok) throw new Error(`${url} → HTTP ${res.status}`);
  return res.json();
}

async function main() {
  const now = new Date();
  const fetchedAt = now.toISOString();
  const utcDay = fetchedAt.slice(0, 10);
  const utcMonth = fetchedAt.slice(0, 7);

  // ── fetch + validate ────────────────────────────────────────────────
  const overall = await getJson(`${API}/overall/`);
  const o = Array.isArray(overall) ? overall[0] : null;
  if (!o) throw new Error("overall payload: expected a non-empty array");

  const current = {
    sky_ecosystem_tvl: num(o.sky_ecosystem_tvl, "sky_ecosystem_tvl"),
    sky_ecosystem_wallet_count: num(o.sky_ecosystem_wallet_count, "wallet_count"),
    sky_savings_rate_tvl: num(o.sky_savings_rate_tvl, "sky_savings_rate_tvl"),
    sky_savings_rate_apy: num(o.sky_savings_rate_apy, "sky_savings_rate_apy"),
    total_save: num(o.total_save, "total_save"),
    ssr_depositor_count: num(o.ssr_depositor_count, "ssr_depositor_count"),
  };
  // sanity ranges — a "successful" fetch of garbage must not ship
  if (current.sky_ecosystem_tvl < 1e9) throw new Error("TVL failed sanity check (<$1B)");
  if (current.sky_ecosystem_wallet_count < 1e5) throw new Error("wallet count failed sanity check (<100K)");
  if (current.total_save < 1e8) throw new Error("total_save failed sanity check (<$100M)");

  // page 1 of the daily series (100 points, newest first) → sparkline source
  const historic = await getJson(`${API}/overall/historic/`);
  if (!Array.isArray(historic?.results) || historic.results.length < 30)
    throw new Error("historic payload: expected results[≥30]");
  const history = historic.results
    .map((r) => ({ date: String(r.date), total_save: num(r.total_save, "historic total_save") }))
    .reverse(); // oldest → newest

  // ── prev values: what the settle animation starts from ─────────────
  // Keep the previous *day's* figures — several rebuilds on the same day
  // shouldn't collapse prev into current and kill the settle.
  const old = readJson(SNAPSHOT);
  let prev;
  if (!old?.current) {
    prev = { ...current, fetched_at: fetchedAt };
  } else if ((old.fetched_at ?? "").slice(0, 10) === utcDay) {
    prev = old.prev;
  } else {
    prev = { ...old.current, fetched_at: old.fetched_at };
  }

  mkdirSync(dirname(SNAPSHOT), { recursive: true });
  writeFileSync(
    SNAPSHOT,
    JSON.stringify({ fetched_at: fetchedAt, source: "info-sky.blockanalitica.com/api/v1", current, prev, history }, null, 2) + "\n"
  );
  console.log(
    `fetch-metrics: snapshot written (${utcDay}) — TVL $${(current.sky_ecosystem_tvl / 1e9).toFixed(2)}B, ` +
      `${current.sky_ecosystem_wallet_count.toLocaleString("en-US")} wallets, ${history.length} history points`
  );

  // ── monthly history append (committed by hand, monthly chore) ──────
  const hist = readJson(HISTORY) ?? [];
  if (!hist.some((e) => e.month === utcMonth)) {
    hist.push({ month: utcMonth, fetched_at: fetchedAt, ...current });
    writeFileSync(HISTORY, JSON.stringify(hist, null, 2) + "\n");
    console.log(`fetch-metrics: metrics-history gained ${utcMonth} (commit it when convenient)`);
  }
}

main().catch((err) => {
  console.warn(`fetch-metrics: SKIPPED — ${err.message}`);
  console.warn("fetch-metrics: deploying with the committed last-known-good snapshot.");
  process.exit(0);
});
