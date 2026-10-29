import Link from "next/link";

// How you buy: the offer ladder, smallest step first (bwc vault, 65 §2.4).
const RUNGS: { name: string; tagline: string; body: string; link?: { href: string; label: string } }[] = [
  {
    name: "Free check-up",
    tagline: "30 minutes, one real fix.",
    body: "Walk me through your setup and where it hurts. You leave with at least one concrete change to make this week, whether or not we work together.",
  },
  {
    name: "Agent Workflow Review",
    tagline: "Two weeks. Fixed fee. You keep the fixes.",
    body: "I read your repos, agent setup, session logs and review history, talk to the team, and hand back a ranked findings memo, a baseline scorecard and a pull request with the top fixes already made.",
    link: { href: "/diagnostic", label: "How the review works →" },
  },
  {
    name: "Build-out & enablement",
    tagline: "Three to six weeks.",
    body: "The review's roadmap, implemented: instruction architecture, skills and MCP servers, review and CI wiring, guardrails and evals, plus a team workshop and 30 days of office hours.",
  },
  {
    name: "Fractional lead",
    tagline: "About a day a week.",
    body: "Ongoing ownership of your agent setup as models and tools change: monthly measurement, tool evaluations, and a harness that doesn't go stale.",
  },
];

export function Engagements() {
  return (
    <section className="component" id="engagements">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted">
          Engagements
        </p>
        <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
          Start small. Keep the fixes.
        </h2>
        <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted">
          Every engagement is delivered by me directly, with no handoffs and no
          bench, for a few clients at a time.
        </p>
        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {RUNGS.map((rung) => (
            <div key={rung.name} className="rounded-2xl border border-border p-7">
              <h3 className="text-base font-semibold tracking-tight">
                {rung.name}
              </h3>
              <p className="mt-1 text-sm font-medium text-muted italic">
                {rung.tagline}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                {rung.body}
              </p>
              {rung.link && (
                <p className="mt-4 text-sm">
                  <Link
                    href={rung.link.href}
                    className="font-medium text-foreground underline decoration-border underline-offset-4 transition-colors hover:decoration-foreground"
                  >
                    {rung.link.label}
                  </Link>
                </p>
              )}
            </div>
          ))}
        </div>
        <p className="mt-10 max-w-2xl text-sm leading-relaxed text-muted">
          Custom builds (internal agents, tools, MCP servers) are scoped as
          projects, and local or hybrid infrastructure comes as a module. Remote
          by default; on-site in the Denver area.
        </p>
      </div>
    </section>
  );
}
