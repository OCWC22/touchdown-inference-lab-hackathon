---
name: touchdown-agent-optimizer
description: Trace one real coding-agent task, reduce repeated context without weakening verification, and export a Touchdown optimization receipt.
---

# Touchdown agent optimizer

Use this skill for one bounded coding task with a named acceptance test.

## Contract

1. Record the repository revision, task, permitted tools, test commands, retry budget, and acceptance rule before changing the harness.
2. Run the task once with the current configuration.
3. Record provider-reported usage exactly. Keep Anthropic and OpenAI cache accounting separate.
4. Classify context as stable, active, durable, externalized, or dead.
5. Change one policy at a time: stable-prefix layout, skill disclosure, tool-output projection, repository memory, or model route.
6. Repeat the same task against the same revision and acceptance contract.
7. Run the tests. A lower token count with a failed patch is not an improvement.
8. Export a receipt with exact values, unknown fields as `null`, and one of `configured`, `fixture_backed`, `live`, or `blocked` for each integration.

## Claude Code accounting

```text
total input = input_tokens + cache_creation_input_tokens + cache_read_input_tokens
```

Use `--tools` to restrict the tool set. `--allowedTools` controls approval, not the complete tool list.

## Codex accounting

```text
total input = input_tokens
uncached input = input_tokens - cached_input_tokens
```

Do not add cached input to total input. Capture non-interactive events with `codex exec --json` or use the App Server for a richer live stream.

## Privacy

- Keep raw source and prompts local by default.
- Redact secrets before any sponsor upload.
- Store hashes, categories, byte counts, usage, and verification results when raw content is unnecessary.
- Never send a private repository trace to training without separate consent.

## Done

The task is done only when the accepted output still passes and the receipt states what was measured, derived, fixture-backed, or unknown.
