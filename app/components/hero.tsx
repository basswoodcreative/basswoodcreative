// Hero chip: two-line display H1 with the gradient full stop, the HARNESS
// silk line, and the fan-in board art — traces enter from the right, fan
// through the pads, join a collector, and exit the card bottom at
// #fan-exit, where the page trunk picks the signal up (board.tsx aligns
// itself to the exit point). Confirmed by Phil 2026-07-07; copy reframed
// for agentic engineering 2026-10-29 (bwc vault, 65 §2.1). The longer copy
// needed room, so the traces' runs from the right border are 70 units
// shorter (pads, collector and exit sit further right) and the silk line
// breaks after its "·" (Phil, 2026-10-29).

import Link from "next/link";
import { BOOKING } from "../data/site";

export function Hero() {
  return (
    <section className="component hero" id="hero">
      <div className="heroart" aria-hidden="true">
        <svg viewBox="0 0 520 360" preserveAspectRatio="xMaxYMid slice">
          <path className="t" d="M520 40 H470 L430 80 H370" />
          <path className="t" d="M520 120 H500 L460 160 H370" />
          <path className="t" d="M520 200 H480 L440 160 H370" />
          <path className="t" d="M520 250 H510 L470 290 H380" />
          <path className="t" d="M520 330 H450 L410 290 H380" />
          <circle className="pr" cx="364" cy="80" r="7" />
          <circle className="pc" cx="364" cy="80" r="3" />
          <circle className="hot-r" cx="364" cy="160" r="8" />
          <circle className="hot-c" cx="364" cy="160" r="3.5" />
          <circle className="pr" cx="374" cy="290" r="7" />
          <circle className="pc" cx="374" cy="290" r="3" />
          <path className="t" d="M357 80 H332 L308 104" />
          <path className="t" d="M356 160 H308" />
          <path className="t" d="M367 290 H332 L308 266" />
          <path className="t" d="M308 104 V300 L288 320 V360" />
          <circle className="pc" cx="308" cy="160" r="2.2" />
          <circle className="pc" cx="308" cy="266" r="2.2" />
          <circle id="fan-exit" cx="288" cy="354" r="1" opacity="0" />
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
          HARNESS, n. — THE WIRING THAT CARRIES SIGNALS BETWEEN COMPONENTS ·
          <br />
          THE TOOLING THAT STEERS AN AGENT&apos;S WORK.
        </p>
      </div>
    </section>
  );
}
