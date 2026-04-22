const { verificarToken } = require("../utils/jwt");
const { obtenerApiKeySistema } = require("../queries/api-keys.queries");
const { compararApiKeyConHash } = require("../utils/api-key");

const obtenerTokenApiSistema = async () => {
  const sistema = String(
    process.env.AUTH_TOKEN_SISTEMA ||
      process.env.API_KEY_SISTEMA ||
      "api-provicionalRRHH"
  ).trim();

  if (!sistema) {
    const error = new Error("AUTH_TOKEN_SISTEMA no esta configurado en el servidor");
    error.statusCode = 500;
    throw error;
  }

  const apiKeySistema = await obtenerApiKeySistema(sistema);

  if (!apiKeySistema?.api_key) {
    const error = new Error(
      `No hay api_key activa configurada para el sistema ${sistema}`
    );
    error.statusCode = 500;
    throw error;
  }

  return {
    sistema: apiKeySistema.sistema,
    hash: String(apiKeySistema.api_key).trim()
  };
};

const validarTokenBearer = async (authorization = "", headers = {}) => {

  if (!authorization.startsWith("Bearer ")) {
    const error = new Error("No autorizado. Debes enviar un token Bearer.");
    error.statusCode = 401;
    throw error;
  }

  const token = authorization.slice("Bearer ".length).trim();

  if (token.includes(".")) {
    try {
      const payload = verificarToken(token);

      return {
        token,
        authType: "jwt",
        sub: payload.sub || null,
        username: payload.username || payload.usuario || payload.sub || null,
        displayName:
          payload.name || payload.nombre || payload.username || payload.sub || null,
        email: payload.email || null
      };
    } catch (error) {
      error.statusCode = 401;
      throw error;
    }
  }

  const expectedToken = await obtenerTokenApiSistema();

  if (!expectedToken.hash) {
    const error = new Error(
      "api_key activa esta vacia en uch-registro.apiKeySistemas"
    );
    error.statusCode = 500;
    throw error;
  }

  if (!compararApiKeyConHash(token, expectedToken.hash)) {
    const error = new Error("Token invalido");
    error.statusCode = 401;
    throw error;
  }

  return {
    token,
    authType: "static",
    username:
      String(headers["x-auth-user"] || headers["x-user-name"] || "").trim() ||
      "token_estatico",
    displayName:
      String(headers["x-auth-name"] || headers["x-user-display-name"] || "").trim() ||
      null,
    email: String(headers["x-auth-email"] || "").trim() || null,
    tokenLabel: expectedToken.sistema
  };
};

const authMiddleware = async (req, res, next) => {
  try {
    req.user = await validarTokenBearer(req.headers.authorization || "", req.headers);
    next();
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      ok: false,
      message: error.message
    });
  }
};

module.exports = authMiddleware;
module.exports.validarTokenBearer = validarTokenBearer;
