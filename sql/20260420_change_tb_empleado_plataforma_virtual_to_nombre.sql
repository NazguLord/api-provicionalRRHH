ALTER TABLE TB_EmpleadoPlataformaVirtual
  ADD COLUMN NombrePlataformaVirtualEducativa varchar(150) NULL AFTER CodigoEmpleado;

UPDATE TB_EmpleadoPlataformaVirtual epv
LEFT JOIN TB_CatPlataformaVirtualEducativa cpve
  ON cpve.IdPlataformaVirtualEducativa = epv.IdPlataformaVirtualEducativa
SET epv.NombrePlataformaVirtualEducativa = cpve.NombrePlataformaVirtualEducativa
WHERE epv.IdPlataformaVirtualEducativa IS NOT NULL;

ALTER TABLE TB_EmpleadoPlataformaVirtual
  MODIFY COLUMN NombrePlataformaVirtualEducativa varchar(150) NOT NULL;

ALTER TABLE TB_EmpleadoPlataformaVirtual
  DROP COLUMN IdPlataformaVirtualEducativa;
