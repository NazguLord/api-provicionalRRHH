const { query } = require("../config/db");

const normalizarTexto = (valor) => {
  if (valor === undefined || valor === null) {
    return null;
  }

  const texto = String(valor).trim();
  return texto === "" ? null : texto;
};

const normalizarFechaOpcional = (valor, valorActual = undefined) => {
  if (valor === undefined) {
    return valorActual;
  }

  return normalizarTexto(valor);
};

const obtenerCampoPayload = (payload = {}, llaveCamel, llavePascal) => {
  if (Object.prototype.hasOwnProperty.call(payload, llaveCamel)) {
    return payload[llaveCamel];
  }

  if (Object.prototype.hasOwnProperty.call(payload, llavePascal)) {
    return payload[llavePascal];
  }

  return undefined;
};

const normalizarValorLegacy = (valor) => {
  const texto = normalizarTexto(valor);

  if (!texto) {
    return null;
  }

  const textoMayuscula = texto.toUpperCase();

  if (textoMayuscula === "ND" || textoMayuscula === "N/D") {
    return null;
  }

  return texto;
};

const normalizarEstadoCivilLegacy = (valor) => {
  const texto = normalizarValorLegacy(valor);

  if (!texto) {
    return null;
  }

  const mapa = {
    "SOLTERO/A": "SOLTERO",
    SOLTERO: "SOLTERO",
    "CASADO/A": "CASADO",
    CASADO: "CASADO"
  };

  return mapa[texto.toUpperCase()] || null;
};

const normalizarTipoSangreLegacy = (valor) => {
  const texto = normalizarValorLegacy(valor);

  if (!texto) {
    return null;
  }

  return texto.toUpperCase().replace(/\s+/g, "").replace(/^0/, "O");
};

const normalizarTipoEmpleadoLegacy = (valor) => {
  const texto = normalizarValorLegacy(valor);
  return texto ? texto.trim() : null;
};

const normalizarEstadoEmpleadoLegacy = (valor) => {
  const texto = normalizarValorLegacy(valor);

  if (!texto) {
    return "ACTIVO";
  }

  const mapa = {
    ACT: "ACTIVO",
    INA: "INACTIVO",
    PDT: "PENDIENTE"
  };

  return mapa[texto.toUpperCase()] || texto.toUpperCase();
};

const normalizarGeneroLegacy = (valor) => {
  const texto = normalizarValorLegacy(valor);

  if (!texto) {
    return null;
  }

  const mapa = {
    F: "F",
    M: "M"
  };

  return mapa[texto.toUpperCase()] || texto.toUpperCase();
};

const valorBooleano = (valor) => {
  if (
    valor === true ||
    valor === 1 ||
    valor === "1" ||
    valor === "true" ||
    valor === "TRUE"
  ) {
    return 1;
  }

  return 0;
};

const valorBooleanoNullable = (valor, valorActual = undefined) => {
  if (valor === undefined) {
    return valorActual;
  }

  if (valor === null || valor === "") {
    return null;
  }

  return valorBooleano(valor);
};

const normalizarTipoEmpleado = (tipoEmpleado) => {
  return normalizarTexto(tipoEmpleado)?.toUpperCase() || null;
};

const CONDICION_ACTUALIZACION_ADMINISTRATIVO = `
  EXISTS (
    SELECT 1
    FROM TB_EmpleadoGradoAcademico g
    WHERE g.CodigoEmpleado = e.CodigoEmpleado
  )
  AND EXISTS (
    SELECT 1
    FROM TB_EmpleadoExperienciaProfesional ex
    WHERE ex.CodigoEmpleado = e.CodigoEmpleado
  )
  AND EXISTS (
    SELECT 1
    FROM TB_EmpleadoDiplomado d
    WHERE d.CodigoEmpleado = e.CodigoEmpleado
  )
`;

const CONDICION_ACTUALIZACION_DOCENTE = `
  ${CONDICION_ACTUALIZACION_ADMINISTRATIVO}
  AND EXISTS (
    SELECT 1
    FROM TB_EmpleadoExperienciaDocente ed
    WHERE ed.CodigoEmpleado = e.CodigoEmpleado
  )
  AND EXISTS (
    SELECT 1
    FROM TB_EmpleadoLogroRelevante lr
    WHERE lr.CodigoEmpleado = e.CodigoEmpleado
  )
  AND EXISTS (
    SELECT 1
    FROM TB_EmpleadoDisenioCurricular dc
    WHERE dc.CodigoEmpleado = e.CodigoEmpleado
  )
  AND EXISTS (
    SELECT 1
    FROM TB_EmpleadoConocimientoClave cc
    WHERE cc.CodigoEmpleado = e.CodigoEmpleado
  )
  AND EXISTS (
    SELECT 1
    FROM TB_EmpleadoHabilidadRelevante hr
    WHERE hr.CodigoEmpleado = e.CodigoEmpleado
  )
  AND EXISTS (
    SELECT 1
    FROM TB_EmpleadoProyectoExperiencia pe
    WHERE pe.CodigoEmpleado = e.CodigoEmpleado
  )
  AND EXISTS (
    SELECT 1
    FROM TB_EmpleadoExperienciaSectorProductivo esp
    WHERE esp.CodigoEmpleado = e.CodigoEmpleado
  )
  AND EXISTS (
    SELECT 1
    FROM TB_EmpleadoVinculoIndustria vi
    WHERE vi.CodigoEmpleado = e.CodigoEmpleado
  )
  AND EXISTS (
    SELECT 1
    FROM TB_EmpleadoIdioma i
    WHERE i.CodigoEmpleado = e.CodigoEmpleado
  )
  AND EXISTS (
    SELECT 1
    FROM TB_EmpleadoCompetenciaDigital cd
    WHERE cd.CodigoEmpleado = e.CodigoEmpleado
  )
  AND EXISTS (
    SELECT 1
    FROM TB_EmpleadoMetodologiaActiva ma
    WHERE ma.CodigoEmpleado = e.CodigoEmpleado
  )
  AND EXISTS (
    SELECT 1
    FROM TB_EmpleadoPlataformaVirtual pv
    WHERE pv.CodigoEmpleado = e.CodigoEmpleado
  )
  AND EXISTS (
    SELECT 1
    FROM TB_EmpleadoPreferenciaDocencia pd
    WHERE pd.CodigoEmpleado = e.CodigoEmpleado
  )
`;

const normalizarListaAsignaturas = (payload = {}) => {
  const entrada =
    payload.asignaturas ??
    payload.Asignaturas ??
    payload.asignaturasJson ??
    payload.AsignaturasJson ??
    [];

  let lista = [];

  if (Array.isArray(entrada)) {
    lista = entrada;
  } else if (typeof entrada === "string") {
    const texto = entrada.trim();

    if (!texto) {
      lista = [];
    } else {
      try {
        const parseado = JSON.parse(texto);
        lista = Array.isArray(parseado) ? parseado : [texto];
      } catch (error) {
        lista = texto
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean);
      }
    }
  }

  return lista
    .map((item) => normalizarTexto(item))
    .filter(Boolean);
};

const obtenerNombreConocimiento = (payload = {}) => {
  return normalizarTexto(
    payload.nombreConocimiento ??
      payload.NombreConocimiento ??
      payload.conocimiento ??
      payload.Conocimiento ??
      payload.titulo ??
      payload.Titulo ??
      payload.nombre ??
      payload.Nombre ??
      payload.valor ??
      payload.Valor ??
      payload.texto ??
      payload.Texto
  );
};

const obtenerNombreHabilidad = (payload = {}) => {
  return normalizarTexto(
    payload.nombreHabilidad ??
      payload.NombreHabilidad ??
      payload.habilidad ??
      payload.Habilidad ??
      payload.titulo ??
      payload.Titulo ??
      payload.nombre ??
      payload.Nombre ??
      payload.valor ??
      payload.Valor ??
      payload.texto ??
      payload.Texto
  );
};

const obtenerDescripcion = (payload = {}) => {
  return normalizarTexto(payload.descripcion ?? payload.Descripcion);
};

const CAMPOS_INFO_PERSONAL_EDITABLES = [
  "NumeroIdentidad",
  "PrimerNombre",
  "SegundoNombre",
  "TercerNombre",
  "PrimerApellido",
  "SegundoApellido",
  "DireccionHogar",
  "IdEstadoCivil",
  "Telefono",
  "CelularEmpresa",
  "CorreoElectronicoPersonal",
  "CorreoElectronicoInstitucional",
  "FechaNacimiento",
  "NumeroIHSS",
  "NumeroRAP",
  "NumeroColegio",
  "LicenciaVehiculo",
  "FechaIngreso",
  "NumeroCuentaBancaria",
  "TieneHijos",
  "PoseeVehiculo",
  "MarcaVehiculo",
  "ModeloVehiculo",
  "AnioVehiculo",
  "NombreConyuge",
  "TelefonoConyuge",
  "NombreContactoEmergencia",
  "TelefonoContactoEmergencia",
  "RelacionContactoEmergencia",
  "NombreParroquia",
  "NombreParroco",
  "NombreMovimiento",
  "EstadoEmpleado",
  "Genero",
  "IdTipoSangre",
  "IdTipoEmpleado",
  "CodigoCampus",
  "LugarNacimiento",
  "Activo",
  "RutaImagenPerfil",
  "RutaHojaVida",
  "RutaDocumentoIdentidad",
  "RutaDocumentoColegiacion"
];

const obtenerPorCodigo = async (empCod) => {
  const sql = `
    SELECT
      EmpCod,
      EmpID,
      EmpNom1,
      EmpNom2,
      EmpApe1,
      EmpApe2,
      EmpNac,
      EmpDir,
      EmpEstCiv,
      EmpTel,
      EmpCel,
      EmpMail,
      EmpFchNac,
      EmpIHSS,
      EmpRAP,
      EmpNumCol,
      EmpNumLic,
      EmpFchIgr,
      EmpNumCue,
      EmpAuto,
      EmpAutoMar,
      EmpAutoMod,
      EmpAutoAnio,
      EmpCoyNom,
      EmpEmrNom,
      EmpEmrTel,
      EmpParNom,
      EmpParPdr,
      EmpParMov,
      EmpEst,
      EmpGen,
      EmpTipSgr,
      EmpCelWS,
      EmpSdeCod,
      EmpTip
    FROM \`uch-workcloud\`.empleados
    WHERE EmpCod = ?
    LIMIT 1
  `;

  const rows = await query(sql, [empCod]);
  return rows[0] || null;
};

const construirWhereColaboradoresCompletos = (search = null) => {
  const textoBusqueda = normalizarTexto(search);
  const where = [
    "e.Activo = 1",
    `(
      CASE
        WHEN e.IdTipoEmpleado IN (2, 3)
        THEN (${CONDICION_ACTUALIZACION_DOCENTE})
        ELSE (${CONDICION_ACTUALIZACION_ADMINISTRATIVO})
      END
      )`
  ];
  const params = [];

  if (textoBusqueda) {
    where.push(`(
      CONCAT_WS(
        ' ',
        e.PrimerNombre,
        e.SegundoNombre,
        e.TercerNombre,
        e.PrimerApellido,
        e.SegundoApellido
      ) LIKE ?
      OR e.CodigoEmpleado LIKE ?
      OR e.NumeroIdentidad LIKE ?
    )`);
    params.push(
      `%${textoBusqueda}%`,
      `%${textoBusqueda}%`,
      `%${textoBusqueda}%`
    );
  }

  return {
    whereSql: where.join(" AND "),
    params
  };
};

const listarColaboradores = async ({ page = 1, limit = 10, search = null } = {}) => {
  const pageNumber = Number(page) > 0 ? Number(page) : 1;
  const limitNumber = Number(limit) > 0 ? Number(limit) : 10;
  const offset = (pageNumber - 1) * limitNumber;
  const { whereSql, params } = construirWhereColaboradoresCompletos(search);

  const sqlDatos = `
    SELECT
      e.IdEmpleado,
      e.CodigoEmpleado,
      e.NumeroIdentidad,
      e.PrimerNombre,
      e.SegundoNombre,
      e.TercerNombre,
      e.PrimerApellido,
      e.SegundoApellido,
      CONCAT_WS(
        ' ',
        e.PrimerNombre,
        e.SegundoNombre,
        e.TercerNombre,
        e.PrimerApellido,
        e.SegundoApellido
      ) AS NombreCompleto,
      e.IdTipoEmpleado,
      cte.NombreTipoEmpleado
    FROM TB_Empleados e
    LEFT JOIN TB_CatTipoEmpleado cte
      ON cte.IdTipoEmpleado = e.IdTipoEmpleado
    WHERE ${whereSql}
    ORDER BY NombreCompleto ASC
    LIMIT ?
    OFFSET ?
  `;

  const sqlTotal = `
    SELECT COUNT(*) AS total
    FROM TB_Empleados e
    WHERE ${whereSql}
  `;

  const [data, totalRows] = await Promise.all([
    query(sqlDatos, [...params, limitNumber, offset]),
    query(sqlTotal, params)
  ]);

  const total = Number(totalRows[0]?.total || 0);

  return {
    data,
    pagination: {
      page: pageNumber,
      limit: limitNumber,
      total,
      totalPages: total === 0 ? 0 : Math.ceil(total / limitNumber)
    }
  };
};

const listarColaboradoresCompletos = async ({ search = null } = {}) => {
  const { whereSql, params } = construirWhereColaboradoresCompletos(search);

  const sql = `
    SELECT
      e.IdEmpleado,
      e.CodigoEmpleado,
      e.NumeroIdentidad,
      e.PrimerNombre,
      e.SegundoNombre,
      e.TercerNombre,
      e.PrimerApellido,
      e.SegundoApellido,
      CONCAT_WS(
        ' ',
        e.PrimerNombre,
        e.SegundoNombre,
        e.TercerNombre,
        e.PrimerApellido,
        e.SegundoApellido
      ) AS NombreCompleto,
      e.IdTipoEmpleado,
      cte.NombreTipoEmpleado
    FROM TB_Empleados e
    LEFT JOIN TB_CatTipoEmpleado cte
      ON cte.IdTipoEmpleado = e.IdTipoEmpleado
    WHERE ${whereSql}
    ORDER BY NombreCompleto ASC
  `;

  return query(sql, params);
};

const obtenerEstadoActualizacionEmpleado = async (empCod, tipoEmpleado) => {
  const tipoEmpleadoNormalizado = normalizarTipoEmpleado(tipoEmpleado);

  const sqlAdministrativo = `
    SELECT
      CASE
        WHEN EXISTS (
          SELECT 1
          FROM TB_Empleados e
          WHERE e.CodigoEmpleado = ?
            AND e.Activo = 1
            AND (${CONDICION_ACTUALIZACION_ADMINISTRATIVO})
        )
        THEN 'Actualizado'
        ELSE 'Pendiente'
      END AS EstadoActualizacion
  `;

  const sqlDocente = `
    SELECT
      CASE
        WHEN EXISTS (
          SELECT 1
          FROM TB_Empleados e
          WHERE e.CodigoEmpleado = ?
            AND e.Activo = 1
            AND (${CONDICION_ACTUALIZACION_DOCENTE})
        )
        THEN 'Actualizado'
        ELSE 'Pendiente'
      END AS EstadoActualizacion
  `;

  let sql = sqlAdministrativo;

  if (
    tipoEmpleadoNormalizado === "DOCENTE" ||
    tipoEmpleadoNormalizado === "ADMINISTRATIVO-DOCENTE" ||
    tipoEmpleadoNormalizado === "DOCENTE-ADMINISTRATIVO"
  ) {
    sql = sqlDocente;
  }

  const rows = await query(sql, [empCod]);

  return {
    CodigoEmpleado: empCod,
    TipoEmpleado: tipoEmpleadoNormalizado,
    EstadoActualizacion: rows[0]?.EstadoActualizacion || "Pendiente"
  };
};

const obtenerCatalogoIdPorNombre = async (tabla, idCampo, nombreCampo, valor) => {
  if (!valor) {
    return null;
  }

  const sql = `
    SELECT ${idCampo} AS id
    FROM ${tabla}
    WHERE UPPER(TRIM(${nombreCampo})) = UPPER(TRIM(?))
    LIMIT 1
  `;

  const rows = await query(sql, [valor]);
  return rows[0]?.id || null;
};

const obtenerEmpleadoNuevoPorCodigo = async (codigoEmpleado) => {
  const sql = `
    SELECT
      e.IdEmpleado,
      e.CodigoEmpleado,
      e.NumeroIdentidad,
      e.PrimerNombre,
      e.SegundoNombre,
      e.TercerNombre,
      e.PrimerApellido,
      e.SegundoApellido,
      e.DireccionHogar,
      e.IdEstadoCivil,
      e.Telefono,
      e.CelularEmpresa,
      e.CorreoElectronicoPersonal,
      e.CorreoElectronicoInstitucional,
      e.FechaNacimiento,
      e.NumeroIHSS,
      e.NumeroRAP,
      e.NumeroColegio,
      e.LicenciaVehiculo,
      e.FechaIngreso,
      e.NumeroCuentaBancaria,
      e.TieneHijos,
      e.PoseeVehiculo,
      e.MarcaVehiculo,
      e.ModeloVehiculo,
      e.AnioVehiculo,
      e.NombreConyuge,
      e.TelefonoConyuge,
      e.NombreContactoEmergencia,
      e.TelefonoContactoEmergencia,
      e.RelacionContactoEmergencia,
      e.NombreParroquia,
      e.NombreParroco,
      e.NombreMovimiento,
      e.EstadoEmpleado,
      e.Genero,
      e.IdTipoSangre,
      e.IdTipoEmpleado,
      e.CodigoCampus,
      e.LugarNacimiento,
      e.RutaImagenPerfil,
      e.RutaHojaVida,
      e.RutaDocumentoIdentidad,
      e.RutaDocumentoColegiacion,
      e.Activo,
      e.FechaCreacion,
      e.FechaActualizacion,
      cec.NombreEstadoCivil,
      cte.NombreTipoEmpleado,
      cts.NombreTipoSangre
    FROM TB_Empleados e
    LEFT JOIN TB_CatEstadoCivil cec
      ON cec.IdEstadoCivil = e.IdEstadoCivil
    LEFT JOIN TB_CatTipoEmpleado cte
      ON cte.IdTipoEmpleado = e.IdTipoEmpleado
    LEFT JOIN TB_CatTipoSangre cts
      ON cts.IdTipoSangre = e.IdTipoSangre
    WHERE CodigoEmpleado = ?
    LIMIT 1
  `;

  const rows = await query(sql, [codigoEmpleado]);
  return rows[0] || null;
};

