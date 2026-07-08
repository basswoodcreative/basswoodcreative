import { MAILTO } from "../data/site";

export function Hero() {
  return (
    <section className="component" id="hero">
      <h1 className="max-w-3xl text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl">
        Protocol-grade frontends.
      </h1>
      <p className="mt-8 max-w-2xl text-lg leading-relaxed text-muted sm:text-xl">
        Basswood Creative builds interfaces users trust with real money — dApps,
        governance dashboards, and on-chain position management for teams whose
        frontends carry actual user funds.
      </p>
      <div className="mt-10 flex flex-wrap items-center gap-4">
        <a
          href={MAILTO}
          className="inline-flex h-12 items-center rounded-full bg-foreground px-8 text-sm font-medium text-background transition-colors hover:bg-accent"
        >
          Start a conversation
        </a>
        <a
          href="/#work"
          className="inline-flex h-12 items-center rounded-full border border-border px-8 text-sm font-medium text-muted transition-colors hover:border-foreground hover:text-foreground"
        >
          See the work ↓
        </a>
      </div>
    </section>
  );
}
