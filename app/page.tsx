import { Nav } from "./components/nav";
import { Board } from "./components/board";
import { Hero } from "./components/hero";
import { ProofBand } from "./components/proof-band";
import { Services } from "./components/services";
import { Work } from "./components/work";
import { Engagements } from "./components/engagements";
import { About } from "./components/about";
import { InsightsTeaser } from "./components/insights-teaser";
import { ClosingCta } from "./components/closing-cta";
import { Footer } from "./components/footer";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col font-sans">
      <Nav />
      {/* every section is a component ("chip") sitting on the board; the
          bus weaves between them in the gaps (components/board.tsx) */}
      <main className="flex-1">
        <Board>
          <Hero />
          <ProofBand />
          <Services />
          <Work />
          <Engagements />
          <About />
          <InsightsTeaser />
          <ClosingCta />
        </Board>
      </main>
      <Footer />
    </div>
  );
}