const mapearFormularioInformacionPersonal = (empleado = {}) => {
  if (!empleado) {
    return null;
  }

  return {
    IdEmpleado: empleado.IdEmpleado ?? null,
    CodigoEmpleado: empleado.CodigoEmpleado ?? null,
    IdTipoEmpleado: empleado.IdTipoEmpleado ?? null,
    NombreTipoEmpleado: empleado.NombreTipoEmpleado ?? null,
    NumeroIdentidad: empleado.NumeroIdentidad ?? null,
    PrimerNombre: empleado.PrimerNombre ?? null,
    SegundoNombre: empleado.SegundoNombre ?? null,
    TercerNombre: empleado.TercerNombre ?? null,
    PrimerApellido: empleado.PrimerApellido ?? null,
    SegundoApellido: empleado.SegundoApellido ?? null,
    NombreCompleto: [
      empleado.PrimerNombre,
      empleado.SegundoNombre,
      empleado.TercerNombre,
      empleado.PrimerApellido,
      empleado.SegundoApellido
    ]
      .filter((valor) => normalizarTexto(valor))
      .join(" "),
    FechaNacimiento: empleado.FechaNacimiento ?? null,
    DireccionActual: empleado.DireccionHogar ?? null,
    Telefono: empleado.Telefono ?? null,
    IdEstadoCivil: empleado.IdEstadoCivil ?? null,
    NombreEstadoCivil: empleado.NombreEstadoCivil ?? null,
    NombreConyuge: empleado.NombreConyuge ?? null,
    TelefonoConyuge: empleado.TelefonoConyuge ?? null,
    NombreContactoEmergencia: empleado.NombreContactoEmergencia ?? null,
    TelefonoContactoEmergencia: empleado.TelefonoContactoEmergencia ?? null,
    RelacionContactoEmergencia:
      empleado.RelacionContactoEmergencia ?? null,
    CorreoElectronicoPersonal: empleado.CorreoElectronicoPersonal ?? null,
    CorreoElectronicoInstitucional:
      empleado.CorreoElectronicoInstitucional ?? null,
    NumeroColegio: empleado.NumeroColegio ?? null,
    TieneHijos: empleado.TieneHijos ?? null,
    RutaImagenPerfil: empleado.RutaImagenPerfil ?? null,
    RutaHojaVida: empleado.RutaHojaVida ?? null,
    RutaDocumentoIdentidad: empleado.RutaDocumentoIdentidad ?? null,
    RutaDocumentoColegiacion: empleado.RutaDocumentoColegiacion ?? null,
    PoseeVehiculo: empleado.PoseeVehiculo ?? null,
    MarcaVehiculo: empleado.MarcaVehiculo ?? null,
    ModeloVehiculo: empleado.ModeloVehiculo ?? null,
    AnioVehiculo: empleado.AnioVehiculo ?? null,
    IdTipoSangre: empleado.IdTipoSangre ?? null,
    NombreTipoSangre: empleado.NombreTipoSangre ?? null,
    inicializado: Boolean(empleado.inicializado),
    origen: empleado.origen ?? "nuevo"
  };
};

const construirDatosBaseDesdeLegacy = async (empCod, payload = {}) => {
  const legacy = await obtenerPorCodigo(empCod);

  if (!legacy) {
    return null;
  }

  const nombreEstadoCivil = normalizarEstadoCivilLegacy(legacy.EmpEstCiv);
  const nombreTipoSangre = normalizarTipoSangreLegacy(legacy.EmpTipSgr);
  const nombreTipoEmpleado = normalizarTipoEmpleadoLegacy(legacy.EmpTip);

  const [idEstadoCivil, idTipoSangre, idTipoEmpleado] = await Promise.all([
    obtenerCatalogoIdPorNombre(
      "TB_CatEstadoCivil",
      "IdEstadoCivil",
      "NombreEstadoCivil",
      nombreEstadoCivil
    ),
    obtenerCatalogoIdPorNombre(
      "TB_CatTipoSangre",
      "IdTipoSangre",
      "NombreTipoSangre",
      nombreTipoSangre
    ),
    obtenerCatalogoIdPorNombre(
    "TB_CatTipoEmpleado",
      "IdTipoEmpleado",
      "NombreTipoEmpleado",
      nombreTipoEmpleado
    )
  ]);

  const tieneHijosPayload = obtenerCampoPayload(
    payload,
    "tieneHijos",
    "TieneHijos"
  );

  return {
    CodigoEmpleado: legacy.EmpCod,
    NumeroIdentidad: normalizarTexto(
      payload.numeroIdentidad ?? legacy.EmpID
    ),
    PrimerNombre: normalizarTexto(payload.primerNombre ?? legacy.EmpNom1),
    SegundoNombre: normalizarTexto(payload.segundoNombre ?? legacy.EmpNom2),
    TercerNombre: normalizarTexto(payload.tercerNombre),
    PrimerApellido: normalizarTexto(payload.primerApellido ?? legacy.EmpApe1),
    SegundoApellido: normalizarTexto(
      payload.segundoApellido ?? legacy.EmpApe2
    ),
    DireccionHogar: normalizarTexto(payload.direccionHogar ?? legacy.EmpDir),
    IdEstadoCivil: payload.idEstadoCivil ?? idEstadoCivil,
    Telefono: normalizarTexto(payload.telefono ?? legacy.EmpTel),
    CelularEmpresa: normalizarTexto(
      payload.celularEmpresa ?? legacy.EmpCelWS ?? legacy.EmpCel
    ),
    CorreoElectronicoPersonal: normalizarTexto(
      payload.correoElectronicoPersonal
    ),
    CorreoElectronicoInstitucional: normalizarTexto(
      payload.correoElectronicoInstitucional ?? legacy.EmpMail
    ),
    FechaNacimiento: payload.fechaNacimiento ?? legacy.EmpFchNac ?? null,
    NumeroIHSS: normalizarTexto(payload.numeroIHSS ?? legacy.EmpIHSS),
    NumeroRAP: normalizarTexto(payload.numeroRAP ?? legacy.EmpRAP),
    NumeroColegio: normalizarTexto(
      payload.numeroColegio ?? legacy.EmpNumCol
    ),
    LicenciaVehiculo: normalizarTexto(
      payload.licenciaVehiculo ?? legacy.EmpNumLic
    ),
    FechaIngreso: payload.fechaIngreso ?? legacy.EmpFchIgr ?? null,
    NumeroCuentaBancaria: normalizarTexto(
      payload.numeroCuentaBancaria ?? legacy.EmpNumCue
    ),
    TieneHijos: valorBooleanoNullable(tieneHijosPayload, null),
    PoseeVehiculo:
      payload.poseeVehiculo !== undefined
        ? valorBooleano(payload.poseeVehiculo)
        : valorBooleano(legacy.EmpAuto),
    MarcaVehiculo: normalizarTexto(
      payload.marcaVehiculo ?? legacy.EmpAutoMar
    ),
    ModeloVehiculo: normalizarTexto(
      payload.modeloVehiculo ?? legacy.EmpAutoMod
    ),
    AnioVehiculo: payload.anioVehiculo ?? legacy.EmpAutoAnio ?? null,
    NombreConyuge: normalizarTexto(
      payload.nombreConyuge ?? legacy.EmpCoyNom
    ),
    TelefonoConyuge: normalizarTexto(
      payload.telefonoConyuge ?? payload.TelefonoConyuge
    ),
    NombreContactoEmergencia: normalizarTexto(
      payload.nombreContactoEmergencia ?? payload.NombreContactoEmergencia ?? legacy.EmpEmrNom
    ),
    TelefonoContactoEmergencia: normalizarTexto(
      payload.telefonoContactoEmergencia ?? payload.TelefonoContactoEmergencia ?? legacy.EmpEmrTel
    ),
    RelacionContactoEmergencia: normalizarTexto(
      payload.relacionContactoEmergencia ??
        payload.RelacionContactoEmergencia
    ),
    NombreParroquia: normalizarTexto(
      payload.nombreParroquia ?? legacy.EmpParNom
    ),
    NombreParroco: normalizarTexto(payload.nombreParroco ?? legacy.EmpParPdr),
    NombreMovimiento: normalizarTexto(
      payload.nombreMovimiento ?? legacy.EmpParMov
    ),
    EstadoEmpleado: normalizarTexto(
      payload.estadoEmpleado ?? normalizarEstadoEmpleadoLegacy(legacy.EmpEst)
    ),
    Genero: normalizarTexto(payload.genero ?? normalizarGeneroLegacy(legacy.EmpGen)),
    IdTipoSangre: payload.idTipoSangre ?? idTipoSangre,
    IdTipoEmpleado: payload.idTipoEmpleado ?? idTipoEmpleado,
    NombreTipoEmpleado: nombreTipoEmpleado,
    CodigoCampus: normalizarTexto(payload.codigoCampus ?? legacy.EmpSdeCod),
    LugarNacimiento: normalizarTexto(
      payload.lugarNacimiento ?? legacy.EmpNac
    ),
    RutaImagenPerfil: normalizarTexto(payload.rutaImagenPerfil),
    RutaHojaVida: normalizarTexto(payload.rutaHojaVida),
    RutaDocumentoIdentidad: normalizarTexto(payload.rutaDocumentoIdentidad),
    RutaDocumentoColegiacion: normalizarTexto(
      payload.rutaDocumentoColegiacion
    ),
    Activo:
      payload.activo !== undefined
        ? valorBooleano(payload.activo)
        : legacy.EmpEst === "INA"
          ? 0
          : 1
  };
};

const guardarInformacionPersonalDesdeLegacy = async (empCod, payload = {}) => {
  const datos = await construirDatosBaseDesdeLegacy(empCod, payload);

  if (!datos) {
    return null;
  }

  const valoresInsert = [
    datos.CodigoEmpleado,
    datos.NumeroIdentidad,
    datos.PrimerNombre,
    datos.SegundoNombre,
    datos.TercerNombre,
    datos.PrimerApellido,
    datos.SegundoApellido,
    datos.DireccionHogar,
    datos.IdEstadoCivil,
    datos.Telefono,
    datos.CelularEmpresa,
    datos.CorreoElectronicoPersonal,
    datos.CorreoElectronicoInstitucional,
    datos.FechaNacimiento,
    datos.NumeroIHSS,
    datos.NumeroRAP,
    datos.NumeroColegio,
    datos.LicenciaVehiculo,
    datos.FechaIngreso,
    datos.NumeroCuentaBancaria,
    datos.TieneHijos,
    datos.PoseeVehiculo,
    datos.MarcaVehiculo,
    datos.ModeloVehiculo,
    datos.AnioVehiculo,
    datos.NombreConyuge,
    datos.TelefonoConyuge,
    datos.NombreContactoEmergencia,
    datos.TelefonoContactoEmergencia,
    datos.RelacionContactoEmergencia,
    datos.NombreParroquia,
    datos.NombreParroco,
    datos.NombreMovimiento,
    datos.EstadoEmpleado,
    datos.Genero,
    datos.IdTipoSangre,
    datos.IdTipoEmpleado,
    datos.CodigoCampus,
    datos.LugarNacimiento,
    datos.RutaImagenPerfil,
    datos.RutaHojaVida,
    datos.RutaDocumentoIdentidad,
    datos.RutaDocumentoColegiacion,
    datos.Activo
  ];

  const sql = `
    INSERT INTO TB_Empleados (
      CodigoEmpleado,
      NumeroIdentidad,
      PrimerNombre,
      SegundoNombre,
      TercerNombre,
      PrimerApellido,
      SegundoApellido,
      DireccionHogar,
      IdEstadoCivil,
      Telefono,
      CelularEmpresa,
      CorreoElectronicoPersonal,
      CorreoElectronicoInstitucional,
      FechaNacimiento,
      NumeroIHSS,
      NumeroRAP,
      NumeroColegio,
      LicenciaVehiculo,
      FechaIngreso,
      NumeroCuentaBancaria,
      TieneHijos,
      PoseeVehiculo,
      MarcaVehiculo,
      ModeloVehiculo,
      AnioVehiculo,
      NombreConyuge,
      TelefonoConyuge,
      NombreContactoEmergencia,
      TelefonoContactoEmergencia,
      RelacionContactoEmergencia,
      NombreParroquia,
      NombreParroco,
      NombreMovimiento,
      EstadoEmpleado,
      Genero,
      IdTipoSangre,
      IdTipoEmpleado,
      CodigoCampus,
      LugarNacimiento,
      RutaImagenPerfil,
      RutaHojaVida,
      RutaDocumentoIdentidad,
      RutaDocumentoColegiacion,
      Activo
    ) VALUES (${valoresInsert.map(() => "?").join(", ")})
    ON DUPLICATE KEY UPDATE
      NumeroIdentidad = VALUES(NumeroIdentidad),
      PrimerNombre = VALUES(PrimerNombre),
      SegundoNombre = VALUES(SegundoNombre),
      TercerNombre = VALUES(TercerNombre),
      PrimerApellido = VALUES(PrimerApellido),
      SegundoApellido = VALUES(SegundoApellido),
      DireccionHogar = VALUES(DireccionHogar),
      IdEstadoCivil = VALUES(IdEstadoCivil),
      Telefono = VALUES(Telefono),
      CelularEmpresa = VALUES(CelularEmpresa),
      CorreoElectronicoPersonal = VALUES(CorreoElectronicoPersonal),
      CorreoElectronicoInstitucional = VALUES(CorreoElectronicoInstitucional),
      FechaNacimiento = VALUES(FechaNacimiento),
      NumeroIHSS = VALUES(NumeroIHSS),
      NumeroRAP = VALUES(NumeroRAP),
      NumeroColegio = VALUES(NumeroColegio),
      LicenciaVehiculo = VALUES(LicenciaVehiculo),
      FechaIngreso = VALUES(FechaIngreso),
      NumeroCuentaBancaria = VALUES(NumeroCuentaBancaria),
      TieneHijos = VALUES(TieneHijos),
      PoseeVehiculo = VALUES(PoseeVehiculo),
      MarcaVehiculo = VALUES(MarcaVehiculo),
      ModeloVehiculo = VALUES(ModeloVehiculo),
      AnioVehiculo = VALUES(AnioVehiculo),
      NombreConyuge = VALUES(NombreConyuge),
      TelefonoConyuge = VALUES(TelefonoConyuge),
      NombreContactoEmergencia = VALUES(NombreContactoEmergencia),
      TelefonoContactoEmergencia = VALUES(TelefonoContactoEmergencia),
      RelacionContactoEmergencia = VALUES(RelacionContactoEmergencia),
      NombreParroquia = VALUES(NombreParroquia),
      NombreParroco = VALUES(NombreParroco),
      NombreMovimiento = VALUES(NombreMovimiento),
      EstadoEmpleado = VALUES(EstadoEmpleado),
      Genero = VALUES(Genero),
      IdTipoSangre = VALUES(IdTipoSangre),
      IdTipoEmpleado = VALUES(IdTipoEmpleado),
      CodigoCampus = VALUES(CodigoCampus),
      LugarNacimiento = VALUES(LugarNacimiento),
      RutaImagenPerfil = VALUES(RutaImagenPerfil),
      RutaHojaVida = VALUES(RutaHojaVida),
      RutaDocumentoIdentidad = VALUES(RutaDocumentoIdentidad),
      RutaDocumentoColegiacion = VALUES(RutaDocumentoColegiacion),
      Activo = VALUES(Activo)
  `;

  await query(sql, valoresInsert);

  return obtenerEmpleadoNuevoPorCodigo(datos.CodigoEmpleado);
};

const mapearLegacyAFormulario = async (empCod) => {
  const datos = await construirDatosBaseDesdeLegacy(empCod, {});

  if (!datos) {
    return null;
  }

  return {
    IdEmpleado: null,
    ...datos,
    FechaCreacion: null,
    FechaActualizacion: null,
    inicializado: false,
    origen: "legacy"
  };
};

const obtenerFormularioEmpleado = async (empCod) => {
  let empleadoNuevo = await obtenerEmpleadoNuevoPorCodigo(empCod);

  if (!empleadoNuevo) {
    empleadoNuevo = await guardarInformacionPersonalDesdeLegacy(empCod, {});
  }

  if (empleadoNuevo) {
    const hijos = await listarHijosEmpleado(empCod);

    return {
      ...mapearFormularioInformacionPersonal({
        ...empleadoNuevo,
        inicializado: true,
        origen: "nuevo"
      }),
      Hijos: hijos || []
    };
  }

  const legacy = await mapearLegacyAFormulario(empCod);
  return {
    ...mapearFormularioInformacionPersonal(legacy),
    Hijos: []
  };
};

const inicializarEmpleadoDesdeLegacy = async (empCod, payload = {}) => {
  const empleadoExistente = await obtenerEmpleadoNuevoPorCodigo(empCod);

  if (empleadoExistente) {
    return {
      yaExistia: true,
      data: empleadoExistente
    };
  }

  const empleadoCreado = await guardarInformacionPersonalDesdeLegacy(
    empCod,
    payload
  );

  return {
    yaExistia: false,
    data: empleadoCreado
  };
};

