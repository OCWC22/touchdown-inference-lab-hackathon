import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createButterbaseAdapter } from "../adapters/butterbase.js";
import { createEverOSAdapter } from "../adapters/everos.js";
import { createNebiusAdapter } from "../adapters/nebius.js";

const load = async (name) => JSON.parse(await readFile(new URL(`../fixtures/${name}`, import.meta.url), "utf8"));

test("lesson fixture has one immutable workload and nine coherent stages", async () => {
  const lesson = await load("lesson-manifest.json");
  assert.equal(lesson.stages.length, 9);
  assert.match(lesson.workload.fixture_id, /^TD-A-01-/);
  assert.equal(lesson.workload.baseline.tests_passed, true);
  assert.equal(lesson.workload.optimized.tests_passed, true);
  assert.equal(lesson.workload.baseline.provider_input_tokens, null);
  assert.equal(lesson.workload.optimized.provider_cost_usd, null);
});

test("engine recommendation changes with deployment constraints", async () => {
  const catalog = await load("engine-catalog.json");
  const winner = (profile) => [...catalog.engines].sort((a, b) => b.scores[profile] - a.scores[profile])[0].id;
  assert.equal(winner("local"), "mlx-lm");
  assert.equal(winner("production"), "vllm");
});

test("Butterbase queues a receipt without exposing a fake live state", async () => {
  const result = await createButterbaseAdapter().persistReceipt({ receipt_id: "R-1", workload: { fixture_id: "F-1" }, result: { tests_passed: true }, claim_status: "fixture_backed" });
  assert.equal(result.evidence_state, "fixture_backed");
  assert.equal(result.persistence, "local_offline_queue");
});

test("EverOS fixture changes the next instruction", async () => {
  const fixture = { memory_id: "M-1", changed_instruction: "Rank hardware fit first." };
  const result = await createEverOSAdapter().searchMemory({ user_id: "U-1", query: "prior mistake", fixture });
  assert.equal(result.evidence_state, "fixture_backed");
  assert.equal(result.behavior_change, "Rank hardware fit first.");
});

test("EverOS live contract writes, flushes, and retrieves agent memory", async () => {
  const originalFetch = globalThis.fetch;
  const actions = [];
  globalThis.fetch = async (_url, options) => {
    const body = JSON.parse(options.body);
    actions.push(body);
    if (body.action === "add_agent") return { ok: true, json: async () => ({ task_id: "task-live-1", status: "queued" }) };
    if (body.action === "flush_agent") return { ok: true, json: async () => ({ status: "extracted" }) };
    return { ok: true, json: async () => ({ memories: [{ id: "case-live-1", content: "Preserve the acceptance test." }] }) };
  };

  try {
    const adapter = createEverOSAdapter({ proxyEndpoint: "/api/everos" });
    const write = await adapter.addVerifiedMemory({ user_id: "U-1", session_id: "S-1", content: "Verified optimization." });
    const search = await adapter.searchMemory({ user_id: "U-1", query: "What worked?" });
    assert.equal(write.evidence_state, "live");
    assert.equal(write.extraction_status, "extracted");
    assert.equal(search.evidence_state, "live");
    assert.equal(search.behavior_change, "Preserve the acceptance test.");
    assert.deepEqual(actions.map((action) => action.action), ["add_agent", "flush_agent", "search"]);
    assert.deepEqual(actions[2].memory_types, ["agent_memory", "episodic_memory", "profile"]);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("Nebius fallback remains explicitly fixture-backed", async () => {
  const result = await createNebiusAdapter().runInference({ task: "fix", acceptance: "tests", fixture_id: "F-1" });
  assert.equal(result.evidence_state, "fixture_backed");
  assert.match(result.output, /No Nebius request was sent/);
});

test("public bundle never embeds sponsor API keys", async () => {
  const files = ["../assets/app.js", "../adapters/butterbase.js", "../adapters/everos.js", "../adapters/nebius.js"];
  for (const file of files) {
    const content = await readFile(new URL(file, import.meta.url), "utf8");
    assert.doesNotMatch(content, /bb_sk_[A-Za-z0-9_-]+/);
    assert.doesNotMatch(content, /Bearer\s+[A-Za-z0-9._-]{24,}/);
  }
});
