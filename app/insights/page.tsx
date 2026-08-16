import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "../components/nav";
import { Footer } from "../components/footer";
import { formatDate, getAllPosts } from "../../lib/insights";

export const metadata: Metadata = {
  title: "Insights",
  description:
    "Essays on protocol frontends, governance UX, and agent-assisted engineering from Basswood Creative.",
};

export default function Insights() {
  const posts = getAllPosts();

  return (
    <div className="flex min-h-screen flex-col font-sans">
      <Nav />
      <main className="flex-1">
        <section className="component mt-14">
          <span className="silk seclabel">INSIGHTS</span>
          <h1 className="text-4xl tracking-tight sm:text-5xl">
            Notes from the build.
          </h1>
          <p className="standfirst mt-6 text-lg leading-relaxed">
            Essays on protocol frontends, governance UX, and agent-assisted
            engineering — published here first, mirrored to Protocol Grade.
          </p>
        </section>

        {posts.length === 0 ? (
          <section className="component">
            <p className="text-lg leading-relaxed text-muted">
              The first essay is on its way.
            </p>
          </section>
        ) : (
          posts.map((post) => (
            <section key={post.slug} className="component">
              <p className="silk seclabel">
                {post.pillar.toUpperCase()} · {formatDate(post.date).toUpperCase()}
              </p>
              <h2 className="text-2xl tracking-tight sm:text-3xl">
                <Link
                  href={`/insights/${post.slug}`}
                  className="transition-colors hover:text-foreground"
                >
                  {post.title}
                </Link>
              </h2>
              <p className="mt-4 max-w-2xl leading-relaxed text-muted">
                {post.description}
              </p>
              <p className="mt-5">
                <Link
                  href={`/insights/${post.slug}`}
                  className="text-sm font-medium underline decoration-border underline-offset-4 transition-colors hover:decoration-foreground"
                >
                  Read the essay →
                </Link>
              </p>
            </section>
          ))
        )}

        <section className="component">
          <span className="silk seclabel">PROTOCOL GRADE</span>
          <p className="max-w-2xl leading-relaxed text-muted">
            Every essay mirrors to{" "}
            <span className="text-foreground">Protocol Grade</span>, the
            Basswood Creative publication on Substack. Subscribe there for
            email delivery, or point a reader at the{" "}
            <a
              href="/rss.xml"
              className="underline decoration-border underline-offset-4 transition-colors hover:text-foreground"
            >
              RSS feed
            </a>
            .
          </p>
          <p className="mt-6">
            <a
              className="btn-p"
              href="https://protocolgrade.substack.com/subscribe"
              rel="noopener"
            >
              Subscribe on Substack
            </a>
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
}
