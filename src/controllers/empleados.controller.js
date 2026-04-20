const fs = require("fs");
const path = require("path");

const empleadosQueries = require("../queries/empleados.queries");
const { crearLogDescargaDocumento } = require("../queries/logs.queries");
const authMiddleware = require("../middlewares/auth.middleware");
const { logError } = require("../utils/logs");
const {
  firmarAccesoArchivo,
  verificarAccesoArchivo
} = require("../utils/file-access");

const DATA_ROOT = path.join(__dirname, "..", "..", "data");
const MIME_TYPES = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".jfif": "image/jpeg",
  ".pdf": "application/pdf"
};

const construirUrlArchivo = (req, ruta) => {
  if (!ruta) {
    return null;
  }

  return `${req.protocol}://${req.get("host")}${ruta}`;
};

const construirPreviewUrlArchivo = (req, ruta) => {
  if (!ruta) {
    return null;
  }

  const { expires, signature } = firmarAccesoArchivo(ruta);
  const params = new URLSearchParams({
    path: ruta,
    expires: String(expires),
    signature
  });

  return `${req.protocol}://${req.get("host")}/api/empleados/archivo-preview?${params.toString()}`;
};

const resolverRutaArchivo = (rutaPublica) => {
  if (!rutaPublica || typeof rutaPublica !== "string") {
    return null;
  }

  if (!rutaPublica.startsWith("/data/")) {
    return null;
  }

  const relativa = rutaPublica.replace(/^\/data\//, "");
  const absoluta = path.resolve(DATA_ROOT, relativa);

  if (!absoluta.startsWith(DATA_ROOT)) {
    return null;
  }

  return absoluta;
};

const obtenerMimeType = (rutaAbsoluta) => {
  const extension = path.extname(rutaAbsoluta || "").toLowerCase();
  return MIME_TYPES[extension] || "application/octet-stream";
};

const obtenerIp = (req) => {
  const forwardedFor = req.headers["x-forwarded-for"];

  if (typeof forwardedFor === "string" && forwardedFor.trim()) {
    return forwardedFor.split(",")[0].trim();
  }

  return req.ip || req.socket?.remoteAddress || null;
};

const obtenerUsuarioDescarga = (req) => {
  const source = req.method === "POST" ? req.body || {} : req.query || {};

  const usrId = String(
    source.UsrId ??
      source.usrId ??
      source.UsrAlt ??
      source.usrAlt ??
      source.CodigoEmpleado ??
      source.codigoEmpleado ??
      ""
  ).trim();

  const usrUsr = String(source.UsrUsr ?? source.usrUsr ?? "").trim();
  const usrNom = String(source.UsrNom ?? source.usrNom ?? "").trim();
  const usrApe = String(source.UsrApe ?? source.usrApe ?? "").trim();

  return {
    usrId: usrId || String(req.user?.sub || "").trim() || null,
    usrUsr: usrUsr || String(req.user?.username || "").trim() || null,
    usrNom:
      usrNom ||
      String(req.user?.displayName || req.user?.username || "").trim() ||
      null,
    usrApe: usrApe || null
  };
};

const obtenerTipoDescargaDesdeRuta = (rutaPublica = "") => {
  const ruta = String(rutaPublica || "").toLowerCase();

  if (ruta.includes("/datos-generales/cv-") || ruta.includes("/datos-generales/hoja-vida-")) {
    return {
      tipoDocumento: "CV_COLABORADOR",
      descripcion: "Descarga de CV de colaborador"
    };
  }

  if (ruta.includes("/datos-generales/documento-identidad-")) {
    return {
      tipoDocumento: "DOCUMENTO_IDENTIDAD",
      descripcion: "Descarga de documento de identidad"
    };
  }

  if (ruta.includes("/datos-generales/documento-colegiacion-")) {
    return {
      tipoDocumento: "DOCUMENTO_COLEGIACION",
      descripcion: "Descarga de documento de colegiacion"
    };
  }

  if (ruta.includes("/datos-generales/foto-perfil-")) {
    return {
      tipoDocumento: "FOTO_PERFIL",
      descripcion: "Descarga de foto de perfil"
    };
  }

  return {
    tipoDocumento: "ARCHIVO_COLABORADOR",
    descripcion: "Descarga de archivo de colaborador"
  };
};

const registrarLogDescargaDocumento = async (
  req,
  {
    descripcion,
    tipoDocumento,
    ruta,
    totalRegistros = 1
  } = {}
) => {
  const { usrId, usrNom, usrUsr, usrApe } = obtenerUsuarioDescarga(req);

  if (!usrId && !usrUsr) {
    return;
  }

  try {
    await crearLogDescargaDocumento({
      descripcion,
      tipoDocumento,
      ruta: ruta || req.originalUrl || req.url || "",
      usrId: usrId || null,
      usrNom: usrNom || null,
      usrUsr: usrUsr || null,
      usrApe: usrApe || null,
      totalRegistros,
      direccionIp: obtenerIp(req),
      userAgent: req.headers["user-agent"] || null
    });
  } catch (error) {
    logError("No se pudo registrar el log de descarga", error.message);
  }
};

const registrarDescargaArchivoEmpleado = async (req, rutaPublica) => {
  const { tipoDocumento, descripcion } = obtenerTipoDescargaDesdeRuta(rutaPublica);

  return registrarLogDescargaDocumento(req, {
    descripcion,
    tipoDocumento,
    ruta: rutaPublica || req.originalUrl || req.url || "",
    totalRegistros: 1
  });
};

const registrarLogDescargaExcel = async (req, res) => {
  try {
    const totalRegistros = Number(
      req.body?.TotalRegistros ?? req.body?.totalRegistros ?? 1
    );

    await registrarLogDescargaDocumento(req, {
      descripcion: "Descarga de Excel de datos del colaborador",
      tipoDocumento: "EXCEL_DATOS_COLABORADOR",
      ruta: "/descargas/excel-colaborador",
      totalRegistros: Number.isFinite(totalRegistros) ? totalRegistros : 1
    });

    res.status(201).json({
      ok: true,
      message: "Log de descarga de Excel registrado correctamente"
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al registrar el log de descarga de Excel",
      error: error.message
    });
  }
};

const registrarLogDescargaCv = async (req, res) => {
  try {
    await registrarLogDescargaDocumento(req, {
      descripcion: "Descarga de CV del colaborador",
      tipoDocumento: "PDF_CV_COLABORADOR",
      ruta: "/descargas/cv-colaborador",
      totalRegistros: 1
    });

    res.status(201).json({
      ok: true,
      message: "Log de descarga de CV registrado correctamente"
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al registrar el log de descarga de CV",
      error: error.message
    });
  }
};

const mapearArchivo = (req, nombre, ruta, extra = {}) => {
  if (!ruta) {
    return null;
  }

  return {
    nombre,
    ruta,
    url: construirUrlArchivo(req, ruta),
    previewUrl: construirPreviewUrlArchivo(req, ruta),
    ...extra
  };
};

const resolverIdNumerico = (...valores) => {
  for (const valor of valores) {
    if (valor === undefined || valor === null || valor === "") {
      continue;
    }

    const numero = Number(valor);

    if (Number.isInteger(numero) && numero > 0) {
      return numero;
    }
  }

  return null;
};

const construirExpedienteEmpleado = async (req, empCod) => {
  const [
    informacionPersonal,
    autorizacion,
    gradosAcademicos,
    experienciasProfesionales,
    diplomados,
    cursos,
    certificados,
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
    preferenciasDocencia,
    disponibilidadFortalecimiento
  ] = await Promise.all([
    empleadosQueries.obtenerFormularioEmpleado(empCod),
    empleadosQueries.obtenerAutorizacionEmpleado(empCod),
    empleadosQueries.listarGradosAcademicosEmpleado(empCod),
    empleadosQueries.listarExperienciasProfesionalesEmpleado(empCod),
    empleadosQueries.listarDiplomadosEmpleado(empCod),
    empleadosQueries.listarCursosEmpleado(empCod),
    empleadosQueries.listarCertificadosEmpleado(empCod),
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
    empleadosQueries.listarPreferenciasDocenciaEmpleado(empCod),
    empleadosQueries.listarDisponibilidadFortalecimientoEmpleado(empCod)
  ]);

  if (!informacionPersonal) {
    return null;
  }

  const archivos = [
    mapearArchivo(req, "imagenPerfil", informacionPersonal.RutaImagenPerfil),
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
    ...(cursos || []).flatMap((item) =>
      item.RutaDocumentoAdjunto
        ? [
            mapearArchivo(req, "cursoAdjunto", item.RutaDocumentoAdjunto, {
              id: item.IdEmpleadoCurso,
              titulo: item.NombreCurso ?? null
            })
          ]
        : []
    ),
    ...(certificados || []).flatMap((item) =>
      item.RutaDocumentoAdjunto
        ? [
            mapearArchivo(req, "certificadoAdjunto", item.RutaDocumentoAdjunto, {
              id: item.IdEmpleadoCertificado,
              titulo: item.NombreCertificado ?? null
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

  return {
    informacionPersonal,
    autorizacion: autorizacion || null,
    gradosAcademicos: gradosAcademicos || [],
    experienciasProfesionales: experienciasProfesionales || [],
    diplomados: diplomados || [],
    cursos: cursos || [],
    certificados: certificados || [],
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
    disponibilidadFortalecimiento:
      disponibilidadFortalecimiento || {
        Vinculacion: [],
        Investigacion: [],
        GestionAcademica: [],
        Registros: []
      },
    archivos
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

const previewArchivoEmpleado = async (req, res) => {
  try {
    const rutaPublica = String(req.query.path || "").trim();
    const { expires, signature } = req.query;

    let autorizado = false;
    let usuarioAutenticado = null;

    try {
      usuarioAutenticado = authMiddleware.validarTokenBearer(
        req.headers.authorization || "",
        req.headers
      );
      req.user = usuarioAutenticado;
      autorizado = true;
    } catch (error) {
      autorizado = verificarAccesoArchivo({
        rutaPublica,
        expires,
        signature
      });
    }

    if (!autorizado) {
      return res.status(401).json({
        ok: false,
        message: "No autorizado para acceder al archivo"
      });
    }

    const rutaAbsoluta = resolverRutaArchivo(rutaPublica);

    if (!rutaAbsoluta || !fs.existsSync(rutaAbsoluta)) {
      return res.status(404).json({
        ok: false,
        message: "Archivo no encontrado"
      });
    }

    const stat = fs.statSync(rutaAbsoluta);
    const range = req.headers.range;

    res.setHeader("Content-Type", obtenerMimeType(rutaAbsoluta));
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${path.basename(rutaAbsoluta)}"`
    );
    res.setHeader("Accept-Ranges", "bytes");
    res.setHeader("Cache-Control", "private, max-age=300");

    if (range) {
      const matches = /bytes=(\d*)-(\d*)/.exec(range);

      if (!matches) {
        return res.status(416).end();
      }

      const start = matches[1] ? Number(matches[1]) : 0;
      const end = matches[2] ? Number(matches[2]) : stat.size - 1;

      if (
        !Number.isFinite(start) ||
        !Number.isFinite(end) ||
        start > end ||
        start >= stat.size
      ) {
        return res.status(416).end();
      }

      res.status(206);
      res.setHeader("Content-Range", `bytes ${start}-${end}/${stat.size}`);
      res.setHeader("Content-Length", end - start + 1);

      return fs.createReadStream(rutaAbsoluta, { start, end }).pipe(res);
    }

    res.setHeader("Content-Length", stat.size);
    await registrarDescargaArchivoEmpleado(req, rutaPublica);
    return fs.createReadStream(rutaAbsoluta).pipe(res);
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al previsualizar el archivo",
      error: error.message
    });
  }
};

const listarColaboradores = async (req, res) => {
  try {
    const { page, limit, search, SdeCod, sdeCod } = req.query;

    const resultado = await empleadosQueries.listarColaboradores({
      page,
      limit,
      search,
      sdeCod: SdeCod ?? sdeCod ?? null
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
    const { search, SdeCod, sdeCod } = req.query;

    const colaboradores = await empleadosQueries.listarColaboradoresCompletos({
      search,
      sdeCod: SdeCod ?? sdeCod ?? null
    });
    const data = await Promise.all(
      colaboradores.map((empleado) =>
        construirExpedienteEmpleado(req, empleado.CodigoEmpleado)
      )
    );

    res.json({
      ok: true,
      message: "Expedientes completos obtenidos correctamente",
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

const obtenerResumenDashboard = async (req, res) => {
  try {
    const data = await empleadosQueries.obtenerResumenDashboardColaboradores();

    res.json({
      ok: true,
      message: "Resumen de dashboard obtenido correctamente",
      data
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al obtener el resumen del dashboard",
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
    const data = await construirExpedienteEmpleado(req, empCod);

    if (!data) {
      return res.status(404).json({
        ok: false,
        message: "Empleado no encontrado"
      });
    }

    res.json({
      ok: true,
      message: "Expediente del empleado obtenido correctamente",
      data
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

const listarHijosEmpleado = async (req, res) => {
  try {
    const { empCod } = req.params;

    const hijos = await empleadosQueries.listarHijosEmpleado(empCod);

    if (!hijos) {
      return res.status(404).json({
        ok: false,
        message: "Empleado no encontrado"
      });
    }

    res.json({
      ok: true,
      message: "Hijos del empleado obtenidos correctamente",
      data: hijos
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al obtener los hijos del empleado",
      error: error.message
    });
  }
};

const crearHijoEmpleado = async (req, res) => {
  try {
    const { empCod } = req.params;
    const payload = req.body || {};

    const hijo = await empleadosQueries.crearHijoEmpleado(empCod, payload);

    if (!hijo) {
      return res.status(404).json({
        ok: false,
        message: "Empleado no encontrado"
      });
    }

    res.status(201).json({
      ok: true,
      message: "Hijo guardado correctamente",
      data: hijo
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al guardar el hijo del empleado",
      error: error.message
    });
  }
};

const actualizarHijoEmpleado = async (req, res) => {
  try {
    const { empCod, idEmpleadoHijo } = req.params;
    const payload = req.body || {};

    const hijo = await empleadosQueries.actualizarHijoEmpleado(
      empCod,
      Number(idEmpleadoHijo),
      payload
    );

    if (!hijo) {
      return res.status(404).json({
        ok: false,
        message: "Hijo no encontrado"
      });
    }

    res.json({
      ok: true,
      message: "Hijo actualizado correctamente",
      data: hijo
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al actualizar el hijo del empleado",
      error: error.message
    });
  }
};

const eliminarHijoEmpleado = async (req, res) => {
  try {
    const { empCod, idEmpleadoHijo } = req.params;

    const eliminado = await empleadosQueries.eliminarHijoEmpleado(
      empCod,
      Number(idEmpleadoHijo)
    );

    if (!eliminado) {
      return res.status(404).json({
        ok: false,
        message: "Hijo no encontrado"
      });
    }

    res.json({
      ok: true,
      message: "Hijo eliminado correctamente"
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al eliminar el hijo del empleado",
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
      error.message.includes("Debes adjuntar") ||
      error.message.includes("Debes ingresar")
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
    const status =
      error.message.includes("no existe") ||
      error.message.includes("Debes ingresar")
        ? 400
        : 500;

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

const listarCursos = async (req, res) => {
  try {
    const { empCod } = req.params;

    const cursos = await empleadosQueries.listarCursosEmpleado(empCod);

    if (!cursos) {
      return res.status(404).json({
        ok: false,
        message: "Empleado no encontrado"
      });
    }

    res.json({
      ok: true,
      message: "Cursos obtenidos correctamente",
      data: cursos
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al obtener los cursos",
      error: error.message
    });
  }
};

const crearCurso = async (req, res) => {
  try {
    const { empCod } = req.params;
    const payload = req.body || {};

    const curso = await empleadosQueries.crearCursoEmpleado(
      empCod,
      payload,
      req.file || null
    );

    if (!curso) {
      return res.status(404).json({
        ok: false,
        message: "Empleado no encontrado"
      });
    }

    res.status(201).json({
      ok: true,
      message: "Curso guardado correctamente",
      data: curso
    });
  } catch (error) {
    const status =
      error.message.includes("Debes ingresar") ||
      error.message.includes("Debes adjuntar")
        ? 400
        : 500;

    res.status(status).json({
      ok: false,
      message: "Error al guardar el curso",
      error: error.message
    });
  }
};

const actualizarCurso = async (req, res) => {
  try {
    const { empCod, idEmpleadoCurso } = req.params;
    const payload = req.body || {};
    const idCursoNormalizado = resolverIdNumerico(
      idEmpleadoCurso,
      payload.idEmpleadoCurso,
      payload.IdEmpleadoCurso,
      payload.id
    );

    if (!idCursoNormalizado) {
      return res.status(400).json({
        ok: false,
        message: "Id de curso invalido"
      });
    }

    const curso = await empleadosQueries.actualizarCursoEmpleado(
      empCod,
      idCursoNormalizado,
      payload,
      req.file || null
    );

    if (!curso) {
      return res.status(404).json({
        ok: false,
        message: "Curso no encontrado"
      });
    }

    res.json({
      ok: true,
      message: "Curso actualizado correctamente",
      data: curso
    });
  } catch (error) {
    const status = error.message.includes("Debes ingresar") ? 400 : 500;

    res.status(status).json({
      ok: false,
      message: "Error al actualizar el curso",
      error: error.message
    });
  }
};

const eliminarCurso = async (req, res) => {
  try {
    const { empCod, idEmpleadoCurso } = req.params;
    const payload = req.body || {};
    const idCursoNormalizado = resolverIdNumerico(
      idEmpleadoCurso,
      payload.idEmpleadoCurso,
      payload.IdEmpleadoCurso,
      payload.id
    );

    if (!idCursoNormalizado) {
      return res.status(400).json({
        ok: false,
        message: "Id de curso invalido"
      });
    }

    const eliminado = await empleadosQueries.eliminarCursoEmpleado(
      empCod,
      idCursoNormalizado
    );

    if (!eliminado) {
      return res.status(404).json({
        ok: false,
        message: "Curso no encontrado"
      });
    }

    res.json({
      ok: true,
      message: "Curso eliminado correctamente"
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al eliminar el curso",
      error: error.message
    });
  }
};

const listarCertificados = async (req, res) => {
  try {
    const { empCod } = req.params;

    const certificados =
      await empleadosQueries.listarCertificadosEmpleado(empCod);

    if (!certificados) {
      return res.status(404).json({
        ok: false,
        message: "Empleado no encontrado"
      });
    }

    res.json({
      ok: true,
      message: "Certificados obtenidos correctamente",
      data: certificados
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al obtener los certificados",
      error: error.message
    });
  }
};

const crearCertificado = async (req, res) => {
  try {
    const { empCod } = req.params;
    const payload = req.body || {};

    const certificado = await empleadosQueries.crearCertificadoEmpleado(
      empCod,
      payload,
      req.file || null
    );

    if (!certificado) {
      return res.status(404).json({
        ok: false,
        message: "Empleado no encontrado"
      });
    }

    res.status(201).json({
      ok: true,
      message: "Certificado guardado correctamente",
      data: certificado
    });
  } catch (error) {
    const status =
      error.message.includes("Debes ingresar") ||
      error.message.includes("Debes adjuntar")
        ? 400
        : 500;

    res.status(status).json({
      ok: false,
      message: "Error al guardar el certificado",
      error: error.message
    });
  }
};

const actualizarCertificado = async (req, res) => {
  try {
    const { empCod, idEmpleadoCertificado } = req.params;
    const payload = req.body || {};
    const idCertificadoNormalizado = resolverIdNumerico(
      idEmpleadoCertificado,
      payload.idEmpleadoCertificado,
      payload.IdEmpleadoCertificado,
      payload.id
    );

    if (!idCertificadoNormalizado) {
      return res.status(400).json({
        ok: false,
        message: "Id de certificado invalido"
      });
    }

    const certificado = await empleadosQueries.actualizarCertificadoEmpleado(
      empCod,
      idCertificadoNormalizado,
      payload,
      req.file || null
    );

    if (!certificado) {
      return res.status(404).json({
        ok: false,
        message: "Certificado no encontrado"
      });
    }

    res.json({
      ok: true,
      message: "Certificado actualizado correctamente",
      data: certificado
    });
  } catch (error) {
    const status = error.message.includes("Debes ingresar") ? 400 : 500;

    res.status(status).json({
      ok: false,
      message: "Error al actualizar el certificado",
      error: error.message
    });
  }
};

const eliminarCertificado = async (req, res) => {
  try {
    const { empCod, idEmpleadoCertificado } = req.params;
    const payload = req.body || {};
    const idCertificadoNormalizado = resolverIdNumerico(
      idEmpleadoCertificado,
      payload.idEmpleadoCertificado,
      payload.IdEmpleadoCertificado,
      payload.id
    );

    if (!idCertificadoNormalizado) {
      return res.status(400).json({
        ok: false,
        message: "Id de certificado invalido"
      });
    }

    const eliminado = await empleadosQueries.eliminarCertificadoEmpleado(
      empCod,
      idCertificadoNormalizado
    );

    if (!eliminado) {
      return res.status(404).json({
        ok: false,
        message: "Certificado no encontrado"
      });
    }

    res.json({
      ok: true,
      message: "Certificado eliminado correctamente"
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al eliminar el certificado",
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

const listarAsignaturasPreferenciaDocencia = async (req, res) => {
  try {
    const { empCod, idEmpleadoPreferenciaDocencia } = req.params;

    const asignaturas =
      await empleadosQueries.listarAsignaturasPreferenciaDocenciaEmpleado(
        empCod,
        Number(idEmpleadoPreferenciaDocencia)
      );

    if (asignaturas === null) {
      return res.status(404).json({
        ok: false,
        message: "Empleado no encontrado"
      });
    }

    if (asignaturas === undefined) {
      return res.status(404).json({
        ok: false,
        message: "Preferencia de docencia no encontrada"
      });
    }

    res.json({
      ok: true,
      message: "Asignaturas de preferencia de docencia obtenidas correctamente",
      data: asignaturas
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al obtener las asignaturas de preferencia de docencia",
      error: error.message
    });
  }
};

const crearAsignaturaPreferenciaDocencia = async (req, res) => {
  try {
    const { empCod, idEmpleadoPreferenciaDocencia } = req.params;
    const payload = req.body || {};

    const asignatura =
      await empleadosQueries.crearAsignaturaPreferenciaDocenciaEmpleado(
        empCod,
        Number(idEmpleadoPreferenciaDocencia),
        payload
      );

    if (asignatura === null) {
      return res.status(404).json({
        ok: false,
        message: "Empleado no encontrado"
      });
    }

    if (asignatura === undefined) {
      return res.status(404).json({
        ok: false,
        message: "Preferencia de docencia no encontrada"
      });
    }

    res.status(201).json({
      ok: true,
      message: "Asignatura de preferencia de docencia guardada correctamente",
      data: asignatura
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al guardar la asignatura de preferencia de docencia",
      error: error.message
    });
  }
};

const actualizarAsignaturaPreferenciaDocencia = async (req, res) => {
  try {
    const {
      empCod,
      idEmpleadoPreferenciaDocencia,
      idEmpleadoPreferenciaDocenciaAsignatura
    } = req.params;
    const payload = req.body || {};

    const asignatura =
      await empleadosQueries.actualizarAsignaturaPreferenciaDocenciaEmpleado(
        empCod,
        Number(idEmpleadoPreferenciaDocencia),
        Number(idEmpleadoPreferenciaDocenciaAsignatura),
        payload
      );

    if (asignatura === null) {
      return res.status(404).json({
        ok: false,
        message: "Empleado no encontrado"
      });
    }

    if (asignatura === undefined) {
      return res.status(404).json({
        ok: false,
        message: "Asignatura de preferencia de docencia no encontrada"
      });
    }

    res.json({
      ok: true,
      message: "Asignatura de preferencia de docencia actualizada correctamente",
      data: asignatura
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al actualizar la asignatura de preferencia de docencia",
      error: error.message
    });
  }
};

const eliminarAsignaturaPreferenciaDocencia = async (req, res) => {
  try {
    const {
      empCod,
      idEmpleadoPreferenciaDocencia,
      idEmpleadoPreferenciaDocenciaAsignatura
    } = req.params;

    const eliminado =
      await empleadosQueries.eliminarAsignaturaPreferenciaDocenciaEmpleado(
        empCod,
        Number(idEmpleadoPreferenciaDocencia),
        Number(idEmpleadoPreferenciaDocenciaAsignatura)
      );

    if (eliminado === null) {
      return res.status(404).json({
        ok: false,
        message: "Empleado no encontrado"
      });
    }

    if (eliminado === undefined) {
      return res.status(404).json({
        ok: false,
        message: "Asignatura de preferencia de docencia no encontrada"
      });
    }

    res.json({
      ok: true,
      message: "Asignatura de preferencia de docencia eliminada correctamente"
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al eliminar la asignatura de preferencia de docencia",
      error: error.message
    });
  }
};

const listarDisponibilidadFortalecimiento = async (req, res) => {
  try {
    const { empCod } = req.params;

    const disponibilidad =
      await empleadosQueries.listarDisponibilidadFortalecimientoEmpleado(
        empCod
      );

    if (!disponibilidad) {
      return res.status(404).json({
        ok: false,
        message: "Empleado no encontrado"
      });
    }

    res.json({
      ok: true,
      message: "Disponibilidad para fortalecimiento obtenida correctamente",
      data: disponibilidad
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al obtener la disponibilidad para fortalecimiento",
      error: error.message
    });
  }
};

const guardarDisponibilidadFortalecimiento = async (req, res) => {
  try {
    const { empCod } = req.params;
    const payload = req.body || {};

    const disponibilidad =
      await empleadosQueries.guardarDisponibilidadFortalecimientoEmpleado(
        empCod,
        payload
      );

    if (!disponibilidad) {
      return res.status(404).json({
        ok: false,
        message: "Empleado no encontrado"
      });
    }

    res.status(req.method === "POST" ? 201 : 200).json({
      ok: true,
      message: "Disponibilidad para fortalecimiento guardada correctamente",
      data: disponibilidad
    });
  } catch (error) {
    const status = error.message.includes("no es valida") ? 400 : 500;

    res.status(status).json({
      ok: false,
      message: "Error al guardar la disponibilidad para fortalecimiento",
      error: error.message
    });
  }
};

const actualizarAutorizacion = async (req, res) => {
  try {
    const { empCod } = req.params;
    const payload =
      req.body && typeof req.body === "object" && !Array.isArray(req.body)
        ? { ...req.query, ...req.body }
        : Object.keys(req.query || {}).length > 0
          ? req.query
          : req.body;

    const autorizacion = await empleadosQueries.actualizarAutorizacionEmpleado(
      empCod,
      payload
    );

    if (!autorizacion) {
      return res.status(404).json({
        ok: false,
        message: "Empleado no encontrado"
      });
    }

    res.json({
      ok: true,
      message: "Autorizacion actualizada correctamente",
      data: autorizacion
    });
  } catch (error) {
    const status = error.message.includes("requerida") ? 400 : 500;

    res.status(status).json({
      ok: false,
      message: "Error al actualizar la autorizacion",
      error: error.message
    });
  }
};

const validarAutorizacion = async (req, res) => {
  try {
    const { empCod } = req.params;

    const autorizacion = await empleadosQueries.obtenerAutorizacionEmpleado(
      empCod
    );

    if (!autorizacion) {
      return res.status(404).json({
        ok: false,
        message: "Empleado no encontrado"
      });
    }

    if (autorizacion.Autorizacion !== true) {
      return res.status(200).json({
        ok: false,
        message: "Autorizacion no activa",
        data: autorizacion
      });
    }

    res.json({
      ok: true,
      message: "ok",
      data: autorizacion
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al validar la autorizacion",
      error: error.message
    });
  }
};

module.exports = {
  obtenerPorCodigo,
  previewArchivoEmpleado,
  listarColaboradores,
  listarColaboradoresCompletos,
  registrarLogDescargaExcel,
  registrarLogDescargaCv,
  obtenerResumenDashboard,
  guardarInformacionPersonal,
  obtenerEstadoActualizacion,
  obtenerFormularioEmpleado,
  obtenerExpedienteEmpleado,
  inicializarFormularioEmpleado,
  actualizarInformacionPersonal,
  subirDocumentoEmpleado,
  listarHijosEmpleado,
  crearHijoEmpleado,
  actualizarHijoEmpleado,
  eliminarHijoEmpleado,
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
  listarCursos,
  crearCurso,
  actualizarCurso,
  eliminarCurso,
  listarCertificados,
  crearCertificado,
  actualizarCertificado,
  eliminarCertificado,
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
  eliminarPreferenciaDocencia,
  listarAsignaturasPreferenciaDocencia,
  crearAsignaturaPreferenciaDocencia,
  actualizarAsignaturaPreferenciaDocencia,
  eliminarAsignaturaPreferenciaDocencia,
  listarDisponibilidadFortalecimiento,
  guardarDisponibilidadFortalecimiento,
  actualizarAutorizacion,
  validarAutorizacion
};
