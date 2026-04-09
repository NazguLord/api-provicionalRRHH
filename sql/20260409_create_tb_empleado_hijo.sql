CREATE TABLE TB_EmpleadoHijo (
  IdEmpleadoHijo int(10) unsigned NOT NULL AUTO_INCREMENT,
  IdEmpleado int(10) unsigned NOT NULL,
  CodigoEmpleado varchar(20) NOT NULL,
  NombreCompleto varchar(150) NULL,
  Sexo varchar(20) NULL,
  FechaNacimiento date NULL,
  Activo tinyint(1) NOT NULL DEFAULT 1,
  FechaCreacion datetime NOT NULL DEFAULT current_timestamp(),
  FechaActualizacion datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (IdEmpleadoHijo)
);
