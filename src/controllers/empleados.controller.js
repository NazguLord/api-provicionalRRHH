const empleadosQueries = require("../queries/empleados.queries");

const obtenerPorCodigo = async (req, res) => {
  try {
    const { empCod } = req.params;

    const empleado = await empleadosQueries.obtenerPorCodigo(empCod);

    if (!empleado) {
      return res.status(404).json({
        ok: false,
        message: "Empleado no encontrado"
      });
    }

    res.json({
      ok: true,
      message: "Empleado obtenido correctamente",
      data: empleado
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al obtener el empleado",
      error: error.message
    });
  }
};

module.exports = {
  obtenerPorCodigo
};
