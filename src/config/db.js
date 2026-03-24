const mysql = require("mysql2/promise");

const getDbConfig = () => {
  return {
    host: process.env.DB_HOST || process.env.DB_SERVER,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  };
};

const pool = mysql.createPool(getDbConfig());

const query = async (sql, params = []) => {
  const [rows] = await pool.execute(sql, params);
  return rows;
};

const probarConexion = async () => {
  const connection = await pool.getConnection();
  try {
    await connection.ping();
    return {
      ok: true
    };
  } finally {
    connection.release();
  }
};

module.exports = {
  pool,
  query,
  getDbConfig,
  probarConexion
};