const normalizarPayloadInformacionPersonal = (payload = {}) => {
  const mapa = {
    numeroIdentidad: "NumeroIdentidad",
    NumeroIdentidad: "NumeroIdentidad",
    primerNombre: "PrimerNombre",
    PrimerNombre: "PrimerNombre",
    segundoNombre: "SegundoNombre",
    SegundoNombre: "SegundoNombre",
    tercerNombre: "TercerNombre",
    TercerNombre: "TercerNombre",
    primerApellido: "PrimerApellido",
    PrimerApellido: "PrimerApellido",
    segundoApellido: "SegundoApellido",
    SegundoApellido: "SegundoApellido",
    direccionHogar: "DireccionHogar",
    DireccionHogar: "DireccionHogar",
    direccionActual: "DireccionHogar",
    DireccionActual: "DireccionHogar",
    idEstadoCivil: "IdEstadoCivil",
    IdEstadoCivil: "IdEstadoCivil",
    telefono: "Telefono",
    Telefono: "Telefono",
    celularEmpresa: "CelularEmpresa",
    CelularEmpresa: "CelularEmpresa",
    correoElectronicoPersonal: "CorreoElectronicoPersonal",
    CorreoElectronicoPersonal: "CorreoElectronicoPersonal",
    correoElectronicoInstitucional: "CorreoElectronicoInstitucional",
    CorreoElectronicoInstitucional: "CorreoElectronicoInstitucional",
    fechaNacimiento: "FechaNacimiento",
    FechaNacimiento: "FechaNacimiento",
    numeroIHSS: "NumeroIHSS",
    NumeroIHSS: "NumeroIHSS",
    numeroRAP: "NumeroRAP",
    NumeroRAP: "NumeroRAP",
    numeroColegio: "NumeroColegio",
    NumeroColegio: "NumeroColegio",
    licenciaVehiculo: "LicenciaVehiculo",
    LicenciaVehiculo: "LicenciaVehiculo",
    fechaIngreso: "FechaIngreso",
    FechaIngreso: "FechaIngreso",
    numeroCuentaBancaria: "NumeroCuentaBancaria",
    NumeroCuentaBancaria: "NumeroCuentaBancaria",
    tieneHijos: "TieneHijos",
    TieneHijos: "TieneHijos",
    poseeVehiculo: "PoseeVehiculo",
    PoseeVehiculo: "PoseeVehiculo",
    marcaVehiculo: "MarcaVehiculo",
    MarcaVehiculo: "MarcaVehiculo",
    modeloVehiculo: "ModeloVehiculo",
    ModeloVehiculo: "ModeloVehiculo",
    anioVehiculo: "AnioVehiculo",
    AnioVehiculo: "AnioVehiculo",
    nombreConyuge: "NombreConyuge",
    NombreConyuge: "NombreConyuge",
    telefonoConyuge: "TelefonoConyuge",
    TelefonoConyuge: "TelefonoConyuge",
    nombreContactoEmergencia: "NombreContactoEmergencia",
    NombreContactoEmergencia: "NombreContactoEmergencia",
    telefonoContactoEmergencia: "TelefonoContactoEmergencia",
    TelefonoContactoEmergencia: "TelefonoContactoEmergencia",
    relacionContactoEmergencia: "RelacionContactoEmergencia",
    RelacionContactoEmergencia: "RelacionContactoEmergencia",
    nombreParroquia: "NombreParroquia",
    NombreParroquia: "NombreParroquia",
    nombreParroco: "NombreParroco",
    NombreParroco: "NombreParroco",
    nombreMovimiento: "NombreMovimiento",
    NombreMovimiento: "NombreMovimiento",
    estadoEmpleado: "EstadoEmpleado",
    EstadoEmpleado: "EstadoEmpleado",
    genero: "Genero",
    Genero: "Genero",
    idTipoSangre: "IdTipoSangre",
    IdTipoSangre: "IdTipoSangre",
    idTipoEmpleado: "IdTipoEmpleado",
    IdTipoEmpleado: "IdTipoEmpleado",
    codigoCampus: "CodigoCampus",
    CodigoCampus: "CodigoCampus",
    lugarNacimiento: "LugarNacimiento",
    LugarNacimiento: "LugarNacimiento",
    rutaImagenPerfil: "RutaImagenPerfil",
    RutaImagenPerfil: "RutaImagenPerfil",
    rutaHojaVida: "RutaHojaVida",
    RutaHojaVida: "RutaHojaVida",
    rutaDocumentoIdentidad: "RutaDocumentoIdentidad",
    RutaDocumentoIdentidad: "RutaDocumentoIdentidad",
    rutaDocumentoColegiacion: "RutaDocumentoColegiacion",
    RutaDocumentoColegiacion: "RutaDocumentoColegiacion",
    activo: "Activo",
    Activo: "Activo"
  };

  const datos = {};

  for (const [campoEntrada, campoDb] of Object.entries(mapa)) {
    if (payload[campoEntrada] === undefined) {
      continue;
    }

    const valor = payload[campoEntrada];

    if (campoDb === "PoseeVehiculo" || campoDb === "Activo") {
      datos[campoDb] = valorBooleano(valor);
      continue;
    }

    if (campoDb === "TieneHijos") {
      datos[campoDb] = valorBooleanoNullable(valor, null);
      continue;
    }

    if (
      campoDb === "IdEstadoCivil" ||
      campoDb === "IdTipoSangre" ||
      campoDb === "IdTipoEmpleado" ||
      campoDb === "AnioVehiculo"
    ) {
      datos[campoDb] = valor === null || valor === "" ? null : Number(valor);
      continue;
    }

    datos[campoDb] = normalizarTexto(valor);
  }

  return datos;
};

const actualizarInformacionPersonal = async (empCod, payload = {}) => {
  const legacy = await obtenerPorCodigo(empCod);

  if (!legacy) {
    return null;
  }

  let empleadoNuevo = await obtenerEmpleadoNuevoPorCodigo(empCod);

  if (!empleadoNuevo) {
    empleadoNuevo = await guardarInformacionPersonalDesdeLegacy(empCod, {});
  }

  const datosActualizar = normalizarPayloadInformacionPersonal(payload);
  const tipoEmpleadoTexto = normalizarTexto(
    payload.tipoEmpleado ?? payload.TipoEmpleado
  );

  if (tipoEmpleadoTexto) {
    const idTipoEmpleado = await obtenerCatalogoIdPorNombre(
      "TB_CatTipoEmpleado",
      "IdTipoEmpleado",
      "NombreTipoEmpleado",
      tipoEmpleadoTexto
    );

    if (idTipoEmpleado) {
      datosActualizar.IdTipoEmpleado = idTipoEmpleado;
    }
  }

  const campos = Object.keys(datosActualizar).filter((campo) =>
    CAMPOS_INFO_PERSONAL_EDITABLES.includes(campo)
  );

  if (campos.length === 0) {
    return obtenerFormularioEmpleado(empCod);
  }

  const sql = `
    UPDATE TB_Empleados
    SET ${campos.map((campo) => `${campo} = ?`).join(", ")}
    WHERE CodigoEmpleado = ?
  `;

  await query(sql, [
    ...campos.map((campo) => datosActualizar[campo]),
    empCod
  ]);

  return obtenerFormularioEmpleado(empCod);
};

const asegurarEmpleadoInicializado = async (empCod) => {
  const legacy = await obtenerPorCodigo(empCod);

  if (!legacy) {
    return null;
  }

  let empleadoNuevo = await obtenerEmpleadoNuevoPorCodigo(empCod);

  if (!empleadoNuevo) {
    empleadoNuevo = await guardarInformacionPersonalDesdeLegacy(empCod, {});
  }

  return empleadoNuevo;
};

const actualizarDocumentoEmpleado = async (empCod, tipoDocumento, archivo) => {
  const empleado = await asegurarEmpleadoInicializado(empCod);

  if (!empleado) {
    return null;
  }

  const mapaColumnas = {
    "foto-perfil": "RutaImagenPerfil",
    foto: "RutaImagenPerfil",
    cv: "RutaHojaVida",
    "hoja-vida": "RutaHojaVida",
    identidad: "RutaDocumentoIdentidad",
    "documento-identidad": "RutaDocumentoIdentidad",
    colegiacion: "RutaDocumentoColegiacion",
    "documento-colegiacion": "RutaDocumentoColegiacion"
  };

  const columna = mapaColumnas[String(tipoDocumento).toLowerCase()];

  if (!columna) {
    throw new Error("Tipo de documento no valido");
  }

  const rutaArchivo = `/data/empleados/${empCod}/datos-generales/${archivo.filename}`;

  const sql = `
    UPDATE TB_Empleados
    SET ${columna} = ?
    WHERE CodigoEmpleado = ?
  `;

  await query(sql, [rutaArchivo, empCod]);

  return obtenerEmpleadoNuevoPorCodigo(empCod);
};

const listarHijosEmpleado = async (empCod) => {
  const empleado = await asegurarEmpleadoInicializado(empCod);

  if (!empleado) {
    return null;
  }

  return query(
    `
      SELECT
        eh.IdEmpleadoHijo,
        eh.IdEmpleado,
        eh.CodigoEmpleado,
        eh.NombreCompleto,
        eh.Sexo,
        eh.FechaNacimiento,
        eh.Activo,
        eh.FechaCreacion,
        eh.FechaActualizacion
      FROM TB_EmpleadoHijo eh
      WHERE eh.CodigoEmpleado = ?
        AND eh.Activo = 1
      ORDER BY eh.FechaNacimiento ASC, eh.IdEmpleadoHijo DESC
    `,
    [empleado.CodigoEmpleado]
  );
};

const crearHijoEmpleado = async (empCod, payload = {}) => {
  const empleado = await asegurarEmpleadoInicializado(empCod);

  if (!empleado) {
    return null;
  }

  const nombreCompleto = normalizarTexto(
    payload.nombreCompleto ?? payload.NombreCompleto
  );
  const sexo = normalizarTexto(payload.sexo ?? payload.Sexo);
  const fechaNacimiento = normalizarFechaOpcional(
    obtenerCampoPayload(payload, "fechaNacimiento", "FechaNacimiento"),
    null
  );

  const result = await query(
    `
      INSERT INTO TB_EmpleadoHijo (
        IdEmpleado,
        CodigoEmpleado,
        NombreCompleto,
        Sexo,
        FechaNacimiento,
        Activo
      ) VALUES (?, ?, ?, ?, ?, 1)
    `,
    [
      empleado.IdEmpleado,
      empleado.CodigoEmpleado,
      nombreCompleto,
      sexo,
      fechaNacimiento
    ]
  );

  await query(
    `
      UPDATE TB_Empleados
      SET TieneHijos = 1
      WHERE CodigoEmpleado = ?
    `,
    [empleado.CodigoEmpleado]
  );

  const rows = await query(
    `
      SELECT
        eh.IdEmpleadoHijo,
        eh.IdEmpleado,
        eh.CodigoEmpleado,
        eh.NombreCompleto,
        eh.Sexo,
        eh.FechaNacimiento,
        eh.Activo,
        eh.FechaCreacion,
        eh.FechaActualizacion
      FROM TB_EmpleadoHijo eh
      WHERE eh.IdEmpleadoHijo = ?
      LIMIT 1
    `,
    [result.insertId]
  );

  return rows[0] || null;
};

const actualizarTieneHijosDesdeTabla = async (codigoEmpleado) => {
  const rows = await query(
    `
      SELECT COUNT(*) AS total
      FROM TB_EmpleadoHijo
      WHERE CodigoEmpleado = ?
        AND Activo = 1
    `,
    [codigoEmpleado]
  );

  const total = Number(rows[0]?.total || 0);

  await query(
    `
      UPDATE TB_Empleados
      SET TieneHijos = ?
      WHERE CodigoEmpleado = ?
    `,
    [total > 0 ? 1 : 0, codigoEmpleado]
  );
};

const actualizarHijoEmpleado = async (empCod, idEmpleadoHijo, payload = {}) => {
  const empleado = await asegurarEmpleadoInicializado(empCod);

  if (!empleado) {
    return null;
  }

  const rowsActuales = await query(
    `
      SELECT
        *
      FROM TB_EmpleadoHijo
      WHERE IdEmpleadoHijo = ?
        AND CodigoEmpleado = ?
        AND Activo = 1
      LIMIT 1
    `,
    [idEmpleadoHijo, empleado.CodigoEmpleado]
  );

  const actual = rowsActuales[0] || null;

  if (!actual) {
    return null;
  }

  const nombreCompletoEntrada = obtenerCampoPayload(
    payload,
    "nombreCompleto",
    "NombreCompleto"
  );
  const sexoEntrada = obtenerCampoPayload(payload, "sexo", "Sexo");
  const fechaNacimientoEntrada = obtenerCampoPayload(
    payload,
    "fechaNacimiento",
    "FechaNacimiento"
  );

  await query(
    `
      UPDATE TB_EmpleadoHijo
      SET
        NombreCompleto = ?,
        Sexo = ?,
        FechaNacimiento = ?
      WHERE IdEmpleadoHijo = ?
        AND CodigoEmpleado = ?
    `,
    [
      nombreCompletoEntrada === undefined
        ? actual.NombreCompleto
        : normalizarTexto(nombreCompletoEntrada),
      sexoEntrada === undefined ? actual.Sexo : normalizarTexto(sexoEntrada),
      normalizarFechaOpcional(
        fechaNacimientoEntrada,
        actual.FechaNacimiento ?? null
      ),
      idEmpleadoHijo,
      empleado.CodigoEmpleado
    ]
  );

  const rows = await query(
    `
      SELECT
        eh.IdEmpleadoHijo,
        eh.IdEmpleado,
        eh.CodigoEmpleado,
        eh.NombreCompleto,
        eh.Sexo,
        eh.FechaNacimiento,
        eh.Activo,
        eh.FechaCreacion,
        eh.FechaActualizacion
      FROM TB_EmpleadoHijo eh
      WHERE eh.IdEmpleadoHijo = ?
      LIMIT 1
    `,
    [idEmpleadoHijo]
  );

  return rows[0] || null;
};

const eliminarHijoEmpleado = async (empCod, idEmpleadoHijo) => {
  const empleado = await asegurarEmpleadoInicializado(empCod);

  if (!empleado) {
    return null;
  }

  const result = await query(
    `
      UPDATE TB_EmpleadoHijo
      SET Activo = 0
      WHERE IdEmpleadoHijo = ?
        AND CodigoEmpleado = ?
    `,
    [idEmpleadoHijo, empleado.CodigoEmpleado]
  );

  if (result.affectedRows > 0) {
    await actualizarTieneHijosDesdeTabla(empleado.CodigoEmpleado);
  }

  return result.affectedRows > 0;
};

const obtenerEstadoAcademicoPorId = async (idEstadoAcademico) => {
  if (!idEstadoAcademico) {
    return null;
  }

  const sql = `
    SELECT
      IdEstadoAcademico,
      NombreEstadoAcademico
    FROM TB_CatEstadoAcademico
    WHERE IdEstadoAcademico = ?
    LIMIT 1
  `;

  const rows = await query(sql, [idEstadoAcademico]);
  return rows[0] || null;
};

const obtenerGradoAcademicoPorId = async (idGradoAcademico) => {
  if (!idGradoAcademico) {
    return null;
  }

  const sql = `
    SELECT
      IdGradoAcademico,
      NombreGradoAcademico
    FROM TB_CatGradoAcademico
    WHERE IdGradoAcademico = ?
    LIMIT 1
  `;

  const rows = await query(sql, [idGradoAcademico]);
  return rows[0] || null;
};

const listarGradosAcademicosEmpleado = async (empCod) => {
  const empleado = await asegurarEmpleadoInicializado(empCod);

  if (!empleado) {
    return null;
  }

  const sql = `
    SELECT
      ega.IdEmpleadoGradoAcademico,
      ega.CodigoEmpleado,
      ega.IdGradoAcademico,
      ega.IdEstadoAcademico,
      ega.NombreGradoAcademico,
      ega.Titulo,
      ega.EstadoAcademico,
      ega.AnioGraduacion,
      ega.RutaDocumentoAdjunto,
      ega.InstitucionEducativa,
      ega.FechaInicio,
      ega.FechaFin,
      ega.Graduado,
      ega.Activo,
      ega.FechaCreacion,
      ega.FechaActualizacion,
      cga.NombreGradoAcademico AS NombreGradoCatalogo,
      cea.NombreEstadoAcademico AS NombreEstadoCatalogo
    FROM TB_EmpleadoGradoAcademico ega
    LEFT JOIN TB_CatGradoAcademico cga
      ON cga.IdGradoAcademico = ega.IdGradoAcademico
    LEFT JOIN TB_CatEstadoAcademico cea
      ON cea.IdEstadoAcademico = ega.IdEstadoAcademico
    WHERE ega.CodigoEmpleado = ?
      AND ega.Activo = 1
    ORDER BY ega.IdEmpleadoGradoAcademico DESC
  `;

  return query(sql, [empleado.CodigoEmpleado]);
};

const crearGradoAcademicoEmpleado = async (empCod, payload = {}, archivo = null) => {
  const empleado = await asegurarEmpleadoInicializado(empCod);

  if (!empleado) {
    return null;
  }

  const idGradoAcademico =
    payload.idGradoAcademico ?? payload.IdGradoAcademico ?? null;
  const idEstadoAcademico =
    payload.idEstadoAcademico ?? payload.IdEstadoAcademico ?? null;

  const [gradoAcademico, estadoAcademico] = await Promise.all([
    obtenerGradoAcademicoPorId(idGradoAcademico),
    obtenerEstadoAcademicoPorId(idEstadoAcademico)
  ]);

  if (idGradoAcademico && !gradoAcademico) {
    throw new Error("El grado academico seleccionado no existe");
  }

  if (idEstadoAcademico && !estadoAcademico) {
    throw new Error("El estado academico seleccionado no existe");
  }

  const nombreEstadoAcademico =
    normalizarTexto(payload.estadoAcademico ?? payload.EstadoAcademico) ||
    estadoAcademico?.NombreEstadoAcademico ||
    null;

  const sql = `
    INSERT INTO TB_EmpleadoGradoAcademico (
      IdEmpleado,
      CodigoEmpleado,
      IdGradoAcademico,
      IdEstadoAcademico,
      NombreGradoAcademico,
      Titulo,
      EstadoAcademico,
      AnioGraduacion,
      RutaDocumentoAdjunto,
      InstitucionEducativa,
      Graduado,
      Activo
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
  `;

  const rutaDocumentoAdjunto = archivo
    ? `/data/empleados/${empCod}/documentos-academicos/${archivo.filename}`
    : null;

  const graduado =
    nombreEstadoAcademico &&
    normalizarTexto(nombreEstadoAcademico)?.toUpperCase() === "FINALIZADO"
      ? 1
      : 0;

  const result = await query(sql, [
    empleado.IdEmpleado,
    empleado.CodigoEmpleado,
    idGradoAcademico,
    idEstadoAcademico,
    gradoAcademico?.NombreGradoAcademico ||
      normalizarTexto(payload.nombreGradoAcademico ?? payload.NombreGradoAcademico),
    normalizarTexto(payload.titulo ?? payload.Titulo),
    nombreEstadoAcademico,
    payload.anioGraduacion ?? payload.AnioGraduacion ?? null,
    rutaDocumentoAdjunto,
    normalizarTexto(
      payload.institucionEducativa ??
        payload.InstitucionEducativa ??
        payload.institucion
    ),
    graduado
  ]);

  const rows = await query(
    `
      SELECT
        ega.IdEmpleadoGradoAcademico,
        ega.CodigoEmpleado,
        ega.IdGradoAcademico,
        ega.IdEstadoAcademico,
        ega.NombreGradoAcademico,
        ega.Titulo,
        ega.EstadoAcademico,
        ega.AnioGraduacion,
        ega.RutaDocumentoAdjunto,
        ega.InstitucionEducativa,
        ega.Graduado,
        ega.Activo,
        ega.FechaCreacion,
        ega.FechaActualizacion
      FROM TB_EmpleadoGradoAcademico ega
      WHERE ega.IdEmpleadoGradoAcademico = ?
      LIMIT 1
    `,
    [result.insertId]
  );

  return rows[0] || null;
};

