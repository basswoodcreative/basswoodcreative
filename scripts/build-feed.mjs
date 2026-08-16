// Emits public/rss.xml and public/sitemap.xml from content/insights/*.md at
// prebuild time (static export has no route handlers). Fail-soft like
// fetch-metrics.mjs: a bad content file must never break the build.
import { readFileSync, readdirSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const contentDir = join(root, "content", "insights");
const SITE = "https://basswoodcreative.com";

const esc = (s) =>
  String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

// Minimal frontmatter reader — top-of-file YAML block, "key: value" lines only.
function frontmatter(raw) {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  const out = {};
  if (!m) return out;
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^(\w+):\s*(.+)$/);
    if (kv) out[kv[1]] = kv[2].replace(/^["']|["']$/g, "").trim();
  }
  return out;
}

try {
  const posts = existsSync(contentDir)
    ? readdirSync(contentDir)
        .filter((f) => f.endsWith(".md"))
        .map((f) => {
          const fm = frontmatter(readFileSync(join(contentDir, f), "utf8"));
          return { slug: f.replace(/\.md$/, ""), ...fm };
        })
        .filter((p) => p.title && p.date)
        .sort((a, b) => (a.date < b.date ? 1 : -1))
    : [];

  const items = posts
    .map((p) => {
      const url = `${SITE}/insights/${p.slug}`;
      return `    <item>
      <title>${esc(p.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${new Date(`${p.date}T12:00:00Z`).toUTCString()}</pubDate>
      <description>${esc(p.description ?? "")}</description>
    </item>`;
    })
    .join("\n");

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Basswood Creative — Insights</title>
    <link>${SITE}/insights</link>
    <atom:link href="${SITE}/rss.xml" rel="self" type="application/rss+xml"/>
    <description>Essays on protocol frontends, governance UX, and agent-assisted engineering. Published here first, mirrored to Protocol Grade.</description>
    <language>en-us</language>
${items}
  </channel>
</rss>
`;

  const pages = ["", "/insights", "/resume", ...posts.map((p) => `/insights/${p.slug}`)];
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map((p) => `  <url><loc>${SITE}${p}</loc></url>`).join("\n")}
</urlset>
`;

  writeFileSync(join(root, "public", "rss.xml"), rss);
  writeFileSync(join(root, "public", "sitemap.xml"), sitemap);
  console.log(`build-feed: ${posts.length} post(s) → rss.xml, sitemap.xml`);
} catch (err) {
  console.warn("build-feed: skipped —", err.message);
  process.exit(0);
}
