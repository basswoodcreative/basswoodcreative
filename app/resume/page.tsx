import type { Metadata } from "next";
import { Nav } from "../components/nav";
import { Footer } from "../components/footer";
import { EMAIL, MAILTO } from "../data/site";
import { PrintButton } from "./print-button";

export const metadata: Metadata = {
  title: { absolute: "Phil Bain — Resume" },
  description:
    "Resume of Phil Bain, independent software consultant — protocol-grade frontends via Basswood Creative. Eight years at Sky Protocol (formerly MakerDAO).",
};

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mt-12 border-b border-border pb-2 text-xl font-semibold tracking-tight print:mt-6">
      {children}
    </h2>
  );
}

function ExtLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      rel="noopener"
      className="underline decoration-border underline-offset-4 transition-colors hover:text-foreground"
    >
      {children}
    </a>
  );
}

export default function Resume() {
  return (
    <div className="flex min-h-screen flex-col font-sans">
      <Nav />
      <main className="flex-1">
        <article className="mx-auto w-full max-w-3xl px-6 py-16 sm:px-8 sm:py-20 print:py-0">
          <header className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-4xl font-semibold tracking-tight">
                Phil Bain
              </h1>
              <p className="mt-2 font-medium">
                Independent Software Consultant — Protocol-grade frontends ·
                Basswood Creative
              </p>
              <p className="mt-3 text-sm text-muted">
                <a href={MAILTO} className="hover:text-foreground">
                  {EMAIL}
                </a>{" "}
                · <ExtLink href="https://basswoodcreative.com">basswoodcreative.com</ExtLink> ·{" "}
                <ExtLink href="https://philbain.com">philbain.com</ExtLink> ·{" "}
                GitHub: <ExtLink href="https://github.com/b-pmcg">github.com/b-pmcg</ExtLink> · Remote
              </p>
            </div>
            <PrintButton />
          </header>

          <SectionHeading>Summary</SectionHeading>
          <div className="mt-4 space-y-3 text-sm leading-relaxed text-muted">
            <p>
              Roughly 11 years of professional software development, including
              eight years at Sky Protocol (formerly MakerDAO), 2018–2026 —
              progressing from developer to co-founder and team lead of
              Jetstream, the independent Swiss association that served as the
              primary UI development team for the Sky Protocol, delivering the
              flagship Sky.money webapp with input from the founder, executives,
              and third-party design consultants.
            </p>
            <p>
              Through Basswood Creative, builds protocol-grade frontends for
              teams whose interfaces carry real user funds: governance
              dashboards, on-chain position management, SDKs, and smart-contract
              integration in React and TypeScript.
            </p>
            <p>
              Has already shipped AI in a DeFi product — leading the team that
              delivered the production frontend for Sky&apos;s LLM chatbot
              (production, non-U.S. markets) — and built the
              documentation-corpus pipeline that generated its LLM training
              data.
            </p>
            <p>
              Available for fractional frontend lead, project-based, and
              retainer engagements — remote, with eight years of remote delivery
              behind it. Booking engagements from September 2026.
            </p>
          </div>

          <SectionHeading>Core Skills</SectionHeading>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted">
            <li>
              <span className="font-medium text-foreground">Frontend</span> —
              React, TypeScript; dashboard-heavy application design; DAO-wide
              design system development; Angular (earlier career)
            </li>
            <li>
              <span className="font-medium text-foreground">
                Web3 / Blockchain
              </span>{" "}
              — smart-contract integration; wallet integrations; multi-network
              L2 support; subgraph architecture and blockchain indexers; DeFi
              governance and vault/CDP tooling; third-party protocol
              integrations
            </li>
            <li>
              <span className="font-medium text-foreground">AI</span> —
              production frontend delivery for an LLM chatbot in a DeFi product;
              documentation-corpus pipeline generating LLM training data, FAQ
              modules, and tooltips
            </li>
            <li>
              <span className="font-medium text-foreground">
                Infrastructure &amp; Data
              </span>{" "}
              — Vercel, Cloudflare, AWS subgraph hosting; analytics (PostHog,
              Mixpanel, Google Analytics, cookie3); Sentry monitoring;
              compliance tooling (TRM Labs, MaxMind); SQL
            </li>
            <li>
              <span className="font-medium text-foreground">
                Leadership &amp; Delivery
              </span>{" "}
              — co-founded and led a team of 8; founded a DAO core unit;
              requirements intake from executives including the founder;
              third-party integration coordination; JS library/SDK development;
              eight years of fully remote delivery
            </li>
          </ul>

          <SectionHeading>Experience</SectionHeading>

          <h3 className="mt-6 text-lg font-semibold tracking-tight">
            Sky Protocol (formerly MakerDAO) — 2018–2026
          </h3>
          <p className="mt-2 text-sm italic text-muted">
            Decentralized finance protocol. Eight-year continuous tenure,
            developer to co-founder/team lead of the protocol&apos;s primary UI
            team.
          </p>

          <h4 className="mt-6 text-base font-semibold">
            Jetstream — Co-Founder &amp; Team Lead (2023–2026)
          </h4>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted">
            <li>
              Co-founded and led Jetstream — an independent Swiss association
              contracted by MakerDAO governance as the primary UI development
              team for the Sky Protocol — a team of 8 (5 developers, 1 designer,
              1 QA engineer, 1 project manager); owned architectural decisions,
              product feature design, daily operations, requirements intake from
              executives including the founder, and served as a multisig signer,
              with budgets and work agreements ratified by governance.
            </li>
            <li>
              Shipped the flagship{" "}
              <ExtLink href="https://app.sky.money">Sky.money webapp</ExtLink> —
              several products under one integrated UI, the official frontend of
              the Sky Ecosystem, fully designed and developed by Jetstream with
              input from the founder, executives, and third-party design
              consultants. The webapp fronts a protocol holding{" "}
              <strong className="font-medium text-foreground">
                $6B TVL (peak ~$20B, 2021)
              </strong>
              , whose Savings module alone holds{" "}
              <strong className="font-medium text-foreground">$5.6B</strong>,
              behind the{" "}
              <strong className="font-medium text-foreground">
                #3 and #4 largest stablecoins (USDS + DAI, $12.8B combined)
              </strong>
              .
            </li>
            <li>
              Delivered multi-network support across four L2s (Arbitrum, Base,
              Optimism, Unichain), wallet integrations, geo-specific site
              builds, analytics integration, and a &quot;linked actions&quot;
              feature chaining product features together.
            </li>
            <li>
              Oversaw the voting-portal refactor and deployment accompanying the
              MKR→SKY token conversion (
              <ExtLink href="https://vote.sky.money">vote.sky.money</ExtLink>) —
              a migration that has since converted{" "}
              <strong className="font-medium text-foreground">
                90%+ of a ~$1.2B token supply
              </strong>
              ; assisted the MakerDAO→Sky rebrand and relaunch (Sept 2024,
              covered by CoinDesk and Bloomberg).
            </li>
            <li>
              Published the open-source Widgets package (self-contained UI
              modules: Savings, Rewards, Upgrade, Trade, Balances) and Hooks
              package (React hooks interfacing with Sky smart contracts).
            </li>
            <li>
              Led the team that delivered the production frontend for
              Sky&apos;s LLM chatbot — an assistant answering questions about
              the Sky Ecosystem and webapp; the LLM itself was built and managed
              by a separate organization. Shipped to production (non-U.S.
              markets).
            </li>
            <li>
              Built the documentation-corpus pipeline (bash + tagging system)
              that generated the chatbot&apos;s LLM training data, frontend FAQ
              modules, and tooltips.
            </li>
            <li>
              Managed the complete migration of Sky Ecosystem frontend
              infrastructure from a third-party consultant to in-house — Vercel
              hosting, Cloudflare proxy, AWS subgraph hosting — and administered
              PostHog, Mixpanel, Google Analytics, and cookie3 analytics, Sentry
              monitoring, TRM Labs sanctions compliance, and MaxMind VPN
              blocking.
            </li>
            <li>
              Designed and deployed the subgraph architecture indexing Sky
              protocol transactions for historical data in the UI.
            </li>
            <li>
              Coordinated third-party protocol integrations including Morpho,
              Curve, Pendle, and Spark, plus a governance collaboration with
              Boardroom.
            </li>
            <li>
              Spoke at the DevConnect 2025 App Town Hall (Buenos Aires) on the
              UI/UX challenges of the rebrand and webapp release; delivered
              dozens of internal demos and workshops.
            </li>
          </ul>

          <h4 className="mt-6 text-base font-semibold">
            DUX (Development and UX) Core Unit — Founder &amp; Facilitator
            (2021–2023)
          </h4>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted">
            <li>
              Founded the DUX Core Unit and the DX team; as Facilitator,
              combined hands-on software engineering with managing the
              team&apos;s presence in the MakerDAO ecosystem — running a{" "}
              <strong className="font-medium text-foreground">
                publicly ratified engineering budget (~$1.9M/yr at peak)
              </strong>{" "}
              through governance-approved proposals, org-wide product updates,
              and feature releases.
            </li>
            <li>
              Led development and maintenance of the MakerDAO Governance Portal
              — the voting interface where token holders manage on-chain
              governance; the portal lineage has carried{" "}
              <strong className="font-medium text-foreground">
                ~1,350 governance polls and 250+ executive votes
              </strong>
              , with{" "}
              <strong className="font-medium text-foreground">
                ~$400M of voting power
              </strong>{" "}
              participating today.
            </li>
            <li>
              Developed the frontend design system used across DAO-wide
              applications.
            </li>
          </ul>

          <h4 className="mt-6 text-base font-semibold">
            Developer → Senior Developer (2018–2021)
          </h4>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted">
            <li>
              Frontend and full-stack development across protocol products,
              including the dai.js SDK and plugins (the original service-based
              SDK for the protocol —{" "}
              <strong className="font-medium text-foreground">
                130K+ lifetime npm downloads
              </strong>
              ), the gov-polling-db blockchain indexer (built before subgraphs
              existed), the OasisDEX MCD CDP portal, the migrate-dashboard, and
              testchain tooling.
            </li>
            <li>
              On duty during the March 12, 2020 market crash — an event that saw{" "}
              <strong className="font-medium text-foreground">
                $8.32M liquidated for zero DAI
              </strong>{" "}
              — deploying an emergency auctions dashboard (Auction Helper) to
              combat the opportunistic liquidation bots responsible.
            </li>
            <li>Assisted the Multi-Collateral DAI deployment.</li>
          </ul>

          <h3 className="mt-8 text-lg font-semibold tracking-tight">
            OrthoFi — 2016–2018
          </h3>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted">
            <li>
              C#, TypeScript, Angular, SQL; grew from individual contributor
              into leading several new-feature rollouts.
            </li>
          </ul>

          <h3 className="mt-8 text-lg font-semibold tracking-tight">
            University of Denver Library — 2015–2016
          </h3>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted">
            <li>First professional engineering role.</li>
          </ul>

          <SectionHeading>Selected Work</SectionHeading>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted">
            <li>
              <span className="font-medium text-foreground">
                Sky.money webapp
              </span>{" "}
              — flagship UI of the Sky Ecosystem; several protocol products
              under one integrated frontend.{" "}
              <ExtLink href="https://app.sky.money">app.sky.money</ExtLink> ·{" "}
              <ExtLink href="https://github.com/jetstreamgg/tarmac/tree/development/apps/webapp">
                github.com/jetstreamgg/tarmac
              </ExtLink>
            </li>
            <li>
              <span className="font-medium text-foreground">
                Sky Voting Portal
              </span>{" "}
              — governance voting interface; oversaw the refactor and deployment
              accompanying the MKR→SKY conversion.{" "}
              <ExtLink href="https://vote.sky.money">vote.sky.money</ExtLink>
            </li>
            <li>
              <span className="font-medium text-foreground">
                Widgets &amp; Hooks packages
              </span>{" "}
              — open-source UI modules and React hooks interfacing with Sky
              smart contracts.{" "}
              <ExtLink href="https://github.com/jetstreamgg/tarmac">
                github.com/jetstreamgg/tarmac
              </ExtLink>
            </li>
            <li>
              <span className="font-medium text-foreground">
                governance-portal-v2
              </span>{" "}
              — MakerDAO governance portal built and maintained by the DUX Core
              Unit.{" "}
              <ExtLink href="https://github.com/skybase-foundation/governance-portal-v2">
                github.com/skybase-foundation/governance-portal-v2
              </ExtLink>
            </li>
            <li>
              <span className="font-medium text-foreground">
                dai.js SDK &amp; plugins
              </span>{" "}
              (archived) — original service-based SDK for interacting with the
              protocol.{" "}
              <ExtLink href="https://github.com/sky-ecosystem/dai.js">
                github.com/sky-ecosystem/dai.js
              </ExtLink>
            </li>
            <li>
              <span className="font-medium text-foreground">
                Auction Helper
              </span>{" "}
              — emergency auctions dashboard deployed during the March 12, 2020
              crash.{" "}
              <ExtLink href="https://github.com/b-pmcg/auction-helper">
                github.com/b-pmcg/auction-helper
              </ExtLink>
            </li>
            <li>
              <span className="font-medium text-foreground">
                gov-polling-db
              </span>{" "}
              — blockchain indexer for governance polling, built before
              subgraphs existed.{" "}
              <ExtLink href="https://github.com/sky-ecosystem/gov-polling-db">
                github.com/sky-ecosystem/gov-polling-db
              </ExtLink>
            </li>
          </ul>

          <SectionHeading>Education</SectionHeading>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted">
            <li>
              <span className="font-medium text-foreground">
                M.A., Emergent Digital Practices
              </span>{" "}
              — University of Denver, 2015
            </li>
          </ul>
        </article>
      </main>
      <Footer />
    </div>
  );
}
