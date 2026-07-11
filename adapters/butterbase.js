const QUEUE_KEY = "td-inference-lab:butterbase-queue";

function storage() {
  if (typeof localStorage !== "undefined") return localStorage;
  const memory = new Map();
  return { getItem: (key) => memory.get(key) || null, setItem: (key, value) => memory.set(key, value) };
}

function queueReceipt(receipt) {
  const store = storage();
  const queue = JSON.parse(store.getItem(QUEUE_KEY) || "[]");
  const receiptId = receipt.receipt_id || `TD-LOCAL-${receipt.workload?.fixture_id || "UNKNOWN"}`;
  const next = queue.filter((item) => item.receipt_id !== receiptId);
  next.push({ receipt_id: receiptId, queued_at: new Date().toISOString(), receipt });
  store.setItem(QUEUE_KEY, JSON.stringify(next));
  return receiptId;
}

export function createButterbaseAdapter(config = {}) {
  return {
    status() {
      return {
        evidence_state: config.receiptEndpoint || config.appId ? "configured" : "fixture_backed",
        app_id: config.appId || null,
      };
    },

    async persistReceipt(receipt) {
      if (!config.receiptEndpoint) {
        return {
          evidence_state: "fixture_backed",
          receipt_id: queueReceipt(receipt),
          persistence: "local_offline_queue",
          app_id: null,
        };
      }

      try {
        const response = await fetch(config.receiptEndpoint, {
          method: "POST",
          headers: { "content-type": "application/json", "x-idempotency-key": receipt.receipt_id },
          body: JSON.stringify({
            receipt_id: receipt.receipt_id,
            fixture_id: receipt.workload.fixture_id,
            evidence_state: receipt.claim_status,
            verification_passed: receipt.result.tests_passed,
            payload: receipt,
          }),
        });
        if (!response.ok) throw new Error(`Butterbase proxy returned ${response.status}`);
        const result = await response.json();
        if (!result.id) throw new Error("Butterbase proxy returned no persisted row ID");
        return { evidence_state: "live", receipt_id: result.id, persistence: "butterbase", app_id: config.appId || null };
      } catch (error) {
        return {
          evidence_state: "blocked",
          receipt_id: queueReceipt(receipt),
          persistence: "local_offline_queue",
          error: error.message,
        };
      }
    },
  };
}
