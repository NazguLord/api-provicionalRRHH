ALTER TABLE TB_EmpleadoExperienciaProfesional
  ADD COLUMN FechaDesde date NULL AFTER Cargo,
  ADD COLUMN FechaHasta date NULL AFTER FechaDesde;
