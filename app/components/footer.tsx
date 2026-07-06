import { EMAIL, MAILTO } from "../data/site";

export function Footer() {
  return (
    <footer className="print-hidden border-t border-border">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center justify-between gap-4 px-6 py-10 text-sm text-muted sm:flex-row sm:px-12">
        <p>&copy; {new Date().getFullYear()} Basswood Creative</p>
        <div className="flex items-center gap-6">
          <a
            href={MAILTO}
            className="transition-colors hover:text-foreground"
          >
            {EMAIL}
          </a>
          <a
            href="https://philbain.com"
            rel="noopener"
            className="transition-colors hover:text-foreground"
          >
            philbain.com
          </a>
        </div>
      </div>
    </footer>
  );
}
