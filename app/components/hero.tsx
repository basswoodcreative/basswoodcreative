// Hero chip: two-line display H1 with the gradient full stop, the TRACE
// silk line, and the fan-in board art — traces enter from the right, fan
// through the pads, join a collector, and exit the card bottom at
// #fan-exit, where the page trunk picks the signal up (board.tsx aligns
// itself to the exit point). Confirmed by Phil 2026-07-07.

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
          Protocol-grade
          <br />
          frontends<span className="stop">.</span>
        </h1>
        <p className="sub">
          Basswood Creative builds interfaces users trust with real money —
          dApps, governance dashboards, and on-chain position management for
          teams whose frontends carry actual user funds.
        </p>
        <div className="ctas">
          <a className="btn-p" href="/#contact">
            Start a conversation
          </a>
          <a className="btn-g" href="/#proof">
            See the work ↓
          </a>
        </div>
        <p className="silk hint">
          TRACE, n. — THE PATH A SIGNAL TRAVELS · THE PATH A TRANSACTION TAKES.
        </p>
      </div>
    </section>
  );
}
