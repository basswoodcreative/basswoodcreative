"use client";

import { useEffect, useRef } from "react";

// The circuit-board substrate (Phase 5, B3 — ported from prototype v10, the
// design of record; record: vault "Phase 5 / 52–54", Decision 12).
//
// Renders an empty SVG behind the server-rendered sections and draws the
// board client-side: a 3-trace bus weaving between the components, junction
// pads that light as the scroll-scrubbed pulse passes, leader traces on the
// Phil-blessed module mappings, and the SETTLED terminus below the last
// component. No-JS visitors get the content with no board — accepted
// behavior. Reduced-motion keeps the board AND the pulse: it is
// input-driven (scrubbed by scroll), never self-animating.

// Section order on the board. Engagements / About / Insights weren't in the
// prototype flow but carry approved copy — kept as components, flagged for
// Phil's review at the B3 preview.
const SECTIONS = [
  "hero",
  "proof",
  "services",
  "work",
  "ex-flagship",
  "ex-gov",
  "ex-widgets",
  "ex-llm",
  "ex-bt",
  "ex-daijs",
  "engagements",
  "about",
  "insights",
  "contact",
];

// Lane fractions: 0.5 = center; <0.5 left lane, >0.5 right lane, with the
// distance from 0.09 / 0.91 giving each lane its inward variation. The
// exhibit alternation is the prototype's; the three kept sections continue
// the alternating rhythm into contact's center.
const FR = [0.5, 0.09, 0.91, 0.13, 0.87, 0.13, 0.87, 0.15, 0.85, 0.13, 0.87, 0.13, 0.87, 0.5];

// Leader traces: Phil-blessed module mappings ONLY (2026-07-07, incl. the
// CAT/FLIP correction — Black Thursday predates Liquidations 2.0).
const LEADERS: Record<string, string> = {
  "ex-gov": "GOVERNANCE UI → CHIEF",
  "ex-widgets": "SAVINGS UI → sUSDS",
  "ex-bt": "AUCTION HELPER → CAT/FLIP",
};

const SVGNS = "http://www.w3.org/2000/svg";

type Pad = {
  x: number;
  y: number;
  section: string;
  small: boolean;
  node?: SVGGElement;
  label?: SVGTextElement;
};

