const bcrypt = require("bcryptjs");

const generarHashApiKey = async (apiKey) => {
  return await bcrypt.hash(String(apiKey), 10);
};

const compararApiKeyConHash = async (apiKey, hashGuardado) => {
  const hash = String(hashGuardado || "").trim();

  if (!hash) return false;

  return await bcrypt.compare(String(apiKey), hash);
};

module.exports = {
  generarHashApiKey,
  compararApiKeyConHash
};
