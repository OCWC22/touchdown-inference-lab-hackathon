import { createButterbaseAdapter } from "../adapters/butterbase.js";
import { createEverOSAdapter } from "../adapters/everos.js";
import { createNebiusAdapter } from "../adapters/nebius.js";

const state = {
  stage: 0,
  completed: new Set(),
  constraints: "local",
  optimizations: new Set(),
  memoryApplied: false,
  integrationResults: {},
  data: null,
  engines: null,
  config: window.TOUCHDOWN_INTEGRATIONS || {},
};

const $ = (selector) => document.querySelector(selector);
const escapeHtml = (value) => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#039;");

const evidenceClass = (value) => `state-${String(value || "unknown").toLowerCase()}`;
const evidenceLabel = (value) => ({
  fixture_backed: "DEMO REPLAY",
  configured: "WIRED",
  live: "LIVE",
  blocked: "NEEDS KEY",
  unknown: "UNKNOWN",
  local_verified: "LOCAL VERIFIED",
}[value] || String(value || "unknown").toUpperCase());
const formatNumber = (value) => value == null ? "unknown" : Number(value).toLocaleString("en-US");

const integrationAdapters = {
  butterbase: createButterbaseAdapter(state.config.butterbase),
  everos: createEverOSAdapter(state.config.everos),
  nebius: createNebiusAdapter(state.config.nebius),
};

async function loadData() {
  const [lessonResponse, engineResponse] = await Promise.all([
    fetch("fixtures/lesson-manifest.json"),
    fetch("fixtures/engine-catalog.json"),
  ]);
  if (!lessonResponse.ok || !engineResponse.ok) throw new Error("Could not load the lesson fixtures.");
  state.data = await lessonResponse.json();
  state.engines = await engineResponse.json();
}

function statusFor(name) {
  return state.integrationResults[name]?.evidence_state
    || integrationAdapters[name]?.status?.().evidence_state
    || "fixture_backed";
}

function renderSponsorStatus() {
  const responsibilities = {
    butterbase: ["Butterbase", "Persists redacted runs, receipts, and the hackathon submission."],
    everos: ["EverOS", "Retrieves a durable misconception and changes the next lesson."],
    nebius: ["Nebius", "Runs the production inference branch through Token Factory or vLLM."],
  };
  $("#sponsor-status").innerHTML = Object.entries(responsibilities).map(([key, [name, copy]]) => {
    const evidence = statusFor(key);
    return `<article class="sponsor-status" data-integration="${key}">
      <header><h3>${name}</h3><span class="status-pill ${evidenceClass(evidence)}">${escapeHtml(evidenceLabel(evidence))}</span></header>
      <p>${copy}</p>
    </article>`;
  }).join("");
}

function renderStageRail() {
  $("#stage-list").innerHTML = state.data.stages.map((stage, index) => `
    <li><button class="stage-button ${state.completed.has(index) ? "completed" : ""}" data-stage="${index}" ${index === state.stage ? 'aria-current="step"' : ""}>
      <span>${String(index + 1).padStart(2, "0")}</span><strong>${escapeHtml(stage.short_title)}</strong>
    </button></li>`).join("");
  document.querySelectorAll("[data-stage]").forEach((button) => {
    button.addEventListener("click", () => setStage(Number(button.dataset.stage)));
  });
}

function activeMetrics() {
  const baseline = state.data.workload.baseline;
  const optimized = state.data.workload.optimized;
  if (state.optimizations.size === 0) return baseline;
  const ratio = state.optimizations.size / state.data.optimizations.length;
  return {
    ...baseline,
    context_characters: Math.round(baseline.context_characters - ((baseline.context_characters - optimized.context_characters) * ratio)),
    repeated_context_characters: Math.round(baseline.repeated_context_characters - ((baseline.repeated_context_characters - optimized.repeated_context_characters) * ratio)),
    tool_calls: Math.round(baseline.tool_calls - ((baseline.tool_calls - optimized.tool_calls) * ratio)),
    tests_passed: optimized.tests_passed,
  };
}

