const fs = require("fs");
const path = require("path");

const multer = require("multer");

const MIME_TYPES_PERMITIDOS = new Set([
  "image/jpeg",
  "image/png",
  "image/jpg",
  "image/webp",
  "application/pdf"
]);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const { empCod } = req.params;
    const destino = path.join(
      __dirname,
      "..",
      "..",
      "data",
      "empleados",
      String(empCod),
      "datos-generales"
    );

    fs.mkdirSync(destino, { recursive: true });
    cb(null, destino);
  },
  filename: (req, file, cb) => {
    const { tipoDocumento } = req.params;
    const extension = path.extname(file.originalname || "").toLowerCase();
    const nombreSeguro = String(tipoDocumento)
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-");

    cb(null, `${nombreSeguro}-${Date.now()}${extension}`);
  }
});

const storageGradoAcademico = multer.diskStorage({
  destination: (req, file, cb) => {
    const { empCod } = req.params;
    const destino = path.join(
      __dirname,
      "..",
      "..",
      "data",
      "empleados",
      String(empCod),
      "documentos-academicos"
    );

    fs.mkdirSync(destino, { recursive: true });
    cb(null, destino);
  },
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname || "").toLowerCase();
    cb(null, `grado-academico-${Date.now()}${extension}`);
  }
});

const storageDiplomado = multer.diskStorage({
  destination: (req, file, cb) => {
    const { empCod } = req.params;
    const destino = path.join(
      __dirname,
      "..",
      "..",
      "data",
      "empleados",
      String(empCod),
      "experiencia-profesional"
    );

    fs.mkdirSync(destino, { recursive: true });
    cb(null, destino);
  },
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname || "").toLowerCase();
    cb(null, `diplomado-${Date.now()}${extension}`);
  }
});

const fileFilter = (req, file, cb) => {
  if (!MIME_TYPES_PERMITIDOS.has(file.mimetype)) {
    return cb(
      new Error("Formato de archivo no permitido. Solo se permiten imagenes y PDF.")
    );
  }

  cb(null, true);
};

const uploadEmpleadoDocumento = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024
  }
});

const uploadGradoAcademicoAdjunto = multer({
  storage: storageGradoAcademico,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024
  }
});

const uploadDiplomadoAdjunto = multer({
  storage: storageDiplomado,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024
  }
});

module.exports = {
  uploadEmpleadoDocumento,
  uploadGradoAcademicoAdjunto,
  uploadDiplomadoAdjunto
};
