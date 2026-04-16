const { query } = require("../config/db");

const normalizarJson = (valor) => {
  if (
    valor === undefined ||
    valor === null ||
    (typeof valor === "object" && Object.keys(valor).length === 0)
  ) {
    return null;
  }

  return JSON.stringify(valor);
};

const crearLogAuditoria = async (payload = {}) => {
  return query(
    `
      INSERT INTO TB_LogAuditoria (
        Modulo,
        Accion,
        MetodoHttp,
        Ruta,
        CodigoEmpleado,
        IdRegistro,
        UsuarioIdentificador,
        UsuarioNombre,
        UsuarioEmail,
        TipoAutenticacion,
        EstadoHttp,
        Exitoso,
        DireccionIp,
        UserAgent,
        QueryParamsJson,
        BodyJson,
        MetadataJson
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      payload.modulo || "general",
      payload.accion || "DESCONOCIDA",
      payload.metodoHttp || "GET",
      payload.ruta || "",
      payload.codigoEmpleado || null,
      payload.idRegistro || null,
      payload.usuarioIdentificador || null,
      payload.usuarioNombre || null,
      payload.usuarioEmail || null,
      payload.tipoAutenticacion || null,
      Number(payload.estadoHttp || 0),
      payload.exitoso ? 1 : 0,
      payload.direccionIp || null,
      payload.userAgent || null,
      normalizarJson(payload.queryParams),
      normalizarJson(payload.body),
      normalizarJson(payload.metadata)
    ]
  );
};

const crearLogDescargaDocumento = async (payload = {}) => {
  return query(
    `
      INSERT INTO TB_LogDescargaDocumento (
        Descripcion,
        TipoDocumento,
        Ruta,
        UsrId,
        UsrNom,
        UsrUsr,
        UsrApe,
        TotalRegistros,
        DireccionIp,
        UserAgent
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      payload.descripcion || "",
      payload.tipoDocumento || "",
      payload.ruta || "",
      payload.usrId || null,
      payload.usrNom || null,
      payload.usrUsr || null,
      payload.usrApe || null,
      Number(payload.totalRegistros || 0),
      payload.direccionIp || null,
      payload.userAgent || null
    ]
  );
};

module.exports = {
  crearLogAuditoria,
  crearLogDescargaDocumento
};
