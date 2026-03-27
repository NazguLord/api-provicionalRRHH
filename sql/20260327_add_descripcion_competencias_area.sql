ALTER TABLE TB_EmpleadoConocimientoClave
  ADD COLUMN Descripcion text NULL AFTER NombreConocimiento;

ALTER TABLE TB_EmpleadoHabilidadRelevante
  ADD COLUMN Descripcion text NULL AFTER NombreHabilidad;
