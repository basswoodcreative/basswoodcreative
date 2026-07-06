import Link from "next/link";
import { MAILTO } from "../data/site";

const LINKS = [
  { href: "/#services", label: "Services" },
  { href: "/#work", label: "Work" },
  { href: "/#about", label: "About" },
  { href: "/insights", label: "Insights" },
];

export function Nav() {
  return (
    <header className="print-hidden sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur">
      <nav className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4 sm:px-12">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          Basswood Creative
        </Link>
        <div className="flex items-center gap-6">
          <div className="hidden items-center gap-6 sm:flex">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-muted transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <a
            href={MAILTO}
            className="inline-flex h-9 items-center rounded-full bg-foreground px-5 text-sm font-medium text-background transition-colors hover:bg-accent"
          >
            Start a conversation
          </a>
        </div>
      </nav>
    </header>
  );
}