function receiptRows() {
  const metrics = activeMetrics();
  const engine = recommendedEngines()[0];
  return [
    ["Fixture", state.data.workload.fixture_id],
    ["Context", `${formatNumber(metrics.context_characters)} chars`],
    ["Repeated", `${formatNumber(metrics.repeated_context_characters)} chars`],
    ["Tool calls", formatNumber(metrics.tool_calls)],
    ["Engine", engine?.name || "not selected"],
    ["Tests", metrics.tests_passed ? "PASS" : "PENDING"],
    ["External proof", externalProofState()],
  ];
}

function externalProofState() {
  const states = ["butterbase", "everos", "nebius"].map(statusFor);
  return states.every((value) => value === "live") ? "LIVE" : "MIXED / FIXTURE";
}

function renderLiveReceipt() {
  $("#live-receipt").innerHTML = receiptRows().map(([label, value]) => `<div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`).join("");
  const allLive = externalProofState() === "LIVE";
  $("#claim-boundary").textContent = allLive
    ? "All three sponsor operations returned live receipts. Provider claims remain separate from Touchdown-derived values."
    : "The local task contract and UI are verified. Sponsor operations remain configured or fixture-backed until their keys and quotas are present.";
}

function metricWaterfall(metrics) {
  const rows = metrics.context_segments;
  const max = Math.max(...rows.map((row) => row.characters));
  return `<div class="metric-waterfall">${rows.map((row, index) => `
    <div class="metric-row">
      <span class="metric-label">${escapeHtml(row.label)}</span>
      <div class="metric-track"><div class="metric-fill ${index === rows.length - 1 ? "accent" : ""}" style="width:${Math.max(3, (row.characters / max) * 100)}%"></div></div>
      <span class="metric-value">${formatNumber(row.characters)}</span>
    </div>`).join("")}</div>`;
}

function renderContractStage() {
  const workload = state.data.workload;
  return `<div class="task-contract">
    <header><span>${escapeHtml(workload.fixture_id)}</span><span>IMMUTABLE LESSON FIXTURE</span></header>
    <blockquote>${escapeHtml(workload.task)}</blockquote>
    <div class="contract-grid">
      <div><span>Repository revision</span><strong>${escapeHtml(workload.repository_revision)}</strong></div>
      <div><span>Public API</span><strong>Must remain unchanged</strong></div>
      <div><span>Acceptance</span><strong>${escapeHtml(workload.acceptance)}</strong></div>
      <div><span>Primary metric</span><strong>Cost per verified task</strong></div>
    </div>
  </div>
  <p class="annotation">The frozen task keeps engine and context decisions comparable. Changing the task, revision, test command, or acceptance rubric creates a new fixture ID.</p>`;
}

function renderBaselineStage() {
  const baseline = state.data.workload.baseline;
  return `${metricWaterfall(baseline)}
    <p class="annotation"><strong>${formatNumber(baseline.context_characters)} characters</strong> enter this deterministic replay. Exact model tokens remain <strong>unknown</strong> until a provider or tokenizer reports them. The lab never converts characters into fake token counts.</p>`;
}

function renderOptimizationStage() {
  const selected = state.optimizations;
  const controls = state.data.optimizations.map((item) => `
    <label class="control-row">
      <input type="checkbox" value="${escapeHtml(item.id)}" ${selected.has(item.id) ? "checked" : ""}>
      <span><strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(item.description)}</small></span>
      <span class="control-impact">${escapeHtml(item.impact)}</span>
    </label>`).join("");
  const metrics = activeMetrics();
  return `<div class="control-stack" id="optimization-controls">${controls}</div>
    <p class="annotation">Current replay: ${formatNumber(metrics.context_characters)} context characters, ${formatNumber(metrics.repeated_context_characters)} repeated characters, ${formatNumber(metrics.tool_calls)} tool calls. These are deterministic lesson values, not a production benchmark.</p>`;
}

function recommendedEngines() {
  const profile = state.constraints;
  return [...state.engines.engines]
    .map((engine) => ({ ...engine, score: engine.scores[profile] }))
    .sort((a, b) => b.score - a.score);
}

