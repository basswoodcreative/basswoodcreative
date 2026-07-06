"use client";

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="print-hidden inline-flex h-9 items-center rounded-full border border-border px-5 text-sm font-medium text-muted transition-colors hover:border-foreground hover:text-foreground"
    >
      Print / Save as PDF
    </button>
  );
}
