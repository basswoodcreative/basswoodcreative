import Link from "next/link";

export function About() {
  return (
    <section id="about" className="scroll-mt-20 border-t border-border">
      <div className="mx-auto w-full max-w-5xl px-6 py-20 sm:px-12 sm:py-28">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted">
          About the principal
        </p>
        {/* headshot pending from Phil */}
        <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          Phil Bain
        </h2>
        <p className="mt-6 max-w-3xl text-base leading-relaxed text-muted">
          Phil Bain has spent ~11 years as a professional software engineer,
          including eight at Sky Protocol (formerly MakerDAO, 2018–2026), rising
          from developer to co-founder and team lead of Jetstream — the
          independent Swiss association contracted by the protocol as its
          primary UI development team. He works across the full stack — React,
          TypeScript, Next.js — and the infrastructure underneath it (Vercel,
          Cloudflare, AWS), and spoke at the Devconnect 2025 App Town Hall in
          Buenos Aires, billed alongside leaders of Uniswap, Safe, Lido, Aave,
          and ENS. He holds an M.A. in Emergent Digital Practices from the
          University of Denver.
        </p>
        <p className="mt-6 text-sm text-muted">
          <Link
            href="/resume"
            className="font-medium text-foreground underline decoration-border underline-offset-4 transition-colors hover:decoration-foreground"
          >
            Full resume →
          </Link>{" "}
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
