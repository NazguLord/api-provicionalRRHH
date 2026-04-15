const express = require("express");

const catalogosController = require("../controllers/catalogos.controller");

const router = express.Router();

router.get("/tipos-sangre", catalogosController.listarTiposSangre);
router.get("/estados-civiles", catalogosController.listarEstadosCiviles);
router.get("/generos", catalogosController.listarGeneros);
router.get("/tipos-empleado", catalogosController.listarTiposEmpleado);
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
router.get(
  "/metodologias-activas",
  catalogosController.listarMetodologiasActivas
);
router.get(
  "/plataformas-virtuales-educativas",
  catalogosController.listarPlataformasVirtualesEducativas
);
router.get("/campus", catalogosController.listarCampus);
router.get("/universidades", catalogosController.listarUniversidades);
router.get(
  "/areas-interes-docencia",
  catalogosController.listarAreasInteresDocencia
);
router.get("/cursos", catalogosController.listarCursos);

module.exports = router;
