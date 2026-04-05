const authMiddleware = (req, res, next) => {
  const authorization = req.headers.authorization || "";
  const expectedToken = String(process.env.AUTH_TOKEN || "").trim();

  if (!expectedToken) {
    return res.status(500).json({
      ok: false,
      message: "AUTH_TOKEN no esta configurado en el servidor"
    });
  }

  if (!authorization.startsWith("Bearer ")) {
    return res.status(401).json({
      ok: false,
      message: "No autorizado. Debes enviar un token Bearer."
    });
  }

  const token = authorization.slice("Bearer ".length).trim();

  if (token !== expectedToken) {
    return res.status(401).json({
      ok: false,
      message: "Token invalido"
    });
  }

  req.user = {
    token
  };

  next();
};

module.exports = authMiddleware;
