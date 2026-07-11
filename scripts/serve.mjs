import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const port = Number(process.env.PORT || 4173);
const EVEROS_BASE = "https://api.evermind.ai/api/v1";
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".svg": "image/svg+xml",
};

const readJson = (request) => new Promise((resolve, reject) => {
  const chunks = [];
  request.on("data", (chunk) => chunks.push(chunk));
  request.on("end", () => {
    try { resolve(JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}")); }
    catch (error) { reject(error); }
  });
  request.on("error", reject);
});

function sendJson(response, status, body) {
  response.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    "x-content-type-options": "nosniff",
  });
  response.end(JSON.stringify(body));
}

function normalizeMemories(payload) {
  const data = payload?.data || {};
  return [
    ...(data.agent_skills || []).map((item) => ({ ...item, memory_type: "agent_skill", content: item.content || item.description || item.name })),
    ...(data.agent_cases || []).map((item) => ({ ...item, memory_type: "agent_case", content: item.approach || item.task_intent })),
    ...(data.episodes || []).map((item) => ({ ...item, memory_type: "episodic_memory", content: item.episode || item.summary })),
    ...(data.profiles || []).map((item) => ({ ...item, memory_type: "profile", content: JSON.stringify(item.profile_data || {}) })),
  ];
}

async function callEverOS(path, apiKey, body) {
  const providerResponse = await fetch(`${EVEROS_BASE}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${apiKey}` },
    body: JSON.stringify(body),
  });
  const payload = await providerResponse.json().catch(() => ({}));
  if (!providerResponse.ok) {
    const error = new Error(payload?.detail || payload?.message || `EverOS returned ${providerResponse.status}`);
    error.status = providerResponse.status;
    throw error;
  }
  return payload;
}

async function handleEverOS(request, response) {
  if (request.method !== "POST") return sendJson(response, 405, { error: "method_not_allowed" });
  const apiKey = process.env.EVEROS_API_KEY || process.env.EVERMIND_API_KEY;
  if (!apiKey) return sendJson(response, 503, { error: "everos_not_configured" });
  const body = await readJson(request);

  if (body.action === "search") {
    const payload = await callEverOS("/memories/search", apiKey, {
      query: body.query,
      filters: { user_id: body.user_id },
      method: "hybrid",
      memory_types: body.memory_types || ["agent_memory", "episodic_memory", "profile"],
      top_k: body.top_k || 5,
    });
    return sendJson(response, 200, { memories: normalizeMemories(payload), provider_status: "live" });
  }

  if (body.action === "add_agent") {
    const now = Date.now();
    const messages = body.messages || [
      { role: "user", timestamp: now, content: "Optimize this verified coding-agent workload without weakening its acceptance test." },
      { role: "assistant", timestamp: now + 1, content: body.content },
    ];
    const payload = await callEverOS("/memories/agent", apiKey, {
      user_id: body.user_id,
      session_id: body.session_id,
      messages: messages.map((message, index) => ({ ...message, timestamp: message.timestamp || now + index })),
    });
    return sendJson(response, 200, { task_id: payload?.data?.task_id || null, status: payload?.data?.status || "accepted" });
  }

  if (body.action === "flush_agent") {
    const payload = await callEverOS("/memories/agent/flush", apiKey, { user_id: body.user_id, session_id: body.session_id });
    return sendJson(response, 200, { status: payload?.data?.status || "unknown" });
  }

  return sendJson(response, 400, { error: "unknown_action" });
}

createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, `http://${request.headers.host}`).pathname);
    if (pathname === "/api/everos") return await handleEverOS(request, response);
    const requested = pathname === "/" ? "index.html" : pathname.replace(/^\//, "");
    const safePath = normalize(requested).replace(/^(\.\.(\/|\\|$))+/, "");
    let target = join(root, safePath);
    if ((await stat(target)).isDirectory()) target = join(target, "index.html");
    const body = await readFile(target);
    response.writeHead(200, {
      "content-type": types[extname(target)] || "application/octet-stream",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
    });
    response.end(body);
  } catch (error) {
    if (request.url?.startsWith("/api/")) return sendJson(response, Number(error.status) || 500, { error: error.message || "integration_error" });
    response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    response.end("Not found");
  }
}).listen(port, "127.0.0.1", () => {
  console.log(`Touchdown Inference Lab: http://127.0.0.1:${port}`);
});
