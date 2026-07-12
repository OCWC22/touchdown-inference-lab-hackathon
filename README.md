# Touchdown Inference Lab

Your first assignment is to make the coding agent you already use cheaper, faster, and easier to understand. Then follow the same request through engine choice, routing, prefill, KV cache, HBM, and verification.

## Product principle

We believe people learn fastest by working on real, bounded problems from real companies, research labs, and open-source projects — with clear feedback, real tools, honest evidence, and a path to contribution and paid work. This is not only an education surface. It's the first vertical slice of a learning, research, contribution, and talent-development system: **learn → experiment → prove → contribute → get reviewed → get hired.**

- [docs/product-redesign.md](docs/product-redesign.md) — the full system design: challenge marketplace and template, contribution discipline, research tracks, honest experience labels, evidence-based skill graph, the L1–L9 difficulty ladder, hiring/paid-work ethics.
- [journey.html](journey.html) — the learner-to-contributor journey end to end, with the incentive-alignment thesis (academia has talent, industry has funding and real problems, this system aligns them). Every step labeled `live`, `fixture-backed`, or `proposed` — nothing here inflates a guided exercise into production experience.
- [challenge/CHALLENGE.md](challenge/CHALLENGE.md) — the frozen retry task rewritten as the first marketplace-format challenge entry.
- [schemas/portfolio-receipt.schema.json](schemas/portfolio-receipt.schema.json) + [fixtures/portfolio-receipt.example.json](fixtures/portfolio-receipt.example.json) — the verification receipt every portfolio item carries.

This repo does not modify or publish the held HBM manuscript; the datacenter/GPU schematics in `lab.html` adapt that draft's visual vocabulary only, with original captions.

## Run

```bash
npm test
npm run verify
npm run dev
```

Open `http://127.0.0.1:4173`.

## What works now

- A nine-stage, three-minute interactive lesson (`index.html`) built around one continuous loop: learn → observe → experiment → verify → explain → contribute → receive review → improve → build credibility → access opportunity.
- A frozen retry-state coding task (`challenge/`) with a reproducible bad baseline and passing fix, plus `challenge/CHALLENGE.md` written in the full marketplace-challenge template.
- A context-lifetime optimization control surface: −42% harness context, −70% repeated context on the same passing acceptance test.
- An engine decision that changes from MLX-LM locally to vLLM on Nebius under production constraints.
- Butterbase, EverOS, and Nebius browser adapters with server-side proxy contracts.
- Offline Butterbase receipt queue.
- EverOS misconception recall that changes the next lesson.
- Nebius Token Factory or OpenAI-compatible vLLM proxy path.
- Receipt download, schema, secret scan, and deterministic fixtures.
- A continuous lab view in the Touchdown Labs learning-engine style: `lab.html` — sticky left engine (rail, thirteen joined phases, perspective lens, per-scene receipt state, evidence marks) synchronized to a scrolling article of the same frozen task, including datacenter GPU/HBM package and facility-power schematics.
- The learner-to-contributor journey demo: `journey.html` — fifteen-step story, the L1–L9 challenge ladder, a rendered portfolio receipt, and a KV-cache skill gate.
- A take-home learning path: the Touchdown Labs Mac MLX KV-cache post mirrored at `blog/qwen36-openclaw-mlx-macbook-kv-cache.html`, tied to the skill, challenge, and receipt schema in `docs/token-optimization.md`.
- A three-slide submission deck, `pitch/slides.html` (team, product, video), plus a regenerated `.pptx` (`pitch/Touchdown-Inference-Lab-Hackathon.pptx`) built from that HTML with real editable text boxes and an embedded, playable 1:48 video — not a screenshot, not a link-out. PNG/PDF exports live in `pitch/exports/`.
- The 1:48 lifecycle demo video (`demo-video/touchdown-inference-lab-lifecycle-demo.mp4`), under the 2:00 cap, walking all three surfaces end to end — see `demo-video/README.md`.

## Current evidence state

