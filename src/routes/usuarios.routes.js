const express = require("express");

const usuariosController = require("../controllers/usuarios.controller");

const router = express.Router();

router.get("/", usuariosController.listar);

module.exports = router;
