const catalogosQueries = require("../queries/catalogos.queries");

const listarTiposSangre = async (req, res) => {
  try {
    const tiposSangre = await catalogosQueries.listarTiposSangre();

    res.json({
      ok: true,
      message: "Tipos de sangre obtenidos correctamente",
      data: tiposSangre
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al obtener los tipos de sangre",
      error: error.message
    });
  }
};

const listarEstadosCiviles = async (req, res) => {
  try {
    const estadosCiviles = await catalogosQueries.listarEstadosCiviles();

    res.json({
      ok: true,
      message: "Estados civiles obtenidos correctamente",
      data: estadosCiviles
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al obtener los estados civiles",
      error: error.message
    });
  }
};

const obtenerTipoEmpleadoPorCodigo = async (req, res) => {
  try {
    const { empCod } = req.params;

    const tipoEmpleado = await catalogosQueries.obtenerTipoEmpleadoPorCodigo(
      empCod
    );

    if (!tipoEmpleado) {
      return res.status(404).json({
        ok: false,
        message: "Empleado no encontrado"
      });
    }

    res.json({
      ok: true,
      message: "Tipo de empleado obtenido correctamente",
      data: tipoEmpleado
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al obtener el tipo de empleado",
      error: error.message
    });
  }
};

const listarIdiomas = async (req, res) => {
  try {
    const idiomas = await catalogosQueries.listarIdiomas();

    res.json({
      ok: true,
      message: "Idiomas obtenidos correctamente",
      data: idiomas
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al obtener los idiomas",
      error: error.message
    });
  }
};

const listarNivelesIdioma = async (req, res) => {
  try {
    const nivelesIdioma = await catalogosQueries.listarNivelesIdioma();

    res.json({
      ok: true,
      message: "Niveles de idioma obtenidos correctamente",
      data: nivelesIdioma
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al obtener los niveles de idioma",
      error: error.message
    });
  }
};

const listarGradosAcademicos = async (req, res) => {
  try {
    const gradosAcademicos = await catalogosQueries.listarGradosAcademicos();

    res.json({
      ok: true,
      message: "Grados academicos obtenidos correctamente",
      data: gradosAcademicos
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al obtener los grados academicos",
      error: error.message
    });
  }
};

const listarEstadosAcademicos = async (req, res) => {
  try {
    const estadosAcademicos = await catalogosQueries.listarEstadosAcademicos();

    res.json({
      ok: true,
      message: "Estados academicos obtenidos correctamente",
      data: estadosAcademicos
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al obtener los estados academicos",
      error: error.message
    });
  }
};

const listarTiposDiplomado = async (req, res) => {
  try {
    const tiposDiplomado = await catalogosQueries.listarTiposDiplomado();

    res.json({
      ok: true,
      message: "Tipos de diplomado obtenidos correctamente",
      data: tiposDiplomado
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al obtener los tipos de diplomado",
      error: error.message
    });
  }
};

const listarNivelesExperienciaDocente = async (req, res) => {
  try {
    const nivelesExperienciaDocente =
      await catalogosQueries.listarNivelesExperienciaDocente();

    res.json({
      ok: true,
      message: "Niveles de experiencia docente obtenidos correctamente",
      data: nivelesExperienciaDocente
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al obtener los niveles de experiencia docente",
      error: error.message
    });
  }
};

module.exports = {
  listarTiposSangre,
  listarEstadosCiviles,
  obtenerTipoEmpleadoPorCodigo,
  listarIdiomas,
  listarNivelesIdioma,
  listarGradosAcademicos,
  listarEstadosAcademicos,
  listarTiposDiplomado,
  listarNivelesExperienciaDocente
};