const actualizarGradoAcademicoEmpleado = async (
  empCod,
  idEmpleadoGradoAcademico,
  payload = {},
  archivo = null
) => {
  const empleado = await asegurarEmpleadoInicializado(empCod);

  if (!empleado) {
    return null;
  }

  const rowsActuales = await query(
    `
      SELECT
        *
      FROM TB_EmpleadoGradoAcademico
      WHERE IdEmpleadoGradoAcademico = ?
        AND CodigoEmpleado = ?
        AND Activo = 1
      LIMIT 1
    `,
    [idEmpleadoGradoAcademico, empleado.CodigoEmpleado]
  );

  const actual = rowsActuales[0] || null;

  if (!actual) {
    return null;
  }

  const idGradoAcademico =
    payload.idGradoAcademico ?? payload.IdGradoAcademico ?? actual.IdGradoAcademico;
  const idEstadoAcademico =
    payload.idEstadoAcademico ??
    payload.IdEstadoAcademico ??
    actual.IdEstadoAcademico;

  const [gradoAcademico, estadoAcademico] = await Promise.all([
    obtenerGradoAcademicoPorId(idGradoAcademico),
    obtenerEstadoAcademicoPorId(idEstadoAcademico)
  ]);

  if (idGradoAcademico && !gradoAcademico) {
    throw new Error("El grado academico seleccionado no existe");
  }

  if (idEstadoAcademico && !estadoAcademico) {
    throw new Error("El estado academico seleccionado no existe");
  }

  const nombreEstadoAcademico =
    normalizarTexto(payload.estadoAcademico ?? payload.EstadoAcademico) ||
    estadoAcademico?.NombreEstadoAcademico ||
    actual.EstadoAcademico ||
    null;

  const graduado =
    nombreEstadoAcademico &&
    normalizarTexto(nombreEstadoAcademico)?.toUpperCase() === "FINALIZADO"
      ? 1
      : 0;

  const rutaDocumentoAdjunto = archivo
    ? `/data/empleados/${empCod}/documentos-academicos/${archivo.filename}`
    : actual.RutaDocumentoAdjunto;

  await query(
    `
      UPDATE TB_EmpleadoGradoAcademico
      SET
        IdGradoAcademico = ?,
        IdEstadoAcademico = ?,
        NombreGradoAcademico = ?,
        Titulo = ?,
        EstadoAcademico = ?,
        AnioGraduacion = ?,
        RutaDocumentoAdjunto = ?,
        InstitucionEducativa = ?,
        Graduado = ?
      WHERE IdEmpleadoGradoAcademico = ?
        AND CodigoEmpleado = ?
    `,
    [
      idGradoAcademico,
      idEstadoAcademico,
      gradoAcademico?.NombreGradoAcademico ||
        normalizarTexto(
          payload.nombreGradoAcademico ?? payload.NombreGradoAcademico
        ) ||
        actual.NombreGradoAcademico,
      normalizarTexto(payload.titulo ?? payload.Titulo) || actual.Titulo,
      nombreEstadoAcademico,
      payload.anioGraduacion ?? payload.AnioGraduacion ?? actual.AnioGraduacion,
      rutaDocumentoAdjunto,
      normalizarTexto(
        payload.institucionEducativa ??
          payload.InstitucionEducativa ??
          payload.institucion
      ) || actual.InstitucionEducativa,
      graduado,
      idEmpleadoGradoAcademico,
      empleado.CodigoEmpleado
    ]
  );

  const rows = await query(
    `
      SELECT
        ega.IdEmpleadoGradoAcademico,
        ega.CodigoEmpleado,
        ega.IdGradoAcademico,
        ega.IdEstadoAcademico,
        ega.NombreGradoAcademico,
        ega.Titulo,
        ega.EstadoAcademico,
        ega.AnioGraduacion,
        ega.RutaDocumentoAdjunto,
        ega.InstitucionEducativa,
        ega.Graduado,
        ega.Activo,
        ega.FechaCreacion,
        ega.FechaActualizacion
      FROM TB_EmpleadoGradoAcademico ega
      WHERE ega.IdEmpleadoGradoAcademico = ?
      LIMIT 1
    `,
    [idEmpleadoGradoAcademico]
  );

  return rows[0] || null;
};

const eliminarGradoAcademicoEmpleado = async (empCod, idEmpleadoGradoAcademico) => {
  const empleado = await asegurarEmpleadoInicializado(empCod);

  if (!empleado) {
    return null;
  }

  const sql = `
    UPDATE TB_EmpleadoGradoAcademico
    SET Activo = 0
    WHERE IdEmpleadoGradoAcademico = ?
      AND CodigoEmpleado = ?
  `;

  const result = await query(sql, [
    idEmpleadoGradoAcademico,
    empleado.CodigoEmpleado
  ]);

  return result.affectedRows > 0;
};

const obtenerTipoDiplomadoPorId = async (idTipoDiplomado) => {
  if (!idTipoDiplomado) {
    return null;
  }

  const sql = `
    SELECT
      IdTipoDiplomado,
      NombreTipoDiplomado
    FROM TB_CatTipoDiplomado
    WHERE IdTipoDiplomado = ?
    LIMIT 1
  `;

  const rows = await query(sql, [idTipoDiplomado]);
  return rows[0] || null;
};

const obtenerNivelExperienciaDocentePorId = async (idNivelExperienciaDocente) => {
  if (!idNivelExperienciaDocente) {
    return null;
  }

  const sql = `
    SELECT
      IdNivelExperienciaDocente,
      NombreNivelExperienciaDocente
    FROM TB_CatNivelExperienciaDocente
    WHERE IdNivelExperienciaDocente = ?
    LIMIT 1
  `;

  const rows = await query(sql, [idNivelExperienciaDocente]);
  return rows[0] || null;
};

const listarAsignaturasExperienciaDocente = async (idEmpleadoExperienciaDocente) => {
  const sql = `
    SELECT
      IdEmpleadoExperienciaDocenteAsignatura,
      IdEmpleadoExperienciaDocente,
      NombreAsignatura,
      Activo,
      FechaCreacion,
      FechaActualizacion
    FROM TB_EmpleadoExperienciaDocenteAsignatura
    WHERE IdEmpleadoExperienciaDocente = ?
      AND Activo = 1
    ORDER BY IdEmpleadoExperienciaDocenteAsignatura ASC
  `;

  return query(sql, [idEmpleadoExperienciaDocente]);
};

const reemplazarAsignaturasExperienciaDocente = async (
  idEmpleadoExperienciaDocente,
  asignaturas = []
) => {
  await query(
    `
      UPDATE TB_EmpleadoExperienciaDocenteAsignatura
      SET Activo = 0
      WHERE IdEmpleadoExperienciaDocente = ?
    `,
    [idEmpleadoExperienciaDocente]
  );

  for (const asignatura of asignaturas) {
    await query(
      `
        INSERT INTO TB_EmpleadoExperienciaDocenteAsignatura (
          IdEmpleadoExperienciaDocente,
          NombreAsignatura,
          Activo
        ) VALUES (?, ?, 1)
      `,
      [idEmpleadoExperienciaDocente, asignatura]
    );
  }
};

const listarExperienciasDocentesEmpleado = async (empCod) => {
  const empleado = await asegurarEmpleadoInicializado(empCod);

  if (!empleado) {
    return null;
  }

  const experiencias = await query(
    `
      SELECT
        eed.IdEmpleadoExperienciaDocente,
        eed.CodigoEmpleado,
        eed.IdNivelExperienciaDocente,
        eed.AniosExperiencia,
        eed.Activo,
        eed.FechaCreacion,
        eed.FechaActualizacion,
        cned.NombreNivelExperienciaDocente
      FROM TB_EmpleadoExperienciaDocente eed
      LEFT JOIN TB_CatNivelExperienciaDocente cned
        ON cned.IdNivelExperienciaDocente = eed.IdNivelExperienciaDocente
      WHERE eed.CodigoEmpleado = ?
        AND eed.Activo = 1
      ORDER BY eed.IdEmpleadoExperienciaDocente DESC
    `,
    [empleado.CodigoEmpleado]
  );

  const experienciasConAsignaturas = [];

  for (const experiencia of experiencias) {
    const asignaturas = await listarAsignaturasExperienciaDocente(
      experiencia.IdEmpleadoExperienciaDocente
    );

    experienciasConAsignaturas.push({
      ...experiencia,
      Asignaturas: asignaturas
    });
  }

  return experienciasConAsignaturas;
};

const crearExperienciaDocenteEmpleado = async (empCod, payload = {}) => {
  const empleado = await asegurarEmpleadoInicializado(empCod);

  if (!empleado) {
    return null;
  }

  const idNivelExperienciaDocente =
    payload.idNivelExperienciaDocente ??
    payload.IdNivelExperienciaDocente ??
    null;
  const nivel = await obtenerNivelExperienciaDocentePorId(
    idNivelExperienciaDocente
  );

  if (idNivelExperienciaDocente && !nivel) {
    throw new Error("El nivel de experiencia docente seleccionado no existe");
  }

  const asignaturas = normalizarListaAsignaturas(payload);

  const result = await query(
    `
      INSERT INTO TB_EmpleadoExperienciaDocente (
        IdEmpleado,
        CodigoEmpleado,
        IdNivelExperienciaDocente,
        AniosExperiencia,
        Activo
      ) VALUES (?, ?, ?, ?, 1)
    `,
    [
      empleado.IdEmpleado,
      empleado.CodigoEmpleado,
      idNivelExperienciaDocente,
      payload.aniosExperiencia ?? payload.AniosExperiencia ?? null
    ]
  );

  await reemplazarAsignaturasExperienciaDocente(result.insertId, asignaturas);

  const rows = await query(
    `
      SELECT
        eed.IdEmpleadoExperienciaDocente,
        eed.CodigoEmpleado,
        eed.IdNivelExperienciaDocente,
        eed.AniosExperiencia,
        eed.Activo,
        eed.FechaCreacion,
        eed.FechaActualizacion,
        cned.NombreNivelExperienciaDocente
      FROM TB_EmpleadoExperienciaDocente eed
      LEFT JOIN TB_CatNivelExperienciaDocente cned
        ON cned.IdNivelExperienciaDocente = eed.IdNivelExperienciaDocente
      WHERE eed.IdEmpleadoExperienciaDocente = ?
      LIMIT 1
    `,
    [result.insertId]
  );

  const experiencia = rows[0] || null;

  if (!experiencia) {
    return null;
  }

  return {
    ...experiencia,
    Asignaturas: await listarAsignaturasExperienciaDocente(result.insertId)
  };
};

const actualizarExperienciaDocenteEmpleado = async (
  empCod,
  idEmpleadoExperienciaDocente,
  payload = {}
) => {
  const empleado = await asegurarEmpleadoInicializado(empCod);

  if (!empleado) {
    return null;
  }

  const rowsActuales = await query(
    `
      SELECT
        *
      FROM TB_EmpleadoExperienciaDocente
      WHERE IdEmpleadoExperienciaDocente = ?
        AND CodigoEmpleado = ?
        AND Activo = 1
      LIMIT 1
    `,
    [idEmpleadoExperienciaDocente, empleado.CodigoEmpleado]
  );

  const actual = rowsActuales[0] || null;

  if (!actual) {
    return null;
  }

  const idNivelExperienciaDocente =
    payload.idNivelExperienciaDocente ??
    payload.IdNivelExperienciaDocente ??
    actual.IdNivelExperienciaDocente;
  const nivel = await obtenerNivelExperienciaDocentePorId(
    idNivelExperienciaDocente
  );

  if (idNivelExperienciaDocente && !nivel) {
    throw new Error("El nivel de experiencia docente seleccionado no existe");
  }

  await query(
    `
      UPDATE TB_EmpleadoExperienciaDocente
      SET
        IdNivelExperienciaDocente = ?,
        AniosExperiencia = ?
      WHERE IdEmpleadoExperienciaDocente = ?
        AND CodigoEmpleado = ?
    `,
    [
      idNivelExperienciaDocente,
      payload.aniosExperiencia ??
        payload.AniosExperiencia ??
        actual.AniosExperiencia,
      idEmpleadoExperienciaDocente,
      empleado.CodigoEmpleado
    ]
  );

  if (
    payload.asignaturas !== undefined ||
    payload.Asignaturas !== undefined ||
    payload.asignaturasJson !== undefined ||
    payload.AsignaturasJson !== undefined
  ) {
    await reemplazarAsignaturasExperienciaDocente(
      idEmpleadoExperienciaDocente,
      normalizarListaAsignaturas(payload)
    );
  }

  const rows = await query(
    `
      SELECT
        eed.IdEmpleadoExperienciaDocente,
        eed.CodigoEmpleado,
        eed.IdNivelExperienciaDocente,
        eed.AniosExperiencia,
        eed.Activo,
        eed.FechaCreacion,
        eed.FechaActualizacion,
        cned.NombreNivelExperienciaDocente
      FROM TB_EmpleadoExperienciaDocente eed
      LEFT JOIN TB_CatNivelExperienciaDocente cned
        ON cned.IdNivelExperienciaDocente = eed.IdNivelExperienciaDocente
      WHERE eed.IdEmpleadoExperienciaDocente = ?
      LIMIT 1
    `,
    [idEmpleadoExperienciaDocente]
  );

  const experiencia = rows[0] || null;

  if (!experiencia) {
    return null;
  }

  return {
    ...experiencia,
    Asignaturas: await listarAsignaturasExperienciaDocente(
      idEmpleadoExperienciaDocente
    )
  };
};

const eliminarExperienciaDocenteEmpleado = async (
  empCod,
  idEmpleadoExperienciaDocente
) => {
  const empleado = await asegurarEmpleadoInicializado(empCod);

  if (!empleado) {
    return null;
  }

  const result = await query(
    `
      UPDATE TB_EmpleadoExperienciaDocente
      SET Activo = 0
      WHERE IdEmpleadoExperienciaDocente = ?
        AND CodigoEmpleado = ?
    `,
    [idEmpleadoExperienciaDocente, empleado.CodigoEmpleado]
  );

  return result.affectedRows > 0;
};

const listarLogrosRelevantesEmpleado = async (empCod) => {
  const empleado = await asegurarEmpleadoInicializado(empCod);

  if (!empleado) {
    return null;
  }

  return query(
    `
      SELECT
        IdEmpleadoLogroRelevante,
        CodigoEmpleado,
        TipoLogro,
        Anio,
        Descripcion,
        RutaDocumentoAdjunto,
        Activo,
        FechaCreacion,
        FechaActualizacion
      FROM TB_EmpleadoLogroRelevante
      WHERE CodigoEmpleado = ?
        AND Activo = 1
      ORDER BY IdEmpleadoLogroRelevante DESC
    `,
    [empleado.CodigoEmpleado]
  );
};

const crearLogroRelevanteEmpleado = async (empCod, payload = {}, archivo = null) => {
  const empleado = await asegurarEmpleadoInicializado(empCod);

  if (!empleado) {
    return null;
  }

  const rutaDocumentoAdjunto = archivo
    ? `/data/empleados/${empCod}/experiencia-academica-logros/${archivo.filename}`
    : null;

  const result = await query(
    `
      INSERT INTO TB_EmpleadoLogroRelevante (
        IdEmpleado,
        CodigoEmpleado,
        TipoLogro,
        Anio,
        Descripcion,
        RutaDocumentoAdjunto,
        Activo
      ) VALUES (?, ?, ?, ?, ?, ?, 1)
    `,
    [
      empleado.IdEmpleado,
      empleado.CodigoEmpleado,
      normalizarTexto(payload.tipoLogro ?? payload.TipoLogro),
      payload.anio ?? payload.Anio ?? null,
      normalizarTexto(payload.descripcion ?? payload.Descripcion),
      rutaDocumentoAdjunto
    ]
  );

  const rows = await query(
    `
      SELECT
        IdEmpleadoLogroRelevante,
        CodigoEmpleado,
        TipoLogro,
        Anio,
        Descripcion,
        RutaDocumentoAdjunto,
        Activo,
        FechaCreacion,
        FechaActualizacion
      FROM TB_EmpleadoLogroRelevante
      WHERE IdEmpleadoLogroRelevante = ?
      LIMIT 1
    `,
    [result.insertId]
  );

  return rows[0] || null;
};

const actualizarLogroRelevanteEmpleado = async (
  empCod,
  idEmpleadoLogroRelevante,
  payload = {},
  archivo = null
) => {
  const empleado = await asegurarEmpleadoInicializado(empCod);

  if (!empleado) {
    return null;
  }

  const rowsActuales = await query(
    `
      SELECT
        *
      FROM TB_EmpleadoLogroRelevante
      WHERE IdEmpleadoLogroRelevante = ?
        AND CodigoEmpleado = ?
        AND Activo = 1
      LIMIT 1
    `,
    [idEmpleadoLogroRelevante, empleado.CodigoEmpleado]
  );

  const actual = rowsActuales[0] || null;

  if (!actual) {
    return null;
  }

  const rutaDocumentoAdjunto = archivo
    ? `/data/empleados/${empCod}/experiencia-academica-logros/${archivo.filename}`
    : actual.RutaDocumentoAdjunto;

  await query(
    `
      UPDATE TB_EmpleadoLogroRelevante
      SET
        TipoLogro = ?,
        Anio = ?,
        Descripcion = ?,
        RutaDocumentoAdjunto = ?
      WHERE IdEmpleadoLogroRelevante = ?
        AND CodigoEmpleado = ?
    `,
    [
      normalizarTexto(payload.tipoLogro ?? payload.TipoLogro) || actual.TipoLogro,
      payload.anio ?? payload.Anio ?? actual.Anio ?? null,
      normalizarTexto(payload.descripcion ?? payload.Descripcion) ||
        actual.Descripcion,
      rutaDocumentoAdjunto,
      idEmpleadoLogroRelevante,
      empleado.CodigoEmpleado
    ]
  );

  const rows = await query(
    `
      SELECT
        IdEmpleadoLogroRelevante,
        CodigoEmpleado,
        TipoLogro,
        Anio,
        Descripcion,
        RutaDocumentoAdjunto,
        Activo,
        FechaCreacion,
        FechaActualizacion
      FROM TB_EmpleadoLogroRelevante
      WHERE IdEmpleadoLogroRelevante = ?
      LIMIT 1
    `,
    [idEmpleadoLogroRelevante]
  );

  return rows[0] || null;
};

