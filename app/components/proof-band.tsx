"use client";

// Proof band as the three funnel-relevant instruments (Phil's pick,
// round 3). Values come from app/data/snapshot.json — written at build
// time by scripts/fetch-metrics.mjs from the protocol's official
// analytics, with the previous build's real values kept for the settle.
// When the board pulse first reaches this component's pad, board.tsx
// fires "bwc:delivered" and the numerals settle prev → current —
// both real, never invented. Without JS the current values render
// as-is (server HTML). Reduced-motion skips the animation.

import { useEffect, useRef } from "react";
import snapshot from "../data/snapshot.json";

const ANALYTICS_URL = "https://info.skyeco.com";

type Inst = {
  id: string;
  from: number;
  to: number;
  dec: number;
  pre: string;
  suf: string;
};

const cur = snapshot.current;
const prev = snapshot.prev;

const INSTRUMENTS: Inst[] = [
  {
    id: "v-tvl",
    from: prev.sky_ecosystem_tvl / 1e9,
    to: cur.sky_ecosystem_tvl / 1e9,
    dec: 2,
    pre: "$",
    suf: "B",
  },
  {
    id: "v-save",
    from: prev.sky_savings_rate_tvl / 1e9,
    to: cur.sky_savings_rate_tvl / 1e9,
    dec: 2,
    pre: "$",
    suf: "B",
  },
  {
    id: "v-wal",
    from: prev.sky_ecosystem_wallet_count,
    to: cur.sky_ecosystem_wallet_count,
    dec: 0,
    pre: "",
    suf: "",
  },
];

function fmt(v: number, dec: number, pre: string, suf: string) {
  return pre + (dec ? v.toFixed(dec) : Math.round(v).toLocaleString("en-US")) + suf;
}

// "2026-07-08T04:02:02.661Z" → "2026-07-08 04:02 UTC"
const STAMP = snapshot.fetched_at.slice(0, 10) + " " + snapshot.fetched_at.slice(11, 16) + " UTC";

// savings sparkline: the real daily series, server-rendered so it exists
// without JS
const series = snapshot.history.map((h) => h.total_save);
const sMin = Math.min(...series);
const sRng = Math.max(...series) - sMin || 1;
const SPARK_POINTS = series
  .map(
    (v, i) =>
      `${((i / (series.length - 1)) * 100).toFixed(2)},${(24 - ((v - sMin) / sRng) * 20).toFixed(2)}`
  )
  .join(" ");
const [SPARK_LAST_X, SPARK_LAST_Y] = SPARK_POINTS.split(" ").pop()!.split(",");

export function ProofBand() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

    function settle(el: HTMLElement, inst: Inst) {
      if (reduced) {
        el.textContent = fmt(inst.to, inst.dec, inst.pre, inst.suf);
        return;
      }
      let t0: number | null = null;
      const D = 600;
      function step(t: number) {
        if (!t0) t0 = t;
        let k = Math.min(1, (t - t0) / D);
        k = 1 - Math.pow(1 - k, 3);
        el.textContent = fmt(inst.from + (inst.to - inst.from) * k, inst.dec, inst.pre, inst.suf);
        if (k < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }

    const onDelivered = () => {
      INSTRUMENTS.forEach((inst, i) => {
        const el = root.querySelector<HTMLElement>(`#${inst.id}`);
        if (el) setTimeout(() => settle(el, inst), i * 160);
      });
    };
    window.addEventListener("bwc:delivered", onDelivered, { once: true });
    return () => window.removeEventListener("bwc:delivered", onDelivered);
  }, []);

  return (
    <section className="component inverted" id="proof" ref={ref}>
      <div className="proof-head">
        <h2 className="sec">The numbers these frontends carry.</h2>
        <span className="silk stamp">
          <span className="dot"></span> DATA AS OF {STAMP}
        </span>
      </div>
      <p className="standfirst">
        With eight years inside Sky Protocol, Basswood Creative&apos;s
        principal led the team that delivered Sky&apos;s flagship UI.
      </p>
      <div className="instruments">
        <div className="inst">
          <div className="val" id="v-tvl">
            {fmt(INSTRUMENTS[0].to, 2, "$", "B")}
          </div>
          <div className="lbl">
            Sky ecosystem TVL, per the protocol&apos;s official analytics
          </div>
          <div className="src silk">
            <a href={ANALYTICS_URL} rel="noopener">
              SRC: OFFICIAL ANALYTICS ↗
            </a>
          </div>
        </div>
        <div className="inst">
          <div className="val" id="v-save">
            {fmt(INSTRUMENTS[1].to, 2, "$", "B")}
          </div>
          <div className="lbl">
            Held in the Savings module, fronted by a widget built end to end
          </div>
          <svg
            className="spark"
            viewBox="0 0 100 26"
            preserveAspectRatio="none"
            aria-label={`Sky savings, real daily series, ${series.length} days, per the official analytics`}
          >
            <polyline points={SPARK_POINTS} />
            <circle r="1.6" cx={SPARK_LAST_X} cy={SPARK_LAST_Y} />
          </svg>
        </div>
        <div className="inst">
          <div className="val" id="v-wal">
            {fmt(INSTRUMENTS[2].to, 0, "", "")}
          </div>
          <div className="lbl">Wallets across the Sky ecosystem</div>
          <div className="src silk">
            <a href={ANALYTICS_URL} rel="noopener">
              SRC: OFFICIAL ANALYTICS ↗
            </a>
          </div>
        </div>
      </div>
      <p className="silk fnrow">
        PUBLIC, SOURCED, DATED — PER THE PROTOCOL&apos;S OFFICIAL ANALYTICS ·
        FIGURES REFRESH AT BUILD TIME
      </p>
    </section>
  );
}
