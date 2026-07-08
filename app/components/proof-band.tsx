import { STATS } from "../data/site";

export function ProofBand() {
  return (
    <section className="component" id="proof">
      <div>
        <p className="max-w-3xl text-sm leading-relaxed text-muted">
          <span className="font-medium text-foreground">
            The numbers behind the work
          </span>{" "}
          — public, sourced, and describing the Sky Protocol systems
          Basswood&apos;s principal helped build and front for eight years.
        </p>
        <dl className="mt-10 grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-3 lg:grid-cols-5">
          {STATS.map((stat) => (
            <div key={stat.value}>
              <dt className="sr-only">{stat.label}</dt>
              <dd className="text-3xl font-semibold tracking-tight">
                {stat.value}
              </dd>
              <p className="mt-2 text-sm leading-snug text-muted">
                {stat.label}
                {stat.note ? (
                  <span className="italic"> ({stat.note})</span>
                ) : null}
              </p>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