const eliminarLogroRelevanteEmpleado = async (empCod, idEmpleadoLogroRelevante) => {
  const empleado = await asegurarEmpleadoInicializado(empCod);

  if (!empleado) {
    return null;
  }

  const result = await query(
    `
      UPDATE TB_EmpleadoLogroRelevante
      SET Activo = 0
      WHERE IdEmpleadoLogroRelevante = ?
        AND CodigoEmpleado = ?
    `,
    [idEmpleadoLogroRelevante, empleado.CodigoEmpleado]
  );

  return result.affectedRows > 0;
};

const listarDiseniosCurricularesEmpleado = async (empCod) => {
  const empleado = await asegurarEmpleadoInicializado(empCod);

  if (!empleado) {
    return null;
  }

  return query(
    `
      SELECT
        IdEmpleadoDisenioCurricular,
        CodigoEmpleado,
        NombrePlan,
        Descripcion,
        Activo,
        FechaCreacion,
        FechaActualizacion
      FROM TB_EmpleadoDisenioCurricular
      WHERE CodigoEmpleado = ?
        AND Activo = 1
      ORDER BY IdEmpleadoDisenioCurricular DESC
    `,
    [empleado.CodigoEmpleado]
  );
};

const crearDisenioCurricularEmpleado = async (empCod, payload = {}) => {
  const empleado = await asegurarEmpleadoInicializado(empCod);

  if (!empleado) {
    return null;
  }

  const result = await query(
    `
      INSERT INTO TB_EmpleadoDisenioCurricular (
        IdEmpleado,
        CodigoEmpleado,
        NombrePlan,
        Descripcion,
        Activo
      ) VALUES (?, ?, ?, ?, 1)
    `,
    [
      empleado.IdEmpleado,
      empleado.CodigoEmpleado,
      normalizarTexto(payload.nombrePlan ?? payload.NombrePlan),
      normalizarTexto(payload.descripcion ?? payload.Descripcion)
    ]
  );

  const rows = await query(
    `
      SELECT
        IdEmpleadoDisenioCurricular,
        CodigoEmpleado,
        NombrePlan,
        Descripcion,
        Activo,
        FechaCreacion,
        FechaActualizacion
      FROM TB_EmpleadoDisenioCurricular
      WHERE IdEmpleadoDisenioCurricular = ?
      LIMIT 1
    `,
    [result.insertId]
  );

  return rows[0] || null;
};

const actualizarDisenioCurricularEmpleado = async (
  empCod,
  idEmpleadoDisenioCurricular,
  payload = {}
) => {
  const empleado = await asegurarEmpleadoInicializado(empCod);

  if (!empleado) {
    return null;
  }

  const rowsActuales = await query(
    `
      SELECT
        *
      FROM TB_EmpleadoDisenioCurricular
      WHERE IdEmpleadoDisenioCurricular = ?
        AND CodigoEmpleado = ?
        AND Activo = 1
      LIMIT 1
    `,
    [idEmpleadoDisenioCurricular, empleado.CodigoEmpleado]
  );

  const actual = rowsActuales[0] || null;

  if (!actual) {
    return null;
  }

  await query(
    `
      UPDATE TB_EmpleadoDisenioCurricular
      SET
        NombrePlan = ?,
        Descripcion = ?
      WHERE IdEmpleadoDisenioCurricular = ?
        AND CodigoEmpleado = ?
    `,
    [
      normalizarTexto(payload.nombrePlan ?? payload.NombrePlan) || actual.NombrePlan,
      normalizarTexto(payload.descripcion ?? payload.Descripcion) ||
        actual.Descripcion,
      idEmpleadoDisenioCurricular,
      empleado.CodigoEmpleado
    ]
  );

  const rows = await query(
    `
      SELECT
        IdEmpleadoDisenioCurricular,
        CodigoEmpleado,
        NombrePlan,
        Descripcion,
        Activo,
        FechaCreacion,
        FechaActualizacion
      FROM TB_EmpleadoDisenioCurricular
      WHERE IdEmpleadoDisenioCurricular = ?
      LIMIT 1
    `,
    [idEmpleadoDisenioCurricular]
  );

  return rows[0] || null;
};

const eliminarDisenioCurricularEmpleado = async (
  empCod,
  idEmpleadoDisenioCurricular
) => {
  const empleado = await asegurarEmpleadoInicializado(empCod);

  if (!empleado) {
    return null;
  }

  const result = await query(
    `
      UPDATE TB_EmpleadoDisenioCurricular
      SET Activo = 0
      WHERE IdEmpleadoDisenioCurricular = ?
        AND CodigoEmpleado = ?
    `,
    [idEmpleadoDisenioCurricular, empleado.CodigoEmpleado]
  );

  return result.affectedRows > 0;
};

const listarExperienciasProfesionalesEmpleado = async (empCod) => {
  const empleado = await asegurarEmpleadoInicializado(empCod);

  if (!empleado) {
    return null;
  }

  const sql = `
    SELECT
      IdEmpleadoExperienciaProfesional,
      CodigoEmpleado,
      Empresa,
      Cargo,
      FechaDesde,
      FechaHasta,
      Activo,
      FechaCreacion,
      FechaActualizacion
    FROM TB_EmpleadoExperienciaProfesional
    WHERE CodigoEmpleado = ?
      AND Activo = 1
    ORDER BY IdEmpleadoExperienciaProfesional DESC
  `;

  return query(sql, [empleado.CodigoEmpleado]);
};

const crearExperienciaProfesionalEmpleado = async (empCod, payload = {}) => {
  const empleado = await asegurarEmpleadoInicializado(empCod);

  if (!empleado) {
    return null;
  }

  const sql = `
    INSERT INTO TB_EmpleadoExperienciaProfesional (
      IdEmpleado,
      CodigoEmpleado,
      Empresa,
      Cargo,
      FechaDesde,
      FechaHasta,
      Activo
    ) VALUES (?, ?, ?, ?, ?, ?, 1)
  `;

  const fechaDesde = obtenerCampoPayload(payload, "fechaDesde", "FechaDesde");
  const fechaHasta = obtenerCampoPayload(payload, "fechaHasta", "FechaHasta");

  const result = await query(sql, [
    empleado.IdEmpleado,
    empleado.CodigoEmpleado,
    normalizarTexto(payload.empresa ?? payload.Empresa),
    normalizarTexto(payload.cargo ?? payload.Cargo),
    normalizarFechaOpcional(fechaDesde, null),
    normalizarFechaOpcional(fechaHasta, null)
  ]);

  const rows = await query(
    `
      SELECT
        IdEmpleadoExperienciaProfesional,
        CodigoEmpleado,
        Empresa,
        Cargo,
        FechaDesde,
        FechaHasta,
        Activo,
        FechaCreacion,
        FechaActualizacion
      FROM TB_EmpleadoExperienciaProfesional
      WHERE IdEmpleadoExperienciaProfesional = ?
      LIMIT 1
    `,
    [result.insertId]
  );

  return rows[0] || null;
};

const actualizarExperienciaProfesionalEmpleado = async (
  empCod,
  idEmpleadoExperienciaProfesional,
  payload = {}
) => {
  const empleado = await asegurarEmpleadoInicializado(empCod);

  if (!empleado) {
    return null;
  }

  const rowsActuales = await query(
    `
      SELECT
        *
      FROM TB_EmpleadoExperienciaProfesional
      WHERE IdEmpleadoExperienciaProfesional = ?
        AND CodigoEmpleado = ?
        AND Activo = 1
      LIMIT 1
    `,
    [idEmpleadoExperienciaProfesional, empleado.CodigoEmpleado]
  );

  const actual = rowsActuales[0] || null;

  if (!actual) {
    return null;
  }

  const fechaDesde = obtenerCampoPayload(payload, "fechaDesde", "FechaDesde");
  const fechaHasta = obtenerCampoPayload(payload, "fechaHasta", "FechaHasta");

  await query(
    `
      UPDATE TB_EmpleadoExperienciaProfesional
      SET
        Empresa = ?,
        Cargo = ?,
        FechaDesde = ?,
        FechaHasta = ?
      WHERE IdEmpleadoExperienciaProfesional = ?
        AND CodigoEmpleado = ?
    `,
    [
      normalizarTexto(payload.empresa ?? payload.Empresa) || actual.Empresa,
      normalizarTexto(payload.cargo ?? payload.Cargo) || actual.Cargo,
      normalizarFechaOpcional(fechaDesde, actual.FechaDesde ?? null),
      normalizarFechaOpcional(fechaHasta, actual.FechaHasta ?? null),
      idEmpleadoExperienciaProfesional,
      empleado.CodigoEmpleado
    ]
  );

  const rows = await query(
    `
      SELECT
        IdEmpleadoExperienciaProfesional,
        CodigoEmpleado,
        Empresa,
        Cargo,
        FechaDesde,
        FechaHasta,
        Activo,
        FechaCreacion,
        FechaActualizacion
      FROM TB_EmpleadoExperienciaProfesional
      WHERE IdEmpleadoExperienciaProfesional = ?
      LIMIT 1
    `,
    [idEmpleadoExperienciaProfesional]
  );

  return rows[0] || null;
};

const eliminarExperienciaProfesionalEmpleado = async (
  empCod,
  idEmpleadoExperienciaProfesional
) => {
  const empleado = await asegurarEmpleadoInicializado(empCod);

  if (!empleado) {
    return null;
  }

  const sql = `
    UPDATE TB_EmpleadoExperienciaProfesional
    SET Activo = 0
    WHERE IdEmpleadoExperienciaProfesional = ?
      AND CodigoEmpleado = ?
  `;

  const result = await query(sql, [
    idEmpleadoExperienciaProfesional,
    empleado.CodigoEmpleado
  ]);

  return result.affectedRows > 0;
};

const listarDiplomadosEmpleado = async (empCod) => {
  const empleado = await asegurarEmpleadoInicializado(empCod);

  if (!empleado) {
    return null;
  }

  const sql = `
    SELECT
      ed.IdEmpleadoDiplomado,
      ed.CodigoEmpleado,
      ed.IdTipoDiplomado,
      ed.RutaDocumentoAdjunto,
      ed.Activo,
      ed.FechaCreacion,
      ed.FechaActualizacion,
      ctd.NombreTipoDiplomado
    FROM TB_EmpleadoDiplomado ed
    LEFT JOIN TB_CatTipoDiplomado ctd
      ON ctd.IdTipoDiplomado = ed.IdTipoDiplomado
    WHERE ed.CodigoEmpleado = ?
      AND ed.Activo = 1
    ORDER BY ed.IdEmpleadoDiplomado DESC
  `;

  return query(sql, [empleado.CodigoEmpleado]);
};

const crearDiplomadoEmpleado = async (empCod, payload = {}, archivo = null) => {
  const empleado = await asegurarEmpleadoInicializado(empCod);

  if (!empleado) {
    return null;
  }

  const idTipoDiplomado =
    payload.idTipoDiplomado ?? payload.IdTipoDiplomado ?? null;
  const tipoDiplomado = await obtenerTipoDiplomadoPorId(idTipoDiplomado);

  if (idTipoDiplomado && !tipoDiplomado) {
    throw new Error("El tipo de diplomado seleccionado no existe");
  }

  if (!archivo) {
    throw new Error("Debes adjuntar el documento del diplomado");
  }

  const sql = `
    INSERT INTO TB_EmpleadoDiplomado (
      IdEmpleado,
      CodigoEmpleado,
      IdTipoDiplomado,
      RutaDocumentoAdjunto,
      Activo
    ) VALUES (?, ?, ?, ?, 1)
  `;

  const rutaDocumentoAdjunto =
    `/data/empleados/${empCod}/experiencia-profesional/${archivo.filename}`;

  const result = await query(sql, [
    empleado.IdEmpleado,
    empleado.CodigoEmpleado,
    idTipoDiplomado,
    rutaDocumentoAdjunto
  ]);

  const rows = await query(
    `
      SELECT
        ed.IdEmpleadoDiplomado,
        ed.CodigoEmpleado,
        ed.IdTipoDiplomado,
        ed.RutaDocumentoAdjunto,
        ed.Activo,
        ed.FechaCreacion,
        ed.FechaActualizacion,
        ctd.NombreTipoDiplomado
      FROM TB_EmpleadoDiplomado ed
      LEFT JOIN TB_CatTipoDiplomado ctd
        ON ctd.IdTipoDiplomado = ed.IdTipoDiplomado
      WHERE ed.IdEmpleadoDiplomado = ?
      LIMIT 1
    `,
    [result.insertId]
  );

  return rows[0] || null;
};

const actualizarDiplomadoEmpleado = async (
  empCod,
  idEmpleadoDiplomado,
  payload = {},
  archivo = null
) => {
  const empleado = await asegurarEmpleadoInicializado(empCod);

  if (!empleado) {
    return null;
  }

  const rowsActuales = await query(
    `
      SELECT
        *
      FROM TB_EmpleadoDiplomado
      WHERE IdEmpleadoDiplomado = ?
        AND CodigoEmpleado = ?
        AND Activo = 1
      LIMIT 1
    `,
    [idEmpleadoDiplomado, empleado.CodigoEmpleado]
  );

  const actual = rowsActuales[0] || null;

  if (!actual) {
    return null;
  }

  const idTipoDiplomado =
    payload.idTipoDiplomado ??
    payload.IdTipoDiplomado ??
    actual.IdTipoDiplomado;
  const tipoDiplomado = await obtenerTipoDiplomadoPorId(idTipoDiplomado);

  if (idTipoDiplomado && !tipoDiplomado) {
    throw new Error("El tipo de diplomado seleccionado no existe");
  }

  const rutaDocumentoAdjunto = archivo
    ? `/data/empleados/${empCod}/experiencia-profesional/${archivo.filename}`
    : actual.RutaDocumentoAdjunto;

  await query(
    `
      UPDATE TB_EmpleadoDiplomado
      SET
        IdTipoDiplomado = ?,
        RutaDocumentoAdjunto = ?
      WHERE IdEmpleadoDiplomado = ?
        AND CodigoEmpleado = ?
    `,
    [
      idTipoDiplomado,
      rutaDocumentoAdjunto,
      idEmpleadoDiplomado,
      empleado.CodigoEmpleado
    ]
  );

  const rows = await query(
    `
      SELECT
        ed.IdEmpleadoDiplomado,
        ed.CodigoEmpleado,
        ed.IdTipoDiplomado,
        ed.RutaDocumentoAdjunto,
        ed.Activo,
        ed.FechaCreacion,
        ed.FechaActualizacion,
        ctd.NombreTipoDiplomado
      FROM TB_EmpleadoDiplomado ed
      LEFT JOIN TB_CatTipoDiplomado ctd
        ON ctd.IdTipoDiplomado = ed.IdTipoDiplomado
      WHERE ed.IdEmpleadoDiplomado = ?
      LIMIT 1
    `,
    [idEmpleadoDiplomado]
  );

  return rows[0] || null;
};

const eliminarDiplomadoEmpleado = async (empCod, idEmpleadoDiplomado) => {
  const empleado = await asegurarEmpleadoInicializado(empCod);

  if (!empleado) {
    return null;
  }

  const sql = `
    UPDATE TB_EmpleadoDiplomado
    SET Activo = 0
    WHERE IdEmpleadoDiplomado = ?
      AND CodigoEmpleado = ?
  `;

  const result = await query(sql, [idEmpleadoDiplomado, empleado.CodigoEmpleado]);

  return result.affectedRows > 0;
};

const listarConocimientosClaveEmpleado = async (empCod) => {
  const empleado = await asegurarEmpleadoInicializado(empCod);

  if (!empleado) {
    return null;
  }

  return query(
    `
      SELECT
        IdEmpleadoConocimientoClave,
        CodigoEmpleado,
        NombreConocimiento,
        Descripcion,
        Activo,
        FechaCreacion,
        FechaActualizacion
      FROM TB_EmpleadoConocimientoClave
      WHERE CodigoEmpleado = ?
        AND Activo = 1
      ORDER BY IdEmpleadoConocimientoClave DESC
    `,
    [empleado.CodigoEmpleado]
  );
};

const crearConocimientoClaveEmpleado = async (empCod, payload = {}) => {
  const empleado = await asegurarEmpleadoInicializado(empCod);

  if (!empleado) {
    return null;
  }

  const nombreConocimiento = obtenerNombreConocimiento(payload);

  if (!nombreConocimiento) {
    throw new Error("Debes enviar el nombre del conocimiento");
  }

  const result = await query(
    `
      INSERT INTO TB_EmpleadoConocimientoClave (
        IdEmpleado,
        CodigoEmpleado,
        NombreConocimiento,
        Descripcion,
        Activo
      ) VALUES (?, ?, ?, ?, 1)
    `,
    [
      empleado.IdEmpleado,
      empleado.CodigoEmpleado,
      nombreConocimiento,
      obtenerDescripcion(payload)
    ]
  );

  const rows = await query(
    `
      SELECT
        IdEmpleadoConocimientoClave,
        CodigoEmpleado,
        NombreConocimiento,
        Descripcion,
        Activo,
        FechaCreacion,
        FechaActualizacion
      FROM TB_EmpleadoConocimientoClave
      WHERE IdEmpleadoConocimientoClave = ?
      LIMIT 1
    `,
    [result.insertId]
  );

  return rows[0] || null;
};

