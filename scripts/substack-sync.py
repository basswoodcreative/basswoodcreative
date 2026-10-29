"""Substack side of the essay sync: python-substack behind safe defaults.

The site's markdown is canonical (scripts/essays.mjs); this pushes it to the
Protocol Grade mirror and reads back what's there. The library's own publish
emails every subscriber unless told not to. Here email is opt-in (--email),
and refused outright for a post that's already live or emailed.

  login                      save the Substack cookie from the clipboard
  whoami                     check the cookie and the publication it reaches
  list                       drafts and published posts
  get <slug|id>              one post's state, plus a JSON backup
  draft <slug>               new unpublished draft from the site essay
  update <slug> [--write]    load the site essay into the post's Substack
         [--meta]              draft copy (dry run without --write; --meta
         [--drop-widgets]      also sends title and subtitle)
  publish <slug|id> [--yes]  make it live, or push a live post's draft copy
          [--email]            live; email only with --email

Substack keeps two bodies per post: `body` is what readers see, `draft_body`
the editor's working copy. update only writes draft_body; publish (or Update
in the Substack editor) copies it live.

Bodies are compared and rebuilt as Substack's own nodes, not through the
library's markdown export: Substack's editor adds attributes (textAlign on
every paragraph, target/rel on links) that the 0.10.0 exporter can't place,
so nearly every block of a live post exports as an opaque marker.

Run from the repo root with the repo venv:
  .venv/bin/python scripts/substack-sync.py <command>
Setup, once per machine:
  python3.13 -m venv .venv
  .venv/bin/pip install --require-hashes -r scripts/requirements-substack.txt

The cookie lives outside the repo: SUBSTACK_COOKIES, default
~/.config/substack/cookies.json, mode 600. Nothing here prints it.
Dev-only, like essays.mjs: never runs on Cloudflare.
"""

import argparse
import difflib
import json
import os
import re
import subprocess
import sys
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path

from substack import Api
from substack.mdrender import markdown_to_doc
from substack.post import Post

ROOT = Path(__file__).resolve().parent.parent
ESSAYS = ROOT / "content" / "insights"
BACKUPS = ROOT / ".substack" / "backups"
PUBLICATION = os.environ.get("SUBSTACK_URL", "https://protocolgrade.substack.com").rstrip("/")
COOKIES = Path(os.environ.get("SUBSTACK_COOKIES", "~/.config/substack/cookies.json")).expanduser()

# Top-level nodes the site's markdown accounts for (with Substack's spelling of
# code blocks). Anything else in a Substack body, like a subscribe box, is a
# widget the site doesn't have.
SITE_NODES = {
    "paragraph", "heading", "blockquote", "bullet_list", "ordered_list", "code_block", "codeBlock",
    "captionedImage", "horizontal_rule", "footnote", "latex_block", "pullquote", "calloutBlock",
}  # fmt: skip


class Stop(Exception):
    """A refusal or usage error: printed as-is, exit 1."""


# ── Auth ────────────────────────────────────────────────────────────────────


def parse_cookies(raw):
    """A cookies.json dict, a browser `cookie:` header, or a bare substack.sid value."""
    raw = raw.strip()
    if raw.startswith("{"):
        return json.loads(raw)
    if "=" in raw:
        return Api._parse_cookies_string(raw)
    return {"substack.sid": raw} if raw else {}


def redact(message):
    try:
        values = parse_cookies(COOKIES.read_text()).values()
    except Exception:
        values = []
    for value in values:
        if len(str(value)) >= 8:
            message = message.replace(str(value), "[redacted]")
    return message


def api():
    if not COOKIES.exists():
        raise Stop(
            f"no Substack cookie at {COOKIES}. Copy it from a signed-in browser,"
            " then run: .venv/bin/python scripts/substack-sync.py login"
        )
    raw = COOKIES.read_text().strip()
    if raw.startswith("{"):
        auth = {"cookies_path": str(COOKIES)}
    else:
        auth = {"cookies_string": raw if "=" in raw else f"substack.sid={raw}"}
    return Api(publication_url=PUBLICATION, timeout=30, **auth)


