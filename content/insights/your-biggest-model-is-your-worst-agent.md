---
title: Your biggest model is your worst agent
description: Using the largest model you can fit as a coding agent is great, until you run out of space.
date: 2026-08-24
pillar: AI & Agent-Assisted Development
substackUrl: https://protocolgrade.substack.com/p/your-biggest-model-is-your-worst
substackId: 212613251
---
> The config everyone screenshots — the biggest model that fits the box — is precisely the one that can’t run agents. The reason why should change what you download next.

*If this post changes your napkin math, that’s the service. [Basswood Creative](https://basswoodcreative.com/) is my consulting practice — I spec, build, and hand over local-LLM infrastructure sized for agent workloads, not screenshots.*

## What’s in the box?

If you own a big unified-memory box, you know the game, because you’ve played it. Find the largest model that fits. Watch it load. Screenshot the memory graph pinned at the ceiling. Post it. The 100-gigabyte-class load *is* the flex — the whole point of buying a machine like this, or so the game says.

I played it too, so here is the thesis, from inside the glass house: **that config — the biggest model that fits — is the worst one you can run for agent workloads.** Not slightly suboptimal. Structurally wrong. And the reason isn’t benchmarks or vibes; it’s arithmetic we could all have done on a napkin, and none of us did, because we were busy taking screenshots.

The way I found out was mundane. As I was getting started I would stick to one session and one task. Soon I realized I needed five or six [Pi](https://github.com/badlogic/pi-mono) coding-agent sessions open at once, in separate terminals — one on a refactor, one on docs, one poking at a config, a couple parked mid-task — all talking to the same llama-server on `strix`. And the question every reader with a big model asks at this point is the one I asked too: *doesn’t that need six times the memory?*

No. And the reason why is the most useful mental model this whole experience has produced.

## One brain, six notebooks

Here’s the architecture, one llama-server process loads the model weights **once**. Every Pi session is just an API client hitting the same endpoint, and concurrent requests get batched on that one server. What multiplies per session is only the **KV cache** — the model’s working memory of *that session’s* context. The weights are a fixed cost, paid once and shared by everything; the contexts are the variable cost, paid per agent.

The picture I keep in my head: **one brain, many notebooks.** The weights are the brain. One brain serves every conversation, and it does not grow a second brain because a second person walked into the room. What each new session adds is a notebook — the running notes of that one conversation. Six sessions is one brain and six notebooks, and a notebook is a lot cheaper than a brain.

If you’ve never looked inside the notebook: the KV cache holds the attention keys and values for every token in a session’s context. It’s the reason the model doesn’t re-read the entire conversation from scratch for every new token it generates. Its size scales with the context length and the model’s architecture — and *not* with how many other sessions happen to exist on the server. Your notebook doesn’t get thicker because mine did.

One anti-pattern to name before the math, because it’s the one way to actually pay six times: launching separate server processes, each loading its own copy of the weights. Nobody should ever do this. It wastes the memory *and* throws away the batching — the two wins of the shared server, gone at once. If you’re multiplying weights, the mistake is in the process list, not the model.

## 24 GB, not 106

Now the arithmetic, with real numbers. My daily driver is Qwen 3.8-27B; the GGUF is 17.6 GB of weights, loaded once. Each agent’s notebook — the KV cache at a 32k context — runs roughly a gigabyte. So six concurrent agents cost about 17.6 + 6×1 ≈ **24 GB. Total.**

The naive multiplication says six sessions of a 17.6 GB model should cost about 106 GB. It’s off by more than a factor of four — and notice the *direction* it’s off in. It’s the direction that makes people buy hardware they don’t need.

Here’s the whole post as a table:

| Model | Weights (once) | KV per 32k agent | Sessions in ~110 GB |
|---|---|---|---|
| Qwen 3.8-27B | 17.6 GB | ~1 GB | dozens — the pool is huge |
| 60–70 GB class MoE | ~65 GB | ~1–2 GB | a comfortable handful |
| The trophy: a ~105 GB box-filler | fills the box | — | effectively one |

That last row is the one we screenshot. Let’s run the same math on it.

![nvtop on strix's Radeon 8060S: llama-server running GLM-4.5-Air at Q4_K_M holds about 72 GiB of memory as GPU load falls from 100% to idle](/insights/your-biggest-model-is-your-worst-agent/nvtop-glm-air-memory.jpg)

## The trophy, re-read

Take the box-filler: a \~105 GB model, the biggest thing that fits, the one the box was arguably bought for.

Subtract: 110 minus 105 leaves a **5 GB context pool**. That’s not “fewer agents.” At a few gigabytes of working memory per serious coding session, that’s *maybe one* agent, running uncomfortably close to the wall, with nothing left over for anything else. The best model on the box is the only one on the box that can’t do the job.

Sit with the inversion for a second, because it’s the whole post. We rank models by capability, and for a chat window that ranking is the right one. But the moment the workload is agents — plural sessions, long contexts, tools — capability per model stops being the axis that matters. The 27B “lesser” model runs six agents with tens of gigabytes to spare. The trophy chokes on one. **At the top of the range, the leaderboard and the agent-fitness ranking run in opposite directions.**

And there’s a version of this that’s genuinely funny once you see it: we took a frontier-class model and quantized it down to 3 bits — squeezed it, lossy and gasping, through the door — and the prize for getting it inside is a machine that can’t open a second terminal.

The honest rebuttal deserves a paragraph, because it’s the one the sophisticated reader is already composing: *the big model is smarter, and one great agent beats six mediocre ones.* Sometimes true! But that’s a trade you should make on purpose, with the price tag visible — and the price is not “fewer agents,” it’s the whole modern agent pattern: parallel sessions, sub-agents, background tasks, a verifier pass running while the main session works. The box-filler doesn’t discount that pattern; it forecloses it. You’re not trading six agents for one better agent. You’re trading the pattern for a chat window.

In between the extremes sits the config the arithmetic actually likes: a 60–70 GB mixture-of-experts. Sixty-five gigabytes once, a gigabyte or two per agent, forever — a comfortable handful of sessions with headroom to spare. Hold that thought; the rule at the end names it.

## Sub-agents cost a notebook, not a brain

The corollary that changed how I think about orchestration: when an agent spawns a sub-agent, the sub-agent needs *notebook*-sized headroom, not *brain*-sized. It’s another request slot on the same server. Another gigabyte, not another copy of the file.

Which reframes what the big model’s problem actually was. It was never “a sub-agent needs another hundred gigabytes” — no sane architecture ever loads the weights twice. It’s that a box-filling model leaves roughly zero room for even one more *context*. A mid-size model, by contrast, can fan out into a whole tree of sub-agents, because each branch of the tree costs about a gigabyte, not the whole file.

And fan-out is the direction everything is moving. Every modern coding agent wants to delegate: background tasks, parallel explorers, a second pair of eyes on a diff. The context pool is the currency all of that spends. A big pool means your agent can afford helpers. An empty pool means it works alone, forever, no matter how smart it is.

## The rule, and the question nobody re-asked

Here’s the rule of thumb the whole experience boils down to:

> **Parallel headroom = free memory after weights ÷ per-agent context cost.** Small models leave a huge context pool; models that fill the box leave none. On a unified-memory box, the agent sweet spot is a **mid-size MoE** — fast per token, *and* tens of gigabytes left over as context pool.

You can also run the formula backwards, which is how I’d actually shop. Decide your fan-out first, then subtract to get your weight budget. Want five agents at 32k? That’s maybe 5–8 GB of pool — your weight budget is around 100 GB. Want ten? Ten to fifteen gigabytes of pool — the budget drops to about 95. Notice how little the budget moves: almost *any* model leaves room for a respectable fleet. The cliff is entirely at the top of the range. The last few gigabytes of weights are the expensive ones — they’re the gigabytes that cost you the fleet. (In fairness: on a small model, compute taps out before memory does — dozens of sessions “fit” long before they’re all usefully fast. The pool sets the ceiling; the silicon sets the pace.)

The deeper shift hiding under the arithmetic is that the sizing question itself changed, and most of us never re-asked it. **Chat sizing asks: do the weights plus one context fit?** Under that question, the box-filler is the correct answer — it’s the best model that satisfies the constraint, and that’s precisely the question all of us were answering when we downloaded it. **Agent sizing asks: how much context pool is left after the weights?** Different question, different answer, and the second one moves the sweet spot down-size. The trophy config isn’t dumb. It’s the right answer to the question from two years ago.

It also corrects something I wrote in the build post. I called `strix` “one user’s worth of concurrency” — meaning: not a datacenter, don’t put forty engineers on it. Still true. But *one user*, it turns out, means one user with six sessions open and a stack of sub-agents underneath them. The real ceiling was never request count. It’s KV headroom. That’s the kind of correction you only find by daily-driving your own reference design — the spreadsheet never would have coughed it up.

## Do the subtraction

So, the advice version of the thesis, for your next download: box minus weights is your agent budget. Do that subtraction *before* you look at the leaderboard. If the answer is zero, you didn’t buy an agent model — you bought a chat model, whatever the benchmarks say. And if you catch yourself lining up the screenshot of the biggest load that fits: post it, enjoy it, we’ve all been there — then load the mid-size one and get to work.

One thread I’m pulling on next: everything above assumes the six sessions share one model. What happens when they want six *different* models — or even just two? The router that makes one model feel effortless has a default behavior that quietly ruins exactly that setup, and the fix is three lines of YAML. That’s the next post.

Sizing a box for the workload you’ll actually run — rather than the one that screenshots best — is exactly the reference-design work I do at [Basswood Creative](https://basswoodcreative.com). If you’re speccing local-LLM infrastructure and want the arithmetic done before the purchase order, that’s the shop.

New here? This post is a spin-off from a longer series: [Part 1](/insights/the-128gb-box-that-replaced-my-api-key) is the build — the box, the memory, the first fully local coding session. [Part 2](/insights/my-coding-agent-lost-the-plot) is the taming — wiring a coding agent to the local server and the failure modes that showed up in daily use. This was the math that fell out of it.
