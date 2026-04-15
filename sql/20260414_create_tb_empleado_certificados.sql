CREATE TABLE TB_EmpleadoCertificados (
  IdEmpleadoCertificado int(10) unsigned NOT NULL AUTO_INCREMENT,
  IdEmpleado int(10) unsigned NOT NULL,
  CodigoEmpleado varchar(20) NOT NULL,
  NombreCertificado varchar(255) NOT NULL,
  RutaDocumentoAdjunto varchar(255) NULL,
  Activo tinyint(1) NOT NULL DEFAULT 1,
  FechaCreacion datetime NOT NULL DEFAULT current_timestamp(),
  FechaActualizacion datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (IdEmpleadoCertificado)
);
