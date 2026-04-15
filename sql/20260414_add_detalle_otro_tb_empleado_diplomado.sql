ALTER TABLE TB_EmpleadoDiplomado
  ADD COLUMN NombreDiplomado varchar(255) DEFAULT NULL AFTER IdTipoDiplomado,
  ADD COLUMN Institucion varchar(255) DEFAULT NULL AFTER NombreDiplomado,
  ADD COLUMN NumeroHoras int(10) unsigned DEFAULT NULL AFTER Institucion,
  ADD COLUMN FechaInicio date DEFAULT NULL AFTER NumeroHoras,
  ADD COLUMN FechaFinal date DEFAULT NULL AFTER FechaInicio;
