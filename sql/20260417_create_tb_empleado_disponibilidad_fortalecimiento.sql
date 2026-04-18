CREATE TABLE TB_EmpleadoDisponibilidadFortalecimiento (
  IdEmpleadoDisponibilidadFortalecimiento int(10) unsigned NOT NULL AUTO_INCREMENT,
  IdEmpleado int(10) unsigned NOT NULL,
  CodigoEmpleado varchar(20) NOT NULL,
  Seccion varchar(50) NOT NULL,
  Opcion varchar(150) NOT NULL,
  Activo tinyint(1) NOT NULL DEFAULT 1,
  FechaCreacion datetime NOT NULL DEFAULT current_timestamp(),
  FechaActualizacion datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (IdEmpleadoDisponibilidadFortalecimiento)
);