# ── Site side ───────────────────────────────────────────────────────────────


def essay(slug):
    """The site essay as Substack gets it: tables as lists, local images, canonical line."""
    cmd = ["node", "scripts/essays.mjs", "export", slug, "--json", "--local-images"]
    run = subprocess.run(cmd, cwd=ROOT, capture_output=True, text=True)
    if run.returncode:
        raise Stop((run.stderr or run.stdout).strip())
    return json.loads(run.stdout)


def resolve(target):
    """A Substack id or a site slug → (id, site essay or None)."""
    if target.isdigit():
        return int(target), None
    site = essay(target)
    if not site.get("substackId"):
        raise Stop(f"{target} has no substackId in its frontmatter. New essay? Run: draft {target}")
    return int(site["substackId"]), site


def link_frontmatter(slug, **fields):
    """Record the Substack copy (substackId, substackUrl) in the essay's frontmatter."""
    path = ESSAYS / f"{slug}.md"
    text = path.read_text()
    end = text.index("\n---\n", 4)
    lines = text[4:end].split("\n")
    for key, value in fields.items():
        at = next((i for i, line in enumerate(lines) if line.startswith(f"{key}:")), None)
        if at is None:
            lines.append(f"{key}: {value}")
        else:
            lines[at] = f"{key}: {value}"
    path.write_text("---\n" + "\n".join(lines) + text[end:])


def walk(nodes):
    for node in nodes:
        yield node
        yield from walk(node.get("content") or [])


def curl(text, before=""):
    """Straight quotes to typographic ones, as Substack's editor converts them."""
    out = []
    for i, ch in enumerate(text):
        prev = out[-1] if out else before
        if ch == '"':
            ch = "“" if not prev or prev.isspace() or prev in "([{—–" else "”"
        elif ch == "'":
            follows_word = prev and (prev.isalnum() or prev in ".,!?;:)]}”’")
            ch = "’" if follows_word or not text[i + 1 : i + 2].isalnum() else "‘"
        out.append(ch)
    return "".join(out)


def typeset(nodes):
    """Curl quotes in prose, text run by text run; code stays straight."""
    for node in nodes:
        kids = node.get("content") or []
        if node.get("type") == "code_block":
            continue
        if kids and all(k.get("type") in ("text", "hard_break", "footnoteAnchor") for k in kids):
            before = ""
            for k in kids:
                if k.get("type") == "text" and not any(m.get("type") == "code" for m in k.get("marks") or []):
                    k["text"] = curl(k["text"], before)
                before = k.get("text", " ")[-1:] or before
        else:
            typeset(kids)


def to_substack(site, a=None):
    """The site essay as Substack nodes. Given the api, local images upload to Substack's CDN."""
    nodes = markdown_to_doc(site["body"], api=a)
    for node in walk(nodes):
        # The live posts store code as code_block, which renders; the library
        # emits codeBlock, which nothing here has seen render.
        if node.get("type") == "codeBlock":
            node["type"] = "code_block"
            node["attrs"] = {"language": (node.get("attrs") or {}).get("language")}
        # The library takes alt text from the raw markdown, escapes included.
        if node.get("type") == "image2" and node["attrs"].get("alt"):
            node["attrs"]["alt"] = re.sub(r"\\([!-/:-@\[-`{-~])", r"\1", node["attrs"]["alt"])
    # The site renders straight quotes; Substack's editor curls them, and the
    # live posts have curly ones. Match the mirror, not the source.
    typeset(nodes)
    return nodes


# ── Substack side ───────────────────────────────────────────────────────────


def load(body):
    return json.loads(body) if isinstance(body, str) else body


def editor(pid):
    return f"{PUBLICATION}/publish/post/{pid}"


def title_of(draft):
    return draft.get("draft_title") or draft.get("title") or "(untitled)"


def backup(draft):
    """The draft object exactly as Substack returned it. To restore, put_draft its
    draft_body, draft_title and draft_subtitle back, then publish."""
    BACKUPS.mkdir(parents=True, exist_ok=True)
    path = BACKUPS / f"{draft['id']}-{datetime.now(timezone.utc):%Y%m%dT%H%M%SZ}.json"
    path.write_text(json.dumps(draft, indent=1))
    return path.relative_to(ROOT)


