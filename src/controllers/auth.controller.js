const authQueries = require("../queries/auth.queries");

const login = async (req, res) => {
  const resultado = await authQueries.login(req.body);

  res.json({
    message: "Endpoint login base",
    data: resultado
  });
};

module.exports = {
  login
};
