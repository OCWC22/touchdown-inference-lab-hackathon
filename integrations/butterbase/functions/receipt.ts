// Butterbase Deno serverless function. The static app calls this function,
// never Butterbase with a service credential from the browser.
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { "content-type": "application/json", "cache-control": "no-store" },
});

Deno.serve(async (request) => {
  if (request.method !== "POST") return json({ error: "method_not_allowed" }, 405);
  const body = await request.json();
  const required = ["receipt_id", "fixture_id", "evidence_state", "payload"];
  if (required.some((field) => body[field] == null)) return json({ error: "invalid_receipt" }, 400);

  // Bind this function to the optimization_receipts table with Butterbase MCP.
  // BB_RECEIPT_WRITE_URL is the generated row-insert endpoint, scoped server-side.
  const endpoint = Deno.env.get("BB_RECEIPT_WRITE_URL");
  const token = Deno.env.get("BB_RECEIPT_WRITE_TOKEN");
  if (!endpoint || !token) return json({ error: "butterbase_not_configured" }, 503);
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${token}`, "x-idempotency-key": body.receipt_id },
    body: JSON.stringify(body),
  });
  if (!response.ok) return json({ error: "butterbase_write_failed", status: response.status }, 502);
  const record = await response.json();
  return json({ id: record.id || body.receipt_id });
});
