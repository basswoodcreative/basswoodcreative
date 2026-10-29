// Essay sync between the site and the Protocol Grade Substack mirror.
//
// The site's markdown (content/insights/<slug>.md) is canonical; Substack is
// a mirror. This script only ever *reads* Substack, through the public
// archive/post endpoints — no credentials. Writes to Substack go through
// scripts/substack-sync.py (python-substack, cookie auth), driven by the `essays`
// skill in the bwc vault; `export` prepares exactly what it sends (or what
// gets pasted by hand if the library breaks).
//
//   node scripts/essays.mjs status                  drift report, site ↔ Substack
//   node scripts/essays.mjs pull <substack-slug>    bring a Substack post on-domain
//        [--slug <site-slug>] [--pillar <pillar>] [--force]
//   node scripts/essays.mjs export <slug> [--json]  Substack-ready copy of a post
//        [--local-images]
//
// Dev-only: not part of prebuild, never runs on Cloudflare.
import { readFileSync, readdirSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkStringify from "remark-stringify";
import rehypeParse from "rehype-parse";
import rehypeRemark from "rehype-remark";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CONTENT = join(ROOT, "content", "insights");
const SITE = "https://basswoodcreative.com";
const SUBSTACK = (process.env.SUBSTACK_URL ?? "https://protocolgrade.substack.com").replace(/\/$/, "");
const PILLARS = ["Web3 Frontend", "AI & Agent-Assisted Development", "Practice Notes"];
const UA = { "User-Agent": "Mozilla/5.0 (basswoodcreative essays sync)", Accept: "application/json" };
const STRINGIFY = { bullet: "-", emphasis: "*", strong: "*", fences: true, listItemIndent: "one", rule: "-" };

// ── Substack (public, read-only) ────────────────────────────────────────────

async function getJson(url) {
  const res = await fetch(url, { headers: UA });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} — ${url}`);
  return res.json();
}

async function substackPosts() {
  const posts = [];
  for (let offset = 0; ; offset += 50) {
    const page = await getJson(`${SUBSTACK}/api/v1/archive?sort=new&limit=50&offset=${offset}`);
    posts.push(...page.filter((p) => p.type === "newsletter"));
    if (page.length < 50) return posts;
  }
}

const substackPost = (slug) => getJson(`${SUBSTACK}/api/v1/posts/${slug}`);

// ── Markdown ↔ text ─────────────────────────────────────────────────────────

function sitePosts() {
  if (!existsSync(CONTENT)) return [];
  return readdirSync(CONTENT)
    .filter((f) => f.endsWith(".md"))
    .map((f) => {
      const { data, content } = matter(readFileSync(join(CONTENT, f), "utf8"));
      return { slug: f.replace(/\.md$/, ""), fm: data, body: content };
    });
}

const norm = (s) =>
  s
    .toLowerCase()
    .replace(/[‘’]/g, "'")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

function toText(node) {
  if (node.type === "text" || node.type === "inlineCode" || node.type === "code") return node.value;
  if (node.type === "break") return " ";
  return (node.children ?? []).map(toText).join("");
}

// Paragraph-level blocks, so drift can be reported as "this paragraph is only
// on one side" rather than a bare similarity score.
function blocks(tree) {
  const out = [];
  (function walk(node) {
    if (["paragraph", "heading", "code", "tableCell"].includes(node.type)) {
      const raw = toText(node).replace(/\s+/g, " ").trim();
      if (norm(raw)) out.push({ raw, text: norm(raw) });
      return;
    }
    (node.children ?? []).forEach(walk);
  })(tree);
  return out;
}

// Dice coefficient over word multisets: order-blind, good enough for "is this
// the same essay, and how far has it drifted".
function dice(a, b) {
  const A = a.split(" ").filter(Boolean);
  const B = b.split(" ").filter(Boolean);
  if (!A.length && !B.length) return 1;
  const counts = new Map();
  for (const w of A) counts.set(w, (counts.get(w) ?? 0) + 1);
  let common = 0;
  for (const w of B) {
    const c = counts.get(w);
    if (c) {
      common++;
      counts.set(w, c - 1);
    }
  }
  return (2 * common) / (A.length + B.length);
}

// A block counts as present on the other side if it appears there verbatim,
// inside the other side's running text (tables become paragraphs on
// Substack), or as a near-identical paragraph.
function onlyIn(a, b) {
  const whole = ` ${b.map((y) => y.text).join(" ")} `;
  return a.filter(
    (x) => !whole.includes(` ${x.text} `) && !b.some((y) => dice(x.text, y.text) >= 0.85)
  );
}

const markdownTree = (md) => unified().use(remarkParse).use(remarkGfm).parse(md);

// ── Substack HTML → markdown ────────────────────────────────────────────────

const classOf = (node) => [].concat(node.properties?.className ?? []).join(" ");

// Strips Substack's chrome (subscribe widgets, buttons, image expanders) and
// unwraps picture/link wrappers so each image is a bare <img>.
function cleanSubstack(warnings) {
  const DROP_TAGS = new Set(["button", "svg", "form", "input", "source", "script", "style"]);
  const DROP_CLASS = /subscription-widget|button-wrapper|captioned-button|share-dialog|image-link-expand|post-ufi/;
  return (tree) => {
    (function walk(node) {
      if (!node.children) return;
      node.children = node.children.filter(
        (c) => !(c.type === "element" && (DROP_TAGS.has(c.tagName) || DROP_CLASS.test(classOf(c))))
      );
      node.children.forEach(walk);
      node.children = node.children.flatMap((c) =>
        c.type === "element" && (c.tagName === "picture" || (c.tagName === "a" && /image-link/.test(classOf(c))))
          ? c.children
          : [c]
      );
      for (const c of node.children) {
        if (c.type === "element" && /footnote|tweet|youtube|embedded-post|poll/.test(classOf(c)))
          warnings.add(`unhandled Substack block (${classOf(c)}) — check the converted markdown`);
      }
    })(tree);
  };
}

function images(tree) {
  const out = [];
  (function walk(node) {
    if (node.type === "element" && node.tagName === "img") out.push(node);
    (node.children ?? []).forEach(walk);
  })(tree);
  return out;
}

function links(tree) {
  const out = [];
  (function walk(node) {
    if (node.type === "link") out.push(node);
    (node.children ?? []).forEach(walk);
  })(tree);
  return out;
}

// Published images carry no metadata (the repo's standing rule). Lossless:
// JPEG drops its EXIF/XMP, IPTC and comment segments; PNG its text/time chunks.
function stripMetadata(buf) {
  if (buf[0] === 0xff && buf[1] === 0xd8) {
    const parts = [buf.subarray(0, 2)];
    let i = 2;
    while (i + 4 <= buf.length && buf[i] === 0xff && buf[i + 1] !== 0xda) {
      const end = i + 2 + buf.readUInt16BE(i + 2);
      if (![0xe1, 0xed, 0xfe].includes(buf[i + 1])) parts.push(buf.subarray(i, end));
      i = end;
    }
    return Buffer.concat([...parts, buf.subarray(i)]);
  }
  if (buf.subarray(0, 8).toString("hex") === "89504e470d0a1a0a") {
    const parts = [buf.subarray(0, 8)];
    for (let i = 8; i + 12 <= buf.length; ) {
      const end = i + 12 + buf.readUInt32BE(i);
      if (!["tEXt", "iTXt", "zTXt", "eXIf", "tIME"].includes(buf.toString("latin1", i + 4, i + 8)))
        parts.push(buf.subarray(i, end));
      i = end;
    }
    return Buffer.concat(parts);
  }
  return buf;
}

// Substack has no tables: a pasted one collapses into a single run-on
// paragraph. Rows become list items instead — "**Label:** value" for
// two-column tables, "**Row** — Header: cell · Header: cell" otherwise.
function tablesToLists(tree) {
  (function walk(node) {
    if (!node.children) return;
    node.children = node.children.map((c) => (c.type === "table" ? tableToList(c) : c));
    node.children.forEach(walk);
  })(tree);
}

function tableToList(table) {
  const [head, ...rows] = table.children.map((row) => row.children.map((cell) => cell.children));
  const labels = head.map((cell) => cell.map(toText).join("").trim());
  const item = (cells) => {
    const inline =
      labels.length === 2
        ? [{ type: "strong", children: [...cells[0], { type: "text", value: ":" }] }, { type: "text", value: " " }, ...cells[1]]
        : [
            { type: "strong", children: cells[0] },
            ...cells.slice(1).flatMap((cell, j) => [
              { type: "text", value: `${j ? " · " : " — "}${labels[j + 1] ? `${labels[j + 1]}: ` : ""}` },
              ...cell,
            ]),
          ];
    return { type: "listItem", spread: false, children: [{ type: "paragraph", children: inline }] };
  };
  return { type: "list", ordered: false, spread: false, children: rows.map(item) };
}

const kebab = (s, words = 5) =>
  norm(s).split(" ").filter(Boolean).slice(0, words).join("-");

// Substack post URL → its slug, ignoring tracking params.
function substackSlug(url) {
  const m = String(url).match(/^https?:\/\/[^/]*substack\.com\/p\/([^/?#]+)/);
  return m ? m[1] : null;
}

// Site slug ↔ Substack post, by frontmatter link first, then title, then body.
function match(site, subs, bodies) {
  const pairs = new Map();
  for (const p of site) {
    const linked = substackSlug(p.fm.substackUrl ?? "");
    let hit =
      subs.find((s) => s.id === Number(p.fm.substackId) || s.slug === linked) ??
      subs.find((s) => norm(s.title) === norm(String(p.fm.title ?? "")));
    let how = hit ? "frontmatter or title" : "";
    if (!hit) {
      const siteText = blocks(markdownTree(p.body)).map((b) => b.text).join(" ");
      const best = subs
        .map((s) => ({ s, score: dice(siteText, bodies.get(s.slug).map((b) => b.text).join(" ")) }))
        .sort((a, b) => b.score - a.score)[0];
      if (best && best.score >= 0.7) [hit, how] = [best.s, "body"];
    }
    if (hit) pairs.set(p.slug, { sub: hit, how });
  }
  return pairs;
}

async function substackBlocks(slug) {
  const post = await substackPost(slug);
  const warnings = new Set();
  const hast = unified().use(rehypeParse, { fragment: true }).parse(post.body_html ?? "");
  cleanSubstack(warnings)(hast);
  const mdast = await unified().use(rehypeRemark).run(hast);
  return { post, mdast, blocks: blocks(mdast), warnings };
}

// ── Commands ────────────────────────────────────────────────────────────────

async function status() {
  const site = sitePosts();
  const subs = await substackPosts();
  const bodies = new Map();
  const raw = new Map();
  for (const s of subs) {
    const conv = await substackBlocks(s.slug);
    bodies.set(s.slug, conv.blocks);
    raw.set(s.slug, conv.post.body_html ?? "");
  }
  const pairs = match(site, subs, bodies);

  console.log(`Protocol Grade sync status — ${new Date().toISOString().slice(0, 16).replace("T", " ")} UTC`);
  console.log(`site: ${site.length} post(s) · substack: ${subs.length} post(s) at ${SUBSTACK}\n`);

  // gray-matter turns unquoted YAML dates into Date objects.
  const day = (p) => (p.fm.date instanceof Date ? p.fm.date.toISOString() : String(p.fm.date ?? ""));
  for (const p of site.sort((a, b) => (day(a) < day(b) ? 1 : -1))) {
    console.log(`● ${p.slug}`);
    const pair = pairs.get(p.slug);
    if (!pair) {
      console.log(`  substack  NOT MIRRORED — draft it: .venv/bin/python scripts/substack-sync.py draft ${p.slug}\n`);
      continue;
    }
    const { sub, how } = pair;
    // The site renders the description as the post's standfirst; Substack
    // carries it either as the subtitle or as a lead paragraph, so both sides
    // get their lede in the compare.
    const lede = (s) => (norm(s) ? [{ raw: s, text: norm(s) }] : []);
    const siteBlocks = [...lede(String(p.fm.description ?? "")), ...blocks(markdownTree(p.body))];
    const subBlocks = [...lede(String(sub.subtitle ?? "")), ...bodies.get(sub.slug)];
    const sim = dice(siteBlocks.map((b) => b.text).join(" "), subBlocks.map((b) => b.text).join(" "));
    const onlySite = onlyIn(siteBlocks, subBlocks);
    const onlySub = onlyIn(subBlocks, siteBlocks);
    console.log(`  substack  ${sub.slug} (id ${sub.id}, ${sub.post_date.slice(0, 10)}) — matched by ${how}`);
    const sameTitle = norm(sub.title) === norm(String(p.fm.title ?? ""));
    console.log(
      sameTitle
        ? `  title     same`
        : `  title     DIFFERS — site "${p.fm.title}" · substack "${sub.title}"`
    );
    console.log(
      `  body      ${(sim * 100).toFixed(1)}% similar · ${onlySite.length} paragraph(s) only on site · ${onlySub.length} only on substack`
    );
    for (const b of onlySite.slice(0, 4)) console.log(`            + site:     "${b.raw.slice(0, 90)}…"`);
    for (const b of onlySub.slice(0, 4)) console.log(`            + substack: "${b.raw.slice(0, 90)}…"`);
    const canonical = raw.get(sub.slug).includes(`basswoodcreative.com/insights/${p.slug}`);
    console.log(`  canonical ${canonical ? "present on substack" : "MISSING on substack"}`);
    console.log(
      p.fm.substackUrl
        ? `  link      substackUrl set`
        : `  link      substackUrl not set — add: substackUrl: ${sub.canonical_url} · substackId: ${sub.id}`
    );
    console.log();
  }

  const matched = new Set([...pairs.values()].map((v) => v.sub.slug));
  for (const s of subs.filter((s) => !matched.has(s.slug))) {
    console.log(`○ substack only: ${s.slug} — "${s.title}" (${s.post_date.slice(0, 10)})`);
    console.log(`  pull it: node scripts/essays.mjs pull ${s.slug} --slug ${kebab(s.title, 8)}\n`);
  }
}

async function pull(subSlug, opts) {
  const slug = opts.slug ?? subSlug;
  const pillar = opts.pillar ?? "AI & Agent-Assisted Development";
  if (!PILLARS.includes(pillar)) throw new Error(`pillar must be one of: ${PILLARS.join(" | ")}`);
  const file = join(CONTENT, `${slug}.md`);
  if (existsSync(file) && !opts.force) throw new Error(`${file} exists — pass --force to overwrite`);

  const post = await substackPost(subSlug);
  const warnings = new Set();
  const hast = unified().use(rehypeParse, { fragment: true }).parse(post.body_html ?? "");
  cleanSubstack(warnings)(hast);

  // Images: Substack's CDN copy, metadata stripped, saved next to the post's
  // other assets.
  const imgDir = join(ROOT, "public", "insights", slug);
  const imgs = images(hast);
  if (imgs.length) mkdirSync(imgDir, { recursive: true });
  for (const [i, img] of imgs.entries()) {
    const src = String(img.properties.src ?? "");
    // No webp/avif in Accept, so the CDN's f_auto hands back the original format.
    const res = await fetch(src, { headers: { "User-Agent": UA["User-Agent"], Accept: "image/png,image/jpeg,*/*;q=0.5" } });
    if (!res.ok) throw new Error(`image ${i + 1}: ${res.status} — ${src}`);
    const type = res.headers.get("content-type") ?? "";
    const ext = type.includes("png") ? "png" : type.includes("webp") ? "webp" : type.includes("gif") ? "gif" : "jpg";
    const alt = String(img.properties.alt ?? "").trim();
    const name = `${(alt && kebab(alt)) || `figure-${i + 1}`}.${ext}`;
    writeFileSync(join(imgDir, name), stripMetadata(Buffer.from(await res.arrayBuffer())));
    img.properties = { src: `/insights/${slug}/${name}`, alt: alt || "[ALT TEXT NEEDED]" };
    if (!alt) warnings.add(`image ${i + 1} (${name}) has no alt text — write one before publishing`);
  }

  const mdast = await unified().use(rehypeRemark).run(hast);

  // Links to essays that live on-domain point on-domain; tracking params go.
  const known = new Map();
  for (const p of sitePosts()) {
    const s = substackSlug(p.fm.substackUrl ?? "");
    if (s) known.set(s, p.slug);
  }
  for (const l of links(mdast)) {
    const s = substackSlug(l.url);
    if (s && known.has(s)) l.url = `/insights/${known.get(s)}`;
    else if (s) {
      l.url = l.url.replace(/[?#].*$/, "");
      warnings.add(`link to Substack post "${s}" has no on-domain copy yet — left pointing at Substack`);
    }
  }

  const body = String(unified().use(remarkGfm).use(remarkStringify, STRINGIFY).stringify(mdast));
  const yaml = (v) => (/[:#]\s|^[\s'"`!&*?|>%@{}[\]-]/.test(v) ? JSON.stringify(v) : v);
  const fm = [
    "---",
    `title: ${yaml(post.title)}`,
    `description: ${yaml(post.subtitle ?? "")}`,
    `date: ${post.post_date.slice(0, 10)}`,
    `pillar: ${pillar}`,
    `substackUrl: ${post.canonical_url}`,
    `substackId: ${post.id}`,
    "---",
    "",
  ].join("\n");
  writeFileSync(file, fm + body);

  console.log(`pulled "${post.title}" → content/insights/${slug}.md`);
  console.log(`  ${imgs.length} image(s) → public/insights/${slug}/`);
  for (const w of warnings) console.log(`  ! ${w}`);
  if (!post.subtitle) console.log("  ! no Substack subtitle — write a description before publishing");
}