def plain(node):
    """A node's words: text runs joined as written, blocks and image alt text spaced."""
    if node.get("type") == "text":
        return node.get("text", "")
    if node.get("type") == "hard_break":
        return " "
    kids = node.get("content") or []
    inline = all(k.get("type") in ("text", "hard_break", "footnoteAnchor") for k in kids)
    alt = (node.get("attrs") or {}).get("alt")
    inner = ("" if inline else " ").join(plain(k) for k in kids)
    return " ".join(p for p in (alt, inner) if p).strip()


def words(nodes):
    return len(re.findall(r"\w+", " ".join(plain(n) for n in nodes)))


def keep_widgets(remote, nodes):
    """Put Substack-only widgets (subscribe boxes and the like) back where they sat.

    Each goes after the site block that best matches the last block with words
    before it on Substack, then past any wordless blocks (an image without alt
    text, a rule) that sat between the two there too. Returns (nodes, notes).
    """

    def norm(s):
        return re.sub(r"[\W_]+", " ", s.lower()).strip()[:300]

    keys = [norm(plain(n)) for n in nodes]
    inserts, notes = [], []
    anchor, gap = None, []
    for i, node in enumerate(remote):
        if node.get("type") in SITE_NODES:
            if norm(plain(node)):
                anchor, gap = norm(plain(node)), []
            else:
                gap.append(node.get("type"))
            continue
        if anchor is None:
            at = 0
        else:
            scores = [difflib.SequenceMatcher(None, anchor, k, autojunk=False).ratio() for k in keys]
            best = max(range(len(keys)), key=scores.__getitem__)
            if scores[best] >= 0.6:
                at = best + 1
                for kind in gap:
                    if at < len(nodes) and nodes[at].get("type") == kind:
                        at += 1
            else:
                at = round(i / len(remote) * len(nodes))
                notes.append(f"no site block matches what {node['type']} followed; placed it {i / len(remote):.0%} in")
        inserts.append((at, i, node))
        notes.append(f"keeping {node['type']} after: {(plain(nodes[at - 1])[:60] if at else '(the top)')!r}")
    out = list(nodes)
    for at, _, node in sorted(inserts, key=lambda x: (x[0], x[1]), reverse=True):
        out.insert(at, node)
    return out, notes


def show_diff(old_nodes, new_nodes):
    """Block-by-block text diff, one line per top-level node. Blocks whose only
    change is straight → curly quotes are counted, not listed."""

    def lines(nodes):
        return [plain(n) if n.get("type") == "paragraph" else f"[{n.get('type')}] {plain(n)}".strip() for n in nodes]

    old, new = lines(old_nodes), lines(new_nodes)
    flat = str.maketrans("‘’“”", "''\"\"")
    matcher = difflib.SequenceMatcher(None, [s.translate(flat) for s in old], [s.translate(flat) for s in new], autojunk=False)
    changed, quotes = [], 0
    for tag, i1, i2, j1, j2 in matcher.get_opcodes():
        if tag == "equal":
            quotes += sum(old[i] != new[j] for i, j in zip(range(i1, i2), range(j1, j2)))
        else:
            changed += [f"- {s}" for s in old[i1:i2]] + [f"+ {s}" for s in new[j1:j2]]
    restyled = f"; {quotes} more change quote style only" if quotes else ""
    if not changed:
        print(f"  body: no change{restyled}")
        return
    print(f"  body: {sum(c[0] == '-' for c in changed)} block(s) out, {sum(c[0] == '+' for c in changed)} in{restyled}")
    for line in changed:
        print(f"    {line[:118]}")


def confirm(what, yes):
    if yes:
        return
    if not sys.stdin.isatty():
        raise Stop(f"about to {what}. Re-run with --yes to confirm.")
    if input(f"{what}? [y/N] ").strip().lower() not in ("y", "yes"):
        raise Stop("cancelled")


# ── Commands ────────────────────────────────────────────────────────────────


