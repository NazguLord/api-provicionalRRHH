ALTER TABLE TB_EmpleadoExperienciaDocente
  ADD COLUMN NombreNivelExperienciaDocente varchar(150) NULL AFTER CodigoEmpleado;

UPDATE TB_EmpleadoExperienciaDocente eed
INNER JOIN TB_CatNivelExperienciaDocente cned
  ON cned.IdNivelExperienciaDocente = eed.IdNivelExperienciaDocente
SET eed.NombreNivelExperienciaDocente = cned.NombreNivelExperienciaDocente;

ALTER TABLE TB_EmpleadoExperienciaDocente
  MODIFY COLUMN NombreNivelExperienciaDocente varchar(150) NOT NULL;

ALTER TABLE TB_EmpleadoExperienciaDocente
  DROP COLUMN IdNivelExperienciaDocente;
