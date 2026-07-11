import test from "node:test";
import assert from "node:assert/strict";
import { retry as baselineRetry } from "../baseline/retry.mjs";
import { retry as optimizedRetry } from "../optimized/retry.mjs";

test("the frozen baseline reproduces shared retry-state corruption", async () => {
  const first = await baselineRetry(async () => "first", { attempts: 3 });
  assert.equal(first, "first");
  let calls = 0;
  await assert.rejects(
    baselineRetry(async () => {
      calls += 1;
      if (calls < 3) throw new Error("transient");
      return "second";
    }, { attempts: 3 }),
    /transient/,
  );
  assert.equal(calls, 2);
});

test("the optimized implementation isolates attempt state per call", async () => {
  assert.equal(await optimizedRetry(async () => "first", { attempts: 3 }), "first");
  let calls = 0;
  const result = await optimizedRetry(async () => {
    calls += 1;
    if (calls < 3) throw new Error("transient");
    return "second";
  }, { attempts: 3 });
  assert.equal(result, "second");
  assert.equal(calls, 3);
});

test("the public API shape remains stable", () => {
  assert.equal(baselineRetry.length, optimizedRetry.length);
});
