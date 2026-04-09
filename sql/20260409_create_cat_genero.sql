CREATE TABLE TB_CatGenero (
  IdGenero smallint(5) unsigned NOT NULL AUTO_INCREMENT,
  NombreGenero varchar(50) NOT NULL,
  Activo tinyint(1) NOT NULL DEFAULT 1,
  FechaCreacion datetime NOT NULL DEFAULT current_timestamp(),
  FechaActualizacion datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (IdGenero)
);

INSERT INTO TB_CatGenero (NombreGenero)
VALUES
  ('Masculino'),
  ('Femenino');