const actualizarConocimientoClaveEmpleado = async (
  empCod,
  idEmpleadoConocimientoClave,
  payload = {}
) => {
  const empleado = await asegurarEmpleadoInicializado(empCod);

  if (!empleado) {
    return null;
  }

  const rowsActuales = await query(
    `
      SELECT
        *
      FROM TB_EmpleadoConocimientoClave
      WHERE IdEmpleadoConocimientoClave = ?
        AND CodigoEmpleado = ?
        AND Activo = 1
      LIMIT 1
    `,
    [idEmpleadoConocimientoClave, empleado.CodigoEmpleado]
  );

  const actual = rowsActuales[0] || null;

  if (!actual) {
    return null;
  }

  const nombreConocimiento = obtenerNombreConocimiento(payload);
  const descripcion = obtenerDescripcion(payload);

  await query(
    `
      UPDATE TB_EmpleadoConocimientoClave
      SET
        NombreConocimiento = ?,
        Descripcion = ?
      WHERE IdEmpleadoConocimientoClave = ?
        AND CodigoEmpleado = ?
    `,
    [
      nombreConocimiento || actual.NombreConocimiento,
      descripcion !== null ? descripcion : actual.Descripcion,
      idEmpleadoConocimientoClave,
      empleado.CodigoEmpleado
    ]
  );

  const rows = await query(
    `
      SELECT
        IdEmpleadoConocimientoClave,
        CodigoEmpleado,
        NombreConocimiento,
        Descripcion,
        Activo,
        FechaCreacion,
        FechaActualizacion
      FROM TB_EmpleadoConocimientoClave
      WHERE IdEmpleadoConocimientoClave = ?
      LIMIT 1
    `,
    [idEmpleadoConocimientoClave]
  );

  return rows[0] || null;
};

const eliminarConocimientoClaveEmpleado = async (
  empCod,
  idEmpleadoConocimientoClave
) => {
  const empleado = await asegurarEmpleadoInicializado(empCod);

  if (!empleado) {
    return null;
  }

  const result = await query(
    `
      UPDATE TB_EmpleadoConocimientoClave
      SET Activo = 0
      WHERE IdEmpleadoConocimientoClave = ?
        AND CodigoEmpleado = ?
    `,
    [idEmpleadoConocimientoClave, empleado.CodigoEmpleado]
  );

  return result.affectedRows > 0;
};

const listarHabilidadesRelevantesEmpleado = async (empCod) => {
  const empleado = await asegurarEmpleadoInicializado(empCod);

  if (!empleado) {
    return null;
  }

  return query(
    `
      SELECT
        IdEmpleadoHabilidadRelevante,
        CodigoEmpleado,
        NombreHabilidad,
        Descripcion,
        Activo,
        FechaCreacion,
        FechaActualizacion
      FROM TB_EmpleadoHabilidadRelevante
      WHERE CodigoEmpleado = ?
        AND Activo = 1
      ORDER BY IdEmpleadoHabilidadRelevante DESC
    `,
    [empleado.CodigoEmpleado]
  );
};

const crearHabilidadRelevanteEmpleado = async (empCod, payload = {}) => {
  const empleado = await asegurarEmpleadoInicializado(empCod);

  if (!empleado) {
    return null;
  }

  const nombreHabilidad = obtenerNombreHabilidad(payload);

  if (!nombreHabilidad) {
    throw new Error("Debes enviar el nombre de la habilidad");
  }

  const result = await query(
    `
      INSERT INTO TB_EmpleadoHabilidadRelevante (
        IdEmpleado,
        CodigoEmpleado,
        NombreHabilidad,
        Descripcion,
        Activo
      ) VALUES (?, ?, ?, ?, 1)
    `,
    [
      empleado.IdEmpleado,
      empleado.CodigoEmpleado,
      nombreHabilidad,
      obtenerDescripcion(payload)
    ]
  );

  const rows = await query(
    `
      SELECT
        IdEmpleadoHabilidadRelevante,
        CodigoEmpleado,
        NombreHabilidad,
        Descripcion,
        Activo,
        FechaCreacion,
        FechaActualizacion
      FROM TB_EmpleadoHabilidadRelevante
      WHERE IdEmpleadoHabilidadRelevante = ?
      LIMIT 1
    `,
    [result.insertId]
  );

  return rows[0] || null;
};

const actualizarHabilidadRelevanteEmpleado = async (
  empCod,
  idEmpleadoHabilidadRelevante,
  payload = {}
) => {
  const empleado = await asegurarEmpleadoInicializado(empCod);

  if (!empleado) {
    return null;
  }

  const rowsActuales = await query(
    `
      SELECT
        *
      FROM TB_EmpleadoHabilidadRelevante
      WHERE IdEmpleadoHabilidadRelevante = ?
        AND CodigoEmpleado = ?
        AND Activo = 1
      LIMIT 1
    `,
    [idEmpleadoHabilidadRelevante, empleado.CodigoEmpleado]
  );

  const actual = rowsActuales[0] || null;

  if (!actual) {
    return null;
  }

  const nombreHabilidad = obtenerNombreHabilidad(payload);
  const descripcion = obtenerDescripcion(payload);

  await query(
    `
      UPDATE TB_EmpleadoHabilidadRelevante
      SET
        NombreHabilidad = ?,
        Descripcion = ?
      WHERE IdEmpleadoHabilidadRelevante = ?
        AND CodigoEmpleado = ?
    `,
    [
      nombreHabilidad || actual.NombreHabilidad,
      descripcion !== null ? descripcion : actual.Descripcion,
      idEmpleadoHabilidadRelevante,
      empleado.CodigoEmpleado
    ]
  );

  const rows = await query(
    `
      SELECT
        IdEmpleadoHabilidadRelevante,
        CodigoEmpleado,
        NombreHabilidad,
        Descripcion,
        Activo,
        FechaCreacion,
        FechaActualizacion
      FROM TB_EmpleadoHabilidadRelevante
      WHERE IdEmpleadoHabilidadRelevante = ?
      LIMIT 1
    `,
    [idEmpleadoHabilidadRelevante]
  );

  return rows[0] || null;
};

const eliminarHabilidadRelevanteEmpleado = async (
  empCod,
  idEmpleadoHabilidadRelevante
) => {
  const empleado = await asegurarEmpleadoInicializado(empCod);

  if (!empleado) {
    return null;
  }

  const result = await query(
    `
      UPDATE TB_EmpleadoHabilidadRelevante
      SET Activo = 0
      WHERE IdEmpleadoHabilidadRelevante = ?
        AND CodigoEmpleado = ?
    `,
    [idEmpleadoHabilidadRelevante, empleado.CodigoEmpleado]
  );

  return result.affectedRows > 0;
};

const listarProyectosExperienciaEmpleado = async (empCod) => {
  const empleado = await asegurarEmpleadoInicializado(empCod);

  if (!empleado) {
    return null;
  }

  return query(
    `
      SELECT
        IdEmpleadoProyectoExperiencia,
        CodigoEmpleado,
        Titulo,
        Descripcion,
        Activo,
        FechaCreacion,
        FechaActualizacion
      FROM TB_EmpleadoProyectoExperiencia
      WHERE CodigoEmpleado = ?
        AND Activo = 1
      ORDER BY IdEmpleadoProyectoExperiencia DESC
    `,
    [empleado.CodigoEmpleado]
  );
};

const crearProyectoExperienciaEmpleado = async (empCod, payload = {}) => {
  const empleado = await asegurarEmpleadoInicializado(empCod);

  if (!empleado) {
    return null;
  }

  const result = await query(
    `
      INSERT INTO TB_EmpleadoProyectoExperiencia (
        IdEmpleado,
        CodigoEmpleado,
        Titulo,
        Descripcion,
        Activo
      ) VALUES (?, ?, ?, ?, 1)
    `,
    [
      empleado.IdEmpleado,
      empleado.CodigoEmpleado,
      normalizarTexto(payload.titulo ?? payload.Titulo),
      normalizarTexto(payload.descripcion ?? payload.Descripcion)
    ]
  );

  const rows = await query(
    `
      SELECT
        IdEmpleadoProyectoExperiencia,
        CodigoEmpleado,
        Titulo,
        Descripcion,
        Activo,
        FechaCreacion,
        FechaActualizacion
      FROM TB_EmpleadoProyectoExperiencia
      WHERE IdEmpleadoProyectoExperiencia = ?
      LIMIT 1
    `,
    [result.insertId]
  );

  return rows[0] || null;
};

const actualizarProyectoExperienciaEmpleado = async (
  empCod,
  idEmpleadoProyectoExperiencia,
  payload = {}
) => {
  const empleado = await asegurarEmpleadoInicializado(empCod);

  if (!empleado) {
    return null;
  }

  const rowsActuales = await query(
    `
      SELECT
        *
      FROM TB_EmpleadoProyectoExperiencia
      WHERE IdEmpleadoProyectoExperiencia = ?
        AND CodigoEmpleado = ?
        AND Activo = 1
      LIMIT 1
    `,
    [idEmpleadoProyectoExperiencia, empleado.CodigoEmpleado]
  );

  const actual = rowsActuales[0] || null;

  if (!actual) {
    return null;
  }

  await query(
    `
      UPDATE TB_EmpleadoProyectoExperiencia
      SET
        Titulo = ?,
        Descripcion = ?
      WHERE IdEmpleadoProyectoExperiencia = ?
        AND CodigoEmpleado = ?
    `,
    [
      normalizarTexto(payload.titulo ?? payload.Titulo) || actual.Titulo,
      normalizarTexto(payload.descripcion ?? payload.Descripcion) ||
        actual.Descripcion,
      idEmpleadoProyectoExperiencia,
      empleado.CodigoEmpleado
    ]
  );

  const rows = await query(
    `
      SELECT
        IdEmpleadoProyectoExperiencia,
        CodigoEmpleado,
        Titulo,
        Descripcion,
        Activo,
        FechaCreacion,
        FechaActualizacion
      FROM TB_EmpleadoProyectoExperiencia
      WHERE IdEmpleadoProyectoExperiencia = ?
      LIMIT 1
    `,
    [idEmpleadoProyectoExperiencia]
  );

  return rows[0] || null;
};

const eliminarProyectoExperienciaEmpleado = async (
  empCod,
  idEmpleadoProyectoExperiencia
) => {
  const empleado = await asegurarEmpleadoInicializado(empCod);

  if (!empleado) {
    return null;
  }

  const result = await query(
    `
      UPDATE TB_EmpleadoProyectoExperiencia
      SET Activo = 0
      WHERE IdEmpleadoProyectoExperiencia = ?
        AND CodigoEmpleado = ?
    `,
    [idEmpleadoProyectoExperiencia, empleado.CodigoEmpleado]
  );

  return result.affectedRows > 0;
};

const listarExperienciasSectorProductivoEmpleado = async (empCod) => {
  const empleado = await asegurarEmpleadoInicializado(empCod);

  if (!empleado) {
    return null;
  }

  return query(
    `
      SELECT
        IdEmpleadoExperienciaSectorProductivo,
        CodigoEmpleado,
        AniosExperiencia,
        AreasEspecialidad,
        LogrosProyectosDestacados,
        Activo,
        FechaCreacion,
        FechaActualizacion
      FROM TB_EmpleadoExperienciaSectorProductivo
      WHERE CodigoEmpleado = ?
        AND Activo = 1
      ORDER BY IdEmpleadoExperienciaSectorProductivo DESC
    `,
    [empleado.CodigoEmpleado]
  );
};

const crearExperienciaSectorProductivoEmpleado = async (
  empCod,
  payload = {}
) => {
  const empleado = await asegurarEmpleadoInicializado(empCod);

  if (!empleado) {
    return null;
  }

  const result = await query(
    `
      INSERT INTO TB_EmpleadoExperienciaSectorProductivo (
        IdEmpleado,
        CodigoEmpleado,
        AniosExperiencia,
        AreasEspecialidad,
        LogrosProyectosDestacados,
        Activo
      ) VALUES (?, ?, ?, ?, ?, 1)
    `,
    [
      empleado.IdEmpleado,
      empleado.CodigoEmpleado,
      payload.aniosExperiencia ?? payload.AniosExperiencia ?? null,
      normalizarTexto(
        payload.areasEspecialidad ??
          payload.AreasEspecialidad ??
          payload.especialidad ??
          payload.Especialidad
      ),
      normalizarTexto(
        payload.logrosProyectosDestacados ??
          payload.LogrosProyectosDestacados ??
          payload.descripcion ??
          payload.Descripcion
      )
    ]
  );

  const rows = await query(
    `
      SELECT
        IdEmpleadoExperienciaSectorProductivo,
        CodigoEmpleado,
        AniosExperiencia,
        AreasEspecialidad,
        LogrosProyectosDestacados,
        Activo,
        FechaCreacion,
        FechaActualizacion
      FROM TB_EmpleadoExperienciaSectorProductivo
      WHERE IdEmpleadoExperienciaSectorProductivo = ?
      LIMIT 1
    `,
    [result.insertId]
  );

  return rows[0] || null;
};

const actualizarExperienciaSectorProductivoEmpleado = async (
  empCod,
  idEmpleadoExperienciaSectorProductivo,
  payload = {}
) => {
  const empleado = await asegurarEmpleadoInicializado(empCod);

  if (!empleado) {
    return null;
  }

  const rowsActuales = await query(
    `
      SELECT
        *
      FROM TB_EmpleadoExperienciaSectorProductivo
      WHERE IdEmpleadoExperienciaSectorProductivo = ?
        AND CodigoEmpleado = ?
        AND Activo = 1
      LIMIT 1
    `,
    [idEmpleadoExperienciaSectorProductivo, empleado.CodigoEmpleado]
  );

  const actual = rowsActuales[0] || null;

  if (!actual) {
    return null;
  }

  await query(
    `
      UPDATE TB_EmpleadoExperienciaSectorProductivo
      SET
        AniosExperiencia = ?,
        AreasEspecialidad = ?,
        LogrosProyectosDestacados = ?
      WHERE IdEmpleadoExperienciaSectorProductivo = ?
        AND CodigoEmpleado = ?
    `,
    [
      payload.aniosExperiencia ??
        payload.AniosExperiencia ??
        actual.AniosExperiencia,
      normalizarTexto(
        payload.areasEspecialidad ??
          payload.AreasEspecialidad ??
          payload.especialidad ??
          payload.Especialidad
      ) || actual.AreasEspecialidad,
      normalizarTexto(
        payload.logrosProyectosDestacados ??
          payload.LogrosProyectosDestacados ??
          payload.descripcion ??
          payload.Descripcion
      ) || actual.LogrosProyectosDestacados,
      idEmpleadoExperienciaSectorProductivo,
      empleado.CodigoEmpleado
    ]
  );

  const rows = await query(
    `
      SELECT
        IdEmpleadoExperienciaSectorProductivo,
        CodigoEmpleado,
        AniosExperiencia,
        AreasEspecialidad,
        LogrosProyectosDestacados,
        Activo,
        FechaCreacion,
        FechaActualizacion
      FROM TB_EmpleadoExperienciaSectorProductivo
      WHERE IdEmpleadoExperienciaSectorProductivo = ?
      LIMIT 1
    `,
    [idEmpleadoExperienciaSectorProductivo]
  );

  return rows[0] || null;
};

const eliminarExperienciaSectorProductivoEmpleado = async (
  empCod,
  idEmpleadoExperienciaSectorProductivo
) => {
  const empleado = await asegurarEmpleadoInicializado(empCod);

  if (!empleado) {
    return null;
  }

  const result = await query(
    `
      UPDATE TB_EmpleadoExperienciaSectorProductivo
      SET Activo = 0
      WHERE IdEmpleadoExperienciaSectorProductivo = ?
        AND CodigoEmpleado = ?
    `,
    [idEmpleadoExperienciaSectorProductivo, empleado.CodigoEmpleado]
  );

  return result.affectedRows > 0;
};

const listarVinculosIndustriaEmpleado = async (empCod) => {
  const empleado = await asegurarEmpleadoInicializado(empCod);

  if (!empleado) {
    return null;
  }

  return query(
    `
      SELECT
        IdEmpleadoVinculoIndustria,
        CodigoEmpleado,
        TipoVinculo,
        NombreVinculo,
        Activo,
        FechaCreacion,
        FechaActualizacion
      FROM TB_EmpleadoVinculoIndustria
      WHERE CodigoEmpleado = ?
        AND Activo = 1
      ORDER BY IdEmpleadoVinculoIndustria DESC
    `,
    [empleado.CodigoEmpleado]
  );
};

const crearVinculoIndustriaEmpleado = async (empCod, payload = {}) => {
  const empleado = await asegurarEmpleadoInicializado(empCod);

  if (!empleado) {
    return null;
  }

  const result = await query(
    `
      INSERT INTO TB_EmpleadoVinculoIndustria (
        IdEmpleado,
        CodigoEmpleado,
        TipoVinculo,
        NombreVinculo,
        Activo
      ) VALUES (?, ?, ?, ?, 1)
    `,
    [
      empleado.IdEmpleado,
      empleado.CodigoEmpleado,
      normalizarTexto(payload.tipoVinculo ?? payload.TipoVinculo ?? payload.tipo),
      normalizarTexto(
        payload.nombreVinculo ??
          payload.NombreVinculo ??
        payload.nombreEntidad ??
          payload.NombreEntidad ??
          payload.nombre ??
          payload.Nombre
      )
    ]
  );

  const rows = await query(
    `
      SELECT
        IdEmpleadoVinculoIndustria,
        CodigoEmpleado,
        TipoVinculo,
        NombreVinculo,
        Activo,
        FechaCreacion,
        FechaActualizacion
      FROM TB_EmpleadoVinculoIndustria
      WHERE IdEmpleadoVinculoIndustria = ?
      LIMIT 1
    `,
    [result.insertId]
  );

  return rows[0] || null;
};

