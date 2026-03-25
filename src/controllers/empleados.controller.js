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

const guardarInformacionPersonal = async (req, res) => {
  try {
    const { empCod } = req.params;
    const payload = req.body || {};

    const empleadoLegacy = await empleadosQueries.obtenerPorCodigo(empCod);

    if (!empleadoLegacy) {
      return res.status(404).json({
        ok: false,
        message: "Empleado no encontrado en la base anterior"
      });
    }

    const empleadoGuardado =
      await empleadosQueries.guardarInformacionPersonalDesdeLegacy(
        empCod,
        payload
      );

    res.status(201).json({
      ok: true,
      message: "Informacion personal guardada correctamente",
      data: empleadoGuardado
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al guardar la informacion personal",
      error: error.message
    });
  }
};

const obtenerFormularioEmpleado = async (req, res) => {
  try {
    const { empCod } = req.params;

    const formulario = await empleadosQueries.obtenerFormularioEmpleado(empCod);

    if (!formulario) {
      return res.status(404).json({
        ok: false,
        message: "Empleado no encontrado"
      });
    }

    res.json({
      ok: true,
      message: "Formulario obtenido correctamente",
      data: formulario
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al obtener el formulario del empleado",
      error: error.message
    });
  }
};

const inicializarFormularioEmpleado = async (req, res) => {
  try {
    const { empCod } = req.params;
    const payload = req.body || {};

    const empleadoLegacy = await empleadosQueries.obtenerPorCodigo(empCod);

    if (!empleadoLegacy) {
      return res.status(404).json({
        ok: false,
        message: "Empleado no encontrado en la base anterior"
      });
    }

    const resultado = await empleadosQueries.inicializarEmpleadoDesdeLegacy(
      empCod,
      payload
    );

    res.status(resultado.yaExistia ? 200 : 201).json({
      ok: true,
      message: resultado.yaExistia
        ? "El formulario ya estaba inicializado"
        : "Formulario inicializado correctamente",
      data: resultado.data
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al inicializar el formulario del empleado",
      error: error.message
    });
  }
};

const actualizarInformacionPersonal = async (req, res) => {
  try {
    const { empCod } = req.params;
    const payload = req.body || {};

    const empleadoActualizado =
      await empleadosQueries.actualizarInformacionPersonal(empCod, payload);

    if (!empleadoActualizado) {
      return res.status(404).json({
        ok: false,
        message: "Empleado no encontrado"
      });
    }

    res.json({
      ok: true,
      message: "Informacion personal actualizada correctamente",
      data: empleadoActualizado
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al actualizar la informacion personal",
      error: error.message
    });
  }
};

const subirDocumentoEmpleado = async (req, res) => {
  try {
    const { empCod, tipoDocumento } = req.params;

    if (!req.file) {
      return res.status(400).json({
        ok: false,
        message: "Debes adjuntar un archivo en el campo 'archivo'"
      });
    }

    const empleadoActualizado = await empleadosQueries.actualizarDocumentoEmpleado(
      empCod,
      tipoDocumento,
      req.file
    );

    if (!empleadoActualizado) {
      return res.status(404).json({
        ok: false,
        message: "Empleado no encontrado"
      });
    }

    res.status(201).json({
      ok: true,
      message: "Documento cargado correctamente",
      data: empleadoActualizado
    });
  } catch (error) {
    const status = error.message.includes("Tipo de documento")
      ? 400
      : 500;

    res.status(status).json({
      ok: false,
      message: "Error al cargar el documento",
      error: error.message
    });
  }
};

const listarGradosAcademicos = async (req, res) => {
  try {
    const { empCod } = req.params;

    const gradosAcademicos =
      await empleadosQueries.listarGradosAcademicosEmpleado(empCod);

    if (!gradosAcademicos) {
      return res.status(404).json({
        ok: false,
        message: "Empleado no encontrado"
      });
    }

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

const crearGradoAcademico = async (req, res) => {
  try {
    const { empCod } = req.params;
    const payload = req.body || {};

    const gradoAcademico = await empleadosQueries.crearGradoAcademicoEmpleado(
      empCod,
      payload,
      req.file || null
    );

    if (!gradoAcademico) {
      return res.status(404).json({
        ok: false,
        message: "Empleado no encontrado"
      });
    }

    res.status(201).json({
      ok: true,
      message: "Grado academico guardado correctamente",
      data: gradoAcademico
    });
  } catch (error) {
    const status = error.message.includes("no existe") ? 400 : 500;

    res.status(status).json({
      ok: false,
      message: "Error al guardar el grado academico",
      error: error.message
    });
  }
};

const eliminarGradoAcademico = async (req, res) => {
  try {
    const { empCod, idEmpleadoGradoAcademico } = req.params;

    const eliminado = await empleadosQueries.eliminarGradoAcademicoEmpleado(
      empCod,
      Number(idEmpleadoGradoAcademico)
    );

    if (!eliminado) {
      return res.status(404).json({
        ok: false,
        message: "Grado academico no encontrado"
      });
    }

    res.json({
      ok: true,
      message: "Grado academico eliminado correctamente"
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al eliminar el grado academico",
      error: error.message
    });
  }
};

module.exports = {
  obtenerPorCodigo,
  guardarInformacionPersonal,
  obtenerFormularioEmpleado,
  inicializarFormularioEmpleado,
  actualizarInformacionPersonal,
  subirDocumentoEmpleado,
  listarGradosAcademicos,
  crearGradoAcademico,
  eliminarGradoAcademico
};