function exportPost(slug, opts) {
  const file = join(CONTENT, `${slug}.md`);
  if (!existsSync(file)) throw new Error(`no such post: ${file}`);
  const { data, content } = matter(readFileSync(file, "utf8"));
  const tree = markdownTree(content);

  // On Substack, links to sibling essays go to their Substack copies (readers
  // stay in the reader); everything relative becomes absolute. --local-images
  // points images at their files in public/ instead, so scripts/substack-sync.py
  // uploads them to Substack's CDN — no hotlinking a site that may not have
  // deployed them yet.
  const mirrors = new Map(sitePosts().filter((p) => p.fm.substackUrl).map((p) => [p.slug, p.fm.substackUrl]));
  (function walk(node) {
    if ((node.type === "link" || node.type === "image") && node.url.startsWith("/")) {
      const m = node.url.match(/^\/insights\/([^/?#]+)\/?$/);
      if (node.type === "image" && opts["local-images"]) node.url = join(ROOT, "public", node.url);
      else node.url = m && mirrors.has(m[1]) ? mirrors.get(m[1]) : SITE + node.url;
    }
    (node.children ?? []).forEach(walk);
  })(tree);
  tablesToLists(tree);

  // Raw HTML is invisible on the site (remark-rehype drops it) but shows up as
  // literal text on Substack — that's how essay 1's <!-- IMG-n --> slot
  // markers leaked into the live Substack post. Never send it.
  (function walk(node) {
    if (!node.children) return;
    node.children = node.children.filter((c) => c.type !== "html");
    node.children.forEach(walk);
  })(tree);

  const canonical = `${SITE}/insights/${slug}`;
  const body =
    String(unified().use(remarkGfm).use(remarkStringify, STRINGIFY).stringify(tree)).trimEnd() +
    `\n\n---\n\n*Originally published at [${canonical.replace("https://", "")}](${canonical}).*\n`;

  if (opts.json) {
    const out = { slug, substackId: data.substackId ?? null, title: data.title, subtitle: data.description ?? "", body };
    console.log(JSON.stringify(out, null, 2));
  }
  else process.stdout.write(body);
}

// ── CLI ─────────────────────────────────────────────────────────────────────

const [cmd, arg, ...rest] = process.argv.slice(2);
const opts = {};
for (let i = 0; i < rest.length; i++) {
  const flag = rest[i].replace(/^--/, "");
  if (["force", "json", "local-images"].includes(flag)) opts[flag] = true;
  else opts[flag] = rest[++i];
}

try {
  if (cmd === "status") await status();
  else if (cmd === "pull" && arg) await pull(arg, opts);
  else if (cmd === "export" && arg) exportPost(arg, opts);
  else {
    console.log(
      "usage: node scripts/essays.mjs status | pull <substack-slug> [--slug s] [--pillar p] [--force] | export <slug> [--json] [--local-images]",
    );
    process.exit(cmd ? 1 : 0);
  }
} catch (err) {
  console.error(`essays: ${err.message}`);
  process.exit(1);
}
