CREATE TABLE TB_CatCampus (
  IdCampus int(10) unsigned NOT NULL,
  NombreCampus varchar(150) NOT NULL,
  Activo tinyint(1) NOT NULL DEFAULT 1,
  FechaCreacion datetime NOT NULL DEFAULT current_timestamp(),
  FechaActualizacion datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (IdCampus)
);

INSERT INTO TB_CatCampus (IdCampus, NombreCampus, Activo)
SELECT
  c.IdCampus,
  c.nombreCampus,
  1
FROM dignidadhumana.TB_campus c;
