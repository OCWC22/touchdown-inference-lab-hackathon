# Challenge TD-A-01-RETRY-001 — Reduce repeated agent context without weakening verification

First entry in the frontier challenge catalog, written in the full marketplace template so
every later challenge (company-sourced, lab-sourced, open-source-sourced) uses the same
structure. See [`docs/product-redesign.md`](../docs/product-redesign.md) for the system this
belongs to.

| Field | Value |
| --- | --- |
| **Source kind** | Guided lesson (Touchdown-authored; the on-ramp before externally sourced challenges) |
| **Estimated difficulty** | L1–L5 ladder (Reproduce → Explain → Modify → Diagnose → Improve) |
| **Status** | live locally; deterministic fixture |

## Problem statement

A coding agent fixes a retry-state bug in a small module. The harness loads 40,176 characters
of context for the task, and 17,420 of those characters repeat across 14 tool calls. Reduce
the repeated context without weakening the frozen acceptance test.

## Why the problem matters

Agent loops hide the bill inside the loop. Repeated context becomes repeated prefill,
occupied KV, and wasted spend on every provider. The optimization discipline this challenge
teaches — classify context by lifetime, change one policy at a time, verify after every
change — is the same discipline production inference teams apply at datacenter scale.

## Real-world user or system affected

Any team running coding agents (Claude Code, Codex, open-source harnesses) where token spend
scales with tool-loop replay; any student paying per-token for their own agent.

## Required background

Tokenization basics, prompt structure, what a prefix cache is, how to run `npm test`.

## Suggested learning modules

`index.html` stages 1–4 (task freeze, harness context, tokens, context lifetime) or
`lab.html` §01–§06. Accounting rules: `skills/touchdown-agent-optimizer/SKILL.md`.

## Codebase / environment

This repository. `challenge/baseline/retry.mjs` (reproducible bad baseline),
`challenge/optimized/retry.mjs` (passing fix), `fixtures/lesson-manifest.json` (workload
fixture). No network access required.

## Hardware requirements

Any laptop with Node.js ≥ 20. No GPU.

## Reproduction steps

```bash
npm test          # 10/10 must pass before you change anything
npm run verify    # artifact + secret scan
npm run dev       # open http://127.0.0.1:4173, run the lesson
```

## Baseline

40,176 harness-context characters; 17,420 repeated (43%) across 14 tool calls. Recorded in
`fixtures/lesson-manifest.json` under `workload.baseline`.

## Success criteria

Repeated context reduced with the **same acceptance test passing on the same pinned
revision**. Reference result: 23,210 total / 5,180 repeated (−42% / −70%). A lower character
count with a failing patch scores zero.

## Verification method

Frozen acceptance test (`challenge/tests/retry.test.mjs`) plus `scripts/verify.mjs`. One
policy change per run; re-run the full suite after each.

## Expected evidence

An optimization receipt conforming to `schemas/agent-optimization-receipt.schema.json` and a
portfolio receipt conforming to `schemas/portfolio-receipt.schema.json` (worked example:
`fixtures/portfolio-receipt.example.json`). Unknown fields stay `null`.

## Constraints

- Do not modify the acceptance test or the pinned baseline.
- One policy change at a time (stable-prefix layout, tool-output projection, skill
  disclosure, repository memory, model route).
- Keep Anthropic and OpenAI cache accounting separate if you capture live tokens.

## Safety and security boundaries

Synthetic fixture workload only. No credentials in source; the verifier's secret scan must
stay clean. If you attach a live provider run, redact keys and raw prompts before upload.

## Licensing and contribution rules

Repository license applies. Fixture data is synthetic and freely reusable in your portfolio.

## Review process

Self-verified today (tests + verifier). Maintainer/engineer review round-trip is the next
receipt to land (`review.status: not_yet_available` in the portfolio receipt until then).

## Contribution path

L6 on-ramp: apply the same stable-prefix discipline to a real open-source agent harness or
serving-engine issue (vLLM / SGLang / LMCache prefix-cache docs and diagnostics are natural
first targets), then submit the benchmark report or PR upstream.

## Internship / research / hiring relevance

Demonstrates prefix-cache analysis, benchmark design, and evidence discipline — directly
legible to inference-infrastructure teams. The portfolio receipt is the artifact a reviewer
or hiring team reads.
