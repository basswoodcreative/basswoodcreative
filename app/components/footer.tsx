import { EMAIL, MAILTO, X_HANDLE, X_URL } from "../data/site";

export function Footer() {
  return (
    <footer className="print-hidden relative z-[1] border-t border-border">
      <p className="silk mx-auto w-full max-w-5xl px-6 pt-6 leading-relaxed text-muted sm:px-12">
        SET IN BRICOLAGE GROTESQUE &amp; IBM PLEX MONO · HAND-ROLLED SVG · NO
        TRACKING · DATA &amp; CAPTURES REFRESH AT BUILD TIME
      </p>
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center justify-between gap-4 px-6 py-6 text-sm text-muted sm:flex-row sm:px-12">
        <p>&copy; {new Date().getFullYear()} Basswood Creative</p>
        <div className="flex items-center gap-6">
          <a
            href={MAILTO}
            className="transition-colors hover:text-foreground"
          >
            {EMAIL}
          </a>
          <a
            href={X_URL}
            rel="noopener"
            className="transition-colors hover:text-foreground"
          >
            {X_HANDLE}
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
