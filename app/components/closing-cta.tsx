"use client";

// The contact component: dark panel, gradient "real funds", magnetic
// primary CTA (hover-capable pointers only, disabled under
// reduced-motion), mono mailto beneath.

import { useEffect, useRef } from "react";
import { EMAIL, MAILTO } from "../data/site";

export function ClosingCta() {
  const magnetRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const m = magnetRef.current;
    if (!m) return;
    if (!matchMedia("(hover: hover)").matches) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let x = 0, y = 0, tx = 0, ty = 0, vx = 0, vy = 0;
    let raf: number | null = null;
    function tick() {
      const k = 0.18, d = 0.72;
      vx = (vx + (tx - x) * k) * d;
      vy = (vy + (ty - y) * k) * d;
      x += vx;
      y += vy;
      m!.style.transform = `translate(${x.toFixed(2)}px,${y.toFixed(2)}px)`;
      if (Math.abs(vx) + Math.abs(vy) + Math.abs(tx - x) + Math.abs(ty - y) > 0.05)
        raf = requestAnimationFrame(tick);
      else raf = null;
    }
    const go = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const onMove = (e: PointerEvent) => {
      const r = m.getBoundingClientRect();
      tx = Math.max(-6, Math.min(6, (e.clientX - r.left - r.width / 2) * 0.15));
      ty = Math.max(-6, Math.min(6, (e.clientY - r.top - r.height / 2) * 0.15));
      go();
    };
    const onLeave = () => {
      tx = 0;
      ty = 0;
      go();
    };
    m.addEventListener("pointermove", onMove);
    m.addEventListener("pointerleave", onLeave);
    return () => {
      m.removeEventListener("pointermove", onMove);
      m.removeEventListener("pointerleave", onLeave);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section className="component inverted contact" id="contact">
      <h2 className="sec">
        Have a frontend that carries <span className="amber">real funds</span>{" "}
        — or one that needs to?
      </h2>
      <span id="magnet" ref={magnetRef}>
        <a className="btn-p" href={MAILTO}>
          Start a conversation
        </a>
      </span>
      <br />
      <a className="email" href={MAILTO}>
        {EMAIL}
      </a>
    </section>
  );
}
