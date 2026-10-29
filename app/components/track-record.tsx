// Track record: the Sky years as proof — an intro chip, the live numbers
// panel, then three exhibit components on the board, with the trunk weaving
// between them (Decision 12; exhibit content signed off by Phil 2026-07-07,
// record: vault "Phase 5 / 54"; Phase A order and copy, vault 65 §2.6).
// Governance, Widgets + Hooks and dai.js left the homepage in Phase A; they
// stay on /resume and return on /work/track-record in Phase C (their markup
// is in git history, last at 2f0dd4f). Captures are real, dated, and
// refresh via scripts/capture.mjs (B6).

import { ProofBand } from "./proof-band";

export function TrackRecord() {
  return (
    <>
      <section className="component exh-intro" id="track-record">
        <span className="silk seclabel">TRACK RECORD</span>
        <h2 className="sec">Eight years under real stakes.</h2>
        <p className="standfirst" style={{ marginBottom: 0 }}>
          Before agents, I spent eight years at Sky (formerly MakerDAO), rising
          to lead the team behind its flagship app. Every claim below links to
          something you can open.
        </p>
      </section>

      <ProofBand />

      <section className="component exh" id="ex-flagship">
        <div className="exhibit rv">
          <h3>Sky.money — the flagship UI</h3>
          <p className="blurb">
            The interface of the $19.8B Sky ecosystem — team-led from the
            ground-up redesign through today&apos;s five-network app.
          </p>
          <figure className="fig" style={{ margin: 0 }}>
            <a
              className="urlbar silk"
              href="https://app.sky.money"
              target="_blank"
              rel="noopener"
            >
              <span className="live">●</span> app.sky.money
              <span className="ext">↗</span>
            </a>
            <img
              src="/work/sky-money-app.jpg"
              alt="app.sky.money — Balances view of the live Sky.money application"
              loading="lazy"
            />
            <figcaption className="silk">
              FIG. 01 — CAPTURED 2026-07-07 · LIVE PRODUCT
            </figcaption>
          </figure>
          <div className="kv">
            <span>ROLE · TEAM LEAD</span>
            <span>NETWORKS · 5</span>
            <span>
              <a href="https://github.com/jetstreamgg/tarmac" rel="noopener">
                REPO · JETSTREAMGG/TARMAC ↗
              </a>
            </span>
          </div>
        </div>
      </section>

      <section className="component exh" id="ex-llm">
        <div className="exhibit rv">
          <div className="llm2">
            <div>
              <h3>An LLM assistant, live inside the product</h3>
              <p className="blurb" style={{ marginBottom: 0 }}>
                Team-led delivery of the production frontend for Sky&apos;s
                chatbot, plus the documentation pipeline that generated its
                training data. Shipped to non-U.S. markets.
              </p>
            </div>
            <figure className="fig" style={{ margin: 0 }}>
              <a
                className="urlbar silk"
                href="https://app.sky.money"
                target="_blank"
                rel="noopener"
              >
                app.sky.money · non-U.S.<span className="ext">↗</span>
              </a>
              <img
                src="/work/chat-assistant.jpg"
                alt="The chat assistant widget inside Sky.money: 'Hi, I'm your AI-powered chatbot assistant' with suggested questions about Sky Protocol and USDS"
                loading="lazy"
              />
              <figcaption className="silk">
                FIG. 03 — CHAT ASSISTANT · PRODUCT UI · 2026-07-07
              </figcaption>
            </figure>
          </div>
        </div>
      </section>

      <section className="component exh" id="ex-bt">
        <div className="exhibit rv">
          <h3>Black Thursday Emergency Operations</h3>
          <div className="dispatch">
            <span className="date">2020-03-12 — DEPLOYED OVERNIGHT</span>
            On the day the market broke, opportunistic bots were winning
            liquidation auctions for near-zero bids, threatening bad debt in
            the system. An emergency auctions dashboard, shipped overnight, put
            honest keepers back in the fight.
            <div className="kv" style={{ marginTop: 12 }}>
              <span>
                <a href="https://github.com/b-pmcg/auction-helper" rel="noopener">
                  REPO · B-PMCG/AUCTION-HELPER ↗
                </a>
              </span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