| Surface | State | What remains |
| --- | --- | --- |
| Local app and challenge | `live` locally | Browser and Node checks pass. |
| Butterbase | `live_validated` data write | Existing app `app_b197i2548pk2` accepted receipt row `e5ff8fc6-c338-43d1-823d-9f6122009454`. Bind the browser adapter to a deployed receipt function before calling the UI path live. |
| EverOS | `fixture_backed` | Add API key to the serverless function, retrieve Maya's real memory, then write and flush the verified case. |
| Nebius | `fixture_backed` | Add API key for Token Factory or deploy the pinned vLLM endpoint and capture the provider request ID. |

No sponsor credential variables are loaded in the current shell. The app will not call a sponsor directly from the browser or pretend a fixture is live.

## Sponsor wiring

### Butterbase

1. Configure the MCP endpoint from `integrations/butterbase/mcp-config.example.json`.
2. Create the app and retain its `app_id`.
3. Dry-run and apply `integrations/butterbase/schema.sql`.
4. Add owner-scoped RLS policies.
5. Deploy `integrations/butterbase/functions/receipt.ts` and bind `/api/receipt`.
6. Deploy this static folder on `*.butterbase.dev`.
7. Run `prep_and_submit_hackathon_entry` twice: prepare, then submit with the matched hackathon slug and `app_id`.

The free-plan organization already contains one provisioned project, so this build reuses `autopilot-hackathon` (`app_b197i2548pk2`) rather than entering a paid checkout. The redacted live-write receipt is in `integrations/butterbase/live-receipt.json`.

### EverOS

The local server and deployable Butterbase function implement the same v1 flow:

```text
verified coding-agent trajectory
→ POST /api/v1/memories/agent
→ POST /api/v1/memories/agent/flush
→ hybrid search with memory_types=[agent_memory]
→ retrieved Case or Skill enters the next lesson
```

Install and verify the official SDK without placing the key in source:

```bash
python3 -m venv .venv
.venv/bin/pip install -r integrations/everos/requirements.txt
export EVEROS_API_KEY="..."
npm run verify:everos
```

`npm run dev` exposes a same-origin `/api/everos` proxy whenever the environment variable is loaded. For Butterbase deployment, deploy `integrations/everos/proxy.ts` as a serverless function and map the same path. The browser receives normalized Case/Skill content, never the key.

Token claim boundary: EverOS can reduce agent prompt tokens by retrieving compact, relevant Cases/Skills instead of replaying the full trajectory. Any percentage shown publicly must come from a measured before/after prompt receipt; the vendor's 7–15× / up-to-90% claims are not treated as Touchdown measurements.

### Nebius

For the fast path, set `NEBIUS_API_KEY` and use Token Factory. For the infrastructure path, deploy the pinned configuration in `integrations/nebius/vllm-endpoint.json`, set `NEBIUS_OPENAI_BASE_URL`, and capture a real request ID before changing the badge to `live`.

## Three-minute demo

1. Freeze the retry task and acceptance test.
2. Reveal the harness context, with exact fixture characters and unknown provider tokens.
3. Apply one context-lifetime optimization.
4. Switch from one private user to one hundred concurrent users; watch the engine recommendation change.
5. Run the three sponsor operations.
6. Open text → tokens → prefill → KV → decode → HBM.
7. Apply the EverOS misconception; show that the next instruction changes.
8. Open the verification table and export the receipt.

## Full walkthrough (1:48)

`demo-video/touchdown-inference-lab-lifecycle-demo.mp4` (embedded in `pitch/slides.html` and the pptx) covers the three-minute demo above plus: the challenge ladder, the résumé-vs-receipt comparison, the incentive-alignment thesis, the thirteen-phase continuous lab down to the GPU/HBM package and facility lanes, and the learner-to-contributor journey closing on the portfolio receipt.

## Source boundaries

- The held HBM learning-journey manuscript lives outside this repo and remains under publication hold. `lab.html`'s datacenter GPU/HBM/facility schematics adapt only its visual vocabulary (package cross-section, tiered memory, power/thermal/cost lanes) with original captions and numbers from this repo's own fixture — no manuscript text is reproduced.
- The lesson uses the safe causal model and evidence-state discipline, not unpublished manuscript text.
- Existing InferGuard usage adapters remain the source for real Claude/Codex accounting.
