ALTER TABLE TB_EmpleadoIdioma
  ADD COLUMN CodigoEmpleado varchar(20) NULL AFTER IdEmpleado,
  ADD COLUMN IdIdioma smallint(5) unsigned NULL AFTER CodigoEmpleado,
  ADD COLUMN IdNivelIdioma smallint(5) unsigned NULL AFTER IdIdioma;

CREATE TABLE TB_CatMetodologiaActiva (
  IdMetodologiaActiva smallint(5) unsigned NOT NULL AUTO_INCREMENT,
  NombreMetodologiaActiva varchar(150) NOT NULL,
  Activo tinyint(1) NOT NULL DEFAULT 1,
  FechaCreacion datetime NOT NULL DEFAULT current_timestamp(),
  FechaActualizacion datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (IdMetodologiaActiva)
);

CREATE TABLE TB_EmpleadoCompetenciaDigital (
  IdEmpleadoCompetenciaDigital int(10) unsigned NOT NULL AUTO_INCREMENT,
  IdEmpleado int(10) unsigned NOT NULL,
  CodigoEmpleado varchar(20) NOT NULL,
  NombreCompetencia varchar(150) NOT NULL,
  Descripcion text NULL,
  Activo tinyint(1) NOT NULL DEFAULT 1,
  FechaCreacion datetime NOT NULL DEFAULT current_timestamp(),
  FechaActualizacion datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (IdEmpleadoCompetenciaDigital)
);

CREATE TABLE TB_EmpleadoMetodologiaActiva (
  IdEmpleadoMetodologiaActiva int(10) unsigned NOT NULL AUTO_INCREMENT,
  IdEmpleado int(10) unsigned NOT NULL,
  CodigoEmpleado varchar(20) NOT NULL,
  IdMetodologiaActiva smallint(5) unsigned NOT NULL,
  Descripcion text NULL,
  Activo tinyint(1) NOT NULL DEFAULT 1,
  FechaCreacion datetime NOT NULL DEFAULT current_timestamp(),
  FechaActualizacion datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (IdEmpleadoMetodologiaActiva)
);

CREATE TABLE TB_CatPlataformaVirtualEducativa (
  IdPlataformaVirtualEducativa smallint(5) unsigned NOT NULL AUTO_INCREMENT,
  NombrePlataformaVirtualEducativa varchar(150) NOT NULL,
  Activo tinyint(1) NOT NULL DEFAULT 1,
  FechaCreacion datetime NOT NULL DEFAULT current_timestamp(),
  FechaActualizacion datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (IdPlataformaVirtualEducativa)
);

CREATE TABLE TB_EmpleadoPlataformaVirtual (
  IdEmpleadoPlataformaVirtual int(10) unsigned NOT NULL AUTO_INCREMENT,
  IdEmpleado int(10) unsigned NOT NULL,
  CodigoEmpleado varchar(20) NOT NULL,
  IdPlataformaVirtualEducativa smallint(5) unsigned NOT NULL,
  Descripcion text NULL,
  Activo tinyint(1) NOT NULL DEFAULT 1,
  FechaCreacion datetime NOT NULL DEFAULT current_timestamp(),
  FechaActualizacion datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (IdEmpleadoPlataformaVirtual)
);
