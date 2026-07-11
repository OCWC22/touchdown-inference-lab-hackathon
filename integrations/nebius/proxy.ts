const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json", "cache-control": "no-store" } });

Deno.serve(async (request) => {
  if (request.method !== "POST") return json({ error: "method_not_allowed" }, 405);
  const apiKey = Deno.env.get("NEBIUS_API_KEY");
  const baseUrl = Deno.env.get("NEBIUS_OPENAI_BASE_URL") || "https://api.tokenfactory.nebius.com/v1";
  const model = Deno.env.get("NEBIUS_MODEL") || "Qwen/Qwen3-32B";
  if (!apiKey) return json({ error: "nebius_not_configured" }, 503);
  const body = await request.json();
  const upstream = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model,
      temperature: 0,
      max_tokens: 160,
      messages: [
        { role: "system", content: "Return a terse plan for the frozen coding task. Do not claim tests ran." },
        { role: "user", content: `${body.task}\nAcceptance: ${body.acceptance}` },
      ],
    }),
  });
  if (!upstream.ok) return json({ error: "nebius_request_failed", status: upstream.status }, 502);
  const result = await upstream.json();
  return json({
    request_id: result.id,
    model: result.model || model,
    engine: baseUrl.includes("tokenfactory") ? "Token Factory" : "vLLM",
    output: result.choices?.[0]?.message?.content || null,
  });
});
