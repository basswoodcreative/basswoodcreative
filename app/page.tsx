export default function Home() {
  return (
    <div className="flex min-h-screen flex-col font-sans">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-6 sm:px-12">
        <span className="text-lg font-semibold tracking-tight">
          Basswood Creative
        </span>
        <a
          href="mailto:hello@basswoodcreative.com"
          className="text-sm text-muted transition-colors hover:text-foreground"
        >
          Get in touch
        </a>
      </nav>

      {/* Hero */}
      <main className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <h1 className="max-w-2xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl md:text-6xl">
          We build software
          <br />
          <span className="text-muted">that works.</span>
        </h1>
        <p className="mt-6 max-w-md text-lg leading-relaxed text-muted">
          Modern websites and web applications, crafted with care.
          From concept to launch.
        </p>
        <a
          href="mailto:hello@basswoodcreative.com"
          className="mt-10 inline-flex h-12 items-center rounded-full bg-foreground px-8 text-sm font-medium text-background transition-colors hover:bg-accent"
        >
          Start a conversation
        </a>
      </main>

      {/* Footer */}
      <footer className="flex items-center justify-center px-6 py-8">
        <p className="text-sm text-muted">
          &copy; {new Date().getFullYear()} Basswood Creative
        </p>
      </footer>
    </div>
  );
}
