CREATE TABLE TB_EmpleadoPreferenciaDocenciaAsignatura (
  IdEmpleadoPreferenciaDocenciaAsignatura int(10) unsigned NOT NULL AUTO_INCREMENT,
  IdEmpleadoPreferenciaDocencia int(10) unsigned NOT NULL,
  NombreAsignaturaPreferenciaDocente varchar(200) NOT NULL,
  IdCampus int(10) unsigned NULL,
  Activo tinyint(1) NOT NULL DEFAULT 1,
  FechaCreacion datetime NOT NULL DEFAULT current_timestamp(),
  FechaActualizacion datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (IdEmpleadoPreferenciaDocenciaAsignatura)
);
