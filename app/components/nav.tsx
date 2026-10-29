"use client";

// Nav lockup (leaf mark + silk wordmark) and the choreographed menu
// overlay — which doubles as the mobile nav (closes the no-nav-below-640
// critical from the Phase 5 audit). Escape closes, focus returns to the
// opener. The theme seg is the manual mode toggle: it writes
// localStorage("mode") and flips the same data-mode attribute the
// pre-paint script in layout.tsx sets. The build stamp left in Phase A
// (Phil: clutter).

import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { BOOKING, MAILTO, EMAIL } from "../data/site";

const ROWS = [
  { href: "/#services", label: "Services" },
  { href: "/diagnostic", label: "Review" },
  { href: "/#track-record", label: "Track record" },
  { href: "/insights", label: "Insights" },
  { href: "/#about", label: "About" },
];

// The bar shows all five from 1024px; narrower, it fits four beside the
// button and Track record lives in the menu, which has them all.
const PAGELINKS = ROWS;
const WIDE_ONLY = "Track record";

// The theme lives on <html data-mode>, set before paint by layout.tsx; the
// nav reads it from there rather than keeping a copy in state.
function subscribeMode(onChange: () => void) {
  const watcher = new MutationObserver(onChange);
  watcher.observe(document.documentElement, { attributeFilter: ["data-mode"] });
  return () => watcher.disconnect();
}
const readMode = () => (document.documentElement.dataset.mode === "dark" ? "dark" : "light");
const serverMode = () => "light" as const;

function Leaf() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="var(--g1)"
      strokeWidth="1.5"
      aria-hidden="true"
    >
      <path d="M12 21 C12 21 4 15 4 9 C4 5.5 6.5 3.5 9 3.5 C10.3 3.5 11.4 4.1 12 5 C12.6 4.1 13.7 3.5 15 3.5 C17.5 3.5 20 5.5 20 9 C20 15 12 21 12 21 Z" />
      <path d="M12 5 L12 21" />
    </svg>
  );
}

export function Nav() {
  const [state, setState] = useState<"open" | "closing" | null>(null);
  const mode = useSyncExternalStore(subscribeMode, readMode, serverMode);
  const openBtn = useRef<HTMLButtonElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);

  const open = () => {
    setState("open");
    requestAnimationFrame(() => closeBtn.current?.focus());
  };
  const close = () => {
    setState("closing");
    openBtn.current?.focus();
  };

  useEffect(() => {
    if (state !== "open") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [state]);

  const setTheme = (m: "light" | "dark") => {
    document.documentElement.dataset.mode = m;
    try {
      localStorage.setItem("mode", m);
    } catch {}
  };

  return (
    <>
      <header className="print-hidden sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur">
        <nav className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-6 py-4 sm:px-8">
          <Link
            href="/"
            className="silk flex items-center gap-2.5"
            style={{ fontSize: 11, letterSpacing: "0.13em" }}
          >
            <Leaf />
            BASSWOOD CREATIVE
          </Link>
          <div className="flex items-center gap-5">
            <div className="hidden items-center gap-5 md:flex">
              {PAGELINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`${link.label === WIDE_ONLY ? "hidden lg:inline " : ""}whitespace-nowrap text-sm text-muted transition-colors hover:text-foreground`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <a
              href={BOOKING}
              className="btn-p hidden whitespace-nowrap sm:inline-flex"
              style={{ padding: "8px 16px", fontSize: "0.85rem" }}
            >
              Book a check-up
            </a>
            <button
              ref={openBtn}
              className="silk rounded-md border border-border px-3 py-2 transition-colors hover:border-sig"
              onClick={open}
              aria-haspopup="dialog"
              aria-expanded={state === "open"}
            >
              Menu
            </button>
          </div>
        </nav>
      </header>

      <div
        className={`overlay${state === "open" ? " open" : ""}${state === "closing" ? " closing" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
      >
        <div className="overlay-inner">
          <button ref={closeBtn} className="close silk" onClick={close}>
            Close · Esc
          </button>
          {ROWS.map((row, i) => (
            <Link
              key={row.href}
              className="row st"
              style={{ "--i": i } as React.CSSProperties}
              href={row.href}
              onClick={close}
            >
              <span className="idx">{String(i + 1).padStart(2, "0")}</span>
              <span className="name">{row.label}</span>
              <span className="paddot"></span>
            </Link>
          ))}
          <p className="meta silk st" style={{ "--i": ROWS.length } as React.CSSProperties}>
            <a href={MAILTO}>{EMAIL}</a>
            <span className="seg" role="group" aria-label="Theme">
              <button aria-pressed={mode === "light"} onClick={() => setTheme("light")}>
                Silver
              </button>
              <button aria-pressed={mode === "dark"} onClick={() => setTheme("dark")}>
                Dark
              </button>
            </span>
          </p>
        </div>
      </div>
    </>
  );
}
