"use client";

// Services as the probe instrument (services round, 2026-07-15): three
// full-width group bands, each a horizontal bus carrying its three outcomes
// on ring pads with fixed-geometry corner connectors. All nine leads + bodies
// are visible at rest — interaction never reveals copy, it instruments it:
// probing a row (hover/tap/focus) lights its connector, settles an OK, and
// counts toward "3/3 CONFIRMED" per band and "9/9 CALLS CONFIRMED" overall.
// Wording = the calls/confirmed system (Phil's pick); group silk labels
// removed (Phil: titles + fragments carry the groups). RETEST appears only
// at 9/9. Replaces the contextual flip (rounds 4–5). Record: vault
// "Phase 5 / 55". Traces are fixed-scale — nothing stretches.

import { useEffect, useRef, useState } from "react";

type Jog = "straight" | "up" | "down";

const JOGM: Record<Jog, string> = {
  straight: "M0 8.5 H19",
  up: "M0 8.5 H7 L11 4.5 H19",
  down: "M0 8.5 H7 L11 12.5 H19",
};
const CORNER = "M5.5 0 V26 L13.5 34 H23";

const GROUPS: {
  group: string;
  title: string;
  frag: string;
  range: string;
  items: { id: string; jog: Jog; lead: string; body: string }[];
}[] = [
  {
    group: "build",
    title: "Build",
    frag: "Flagship dApp UIs, governance dashboards, design systems your frontends actually follow.",
    range: "01–03",
    items: [
      {
        id: "01",
        jog: "straight",
        lead: "A fractional frontend lead",
        body: "senior ownership of your flagship UI and direct collaboration with founders, without adding full-time headcount.",
      },
      {
        id: "02",
        jog: "up",
        lead: "A flagship dApp your users trust with real funds",
        body: "designed, built, and wired to your smart contracts end to end, in React and TypeScript.",
      },
      {
        id: "03",
        jog: "down",
        lead: "Complex on-chain positions made legible and safe",
        body: "vault and collateral management UIs in the mold of Multi-Collateral DAI CDP tooling.",
      },
    ],
  },
  {
    group: "integrate",
    title: "Integrate",
    frag: "Smart-contract integration, LLM features that ship, data layers that stay verifiable.",
    range: "04–06",
    items: [
      {
        id: "04",
        jog: "up",
        lead: "An LLM chatbot or AI assistant live inside your product",
        body: "from the team lead who shipped the production frontend for Sky's chatbot and built the documentation pipeline that generated its training data.",
      },
      {
        id: "05",
        jog: "straight",
        lead: "Your protocol connected to the wider ecosystem",
        body: "smart-contract integration, including other platforms' contracts: Morpho, Curve, Pendle, and Spark are on the record.",
      },
      {
        id: "06",
        jog: "down",
        lead: "An SDK/library layer for your protocol",
        body: "so integrators and internal teams can build on it without touching raw contracts.",
      },
    ],
  },
  {
    group: "advise",
    title: "Advise",
    frag: "Agent-assisted delivery, org-level AI integration, web3 frontend best practice.",
    range: "07–09",
    items: [
      {
        id: "07",
        jog: "down",
        lead: "Web3 best practices, from someone who has lived them",
        body: "dApp and wallet UX, governance rollouts, multi-network architecture, geo/compliance handling, and the operational habits of a top protocol, drawn from eight years shipping inside one.",
      },
      {
        id: "08",
        jog: "up",
        lead: "Your engineering team getting real output from coding agents",
        body: "hands-on optimization of agent integrations and workflows, drawn from an agent-assisted engineering practice on protocol software.",
      },
      {
        id: "09",
        jog: "straight",
        lead: "An engineer who thinks in product, not tickets",
        body: "scope, UX tradeoffs, and ship-or-cut calls weighed like an owner — eight years of turning protocol requirements into product people actually use.",
      },
    ],
  },
];

const ALL = GROUPS.flatMap((g) => g.items);

function Deco({ jog, index }: { jog: Jog; index: number }) {
  return (
    <span aria-hidden="true" style={{ "--i": index } as React.CSSProperties}>
      <i className="hot" />
      <b className="pad">
        <i />
      </b>
      <svg className="jog" width="24" height="35" viewBox="0 0 24 35">
        <path className="jb" pathLength={1} d={CORNER} />
        <path className="jh" pathLength={1} d={CORNER} />
      </svg>
      <svg className="jogm" width="20" height="17" viewBox="0 0 20 17">
        <path className="jb" pathLength={1} d={JOGM[jog]} />
        <path className="jh" pathLength={1} d={JOGM[jog]} />
      </svg>
    </span>
  );
}

