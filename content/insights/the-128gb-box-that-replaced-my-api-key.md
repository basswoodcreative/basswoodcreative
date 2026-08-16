---
title: The 128 GB box that replaced my API key
description: A Bosgame M5 with 128 GB of unified memory, turned into a headless Fedora server that runs 70B–120B-class models and drives a fully local, open-source coding agent — every decision, every gotcha.
date: 2026-08-16
pillar: AI & Agent-Assisted Development
---

*I run [basswood creative](https://basswoodcreative.com), a consulting practice for local AI infrastructure — builds exactly like this one. If your team is weighing local against the API bill, that's the conversation the practice exists for.*

## 1. The box in the next room

<!-- IMG-1 · the box on the shelf -->

There's a box in the room next to my office. No monitor, no keyboard, maybe ten watts at idle. It answers to `strix`. It runs a 120B-class model.

It also codes — and because **Qwen 3.8** landed this week, the model that's been in everyone's group chat for the last few days, that's exactly what it's been doing.

This is the story of how that box got built, from a retail mini PC to a fully local, fully open-source coding agent. It's the first post of this blog. Local AI infrastructure is the focus of my consulting practice, **[basswood creative](https://basswoodcreative.com)**, and this is my own reference build — documented the way I'd hand it over on a client project. Including the mistakes.

Why local at all? Four reasons, in the order they usually come up:

- **Your code never leaves the house.** For some teams, that's the entire argument.
- **No per-token bill, no rate limits, no vendor outage.** The box keeps working when the internet doesn't.
- **The model is yours to configure** — context, thinking, sampling. You don't wait for the provider to ship a knob.
- **The hardware finally runs models worth using.** This is the new one, and it's why the post exists now.

Which hardware, and why? The trick is one phrase: **unified memory**. The Bosgame M5 pairs AMD's Ryzen AI Max+ 395 — "Strix Halo" — with 128 GB of LPDDR5X that the iGPU can address directly. After the tuning trick I'll show you in section 6, the GPU can use nearly the whole thing. That's what lets a 15-watt-class integrated GPU hold 70B–120B-class models and still move tokens at interactive speed.

And the "fully open source" claim, stated up front so the finale can pay it off: Fedora Server, Podman, llama.cpp, llama-swap, Open WebUI, Tailscale, Qwen, and Pi. Every layer auditable. And one method runs through every section: **build in layers, and verify each one before you climb.**

Roughly half a day of hands-on work, plus download time. Let's go.

## 2. The hardware, in one page

| | |
|---|---|
| Machine | Bosgame M5, small form factor |
| CPU | Ryzen AI Max+ 395 ("Strix Halo") |
| GPU | Radeon 8060S iGPU (gfx1151), shares system memory |
| Memory | 128 GB LPDDR5X unified (a 96 GB variant exists — different tuning numbers, same shape) |
| Storage | NVMe |
| Price, as purchased | $2,799 USD |

Three things to know before we start.

**What fits.** The community's sweet-spot quantization is `Q4_K_M`, and the budget that matters isn't just the model file: **weights *and* context both count** against the ~124 GiB. The practical ceiling I work under is ~110 GB of combined weights-plus-context, with headroom for the OS. We'll do the arithmetic properly in section 10.

**Model shape matters more than the headline number.** The big MoE models — `gpt-oss-120b`, `GLM-4.5-Air`, Qwen's 235B — are this hardware's best use. Huge *total* parameters, small *active* set per token, so a 15-watt iGPU can still generate fast. Total parameters set the memory bill; active parameters set the speed.

**What it can't do.** This is not a datacenter. It's an interactive machine: one user's worth of concurrency, not batch serving. If you need forty engineers hitting one model in parallel, this box is the wrong answer — and that's a perfectly good, normal conclusion to reach.

A line on the purchase, because Substack readers deserve the disclosure: **$2,799, my own money — not gifted, not sponsored, not billed to anyone.** The consultant's own kit. The story: I hunted for the best price on the 128 GB version for a while, and prices have been climbing fast in this market, so I pulled the trigger the day I saw a number I liked. TCO line: the box idles around 10 W, against the API bill it displaces. Run that comparison against your own workload and the math does the rest.

## 3. The plan — and the method

The target state, with the map in hand:

```
laptop / iPhone ──(Tailscale)──▶ strix (Fedora Server, headless)
                                     │
                                     ├─ podman: llama-swap (llama.cpp) ──▶ :8080  OpenAI /v1
                                     │        (auto load/unload models, TTL)
                                     ├─ podman: Open WebUI ──▶ :3000  (chat UI)
                                     └─ systemd --user: survives reboots
  Pi (coding agent, on any laptop) ──▶ http://strix:8080/v1   ← the finale
```

The method: **build in layers, and verify each layer before you move on.** Every layer below closes the same way — a **✅ Verify** block, same format every time: the commands to run and what they should show. If a layer doesn't verify, you don't move up — you fix the layer. It sounds obvious, but in practice it's the difference between a half-day build and a weekend headache.

| Phase | Rough time | Walk-away state |
|---|---|---|
| Prep: ISO, USB stick, SSH key | ~45 min | Bootable stick, fresh keypair |
| BIOS + install (the one monitor session) | ~1 hr | Fedora Server up, SSH works from the LAN |
| Remote-access baseline | ~45 min | Keys-only SSH, Tailscale, box moved to its room |
| GPU memory tuning | ~30 min | 124 GiB for the iGPU, verified |
| Toolboxes + first models | ~1 hr (+ downloads) | First tokens |
| Quadlets + web UI | ~1 hr | Reboot-proof: UI and API up with zero manual steps |

That's the half day. Downloads are the part you walk away from.

## 4. Foundation: prep, BIOS, and the one monitor session

The boring act — compressed, but it carries the two BIOS settings worth calling out.

**Prep, on the laptop:** the Fedora Server ISO (any current release ships a new-enough kernel), a USB stick, and the thing people skip — **generate a fresh SSH keypair first**, not the key already on every laptop you own. A server key should be a server key.

**The one "at the box" session:** this build needs a monitor exactly once, for the install. Say it up front so it's not a surprise; we pay it off at the reboot test in section 8.

**BIOS — the part that actually matters:**

- **UMA frame buffer: keep it LOW (512 MB).** Surprising for a GPU box, I know. Linux allocates GPU memory dynamically, so a big fixed carve-out just wastes RAM. The real memory win comes from kernel arguments two sections from now — the low setting is what makes room for it.
- **Restore on AC power loss → Power On.** The most important headless-box setting: after a power blip, the box boots itself in a room you're not in.
- **Additional settings to flip** IOMMU off (measurable memory-bandwidth gain on this chip), Wake-on-LAN on, Secure Boot as-is, then the one-time boot menu (F7) to start the USB.

**Why Fedora *Server* specifically:** a headless appliance — no display manager, Cockpit built in, small and stable, systemd-native, firewall defaults that open only what you ask for. A server that happens to chat.

**Install highlights:** hostname `strix`; automatic partitioning (Server deliberately leaves a small ~15 GiB root — we grow it next, don't fight the installer); your user in `wheel`, root left locked; Wi-Fi straight in the installer (it works out of the box — and if the new Wi-Fi 7 card ever gets missed, the emergency path is a USB-tethered phone plus `dnf upgrade`).

> **✅ Verify:** SSH works from the laptop — before you walk away from the monitor.
>
> ```bash
> ip -4 addr                  # on the box: LAN IP present
> sudo systemctl status sshd  # running
> ssh user@strix              # from the laptop: actually logs in
> ```
>
> That last line is the difference between finishing setup from the couch and coming back with the monitor.

<!-- IMG-2 · the first SSH shell from the laptop -->

## 5. Rules of the road

The rule for this section, stated plainly: **after it, a monitor is never needed again.** Six pieces, in order.

1. **Full update first.** `sudo dnf upgrade --refresh` — this platform needs a kernel ≥ 6.18.4, and the tuning section depends on it. Reboot, confirm with `uname -r`.
2. **Grow the root volume.** Server's LVM left most of the NVMe unallocated: `sudo lvextend -r -l +100%FREE /dev/fedora/root`. Models are huge; let the disk know.
3. **A stable address.** DHCP reservations on the router for *both* MACs — Ethernet and Wi-Fi differ, and `ip link` tells you which is which. Bonus: a static host mapping so `strix` resolves by name LAN-wide, no `/etc/hosts` files anywhere.
4. **SSH keys only.** `ssh-copy-id`, then *verify key login in a second session before you lock the door* — drop `PasswordAuthentication no` into an sshd drop-in and reload. Order matters; the lockout story is a genre.
5. **Cockpit** on `:9090` — the browser console as your safety net. If SSH ever misbehaves, the web terminal still works.
6. **Tailscale** — now `strix` becomes reachable by the same name from anywhere, private, zero router ports. This is the step that makes "home server" stop meaning "only usable at home."

> **✅ Verify:** the payoff demo. `poweroff`, move the box to its permanent room, connect Ethernet and power, power on — then `ssh user@strix` from the laptop, no monitor anywhere. (Optional Wake-on-LAN test: if the box can't wake from full shutdown, don't fight it — around 10 W idle makes always-on a defensible default.)

**Milestone:** the machine is now a headless appliance. Everything from here is pure SSH.

## 6. The memory magic: giving the iGPU 124 GiB

By default, the kernel lets the iGPU use only **half** of RAM via the GTT (the GPU's page table). On 128 GB, that caps you at ~64 GiB — fine for small models, fatal for 120B. The fix is three boot arguments:

```bash
sudo grubby --update-kernel=ALL \
  --args="amd_iommu=off amdgpu.gttsize=126976 ttm.pages_limit=32505856"
sudo reboot
```

- `amd_iommu=off` — community-tested: measurably better memory bandwidth on Strix Halo.
- `amdgpu.gttsize=126976` + `ttm.pages_limit=32505856` — the GTT and pinned-page caps, together = **124 GiB** GPU-addressable, leaving ~4 GiB for the OS. (96 GB variant: the 92 GiB pair of numbers.)

That's also the payoff for the BIOS foreshadow: the UMA carve-out stayed at 512 MB. *This* is where the memory actually comes from.

One honest trade-off: with IOMMU off, the NPU driver (`amdxdna`) won't load — you'll see probe errors in the boot log. Fine. llama.cpp has no NPU backend; bandwidth beats NPU. If you want the NPU someday, re-enable IOMMU and accept the ~6–7 % bandwidth cost.

One more tuning line: cap zram swap at 8 GiB. Fedora's compressed-RAM swap is lovely in normal life, but when a model *barely* fits, weights pushed into zram make everything crawl.

The check below will put you in the boot log, so learn to tell **expected noise** (TDX messages, `amdxdna` probe errors, EDID complaints on a headless box — all harmless, all confirmed) from what would actually matter: amdgpu ring timeouts, GPU resets, firmware-load failures. One line for the stakes: **this is the phase that makes 70B–120B models possible.**

> **✅ Verify:** the iGPU can now address 124 GiB — this is the section's aha.
>
> ```bash
> cat /proc/cmdline                            # all three args present
> sudo dmesg | grep -i gtt                     # amdgpu GTT ≈ 126976M
> cat /sys/class/drm/card*/device/mem_info_gtt_total
> # ≈ 133,143,986,176 bytes = 124 GiB
> ```

<!-- IMG-3 · nvtop showing 124 GiB -->

## 7. Inference: toolboxes and first tokens

The inference stack lives in containers — the host stays clean, and backends are reproducible. The specific shape: podman **toolboxes**, persistent containers you can `enter` and work inside.

The images come from [kyuz0/amd-strix-halo-toolboxes](https://github.com/kyuz0/amd-strix-halo-toolboxes) — prebuilt llama.cpp tuned per backend (Vulkan/RADV as the all-rounder, ROCm variants for long context). House rule, and I can't stress it enough: **read the repo README at each step.** Tags shift as llama.cpp and ROCm evolve; this post shows the *shape*, and the README is the source of truth for current tag names.

```bash
toolbox create llama-vulkan --image docker.io/kyuz0/amd-strix-halo-toolboxes:vulkan-radv
toolbox enter llama-vulkan
vulkaninfo --summary | grep -i deviceName   # expect Radeon 8060S / gfx1151
```

That last line confirms the GPU is visible from inside the toolbox before anything gets downloaded.

**Model discipline: two models, two jobs.** Don't start with the biggest download you can find.

- **Validator:** Qwen3-30B-A3B, `Q4_K_M`, ~18 GB. Small and fast; proves the whole pipeline end to end before you spend hours on a large download.
- **Flagship:** `gpt-oss-120b`, ~63 GB. The Strix Halo's sweet spot — big MoE, small active set.

One-time `hf auth login` with a free Hugging Face token: it silences the warning, avoids throttling, and unlocks gated models.

```bash
hf download unsloth/Qwen3-30B-A3B-GGUF Qwen3-30B-A3B-Q4_K_M.gguf --local-dir ~/models
```

The first chat, inside the toolbox:

```bash
llama-cli -m ~/models/Qwen3-30B-A3B-Q4_K_M.gguf -ngl 999 -c 16384
```

Tokens are streaming. 🎉

Then across the network — this is the shape everything else builds on:

```bash
llama-server -m ~/models/Qwen3-30B-A3B-Q4_K_M.gguf -ngl 999 -c 32768 \
  --host 0.0.0.0 --port 8080
sudo firewall-cmd --permanent --add-port=8080/tcp && sudo firewall-cmd --reload
```

> **✅ Verify:** open `http://strix:8080` in the laptop browser and have a chat from the couch. That's the whole pipeline proven: a file in, an OpenAI-compatible API out.

## 8. Persistence: quadlets and the web UI

Everything so far dies when the terminal does. A server should reboot itself. Two enablers: `loginctl enable-linger $USER` (your user's services run without a login session) and **podman quadlets** — containers declared as systemd units, in `~/.config/containers/systemd/`.

The llama-server quadlet, interesting lines only:

```ini
[Container]
Image=docker.io/kyuz0/amd-strix-halo-toolboxes:vulkan-radv
AddDevice=/dev/dri
Volume=%h/models:/models:z
PublishPort=8080:8080
Exec=llama-server -m /models/Qwen3-30B-A3B-Q4_K_M.gguf --alias qwen3-30b -ngl 999 -c 32768 --host 0.0.0.0 --port 8080

[Service]
Restart=always
TimeoutStartSec=600
```

`--alias` gives the model a clean API name (the default is the file path); `TimeoutStartSec=600` because big models take a while to mmap.

Now the gotcha worth a paragraph, because it cost me real time: `curl localhost:8080` returned "Connection reset by peer" while the journal cheerfully said *listening*. The reason: `localhost` tries IPv6 first, and podman's pasta forwarder resets that connection — the server inside listens on IPv4 only. **Always `127.0.0.1`.** File it under "errors that look like the server is broken but aren't."

(One honest alternative, in one line: native Ollama is one command and "good enough" — you trade some performance and control, and both can coexist on different ports. I chose the tuned llama.cpp path because the tuning is where this box earns its keep.)

The Open WebUI quadlet is the same idea: it points at the API via `host.containers.internal`, publishes `:3000`, and keeps its chats in a named volume. One flag to remember: `WEBUI_AUTH=False` is fine on a trusted home LAN; set it `True` before anything the world can see.

> **✅ Verify:** the reboot test — the milestone.
>
> ```bash
> sudo reboot
> ```
>
> Two minutes, zero manual steps: the web UI is up, tokens are flowing, Cockpit is alive. The keyboard in the drawer is now for emergencies only.

<!-- IMG-4 · Open WebUI chat -->

## 9. Day-to-day: the model library and `hf-add`

llama-server loads one model at a time. Once the library grows past two or three, the answer is [llama-swap](https://github.com/mostlygeek/llama-swap): a small OpenAI-compatible proxy that **auto-loads and unloads models based on the name in the request**, with a per-model TTL. It replaces the llama-server quadlet (same port — Open WebUI doesn't notice) and it gives you `http://strix:8080/ui`, a dashboard for model swapping *without SSH*.

The config pattern:

```yaml
macros:
  default_args: "-ngl 999 --host 0.0.0.0 --port ${PORT}"

models:
  gpt-oss-120b:
    cmd: llama-server -m /models/gpt-oss-120b/gpt-oss-120b-mxfp4-00001-of-00003.gguf -c 32768 ${default_args}
    ttl: 0        # the daily driver stays resident
  qwen3-30b:
    cmd: llama-server -m /models/Qwen3-30B-A3B-Q4_K_M.gguf -c 32768 ${default_args}
    ttl: 600      # unload 10 min after last use
```

`${PORT}` is mandatory — llama-swap assigns each model's internal port itself. And the first-swap experience is worth knowing before it surprises you: the first reply after a swap takes the model's load time (around 30 seconds for the 120B), then normal speed.

**Adding a model in one line** — this is where the day-to-day gets good:

```bash
hf-add unsloth/GLM-4.5-Air-GGUF -q Q4_K_M --ttl 0 --label "GLM 4.5 Air"
```

`hf-add` is a small script — one `scp` and `chmod +x` to install — that automates the four manual steps: find the right `.gguf` (single files, `-00001-of-0000N` shards, and quant subfolders all handled), check disk space and download, append the config stanza **with a backup, YAML validation, and rollback on failure**, then restart llama-swap and poll `/v1/models` until the model is live — dumping the journal tail if it isn't. `--dry-run` for peeking. It's the difference between a workflow and a chore.

The sizing rules of thumb, again, because they govern everything: `Q4_K_M` is the sweet spot; weights **and context** both count; ~110 GB practical ceiling; big MoE models are this hardware's best use.

And the manual flow, in one short paragraph, for when the script can't help — and so you know what it's doing: pick a repo on Hugging Face (unsloth / bartowski / ggml-org), `hf download` into `~/models`, copy a stanza into `~/llama-swap/config.yaml` (paths start with `/models/…`, the container mount; multi-part models point `-m` at the first shard), `systemctl --user restart llama-swap`, and check that the new model appears.

> **✅ Verify:** the library is being served and the swap works.
>
> ```bash
> curl http://127.0.0.1:8080/v1/models   # every configured model listed
> ```
>
> Then open `http://strix:8080/ui` and load a model from the dashboard — no SSH involved.

## 10. Qwen 3.8: let's pick a model together

Qwen 3.8 has been the story in local-LLM circles for the past week. The question under every thread is the same: *can my box actually run it, well?*

Let's work through the answer together — the way I wish someone had worked through it with me, and the way I'd whiteboard it in a consulting conversation. Because the honest answer is "it depends on four things you probably don't know yet," and once you know them, you can make the call for any model that ships, not just this one.

**First, what you're actually downloading.** The file format is **GGUF** — llama.cpp's native container. One file, or a set of numbered shards, holds everything the runtime needs: weights, tokenizer, vocabulary, architecture metadata. "Running a model" reduces to "pointing llama.cpp at a file." On Hugging Face, GGUF uploads for any given model typically come from a handful of well-known repos — `unsloth`, `bartowski`, `ggml-org` — and each puts the same model on a shelf of quantizations. The model page's Files tab shows the exact filenames; note whether you're looking at one `.gguf` or a `-00001-of-0000N` set. Both work — llama.cpp loads the shards automatically.

**Second, quantization — the recipe, not a number.** Every weight in a model is a floating-point number, and the original training format is enormous. Quantization stores those numbers with fewer bits and teaches the model to cope. The trade is quality per gigabyte: 8-bit is nearly lossless, 4-bit is the community's working compromise, and below that you start to feel it.

Here's the part nobody explains well. The "K" in `Q4_K_M` is not marketing. K-quants aren't a flat 4 bits everywhere — they're a **mixed-precision recipe**: a super-block scheme that gives sensitive tensors more bits and expendable ones fewer. The suffix is the recipe's strength, and `_M` is the one the community converged on as the sweet spot: visibly better than the lighter recipe at a size that still fits. Unsloth's "dynamic" quants push the same idea further, choosing the mix per tensor. When someone tells you "just use Q4_K_M," that's the whole recommendation — a recipe, not a number.

**Third, model types: dense vs MoE.** Dense models run every parameter on every token — quality per parameter, but the full compute bill per token. Mixture-of-Experts models have a huge *total* parameter count but activate only a small slice per token; a router picks the relevant experts. So a 120B MoE can *load* in your memory budget while *generating* at the speed of a much smaller dense model. That asymmetry — huge memory, modest compute — is exactly what a 15-watt iGPU with 128 GB of unified memory is. It's why this box's best models are all MoE, and why "total parameters" is the wrong number to brag about. **Active parameters set the speed; total parameters set the memory bill.**

**Fourth, the budget inequality.** Two things eat your 124 GiB: the weights, and the context. The KV cache — what the model remembers about the conversation — grows with context length, so a model that fits at 8k context might not at 32k. The rule I work under: **weights plus a realistic context, under ~110 GB, with headroom.** That's the whole sizing problem. Every model decision on this box is that one inequality.

**The server recipe — the parameters that matter.** Once the file is chosen, running it is a short list of flags, and most of them you'll never change:

- `-ngl 999` — offload every layer to the GPU. On unified memory this is almost a formality — it's all the same RAM — but it still decides *where the compute happens*, which is what you want on the iGPU.
- `-c 32768` — context length. The dial that trades memory for capability; coding agents eat context, so we give it room.
- `--host 0.0.0.0 --port 8080` — serve it, OpenAI-compatible, on the network.
- `--alias <name>` — the name tools and dropdowns see. Without it, they see a file path.

That's the whole server recipe. Everything in llama-swap's config from section 9 is this list repeated per model — which is why `hf-add` can be just the recipe, parameterized.

**Now the decision, in the open.** The library already has two chairs: `gpt-oss-120b` as the resident flagship, and Qwen3-30B as the validator. Qwen 3.8 is going to be the coding agent's daily driver — which means it gets the good chair: `ttl: 0`, always resident.

So we open the Files tab and run the inequality. The pick: [`unsloth/Qwen3.8-27B-GGUF`](https://huggingface.co/unsloth/Qwen3.8-27B-GGUF), the `UD-Q4_K_XL` file — one of those Unsloth dynamic quants from two paragraphs ago — at 18 GB. The numbers clear the budget easily: 18 GB of weights at `UD-Q4_K_XL` leaves room for a serious context at `-c 32768`, which is exactly the profile a coding agent wants — long files, long tool transcripts, plenty of headroom. (Had the top model's numbers failed the inequality, the next question would have been "which smaller sibling clears it," and the same arithmetic applies. That's the whole decision procedure — recipe, shape, inequality — and it works for whatever drops next week.)

The one line that does all of it:

```bash
hf-add unsloth/Qwen3.8-27B-GGUF -q UD-Q4_K_XL --name qwen3.8 \
  --ctx 32768 --ttl 0 --label "Qwen 3.8"
```

> **✅ Verify:** `curl http://127.0.0.1:8080/v1/models` lists `qwen3.8`, and it appears in Open WebUI's model dropdown.

## 11. The harness: pointing Pi at the box

A model server is only half of a coding agent. The other half is the **harness** — the program that turns a chat endpoint into something that reads files, runs commands, and edits code. Here that's [Pi](https://github.com/earendil-works/pi), the open-source terminal coding agent, and it's the layer that pays off the "fully open source" claim from section 1: with Pi on top, every piece of the stack — OS, runtime, model, agent — is code you can read.

Why Pi specifically? Two properties do the work. It's a terminal agent, so it runs on whatever laptop you're on and needs nothing installed on `strix` itself. And it speaks any OpenAI-compatible API — which, after sections 8 and 9, the box already is. No plugin, no adapter: the integration is one JSON file, a custom provider in `~/.pi/agent/models.json`:

```json
{ "providers": { "strix": {
  "baseUrl": "http://strix:8080/v1",
  "api": "openai-completions",
  "apiKey": "strix",
  "compat": { "supportsDeveloperRole": false, "supportsReasoningEffort": false,
              "thinkingFormat": "qwen-chat-template" },
  "models": [ { "id": "qwen3.8", "reasoning": true,
                "contextWindow": 32768, "maxTokens": 8192 } ]
} } }
```

Every line in that file is a decision, so let's take them in order.

**`baseUrl` uses the Tailscale name.** Not the LAN IP, not `localhost` through a tunnel — the name `strix` that section 5 made resolvable from anywhere. That one choice means this config is portable: the same file works from the desk, the couch, or a coffee shop, and there's nothing to edit when you leave the house.

**`api: "openai-completions"`.** llama.cpp's server speaks the classic chat-completions dialect, not the newer responses-style APIs, so the provider says so explicitly. Getting this wrong doesn't fail loudly — it fails weirdly, which is the worst kind.

**The dummy `apiKey`.** llama-swap ignores auth entirely — but Pi won't list a model in `/model` until *some* auth is configured for the provider. Any value works; that's why it says `"strix"`. (It's also a quiet reminder of section 12's rule: this endpoint has no real auth, so it never gets a public name.)

**The `compat` flags.** Cloud providers have accumulated API features that llama.cpp's OpenAI shim doesn't implement: the `developer` role and `reasoning_effort` are the two that bite. Set both to `false` and Pi degrades gracefully — plain `system` messages, no effort parameter — which is exactly what the box expects. This is the general shape of local-agent debugging: the harness assumes cloud, the shim is a subset, and `compat` is where you reconcile them.

**The thinking knob.** For local Qwen servers, `thinkingFormat: "qwen-chat-template"` is the documented control: it sends `chat_template_kwargs.enable_thinking` and `preserve_thinking`, so Pi can switch Qwen's thinking on and off per model. This is the knob that makes the agent *use* the model's reasoning instead of guessing.

**The model entry's numbers.** `contextWindow: 32768` isn't aspirational — it must match the server's `-c` from the llama-swap config, because Pi uses it to decide when to compact the conversation. Claim more than the server has and the session dies mid-task with a context overflow. `maxTokens: 8192` caps a single reply, so one long generation can't eat the window that the *next* tool call needs. And `reasoning: true` tells Pi to expect and display thinking blocks rather than dumping them into the transcript.

Two quality-of-life notes. `models.json` hot-reloads every time you open `/model` — no restart, so you can iterate on these settings freely mid-session. And a footnote for the pure-llama.cpp crowd: if you skip llama-swap and run llama.cpp's own router — `llama-server` with no `--model` — Pi has first-class support for that too: `/login llama.cpp`, `LLAMA_BASE_URL`, and `/llama` to load and unload models. Our swap layer sits on top, so the custom provider in `models.json` is the fitting path here.

> **✅ Verify:** select `qwen3.8` with `/model`, start `pi`, and give it a real task. The first fully local coding session runs: every prompt, every tool call, every generated token, on the box in the next room.

<!-- IMG-5 · Pi in the terminal with the local Qwen in the footer -->

**What it's actually like** — honest expectations, because they build trust:

- **Where local wins:** your code never leaves the house; no per-token bill, no rate limit, no outage; and the model is *yours* to configure — context, thinking, sampling, all of it.
- **Where the frontier cloud still wins:** peak quality on the hardest tasks, very long contexts, raw speed. I haven't pretended otherwise anywhere in this post.
- **The thesis:** for a large share of daily coding work, a local box like this is now good enough to be the *default* — and the frontier model stays available for the days it isn't.

## 12. Keeping it alive

This is a young platform, and the gfx1151 stack has shipped regressions — an overnight linux-firmware release breaking ROCm is a common tale in the community threads. The hygiene that keeps it boring:

- **Skim the kyuz0 README and issues before kernel/firmware bumps.** It takes two minutes; the alternative takes an evening.
- **Fedora keeps the three latest kernels** — when a new one misbehaves, the GRUB menu (or Cockpit's terminal, which works even when GPU stuff is broken) gets you back on the previous one.
- **`dnf-automatic` for security-only updates; everything else manual.**
- **Never auto-update the inference container.** Open WebUI can — it rolls back on failure. The inference image is where the surprises live, and it gets pulled by hand, with the README open.

The debugging toolkit, for when something is wrong: `journalctl --user -u llama-swap` (or whatever unit), `hf-add`'s automatic journal dump on failure, `curl http://127.0.0.1:8080/v1/models` for "what's actually being served," `nvtop` for "is the GPU actually working," Cockpit's logs and graphs for the rest — and the whole `127.0.0.1`-vs-`localhost` class of errors, now that you know it exists.

**Access from outside the LAN, à la carte.** The default is Tailscale: install it on the iPhone, `http://strix:3000` loads, add it to the Home Screen, and you have a PWA with nothing exposed and auth still optional. The advanced option — a public domain via a Cloudflare tunnel — has three non-negotiables: lock down Open WebUI with `WEBUI_AUTH=True` *first*, never give `:8080` a public name (it has no auth at all), and put email-OTP in front with Cloudflare Access. Bonus: HTTPS also fixes iOS voice input on the PWA.

**Backups** are almost a non-event, and that's the appliance insight: the box holds nothing precious except configuration. The quadlet files, the sshd drop-in, and a post like this one are a full disaster-recovery runbook. Models are re-downloadable — that's the point of a Hugging Face-based flow. If the chat history matters, export the `open-webui-data` volume; otherwise, don't.

And the ideas backlog, one line each, foreshadowing the next posts: vLLM for concurrent serving · Whisper for speech-to-text · ComfyUI/Flux for image generation · an MCP server that exposes the model library to other machines.

## 13. What this box is

A Windows mini PC became a headless Fedora appliance. Half the RAM became 124 GiB for an integrated GPU. A toolbox became a model library with a one-line add command. And a 120B-class model became a coding agent that runs, end to end, inside the house. Each layer earned its place; each layer was verified before the next one climbed on it.

The bigger point: local LLMs crossed from "hobby" to "infrastructure." A unified-memory box like this is a **repeatable reference design** — same shape, different size — and this post is the blueprint.

Which is, in the end, the consulting pitch. This build is exactly the kind of work **basswood creative** exists to do for teams that are tired of guessing — the workload audit, the hardware selection, the build, and the handover with runbooks. If your team is weighing local against API — or local *and* API — the first conversation is cheap, and the answer is usually specific. Start at [basswoodcreative.com](https://basswoodcreative.com).

If this was useful, subscribe — the next post picks up where this one stops: the tracing and metrics stack that lives on the same box, a long-context A/B, or the honest "what I'd do differently."