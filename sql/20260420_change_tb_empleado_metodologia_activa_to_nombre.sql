ALTER TABLE TB_EmpleadoMetodologiaActiva
  ADD COLUMN NombreMetodologiaActiva varchar(150) NULL AFTER CodigoEmpleado;

UPDATE TB_EmpleadoMetodologiaActiva ema
INNER JOIN TB_CatMetodologiaActiva cma
  ON cma.IdMetodologiaActiva = ema.IdMetodologiaActiva
SET ema.NombreMetodologiaActiva = cma.NombreMetodologiaActiva;

ALTER TABLE TB_EmpleadoMetodologiaActiva
  MODIFY COLUMN NombreMetodologiaActiva varchar(150) NOT NULL;

ALTER TABLE TB_EmpleadoMetodologiaActiva
  DROP COLUMN IdMetodologiaActiva;
