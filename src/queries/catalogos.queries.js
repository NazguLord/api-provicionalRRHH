const { query } = require("../config/db");

const listarTiposSangre = async () => {
  const sql = `
    SELECT
      IdTipoSangre,
      NombreTipoSangre,
      Activo
    FROM TB_CatTipoSangre
    WHERE Activo = 1
    ORDER BY NombreTipoSangre ASC
  `;

  return query(sql);
};

const listarEstadosCiviles = async () => {
  const sql = `
    SELECT
      IdEstadoCivil,
      NombreEstadoCivil,
      Activo
    FROM TB_CatEstadoCivil
    WHERE Activo = 1
    ORDER BY NombreEstadoCivil ASC
  `;

  return query(sql);
};

const listarTiposEmpleado = async () => {
  const sql = `
    SELECT
      IdTipoEmpleado,
      NombreTipoEmpleado,
      Activo
    FROM TB_CatTipoEmpleado
    WHERE Activo = 1
    ORDER BY NombreTipoEmpleado ASC
  `;

  return query(sql);
};

const obtenerTipoEmpleadoPorCodigo = async (empCod) => {
  const sql = `
    SELECT
      EmpCod,
      EmpTip
    FROM \`uch-workcloud\`.empleados
    WHERE EmpCod = ?
    LIMIT 1
  `;

  const rows = await query(sql, [empCod]);
  return rows[0] || null;
};

const listarIdiomas = async () => {
  const sql = `
    SELECT
      IdIdioma,
      NombreIdioma,
      Activo
    FROM TB_CatIdioma
    WHERE Activo = 1
    ORDER BY NombreIdioma ASC
  `;

  return query(sql);
};

const listarNivelesIdioma = async () => {
  const sql = `
    SELECT
      IdNivelIdioma,
      NombreNivelIdioma,
      Activo
    FROM TB_CatNivelIdioma
    WHERE Activo = 1
    ORDER BY IdNivelIdioma ASC
  `;

  return query(sql);
};

const listarGradosAcademicos = async () => {
  const sql = `
    SELECT
      IdGradoAcademico,
      NombreGradoAcademico,
      Activo
    FROM TB_CatGradoAcademico
    WHERE Activo = 1
    ORDER BY NombreGradoAcademico ASC
  `;

  return query(sql);
};

const listarEstadosAcademicos = async () => {
  const sql = `
    SELECT
      IdEstadoAcademico,
      NombreEstadoAcademico,
      Activo
    FROM TB_CatEstadoAcademico
    WHERE Activo = 1
    ORDER BY IdEstadoAcademico ASC
  `;

  return query(sql);
};

const listarTiposDiplomado = async () => {
  const sql = `
    SELECT
      IdTipoDiplomado,
      NombreTipoDiplomado,
      Activo
    FROM TB_CatTipoDiplomado
    WHERE Activo = 1
    ORDER BY NombreTipoDiplomado ASC
  `;

  return query(sql);
};

const listarNivelesExperienciaDocente = async () => {
  const sql = `
    SELECT
      IdNivelExperienciaDocente,
      NombreNivelExperienciaDocente,
      Activo
    FROM TB_CatNivelExperienciaDocente
    WHERE Activo = 1
    ORDER BY IdNivelExperienciaDocente ASC
  `;

  return query(sql);
};

const listarMetodologiasActivas = async () => {
  const sql = `
    SELECT
      IdMetodologiaActiva,
      NombreMetodologiaActiva,
      Activo
    FROM TB_CatMetodologiaActiva
    WHERE Activo = 1
    ORDER BY NombreMetodologiaActiva ASC
  `;

  return query(sql);
};

const listarPlataformasVirtualesEducativas = async () => {
  const sql = `
    SELECT
      IdPlataformaVirtualEducativa,
      NombrePlataformaVirtualEducativa,
      Activo
    FROM TB_CatPlataformaVirtualEducativa
    WHERE Activo = 1
    ORDER BY NombrePlataformaVirtualEducativa ASC
  `;

  return query(sql);
};

const listarCampus = async () => {
  const sql = `
    SELECT
      IdCampus,
      NombreCampus,
      Activo
    FROM TB_CatCampus
    WHERE Activo = 1
    ORDER BY NombreCampus ASC
  `;

  return query(sql);
};

const listarAreasInteresDocencia = async () => {
  const sql = `
    SELECT
      IdAreaInteresDocencia,
      NombreAreaInteresDocencia,
      Activo
    FROM TB_CatAreaInteresDocencia
    WHERE Activo = 1
    ORDER BY NombreAreaInteresDocencia ASC
  `;

  return query(sql);
};

module.exports = {
  listarTiposSangre,
  listarEstadosCiviles,
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
  listarAreasInteresDocencia
};