def cmd_login(args):
    # Clipboard, not argv or a prompt, so the cookie never lands in shell
    # history or a transcript. Piped stdin works too.
    raw = "" if sys.stdin.isatty() else sys.stdin.read()
    if not raw.strip():
        raw = subprocess.run(["pbpaste"], capture_output=True, text=True).stdout
    cookies = parse_cookies(raw)
    if "substack.sid" not in cookies:
        raise Stop("the clipboard doesn't hold a Substack cookie (no substack.sid)")
    COOKIES.parent.mkdir(mode=0o700, parents=True, exist_ok=True)
    fd = os.open(COOKIES, os.O_WRONLY | os.O_CREAT | os.O_TRUNC, 0o600)
    with os.fdopen(fd, "w") as f:
        json.dump(cookies, f)
    os.chmod(COOKIES, 0o600)
    subprocess.run(["pbcopy"], input="", text=True)
    print(f"saved {COOKIES} (mode 600) and cleared the clipboard")
    cmd_whoami(args)


def cmd_whoami(args):
    a = api()
    me = a.get_user_profile()
    print(f"signed in as {me.get('name')} (@{me.get('handle')}), writing to {a.publication_url.removesuffix('/api/v1')}")


def cmd_list(args):
    a = api()
    published = a.get_published_posts(limit=50)
    published = published.get("posts", []) if isinstance(published, dict) else published
    drafts = a.get_drafts(filter="draft", limit=25) or []  # the drafts endpoint 400s above 25
    for state, posts in (("draft", drafts), ("published", published)):
        for p in posts:
            print(f"{p.get('id'):>10}  {state:<9}  {str(p.get('post_date') or '')[:10]:<10}  {title_of(p)}")


def cmd_get(args):
    pid, _ = resolve(args.target)
    d = api().get_draft(pid)
    doc = load(d["draft_body"])["content"]
    state = f"live since {d['post_date'][:10]}" if d.get("is_published") else "not published"
    if d.get("email_sent_at"):
        state += f", emailed {d['email_sent_at'][:10]}"
    if d.get("is_published") and d.get("body") != d.get("draft_body"):
        state += ", with unpublished edits in the draft copy"
    widgets = Counter(n.get("type") for n in doc if n.get("type") not in SITE_NODES)
    print(title_of(d))
    print(f"  {pid} · {state} · {PUBLICATION}/p/{d.get('slug')}")
    print(f"  subtitle: {d.get('draft_subtitle') or '(none)'}")
    print(f"  {len(doc)} blocks, {words(doc)} words; widgets: {', '.join(f'{t} ×{c}' for t, c in widgets.items()) or 'none'}")
    print(f"  backup: {backup(d)}")


def cmd_draft(args):
    site = essay(args.slug)
    if site.get("substackId"):
        raise Stop(f"already on Substack as {site['substackId']}. Run: update {args.slug}")
    a = api()
    post = Post(title=site["title"], subtitle=site["subtitle"], user_id=a.get_user_id())
    post.draft_body["content"] = to_substack(site, a)
    pid = a.post_draft(post.get_draft())["id"]
    a.put_draft(pid, slug=args.slug)  # same URL path as the site
    link_frontmatter(args.slug, substackId=pid)
    print(f"draft {pid} created, unpublished: {editor(pid)}")
    print(f"  substackId added to content/insights/{args.slug}.md")