const actualizarVinculoIndustriaEmpleado = async (
  empCod,
  idEmpleadoVinculoIndustria,
  payload = {}
) => {
  const empleado = await asegurarEmpleadoInicializado(empCod);

  if (!empleado) {
    return null;
  }

  const rowsActuales = await query(
    `
      SELECT
        *
      FROM TB_EmpleadoVinculoIndustria
      WHERE IdEmpleadoVinculoIndustria = ?
        AND CodigoEmpleado = ?
        AND Activo = 1
      LIMIT 1
    `,
    [idEmpleadoVinculoIndustria, empleado.CodigoEmpleado]
  );

  const actual = rowsActuales[0] || null;

  if (!actual) {
    return null;
  }

  await query(
    `
      UPDATE TB_EmpleadoVinculoIndustria
      SET
        TipoVinculo = ?,
        NombreVinculo = ?
      WHERE IdEmpleadoVinculoIndustria = ?
        AND CodigoEmpleado = ?
    `,
    [
      normalizarTexto(payload.tipoVinculo ?? payload.TipoVinculo ?? payload.tipo) ||
        actual.TipoVinculo,
      normalizarTexto(
        payload.nombreVinculo ??
          payload.NombreVinculo ??
        payload.nombreEntidad ??
          payload.NombreEntidad ??
          payload.nombre ??
          payload.Nombre
      ) || actual.NombreVinculo,
      idEmpleadoVinculoIndustria,
      empleado.CodigoEmpleado
    ]
  );

  const rows = await query(
    `
      SELECT
        IdEmpleadoVinculoIndustria,
        CodigoEmpleado,
        TipoVinculo,
        NombreVinculo,
        Activo,
        FechaCreacion,
        FechaActualizacion
      FROM TB_EmpleadoVinculoIndustria
      WHERE IdEmpleadoVinculoIndustria = ?
      LIMIT 1
    `,
    [idEmpleadoVinculoIndustria]
  );

  return rows[0] || null;
};

const eliminarVinculoIndustriaEmpleado = async (
  empCod,
  idEmpleadoVinculoIndustria
) => {
  const empleado = await asegurarEmpleadoInicializado(empCod);

  if (!empleado) {
    return null;
  }

  const result = await query(
    `
      UPDATE TB_EmpleadoVinculoIndustria
      SET Activo = 0
      WHERE IdEmpleadoVinculoIndustria = ?
        AND CodigoEmpleado = ?
    `,
    [idEmpleadoVinculoIndustria, empleado.CodigoEmpleado]
  );

  return result.affectedRows > 0;
};

const obtenerIdiomaPorId = async (idIdioma) => {
  if (!idIdioma) {
    return null;
  }

  const rows = await query(
    `
      SELECT
        IdIdioma,
        NombreIdioma
      FROM TB_CatIdioma
      WHERE IdIdioma = ?
      LIMIT 1
    `,
    [idIdioma]
  );

  return rows[0] || null;
};

const obtenerNivelIdiomaPorId = async (idNivelIdioma) => {
  if (!idNivelIdioma) {
    return null;
  }

  const rows = await query(
    `
      SELECT
        IdNivelIdioma,
        NombreNivelIdioma
      FROM TB_CatNivelIdioma
      WHERE IdNivelIdioma = ?
      LIMIT 1
    `,
    [idNivelIdioma]
  );

  return rows[0] || null;
};

const obtenerMetodologiaActivaPorId = async (idMetodologiaActiva) => {
  if (!idMetodologiaActiva) {
    return null;
  }

  const rows = await query(
    `
      SELECT
        IdMetodologiaActiva,
        NombreMetodologiaActiva
      FROM TB_CatMetodologiaActiva
      WHERE IdMetodologiaActiva = ?
      LIMIT 1
    `,
    [idMetodologiaActiva]
  );

  return rows[0] || null;
};

const obtenerPlataformaVirtualPorId = async (idPlataformaVirtualEducativa) => {
  if (!idPlataformaVirtualEducativa) {
    return null;
  }

  const rows = await query(
    `
      SELECT
        IdPlataformaVirtualEducativa,
        NombrePlataformaVirtualEducativa
      FROM TB_CatPlataformaVirtualEducativa
      WHERE IdPlataformaVirtualEducativa = ?
      LIMIT 1
    `,
    [idPlataformaVirtualEducativa]
  );

  return rows[0] || null;
};

const obtenerAreaInteresDocenciaPorId = async (idAreaInteresDocencia) => {
  if (!idAreaInteresDocencia) {
    return null;
  }

  const rows = await query(
    `
      SELECT
        IdAreaInteresDocencia,
        NombreAreaInteresDocencia
      FROM TB_CatAreaInteresDocencia
      WHERE IdAreaInteresDocencia = ?
      LIMIT 1
    `,
    [idAreaInteresDocencia]
  );

  return rows[0] || null;
};

const listarIdiomasEmpleado = async (empCod) => {
  const empleado = await asegurarEmpleadoInicializado(empCod);

  if (!empleado) {
    return null;
  }

  return query(
    `
      SELECT
        ei.IdEmpleadoIdioma,
        ei.CodigoEmpleado,
        ei.IdIdioma,
        ei.IdNivelIdioma,
        ei.Activo,
        ei.FechaCreacion,
        ei.FechaActualizacion,
        ci.NombreIdioma,
        cni.NombreNivelIdioma
      FROM TB_EmpleadoIdioma ei
      LEFT JOIN TB_CatIdioma ci
        ON ci.IdIdioma = ei.IdIdioma
      LEFT JOIN TB_CatNivelIdioma cni
        ON cni.IdNivelIdioma = ei.IdNivelIdioma
      WHERE ei.CodigoEmpleado = ?
        AND ei.Activo = 1
      ORDER BY ei.IdEmpleadoIdioma DESC
    `,
    [empleado.CodigoEmpleado]
  );
};

const crearIdiomaEmpleado = async (empCod, payload = {}) => {
  const empleado = await asegurarEmpleadoInicializado(empCod);

  if (!empleado) {
    return null;
  }

  const idIdioma = payload.idIdioma ?? payload.IdIdioma ?? null;
  const idNivelIdioma =
    payload.idNivelIdioma ?? payload.IdNivelIdioma ?? payload.nivelDominio ?? null;

  const idioma = await obtenerIdiomaPorId(idIdioma);
  const nivelIdioma = await obtenerNivelIdiomaPorId(idNivelIdioma);

  if (idIdioma && !idioma) {
    throw new Error("El idioma seleccionado no existe");
  }

  if (idNivelIdioma && !nivelIdioma) {
    throw new Error("El nivel de idioma seleccionado no existe");
  }

  const result = await query(
    `
      INSERT INTO TB_EmpleadoIdioma (
        IdEmpleado,
        CodigoEmpleado,
        IdIdioma,
        IdNivelIdioma,
        NombreIdioma,
        Activo
      ) VALUES (?, ?, ?, ?, ?, 1)
    `,
    [
      empleado.IdEmpleado,
      empleado.CodigoEmpleado,
      idIdioma,
      idNivelIdioma,
      idioma?.NombreIdioma || normalizarTexto(payload.nombreIdioma ?? payload.NombreIdioma)
    ]
  );

  const rows = await query(
    `
      SELECT
        ei.IdEmpleadoIdioma,
        ei.CodigoEmpleado,
        ei.IdIdioma,
        ei.IdNivelIdioma,
        ei.Activo,
        ei.FechaCreacion,
        ei.FechaActualizacion,
        ci.NombreIdioma,
        cni.NombreNivelIdioma
      FROM TB_EmpleadoIdioma ei
      LEFT JOIN TB_CatIdioma ci
        ON ci.IdIdioma = ei.IdIdioma
      LEFT JOIN TB_CatNivelIdioma cni
        ON cni.IdNivelIdioma = ei.IdNivelIdioma
      WHERE ei.IdEmpleadoIdioma = ?
      LIMIT 1
    `,
    [result.insertId]
  );

  return rows[0] || null;
};

const actualizarIdiomaEmpleado = async (empCod, idEmpleadoIdioma, payload = {}) => {
  const empleado = await asegurarEmpleadoInicializado(empCod);

  if (!empleado) {
    return null;
  }

  const rowsActuales = await query(
    `
      SELECT
        *
      FROM TB_EmpleadoIdioma
      WHERE IdEmpleadoIdioma = ?
        AND CodigoEmpleado = ?
        AND Activo = 1
      LIMIT 1
    `,
    [idEmpleadoIdioma, empleado.CodigoEmpleado]
  );

  const actual = rowsActuales[0] || null;

  if (!actual) {
    return null;
  }

  const idIdioma =
    payload.idIdioma ?? payload.IdIdioma ?? actual.IdIdioma ?? null;
  const idNivelIdioma =
    payload.idNivelIdioma ??
    payload.IdNivelIdioma ??
    payload.nivelDominio ??
    actual.IdNivelIdioma ??
    null;

  const idioma = await obtenerIdiomaPorId(idIdioma);
  const nivelIdioma = await obtenerNivelIdiomaPorId(idNivelIdioma);

  if (idIdioma && !idioma) {
    throw new Error("El idioma seleccionado no existe");
  }

  if (idNivelIdioma && !nivelIdioma) {
    throw new Error("El nivel de idioma seleccionado no existe");
  }

  await query(
    `
      UPDATE TB_EmpleadoIdioma
      SET
        IdIdioma = ?,
        IdNivelIdioma = ?,
        NombreIdioma = ?
      WHERE IdEmpleadoIdioma = ?
        AND CodigoEmpleado = ?
    `,
    [
      idIdioma,
      idNivelIdioma,
      idioma?.NombreIdioma || actual.NombreIdioma,
      idEmpleadoIdioma,
      empleado.CodigoEmpleado
    ]
  );

  const rows = await query(
    `
      SELECT
        ei.IdEmpleadoIdioma,
        ei.CodigoEmpleado,
        ei.IdIdioma,
        ei.IdNivelIdioma,
        ei.Activo,
        ei.FechaCreacion,
        ei.FechaActualizacion,
        ci.NombreIdioma,
        cni.NombreNivelIdioma
      FROM TB_EmpleadoIdioma ei
      LEFT JOIN TB_CatIdioma ci
        ON ci.IdIdioma = ei.IdIdioma
      LEFT JOIN TB_CatNivelIdioma cni
        ON cni.IdNivelIdioma = ei.IdNivelIdioma
      WHERE ei.IdEmpleadoIdioma = ?
      LIMIT 1
    `,
    [idEmpleadoIdioma]
  );

  return rows[0] || null;
};

const eliminarIdiomaEmpleado = async (empCod, idEmpleadoIdioma) => {
  const empleado = await asegurarEmpleadoInicializado(empCod);

  if (!empleado) {
    return null;
  }

  const result = await query(
    `
      UPDATE TB_EmpleadoIdioma
      SET Activo = 0
      WHERE IdEmpleadoIdioma = ?
        AND CodigoEmpleado = ?
    `,
    [idEmpleadoIdioma, empleado.CodigoEmpleado]
  );

  return result.affectedRows > 0;
};

const listarCompetenciasDigitalesEmpleado = async (empCod) => {
  const empleado = await asegurarEmpleadoInicializado(empCod);

  if (!empleado) {
    return null;
  }

  return query(
    `
      SELECT
        IdEmpleadoCompetenciaDigital,
        CodigoEmpleado,
        NombreCompetencia,
        Descripcion,
        Activo,
        FechaCreacion,
        FechaActualizacion
      FROM TB_EmpleadoCompetenciaDigital
      WHERE CodigoEmpleado = ?
        AND Activo = 1
      ORDER BY IdEmpleadoCompetenciaDigital DESC
    `,
    [empleado.CodigoEmpleado]
  );
};

const crearCompetenciaDigitalEmpleado = async (empCod, payload = {}) => {
  const empleado = await asegurarEmpleadoInicializado(empCod);

  if (!empleado) {
    return null;
  }

  const result = await query(
    `
      INSERT INTO TB_EmpleadoCompetenciaDigital (
        IdEmpleado,
        CodigoEmpleado,
        NombreCompetencia,
        Descripcion,
        Activo
      ) VALUES (?, ?, ?, ?, 1)
    `,
    [
      empleado.IdEmpleado,
      empleado.CodigoEmpleado,
      normalizarTexto(
        payload.nombreCompetencia ??
          payload.NombreCompetencia ??
          payload.competencia ??
          payload.Competencia
      ),
      normalizarTexto(payload.descripcion ?? payload.Descripcion)
    ]
  );

  const rows = await query(
    `
      SELECT
        IdEmpleadoCompetenciaDigital,
        CodigoEmpleado,
        NombreCompetencia,
        Descripcion,
        Activo,
        FechaCreacion,
        FechaActualizacion
      FROM TB_EmpleadoCompetenciaDigital
      WHERE IdEmpleadoCompetenciaDigital = ?
      LIMIT 1
    `,
    [result.insertId]
  );

  return rows[0] || null;
};

const actualizarCompetenciaDigitalEmpleado = async (
  empCod,
  idEmpleadoCompetenciaDigital,
  payload = {}
) => {
  const empleado = await asegurarEmpleadoInicializado(empCod);

  if (!empleado) {
    return null;
  }

  const rowsActuales = await query(
    `
      SELECT
        *
      FROM TB_EmpleadoCompetenciaDigital
      WHERE IdEmpleadoCompetenciaDigital = ?
        AND CodigoEmpleado = ?
        AND Activo = 1
      LIMIT 1
    `,
    [idEmpleadoCompetenciaDigital, empleado.CodigoEmpleado]
  );

  const actual = rowsActuales[0] || null;

  if (!actual) {
    return null;
  }

  await query(
    `
      UPDATE TB_EmpleadoCompetenciaDigital
      SET
        NombreCompetencia = ?,
        Descripcion = ?
      WHERE IdEmpleadoCompetenciaDigital = ?
        AND CodigoEmpleado = ?
    `,
    [
      normalizarTexto(
        payload.nombreCompetencia ??
          payload.NombreCompetencia ??
          payload.competencia ??
          payload.Competencia
      ) || actual.NombreCompetencia,
      normalizarTexto(payload.descripcion ?? payload.Descripcion) ||
        actual.Descripcion,
      idEmpleadoCompetenciaDigital,
      empleado.CodigoEmpleado
    ]
  );

  const rows = await query(
    `
      SELECT
        IdEmpleadoCompetenciaDigital,
        CodigoEmpleado,
        NombreCompetencia,
        Descripcion,
        Activo,
        FechaCreacion,
        FechaActualizacion
      FROM TB_EmpleadoCompetenciaDigital
      WHERE IdEmpleadoCompetenciaDigital = ?
      LIMIT 1
    `,
    [idEmpleadoCompetenciaDigital]
  );

  return rows[0] || null;
};

const eliminarCompetenciaDigitalEmpleado = async (
  empCod,
  idEmpleadoCompetenciaDigital
) => {
  const empleado = await asegurarEmpleadoInicializado(empCod);

  if (!empleado) {
    return null;
  }

  const result = await query(
    `
      UPDATE TB_EmpleadoCompetenciaDigital
      SET Activo = 0
      WHERE IdEmpleadoCompetenciaDigital = ?
        AND CodigoEmpleado = ?
    `,
    [idEmpleadoCompetenciaDigital, empleado.CodigoEmpleado]
  );

  return result.affectedRows > 0;
};

const listarMetodologiasActivasEmpleado = async (empCod) => {
  const empleado = await asegurarEmpleadoInicializado(empCod);

  if (!empleado) {
    return null;
  }

  return query(
    `
      SELECT
        ema.IdEmpleadoMetodologiaActiva,
        ema.CodigoEmpleado,
        ema.IdMetodologiaActiva,
        ema.Descripcion,
        ema.Activo,
        ema.FechaCreacion,
        ema.FechaActualizacion,
        cma.NombreMetodologiaActiva
      FROM TB_EmpleadoMetodologiaActiva ema
      LEFT JOIN TB_CatMetodologiaActiva cma
        ON cma.IdMetodologiaActiva = ema.IdMetodologiaActiva
      WHERE ema.CodigoEmpleado = ?
        AND ema.Activo = 1
      ORDER BY ema.IdEmpleadoMetodologiaActiva DESC
    `,
    [empleado.CodigoEmpleado]
  );
};

const crearMetodologiaActivaEmpleado = async (empCod, payload = {}) => {
  const empleado = await asegurarEmpleadoInicializado(empCod);

  if (!empleado) {
    return null;
  }

  const idMetodologiaActiva =
    payload.idMetodologiaActiva ?? payload.IdMetodologiaActiva ?? null;
  const metodologiaActiva =
    await obtenerMetodologiaActivaPorId(idMetodologiaActiva);

  if (idMetodologiaActiva && !metodologiaActiva) {
    throw new Error("La metodologia activa seleccionada no existe");
  }

  const result = await query(
    `
      INSERT INTO TB_EmpleadoMetodologiaActiva (
        IdEmpleado,
        CodigoEmpleado,
        IdMetodologiaActiva,
        Descripcion,
        Activo
      ) VALUES (?, ?, ?, ?, 1)
    `,
    [
      empleado.IdEmpleado,
      empleado.CodigoEmpleado,
      idMetodologiaActiva,
      normalizarTexto(payload.descripcion ?? payload.Descripcion)
    ]
  );

  const rows = await query(
    `
      SELECT
        ema.IdEmpleadoMetodologiaActiva,
        ema.CodigoEmpleado,
        ema.IdMetodologiaActiva,
        ema.Descripcion,
        ema.Activo,
        ema.FechaCreacion,
        ema.FechaActualizacion,
        cma.NombreMetodologiaActiva
      FROM TB_EmpleadoMetodologiaActiva ema
      LEFT JOIN TB_CatMetodologiaActiva cma
        ON cma.IdMetodologiaActiva = ema.IdMetodologiaActiva
      WHERE ema.IdEmpleadoMetodologiaActiva = ?
      LIMIT 1
    `,
    [result.insertId]
  );

  return rows[0] || null;
};

