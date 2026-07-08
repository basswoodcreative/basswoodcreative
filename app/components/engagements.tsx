const SHAPES = [
  {
    name: "Fractional frontend lead",
    tagline: "Your flagship UI, owned.",
    body: "A centerpiece of the practice: senior ownership of your interface — architecture, product decisions, founder-level requirements intake — part-time and ongoing.",
  },
  {
    name: "Project",
    tagline: "Scoped, shipped, handed over.",
    body: "A defined build with a defined end date — a new dApp, a governance portal, an LLM integration. Scoped together up front, delivered documented, yours to run.",
  },
  {
    name: "Retainer",
    tagline: "Senior judgment, on call.",
    body: "Standing capacity for teams that ship continuously — features, reviews, and architecture without spinning up a new engagement each time.",
  },
];

export function Engagements() {
  return (
    <section className="component" id="engagements">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted">
          Consulting engagements
        </p>
        <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
          A solo practice by design.
        </h2>
        <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted">
          Every engagement is delivered directly by the principal — no handoffs,
          no bench.
        </p>
        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {SHAPES.map((shape) => (
            <div key={shape.name} className="rounded-2xl border border-border p-7">
              <h3 className="text-base font-semibold tracking-tight">
                {shape.name}
              </h3>
              <p className="mt-1 text-sm font-medium text-muted italic">
                {shape.tagline}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                {shape.body}
              </p>
            </div>
          ))}
        </div>
        <p className="mt-10 max-w-2xl text-sm leading-relaxed text-muted">
          The practice works remotely — as it has for eight years of protocol
          delivery — and serves a small number of concurrent clients, taken only
          where the fit is strong: web3 frontends, smart-contract integration,
          AI features.
        </p>
      </div>
    </section>
  );
}
