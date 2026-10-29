import type { Metadata } from "next";
import { Nav } from "../components/nav";
import { Footer } from "../components/footer";
import { ClosingCta } from "../components/closing-cta";
import { BOOKING, OG_IMAGE } from "../data/site";

// The front door: the Agent Workflow Review (bwc vault, 65 §3–§4). The URL
// stays /diagnostic whatever the wedge ends up being called (64 §4).

const DESCRIPTION =
  "Two weeks, fixed fee: a review of how your team actually uses coding agents, ending with a findings memo, a baseline scorecard and a pull request with the top fixes.";

export const metadata: Metadata = {
  title: "Agent Workflow Review",
  description: DESCRIPTION,
  openGraph: {
    type: "website",
    siteName: "Basswood Creative",
    url: "https://basswoodcreative.com/diagnostic",
    title: "Agent Workflow Review — Basswood Creative",
    description: DESCRIPTION,
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "Agent Workflow Review — Basswood Creative",
    description: DESCRIPTION,
  },
};

const LOOK_AT = [
  "Read access to one or two repositories",
  "Your agent setup: CLAUDE.md / AGENTS.md, skills, MCP servers, hooks, CI wiring and permissions",
  "A sample of real agent sessions, chosen by you",
  "60–90 days of pull-request and review history",
  "What you spend on AI tools",
  "45-minute conversations with the engineering lead and three to five engineers",
];

const YOU_GET = [
  "A findings memo, ten pages at most, ranked by impact: where agents help, where they break (context loss, instruction bloat, review bottlenecks, unsafe tool permissions, cost leaks) and why.",
  "A pull request with the top three to five fixes already implemented, for your team to review and merge.",
  "A baseline scorecard to measure future changes against: spend per developer, review time, PR size, rework signals.",
  "A 60-minute session walking your team through all of it.",
  "A scoped proposal for what comes next, if anything should.",
];

const TIMELINE = [
  { when: "Before day one", what: "NDA signed, access set up, the session sample exported." },
  { when: "Week one", what: "Reading the setup, the sessions and the history; the interviews." },
  { when: "Week two", what: "Findings, the fix PR and the scorecard; the team walkthrough on the last day." },
];

const NOT_INCLUDED = [
  "Production deploys",
  "More than two repositories",
  "Vendor selection beyond a recommendation",
  "More than one on-site session (Denver area)",
  "Support after delivery (that's the fractional engagement)",
];

// Commitments: each has to be true of how Phil actually works (65 §4). No. 5
// reworded per Phil (2026-10-29): local-only runs on the client's hardware.
const COMMITMENTS = [
  { title: "NDA first.", body: "A mutual NDA, yours or mine, signed before any access." },
  {
    title: "Least access.",
    body: "Access that can read the agreed repositories and open a pull request, and nothing that can merge or deploy. It's revoked the day we finish. No production systems, customer data or secrets; I don't need them.",
  },
  {
    title: "You choose what I see.",
    body: "You export the session sample and strip anything sensitive first. If a secret turns up anyway, I tell you and delete it.",
  },
  {
    title: "Fixes arrive as a pull request.",
    body: "Your team reviews and merges. I never merge, deploy or touch production.",
  },
  {
    title: "No training on your code.",
    body: "Your material is only processed by AI services whose terms exclude training on it. If you'd rather nothing leave the building, I work only with local models on hardware you own, and setting that up can be part of the engagement.",
  },
  {
    title: "Deleted at the end.",
    body: "Within 30 days of delivery I delete your material and confirm in writing. The deliverables are yours.",
  },
  {
    title: "Nothing published without you.",
    body: "The engagement is confidential. Any case study is written with you and published only with your written approval.",
  },
];

