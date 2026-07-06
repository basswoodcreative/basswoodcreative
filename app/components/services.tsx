const GROUPS = [
  {
    name: "Build",
    items: [
      {
        lead: "A fractional frontend lead",
        body: "senior ownership of your flagship UI and direct collaboration with founders, without adding full-time headcount.",
      },
      {
        lead: "A flagship dApp your users trust with real funds",
        body: "designed, built, and wired to your smart contracts end to end, in React and TypeScript.",
      },
      {
        lead: "Governance your token holders can actually participate in",
        body: "voting portals and dashboards modeled on eight years of governance-frontend work at MakerDAO/Sky.",
      },
      {
        lead: "Complex on-chain positions made legible and safe",
        body: "vault and collateral management UIs in the mold of Multi-Collateral DAI CDP tooling.",
      },
      // {
      //   lead: "A design system your frontends actually follow",
      //   body: "from building an early DAO-wide design system for Maker's frontends to translating Sky.money's agency-commissioned design files into the design system and Tailwind theme the webapp runs on today.",
      // },
      // {
      //   lead: "The data layer behind the UI",
      //   body: "subgraph architecture and deployment, blockchain indexers, and the supporting infrastructure: hosting, proxying, analytics, monitoring, compliance tooling.",
      // },
    ],
  },
  {
    name: "Integrate",
    items: [
      {
        lead: "An LLM chatbot or AI assistant live inside your product",
        body: "from the team lead who shipped the production frontend for Sky's chatbot and built the documentation pipeline that generated its training data.",
      },
      {
        lead: "Your protocol connected to the wider ecosystem",
        body: "smart-contract integration, including other platforms' contracts: Morpho, Curve, Pendle, and Spark are on the record.",
      },
      {
        lead: "An SDK/library layer for your protocol",
        body: "so integrators and internal teams can build on it without touching raw contracts.",
      },
    ],
  },
  {
    name: "Advise",
    items: [
      {
        lead: "Web3 best practices, from someone who has lived them",
        body: "dApp and wallet UX, governance rollouts, multi-network architecture, geo/compliance handling, and the operational habits of a top protocol, drawn from eight years shipping inside one.",
      },
      {
        lead: "Your engineering team getting real output from coding agents",
        body: "hands-on optimization of agent integrations and workflows, drawn from an agent-assisted engineering practice on protocol software.",
      },
    ],
  },
];

export function Services() {
  return (
    <section id="services" className="scroll-mt-20 border-t border-border">
      <div className="mx-auto w-full max-w-5xl px-6 py-20 sm:px-12 sm:py-28">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted">
          Services
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          Protocol to pixels, end to end.
        </h2>
        <div className="mt-14 grid gap-12 md:grid-cols-3">
          {GROUPS.map((group) => (
            <div key={group.name}>
              <h3 className="border-b border-border pb-3 text-lg font-semibold tracking-tight">
                {group.name}
              </h3>
              <ul className="mt-6 space-y-6">
                {group.items.map((item) => (
                  <li key={item.lead} className="text-sm leading-relaxed">
                    <span className="font-medium">{item.lead}</span>{" "}
                    <span className="text-muted">— {item.body}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
