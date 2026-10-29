---
title: We have neocloud at home
description: How to build long-running agent infrastructure from off the shelf parts at a fraction of the price.
date: 2026-10-27
pillar: AI & Agent-Assisted Development
substackUrl: https://protocolgrade.substack.com/p/we-have-neocloud-at-home
substackId: 222342648
---
> Moving long coding-agent sessions off a laptop and onto a neocloud-like server that stays up. Assembled from parts anyone can go and get.

*I run [Basswood Creative](https://basswoodcreative.com), an agentic-engineering practice for software teams: the harness, the workflows and the infrastructure underneath, including local builds like this one. If your team is weighing local against the API bill, [start with a free check-up](https://basswoodcreative.com/diagnostic).*

![Neocloud at home meme](/insights/we-have-neocloud-at-home/neocloud-at-home-meme.jpg)

Running long work sessions with agents used to mean keeping your machine awake. Companies have mostly stopped doing that themselves: they rent always-on hardware instead, and there is an industry now of nothing but that: massive datacenters rented by the hour. But the pitch isn't the hardware, it's that the work keeps going after you leave.

And that part doesn't need the datacenter, you can have it at home.

One server, one container and a dedicated machine beside it with your agents at the ready. What to run on that hardware is a separate trap, and I fell into it first: [Your biggest model is your worst agent](/insights/your-biggest-model-is-your-worst-agent).

My coding agents kept dying when I shut my laptop: ten minutes into reading a codebase, the lid closes, the process goes with the ten minutes. They weren't crashing, I was handing long work to hardware whose design brief is to be asleep by the time I stand up.

So the work moved to the machine that never sleeps, and the phone became as good a place to work as the laptop.

## A laptop is a bad place to leave work running

Agents are the first software most of us run that expects to outlive our attention, and the first we have tried to run on hardware designed to be carried.

Two symptoms, one cause. The session dies with the lid. And there was no way to pick the work up somewhere else — not mid-task, not without restarting the agent and losing its place.

"Disable sleep, leave it plugged in" is not an answer. That isn't infrastructure. Laptops run updates on their own schedule, sleep at low battery, run hot, and go away for a weekend. Nobody wants an agent committing changes unattended on the machine used for everything else.

A killed session isn't an inconvenience; it's tokens spent with nothing to show.

## Moving the session off the laptop

The work lives on the always-on box now, in a terminal that stays up whether or not anyone is looking at it. That's what [herdr](https://herdr.dev) does: the difference between a session that survives a disconnect and one that doesn't. [Paseo](https://paseo.sh) is the daemon another device attaches to mid-session — open to read and fork, and I maintain my own build customized to work with herdr. [Pi](https://github.com/earendil-works/pi) is the agent doing the work, open source, its sessions plain files on disk, which is what makes a session something you can move.

So I start the work at the desk, close the laptop, and carry on with it from the phone with the agent mid-sentence. Nothing restarts. Work picked up there is continued there, and what reaches me is the decision that's waiting.

A hundred and sixteen commits in sixteen days, most of them authored by the box itself. Dozens of sessions spanning days non-stop. When the container holding them was rebuilt, they came back up and carried on.

The session, not the device, is the unit of work.

## Counting sessions instead of tokens

A tool call that fails the same way twenty-five times is twenty-five payments into a wall.

That one is measured, and the same machine was hiding a bigger case: a compaction step that failed a hundred and eleven times over six days — eight and a half GPU-hours of work that produced nothing. Invisible by construction: a rejected summary writes no session record.

The lesson isn't about the model or the harness. Spend that isn't read against outcomes can't tell an agent thinking hard from an agent stuck, and from an invoice the two look identical.

So count sessions: how many finished, how many needed a person, how many had to be started again. Those three describe work in a way no price list does, and they are the only numbers that improve by spending more tokens rather than fewer.

Roughly forty tokens a second, out of a machine standing in a house: not fast, and fast enough that speed stopped being the argument. The hard reasoning goes somewhere else. The volume goes where the capacity is already bought, and where checking the work costs nothing that wasn't spent anyway.

Price-per-token is procurement's metric. Value-per-token is engineering's, and it's the only one you control.

## What we don't have at home

A neocloud provider by design owns the space where your agent sessions work. But you don't need to bring that feature home. What replaces it is the part engineers use every day: nobody can switch the work off, re-price it, or change the terms while it runs.

Anything another party can retire or reinterpret on a Tuesday is a dependency wearing the costume of infrastructure. Nothing here is that. What transfers is the decision underneath: the work goes on a machine that never sleeps.

I design and build these for organisations that want agents to work under their own roof.

Everything runs in somebody's home, why not yours?

**Assembled from** [Pi](https://github.com/earendil-works/pi), [herdr](https://herdr.dev) and [Paseo](https://paseo.sh), [llama.cpp](https://github.com/ggml-org/llama.cpp) for the models, [Tailscale](https://tailscale.com) for the private network, [Forgejo](https://forgejo.org) for the git.
