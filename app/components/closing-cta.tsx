import { EMAIL, MAILTO } from "../data/site";

export function ClosingCta() {
  return (
    <section className="component" id="contact">
      <div className="flex w-full flex-col items-center py-8 text-center">
        <h2 className="max-w-2xl text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
          Have a frontend that carries real funds — or one that needs to?
        </h2>
        <a
          href={MAILTO}
          className="mt-10 inline-flex h-12 items-center rounded-full bg-foreground px-8 text-sm font-medium text-background transition-colors hover:bg-accent"
        >
          Start a conversation
        </a>
        <p className="mt-5 text-sm text-muted">{EMAIL}</p>
      </div>
    </section>
  );
}
