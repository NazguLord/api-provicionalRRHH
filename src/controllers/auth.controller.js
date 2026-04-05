const login = async (req, res) => {
  res.status(501).json({
    ok: false,
    message: "Login no habilitado en este momento. Usa el token configurado en el frontend."
  });
};

module.exports = {
  login
};
