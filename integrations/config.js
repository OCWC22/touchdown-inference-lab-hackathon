// Safe checked-in defaults. Butterbase deployment replaces these with the
// public serverless function paths. Secret keys stay in function environment.
window.TOUCHDOWN_INTEGRATIONS = window.TOUCHDOWN_INTEGRATIONS || {
  butterbase: { appId: "app_b197i2548pk2" },
  everos: { proxyEndpoint: "/api/everos" },
  nebius: {},
};
