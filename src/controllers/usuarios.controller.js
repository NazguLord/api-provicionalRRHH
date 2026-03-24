const usuariosQueries = require("../queries/usuarios.queries");

const listar = async (req, res) => {
  const usuarios = await usuariosQueries.listar();

  res.json({
    message: "Listado base de usuarios",
    data: usuarios
  });
};

module.exports = {
  listar
};
