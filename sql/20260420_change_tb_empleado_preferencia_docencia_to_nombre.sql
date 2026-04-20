ALTER TABLE TB_EmpleadoPreferenciaDocencia
  ADD COLUMN NombreAreaInteresDocencia varchar(150) NULL AFTER CodigoEmpleado;

UPDATE TB_EmpleadoPreferenciaDocencia epd
INNER JOIN TB_CatAreaInteresDocencia caid
  ON caid.IdAreaInteresDocencia = epd.IdAreaInteresDocencia
SET epd.NombreAreaInteresDocencia = caid.NombreAreaInteresDocencia;

ALTER TABLE TB_EmpleadoPreferenciaDocencia
  MODIFY COLUMN NombreAreaInteresDocencia varchar(150) NOT NULL;

ALTER TABLE TB_EmpleadoPreferenciaDocencia
  DROP COLUMN IdAreaInteresDocencia;
