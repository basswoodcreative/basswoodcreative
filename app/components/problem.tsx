// The gap: what goes wrong after the seats are bought (bwc vault, 65 §2.2).
// Problem statements, never styled as client quotes.
const PAINS = [
  "Review is drowning. Agents open pull requests faster than your team can read them.",
  "The token bill climbs every month, and nobody can say what it bought.",
  "The agent keeps losing the plot on your codebase.",
  "Your code can't leave the building, so half the tooling is off the table.",
];

export function Problem() {
  return (
    <section className="component" id="problem">
      <span className="silk seclabel">THE GAP</span>
      <h2 className="sec">You bought the seats. The numbers didn&apos;t move.</h2>
      <ul className="mt-6 grid gap-x-8 sm:grid-cols-2" role="list">
        {PAINS.map((pain, i) => (
          <li key={pain} className="flex gap-4 border-t border-border py-4 leading-relaxed">
            <span className="silk pt-1 text-muted" aria-hidden="true">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span>{pain}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
