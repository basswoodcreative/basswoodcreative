import { Nav } from "./components/nav";
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
      <main className="flex-1">
        <Hero />
        <ProofBand />
        <Services />
        <Work />
        <Engagements />
        <About />
        <InsightsTeaser />
        <ClosingCta />
      </main>
      <Footer />
    </div>
  );
}
