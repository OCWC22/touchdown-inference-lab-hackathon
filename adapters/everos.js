export function createEverOSAdapter(config = {}) {
  const post = async (body) => {
    const response = await fetch(config.proxyEndpoint, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || `EverOS proxy returned ${response.status}`);
    return result;
  };

  return {
    status() {
      return { evidence_state: config.proxyEndpoint ? "configured" : "fixture_backed" };
    },

    async searchMemory({ user_id, query, fixture }) {
      if (!config.proxyEndpoint) {
        return {
          evidence_state: "fixture_backed",
          receipt_id: fixture.memory_id,
          memory: fixture,
          behavior_change: fixture.changed_instruction,
        };
      }
      try {
        const result = await post({
          action: "search",
          user_id,
          query,
          memory_types: ["agent_memory", "episodic_memory", "profile"],
          top_k: 5,
        });
        const memory = result.memories?.[0] || null;
        return {
          evidence_state: memory ? "live" : "blocked",
          receipt_id: memory?.id || null,
          memory,
          behavior_change: memory?.content || null,
        };
      } catch (error) {
        return { evidence_state: "blocked", receipt_id: null, error: error.message };
      }
    },

    async addVerifiedMemory({ user_id, session_id, content, messages }) {
      if (!config.proxyEndpoint) return { evidence_state: "fixture_backed", receipt_id: "EVEROS-FIXTURE-WRITE" };
      try {
        const added = await post({ action: "add_agent", user_id, session_id, content, messages });
        const flushed = await post({ action: "flush_agent", user_id, session_id });
        const receiptId = added.task_id || `${user_id}:${session_id}`;
        return {
          evidence_state: flushed.status === "extracted" || flushed.status === "no_extraction" ? "live" : "blocked",
          receipt_id: receiptId,
          extraction_status: flushed.status || "unknown",
        };
      } catch (error) {
        return { evidence_state: "blocked", receipt_id: null, error: error.message };
      }
    },
  };
}