const FAQ: { q: string; a: React.ReactNode }[] = [
  {
    q: "Which tools do you work with?",
    a: "Whatever your team uses: Claude Code, Cursor, Copilot, Codex, or open-weight models run locally. The failure modes (context, instructions, review, permissions, cost) are mostly the same across tools, and I'll say up front if something is outside what I know.",
  },
  {
    q: "Remote or on-site?",
    a: "Remote by default. One on-site session in the Denver area is included.",
  },
  {
    q: "Do you need production or customer data?",
    a: (
      <>
        No. See{" "}
        <a href="#access" className="underline decoration-border underline-offset-4 transition-colors hover:text-foreground">
          access and data handling
        </a>
        .
      </>
    ),
  },
  {
    q: "What happens after?",
    a: "Most teams take the fixes and run. If the memo points at more work, the proposal scopes it: a three-to-six-week build-out, a fractional lead about a day a week, or a specific build. No obligation.",
  },
  {
    q: "How big a team is this for?",
    a: "Roughly 5 to 50 developers. A larger organization can start with one team.",
  },
];

const num = (i: number) => String(i + 1).padStart(2, "0");

export default function Diagnostic() {
  return (
    <div className="flex min-h-screen flex-col font-sans">
      <Nav />
      <main className="flex-1">
        <section className="component mt-14">
          <span className="silk seclabel">ENGAGEMENTS</span>
          <h1 className="text-4xl tracking-tight sm:text-5xl">Agent Workflow Review</h1>
          <p className="mt-4 text-xl font-medium tracking-tight">
            Two weeks. Fixed fee. You keep the fixes.
          </p>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted">
            A close look at how your team actually uses Claude Code, Cursor,
            Copilot or Codex: where the agents help, where they break, and why.
            It ends with the top fixes already made.
          </p>
          <p className="mt-8">
            <a className="btn-p" href={BOOKING}>
              Book a free 30-minute check-up
            </a>
          </p>
        </section>

        <section className="component">
          <h2 className="sec">Who it&apos;s for</h2>
          <p className="max-w-2xl leading-relaxed text-muted">
            Engineering teams of roughly 5 to 50 developers that already pay for
            coding agents and expected more from them. The person who calls is
            usually a CTO, VP of Engineering, head of platform or developer
            experience, or a founder who still reviews code.
          </p>
        </section>

        <section className="component">
          <div className="grid gap-10 sm:grid-cols-2">
            <div>
              <h2 className="sec">What I look at</h2>
              <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted">
                {LOOK_AT.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="sec">What you get</h2>
              <ol className="mt-4 space-y-3 text-sm leading-relaxed text-muted" role="list">
                {YOU_GET.map((item, i) => (
                  <li key={item} className="flex gap-3">
                    <span className="silk pt-0.5" aria-hidden="true">{num(i)}</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        <section className="component">
          <h2 className="sec">How the two weeks run</h2>
          <ol className="mt-4" role="list">
            {TIMELINE.map((step) => (
              <li key={step.when} className="grid gap-1 border-t border-border py-4 sm:grid-cols-[11rem_1fr] sm:gap-6">
                <span className="silk pt-1 text-muted">{step.when.toUpperCase()}</span>
                <span className="leading-relaxed">{step.what}</span>
              </li>
            ))}
          </ol>
          <h3 className="mt-8 text-base font-semibold tracking-tight">Not included</h3>
          <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted" role="list">
            {NOT_INCLUDED.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="component" id="access">
          <h2 className="sec">Access and data handling</h2>
          <ol className="mt-4 grid gap-x-8 sm:grid-cols-2" role="list">
            {COMMITMENTS.map((c, i) => (
              <li key={c.title} className="flex gap-4 border-t border-border py-4 text-sm leading-relaxed">
                <span className="silk pt-0.5 text-muted" aria-hidden="true">{num(i)}</span>
                <span>
                  <strong className="font-semibold">{c.title}</strong>{" "}
                  <span className="text-muted">{c.body}</span>
                </span>
              </li>
            ))}
          </ol>
        </section>

        <section className="component">
          <h2 className="sec">Price</h2>
          <p className="max-w-2xl leading-relaxed text-muted">
            A fixed fee, agreed before we start and quoted on the check-up call.
            Half on signing, half on delivery.
          </p>
        </section>

        <section className="component">
          <h2 className="sec">FAQ</h2>
          <dl className="mt-4">
            {FAQ.map(({ q, a }) => (
              <div key={q} className="border-t border-border py-4">
                <dt className="font-semibold tracking-tight">{q}</dt>
                <dd className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">{a}</dd>
              </div>
            ))}
          </dl>
        </section>

        <ClosingCta />
      </main>
      <Footer />
    </div>
  );
}