function renderEngineStage() {
  const profile = state.engines.profiles[state.constraints];
  const engines = recommendedEngines();
  return `<div class="choice-tabs" role="group" aria-label="Deployment constraints">
      <button class="choice-tab" data-constraint="local" aria-pressed="${state.constraints === "local"}">One private user</button>
      <button class="choice-tab" data-constraint="production" aria-pressed="${state.constraints === "production"}">One hundred users</button>
    </div>
    <p class="annotation">${escapeHtml(profile.summary)}</p>
    <div class="option-grid">${engines.slice(0, 4).map((engine, index) => `
      <article class="option-card ${index === 0 ? "recommended" : ""}">
        <span class="rank">${index === 0 ? "RECOMMENDED" : `RANK ${index + 1}`}</span>
        <h4>${escapeHtml(engine.name)}</h4>
        <p>${escapeHtml(engine.fit[state.constraints])}</p>
      </article>`).join("")}</div>`;
}

function renderSponsorStage() {
  const engine = recommendedEngines()[0];
  return `<div class="route-map" aria-label="Selected workload route">
      <div class="route-node active"><strong>Codex / Claude Code</strong><small>Frozen coding task and trace adapter</small></div>
      <div class="route-arrow" aria-hidden="true">&rarr;</div>
      <div class="route-node active"><strong>InferRoute</strong><small>Workload, state, quality, and engine policy</small></div>
      <div class="route-arrow" aria-hidden="true">&rarr;</div>
      <div class="route-node active"><strong>${escapeHtml(engine.name)}</strong><small>${state.constraints === "production" ? "Nebius production branch" : "Local branch"}</small></div>
    </div>
    <div class="sponsor-run-grid">
      ${sponsorRunCard("butterbase", "Persist receipt", "Stores the redacted run and queues safely when offline.")}
      ${sponsorRunCard("everos", "Recall learner state", "Retrieves a misconception that changes engine-selection guidance.")}
      ${sponsorRunCard("nebius", "Run production branch", "Calls Token Factory or a configured vLLM endpoint.")}
    </div>`;
}

function sponsorRunCard(name, label, copy) {
  const result = state.integrationResults[name];
  const evidence = result?.evidence_state || statusFor(name);
  const resultCopy = result ? sponsorResultCopy(name, result) : "Ready for the recording path.";
  return `<article class="sponsor-run"><strong>${escapeHtml(label)}</strong><p>${escapeHtml(copy)}</p>
    <button class="button button-secondary integration-run" data-integration-run="${name}" type="button">${result ? "Run again" : "Run now"}</button>
    <span class="status-pill ${evidenceClass(evidence)}">${escapeHtml(evidenceLabel(evidence))}</span>
    <small class="sponsor-result">${escapeHtml(resultCopy)}</small></article>`;
}

function sponsorResultCopy(name, result) {
  if (name === "butterbase") return `Receipt ${result.receipt_id} stored in the demo ledger.`;
  if (name === "everos") return `Memory ${result.receipt_id} retrieved; the next lesson can change.`;
  return `${result.engine || "vLLM"} replay returned ${result.receipt_id}.`;
}

function renderInferenceStage() {
  const steps = [
    ["01", "Text", "Task, rules, tools, history"],
    ["02", "Tokens", "Model-specific integer IDs"],
    ["03", "Prefill", "Process admitted prompt"],
    ["04", "KV cache", "Per-layer attention state"],
    ["05", "Decode", "Generate and call tools"],
    ["06", "HBM", "Hot weights, KV, activations"],
  ];
  return `<div class="inference-stack">${steps.map(([id, title, copy], index) => `
    <div class="inference-step ${index === 5 ? "hot" : ""}"><span>${id}</span><strong>${title}</strong><small>${copy}</small></div>`).join("")}</div>
    <p class="annotation">A prompt-cache hit can avoid repeated prefix computation. It does not remove the tokens from context, become durable learner memory, or eliminate decode. EverOS memory, prompt caching, engine-local KV, and LMCache are different state systems.</p>`;
}

