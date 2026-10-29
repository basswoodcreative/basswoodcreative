import { Nav } from "./components/nav";
import { Board } from "./components/board";
import { Hero } from "./components/hero";
import { Problem } from "./components/problem";
import { Services } from "./components/services";
import { Engagements } from "./components/engagements";
import { InsightsTeaser } from "./components/insights-teaser";
import { TrackRecord } from "./components/track-record";
import { About } from "./components/about";
import { ClosingCta } from "./components/closing-cta";
import { Footer } from "./components/footer";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col font-sans">
      <Nav />
      {/* every section is a component ("chip") sitting on the board; the
          bus weaves between them in the gaps (components/board.tsx), whose
          SECTIONS list must follow this order (bwc vault, 64 / 65 §2) */}
      <main className="flex-1">
        <Board>
          <Hero />
          <Problem />
          <Services />
          <Engagements />
          <InsightsTeaser />
          <TrackRecord />
          <About />
          <ClosingCta />
        </Board>
      </main>
      <Footer />
    </div>
  );
}
