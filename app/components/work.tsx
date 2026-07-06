const PROJECTS = [
  {
    title: "Sky.money webapp",
    body: "Flagship UI of the Sky Protocol (formerly MakerDAO): several products under one integrated interface, the protocol's official frontend, fully designed and built by Jetstream — the eight-person team Basswood's principal co-founded and led — with direct input from the protocol's founder. Five networks (Ethereum + Arbitrum, Base, Optimism, Unichain), wallet integrations, geo-specific builds. The protocol holds $6B in TVL; the Savings module alone, $5.6B.",
    links: [
      { label: "app.sky.money", href: "https://app.sky.money" },
      {
        label: "github.com/jetstreamgg/tarmac",
        href: "https://github.com/jetstreamgg/tarmac",
      },
    ],
    featured: true,
  },
  {
    title: "Sky voting portal",
    body: "Oversaw the refactor and deployment accompanying the MKR→SKY token conversion (90%+ of a ~$1.2B token supply migrated); the latest of a portal lineage that has carried ~1,350 governance polls with ~$400M of voting power participating today.",
    links: [{ label: "vote.sky.money", href: "https://vote.sky.money" }],
  },
  {
    title: "Widgets & Hooks (open source)",
    body: "Self-contained UI modules for Sky's financial products and the React hooks that interface with its smart contracts — the SDK layer that lets other teams build on the protocol.",
    links: [
      {
        label: "github.com/jetstreamgg/tarmac",
        href: "https://github.com/jetstreamgg/tarmac",
      },
    ],
  },
  {
    title: "LLM chatbot frontend",
    body: "Led the team that delivered the production frontend for Sky's ecosystem assistant (live in non-U.S. markets), plus the documentation-corpus pipeline that generated its training data, FAQ modules, and tooltips. The LLM itself was built and managed by a separate organization.",
    links: [],
  },
  {
    title: "Black Thursday — March 12, 2020",
    body: "On the front line during the crash, deploying an emergency auctions dashboard overnight to combat opportunistic liquidation bots threatening bad debt in the system.",
    links: [
      {
        label: "github.com/b-pmcg/auction-helper",
        href: "https://github.com/b-pmcg/auction-helper",
      },
    ],
  },
];

export function Work() {
  return (
    <section id="work" className="scroll-mt-20 border-t border-border">
      <div className="mx-auto w-full max-w-5xl px-6 py-20 sm:px-12 sm:py-28">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted">
          Selected work
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          Shipped, public, verifiable — check the commits.
        </h2>
        <div className="mt-14 grid gap-6 sm:grid-cols-2">
          {PROJECTS.map((project) => (
            <article
              key={project.title}
              className={`rounded-2xl border border-border p-7 ${
                project.featured ? "sm:col-span-2" : ""
              }`}
            >
              <h3 className="text-lg font-semibold tracking-tight">
                {project.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                {project.body}
              </p>
              {project.links.length > 0 ? (
                <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2">
                  {project.links.map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      rel="noopener"
                      className="font-mono text-xs text-muted underline decoration-border underline-offset-4 transition-colors hover:text-foreground"
                    >
                      {link.label} ↗
                    </a>
                  ))}
                </div>
              ) : null}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
