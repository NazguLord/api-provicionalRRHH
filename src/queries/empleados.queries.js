const { query } = require("../config/db");

const normalizarTexto = (valor) => {
  if (valor === undefined || valor === null) {
    return null;
  }

  const texto = String(valor).trim();
  return texto === "" ? null : texto;
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
  "PoseeVehiculo",
  "MarcaVehiculo",
  "ModeloVehiculo",
  "AnioVehiculo",
  "NombreConyuge",
  "NombreContactoEmergencia",
  "TelefonoContactoEmergencia",
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
  "RutaDocumentoIdentidad"
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
      IdEmpleado,
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
      PoseeVehiculo,
      MarcaVehiculo,
      ModeloVehiculo,
      AnioVehiculo,
      NombreConyuge,
      NombreContactoEmergencia,
      TelefonoContactoEmergencia,
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
      Activo,
      FechaCreacion,
      FechaActualizacion
    FROM TB_Empleados
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
    CorreoElectronicoPersonal: empleado.CorreoElectronicoPersonal ?? null,
    CorreoElectronicoInstitucional:
      empleado.CorreoElectronicoInstitucional ?? null,
    NumeroColegio: empleado.NumeroColegio ?? null,
    RutaImagenPerfil: empleado.RutaImagenPerfil ?? null,
    RutaHojaVida: empleado.RutaHojaVida ?? null,
    RutaDocumentoIdentidad: empleado.RutaDocumentoIdentidad ?? null,
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
    NombreContactoEmergencia: normalizarTexto(
      payload.nombreContactoEmergencia ?? payload.NombreContactoEmergencia ?? legacy.EmpEmrNom
    ),
    TelefonoContactoEmergencia: normalizarTexto(
      payload.telefonoContactoEmergencia ?? payload.TelefonoContactoEmergencia ?? legacy.EmpEmrTel
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
    CodigoCampus: normalizarTexto(payload.codigoCampus ?? legacy.EmpSdeCod),
    LugarNacimiento: normalizarTexto(
      payload.lugarNacimiento ?? legacy.EmpNac
    ),
    RutaImagenPerfil: normalizarTexto(payload.rutaImagenPerfil),
    RutaHojaVida: normalizarTexto(payload.rutaHojaVida),
    RutaDocumentoIdentidad: normalizarTexto(payload.rutaDocumentoIdentidad),
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
    datos.PoseeVehiculo,
    datos.MarcaVehiculo,
    datos.ModeloVehiculo,
    datos.AnioVehiculo,
    datos.NombreConyuge,
    datos.NombreContactoEmergencia,
    datos.TelefonoContactoEmergencia,
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
      PoseeVehiculo,
      MarcaVehiculo,
      ModeloVehiculo,
      AnioVehiculo,
      NombreConyuge,
      NombreContactoEmergencia,
      TelefonoContactoEmergencia,
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
      PoseeVehiculo = VALUES(PoseeVehiculo),
      MarcaVehiculo = VALUES(MarcaVehiculo),
      ModeloVehiculo = VALUES(ModeloVehiculo),
      AnioVehiculo = VALUES(AnioVehiculo),
      NombreConyuge = VALUES(NombreConyuge),
      NombreContactoEmergencia = VALUES(NombreContactoEmergencia),
      TelefonoContactoEmergencia = VALUES(TelefonoContactoEmergencia),
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
    return mapearFormularioInformacionPersonal({
      ...empleadoNuevo,
      inicializado: true,
      origen: "nuevo"
    });
  }

  const legacy = await mapearLegacyAFormulario(empCod);
  return mapearFormularioInformacionPersonal(legacy);
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
    nombreContactoEmergencia: "NombreContactoEmergencia",
    NombreContactoEmergencia: "NombreContactoEmergencia",
    telefonoContactoEmergencia: "TelefonoContactoEmergencia",
    TelefonoContactoEmergencia: "TelefonoContactoEmergencia",
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
  const campos = Object.keys(datosActualizar).filter((campo) =>
    CAMPOS_INFO_PERSONAL_EDITABLES.includes(campo)
  );

  if (campos.length === 0) {
    return obtenerEmpleadoNuevoPorCodigo(empCod);
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

  return obtenerEmpleadoNuevoPorCodigo(empCod);
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
    "documento-identidad": "RutaDocumentoIdentidad"
  };

  const columna = mapaColumnas[String(tipoDocumento).toLowerCase()];

  if (!columna) {
    throw new Error("Tipo de documento no valido");
  }

  const rutaArchivo = `/data/empleados/${empCod}/${archivo.filename}`;

  const sql = `
    UPDATE TB_Empleados
    SET ${columna} = ?
    WHERE CodigoEmpleado = ?
  `;

  await query(sql, [rutaArchivo, empCod]);

  return obtenerEmpleadoNuevoPorCodigo(empCod);
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
      ega.IdEmpleado,
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
    WHERE ega.IdEmpleado = ?
      AND ega.Activo = 1
    ORDER BY ega.IdEmpleadoGradoAcademico DESC
  `;

  return query(sql, [empleado.IdEmpleado]);
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
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
  `;

  const rutaDocumentoAdjunto = archivo
    ? `/data/empleados/${empCod}/documentos-academicos/${archivo.filename}`
    : null;

  const graduado =
    nombreEstadoAcademico &&
    normalizarTexto(nombreEstadoAcademico)?.toUpperCase() === "COMPLETADO"
      ? 1
      : 0;

  const result = await query(sql, [
    empleado.IdEmpleado,
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
        ega.IdEmpleado,
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

const eliminarGradoAcademicoEmpleado = async (empCod, idEmpleadoGradoAcademico) => {
  const empleado = await asegurarEmpleadoInicializado(empCod);

  if (!empleado) {
    return null;
  }

  const sql = `
    UPDATE TB_EmpleadoGradoAcademico
    SET Activo = 0
    WHERE IdEmpleadoGradoAcademico = ?
      AND IdEmpleado = ?
  `;

  const result = await query(sql, [
    idEmpleadoGradoAcademico,
    empleado.IdEmpleado
  ]);

  return result.affectedRows > 0;
};

module.exports = {
  obtenerPorCodigo,
  guardarInformacionPersonalDesdeLegacy,
  obtenerFormularioEmpleado,
  inicializarEmpleadoDesdeLegacy,
  actualizarInformacionPersonal,
  actualizarDocumentoEmpleado,
  listarGradosAcademicosEmpleado,
  crearGradoAcademicoEmpleado,
  eliminarGradoAcademicoEmpleado
};
