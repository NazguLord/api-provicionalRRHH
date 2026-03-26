const express = require("express");

const empleadosController = require("../controllers/empleados.controller");
const {
  uploadEmpleadoDocumento,
  uploadGradoAcademicoAdjunto,
  uploadDiplomadoAdjunto
} = require("../middlewares/upload.middleware");

const router = express.Router();

router.post(
  "/:empCod/inicializar",
  empleadosController.inicializarFormularioEmpleado
);
router.get(
  "/:empCod/estado-actualizacion/:tipoEmpleado",
  empleadosController.obtenerEstadoActualizacion
);
router.get("/:empCod/formulario", empleadosController.obtenerFormularioEmpleado);
router.patch(
  "/:empCod/informacion-personal",
  empleadosController.actualizarInformacionPersonal
);
router.post(
  "/:empCod/documentos/:tipoDocumento",
  uploadEmpleadoDocumento.single("archivo"),
  empleadosController.subirDocumentoEmpleado
);
router.get(
  "/:empCod/grados-academicos",
  empleadosController.listarGradosAcademicos
);
router.post(
  "/:empCod/grados-academicos",
  uploadGradoAcademicoAdjunto.single("archivo"),
  empleadosController.crearGradoAcademico
);
router.patch(
  "/:empCod/grados-academicos/:idEmpleadoGradoAcademico",
  uploadGradoAcademicoAdjunto.single("archivo"),
  empleadosController.actualizarGradoAcademico
);
router.delete(
  "/:empCod/grados-academicos/:idEmpleadoGradoAcademico",
  empleadosController.eliminarGradoAcademico
);
router.get(
  "/:empCod/experiencias-profesionales",
  empleadosController.listarExperienciasProfesionales
);
router.post(
  "/:empCod/experiencias-profesionales",
  empleadosController.crearExperienciaProfesional
);
router.patch(
  "/:empCod/experiencias-profesionales/:idEmpleadoExperienciaProfesional",
  empleadosController.actualizarExperienciaProfesional
);
router.delete(
  "/:empCod/experiencias-profesionales/:idEmpleadoExperienciaProfesional",
  empleadosController.eliminarExperienciaProfesional
);
router.get("/:empCod/diplomados", empleadosController.listarDiplomados);
router.post(
  "/:empCod/diplomados",
  uploadDiplomadoAdjunto.single("archivo"),
  empleadosController.crearDiplomado
);
router.patch(
  "/:empCod/diplomados/:idEmpleadoDiplomado",
  uploadDiplomadoAdjunto.single("archivo"),
  empleadosController.actualizarDiplomado
);
router.delete(
  "/:empCod/diplomados/:idEmpleadoDiplomado",
  empleadosController.eliminarDiplomado
);
router.get("/:empCod", empleadosController.obtenerPorCodigo);

module.exports = router;
