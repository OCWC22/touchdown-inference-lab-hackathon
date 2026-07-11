export function createNebiusAdapter(config = {}) {
  return {
    status() {
      return {
        evidence_state: config.proxyEndpoint ? "configured" : "fixture_backed",
        route: config.route || "token_factory_or_vllm",
      };
    },

    async runInference({ task, acceptance, fixture_id }) {
      if (!config.proxyEndpoint) {
        return {
          evidence_state: "fixture_backed",
          receipt_id: `NEBIUS-FIXTURE-${fixture_id}`,
          model: "Qwen/Qwen3-0.6B",
          engine: "vLLM",
          output: "Deterministic replay only. No Nebius request was sent.",
        };
      }
      try {
        const response = await fetch(config.proxyEndpoint, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ task, acceptance, fixture_id }),
        });
        if (!response.ok) throw new Error(`Nebius proxy returned ${response.status}`);
        const result = await response.json();
        if (!result.request_id || !result.output) throw new Error("Nebius proxy returned no request receipt");
        return {
          evidence_state: "live",
          receipt_id: result.request_id,
          model: result.model,
          engine: result.engine || null,
          output: result.output,
        };
      } catch (error) {
        return { evidence_state: "blocked", receipt_id: null, error: error.message };
      }
    },
  };
}
