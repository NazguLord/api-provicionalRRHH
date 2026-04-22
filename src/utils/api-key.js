const crypto = require("crypto");

const generarHashApiKey = (apiKey) => {
  return crypto.createHash("sha256").update(String(apiKey)).digest("hex");
};

const compararApiKeyConHash = (apiKey, hashGuardado) => {
  const hashCalculado = generarHashApiKey(apiKey);
  const hashNormalizado = String(hashGuardado || "").trim().toLowerCase();

  if (!/^[a-f0-9]{64}$/.test(hashNormalizado)) {
    return false;
  }

  return crypto.timingSafeEqual(
    Buffer.from(hashCalculado, "hex"),
    Buffer.from(hashNormalizado, "hex")
  );
};

module.exports = {
  generarHashApiKey,
  compararApiKeyConHash
};
