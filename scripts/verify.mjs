import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const required = [
  "index.html",
  "assets/app.css",
  "assets/app.js",
  "fixtures/lesson-manifest.json",
  "fixtures/engine-catalog.json",
  "schemas/agent-optimization-receipt.schema.json",
  "integrations/butterbase/schema.sql",
  "integrations/butterbase/live-receipt.json",
  "integrations/everos/proxy.ts",
  "integrations/nebius/proxy.ts",
];

for (const relative of required) await readFile(join(root, relative));
for (const jsonFile of ["fixtures/lesson-manifest.json", "fixtures/engine-catalog.json", "schemas/agent-optimization-receipt.schema.json"]) {
  JSON.parse(await readFile(join(root, jsonFile), "utf8"));
}

const sensitivePatterns = [/bb_sk_[A-Za-z0-9_-]+/g, /Bearer\s+[A-Za-z0-9._-]{24,}/g, /(?:API_KEY|AUTH_TOKEN)\s*=\s*["'][^"']{8,}["']/g];
const scan = async (directory) => {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const target = join(directory, entry.name);
    if (entry.isDirectory() && [".venv", "node_modules", "__pycache__"].includes(entry.name)) continue;
    if (entry.isDirectory()) await scan(target);
    if (!entry.isFile() || /\.png$|\.svg$/.test(target)) continue;
    const content = await readFile(target, "utf8");
    for (const pattern of sensitivePatterns) {
      pattern.lastIndex = 0;
      if (pattern.test(content)) throw new Error(`Potential secret in ${target}`);
    }
  }
};
await scan(root);
console.log(`Verified ${required.length} required artifacts, 3 JSON contracts, and a secret-safe static bundle.`);
