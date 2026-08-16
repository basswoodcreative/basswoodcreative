import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Nav } from "../../components/nav";
import { Footer } from "../../components/footer";
import { formatDate, getAllPosts, getPost, renderPost } from "../../../lib/insights";

export function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.description,
    openGraph: {
      type: "article",
      title: post.title,
      description: post.description,
      url: `https://basswoodcreative.com/insights/${post.slug}`,
      publishedTime: post.date,
    },
  };
}

export default async function InsightPost({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();
  const html = await renderPost(slug);

  return (
    <div className="flex min-h-screen flex-col font-sans">
      <Nav />
      <main className="flex-1">
        <article className="mx-auto w-full max-w-3xl px-6 py-16 sm:px-8 sm:py-20">
          <header>
            <p className="silk seclabel">
              {post.pillar} · {formatDate(post.date)}
            </p>
            <h1 className="text-4xl tracking-tight sm:text-5xl">{post.title}</h1>
            <p className="standfirst mt-5 text-lg leading-relaxed">
              {post.description}
            </p>
          </header>
          <div
            className="prose mt-10"
            dangerouslySetInnerHTML={{ __html: html }}
          />
          <footer className="mt-14 border-t border-border pt-8">
            <p className="silk seclabel">PROTOCOL GRADE</p>
            <p className="max-w-xl leading-relaxed text-muted">
              Essays like this one publish here first and mirror to{" "}
              <span className="text-foreground">Protocol Grade</span>, the
              Basswood Creative publication. Get the next one by email.
            </p>
            <p className="mt-6 flex flex-wrap items-center gap-4">
              <a
                className="btn-p"
                href="https://protocolgrade.substack.com/subscribe"
                rel="noopener"
              >
                Subscribe on Substack
              </a>
              {post.substackUrl ? (
                <a
                  href={post.substackUrl}
                  rel="noopener"
                  className="text-sm font-medium underline decoration-border underline-offset-4 transition-colors hover:decoration-foreground"
                >
                  Also on Protocol Grade →
                </a>
              ) : null}
            </p>
            <p className="mt-8">
              <Link
                href="/insights"
                className="text-sm font-medium underline decoration-border underline-offset-4 transition-colors hover:decoration-foreground"
              >
                ← All insights
              </Link>
            </p>
          </footer>
        </article>
      </main>
      <Footer />
    </div>
  );
}
