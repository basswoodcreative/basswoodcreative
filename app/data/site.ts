export const EMAIL = "phil@basswoodcreative.com";
export const MAILTO = `mailto:${EMAIL}`;
// Every "Book a check-up" button. Email until a scheduler exists (bwc vault,
// 65 §1); swap in the booking URL here and every button follows.
export const BOOKING = `${MAILTO}?subject=Check-up`;
export const X_HANDLE = "@bainpm";
export const X_URL = "https://x.com/bainpm";
export const LINKEDIN_URL = "https://www.linkedin.com/in/basswood-creative-b16367445/";

// The link-preview card (app/opengraph-image.png, rendered by scripts/og.mjs;
// alt text mirrors app/opengraph-image.alt.txt). A page that sets its own
// openGraph loses the inherited file-based image, so it lists this one.
export const OG_IMAGE = {
  url: "/opengraph-image.png",
  width: 1200,
  height: 630,
  alt: "Basswood Creative — Agentic engineering for software teams. Dark card with circuit-board traces, a lit junction pad, and the basswood leaf mark.",
};

// The proof band's figures live in app/data/snapshot.json, written at
// build time by scripts/fetch-metrics.mjs from the protocol's official
// analytics (collection of record: bwc vault, "18 Metrics Collection
// Guide"). The retired static STATS list's cut stats survive on the
// governance exhibit's kv chips (voting power, polls, spells).
