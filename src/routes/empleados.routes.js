const express = require("express");

const empleadosController = require("../controllers/empleados.controller");
const {
  uploadEmpleadoDocumento
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
router.get("/:empCod", empleadosController.obtenerPorCodigo);

module.exports = router;
