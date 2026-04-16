CREATE TABLE TB_LogDescargaDocumento (
  IdLogDescargaDocumento bigint unsigned NOT NULL AUTO_INCREMENT,
  Descripcion varchar(255) NOT NULL,
  TipoDocumento varchar(100) NOT NULL,
  Ruta varchar(255) NOT NULL,
  UsrId varchar(50) NULL,
  UsrNom varchar(150) NULL,
  UsrUsr varchar(150) NULL,
  UsrApe varchar(150) NULL,
  TotalRegistros int unsigned NOT NULL DEFAULT 0,
  DireccionIp varchar(45) NULL,
  UserAgent varchar(255) NULL,
  FechaCreacion datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (IdLogDescargaDocumento),
  KEY IX_TB_LogDescargaDocumento_FechaCreacion (FechaCreacion),
  KEY IX_TB_LogDescargaDocumento_UsrId (UsrId),
  KEY IX_TB_LogDescargaDocumento_TipoDocumento (TipoDocumento)
);
