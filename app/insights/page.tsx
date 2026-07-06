import type { Metadata } from "next";
import { Nav } from "../components/nav";
import { Footer } from "../components/footer";

export const metadata: Metadata = {
  title: "Insights",
  description:
    "Essays on protocol frontends, governance UX, and agent-assisted engineering from Basswood Creative.",
};

export default function Insights() {
  return (
    <div className="flex min-h-screen flex-col font-sans">
      <Nav />
      <main className="flex-1">
        <section className="mx-auto w-full max-w-5xl px-6 py-24 sm:px-12 sm:py-32">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted">
            Insights
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
            Writing is on the way.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">
            Essays on protocol frontends, governance UX, and agent-assisted
            engineering — published here first, mirrored to Protocol Grade.
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
}
