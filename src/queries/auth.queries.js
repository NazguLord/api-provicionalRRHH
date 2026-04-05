const { generarToken } = require("../utils/jwt");

const login = async (payload = {}) => {
  const username = String(
    payload.username ?? payload.usuario ?? payload.email ?? ""
  ).trim();
  const password = String(
    payload.password ?? payload.clave ?? payload.contrasena ?? ""
  );

  const expectedUsername = String(process.env.AUTH_USER || "").trim();
  const expectedPassword = String(process.env.AUTH_PASSWORD || "");

  if (!expectedUsername || !expectedPassword) {
    throw new Error(
      "AUTH_USER y AUTH_PASSWORD deben estar configurados en las variables de entorno"
    );
  }

  if (!username || !password) {
    const error = new Error("Usuario y password son requeridos");
    error.statusCode = 400;
    throw error;
  }

  if (username !== expectedUsername || password !== expectedPassword) {
    const error = new Error("Credenciales invalidas");
    error.statusCode = 401;
    throw error;
  }

  const usuario = {
    username: expectedUsername
  };

  const token = generarToken({
    sub: expectedUsername,
    username: expectedUsername
  });

  return {
    token,
    tokenType: "Bearer",
    usuario
  };
};

module.exports = {
  login
};
