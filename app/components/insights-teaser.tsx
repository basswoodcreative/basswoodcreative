import Link from "next/link";

export function InsightsTeaser() {
  return (
    <section className="component" id="insights">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted">
          Insights
        </p>
        <p className="mt-4 max-w-2xl text-base leading-relaxed">
          <span className="font-medium">Writing is on the way.</span>{" "}
          <span className="text-muted">
            Essays on protocol frontends, governance UX, and agent-assisted
            engineering — published here first, mirrored to Protocol Grade.
          </span>
        </p>
        <p className="mt-5">
          <Link
            href="/insights"
            className="text-sm font-medium underline decoration-border underline-offset-4 transition-colors hover:decoration-foreground"
          >
            Visit Insights →
          </Link>
        </p>
      </div>
    </section>
  );
}
