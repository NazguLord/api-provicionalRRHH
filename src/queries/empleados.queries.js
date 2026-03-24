const { query } = require("../config/db");

const obtenerPorCodigo = async (empCod) => {
  const sql = `
    SELECT
      EmpCod,
      EmpID,
      EmpNom1,
      EmpNom2,
      EmpApe1,
      EmpApe2,
      EmpMail,
      EmpNumCol
    FROM \`uch-workcloud\`.empleados
    WHERE EmpCod = ?
    LIMIT 1
  `;

  const rows = await query(sql, [empCod]);
  return rows[0] || null;
};

module.exports = {
  obtenerPorCodigo
};
