import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";

// Post pillars mirror Protocol Grade's Substack sections — one taxonomy
// everywhere (bwc vault, Decision 1 implementation notes).
export type Pillar =
  | "Web3 Frontend"
  | "AI & Agent-Assisted Development"
  | "Practice Notes";

export type Post = {
  slug: string;
  title: string;
  description: string;
  date: string; // YYYY-MM-DD
  pillar: Pillar;
  substackUrl?: string;
};

const CONTENT_DIR = path.join(process.cwd(), "content", "insights");

export function getAllPosts(): Post[] {
  if (!fs.existsSync(CONTENT_DIR)) return [];
  return fs
    .readdirSync(CONTENT_DIR)
    .filter((f) => f.endsWith(".md"))
    .map((f) => {
      const slug = f.replace(/\.md$/, "");
      const { data } = matter(fs.readFileSync(path.join(CONTENT_DIR, f), "utf8"));
      return {
        slug,
        title: String(data.title ?? slug),
        description: String(data.description ?? ""),
        date: normalizeDate(data.date),
        pillar: (data.pillar ?? "Practice Notes") as Pillar,
        substackUrl: data.substackUrl ? String(data.substackUrl) : undefined,
      };
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPost(slug: string): Post | undefined {
  return getAllPosts().find((p) => p.slug === slug);
}

export async function renderPost(slug: string): Promise<string> {
  const raw = fs.readFileSync(path.join(CONTENT_DIR, `${slug}.md`), "utf8");
  const { content } = matter(raw);
  const html = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeStringify)
    .process(content);
  return String(html);
}

export function formatDate(date: string): string {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

function normalizeDate(value: unknown): string {
  // gray-matter parses unquoted YAML dates into Date objects.
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value ?? "");
}
