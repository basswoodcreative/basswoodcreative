---
title: My coding agent lost the plot. So I brought it in for questioning.
description: The box builds itself; the agent still needs taming. The config that routes Pi through llama-swap, the two context dials that have to agree, the truncation that ate a session — and the fix the agent found in its own logs, once I sat it down and asked the right questions.
date: 2026-08-20
pillar: AI & Agent-Assisted Development
---

## Our agent in the field started forgetting things

The [last post](/insights/the-128gb-box-that-replaced-my-api-key) ended on a high note: a Bosgame M5 in the next room, answering to `strix`, serving an OpenAI-compatible API, and Pi — the open-source terminal coding agent — pointed at it for the first fully local coding session. Every prompt, every tool call, every generated token, in the house.

That was the end of the build. It was also the beginning of the actual work. The agent had been deployed to the field; this post is what came back in its reports.

For readers who skipped Part 1, the one piece of context you need is **[llama-swap](https://github.com/mostlygeek/llama-swap)**: a small OpenAI-compatible proxy that sits in front of [llama.cpp](https://github.com/ggml-org/llama.cpp) on `strix`. It reads the *name* in each incoming request, loads the matching GGUF, unloads models on a per-model TTL, and serves a little dashboard at `:8080/ui`. Hold on to one idea from that sentence, because this whole post leans on it: **the name in the request is the routing key.**

![The llama-swap Activity dashboard: prompt-processing and token-generation histograms, an in-flight qwen3.8-27b request, and the per-request log with cache hits and token speeds](/insights/my-coding-agent-lost-the-plot/llama-swap-activity.jpg)

Here's what the daily-driver phase actually looked like, and what this post covers in one breath: the one JSON file that connects the agent to the router, with the two llama-swap-specific rules that aren't in any README · two context failure modes with different symptoms and the same root cause · a truncation error that ate a session's work — and the interrogation where I pointed the agent at its own logs and had it explain itself · plus, as an epilogue, a free server-side speedup.

One note on why I document this phase so carefully. When [Basswood Creative](https://basswoodcreative.com), my consulting practice, builds infrastructure for a client, the project isn't done when the demo works — it's done at handover: configs reconciled, failure modes written down, a runbook that's been tested against real daily use. This post is my own reference build going through exactly that phase, in public. Part 1 was the blueprint; this is the punch list.

## The dossier: one JSON file between the agent and the router

Pi itself is a one-line npm global install, and it should be boring. The interesting file is `~/.pi/agent/models.json` — the agent's dossier on every model it's allowed to talk to — and Part 1 already walked through its shape: the provider block, the `baseUrl`, the compat flags. This section is only the delta: the parts that are specific to pointing Pi at a **llama-swap router** instead of a bare llama-server. There are two rules, and they're both about the same illusion.

**Rule 1 — the router gets its own provider block.** The `baseUrl` is the swap endpoint, and everything Pi does from here on assumes that endpoint *is* the model. Pi has no idea there's a load/unload dance happening behind it; from the agent's perspective, the swap layer and a single dedicated llama-server are indistinguishable. That's the point of the proxy — but it has a consequence worth stating plainly: every config change now lands in **two places**. The provider block on the laptop, and the per-model stanza in the llama-swap config on `strix`. Both have to be right, and nothing checks them against each other. That job is yours, and most of this post is about the ways it goes wrong.

**Rule 2 — the model `id` is the routing key.** The `id` in Pi's model entry must be **character-for-character identical** to the key in the llama-swap config's `models:` map, because that name, carried in the request body, is how the router picks which GGUF to load. One character off and the request 404s — or, if the typo happens to match a *different* model in the library, silently loads the wrong one, which is worse. This is the section's aha, and the payoff of the intro's motif: **the id is not a label, it's a switch.** Treat it with the respect you'd give a symlink into production.

Which leaves two numbers in the model entry I skated past last time: `contextWindow` and `maxTokens`. Foreshadow, in one sentence: **these two fields are where the next two sections hurt.**

Two quieter things Pi does that will matter later. First, every turn of every session is logged, in full, to a session file on disk under `~/.pi/agent/sessions/` — remember that, because it's how the truncation story gets solved. Second, `models.json` hot-reloads every time you open `/model`, so you can iterate on all of these settings mid-session without restarting anything. During the tuning described below, that quality-of-life feature earned its keep daily.

> **✅ Verify:** open `/model` in Pi and confirm the `strix` model is listed, then hand it a one-line task and watch it complete. If `/model` shows the model but the task 404s, you've found Rule 2 the hard way — diff the `id` against the llama-swap config key.

```json
  "providers": {
    "llama-swap": {
      "baseUrl": "http://strix:8080/v1",
      "api": "openai-completions",
      "apiKey": "none",
      "models": [
        {
          "id": "qwen3.8-27b",
          "name": "Qwen 3.8-27b Q4_K_XL",
          "reasoning": true,
          "input": ["text"],
          "contextWindow": 131072,
          "maxTokens": 16384,
          "compat": {
            "thinkingFormat": "chat-template",
            "chatTemplateKwargs": {
              "enable_thinking": true,
              "thinking_budget": 4096
            }
          }
        }
      ]
    }
  }
```

## Two dials, one budget

A coding agent eats context. Long files, long tool transcripts, the accumulated back-and-forth of a real session — it all lands in the same window. And in this stack there are **two places** that keep the books on that window: the server, via the `-c` flag in the llama-swap stanza, and Pi, via `contextWindow` in models.json.

One model-specific wrinkle before the failures: Qwen 3.8 is a famously *heavy* thinker. The community flagged it within days of release — the Hugging Face discussion threads have titles like ["A crazy thinking model"](https://huggingface.co/Qwen/Qwen3.8-27B/discussions/97) and ["This model cannot stop thinking"](https://huggingface.co/Qwen/Qwen3.8-27B/discussions/113) — and the consensus is that out of the box it will happily reason at maximum effort about renaming a variable. Managing that thinking is crucial to using the model effectively, and it's about to become the villain of the next section. For now, just know that context pressure on this model comes from both directions: long sessions filling the window, and long reasoning filling every response.

Both of my dials were wrong. In the same direction. With completely different symptoms.

**Failure A — the server's dial too small.** The first symptom was the model hitting the wall early and often: Pi auto-compacted constantly, and as sessions approached the real limit, requests started failing outright. The cause was embarrassing in the way config bugs usually are: the llama-swap stanza was still carrying a chat-sized `-c` from the model's first day in the library. A chat session wanders; an agent session *accumulates*. The fix is to raise `-c` in the llama-server command *inside the llama-swap config*:

```yaml
models:
  qwen3.8-27b:
    cmd: llama-server -m /models/Qwen3.8-27B-Q4_K_XL.gguf
         -c 131072 ${default_args}     # was -c 32768 — chat-sized
    ttl: 0                             # the daily driver stays resident
```

— and then re-run Part 1's budget inequality (weights plus context under the practical ceiling), because context is exactly the dial you trade against weight size. A bigger window is not free; it comes out of the same unified memory the weights live in.

**Failure B — Pi's dial too small.** Server fixed, and the sessions were *still* getting summarized early. This one took longer to see, because nothing was failing — the model just kept losing the plot on perfectly healthy contexts. The cause: `contextWindow` in models.json was set below the server's real context. Pi's internal accounting is conservative by design — it reserves room for the next response and for the compaction process itself — so when its notion of the window is smaller than reality, it starts summarizing the session long before the server needs it to. The model wasn't running out of context. Pi just *thought* it was. Fix: set `contextWindow` to the server's true `-c`.

**Failure C — Pi claiming *more* than the server has.** The mirror image of Failure B, I found this one in my own logs from an earlier incident — Pi configured for a 131,072-token window while the server was actually running 32,768. Near the server's real limit, requests come back as hard 400s (`request exceeds the available context size`), or the server clamps the response to whatever sliver of room is left, producing bizarre one-token outputs. Different symptom again — but the same root cause as A and B.

The reconciled model entry in `~/.pi/agent/models.json`, matching the stanza above:

```json
"models": [{
  "id": "qwen3.8-27b",
  "name": "Qwen 3.8-27B Q4_K_XL",
  "reasoning": true,
  "contextWindow": 131072,
  "maxTokens": 16384
}]
```

Here's the rule, and it's the one thing to take from this section:

> **The two dials describe one budget.** Server too small → overflow errors. Pi too small → premature compaction. Pi too big → 400s mid-task. Keep `-c` and `contextWindow` in sync — **for every model the router can serve**, not just the daily driver. The router will happily swap you onto the one model you forgot to check.

Two settings I've left in place since. In `~/.pi/agent/settings.json`, `compaction.reserveTokens` is sized so the output budget isn't squeezed in the run-up to a compaction — the default is 16384, and I keep it at least as large as the model's `maxTokens`:

```json
{
  "compaction": {
    "reserveTokens": 16384
  }
}
```

And one habit: a manual `/compact` at a clean boundary before starting a big task. A deliberate summary at a moment you chose beats an emergency compaction in the middle of a turn, every time. The next section is about what happens when you get the emergency kind.

> **✅ Verify:** the dials agree. Grep the llama-swap config on `strix` for `-c`, grep models.json for `contextWindow`, and confirm they match — for every model in the `models:` map. It's a two-grep check that takes thirty seconds and prevents all three failure modes above.
## "Response was truncated before completion."

Now the story section. This is the one that cost real work, and the one where the stack paid for itself in a way I didn't expect.

![Pi mid-turn, tallying word counts section by section — then the red banner: "Response was truncated before completion."](/insights/my-coding-agent-lost-the-plot/truncation-banner.jpg)

**The scene.** A long session — twenty minutes of accumulated agent work, mid-refactor. Then the banner: **"Response was truncated before completion."** The turn's work simply vanished; an in-flight file write was discarded with a note that the tool call was never executed because the response hit the output token limit. Annoying, but recoverable — or so I thought. Then the tell. I typed *pick up where you left off*, and the model politely insisted it had no prior history. Not "I lost some detail." No history at all. It was behaving like it was the first turn of the conversation. My agent had burned its own cover: real work gone, and no memory of the mission.

**The half-fix.** In Pi's settings menu there's a Thinking Level control, and I dropped it to the floor: `minimal`, "very brief reasoning." The error seemed to go away. One notch up, to `low` — "light reasoning" — and it came back. Those are the two lowest options on the dial, and the fact that one worked and the other didn't felt like a clue I couldn't read yet. It was. Hold that thought for three paragraphs: the punchline is that the dial wasn't doing what I thought it was doing — it wasn't doing anything at all.

![Pi's Thinking Level menu — off through high, with minimal ("very brief reasoning, ~1k tokens") selected](/insights/my-coding-agent-lost-the-plot/thinking-level.jpg)

**The move — bring the agent in for questioning.** Everything in this stack is open: Pi's source is on disk, and Pi's session logs are JSONL files under `~/.pi/agent/sessions/`. So I opened a fresh Pi session, pointed it at both, and asked it to explain the error to me — the interrogation, conducted with the subject's own paper trail on the table. The concrete debugging steps, in order:

First, **find the failing turn in the session log.** The agent grepped its own JSONL for the incident and surfaced the smoking gun: a response with `stop=length` — the model hit its output cap — where the output was 16,384 tokens consisting of *only a thinking block*. No text. No tool calls. The model had spent its entire output budget reasoning and never got to say anything.

Second, **read the code paths that produce the symptoms.** Two of them, both in Pi's dist: the truncation banner fires whenever a response comes back with `stopReason: "length"`. And separately, an overflow-recovery path: when a length stop occurs *below* the configured output cap, Pi treats it as context pressure, deletes the truncated message, triggers an auto-compaction, and retries the turn once.

Third, **connect them.** That recovery path is the whole mystery. Here's what actually happened, assembled from the logs:

- "Truncated" means the **output** cap was hit — `maxTokens` — not the input context. This is easy to misread, and the misreading matters: it sends you off tuning the context dials from the last section, which were, for once, innocent.
- The model is a reasoning model — and remember, this particular model is the community's poster child for overthinking — but no thinking-control parameter was reaching the server; without the right `compat` wiring in models.json, Pi doesn't send one. Which means the Thinking Level dial in the settings menu, the one that "fixed" it? **A no-op.** The model's thinking was running unbounded on every request, and on hard tasks the thinking phase alone consumed the entire 16,384-token output budget.
- And the "first turn" amnesia: when the response died, Pi's overflow recovery kicked in. It removed the truncated message and **auto-compacted** — the same 27B model summarized the whole session — then retried. After that, the model's working context held the summary plus roughly the last 20k tokens of history. The verbatim session was gone from its view. The first summary of the incident, preserved in the log, literally began: *"No prior history."* The model wasn't lying to me. It was reading its own compaction summary, which started by announcing there was nothing before it.

**The fix.** Cap the thinking phase deterministically, at the request level, where it can't be a no-op. Qwen's chat template accepts a thinking budget as a template kwarg, and Pi can pass it through the `compat` block:

```json
"compat": {
  "thinkingFormat": "chat-template",
  "chatTemplateKwargs": {
    "enable_thinking": true,
    "thinking_budget": 4096
  }
}
```

The server side needs `--jinja` in the llama-server command for the template kwargs to apply. A 4,096-token thinking budget leaves the other ~12k of the output window for the actual answer and tool-call JSON, and the truncations stopped. Plus the rule from the last section, restated because this incident is where I learned to take it seriously: `contextWindow` and the server's `-c`, in sync, for every swappable model.

**The meta-lesson.** Nothing was actually lost. The session file on disk kept every turn verbatim — only the model's *working context* had been condensed, and a quick "re-read the files you were working on" rebuilt the rest. But the part I keep coming back to is the shape of the debugging session itself: the diagnosis — logs, source, root cause, fix — was performed *by the agent on the box, about the agent on the box.* Every layer was inspectable, so the system could explain its own failure. That's the open-source payoff, and it's not an abstraction — it's the property I'd point a client at first when they ask why a fully auditable stack is worth the setup cost.
## The debrief

So: a box that could chat became a box that could *work*. The distance between those two was one JSON file with a routing key, two context dials set to the same budget, and a thinking cap that actually reaches the server. Every fix in this post was a specific number in a specific file — and none of them required adding a new layer to the stack. The layers from Part 1 held; they just needed their books reconciled.

That reconciliation is the real subject of this post. A local model server and a local agent each keep their own books — the server's `-c`, Pi's `contextWindow`, the output caps, the thinking budget — and the pain of the daily-driver phase is almost entirely in making them agree. Nothing here was hard once it was *visible*. The work was making it visible.

Which is also the consulting pitch, made concrete. This handover phase — taming the agent, reconciling the configs, setting the budgets, writing down the failure modes so the next person doesn't rediscover them — is exactly the work that separates a demo from infrastructure, and it's the part of a local-AI build [Basswood Creative](https://basswoodcreative.com) most often gets called in for. If your team's box "worked once" and then got weird, that's a conversation I'd enjoy.

## Epilogue: one last gadget

Every field kit deserves one gadget that just works, and after a post full of dials that have to agree with other dials, here it is: a server-side flag that only helps.

Qwen3 ships **multi-token prediction** heads — extra layers trained to guess a few tokens ahead. Add `--mtp` to the llama-server command in the llama-swap stanza and llama.cpp uses them to draft tokens speculatively, verifying the drafts against the main model as it goes. The full daily-driver stanza, with everything this post added:

```yaml
models:
  qwen3.8-27b:
    cmd: llama-server -m /models/Qwen3.8-27B-Q4_K_XL.gguf
         -c 131072 --jinja --mtp
         -ngl 999 --host 0.0.0.0 --port ${PORT}
    ttl: 600
```

What it means in practice: a visible bump in generation speed, no quality trade-off — the verification step means the output is identical to what the model would have produced anyway — and no client-side change at all. Pi doesn't know it's there. And because the flag lives on the server, *every* session gets the speedup at once — including the day you have six of them open, which we'll look into next time.