// Selected Work as six exhibit components on the board — the trunk weaves
// between them (Decision 12; content signed off by Phil 2026-07-07, record:
// vault "Phase 5 / 54"). Captures are real, dated, and refresh via
// scripts/capture.mjs (B6).

export function Work() {
  return (
    <>
      <section className="component exh-intro" id="work">
        <span className="silk seclabel">SELECTED WORK</span>
        <h2 className="sec">Shipped, public, verifiable.</h2>
        <p className="standfirst" style={{ marginBottom: 0 }}>
          Every claim below links to something you can open — the live product,
          the repo, or both.
        </p>
      </section>

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

      <section className="component exh" id="ex-gov">
        <div className="exhibit rv">
          <h3>Governance, reinvented</h3>
          <p className="blurb">
            As the governance token was upgraded, so was the portal that
            controls the protocol — the new SKY portal and the legacy MKR
            portal, both live today.
          </p>
          <div className="gov2">
            <figure className="fig" style={{ margin: 0 }}>
              <a
                className="urlbar silk"
                href="https://vote.sky.money"
                target="_blank"
                rel="noopener"
              >
                <span className="live">●</span> vote.sky.money
                <span className="ext">↗</span>
              </a>
              <img
                src="/work/vote-sky-money.jpg"
                alt="vote.sky.money — Sky Governance Voting Portal, latest executive with 7.02B SKY supporting"
                loading="lazy"
              />
              <figcaption className="silk">
                FIG. 02A — SKY PORTAL (V3) · CAPTURED 2026-07-07
              </figcaption>
            </figure>
            <figure className="fig" style={{ margin: 0 }}>
              <a
                className="urlbar silk"
                href="https://vote.makerdao.com"
                target="_blank"
                rel="noopener"
              >
                <span className="live">●</span> vote.makerdao.com
                <span className="ext">↗</span>
              </a>
              <img
                src="/work/vote-makerdao.jpg"
                alt="vote.makerdao.com — legacy Maker Governance Voting Portal, still active"
                loading="lazy"
              />
              <figcaption className="silk">
                FIG. 02B — LEGACY MKR PORTAL (V2) · STILL ACTIVE
              </figcaption>
            </figure>
          </div>
          <div className="kv">
            <span>~$400M VOTING POWER / POLL</span>
            <span>~1,350 POLLS</span>
            <span>258 EXECUTIVE SPELLS</span>
            <span>
              <a
                href="https://github.com/skybase-foundation/governance-portal-v2"
                rel="noopener"
              >
                REPO · GOVERNANCE-PORTAL-V2 ↗
              </a>
            </span>
          </div>
        </div>
      </section>

      <section className="component exh" id="ex-widgets">
        <div className="exhibit rv">
          <h3>Widgets + Hooks — the open-source module kit</h3>
          <p className="blurb">
            Self-contained UI modules for Sky protocol financial products,
            paired with a hooks package that speaks directly to the contracts.
          </p>
          <div className="rack" aria-label="The five widget modules">
            <div className="module">
              <span className="pin"></span>
              <span className="mname">SAVINGS</span>
            </div>
            <div className="module">
              <span className="pin"></span>
              <span className="mname">REWARDS</span>
            </div>
            <div className="module">
              <span className="pin"></span>
              <span className="mname">UPGRADE</span>
            </div>
            <div className="module">
              <span className="pin"></span>
              <span className="mname">TRADE</span>
            </div>
            <div className="module">
              <span className="pin"></span>
              <span className="mname">BALANCES</span>
            </div>
          </div>
          <div className="kv">
            <span>MODULES · 5</span>
            <span>OPEN SOURCE</span>
            <span>
              <a href="https://github.com/jetstreamgg/tarmac" rel="noopener">
                WIDGETS ↗
              </a>
            </span>
            <span>
              <a href="https://github.com/jetstreamgg/tarmac" rel="noopener">
                HOOKS ↗
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
          <h3>Black Thursday</h3>
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

      <section className="component exh" id="ex-daijs">
        <div className="exhibit rv">
          <h3>dai.js — the original SDK</h3>
          <p className="blurb" style={{ marginBottom: 0 }}>
            The service-based SDK the early protocol frontends were built on —
            archived now, still citable.{" "}
            <span
              className="kv"
              style={{
                display: "inline-flex",
                margin: "0 0 0 10px",
                verticalAlign: "middle",
              }}
            >
              <span>
                <a href="https://github.com/sky-ecosystem/dai.js" rel="noopener">
                  REPO · SKY-ECOSYSTEM/DAI.JS ↗
                </a>
              </span>
            </span>
          </p>
        </div>
      </section>
    </>
  );
}
