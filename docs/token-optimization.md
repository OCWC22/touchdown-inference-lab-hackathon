# Token optimization in this repo

One discipline, four surfaces. Every surface uses the same rule: a lower token count only counts if the same acceptance test still passes, and every number declares its evidence state (`measured`, `derived`, `fixture_backed`, `live`, or `unknown`).

## Map

| Surface | Where | What it proves |
| --- | --- | --- |
| Interactive lesson | [`index.html`](../index.html) + [`assets/app.js`](../assets/app.js) | Context lifetime, prefill/KV reuse, engine choice, and receipt export on one frozen task. |
| Frozen coding task | [`challenge/`](../challenge/) | Reproducible bad baseline and passing fix — the workload every optimization is measured against. |
| Agent skill | [`skills/touchdown-agent-optimizer/SKILL.md`](../skills/touchdown-agent-optimizer/SKILL.md) | The operating contract: one policy change at a time, provider-exact accounting, receipt export. |
| Take-home learning loop | [`blog/qwen36-openclaw-mlx-macbook-kv-cache.html`](../blog/qwen36-openclaw-mlx-macbook-kv-cache.html) | How to run the same KV-cache/token discipline on your own Mac with MLX, then map it to LMCache, vLLM/Mooncake, and SGLang. |

Receipts conform to [`schemas/agent-optimization-receipt.schema.json`](../schemas/agent-optimization-receipt.schema.json). Pitch surfaces live in [`pitch/slides.html`](../pitch/slides.html) and [`pitch/Touchdown-Inference-Lab-Hackathon.pptx`](../pitch/Touchdown-Inference-Lab-Hackathon.pptx).

## The numbers the demo teaches

From [`fixtures/lesson-manifest.json`](../fixtures/lesson-manifest.json) — deterministic fixture, labeled as such in the UI:

| Metric | Baseline | Optimized | Delta |
| --- | --- | --- | --- |
| Harness context | 40,176 chars | 23,210 chars | −42% |
| Repeated context | 17,420 chars | 5,180 chars | −70% |
| Memory vs full replay | ~4,210 est. tokens | ~323 est. tokens | −92% (local estimate) |

Claim boundaries:

- The −42% / −70% numbers are fixture characters on the frozen task, not provider-billed tokens. `provider_input_tokens`, `provider_output_tokens`, and `provider_cost_usd` stay `null` until measured.
- The −92% memory number is a local estimate (characters ÷ 4). EverMind's own 7–15× / up-to-90% claims are vendor claims, never presented as Touchdown measurements.

## Accounting rules (from the skill)

```text
Claude Code:  total input = input_tokens + cache_creation_input_tokens + cache_read_input_tokens
Codex:        total input = input_tokens        (cached_input_tokens is a subset, never added)
```

Keep Anthropic and OpenAI cache accounting separate. A cache read is cheaper, not free.

## How the blog post plugs in

[Set Up a Local OpenClaw or Hermes KV-Cache Learning Loop with Mac MLX](../blog/qwen36-openclaw-mlx-macbook-kv-cache.html) (mirrored from [touchdown-labs.com](https://touchdown-labs.com/blog/qwen36-openclaw-mlx-macbook-kv-cache.html)) is the take-home extension of the lab:

- The lab's stage 5 lesson (prefill → KV cache → reuse) is the same five-phase turn model the post teaches (weights → prompt assembly → prefill → decode → next-turn reuse).
- The lab's "repeated context" metric is the local, small-scale version of the post's `lookup_requested_tokens` / `lookup_hit_tokens` hit-rate discipline.
- The lab's proxy/fixture labeling matches the post's `observability_mimic: true` rule: proxy columns are teaching surfaces, never production counters.
- Students who finish the three-minute lesson run the post's 50-turn loop on their own 16GB MacBook (Gemma 4 E4B), then graduate to real LMCache MP / vLLM / SGLang counters.

Related deep dives on the live blog:

- [KV Cache Is Becoming the Memory Hierarchy of Inference](https://touchdown-labs.com/blog/kv-cache-memory-hierarchy-inference.html)
- [TokenSpeed, Blackwell, and Vera Rubin: The Runtime Boundary Is Moving](https://touchdown-labs.com/blog/runtime-boundary-tokenspeed-blackwell-vera-rubin.html)
- [Computex 2026: Seeing the Physical Layer of the AI Factory](https://touchdown-labs.com/blog/ai-factories-repeated-inference-memory-hierarchy.html)

## The loop, end to end

1. Freeze the task and acceptance test (`challenge/`).
2. Run once; record provider usage exactly (skill contract).
3. Classify context: stable, active, durable, externalized, dead.
4. Change one policy; re-run same task, same revision.
5. Tests pass or the "optimization" doesn't count.
6. Export the receipt (`schemas/`); persist through Butterbase when live.
7. Take it home: reproduce the pressure curve on your own hardware (`blog/`).
