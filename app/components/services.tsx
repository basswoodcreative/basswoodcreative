"use client";

// Services as the contextual flip (Phil's construction, rounds 4–5):
// hovering any card flips all three, and the backs fill with the hovered
// card's GROUP — one line item per card, his exact copy. The stub pulse
// fires only on the hovered/tapped card; touch devices tap to flip.
// Copy signed off 2026-07-07 incl. the product-engineering Advise item.

import { useState } from "react";

type Group = "build" | "integrate" | "advise";

const STUBS: Record<Group, string> = {
  build: "M0 15 H70 L90 5 H130",
  integrate: "M0 15 H60 L80 25 H130",
  advise: "M0 15 H130",
};
const STUB_DOT: Record<Group, [number, number]> = {
  build: [136, 5],
  integrate: [136, 25],
  advise: [136, 15],
};

const CARDS: {
  group: Group;
  title: string;
  front: string;
  back: Record<Group, { lead: string; body: string }>;
}[] = [
  {
    group: "build",
    title: "Build",
    front:
      "Flagship dApp UIs, governance dashboards, design systems your frontends actually follow.",
    back: {
      build: {
        lead: "A fractional frontend lead",
        body: "senior ownership of your flagship UI and direct collaboration with founders, without adding full-time headcount.",
      },
      integrate: {
        lead: "An LLM chatbot or AI assistant live inside your product",
        body: "from the team lead who shipped the production frontend for Sky's chatbot and built the documentation pipeline that generated its training data.",
      },
      advise: {
        lead: "Web3 best practices, from someone who has lived them",
        body: "dApp and wallet UX, governance rollouts, multi-network architecture, geo/compliance handling, and the operational habits of a top protocol, drawn from eight years shipping inside one.",
      },
    },
  },
  {
    group: "integrate",
    title: "Integrate",
    front:
      "Smart-contract integration, LLM features that ship, data layers that stay verifiable.",
    back: {
      build: {
        lead: "A flagship dApp your users trust with real funds",
        body: "designed, built, and wired to your smart contracts end to end, in React and TypeScript.",
      },
      integrate: {
        lead: "Your protocol connected to the wider ecosystem",
        body: "smart-contract integration, including other platforms' contracts: Morpho, Curve, Pendle, and Spark are on the record.",
      },
      advise: {
        lead: "Your engineering team getting real output from coding agents",
        body: "hands-on optimization of agent integrations and workflows, drawn from an agent-assisted engineering practice on protocol software.",
      },
    },
  },
  {
    group: "advise",
    title: "Advise",
    front:
      "Agent-assisted delivery, org-level AI integration, web3 frontend best practice.",
    back: {
      build: {
        lead: "Complex on-chain positions made legible and safe",
        body: "vault and collateral management UIs in the mold of Multi-Collateral DAI CDP tooling.",
      },
      integrate: {
        lead: "An SDK/library layer for your protocol",
        body: "so integrators and internal teams can build on it without touching raw contracts.",
      },
      advise: {
        lead: "An engineer who thinks in product, not tickets",
        body: "scope, UX tradeoffs, and ship-or-cut calls weighed like an owner — eight years of turning protocol requirements into product people actually use.",
      },
    },
  },
];

function Stub({ group, pulse }: { group: Group; pulse?: boolean }) {
  return (
    <svg className="stub" viewBox="0 0 200 30" preserveAspectRatio="none" aria-hidden="true">
      <path d={STUBS[group]} />
      <circle cx={STUB_DOT[group][0]} cy={STUB_DOT[group][1]} r="3" />
      {pulse ? <path className="spulse" d={STUBS[group]} pathLength={1} /> : null}
    </svg>
  );
}

export function Services() {
  const [hover, setHover] = useState<Group>("build");
  const [active, setActive] = useState<Group | null>(null);
  const [flipped, setFlipped] = useState(false);

  const isTouch = () =>
    typeof window !== "undefined" && matchMedia("(hover: none)").matches;

  return (
    <section id="services" className="component">
      <span className="silk seclabel">SERVICES</span>
      <h2 className="sec">Protocol to pixels, end to end.</h2>
      <p className="standfirst">
        One senior engineer across the whole surface — from the contract call
        to the pixel that carries it.
      </p>
      <div className={`svc${flipped ? " flipped" : ""}`} data-hover={hover}>
        {CARDS.map((card) => (
          <div
            key={card.group}
            className={`card3d${active === card.group ? " active" : ""}`}
            data-group={card.group}
            onPointerEnter={() => {
              if (isTouch()) return;
              setHover(card.group);
              setActive(card.group);
            }}
            onClick={() => {
              if (!isTouch()) return;
              const same = hover === card.group;
              setHover(card.group);
              setActive(card.group);
              setFlipped(flipped && same ? false : true);
            }}
          >
            <div className="flipper">
              <div className="face front">
                <Stub group={card.group} />
                <h3>{card.title}</h3>
                <p>{card.front}</p>
              </div>
              <div className="face back">
                <Stub group={card.group} pulse />
                <p className="silk grouptag"></p>
                {(Object.keys(card.back) as Group[]).map((g) => (
                  <div key={g} className={`gset g-${g}`}>
                    <b>{card.back[g].lead}</b> {card.back[g].body}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
