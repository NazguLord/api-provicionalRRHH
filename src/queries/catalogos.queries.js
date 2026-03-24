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

module.exports = {
  listarTiposSangre,
  listarEstadosCiviles,
  listarTiposEmpleado,
  listarIdiomas,
  listarNivelesIdioma,
  listarGradosAcademicos
};