export function Services() {
  const [tested, setTested] = useState<ReadonlySet<string>>(new Set());
  const [post, setPost] = useState(false);
  const [focusIdx, setFocusIdx] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const rowRefs = useRef<(HTMLLIElement | null)[]>([]);
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const total = tested.size;
  const allgreen = total === ALL.length;

  // the entrance cascade fires once, when the section first scrolls in
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setPost(true);
          io.disconnect();
        }
      },
      { threshold: 0.35 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const t = timers.current;
    return () => Object.values(t).forEach(clearTimeout);
  }, []);

  const probe = (id: string) => {
    setTested((prev) => (prev.has(id) ? prev : new Set(prev).add(id)));
  };

  const retest = () => {
    Object.values(timers.current).forEach(clearTimeout);
    setTested(new Set());
    // power down, then replay the cascade on the fresh board
    setPost(false);
    requestAnimationFrame(() => requestAnimationFrame(() => setPost(true)));
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    const i = rowRefs.current.findIndex((r) => r === document.activeElement);
    if (i < 0) return;
    let j: number | null = null;
    if (e.key === "ArrowDown" || e.key === "ArrowRight") j = Math.min(i + 1, ALL.length - 1);
    else if (e.key === "ArrowUp" || e.key === "ArrowLeft") j = Math.max(i - 1, 0);
    else if (e.key === "Home") j = 0;
    else if (e.key === "End") j = ALL.length - 1;
    if (j === null) return;
    e.preventDefault();
    if (j !== i) {
      setFocusIdx(j);
      rowRefs.current[j]?.focus();
    }
  };

  return (
    <section
      id="services"
      ref={sectionRef}
      className={`component svcsec${post ? " post" : ""}${allgreen ? " allgreen" : ""}`}
    >
      <div className="seclabel-row">
        <span className="silk seclabel">SERVICES</span>
        <span className={`silk cont${allgreen ? " done" : ""}`} aria-hidden="true">
          CONFIRMATIONS {total}/9
        </span>
      </div>
      <h2 className="sec">Protocol to pixels, end to end.</h2>
      <p className="standfirst">
        One senior engineer across the whole surface — from the contract call
        to the pixel that carries it.
      </p>
      <div className="manifold" aria-hidden="true">
        <i className="h" />
        <i className="d" />
      </div>
      <div className="nets" onKeyDown={onKeyDown}>
        {GROUPS.map((g) => {
          const n = g.items.filter((it) => tested.has(it.id)).length;
          return (
            <article
              key={g.group}
              className={`netcol${n === g.items.length ? " continuous" : ""}`}
              data-group={g.group}
            >
              <header>
                <h3>{g.title}</h3>
                <p className="frag">{g.frag}</p>
              </header>
              <ul className="netlist" role="list">
                {g.items.map((it) => {
                  const index = ALL.findIndex((x) => x.id === it.id);
                  return (
                    <li
                      key={it.id}
                      ref={(el) => {
                        rowRefs.current[index] = el;
                      }}
                      className={`net${tested.has(it.id) ? " tested" : ""}`}
                      tabIndex={index === focusIdx ? 0 : -1}
                      onPointerEnter={(e) => {
                        // probe-intent gate: a drive-by cursor crossing must
                        // not earn a confirmation (visuals are instant via CSS)
                        if (e.pointerType !== "mouse") return;
                        timers.current[it.id] = setTimeout(() => probe(it.id), 120);
                      }}
                      onPointerLeave={() => clearTimeout(timers.current[it.id])}
                      onClick={() => probe(it.id)}
                      onFocus={() => probe(it.id)}
                    >
                      <Deco jog={it.jog} index={index} />
                      <div className="copy">
                        <strong>{it.lead}</strong>
                        <p>{it.body}</p>
                      </div>
                      <span className="stat silk" aria-hidden="true">
                        <span className="idx">{it.id}</span>
                        <span className="ok">OK</span>
                      </span>
                    </li>
                  );
                })}
              </ul>
              <footer className="netfoot silk" aria-hidden="true">
                <span>CALLS {g.range}</span>
                <b className={`cnt${n > 0 ? " show" : ""}`}>
                  {n === 0 ? "" : n === g.items.length ? "3/3 CONFIRMED" : `${n}/3`}
                </b>
                <span className="term">
                  <i />
                </span>
              </footer>
            </article>
          );
        })}
      </div>
      <div className="netsum">
        <span aria-hidden="true">
          <i className="d" />
          <i className="h" />
          <i className="sweep" />
        </span>
        <div className="sumline">
          <span className="lab silk" aria-hidden="true">
            9/9 CALLS CONFIRMED
          </span>
          <button
            className="retest silk"
            type="button"
            aria-label="Retest — reset the counters"
            onClick={retest}
          >
            · RETEST
          </button>
        </div>
      </div>
      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
        <defs>
          {/* userSpaceOnUse: objectBoundingBox gradients do not render on
              perfectly horizontal strokes (zero-height bounding box) */}
          <linearGradient id="svcgradj" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="20" y2="0">
            <stop offset="0" stopColor="var(--g1)" />
            <stop offset="1" stopColor="var(--g2)" />
          </linearGradient>
        </defs>
      </svg>
    </section>
  );
}
