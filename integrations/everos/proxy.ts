const EVEROS_BASE = "https://api.evermind.ai/api/v1";
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json", "cache-control": "no-store" } });

const normalizeMemories = (payload: any) => {
  const data = payload?.data || {};
  return [
    ...(data.agent_skills || []).map((item: any) => ({ ...item, memory_type: "agent_skill", content: item.content || item.description || item.name })),
    ...(data.agent_cases || []).map((item: any) => ({ ...item, memory_type: "agent_case", content: item.approach || item.task_intent })),
    ...(data.episodes || []).map((item: any) => ({ ...item, memory_type: "episodic_memory", content: item.episode || item.summary })),
    ...(data.profiles || []).map((item: any) => ({ ...item, memory_type: "profile", content: JSON.stringify(item.profile_data || {}) })),
  ];
};

const everosFetch = async (path: string, apiKey: string, body: unknown) => {
  const response = await fetch(`${EVEROS_BASE}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${apiKey}` },
    body: JSON.stringify(body),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) return json({ error: payload?.detail || payload?.message || `everos_${response.status}` }, response.status);
  return { payload };
};

Deno.serve(async (request) => {
  if (request.method !== "POST") return json({ error: "method_not_allowed" }, 405);
  const apiKey = Deno.env.get("EVEROS_API_KEY") || Deno.env.get("EVERMIND_API_KEY");
  if (!apiKey) return json({ error: "everos_not_configured" }, 503);
  const body = await request.json();
  if (body.action === "search") {
    const result = await everosFetch("/memories/search", apiKey, {
      query: body.query,
      filters: { user_id: body.user_id },
      method: "hybrid",
      memory_types: body.memory_types || ["agent_memory", "episodic_memory", "profile"],
      top_k: body.top_k || 5,
    });
    if (result instanceof Response) return result;
    return json({ memories: normalizeMemories(result.payload), provider_status: "live" });
  }

  if (body.action === "add_agent") {
    const now = Date.now();
    const messages = body.messages || [
      { role: "user", timestamp: now, content: "Optimize this verified coding-agent workload without weakening its acceptance test." },
      { role: "assistant", timestamp: now + 1, content: body.content },
    ];
    const result = await everosFetch("/memories/agent", apiKey, {
      user_id: body.user_id,
      session_id: body.session_id,
      messages: messages.map((message: any, index: number) => ({ ...message, timestamp: message.timestamp || now + index })),
    });
    if (result instanceof Response) return result;
    return json({ task_id: result.payload?.data?.task_id || null, status: result.payload?.data?.status || "accepted" }, 200);
  }

  if (body.action === "flush_agent") {
    const result = await everosFetch("/memories/agent/flush", apiKey, { user_id: body.user_id, session_id: body.session_id });
    if (result instanceof Response) return result;
    return json({ status: result.payload?.data?.status || "unknown" });
  }

  return json({ error: "unknown_action" }, 400);
});
