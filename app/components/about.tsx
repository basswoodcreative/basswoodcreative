import Link from "next/link";
import { LINKEDIN_URL } from "../data/site";

export function About() {
  return (
    <section id="about" className="component">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted">
          About
        </p>
        {/* headshot pending from Phil */}
        <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          Phil Bain
        </h2>
        <p className="mt-6 max-w-3xl text-base leading-relaxed text-muted">
          Phil Bain runs Basswood Creative, an agentic-engineering practice for
          software teams, from Colorado. For the last two years he has built
          software almost entirely through coding agents, on frontier models and
          on his own local inference hardware, and he writes up the builds and
          the failure modes in public. Before that he spent eight years at Sky
          (formerly MakerDAO, 2018–2026), rising from developer to co-founder
          and team lead of Jetstream, the independent studio contracted as the
          protocol&apos;s primary UI team, and spoke at the Devconnect 2025 App
          Town Hall in Buenos Aires. He holds an M.A. in Emergent Digital
          Practices from the University of Denver.
        </p>
        <p className="mt-6 text-sm text-muted">
          <Link
            href="/resume"
            className="font-medium text-foreground underline decoration-border underline-offset-4 transition-colors hover:decoration-foreground"
          >
            Full resume →
          </Link>{" "}
          ·{" "}
          <a
            href={LINKEDIN_URL}
            rel="noopener"
            className="underline decoration-border underline-offset-4 transition-colors hover:text-foreground"
          >
            LinkedIn
          </a>{" "}
          · More of the person at{" "}
          <a
            href="https://philbain.com"
            rel="noopener"
            className="underline decoration-border underline-offset-4 transition-colors hover:text-foreground"
          >
            philbain.com
          </a>
          .
        </p>
      </div>
    </section>
  );
}
