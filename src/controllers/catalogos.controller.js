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

const listarGeneros = async (req, res) => {
  try {
    const generos = await catalogosQueries.listarGeneros();

    res.json({
      ok: true,
      message: "Generos obtenidos correctamente",
      data: generos
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al obtener los generos",
      error: error.message
    });
  }
};

const listarTiposEmpleado = async (req, res) => {
  try {
    const tiposEmpleado = await catalogosQueries.listarTiposEmpleado();

    res.json({
      ok: true,
      message: "Tipos de empleado obtenidos correctamente",
      data: tiposEmpleado
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al obtener los tipos de empleado",
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

const listarMetodologiasActivas = async (req, res) => {
  try {
    const metodologiasActivas =
      await catalogosQueries.listarMetodologiasActivas();

    res.json({
      ok: true,
      message: "Metodologias activas obtenidas correctamente",
      data: metodologiasActivas
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al obtener las metodologias activas",
      error: error.message
    });
  }
};

const listarPlataformasVirtualesEducativas = async (req, res) => {
  try {
    const plataformasVirtualesEducativas =
      await catalogosQueries.listarPlataformasVirtualesEducativas();

    res.json({
      ok: true,
      message: "Plataformas virtuales educativas obtenidas correctamente",
      data: plataformasVirtualesEducativas
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al obtener las plataformas virtuales educativas",
      error: error.message
    });
  }
};

const listarCampus = async (req, res) => {
  try {
    const campus = await catalogosQueries.listarCampus();

    res.json({
      ok: true,
      message: "Campus obtenidos correctamente",
      data: campus
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al obtener los campus",
      error: error.message
    });
  }
};

const listarUniversidades = async (req, res) => {
  try {
    const universidades = await catalogosQueries.listarUniversidades();

    res.json({
      ok: true,
      message: "Universidades obtenidas correctamente",
      data: universidades
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al obtener las universidades",
      error: error.message
    });
  }
};

const listarAreasInteresDocencia = async (req, res) => {
  try {
    const areasInteresDocencia =
      await catalogosQueries.listarAreasInteresDocencia();

    res.json({
      ok: true,
      message: "Areas de interes para docencia obtenidas correctamente",
      data: areasInteresDocencia
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al obtener las areas de interes para docencia",
      error: error.message
    });
  }
};

module.exports = {
  listarTiposSangre,
  listarEstadosCiviles,
  listarGeneros,
  listarTiposEmpleado,
  obtenerTipoEmpleadoPorCodigo,
  listarIdiomas,
  listarNivelesIdioma,
  listarGradosAcademicos,
  listarEstadosAcademicos,
  listarTiposDiplomado,
  listarNivelesExperienciaDocente,
  listarMetodologiasActivas,
  listarPlataformasVirtualesEducativas,
  listarCampus,
  listarUniversidades,
  listarAreasInteresDocencia
};
