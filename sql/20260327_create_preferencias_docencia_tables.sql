CREATE TABLE TB_CatAreaInteresDocencia (
  IdAreaInteresDocencia smallint(5) unsigned NOT NULL AUTO_INCREMENT,
  NombreAreaInteresDocencia varchar(150) NOT NULL,
  Activo tinyint(1) NOT NULL DEFAULT 1,
  FechaCreacion datetime NOT NULL DEFAULT current_timestamp(),
  FechaActualizacion datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (IdAreaInteresDocencia)
);

CREATE TABLE TB_EmpleadoPreferenciaDocencia (
  IdEmpleadoPreferenciaDocencia int(10) unsigned NOT NULL AUTO_INCREMENT,
  IdEmpleado int(10) unsigned NOT NULL,
  CodigoEmpleado varchar(20) NOT NULL,
  IdAreaInteresDocencia smallint(5) unsigned NOT NULL,
  ModalidadEnsenanza varchar(50) NOT NULL,
  IdCampus int(10) unsigned NOT NULL,
  Activo tinyint(1) NOT NULL DEFAULT 1,
  FechaCreacion datetime NOT NULL DEFAULT current_timestamp(),
  FechaActualizacion datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (IdEmpleadoPreferenciaDocencia)
);

INSERT INTO TB_CatAreaInteresDocencia (NombreAreaInteresDocencia)
VALUES
  ('Administracion'),
  ('Arquitectura'),
  ('Biologia'),
  ('Contabilidad'),
  ('Derecho'),
  ('Economia'),
  ('Educacion'),
  ('Enfermeria'),
  ('Ingenieria Civil'),
  ('Ingenieria en Sistemas'),
  ('Matematicas'),
  ('Medicina'),
  ('Mercadotecnia');
