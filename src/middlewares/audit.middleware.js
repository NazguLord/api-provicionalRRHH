const { crearLogAuditoria } = require("../queries/logs.queries");
const { logError } = require("../utils/logs");

const ACCIONES_POR_METODO = {
  GET: "CONSULTAR",
  POST: "CREAR",
  PATCH: "ACTUALIZAR",
  PUT: "ACTUALIZAR",
  DELETE: "ELIMINAR"
};

const obtenerAccion = (req) => {
  const metodo = String(req.method || "GET").toUpperCase();

  if (metodo === "GET" && req.path === "/archivo-preview") {
    return "VISUALIZAR_ARCHIVO";
  }

  if (metodo === "POST" && req.path.includes("/documentos/")) {
    return "SUBIR_ARCHIVO";
  }

  return ACCIONES_POR_METODO[metodo] || metodo;
};

const obtenerCodigoEmpleado = (req) => {
  return (
    req.params?.empCod ||
    req.body?.CodigoEmpleado ||
    req.body?.codigoEmpleado ||
    req.query?.empCod ||
    null
  );
};

const obtenerIdRegistro = (req) => {
  const candidates = [
    "idEmpleadoHijo",
    "idEmpleadoGradoAcademico",
    "idEmpleadoExperienciaProfesional",
    "idEmpleadoDiplomado",
    "idEmpleadoCurso",
    "idEmpleadoCertificado",
    "idEmpleadoExperienciaDocente",
    "idEmpleadoLogroRelevante",
    "idEmpleadoDisenioCurricular",
    "idEmpleadoConocimientoClave",
    "idEmpleadoHabilidadRelevante",
    "idEmpleadoProyectoExperiencia",
    "idEmpleadoExperienciaSectorProductivo",
    "idEmpleadoVinculoIndustria",
    "idEmpleadoIdioma",
    "idEmpleadoCompetenciaDigital",
    "idEmpleadoMetodologiaActiva",
    "idEmpleadoPlataformaVirtual",
    "idEmpleadoPreferenciaDocencia",
    "idRegistro"
  ];

  for (const candidate of candidates) {
    const value = req.params?.[candidate] ?? req.body?.[candidate];

    if (value !== undefined && value !== null && value !== "") {
      return String(value);
    }
  }

  return null;
};

const sanitizarBody = (body = {}) => {
  const clone = { ...body };

  for (const key of [
    "password",
    "clave",
    "contrasena",
    "token",
    "authorization",
    "archivo"
  ]) {
    if (key in clone) {
      clone[key] = "[REDACTED]";
    }
  }

  return clone;
};

const obtenerIp = (req) => {
  const forwardedFor = req.headers["x-forwarded-for"];

  if (typeof forwardedFor === "string" && forwardedFor.trim()) {
    return forwardedFor.split(",")[0].trim();
  }

  return req.ip || req.socket?.remoteAddress || null;
};

const auditMiddleware = (modulo = "general") => {
  return (req, res, next) => {
    res.on("finish", () => {
      const estadoHttp = Number(res.statusCode || 0);
      const exitoso = estadoHttp >= 200 && estadoHttp < 400;

      crearLogAuditoria({
        modulo,
        accion: obtenerAccion(req),
        metodoHttp: req.method,
        ruta: req.originalUrl || req.url || "",
        codigoEmpleado: obtenerCodigoEmpleado(req),
        idRegistro: obtenerIdRegistro(req),
        usuarioIdentificador:
          req.user?.username || req.user?.sub || req.user?.tokenLabel || null,
        usuarioNombre:
          req.user?.displayName || req.user?.username || req.user?.sub || null,
        usuarioEmail: req.user?.email || null,
        tipoAutenticacion: req.user?.authType || null,
        estadoHttp,
        exitoso,
        direccionIp: obtenerIp(req),
        userAgent: req.headers["user-agent"] || null,
        queryParams: req.query || {},
        body:
          req.method === "GET" || req.method === "DELETE"
            ? null
            : sanitizarBody(req.body || {}),
        metadata: {
          baseUrl: req.baseUrl || null,
          path: req.path || null
        }
      }).catch((error) => {
        logError("No se pudo registrar el log de auditoria", error.message);
      });
    });

    next();
  };
};

module.exports = auditMiddleware;
