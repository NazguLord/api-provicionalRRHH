const empleadosQueries = require("../queries/empleados.queries");

const construirUrlArchivo = (req, ruta) => {
  if (!ruta) {
    return null;
  }

  return `${req.protocol}://${req.get("host")}${ruta}`;
};

const mapearArchivo = (req, nombre, ruta, extra = {}) => {
  if (!ruta) {
    return null;
  }

  return {
    nombre,
    ruta,
    url: construirUrlArchivo(req, ruta),
    ...extra
  };
};

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

const listarColaboradores = async (req, res) => {
  try {
    const { page, limit, search } = req.query;

    const resultado = await empleadosQueries.listarColaboradores({
      page,
      limit,
      search
    });

    res.json({
      ok: true,
      message: "Colaboradores obtenidos correctamente",
      data: resultado.data,
      pagination: resultado.pagination
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al obtener el listado de colaboradores",
      error: error.message
    });
  }
};

const listarColaboradoresCompletos = async (req, res) => {
  try {
    const { search } = req.query;

    const data = await empleadosQueries.listarColaboradoresCompletos({
      search
    });

    res.json({
      ok: true,
      message: "Colaboradores completos obtenidos correctamente",
      data,
      total: data.length
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al obtener el listado completo de colaboradores",
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

const obtenerExpedienteEmpleado = async (req, res) => {
  try {
    const { empCod } = req.params;

    const [
      informacionPersonal,
      gradosAcademicos,
      experienciasProfesionales,
      diplomados,
      experienciasDocentes,
      logrosRelevantes,
      diseniosCurriculares,
      conocimientosClave,
      habilidadesRelevantes,
      proyectosExperiencia,
      experienciasSectorProductivo,
      vinculosIndustria,
      idiomas,
      competenciasDigitales,
      metodologiasActivas,
      plataformasVirtuales,
      preferenciasDocencia
    ] = await Promise.all([
      empleadosQueries.obtenerFormularioEmpleado(empCod),
      empleadosQueries.listarGradosAcademicosEmpleado(empCod),
      empleadosQueries.listarExperienciasProfesionalesEmpleado(empCod),
      empleadosQueries.listarDiplomadosEmpleado(empCod),
      empleadosQueries.listarExperienciasDocentesEmpleado(empCod),
      empleadosQueries.listarLogrosRelevantesEmpleado(empCod),
      empleadosQueries.listarDiseniosCurricularesEmpleado(empCod),
      empleadosQueries.listarConocimientosClaveEmpleado(empCod),
      empleadosQueries.listarHabilidadesRelevantesEmpleado(empCod),
      empleadosQueries.listarProyectosExperienciaEmpleado(empCod),
      empleadosQueries.listarExperienciasSectorProductivoEmpleado(empCod),
      empleadosQueries.listarVinculosIndustriaEmpleado(empCod),
      empleadosQueries.listarIdiomasEmpleado(empCod),
      empleadosQueries.listarCompetenciasDigitalesEmpleado(empCod),
      empleadosQueries.listarMetodologiasActivasEmpleado(empCod),
      empleadosQueries.listarPlataformasVirtualesEmpleado(empCod),
      empleadosQueries.listarPreferenciasDocenciaEmpleado(empCod)
    ]);

    if (!informacionPersonal) {
      return res.status(404).json({
        ok: false,
        message: "Empleado no encontrado"
      });
    }

    const archivos = [
      mapearArchivo(
        req,
        "imagenPerfil",
        informacionPersonal.RutaImagenPerfil
      ),
      mapearArchivo(req, "hojaVida", informacionPersonal.RutaHojaVida),
      mapearArchivo(
        req,
        "documentoIdentidad",
        informacionPersonal.RutaDocumentoIdentidad
      ),
      mapearArchivo(
        req,
        "documentoColegiacion",
        informacionPersonal.RutaDocumentoColegiacion
      ),
      ...(gradosAcademicos || []).flatMap((item) =>
        item.RutaDocumentoAdjunto
          ? [
              mapearArchivo(req, "gradoAcademicoAdjunto", item.RutaDocumentoAdjunto, {
                id: item.IdEmpleadoGradoAcademico,
                titulo: item.Titulo ?? null
              })
            ]
          : []
      ),
      ...(diplomados || []).flatMap((item) =>
        item.RutaDocumentoAdjunto
          ? [
              mapearArchivo(req, "diplomadoAdjunto", item.RutaDocumentoAdjunto, {
                id: item.IdEmpleadoDiplomado,
                titulo: item.NombreDiplomado ?? null
              })
            ]
          : []
      ),
      ...(logrosRelevantes || []).flatMap((item) =>
        item.RutaDocumentoAdjunto
          ? [
              mapearArchivo(req, "logroRelevanteAdjunto", item.RutaDocumentoAdjunto, {
                id: item.IdEmpleadoLogroRelevante,
                titulo: item.LogroRelevante ?? null
              })
            ]
          : []
      )
    ].filter(Boolean);

    res.json({
      ok: true,
      message: "Expediente del empleado obtenido correctamente",
      data: {
        informacionPersonal,
        gradosAcademicos: gradosAcademicos || [],
        experienciasProfesionales: experienciasProfesionales || [],
        diplomados: diplomados || [],
        experienciasDocentes: experienciasDocentes || [],
        logrosRelevantes: logrosRelevantes || [],
        diseniosCurriculares: diseniosCurriculares || [],
        conocimientosClave: conocimientosClave || [],
        habilidadesRelevantes: habilidadesRelevantes || [],
        proyectosExperiencia: proyectosExperiencia || [],
        experienciasSectorProductivo: experienciasSectorProductivo || [],
        vinculosIndustria: vinculosIndustria || [],
        idiomas: idiomas || [],
        competenciasDigitales: competenciasDigitales || [],
        metodologiasActivas: metodologiasActivas || [],
        plataformasVirtuales: plataformasVirtuales || [],
        preferenciasDocencia: preferenciasDocencia || [],
        archivos
      }
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al obtener el expediente del empleado",
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

const listarExperienciasSectorProductivo = async (req, res) => {
  try {
    const { empCod } = req.params;

    const experienciasSectorProductivo =
      await empleadosQueries.listarExperienciasSectorProductivoEmpleado(empCod);

    if (!experienciasSectorProductivo) {
      return res.status(404).json({
        ok: false,
        message: "Empleado no encontrado"
      });
    }

    res.json({
      ok: true,
      message: "Experiencias del sector productivo obtenidas correctamente",
      data: experienciasSectorProductivo
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al obtener las experiencias del sector productivo",
      error: error.message
    });
  }
};

const crearExperienciaSectorProductivo = async (req, res) => {
  try {
    const { empCod } = req.params;
    const payload = req.body || {};

    const experienciaSectorProductivo =
      await empleadosQueries.crearExperienciaSectorProductivoEmpleado(
        empCod,
        payload
      );

    if (!experienciaSectorProductivo) {
      return res.status(404).json({
        ok: false,
        message: "Empleado no encontrado"
      });
    }

    res.status(201).json({
      ok: true,
      message: "Experiencia del sector productivo guardada correctamente",
      data: experienciaSectorProductivo
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al guardar la experiencia del sector productivo",
      error: error.message
    });
  }
};

const actualizarExperienciaSectorProductivo = async (req, res) => {
  try {
    const { empCod, idEmpleadoExperienciaSectorProductivo } = req.params;
    const payload = req.body || {};

    const experienciaSectorProductivo =
      await empleadosQueries.actualizarExperienciaSectorProductivoEmpleado(
        empCod,
        Number(idEmpleadoExperienciaSectorProductivo),
        payload
      );

    if (!experienciaSectorProductivo) {
      return res.status(404).json({
        ok: false,
        message: "Experiencia del sector productivo no encontrada"
      });
    }

    res.json({
      ok: true,
      message: "Experiencia del sector productivo actualizada correctamente",
      data: experienciaSectorProductivo
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al actualizar la experiencia del sector productivo",
      error: error.message
    });
  }
};

const eliminarExperienciaSectorProductivo = async (req, res) => {
  try {
    const { empCod, idEmpleadoExperienciaSectorProductivo } = req.params;

    const eliminado =
      await empleadosQueries.eliminarExperienciaSectorProductivoEmpleado(
        empCod,
        Number(idEmpleadoExperienciaSectorProductivo)
      );

    if (!eliminado) {
      return res.status(404).json({
        ok: false,
        message: "Experiencia del sector productivo no encontrada"
      });
    }

    res.json({
      ok: true,
      message: "Experiencia del sector productivo eliminada correctamente"
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al eliminar la experiencia del sector productivo",
      error: error.message
    });
  }
};

const listarVinculosIndustria = async (req, res) => {
  try {
    const { empCod } = req.params;

    const vinculosIndustria =
      await empleadosQueries.listarVinculosIndustriaEmpleado(empCod);

    if (!vinculosIndustria) {
      return res.status(404).json({
        ok: false,
        message: "Empleado no encontrado"
      });
    }

    res.json({
      ok: true,
      message: "Vinculos con la industria obtenidos correctamente",
      data: vinculosIndustria
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al obtener los vinculos con la industria",
      error: error.message
    });
  }
};

const crearVinculoIndustria = async (req, res) => {
  try {
    const { empCod } = req.params;
    const payload = req.body || {};

    const vinculoIndustria =
      await empleadosQueries.crearVinculoIndustriaEmpleado(empCod, payload);

    if (!vinculoIndustria) {
      return res.status(404).json({
        ok: false,
        message: "Empleado no encontrado"
      });
    }

    res.status(201).json({
      ok: true,
      message: "Vinculo con la industria guardado correctamente",
      data: vinculoIndustria
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al guardar el vinculo con la industria",
      error: error.message
    });
  }
};

const actualizarVinculoIndustria = async (req, res) => {
  try {
    const { empCod, idEmpleadoVinculoIndustria } = req.params;
    const payload = req.body || {};

    const vinculoIndustria =
      await empleadosQueries.actualizarVinculoIndustriaEmpleado(
        empCod,
        Number(idEmpleadoVinculoIndustria),
        payload
      );

    if (!vinculoIndustria) {
      return res.status(404).json({
        ok: false,
        message: "Vinculo con la industria no encontrado"
      });
    }

    res.json({
      ok: true,
      message: "Vinculo con la industria actualizado correctamente",
      data: vinculoIndustria
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al actualizar el vinculo con la industria",
      error: error.message
    });
  }
};

const eliminarVinculoIndustria = async (req, res) => {
  try {
    const { empCod, idEmpleadoVinculoIndustria } = req.params;

    const eliminado = await empleadosQueries.eliminarVinculoIndustriaEmpleado(
      empCod,
      Number(idEmpleadoVinculoIndustria)
    );

    if (!eliminado) {
      return res.status(404).json({
        ok: false,
        message: "Vinculo con la industria no encontrado"
      });
    }

    res.json({
      ok: true,
      message: "Vinculo con la industria eliminado correctamente"
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al eliminar el vinculo con la industria",
      error: error.message
    });
  }
};

const listarIdiomasEmpleado = async (req, res) => {
  try {
    const { empCod } = req.params;

    const idiomas = await empleadosQueries.listarIdiomasEmpleado(empCod);

    if (!idiomas) {
      return res.status(404).json({
        ok: false,
        message: "Empleado no encontrado"
      });
    }

    res.json({
      ok: true,
      message: "Idiomas del empleado obtenidos correctamente",
      data: idiomas
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al obtener los idiomas del empleado",
      error: error.message
    });
  }
};

const crearIdiomaEmpleado = async (req, res) => {
  try {
    const { empCod } = req.params;
    const payload = req.body || {};

    const idioma = await empleadosQueries.crearIdiomaEmpleado(empCod, payload);

    if (!idioma) {
      return res.status(404).json({
        ok: false,
        message: "Empleado no encontrado"
      });
    }

    res.status(201).json({
      ok: true,
      message: "Idioma guardado correctamente",
      data: idioma
    });
  } catch (error) {
    const status = error.message.includes("no existe") ? 400 : 500;

    res.status(status).json({
      ok: false,
      message: "Error al guardar el idioma",
      error: error.message
    });
  }
};

const actualizarIdiomaEmpleado = async (req, res) => {
  try {
    const { empCod, idEmpleadoIdioma } = req.params;
    const payload = req.body || {};

    const idioma = await empleadosQueries.actualizarIdiomaEmpleado(
      empCod,
      Number(idEmpleadoIdioma),
      payload
    );

    if (!idioma) {
      return res.status(404).json({
        ok: false,
        message: "Idioma no encontrado"
      });
    }

    res.json({
      ok: true,
      message: "Idioma actualizado correctamente",
      data: idioma
    });
  } catch (error) {
    const status = error.message.includes("no existe") ? 400 : 500;

    res.status(status).json({
      ok: false,
      message: "Error al actualizar el idioma",
      error: error.message
    });
  }
};

const eliminarIdiomaEmpleado = async (req, res) => {
  try {
    const { empCod, idEmpleadoIdioma } = req.params;

    const eliminado = await empleadosQueries.eliminarIdiomaEmpleado(
      empCod,
      Number(idEmpleadoIdioma)
    );

    if (!eliminado) {
      return res.status(404).json({
        ok: false,
        message: "Idioma no encontrado"
      });
    }

    res.json({
      ok: true,
      message: "Idioma eliminado correctamente"
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al eliminar el idioma",
      error: error.message
    });
  }
};

const listarCompetenciasDigitales = async (req, res) => {
  try {
    const { empCod } = req.params;

    const competenciasDigitales =
      await empleadosQueries.listarCompetenciasDigitalesEmpleado(empCod);

    if (!competenciasDigitales) {
      return res.status(404).json({
        ok: false,
        message: "Empleado no encontrado"
      });
    }

    res.json({
      ok: true,
      message: "Competencias digitales obtenidas correctamente",
      data: competenciasDigitales
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al obtener las competencias digitales",
      error: error.message
    });
  }
};

const crearCompetenciaDigital = async (req, res) => {
  try {
    const { empCod } = req.params;
    const payload = req.body || {};

    const competenciaDigital =
      await empleadosQueries.crearCompetenciaDigitalEmpleado(empCod, payload);

    if (!competenciaDigital) {
      return res.status(404).json({
        ok: false,
        message: "Empleado no encontrado"
      });
    }

    res.status(201).json({
      ok: true,
      message: "Competencia digital guardada correctamente",
      data: competenciaDigital
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al guardar la competencia digital",
      error: error.message
    });
  }
};

const actualizarCompetenciaDigital = async (req, res) => {
  try {
    const { empCod, idEmpleadoCompetenciaDigital } = req.params;
    const payload = req.body || {};

    const competenciaDigital =
      await empleadosQueries.actualizarCompetenciaDigitalEmpleado(
        empCod,
        Number(idEmpleadoCompetenciaDigital),
        payload
      );

    if (!competenciaDigital) {
      return res.status(404).json({
        ok: false,
        message: "Competencia digital no encontrada"
      });
    }

    res.json({
      ok: true,
      message: "Competencia digital actualizada correctamente",
      data: competenciaDigital
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al actualizar la competencia digital",
      error: error.message
    });
  }
};

const eliminarCompetenciaDigital = async (req, res) => {
  try {
    const { empCod, idEmpleadoCompetenciaDigital } = req.params;

    const eliminado = await empleadosQueries.eliminarCompetenciaDigitalEmpleado(
      empCod,
      Number(idEmpleadoCompetenciaDigital)
    );

    if (!eliminado) {
      return res.status(404).json({
        ok: false,
        message: "Competencia digital no encontrada"
      });
    }

    res.json({
      ok: true,
      message: "Competencia digital eliminada correctamente"
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al eliminar la competencia digital",
      error: error.message
    });
  }
};

const listarMetodologiasActivasEmpleado = async (req, res) => {
  try {
    const { empCod } = req.params;

    const metodologiasActivas =
      await empleadosQueries.listarMetodologiasActivasEmpleado(empCod);

    if (!metodologiasActivas) {
      return res.status(404).json({
        ok: false,
        message: "Empleado no encontrado"
      });
    }

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

const crearMetodologiaActivaEmpleado = async (req, res) => {
  try {
    const { empCod } = req.params;
    const payload = req.body || {};

    const metodologiaActiva =
      await empleadosQueries.crearMetodologiaActivaEmpleado(empCod, payload);

    if (!metodologiaActiva) {
      return res.status(404).json({
        ok: false,
        message: "Empleado no encontrado"
      });
    }

    res.status(201).json({
      ok: true,
      message: "Metodologia activa guardada correctamente",
      data: metodologiaActiva
    });
  } catch (error) {
    const status = error.message.includes("no existe") ? 400 : 500;

    res.status(status).json({
      ok: false,
      message: "Error al guardar la metodologia activa",
      error: error.message
    });
  }
};

const actualizarMetodologiaActivaEmpleado = async (req, res) => {
  try {
    const { empCod, idEmpleadoMetodologiaActiva } = req.params;
    const payload = req.body || {};

    const metodologiaActiva =
      await empleadosQueries.actualizarMetodologiaActivaEmpleado(
        empCod,
        Number(idEmpleadoMetodologiaActiva),
        payload
      );

    if (!metodologiaActiva) {
      return res.status(404).json({
        ok: false,
        message: "Metodologia activa no encontrada"
      });
    }

    res.json({
      ok: true,
      message: "Metodologia activa actualizada correctamente",
      data: metodologiaActiva
    });
  } catch (error) {
    const status = error.message.includes("no existe") ? 400 : 500;

    res.status(status).json({
      ok: false,
      message: "Error al actualizar la metodologia activa",
      error: error.message
    });
  }
};

const eliminarMetodologiaActivaEmpleado = async (req, res) => {
  try {
    const { empCod, idEmpleadoMetodologiaActiva } = req.params;

    const eliminado = await empleadosQueries.eliminarMetodologiaActivaEmpleado(
      empCod,
      Number(idEmpleadoMetodologiaActiva)
    );

    if (!eliminado) {
      return res.status(404).json({
        ok: false,
        message: "Metodologia activa no encontrada"
      });
    }

    res.json({
      ok: true,
      message: "Metodologia activa eliminada correctamente"
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al eliminar la metodologia activa",
      error: error.message
    });
  }
};

const listarPlataformasVirtualesEmpleado = async (req, res) => {
  try {
    const { empCod } = req.params;

    const plataformasVirtuales =
      await empleadosQueries.listarPlataformasVirtualesEmpleado(empCod);

    if (!plataformasVirtuales) {
      return res.status(404).json({
        ok: false,
        message: "Empleado no encontrado"
      });
    }

    res.json({
      ok: true,
      message: "Plataformas virtuales obtenidas correctamente",
      data: plataformasVirtuales
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al obtener las plataformas virtuales",
      error: error.message
    });
  }
};

const crearPlataformaVirtualEmpleado = async (req, res) => {
  try {
    const { empCod } = req.params;
    const payload = req.body || {};

    const plataformaVirtual =
      await empleadosQueries.crearPlataformaVirtualEmpleado(empCod, payload);

    if (!plataformaVirtual) {
      return res.status(404).json({
        ok: false,
        message: "Empleado no encontrado"
      });
    }

    res.status(201).json({
      ok: true,
      message: "Plataforma virtual guardada correctamente",
      data: plataformaVirtual
    });
  } catch (error) {
    const status = error.message.includes("no existe") ? 400 : 500;

    res.status(status).json({
      ok: false,
      message: "Error al guardar la plataforma virtual",
      error: error.message
    });
  }
};

const actualizarPlataformaVirtualEmpleado = async (req, res) => {
  try {
    const { empCod, idEmpleadoPlataformaVirtual } = req.params;
    const payload = req.body || {};

    const plataformaVirtual =
      await empleadosQueries.actualizarPlataformaVirtualEmpleado(
        empCod,
        Number(idEmpleadoPlataformaVirtual),
        payload
      );

    if (!plataformaVirtual) {
      return res.status(404).json({
        ok: false,
        message: "Plataforma virtual no encontrada"
      });
    }

    res.json({
      ok: true,
      message: "Plataforma virtual actualizada correctamente",
      data: plataformaVirtual
    });
  } catch (error) {
    const status = error.message.includes("no existe") ? 400 : 500;

    res.status(status).json({
      ok: false,
      message: "Error al actualizar la plataforma virtual",
      error: error.message
    });
  }
};

const eliminarPlataformaVirtualEmpleado = async (req, res) => {
  try {
    const { empCod, idEmpleadoPlataformaVirtual } = req.params;

    const eliminado = await empleadosQueries.eliminarPlataformaVirtualEmpleado(
      empCod,
      Number(idEmpleadoPlataformaVirtual)
    );

    if (!eliminado) {
      return res.status(404).json({
        ok: false,
        message: "Plataforma virtual no encontrada"
      });
    }

    res.json({
      ok: true,
      message: "Plataforma virtual eliminada correctamente"
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al eliminar la plataforma virtual",
      error: error.message
    });
  }
};

const listarPreferenciasDocencia = async (req, res) => {
  try {
    const { empCod } = req.params;

    const preferenciasDocencia =
      await empleadosQueries.listarPreferenciasDocenciaEmpleado(empCod);

    if (!preferenciasDocencia) {
      return res.status(404).json({
        ok: false,
        message: "Empleado no encontrado"
      });
    }

    res.json({
      ok: true,
      message: "Preferencias de docencia obtenidas correctamente",
      data: preferenciasDocencia
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al obtener las preferencias de docencia",
      error: error.message
    });
  }
};

const crearPreferenciaDocencia = async (req, res) => {
  try {
    const { empCod } = req.params;
    const payload = req.body || {};

    const preferenciaDocencia =
      await empleadosQueries.crearPreferenciaDocenciaEmpleado(empCod, payload);

    if (!preferenciaDocencia) {
      return res.status(404).json({
        ok: false,
        message: "Empleado no encontrado"
      });
    }

    res.status(201).json({
      ok: true,
      message: "Preferencia de docencia guardada correctamente",
      data: preferenciaDocencia
    });
  } catch (error) {
    const status = error.message.includes("no existe") ? 400 : 500;

    res.status(status).json({
      ok: false,
      message: "Error al guardar la preferencia de docencia",
      error: error.message
    });
  }
};

const actualizarPreferenciaDocencia = async (req, res) => {
  try {
    const { empCod, idEmpleadoPreferenciaDocencia } = req.params;
    const payload = req.body || {};

    const preferenciaDocencia =
      await empleadosQueries.actualizarPreferenciaDocenciaEmpleado(
        empCod,
        Number(idEmpleadoPreferenciaDocencia),
        payload
      );

    if (!preferenciaDocencia) {
      return res.status(404).json({
        ok: false,
        message: "Preferencia de docencia no encontrada"
      });
    }

    res.json({
      ok: true,
      message: "Preferencia de docencia actualizada correctamente",
      data: preferenciaDocencia
    });
  } catch (error) {
    const status = error.message.includes("no existe") ? 400 : 500;

    res.status(status).json({
      ok: false,
      message: "Error al actualizar la preferencia de docencia",
      error: error.message
    });
  }
};

const eliminarPreferenciaDocencia = async (req, res) => {
  try {
    const { empCod, idEmpleadoPreferenciaDocencia } = req.params;

    const eliminado = await empleadosQueries.eliminarPreferenciaDocenciaEmpleado(
      empCod,
      Number(idEmpleadoPreferenciaDocencia)
    );

    if (!eliminado) {
      return res.status(404).json({
        ok: false,
        message: "Preferencia de docencia no encontrada"
      });
    }

    res.json({
      ok: true,
      message: "Preferencia de docencia eliminada correctamente"
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al eliminar la preferencia de docencia",
      error: error.message
    });
  }
};

module.exports = {
  obtenerPorCodigo,
  listarColaboradores,
  listarColaboradoresCompletos,
  guardarInformacionPersonal,
  obtenerEstadoActualizacion,
  obtenerFormularioEmpleado,
  obtenerExpedienteEmpleado,
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
  eliminarProyectoExperiencia,
  listarExperienciasSectorProductivo,
  crearExperienciaSectorProductivo,
  actualizarExperienciaSectorProductivo,
  eliminarExperienciaSectorProductivo,
  listarVinculosIndustria,
  crearVinculoIndustria,
  actualizarVinculoIndustria,
  eliminarVinculoIndustria,
  listarIdiomasEmpleado,
  crearIdiomaEmpleado,
  actualizarIdiomaEmpleado,
  eliminarIdiomaEmpleado,
  listarCompetenciasDigitales,
  crearCompetenciaDigital,
  actualizarCompetenciaDigital,
  eliminarCompetenciaDigital,
  listarMetodologiasActivasEmpleado,
  crearMetodologiaActivaEmpleado,
  actualizarMetodologiaActivaEmpleado,
  eliminarMetodologiaActivaEmpleado,
  listarPlataformasVirtualesEmpleado,
  crearPlataformaVirtualEmpleado,
  actualizarPlataformaVirtualEmpleado,
  eliminarPlataformaVirtualEmpleado,
  listarPreferenciasDocencia,
  crearPreferenciaDocencia,
  actualizarPreferenciaDocencia,
  eliminarPreferenciaDocencia
};
