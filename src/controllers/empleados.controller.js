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

const obtenerEstadoActualizacion = async (req, res) => {
  try {
    const { empCod, tipoEmpleado } = req.params;

    const estadoActualizacion =
      await empleadosQueries.obtenerEstadoActualizacionEmpleado(
        empCod,
        tipoEmpleado
      );

    res.json({
      ok: true,
      message: "Estado de actualizacion obtenido correctamente",
      data: estadoActualizacion
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al obtener el estado de actualizacion",
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

const actualizarGradoAcademico = async (req, res) => {
  try {
    const { empCod, idEmpleadoGradoAcademico } = req.params;
    const payload = req.body || {};

    const gradoAcademico =
      await empleadosQueries.actualizarGradoAcademicoEmpleado(
        empCod,
        Number(idEmpleadoGradoAcademico),
        payload,
        req.file || null
      );

    if (!gradoAcademico) {
      return res.status(404).json({
        ok: false,
        message: "Grado academico no encontrado"
      });
    }

    res.json({
      ok: true,
      message: "Grado academico actualizado correctamente",
      data: gradoAcademico
    });
  } catch (error) {
    const status = error.message.includes("no existe") ? 400 : 500;

    res.status(status).json({
      ok: false,
      message: "Error al actualizar el grado academico",
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

const listarExperienciasProfesionales = async (req, res) => {
  try {
    const { empCod } = req.params;

    const experiencias =
      await empleadosQueries.listarExperienciasProfesionalesEmpleado(empCod);

    if (!experiencias) {
      return res.status(404).json({
        ok: false,
        message: "Empleado no encontrado"
      });
    }

    res.json({
      ok: true,
      message: "Experiencias profesionales obtenidas correctamente",
      data: experiencias
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al obtener las experiencias profesionales",
      error: error.message
    });
  }
};

const crearExperienciaProfesional = async (req, res) => {
  try {
    const { empCod } = req.params;
    const payload = req.body || {};

    const experiencia =
      await empleadosQueries.crearExperienciaProfesionalEmpleado(
        empCod,
        payload
      );

    if (!experiencia) {
      return res.status(404).json({
        ok: false,
        message: "Empleado no encontrado"
      });
    }

    res.status(201).json({
      ok: true,
      message: "Experiencia profesional guardada correctamente",
      data: experiencia
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al guardar la experiencia profesional",
      error: error.message
    });
  }
};

const actualizarExperienciaProfesional = async (req, res) => {
  try {
    const { empCod, idEmpleadoExperienciaProfesional } = req.params;
    const payload = req.body || {};

    const experiencia =
      await empleadosQueries.actualizarExperienciaProfesionalEmpleado(
        empCod,
        Number(idEmpleadoExperienciaProfesional),
        payload
      );

    if (!experiencia) {
      return res.status(404).json({
        ok: false,
        message: "Experiencia profesional no encontrada"
      });
    }

    res.json({
      ok: true,
      message: "Experiencia profesional actualizada correctamente",
      data: experiencia
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al actualizar la experiencia profesional",
      error: error.message
    });
  }
};

const eliminarExperienciaProfesional = async (req, res) => {
  try {
    const { empCod, idEmpleadoExperienciaProfesional } = req.params;

    const eliminado =
      await empleadosQueries.eliminarExperienciaProfesionalEmpleado(
        empCod,
        Number(idEmpleadoExperienciaProfesional)
      );

    if (!eliminado) {
      return res.status(404).json({
        ok: false,
        message: "Experiencia profesional no encontrada"
      });
    }

    res.json({
      ok: true,
      message: "Experiencia profesional eliminada correctamente"
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al eliminar la experiencia profesional",
      error: error.message
    });
  }
};

const listarDiplomados = async (req, res) => {
  try {
    const { empCod } = req.params;

    const diplomados = await empleadosQueries.listarDiplomadosEmpleado(empCod);

    if (!diplomados) {
      return res.status(404).json({
        ok: false,
        message: "Empleado no encontrado"
      });
    }

    res.json({
      ok: true,
      message: "Diplomados obtenidos correctamente",
      data: diplomados
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al obtener los diplomados",
      error: error.message
    });
  }
};

const crearDiplomado = async (req, res) => {
  try {
    const { empCod } = req.params;
    const payload = req.body || {};

    const diplomado = await empleadosQueries.crearDiplomadoEmpleado(
      empCod,
      payload,
      req.file || null
    );

    if (!diplomado) {
      return res.status(404).json({
        ok: false,
        message: "Empleado no encontrado"
      });
    }

    res.status(201).json({
      ok: true,
      message: "Diplomado guardado correctamente",
      data: diplomado
    });
  } catch (error) {
    const status =
      error.message.includes("no existe") ||
      error.message.includes("Debes adjuntar")
        ? 400
        : 500;

    res.status(status).json({
      ok: false,
      message: "Error al guardar el diplomado",
      error: error.message
    });
  }
};

const actualizarDiplomado = async (req, res) => {
  try {
    const { empCod, idEmpleadoDiplomado } = req.params;
    const payload = req.body || {};

    const diplomado = await empleadosQueries.actualizarDiplomadoEmpleado(
      empCod,
      Number(idEmpleadoDiplomado),
      payload,
      req.file || null
    );

    if (!diplomado) {
      return res.status(404).json({
        ok: false,
        message: "Diplomado no encontrado"
      });
    }

    res.json({
      ok: true,
      message: "Diplomado actualizado correctamente",
      data: diplomado
    });
  } catch (error) {
    const status = error.message.includes("no existe") ? 400 : 500;

    res.status(status).json({
      ok: false,
      message: "Error al actualizar el diplomado",
      error: error.message
    });
  }
};

const eliminarDiplomado = async (req, res) => {
  try {
    const { empCod, idEmpleadoDiplomado } = req.params;

    const eliminado = await empleadosQueries.eliminarDiplomadoEmpleado(
      empCod,
      Number(idEmpleadoDiplomado)
    );

    if (!eliminado) {
      return res.status(404).json({
        ok: false,
        message: "Diplomado no encontrado"
      });
    }

    res.json({
      ok: true,
      message: "Diplomado eliminado correctamente"
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al eliminar el diplomado",
      error: error.message
    });
  }
};

const listarExperienciasDocentes = async (req, res) => {
  try {
    const { empCod } = req.params;

    const experienciasDocentes =
      await empleadosQueries.listarExperienciasDocentesEmpleado(empCod);

    if (!experienciasDocentes) {
      return res.status(404).json({
        ok: false,
        message: "Empleado no encontrado"
      });
    }

    res.json({
      ok: true,
      message: "Experiencias docentes obtenidas correctamente",
      data: experienciasDocentes
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al obtener las experiencias docentes",
      error: error.message
    });
  }
};

const crearExperienciaDocente = async (req, res) => {
  try {
    const { empCod } = req.params;
    const payload = req.body || {};

    const experienciaDocente =
      await empleadosQueries.crearExperienciaDocenteEmpleado(empCod, payload);

    if (!experienciaDocente) {
      return res.status(404).json({
        ok: false,
        message: "Empleado no encontrado"
      });
    }

    res.status(201).json({
      ok: true,
      message: "Experiencia docente guardada correctamente",
      data: experienciaDocente
    });
  } catch (error) {
    const status = error.message.includes("no existe") ? 400 : 500;

    res.status(status).json({
      ok: false,
      message: "Error al guardar la experiencia docente",
      error: error.message
    });
  }
};

const actualizarExperienciaDocente = async (req, res) => {
  try {
    const { empCod, idEmpleadoExperienciaDocente } = req.params;
    const payload = req.body || {};

    const experienciaDocente =
      await empleadosQueries.actualizarExperienciaDocenteEmpleado(
        empCod,
        Number(idEmpleadoExperienciaDocente),
        payload
      );

    if (!experienciaDocente) {
      return res.status(404).json({
        ok: false,
        message: "Experiencia docente no encontrada"
      });
    }

    res.json({
      ok: true,
      message: "Experiencia docente actualizada correctamente",
      data: experienciaDocente
    });
  } catch (error) {
    const status = error.message.includes("no existe") ? 400 : 500;

    res.status(status).json({
      ok: false,
      message: "Error al actualizar la experiencia docente",
      error: error.message
    });
  }
};

const eliminarExperienciaDocente = async (req, res) => {
  try {
    const { empCod, idEmpleadoExperienciaDocente } = req.params;

    const eliminado = await empleadosQueries.eliminarExperienciaDocenteEmpleado(
      empCod,
      Number(idEmpleadoExperienciaDocente)
    );

    if (!eliminado) {
      return res.status(404).json({
        ok: false,
        message: "Experiencia docente no encontrada"
      });
    }

    res.json({
      ok: true,
      message: "Experiencia docente eliminada correctamente"
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al eliminar la experiencia docente",
      error: error.message
    });
  }
};

const listarLogrosRelevantes = async (req, res) => {
  try {
    const { empCod } = req.params;

    const logrosRelevantes =
      await empleadosQueries.listarLogrosRelevantesEmpleado(empCod);

    if (!logrosRelevantes) {
      return res.status(404).json({
        ok: false,
        message: "Empleado no encontrado"
      });
    }

    res.json({
      ok: true,
      message: "Logros relevantes obtenidos correctamente",
      data: logrosRelevantes
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al obtener los logros relevantes",
      error: error.message
    });
  }
};

const crearLogroRelevante = async (req, res) => {
  try {
    const { empCod } = req.params;
    const payload = req.body || {};

    const logroRelevante = await empleadosQueries.crearLogroRelevanteEmpleado(
      empCod,
      payload,
      req.file || null
    );

    if (!logroRelevante) {
      return res.status(404).json({
        ok: false,
        message: "Empleado no encontrado"
      });
    }

    res.status(201).json({
      ok: true,
      message: "Logro relevante guardado correctamente",
      data: logroRelevante
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al guardar el logro relevante",
      error: error.message
    });
  }
};

const actualizarLogroRelevante = async (req, res) => {
  try {
    const { empCod, idEmpleadoLogroRelevante } = req.params;
    const payload = req.body || {};

    const logroRelevante =
      await empleadosQueries.actualizarLogroRelevanteEmpleado(
        empCod,
        Number(idEmpleadoLogroRelevante),
        payload,
        req.file || null
      );

    if (!logroRelevante) {
      return res.status(404).json({
        ok: false,
        message: "Logro relevante no encontrado"
      });
    }

    res.json({
      ok: true,
      message: "Logro relevante actualizado correctamente",
      data: logroRelevante
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al actualizar el logro relevante",
      error: error.message
    });
  }
};

const eliminarLogroRelevante = async (req, res) => {
  try {
    const { empCod, idEmpleadoLogroRelevante } = req.params;

    const eliminado = await empleadosQueries.eliminarLogroRelevanteEmpleado(
      empCod,
      Number(idEmpleadoLogroRelevante)
    );

    if (!eliminado) {
      return res.status(404).json({
        ok: false,
        message: "Logro relevante no encontrado"
      });
    }

    res.json({
      ok: true,
      message: "Logro relevante eliminado correctamente"
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al eliminar el logro relevante",
      error: error.message
    });
  }
};

const listarDiseniosCurriculares = async (req, res) => {
  try {
    const { empCod } = req.params;

    const diseniosCurriculares =
      await empleadosQueries.listarDiseniosCurricularesEmpleado(empCod);

    if (!diseniosCurriculares) {
      return res.status(404).json({
        ok: false,
        message: "Empleado no encontrado"
      });
    }

    res.json({
      ok: true,
      message: "Disenos curriculares obtenidos correctamente",
      data: diseniosCurriculares
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al obtener los disenos curriculares",
      error: error.message
    });
  }
};

const crearDisenioCurricular = async (req, res) => {
  try {
    const { empCod } = req.params;
    const payload = req.body || {};

    const disenioCurricular =
      await empleadosQueries.crearDisenioCurricularEmpleado(empCod, payload);

    if (!disenioCurricular) {
      return res.status(404).json({
        ok: false,
        message: "Empleado no encontrado"
      });
    }

    res.status(201).json({
      ok: true,
      message: "Diseno curricular guardado correctamente",
      data: disenioCurricular
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al guardar el diseno curricular",
      error: error.message
    });
  }
};

const actualizarDisenioCurricular = async (req, res) => {
  try {
    const { empCod, idEmpleadoDisenioCurricular } = req.params;
    const payload = req.body || {};

    const disenioCurricular =
      await empleadosQueries.actualizarDisenioCurricularEmpleado(
        empCod,
        Number(idEmpleadoDisenioCurricular),
        payload
      );

    if (!disenioCurricular) {
      return res.status(404).json({
        ok: false,
        message: "Diseno curricular no encontrado"
      });
    }

    res.json({
      ok: true,
      message: "Diseno curricular actualizado correctamente",
      data: disenioCurricular
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al actualizar el diseno curricular",
      error: error.message
    });
  }
};

const eliminarDisenioCurricular = async (req, res) => {
  try {
    const { empCod, idEmpleadoDisenioCurricular } = req.params;

    const eliminado = await empleadosQueries.eliminarDisenioCurricularEmpleado(
      empCod,
      Number(idEmpleadoDisenioCurricular)
    );

    if (!eliminado) {
      return res.status(404).json({
        ok: false,
        message: "Diseno curricular no encontrado"
      });
    }

    res.json({
      ok: true,
      message: "Diseno curricular eliminado correctamente"
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al eliminar el diseno curricular",
      error: error.message
    });
  }
};

const listarConocimientosClave = async (req, res) => {
  try {
    const { empCod } = req.params;

    const conocimientosClave =
      await empleadosQueries.listarConocimientosClaveEmpleado(empCod);

    if (!conocimientosClave) {
      return res.status(404).json({
        ok: false,
        message: "Empleado no encontrado"
      });
    }

    res.json({
      ok: true,
      message: "Conocimientos clave obtenidos correctamente",
      data: conocimientosClave
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al obtener los conocimientos clave",
      error: error.message
    });
  }
};

const crearConocimientoClave = async (req, res) => {
  try {
    const { empCod } = req.params;
    const payload = req.body || {};

    const conocimientoClave =
      await empleadosQueries.crearConocimientoClaveEmpleado(empCod, payload);

    if (!conocimientoClave) {
      return res.status(404).json({
        ok: false,
        message: "Empleado no encontrado"
      });
    }

    res.status(201).json({
      ok: true,
      message: "Conocimiento clave guardado correctamente",
      data: conocimientoClave
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al guardar el conocimiento clave",
      error: error.message
    });
  }
};

const actualizarConocimientoClave = async (req, res) => {
  try {
    const { empCod, idEmpleadoConocimientoClave } = req.params;
    const payload = req.body || {};

    const conocimientoClave =
      await empleadosQueries.actualizarConocimientoClaveEmpleado(
        empCod,
        Number(idEmpleadoConocimientoClave),
        payload
      );

    if (!conocimientoClave) {
      return res.status(404).json({
        ok: false,
        message: "Conocimiento clave no encontrado"
      });
    }

    res.json({
      ok: true,
      message: "Conocimiento clave actualizado correctamente",
      data: conocimientoClave
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al actualizar el conocimiento clave",
      error: error.message
    });
  }
};

const eliminarConocimientoClave = async (req, res) => {
  try {
    const { empCod, idEmpleadoConocimientoClave } = req.params;

    const eliminado = await empleadosQueries.eliminarConocimientoClaveEmpleado(
      empCod,
      Number(idEmpleadoConocimientoClave)
    );

    if (!eliminado) {
      return res.status(404).json({
        ok: false,
        message: "Conocimiento clave no encontrado"
      });
    }

    res.json({
      ok: true,
      message: "Conocimiento clave eliminado correctamente"
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al eliminar el conocimiento clave",
      error: error.message
    });
  }
};

const listarHabilidadesRelevantes = async (req, res) => {
  try {
    const { empCod } = req.params;

    const habilidadesRelevantes =
      await empleadosQueries.listarHabilidadesRelevantesEmpleado(empCod);

    if (!habilidadesRelevantes) {
      return res.status(404).json({
        ok: false,
        message: "Empleado no encontrado"
      });
    }

    res.json({
      ok: true,
      message: "Habilidades relevantes obtenidas correctamente",
      data: habilidadesRelevantes
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al obtener las habilidades relevantes",
      error: error.message
    });
  }
};

const crearHabilidadRelevante = async (req, res) => {
  try {
    const { empCod } = req.params;
    const payload = req.body || {};

    const habilidadRelevante =
      await empleadosQueries.crearHabilidadRelevanteEmpleado(empCod, payload);

    if (!habilidadRelevante) {
      return res.status(404).json({
        ok: false,
        message: "Empleado no encontrado"
      });
    }

    res.status(201).json({
      ok: true,
      message: "Habilidad relevante guardada correctamente",
      data: habilidadRelevante
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al guardar la habilidad relevante",
      error: error.message
    });
  }
};

const actualizarHabilidadRelevante = async (req, res) => {
  try {
    const { empCod, idEmpleadoHabilidadRelevante } = req.params;
    const payload = req.body || {};

    const habilidadRelevante =
      await empleadosQueries.actualizarHabilidadRelevanteEmpleado(
        empCod,
        Number(idEmpleadoHabilidadRelevante),
        payload
      );

    if (!habilidadRelevante) {
      return res.status(404).json({
        ok: false,
        message: "Habilidad relevante no encontrada"
      });
    }

    res.json({
      ok: true,
      message: "Habilidad relevante actualizada correctamente",
      data: habilidadRelevante
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al actualizar la habilidad relevante",
      error: error.message
    });
  }
};

const eliminarHabilidadRelevante = async (req, res) => {
  try {
    const { empCod, idEmpleadoHabilidadRelevante } = req.params;

    const eliminado = await empleadosQueries.eliminarHabilidadRelevanteEmpleado(
      empCod,
      Number(idEmpleadoHabilidadRelevante)
    );

    if (!eliminado) {
      return res.status(404).json({
        ok: false,
        message: "Habilidad relevante no encontrada"
      });
    }

    res.json({
      ok: true,
      message: "Habilidad relevante eliminada correctamente"
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al eliminar la habilidad relevante",
      error: error.message
    });
  }
};

const listarProyectosExperiencia = async (req, res) => {
  try {
    const { empCod } = req.params;

    const proyectosExperiencia =
      await empleadosQueries.listarProyectosExperienciaEmpleado(empCod);

    if (!proyectosExperiencia) {
      return res.status(404).json({
        ok: false,
        message: "Empleado no encontrado"
      });
    }

    res.json({
      ok: true,
      message: "Proyectos de experiencia obtenidos correctamente",
      data: proyectosExperiencia
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al obtener los proyectos de experiencia",
      error: error.message
    });
  }
};

const crearProyectoExperiencia = async (req, res) => {
  try {
    const { empCod } = req.params;
    const payload = req.body || {};

    const proyectoExperiencia =
      await empleadosQueries.crearProyectoExperienciaEmpleado(empCod, payload);

    if (!proyectoExperiencia) {
      return res.status(404).json({
        ok: false,
        message: "Empleado no encontrado"
      });
    }

    res.status(201).json({
      ok: true,
      message: "Proyecto de experiencia guardado correctamente",
      data: proyectoExperiencia
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al guardar el proyecto de experiencia",
      error: error.message
    });
  }
};

const actualizarProyectoExperiencia = async (req, res) => {
  try {
    const { empCod, idEmpleadoProyectoExperiencia } = req.params;
    const payload = req.body || {};

    const proyectoExperiencia =
      await empleadosQueries.actualizarProyectoExperienciaEmpleado(
        empCod,
        Number(idEmpleadoProyectoExperiencia),
        payload
      );

    if (!proyectoExperiencia) {
      return res.status(404).json({
        ok: false,
        message: "Proyecto de experiencia no encontrado"
      });
    }

    res.json({
      ok: true,
      message: "Proyecto de experiencia actualizado correctamente",
      data: proyectoExperiencia
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al actualizar el proyecto de experiencia",
      error: error.message
    });
  }
};

const eliminarProyectoExperiencia = async (req, res) => {
  try {
    const { empCod, idEmpleadoProyectoExperiencia } = req.params;

    const eliminado = await empleadosQueries.eliminarProyectoExperienciaEmpleado(
      empCod,
      Number(idEmpleadoProyectoExperiencia)
    );

    if (!eliminado) {
      return res.status(404).json({
        ok: false,
        message: "Proyecto de experiencia no encontrado"
      });
    }

    res.json({
      ok: true,
      message: "Proyecto de experiencia eliminado correctamente"
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al eliminar el proyecto de experiencia",
      error: error.message
    });
  }
};

module.exports = {
  obtenerPorCodigo,
  guardarInformacionPersonal,
  obtenerEstadoActualizacion,
  obtenerFormularioEmpleado,
  inicializarFormularioEmpleado,
  actualizarInformacionPersonal,
  subirDocumentoEmpleado,
  listarGradosAcademicos,
  crearGradoAcademico,
  actualizarGradoAcademico,
  eliminarGradoAcademico,
  listarExperienciasProfesionales,
  crearExperienciaProfesional,
  actualizarExperienciaProfesional,
  eliminarExperienciaProfesional,
  listarDiplomados,
  crearDiplomado,
  actualizarDiplomado,
  eliminarDiplomado,
  listarExperienciasDocentes,
  crearExperienciaDocente,
  actualizarExperienciaDocente,
  eliminarExperienciaDocente,
  listarLogrosRelevantes,
  crearLogroRelevante,
  actualizarLogroRelevante,
  eliminarLogroRelevante,
  listarDiseniosCurriculares,
  crearDisenioCurricular,
  actualizarDisenioCurricular,
  eliminarDisenioCurricular,
  listarConocimientosClave,
  crearConocimientoClave,
  actualizarConocimientoClave,
  eliminarConocimientoClave,
  listarHabilidadesRelevantes,
  crearHabilidadRelevante,
  actualizarHabilidadRelevante,
  eliminarHabilidadRelevante,
  listarProyectosExperiencia,
  crearProyectoExperiencia,
  actualizarProyectoExperiencia,
  eliminarProyectoExperiencia
};