def cmd_update(args):
    pid, site = resolve(args.slug)
    if site is None:
        raise Stop("update takes a site slug: the site copy is what gets sent")
    a = api()
    d = a.get_draft(pid)
    remote = load(d["draft_body"])["content"]
    print(f"{title_of(d)} ({pid}); backup: {backup(d)}")

    def build(uploads):
        nodes = to_substack(site, a if uploads else None)
        return (nodes, []) if args.drop_widgets else keep_widgets(remote, nodes)

    nodes, notes = build(uploads=False)
    for note in notes:
        print(f"  {note}")
    show_diff(remote, nodes)
    for field, ours, theirs in (
        ("title", site["title"], title_of(d)),
        ("subtitle", site["subtitle"], d.get("draft_subtitle") or ""),
    ):
        if ours != theirs:
            print(f"  {field} differs ({'sending the site one' if args.meta else 'not sent; --meta sends it'}):")
            print(f"    site      {ours}\n    substack  {theirs}")

    if not args.write:
        print("dry run: nothing sent. --write loads this into the Substack draft copy.")
        return
    if words(nodes) < words(remote) / 2:
        raise Stop(f"the site copy is under half the Substack copy ({words(nodes)} vs {words(remote)} words); not sending")
    nodes, _ = build(uploads=True)
    if a.get_draft(pid).get("draft_updated_at") != d.get("draft_updated_at"):
        raise Stop("the Substack draft changed while this ran; run update again")
    payload = {"draft_body": json.dumps({"type": "doc", "content": nodes})}
    if args.meta:
        payload.update(draft_title=site["title"], draft_subtitle=site["subtitle"])
    a.put_draft(pid, **payload)
    after = a.get_draft(pid)
    kept = len(load(after["draft_body"])["content"])
    print(f"loaded {kept} blocks into the draft copy of {pid}: {editor(pid)}")
    if kept != len(nodes):
        print(f"  ! Substack kept {kept} of the {len(nodes)} blocks sent; check the draft before pushing it live")
    if d.get("is_published"):
        if after.get("body") != d.get("body"):
            print("  ! the live post changed too: Substack applied the edit immediately")
        else:
            print(f"  the live post is unchanged until pushed: Update in the editor, or publish {args.slug} --yes")


def cmd_publish(args):
    pid, site = resolve(args.target)
    a = api()
    d = a.get_draft(pid)
    live, emailed = bool(d.get("is_published")), bool(d.get("email_sent_at"))
    if args.email and (live or emailed):
        raise Stop(f"{pid} is already {'live' if live else 'emailed'}. --email would send it to every subscriber again. Refused.")
    action = "push the draft copy of live post" if live else "publish draft"
    delivery = "AND EMAIL every subscriber" if args.email else "with no email"
    confirm(f"{action} {pid} ({title_of(d)}) {delivery}", args.yes)
    a.prepublish_draft(pid)
    a.publish_draft(pid, send=args.email, share_automatically=False)
    after = a.get_draft(pid)
    url = f"{PUBLICATION}/p/{after.get('slug')}"
    if site:
        link_frontmatter(site["slug"], substackId=pid, substackUrl=url)
    print(f"{'updated' if live else 'published'} {url} {'with' if args.email else 'without'} email")
    if after.get("body") != after.get("draft_body"):
        print("  ! the live body still differs from the draft copy")
    if live and after.get("post_date") != d.get("post_date"):
        print(f"  ! the post date moved ({d.get('post_date')} → {after.get('post_date')}); reset it in the post's settings")


def main():
    parser = argparse.ArgumentParser(description="Substack side of the essay sync (see module docstring).")
    commands = parser.add_subparsers(dest="cmd", required=True)
    for name in ("login", "whoami", "list"):
        commands.add_parser(name)
    commands.add_parser("get").add_argument("target", help="site slug or Substack id")
    commands.add_parser("draft").add_argument("slug")
    update = commands.add_parser("update")
    update.add_argument("slug")
    update.add_argument("--write", action="store_true", help="send it (default is a dry run)")
    update.add_argument("--meta", action="store_true", help="also send the site title and subtitle")
    update.add_argument("--drop-widgets", action="store_true", help="drop Substack-only widgets instead of keeping them")
    publish = commands.add_parser("publish")
    publish.add_argument("target", help="site slug or Substack id")
    publish.add_argument("--email", action="store_true", help="email subscribers (new posts only)")
    publish.add_argument("--yes", action="store_true", help="confirm without a prompt")
    args = parser.parse_args()
    try:
        globals()[f"cmd_{args.cmd}"](args)
    except Stop as stop:
        sys.exit(str(stop))
    except Exception as exc:  # library and network errors: never echo a cookie
        sys.exit(redact(f"substack: {type(exc).__name__}: {exc}"))


if __name__ == "__main__":
    main()
