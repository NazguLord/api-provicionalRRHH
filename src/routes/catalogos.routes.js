const express = require("express");

const catalogosController = require("../controllers/catalogos.controller");

const router = express.Router();

router.get("/tipos-sangre", catalogosController.listarTiposSangre);
router.get("/estados-civiles", catalogosController.listarEstadosCiviles);
router.get("/tipos-empleado/:empCod", catalogosController.obtenerTipoEmpleadoPorCodigo);
router.get("/idiomas", catalogosController.listarIdiomas);
router.get("/niveles-idioma", catalogosController.listarNivelesIdioma);
router.get("/grados-academicos", catalogosController.listarGradosAcademicos);
router.get("/estados-academicos", catalogosController.listarEstadosAcademicos);
router.get("/tipos-diplomado", catalogosController.listarTiposDiplomado);
router.get(
  "/niveles-experiencia-docente",
  catalogosController.listarNivelesExperienciaDocente
);

module.exports = router;
