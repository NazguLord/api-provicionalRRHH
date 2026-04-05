const crypto = require("crypto");

const TOKEN_EXPIRATION_SECONDS = 60 * 60 * 8;

const toBase64Url = (value) => {
  return Buffer.from(value)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
};

const fromBase64Url = (value) => {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padding = normalized.length % 4;
  const padded =
    padding === 0 ? normalized : normalized + "=".repeat(4 - padding);

  return Buffer.from(padded, "base64").toString("utf8");
};

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET no esta configurado");
  }

  return secret;
};

const firmar = (contenido) => {
  return crypto
    .createHmac("sha256", getJwtSecret())
    .update(contenido)
    .digest("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
};

const generarToken = (payload) => {
  const header = {
    alg: "HS256",
    typ: "JWT"
  };

  const ahora = Math.floor(Date.now() / 1000);
  const body = {
    ...payload,
    iat: ahora,
    exp: ahora + TOKEN_EXPIRATION_SECONDS
  };

  const encodedHeader = toBase64Url(JSON.stringify(header));
  const encodedPayload = toBase64Url(JSON.stringify(body));
  const contenido = `${encodedHeader}.${encodedPayload}`;
  const signature = firmar(contenido);

  return `${contenido}.${signature}`;
};

const verificarToken = (token) => {
  if (!token || typeof token !== "string") {
    throw new Error("Token no proporcionado");
  }

  const partes = token.split(".");

  if (partes.length !== 3) {
    throw new Error("Token invalido");
  }

  const [encodedHeader, encodedPayload, signature] = partes;
  const contenido = `${encodedHeader}.${encodedPayload}`;
  const signatureEsperada = firmar(contenido);

  if (signature !== signatureEsperada) {
    throw new Error("Firma del token invalida");
  }

  const payload = JSON.parse(fromBase64Url(encodedPayload));

  if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) {
    throw new Error("Token expirado");
  }

  return payload;
};

module.exports = {
  generarToken,
  verificarToken
};
