const express = require("express");

const empleadosController = require("../controllers/empleados.controller");

const router = express.Router();

router.get("/:empCod", empleadosController.obtenerPorCodigo);

module.exports = router;
