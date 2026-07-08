"use client";

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="print-hidden inline-flex h-9 items-center rounded-md border border-border px-5 text-sm font-medium text-muted transition-colors hover:border-sig hover:text-foreground"
    >
      Print / Save as PDF
    </button>
  );
}
