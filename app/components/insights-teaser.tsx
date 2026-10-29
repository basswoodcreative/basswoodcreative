import Link from "next/link";
import { formatDate, getAllPosts } from "../../lib/insights";

// The method, in writing: the essays show the method on Phil's own systems
// and are the only on-direction proof the site has yet (bwc vault, 65 §2.5).
export function InsightsTeaser() {
  const posts = getAllPosts().slice(0, 4);

  return (
    <section className="component" id="insights">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted">
          Insights
        </p>
        <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
          The method, in writing.
        </h2>
        <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted">
          How I work, shown on my own systems: the builds, the failures and the
          fixes, written up in full.
        </p>
        {posts.length > 0 && (
          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {posts.map((post) => (
              <article key={post.slug} className="flex flex-col rounded-2xl border border-border p-7">
                <p className="silk text-muted">{formatDate(post.date).toUpperCase()}</p>
                <h3 className="mt-3 text-base font-semibold tracking-tight">
                  <Link href={`/insights/${post.slug}`} className="transition-colors hover:text-foreground">
                    {post.title}
                  </Link>
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">{post.description}</p>
                <p className="mt-auto pt-4 text-sm">
                  <Link
                    href={`/insights/${post.slug}`}
                    aria-label={`Read “${post.title}”`}
                    className="font-medium text-foreground underline decoration-border underline-offset-4 transition-colors hover:decoration-foreground"
                  >
                    Read →
                  </Link>
                </p>
              </article>
            ))}
          </div>
        )}
        <p className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <Link
            href="/insights"
            className="font-medium underline decoration-border underline-offset-4 transition-colors hover:decoration-foreground"
          >
            All essays →
          </Link>
          <a
            href="https://protocolgrade.substack.com/subscribe"
            rel="noopener"
            className="font-medium underline decoration-border underline-offset-4 transition-colors hover:decoration-foreground"
          >
            Subscribe on Protocol Grade →
          </a>
        </p>
      </div>
    </section>
  );
}
