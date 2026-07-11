const integrations = [
  ["Butterbase", ["BUTTERBASE_API_KEY", "BUTTERBASE_APP_ID"]],
  ["EverOS", ["EVERMIND_API_KEY", "EVEROS_API_KEY"]],
  ["Nebius", ["NEBIUS_API_KEY"]],
];

for (const [name, variables] of integrations) {
  const present = variables.filter((variable) => Boolean(process.env[variable]));
  console.log(`${name}: ${present.length ? `configured (${present.join(", ")})` : "blocked (no credential variables loaded)"}`);
}
console.log("No secret values were printed.");