function renderMemoryStage() {
  const memory = state.data.learner_memory;
  const liveBehavior = state.integrationResults.everos?.behavior_change;
  const behavior = state.memoryApplied ? (liveBehavior || memory.changed_instruction) : memory.default_instruction;
  return `<article class="memory-card">
      <header><strong>EVEROS / TRAJECTORY → CASE → SKILL</strong><span class="status-pill ${evidenceClass(statusFor("everos"))}">${escapeHtml(evidenceLabel(statusFor("everos")))}</span></header>
      <div class="memory-body">
        <p class="memory-explainer">A prompt cache reuses prefix computation. EverOS does a different job: it extracts durable meaning and procedure from prior agent work, then retrieves the smallest relevant memory for a future task.</p>
        <div class="everos-path" aria-label="EverOS agent memory path">
          <div><span>01</span><strong>Raw trajectory</strong><small>Reasoning, tools, results, verification</small></div>
          <div><span>02</span><strong>Agent Case</strong><small>Intent, compressed approach, outcome, quality</small></div>
          <div><span>03</span><strong>Agent Skill</strong><small>Repeated successful procedure</small></div>
          <div><span>04</span><strong>Hybrid retrieval</strong><small>Only relevant memory enters the next prompt</small></div>
        </div>
        <div class="memory-token-compare">
          <article><span>REPLAY FULL HISTORY</span><strong>~${formatNumber(memory.full_trajectory_tokens_estimated)} tokens</strong><small>${formatNumber(memory.full_trajectory_characters)} fixture characters</small></article>
          <article class="recommended"><span>RETRIEVE EVEROS MEMORY</span><strong>~${formatNumber(memory.retrieved_memory_tokens_estimated)} tokens</strong><small>${formatNumber(memory.retrieved_memory_characters)} fixture characters</small></article>
          <article class="memory-savings"><span>LOCAL ESTIMATE</span><strong>-${formatNumber(memory.estimated_token_reduction_percent)}%</strong><small>Provider tokens remain unknown</small></article>
        </div>
        <p class="annotation">Estimate method: ${escapeHtml(memory.measurement_method)}. ${escapeHtml(memory.vendor_claim)}</p>
        <blockquote>Prior misconception: “${escapeHtml(memory.misconception)}”</blockquote>
        <div class="memory-delta">
          <strong>${state.memoryApplied ? "The next lesson changed." : "What should change next?"}</strong>
          <p>${escapeHtml(behavior)}</p>
        </div>
        <button class="button button-primary" id="apply-memory" type="button" style="margin-top:18px" ${state.memoryApplied ? "disabled" : ""}>${state.memoryApplied ? "EverOS memory applied" : "Use retrieved Case / Skill"} <span aria-hidden="true">&rarr;</span></button>
      </div>
    </article>`;
}

function renderVerificationStage() {
  const rows = [
    ["Frozen challenge tests", "PASS", "local_verified"],
    ["Receipt schema", "PASS", "local_verified"],
    ["Butterbase persistence", evidenceLabel(statusFor("butterbase")), statusFor("butterbase")],
    ["EverOS retrieval changed next lesson", state.memoryApplied ? "PASS" : evidenceLabel(statusFor("everos")), state.memoryApplied ? statusFor("everos") : statusFor("everos")],
    ["Nebius model response", evidenceLabel(statusFor("nebius")), statusFor("nebius")],
    ["Production savings", "UNKNOWN", "unknown"],
  ];
  return `<table class="verification-table"><thead><tr><th>Gate</th><th>Result</th><th>Evidence</th></tr></thead><tbody>
    ${rows.map(([gate, result, evidence]) => `<tr><td>${escapeHtml(gate)}</td><td class="${result === "PASS" ? "verification-pass" : "verification-unknown"}">${escapeHtml(result)}</td><td><span class="status-pill ${evidenceClass(evidence)}">${escapeHtml(evidenceLabel(evidence))}</span></td></tr>`).join("")}
    </tbody></table>
    <p class="annotation">The next real assignment is to capture one actual Claude Code or Codex task with InferGuard, preserve the acceptance test, and replace this fixture only after the before and after runs are comparable.</p>`;
}

