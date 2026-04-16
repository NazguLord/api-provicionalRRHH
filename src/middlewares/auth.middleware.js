const { verificarToken } = require("../utils/jwt");

const validarTokenBearer = (authorization = "", headers = {}) => {
  const expectedToken = String(process.env.AUTH_TOKEN || "").trim();

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

  if (!expectedToken) {
    const error = new Error("AUTH_TOKEN no esta configurado en el servidor");
    error.statusCode = 500;
    throw error;
  }

  if (token !== expectedToken) {
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
    tokenLabel: "token_estatico"
  };
};

const authMiddleware = (req, res, next) => {
  try {
    req.user = validarTokenBearer(req.headers.authorization || "", req.headers);
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