const actualizarMetodologiaActivaEmpleado = async (
  empCod,
  idEmpleadoMetodologiaActiva,
  payload = {}
) => {
  const empleado = await asegurarEmpleadoInicializado(empCod);

  if (!empleado) {
    return null;
  }

  const rowsActuales = await query(
    `
      SELECT
        *
      FROM TB_EmpleadoMetodologiaActiva
      WHERE IdEmpleadoMetodologiaActiva = ?
        AND CodigoEmpleado = ?
        AND Activo = 1
      LIMIT 1
    `,
    [idEmpleadoMetodologiaActiva, empleado.CodigoEmpleado]
  );

  const actual = rowsActuales[0] || null;

  if (!actual) {
    return null;
  }

  const idMetodologiaActiva =
    payload.idMetodologiaActiva ??
    payload.IdMetodologiaActiva ??
    actual.IdMetodologiaActiva;
  const metodologiaActiva =
    await obtenerMetodologiaActivaPorId(idMetodologiaActiva);

  if (idMetodologiaActiva && !metodologiaActiva) {
    throw new Error("La metodologia activa seleccionada no existe");
  }

  await query(
    `
      UPDATE TB_EmpleadoMetodologiaActiva
      SET
        IdMetodologiaActiva = ?,
        Descripcion = ?
      WHERE IdEmpleadoMetodologiaActiva = ?
        AND CodigoEmpleado = ?
    `,
    [
      idMetodologiaActiva,
      normalizarTexto(payload.descripcion ?? payload.Descripcion) ||
        actual.Descripcion,
      idEmpleadoMetodologiaActiva,
      empleado.CodigoEmpleado
    ]
  );

  const rows = await query(
    `
      SELECT
        ema.IdEmpleadoMetodologiaActiva,
        ema.CodigoEmpleado,
        ema.IdMetodologiaActiva,
        ema.Descripcion,
        ema.Activo,
        ema.FechaCreacion,
        ema.FechaActualizacion,
        cma.NombreMetodologiaActiva
      FROM TB_EmpleadoMetodologiaActiva ema
      LEFT JOIN TB_CatMetodologiaActiva cma
        ON cma.IdMetodologiaActiva = ema.IdMetodologiaActiva
      WHERE ema.IdEmpleadoMetodologiaActiva = ?
      LIMIT 1
    `,
    [idEmpleadoMetodologiaActiva]
  );

  return rows[0] || null;
};

const eliminarMetodologiaActivaEmpleado = async (
  empCod,
  idEmpleadoMetodologiaActiva
) => {
  const empleado = await asegurarEmpleadoInicializado(empCod);

  if (!empleado) {
    return null;
  }

  const result = await query(
    `
      UPDATE TB_EmpleadoMetodologiaActiva
      SET Activo = 0
      WHERE IdEmpleadoMetodologiaActiva = ?
        AND CodigoEmpleado = ?
    `,
    [idEmpleadoMetodologiaActiva, empleado.CodigoEmpleado]
  );

  return result.affectedRows > 0;
};

const listarPlataformasVirtualesEmpleado = async (empCod) => {
  const empleado = await asegurarEmpleadoInicializado(empCod);

  if (!empleado) {
    return null;
  }

  return query(
    `
      SELECT
        epv.IdEmpleadoPlataformaVirtual,
        epv.CodigoEmpleado,
        epv.IdPlataformaVirtualEducativa,
        epv.Descripcion,
        epv.Activo,
        epv.FechaCreacion,
        epv.FechaActualizacion,
        cpve.NombrePlataformaVirtualEducativa
      FROM TB_EmpleadoPlataformaVirtual epv
      LEFT JOIN TB_CatPlataformaVirtualEducativa cpve
        ON cpve.IdPlataformaVirtualEducativa = epv.IdPlataformaVirtualEducativa
      WHERE epv.CodigoEmpleado = ?
        AND epv.Activo = 1
      ORDER BY epv.IdEmpleadoPlataformaVirtual DESC
    `,
    [empleado.CodigoEmpleado]
  );
};

const crearPlataformaVirtualEmpleado = async (empCod, payload = {}) => {
  const empleado = await asegurarEmpleadoInicializado(empCod);

  if (!empleado) {
    return null;
  }

  const idPlataformaVirtualEducativa =
    payload.idPlataformaVirtualEducativa ??
    payload.IdPlataformaVirtualEducativa ??
    null;
  const plataformaVirtual = await obtenerPlataformaVirtualPorId(
    idPlataformaVirtualEducativa
  );

  if (idPlataformaVirtualEducativa && !plataformaVirtual) {
    throw new Error("La plataforma virtual seleccionada no existe");
  }

  const result = await query(
    `
      INSERT INTO TB_EmpleadoPlataformaVirtual (
        IdEmpleado,
        CodigoEmpleado,
        IdPlataformaVirtualEducativa,
        Descripcion,
        Activo
      ) VALUES (?, ?, ?, ?, 1)
    `,
    [
      empleado.IdEmpleado,
      empleado.CodigoEmpleado,
      idPlataformaVirtualEducativa,
      normalizarTexto(payload.descripcion ?? payload.Descripcion)
    ]
  );

  const rows = await query(
    `
      SELECT
        epv.IdEmpleadoPlataformaVirtual,
        epv.CodigoEmpleado,
        epv.IdPlataformaVirtualEducativa,
        epv.Descripcion,
        epv.Activo,
        epv.FechaCreacion,
        epv.FechaActualizacion,
        cpve.NombrePlataformaVirtualEducativa
      FROM TB_EmpleadoPlataformaVirtual epv
      LEFT JOIN TB_CatPlataformaVirtualEducativa cpve
        ON cpve.IdPlataformaVirtualEducativa = epv.IdPlataformaVirtualEducativa
      WHERE epv.IdEmpleadoPlataformaVirtual = ?
      LIMIT 1
    `,
    [result.insertId]
  );

  return rows[0] || null;
};

const actualizarPlataformaVirtualEmpleado = async (
  empCod,
  idEmpleadoPlataformaVirtual,
  payload = {}
) => {
  const empleado = await asegurarEmpleadoInicializado(empCod);

  if (!empleado) {
    return null;
  }

  const rowsActuales = await query(
    `
      SELECT
        *
      FROM TB_EmpleadoPlataformaVirtual
      WHERE IdEmpleadoPlataformaVirtual = ?
        AND CodigoEmpleado = ?
        AND Activo = 1
      LIMIT 1
    `,
    [idEmpleadoPlataformaVirtual, empleado.CodigoEmpleado]
  );

  const actual = rowsActuales[0] || null;

  if (!actual) {
    return null;
  }

  const idPlataformaVirtualEducativa =
    payload.idPlataformaVirtualEducativa ??
    payload.IdPlataformaVirtualEducativa ??
    actual.IdPlataformaVirtualEducativa;
  const plataformaVirtual = await obtenerPlataformaVirtualPorId(
    idPlataformaVirtualEducativa
  );

  if (idPlataformaVirtualEducativa && !plataformaVirtual) {
    throw new Error("La plataforma virtual seleccionada no existe");
  }

  await query(
    `
      UPDATE TB_EmpleadoPlataformaVirtual
      SET
        IdPlataformaVirtualEducativa = ?,
        Descripcion = ?
      WHERE IdEmpleadoPlataformaVirtual = ?
        AND CodigoEmpleado = ?
    `,
    [
      idPlataformaVirtualEducativa,
      normalizarTexto(payload.descripcion ?? payload.Descripcion) ||
        actual.Descripcion,
      idEmpleadoPlataformaVirtual,
      empleado.CodigoEmpleado
    ]
  );

  const rows = await query(
    `
      SELECT
        epv.IdEmpleadoPlataformaVirtual,
        epv.CodigoEmpleado,
        epv.IdPlataformaVirtualEducativa,
        epv.Descripcion,
        epv.Activo,
        epv.FechaCreacion,
        epv.FechaActualizacion,
        cpve.NombrePlataformaVirtualEducativa
      FROM TB_EmpleadoPlataformaVirtual epv
      LEFT JOIN TB_CatPlataformaVirtualEducativa cpve
        ON cpve.IdPlataformaVirtualEducativa = epv.IdPlataformaVirtualEducativa
      WHERE epv.IdEmpleadoPlataformaVirtual = ?
      LIMIT 1
    `,
    [idEmpleadoPlataformaVirtual]
  );

  return rows[0] || null;
};

const eliminarPlataformaVirtualEmpleado = async (
  empCod,
  idEmpleadoPlataformaVirtual
) => {
  const empleado = await asegurarEmpleadoInicializado(empCod);

  if (!empleado) {
    return null;
  }

  const result = await query(
    `
      UPDATE TB_EmpleadoPlataformaVirtual
      SET Activo = 0
      WHERE IdEmpleadoPlataformaVirtual = ?
        AND CodigoEmpleado = ?
    `,
    [idEmpleadoPlataformaVirtual, empleado.CodigoEmpleado]
  );

  return result.affectedRows > 0;
};

const listarPreferenciasDocenciaEmpleado = async (empCod) => {
  const empleado = await asegurarEmpleadoInicializado(empCod);

  if (!empleado) {
    return null;
  }

  return query(
    `
      SELECT
        epd.IdEmpleadoPreferenciaDocencia,
        epd.CodigoEmpleado,
        epd.IdAreaInteresDocencia,
        epd.ModalidadEnsenanza,
        epd.IdCampus,
        epd.Activo,
        epd.FechaCreacion,
        epd.FechaActualizacion,
        caid.NombreAreaInteresDocencia,
        c.NombreCampus
      FROM TB_EmpleadoPreferenciaDocencia epd
      LEFT JOIN TB_CatAreaInteresDocencia caid
        ON caid.IdAreaInteresDocencia = epd.IdAreaInteresDocencia
      LEFT JOIN TB_CatCampus c
        ON c.IdCampus = epd.IdCampus
      WHERE epd.CodigoEmpleado = ?
        AND epd.Activo = 1
      ORDER BY epd.IdEmpleadoPreferenciaDocencia DESC
    `,
    [empleado.CodigoEmpleado]
  );
};

const crearPreferenciaDocenciaEmpleado = async (empCod, payload = {}) => {
  const empleado = await asegurarEmpleadoInicializado(empCod);

  if (!empleado) {
    return null;
  }

  const idAreaInteresDocencia =
    payload.idAreaInteresDocencia ?? payload.IdAreaInteresDocencia ?? null;
  const idCampus = payload.idCampus ?? payload.IdCampus ?? null;
  const modalidadEnsenanza = normalizarTexto(
    payload.modalidadEnsenanza ?? payload.ModalidadEnsenanza
  );

  const areaInteresDocencia = await obtenerAreaInteresDocenciaPorId(
    idAreaInteresDocencia
  );

  if (idAreaInteresDocencia && !areaInteresDocencia) {
    throw new Error("El area de interes para docencia seleccionada no existe");
  }

  const result = await query(
    `
      INSERT INTO TB_EmpleadoPreferenciaDocencia (
        IdEmpleado,
        CodigoEmpleado,
        IdAreaInteresDocencia,
        ModalidadEnsenanza,
        IdCampus,
        Activo
      ) VALUES (?, ?, ?, ?, ?, 1)
    `,
    [
      empleado.IdEmpleado,
      empleado.CodigoEmpleado,
      idAreaInteresDocencia,
      modalidadEnsenanza,
      idCampus
    ]
  );

  const rows = await query(
    `
      SELECT
        epd.IdEmpleadoPreferenciaDocencia,
        epd.CodigoEmpleado,
        epd.IdAreaInteresDocencia,
        epd.ModalidadEnsenanza,
        epd.IdCampus,
        epd.Activo,
        epd.FechaCreacion,
        epd.FechaActualizacion,
        caid.NombreAreaInteresDocencia,
        c.NombreCampus
      FROM TB_EmpleadoPreferenciaDocencia epd
      LEFT JOIN TB_CatAreaInteresDocencia caid
        ON caid.IdAreaInteresDocencia = epd.IdAreaInteresDocencia
      LEFT JOIN TB_CatCampus c
        ON c.IdCampus = epd.IdCampus
      WHERE epd.IdEmpleadoPreferenciaDocencia = ?
      LIMIT 1
    `,
    [result.insertId]
  );

  return rows[0] || null;
};

const actualizarPreferenciaDocenciaEmpleado = async (
  empCod,
  idEmpleadoPreferenciaDocencia,
  payload = {}
) => {
  const empleado = await asegurarEmpleadoInicializado(empCod);

  if (!empleado) {
    return null;
  }

  const rowsActuales = await query(
    `
      SELECT
        *
      FROM TB_EmpleadoPreferenciaDocencia
      WHERE IdEmpleadoPreferenciaDocencia = ?
        AND CodigoEmpleado = ?
        AND Activo = 1
      LIMIT 1
    `,
    [idEmpleadoPreferenciaDocencia, empleado.CodigoEmpleado]
  );

  const actual = rowsActuales[0] || null;

  if (!actual) {
    return null;
  }

  const idAreaInteresDocencia =
    payload.idAreaInteresDocencia ??
    payload.IdAreaInteresDocencia ??
    actual.IdAreaInteresDocencia;
  const idCampus = payload.idCampus ?? payload.IdCampus ?? actual.IdCampus;
  const modalidadEnsenanza =
    normalizarTexto(
      payload.modalidadEnsenanza ?? payload.ModalidadEnsenanza
    ) || actual.ModalidadEnsenanza;

  const areaInteresDocencia = await obtenerAreaInteresDocenciaPorId(
    idAreaInteresDocencia
  );

  if (idAreaInteresDocencia && !areaInteresDocencia) {
    throw new Error("El area de interes para docencia seleccionada no existe");
  }

  await query(
    `
      UPDATE TB_EmpleadoPreferenciaDocencia
      SET
        IdAreaInteresDocencia = ?,
        ModalidadEnsenanza = ?,
        IdCampus = ?
      WHERE IdEmpleadoPreferenciaDocencia = ?
        AND CodigoEmpleado = ?
    `,
    [
      idAreaInteresDocencia,
      modalidadEnsenanza,
      idCampus,
      idEmpleadoPreferenciaDocencia,
      empleado.CodigoEmpleado
    ]
  );

  const rows = await query(
    `
      SELECT
        epd.IdEmpleadoPreferenciaDocencia,
        epd.CodigoEmpleado,
        epd.IdAreaInteresDocencia,
        epd.ModalidadEnsenanza,
        epd.IdCampus,
        epd.Activo,
        epd.FechaCreacion,
        epd.FechaActualizacion,
        caid.NombreAreaInteresDocencia,
        c.NombreCampus
      FROM TB_EmpleadoPreferenciaDocencia epd
      LEFT JOIN TB_CatAreaInteresDocencia caid
        ON caid.IdAreaInteresDocencia = epd.IdAreaInteresDocencia
      LEFT JOIN TB_CatCampus c
        ON c.IdCampus = epd.IdCampus
      WHERE epd.IdEmpleadoPreferenciaDocencia = ?
      LIMIT 1
    `,
    [idEmpleadoPreferenciaDocencia]
  );

  return rows[0] || null;
};

const eliminarPreferenciaDocenciaEmpleado = async (
  empCod,
  idEmpleadoPreferenciaDocencia
) => {
  const empleado = await asegurarEmpleadoInicializado(empCod);

  if (!empleado) {
    return null;
  }

  const result = await query(
    `
      UPDATE TB_EmpleadoPreferenciaDocencia
      SET Activo = 0
      WHERE IdEmpleadoPreferenciaDocencia = ?
        AND CodigoEmpleado = ?
    `,
    [idEmpleadoPreferenciaDocencia, empleado.CodigoEmpleado]
  );

  return result.affectedRows > 0;
};

module.exports = {
  obtenerPorCodigo,
  listarColaboradores,
  listarColaboradoresCompletos,
  obtenerEstadoActualizacionEmpleado,
  guardarInformacionPersonalDesdeLegacy,
  obtenerFormularioEmpleado,
  inicializarEmpleadoDesdeLegacy,
  actualizarInformacionPersonal,
  actualizarDocumentoEmpleado,
  listarHijosEmpleado,
  crearHijoEmpleado,
  actualizarHijoEmpleado,
  eliminarHijoEmpleado,
  listarGradosAcademicosEmpleado,
  crearGradoAcademicoEmpleado,
  actualizarGradoAcademicoEmpleado,
  eliminarGradoAcademicoEmpleado,
  listarExperienciasProfesionalesEmpleado,
  crearExperienciaProfesionalEmpleado,
  actualizarExperienciaProfesionalEmpleado,
  eliminarExperienciaProfesionalEmpleado,
  listarDiplomadosEmpleado,
  crearDiplomadoEmpleado,
  actualizarDiplomadoEmpleado,
  eliminarDiplomadoEmpleado,
  listarExperienciasDocentesEmpleado,
  crearExperienciaDocenteEmpleado,
  actualizarExperienciaDocenteEmpleado,
  eliminarExperienciaDocenteEmpleado,
  listarLogrosRelevantesEmpleado,
  crearLogroRelevanteEmpleado,
  actualizarLogroRelevanteEmpleado,
  eliminarLogroRelevanteEmpleado,
  listarDiseniosCurricularesEmpleado,
  crearDisenioCurricularEmpleado,
  actualizarDisenioCurricularEmpleado,
  eliminarDisenioCurricularEmpleado,
  listarConocimientosClaveEmpleado,
  crearConocimientoClaveEmpleado,
  actualizarConocimientoClaveEmpleado,
  eliminarConocimientoClaveEmpleado,
  listarHabilidadesRelevantesEmpleado,
  crearHabilidadRelevanteEmpleado,
  actualizarHabilidadRelevanteEmpleado,
  eliminarHabilidadRelevanteEmpleado,
  listarProyectosExperienciaEmpleado,
  crearProyectoExperienciaEmpleado,
  actualizarProyectoExperienciaEmpleado,
  eliminarProyectoExperienciaEmpleado,
  listarExperienciasSectorProductivoEmpleado,
  crearExperienciaSectorProductivoEmpleado,
  actualizarExperienciaSectorProductivoEmpleado,
  eliminarExperienciaSectorProductivoEmpleado,
  listarVinculosIndustriaEmpleado,
  crearVinculoIndustriaEmpleado,
  actualizarVinculoIndustriaEmpleado,
  eliminarVinculoIndustriaEmpleado,
  listarIdiomasEmpleado,
  crearIdiomaEmpleado,
  actualizarIdiomaEmpleado,
  eliminarIdiomaEmpleado,
  listarCompetenciasDigitalesEmpleado,
  crearCompetenciaDigitalEmpleado,
  actualizarCompetenciaDigitalEmpleado,
  eliminarCompetenciaDigitalEmpleado,
  listarMetodologiasActivasEmpleado,
  crearMetodologiaActivaEmpleado,
  actualizarMetodologiaActivaEmpleado,
  eliminarMetodologiaActivaEmpleado,
  listarPlataformasVirtualesEmpleado,
  crearPlataformaVirtualEmpleado,
  actualizarPlataformaVirtualEmpleado,
  eliminarPlataformaVirtualEmpleado,
  listarPreferenciasDocenciaEmpleado,
  crearPreferenciaDocenciaEmpleado,
  actualizarPreferenciaDocenciaEmpleado,
  eliminarPreferenciaDocenciaEmpleado
};
