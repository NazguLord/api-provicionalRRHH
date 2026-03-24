const express = require("express");

const { probarConexion } = require("../config/db");
const authRoutes = require("./auth.routes");
const catalogosRoutes = require("./catalogos.routes");
const usuariosRoutes = require("./usuarios.routes");

const router = express.Router();

router.get("/health", (req, res) => {
  res.json({
    ok: true,
    message: "API funcionando"
  });
});

router.get("/db-test", async (req, res) => {
  try {
    await probarConexion();

    res.json({
      ok: true,
      message: "Conexion a base de datos exitosa"
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al conectar a la base de datos",
      error: error.message
    });
  }
});

router.use("/auth", authRoutes);
router.use("/catalogos", catalogosRoutes);
router.use("/usuarios", usuariosRoutes);

module.exports = router;
