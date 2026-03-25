const express = require("express");

const empleadosController = require("../controllers/empleados.controller");
const {
  uploadEmpleadoDocumento,
  uploadGradoAcademicoAdjunto
} = require("../middlewares/upload.middleware");

const router = express.Router();

router.post(
  "/:empCod/inicializar",
  empleadosController.inicializarFormularioEmpleado
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
router.delete(
  "/:empCod/grados-academicos/:idEmpleadoGradoAcademico",
  empleadosController.eliminarGradoAcademico
);
router.get("/:empCod", empleadosController.obtenerPorCodigo);

module.exports = router;
