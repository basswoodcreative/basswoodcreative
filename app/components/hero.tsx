// Hero chip: two-line display H1 with the gradient full stop, the HARNESS
// silk line, and the fan-in board art — traces enter from the right, fan
// through the pads, join a collector, and exit the card bottom at
// #fan-exit, where the page trunk picks the signal up (board.tsx aligns
// itself to the exit point). Confirmed by Phil 2026-07-07; copy reframed
// for agentic engineering 2026-10-29 (bwc vault, 65 §2.1).

import Link from "next/link";
import { BOOKING } from "../data/site";

export function Hero() {
  return (
    <section className="component hero" id="hero">
      <div className="heroart" aria-hidden="true">
        <svg viewBox="0 0 520 360" preserveAspectRatio="xMaxYMid slice">
          <path className="t" d="M520 40 H400 L360 80 H300" />
          <path className="t" d="M520 120 H430 L390 160 H300" />
          <path className="t" d="M520 200 H410 L370 160 H300" />
          <path className="t" d="M520 250 H440 L400 290 H310" />
          <path className="t" d="M520 330 H380 L340 290 H310" />
          <circle className="pr" cx="294" cy="80" r="7" />
          <circle className="pc" cx="294" cy="80" r="3" />
          <circle className="hot-r" cx="294" cy="160" r="8" />
          <circle className="hot-c" cx="294" cy="160" r="3.5" />
          <circle className="pr" cx="304" cy="290" r="7" />
          <circle className="pc" cx="304" cy="290" r="3" />
          <path className="t" d="M287 80 H262 L238 104" />
          <path className="t" d="M286 160 H238" />
          <path className="t" d="M297 290 H262 L238 266" />
          <path className="t" d="M238 104 V300 L218 320 V360" />
          <circle className="pc" cx="238" cy="160" r="2.2" />
          <circle className="pc" cx="238" cy="266" r="2.2" />
          <circle id="fan-exit" cx="218" cy="354" r="1" opacity="0" />
        </svg>
      </div>
      <div className="fore">
        <h1>
          Agentic engineering
          <br />
          for software teams<span className="stop">.</span>
        </h1>
        <p className="sub">
          Your team has the coding agents. I make them pay off: the harness,
          the workflows, and the infrastructure underneath.
        </p>
        <p className="cred">
          Eight years at Sky (formerly MakerDAO), rising to lead the team
          behind the flagship app of its $19.8B ecosystem. For the last two,
          I&apos;ve built almost entirely through coding agents.
        </p>
        <div className="ctas">
          <a className="btn-p" href={BOOKING}>
            Book a free 30-minute check-up
          </a>
          <Link className="btn-g" href="/diagnostic">
            How the review works →
          </Link>
        </div>
        <p className="silk hint">
          HARNESS, n. — THE WIRING THAT CARRIES SIGNALS BETWEEN COMPONENTS · THE
          TOOLING THAT STEERS AN AGENT&apos;S WORK.
        </p>
      </div>
    </section>
  );
}
