const validarTokenBearer = (authorization = "") => {
  const expectedToken = String(process.env.AUTH_TOKEN || "").trim();

  if (!expectedToken) {
    const error = new Error("AUTH_TOKEN no esta configurado en el servidor");
    error.statusCode = 500;
    throw error;
  }

  if (!authorization.startsWith("Bearer ")) {
    const error = new Error("No autorizado. Debes enviar un token Bearer.");
    error.statusCode = 401;
    throw error;
  }

  const token = authorization.slice("Bearer ".length).trim();

  if (token !== expectedToken) {
    const error = new Error("Token invalido");
    error.statusCode = 401;
    throw error;
  }

  return {
    token
  };
};

const authMiddleware = (req, res, next) => {
  try {
    req.user = validarTokenBearer(req.headers.authorization || "");
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