export function Board({ children }: { children: React.ReactNode }) {
  const boardRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const board = boardRef.current;
    const svg = svgRef.current;
    if (!board || !svg) return;

    let centerPath: SVGPathElement | null = null;
    let pathLen = 0;
    let samples: { len: number; y: number }[] = [];
    let pads: Pad[] = [];
    let delivered = false;
    let proofPadY = 0;
    let endPadY = 0;

    function el<K extends keyof SVGElementTagNameMap>(
      name: K,
      attrs: Record<string, string | number>
    ): SVGElementTagNameMap[K] {
      const n = document.createElementNS(SVGNS, name);
      for (const k in attrs) n.setAttribute(k, String(attrs[k]));
      return n;
    }

    function routePoints(W: number) {
      const secs: { id: string; top: number; bottom: number; fr: number }[] = [];
      SECTIONS.forEach((id, i) => {
        const s = document.getElementById(id);
        if (s && s.offsetParent !== null)
          secs.push({ id, top: s.offsetTop, bottom: s.offsetTop + s.offsetHeight, fr: FR[i] });
      });
      // lanes hug the content column: at most OUT px beyond its edge, however
      // wide the screen gets (Phil's wide-screen note, 2026-07-07)
      const contentW = Math.min(W - 40, 960);
      const cLeft = (W - contentW) / 2;
      const cRight = W - (W - contentW) / 2;
      const OUT = 110;
      const xs = secs.map(({ fr }) => {
        if (fr === 0.5) return Math.round(W / 2);
        // per-lane variation keeps the weave organic: outermost fraction = furthest out
        if (fr < 0.5) {
          const vL = Math.round((fr - 0.09) * 700); // 0 / 28 / 42 px toward the content
          return Math.round(Math.max(26, cLeft - OUT) + vL);
        }
        const vR = Math.round((0.91 - fr) * 700);
        return Math.round(Math.min(W - 26, cRight + OUT) - vR);
      });
      // fan-in hero art (B4): the trunk continues from the art's exit point,
      // so the hero component visibly feeds the page bus
      const exitEl = document.getElementById("fan-exit");
      if (exitEl && board) {
        const er = exitEl.getBoundingClientRect();
        const br = board.getBoundingClientRect();
        xs[0] = Math.round(Math.max(26, Math.min(W - 26, er.left + er.width / 2 - br.left)));
      }
      const pts: [number, number][] = [[xs[0], 0]];
      pads = [];
      for (let i = 0; i < secs.length - 1; i++) {
        const gapMid = (secs[i].bottom + secs[i + 1].top) / 2;
        const x0 = xs[i];
        const x1 = xs[i + 1];
        const dx = x1 - x0;
        const adx = Math.abs(dx);
        const sgn = dx > 0 ? 1 : -1;
        const d45 = Math.min(16, adx / 2); // PCB-style 45° jogs in the gaps
        if (adx > 2) {
          pts.push([x0, gapMid - d45]);
          pts.push([x0 + sgn * d45, gapMid]);
          if (adx > 2 * d45) pts.push([x1 - sgn * d45, gapMid]);
          pts.push([x1, gapMid + d45]);
        } else {
          pts.push([x0, gapMid]);
        }
        pads.push({
          x: x1,
          y: secs[i + 1].top - 26,
          section: secs[i + 1].id,
          small: secs[i + 1].id.indexOf("ex-") === 0,
        });
        if (secs[i + 1].id === "proof") proofPadY = secs[i + 1].top - 26;
      }
      const end = secs[secs.length - 1].bottom + 44;
      endPadY = end;
      pts.push([xs[xs.length - 1], end]);
      return { pts, endX: xs[xs.length - 1] };
    }

    function ptsToD(pts: [number, number][], off: number) {
      return pts.map((p, i) => (i ? "L" : "M") + (p[0] + off) + " " + p[1]).join(" ");
    }

    function buildBoard() {
      if (!board || !svg) return;
      const W = board.clientWidth;
      const H = board.scrollHeight;
      svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
      svg.innerHTML = "";
      const r = routePoints(W);
      svg.appendChild(el("path", { class: "bus outer", d: ptsToD(r.pts, -7) }));
      svg.appendChild(el("path", { class: "bus outer", d: ptsToD(r.pts, 7) }));
      centerPath = el("path", { class: "bus", d: ptsToD(r.pts, 0) });
      svg.appendChild(centerPath);
      pads.forEach((p) => {
        const g = el("g", { class: "pad" });
        g.appendChild(el("circle", { class: "padring", cx: p.x, cy: p.y, r: p.small ? 5 : 7 }));
        g.appendChild(el("circle", { class: "padcore", cx: p.x, cy: p.y, r: p.small ? 2.2 : 3 }));
        svg.appendChild(g);
        p.node = g;
        if (LEADERS[p.section]) {
          const onLeft = p.x < W / 2;
          svg.appendChild(
            el("line", {
              class: "bus",
              x1: p.x + (onLeft ? 8 : -8),
              y1: p.y,
              x2: p.x + (onLeft ? 22 : -22),
              y2: p.y,
            })
          );
          const t = el("text", {
            class: "padlabel",
            x: p.x + (onLeft ? 28 : -28),
            y: p.y + 3,
            "text-anchor": onLeft ? "start" : "end",
          });
          t.textContent = LEADERS[p.section];
          svg.appendChild(t);
          p.label = t;
        }
      });
      const top = el("g", { class: "pad lit" });
      top.appendChild(el("circle", { class: "padring", cx: r.pts[0][0], cy: 14, r: 7 }));
      top.appendChild(el("circle", { class: "padcore", cx: r.pts[0][0], cy: 14, r: 3 }));
      svg.appendChild(top);
      const inLabel = el("text", { class: "padlabel lit", x: r.pts[0][0] + 14, y: 18 });
      inLabel.textContent = "IN";
      svg.appendChild(inLabel);
      const endg = el("g", { class: "pad", id: "endpad" });
      endg.appendChild(el("circle", { class: "padring", cx: r.endX, cy: endPadY, r: 8 }));
      endg.appendChild(el("circle", { class: "padcore", cx: r.endX, cy: endPadY, r: 3.5 }));
      svg.appendChild(endg);
      const endlabel = el("text", { class: "padlabel", id: "endlabel", x: r.endX + 16, y: endPadY + 4 });
      endlabel.textContent = "SETTLED";
      svg.appendChild(endlabel);
      svg.appendChild(el("line", { id: "pulse-trail", x1: 0, y1: 0, x2: 0, y2: 0 }));
      svg.appendChild(el("circle", { id: "pulse-head", r: 3 }));
      pathLen = centerPath.getTotalLength();
      samples = [];
      const N = 240;
      for (let i = 0; i <= N; i++) {
        const pt = centerPath.getPointAtLength((pathLen * i) / N);
        samples.push({ len: (pathLen * i) / N, y: pt.y });
      }
      onScroll(true);
    }

    function lenAtY(y: number) {
      for (let i = 1; i < samples.length; i++) {
        if (samples[i].y >= y) {
          const a = samples[i - 1];
          const b = samples[i];
          const t = (y - a.y) / (b.y - a.y || 1);
          return a.len + (b.len - a.len) * t;
        }
      }
      return pathLen;
    }

    let ticking = false;
    function onScroll(force?: boolean) {
      if (ticking && !force) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        if (!centerPath || !svg || !board) return;
        const bTop = board.getBoundingClientRect().top + scrollY;
        const doc = document.documentElement;
        const atEnd = scrollY + innerHeight >= doc.scrollHeight - 8;
        const y = atEnd ? endPadY : Math.max(0, Math.min(endPadY, scrollY + innerHeight * 0.5 - bTop));
        const L = lenAtY(y);
        const head = centerPath.getPointAtLength(L);
        const tail = centerPath.getPointAtLength(Math.max(0, L - 34));
        const hEl = svg.querySelector("#pulse-head");
        const tEl = svg.querySelector("#pulse-trail");
        if (!hEl || !tEl) return;
        hEl.setAttribute("cx", String(head.x));
        hEl.setAttribute("cy", String(head.y));
        tEl.setAttribute("x1", String(tail.x));
        tEl.setAttribute("y1", String(tail.y));
        tEl.setAttribute("x2", String(head.x));
        tEl.setAttribute("y2", String(head.y));
        pads.forEach((p) => {
          const lit = y >= p.y - 4;
          if (p.node) p.node.classList.toggle("lit", lit);
          if (p.label) p.label.classList.toggle("lit", lit);
        });
        if (!delivered && proofPadY && y >= proofPadY - 4) {
          delivered = true;
          // the proof band (B4) listens for this to run its settle-once numerals
          window.dispatchEvent(new CustomEvent("bwc:delivered"));
        }
        const done = y >= endPadY - 6;
        svg.querySelector("#endpad")?.classList.toggle("lit", done);
        svg.querySelector("#endlabel")?.classList.toggle("lit", done);
      });
    }

    const handleScroll = () => onScroll();
    addEventListener("scroll", handleScroll, { passive: true });

    let rto: ReturnType<typeof setTimeout> | null = null;
    const rebuild = () => {
      if (rto) clearTimeout(rto);
      rto = setTimeout(buildBoard, 150);
    };
    addEventListener("resize", rebuild);
    // content height changes (image loads, font swaps) rebuild the routing too
    const ro = new ResizeObserver(rebuild);
    ro.observe(board);

    // scroll-reveal for .rv content (CSS-gated behind prefers-reduced-motion)
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && e.target.classList.add("in")),
      { threshold: 0.3 }
    );
    board.querySelectorAll(".rv").forEach((n) => io.observe(n));

    buildBoard();
    document.fonts?.ready?.then(() => buildBoard());

    return () => {
      removeEventListener("scroll", handleScroll);
      removeEventListener("resize", rebuild);
      if (rto) clearTimeout(rto);
      ro.disconnect();
      io.disconnect();
    };
  }, []);

  return (
    <div ref={boardRef} className="board">
      <svg ref={svgRef} id="boardsvg" aria-hidden="true" />
      {children}
    </div>
  );
}