function renderContributionStage() {
  return `<div class="task-contract">
    <header><span>ASSIGNMENT 02</span><span>SHIP SOMETHING USEFUL</span></header>
    <blockquote>Reproduce one small routing decision, then resolve one bounded InferRoute, Hermes, vLLM, SGLang, or LMCache issue with tests and a reviewable patch.</blockquote>
    <div class="contract-grid">
      <div><span>Learner wins</span><strong>Lower cost and a real portfolio artifact</strong></div>
      <div><span>Touchdown wins</span><strong>Better traces, adapters, and product evidence</strong></div>
      <div><span>Ecosystem wins</span><strong>One tested fix, issue, or benchmark</strong></div>
      <div><span>Proof gate</span><strong>Issue &rarr; patch &rarr; tests &rarr; receipt</strong></div>
    </div>
  </div>`;
}

const stageRenderers = [
  renderContractStage,
  renderBaselineStage,
  renderOptimizationStage,
  renderEngineStage,
  renderSponsorStage,
  renderInferenceStage,
  renderMemoryStage,
  renderVerificationStage,
  renderContributionStage,
];

function attachStageEvents() {
  document.querySelectorAll("#optimization-controls input").forEach((input) => {
    input.addEventListener("change", () => {
      if (input.checked) state.optimizations.add(input.value); else state.optimizations.delete(input.value);
      renderStage();
    });
  });
  document.querySelectorAll("[data-constraint]").forEach((button) => {
    button.addEventListener("click", () => {
      state.constraints = button.dataset.constraint;
      renderStage();
    });
  });
  document.querySelectorAll("[data-integration-run]").forEach((button) => {
    button.addEventListener("click", () => runIntegration(button.dataset.integrationRun, button));
  });
  $("#apply-memory")?.addEventListener("click", () => {
    state.memoryApplied = true;
    state.constraints = "local";
    renderStage();
  });
}

async function runIntegration(name, button) {
  button.disabled = true;
  button.textContent = "Running…";
  try {
    const payload = buildReceipt();
    if (name === "butterbase") state.integrationResults[name] = await integrationAdapters[name].persistReceipt(payload);
    if (name === "everos") state.integrationResults[name] = await integrationAdapters[name].searchMemory({
      user_id: state.data.learner_memory.user_id,
      query: "What prior misconception should change this engine decision?",
      fixture: state.data.learner_memory,
    });
    if (name === "nebius") state.integrationResults[name] = await integrationAdapters[name].runInference({
      task: state.data.workload.task,
      acceptance: state.data.workload.acceptance,
      fixture_id: state.data.workload.fixture_id,
    });
  } catch (error) {
    state.integrationResults[name] = { evidence_state: "blocked", error: error.message };
  }
  renderSponsorStatus();
  renderStage();
  renderReceiptGrid();
}

function setStage(index) {
  state.completed.add(state.stage);
  state.stage = Math.max(0, Math.min(index, state.data.stages.length - 1));
  renderStageRail();
  renderStage();
}

function renderStage() {
  const stage = state.data.stages[state.stage];
  $("#stage-index").textContent = `${String(state.stage + 1).padStart(2, "0")} / ${String(state.data.stages.length).padStart(2, "0")}`;
  $("#stage-evidence").textContent = evidenceLabel(stage.evidence_state);
  $("#stage-evidence").className = `evidence-badge ${evidenceClass(stage.evidence_state)}`;
  $("#stage-title").textContent = stage.title;
  $("#stage-lede").textContent = stage.lede;
  $("#stage-content").innerHTML = stageRenderers[state.stage]();
  $("#previous-stage").disabled = state.stage === 0;
  $("#next-stage").disabled = state.stage === state.data.stages.length - 1;
  $("#next-stage").innerHTML = state.stage === state.data.stages.length - 2 ? 'Finish the lab <span aria-hidden="true">&rarr;</span>' : 'Next <span aria-hidden="true">&rarr;</span>';
  attachStageEvents();
  renderLiveReceipt();
}

