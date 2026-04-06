const crypto = require("crypto");

const FILE_URL_EXPIRATION_SECONDS = 60 * 10;

const getFileAccessSecret = () => {
  return (
    process.env.FILE_URL_SECRET ||
    process.env.JWT_SECRET ||
    process.env.AUTH_TOKEN ||
    "file-access-secret"
  );
};

const sign = (value) => {
  return crypto
    .createHmac("sha256", getFileAccessSecret())
    .update(value)
    .digest("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
};

const firmarAccesoArchivo = (rutaPublica) => {
  const expires = Math.floor(Date.now() / 1000) + FILE_URL_EXPIRATION_SECONDS;

  return {
    expires,
    signature: sign(`${rutaPublica}:${expires}`)
  };
};

const verificarAccesoArchivo = ({ rutaPublica, expires, signature }) => {
  const expiresNumber = Number(expires);

  if (!rutaPublica || !signature || !Number.isFinite(expiresNumber)) {
    return false;
  }

  if (expiresNumber < Math.floor(Date.now() / 1000)) {
    return false;
  }

  return signature === sign(`${rutaPublica}:${expiresNumber}`);
};

module.exports = {
  firmarAccesoArchivo,
  verificarAccesoArchivo
};