function buildReceipt() {
  const metrics = activeMetrics();
  const now = new Date().toISOString();
  return {
    kind: "td.agent_optimization_receipt",
    version: "0.1.0",
    receipt_id: `TD-LAB-${state.data.workload.fixture_id}`,
    generated_at: now,
    workload: {
      fixture_id: state.data.workload.fixture_id,
      repository_revision: state.data.workload.repository_revision,
      task_hash: state.data.workload.task_hash,
      acceptance_hash: state.data.workload.acceptance_hash,
    },
    decision: {
      deployment_profile: state.constraints,
      recommended_engine: recommendedEngines()[0]?.id || null,
      optimizations: [...state.optimizations],
      memory_changed_behavior: state.memoryApplied,
    },
    result: {
      context_characters: metrics.context_characters,
      repeated_context_characters: metrics.repeated_context_characters,
      provider_input_tokens: null,
      provider_output_tokens: null,
      provider_cost_usd: null,
      tool_calls: metrics.tool_calls,
      tests_passed: metrics.tests_passed,
    },
    integrations: Object.fromEntries(["butterbase", "everos", "nebius"].map((name) => [name, {
      evidence_state: statusFor(name),
      receipt_id: state.integrationResults[name]?.receipt_id || null,
    }])),
    claim_status: "fixture_backed",
    limitations: [
      "Provider token and cost fields are unknown until a live harness run is imported.",
      "Fixture-backed sponsor results do not prove production availability or economics.",
      "The held HBM manuscript was not modified or published.",
    ],
  };
}

function renderReceiptGrid() {
  const cards = [
    ["01 / BUTTERBASE", "Evidence ledger", `${evidenceLabel(statusFor("butterbase"))}. Redacted run, verification, and submission record.`],
    ["02 / EVEROS", "Learning memory", `${evidenceLabel(statusFor("everos"))}. Prior evidence changes the next lesson.`],
    ["03 / NEBIUS", "Inference execution", `${evidenceLabel(statusFor("nebius"))}. Token Factory or self-hosted vLLM branch.`],
    ["04 / LOCAL", "Frozen task", "Node tests and hashes verify the deterministic challenge and receipt contract."],
    ["05 / INFERGUARD", "Usage semantics", "Anthropic and OpenAI cache accounting remain distinct in the source adapter."],
    ["06 / CLAIM", "Narrow boundary", "No production savings, energy, rack, or model-quality claim without a matched live run."],
  ];
  $("#receipt-grid").innerHTML = cards.map(([eyebrow, title, copy]) => `<article class="receipt-card"><p class="eyebrow">${escapeHtml(eyebrow)}</p><strong>${escapeHtml(title)}</strong><p>${escapeHtml(copy)}</p></article>`).join("");
}

function downloadReceipt() {
  const blob = new Blob([JSON.stringify(buildReceipt(), null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "touchdown-agent-optimization-receipt.json";
  link.click();
  URL.revokeObjectURL(url);
}

async function persistFinalReceipt() {
  const target = $("#persist-result");
  target.textContent = "Persisting receipt…";
  const result = await integrationAdapters.butterbase.persistReceipt(buildReceipt());
  state.integrationResults.butterbase = result;
  target.textContent = result.evidence_state === "live"
    ? `Butterbase stored receipt ${result.receipt_id}.`
    : `Butterbase is ${result.evidence_state}. Receipt queued locally as ${result.receipt_id}.`;
  renderSponsorStatus();
  renderLiveReceipt();
  renderReceiptGrid();
}

function bindGlobalEvents() {
  $("#start-lab").addEventListener("click", () => {
    $("#lab").scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    setStage(0);
  });
  $("#previous-stage").addEventListener("click", () => setStage(state.stage - 1));
  $("#next-stage").addEventListener("click", () => setStage(state.stage + 1));
  $("#download-receipt").addEventListener("click", downloadReceipt);
  $("#persist-receipt").addEventListener("click", persistFinalReceipt);
}

async function init() {
  try {
    await loadData();
    renderSponsorStatus();
    renderStageRail();
    renderStage();
    renderReceiptGrid();
    bindGlobalEvents();
  } catch (error) {
    $("#stage-content").innerHTML = `<p class="annotation">${escapeHtml(error.message)} Serve this folder with <code>npm run dev</code>.</p>`;
  }
}

init();
