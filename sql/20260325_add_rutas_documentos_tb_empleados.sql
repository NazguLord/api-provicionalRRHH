ALTER TABLE TB_Empleados
  ADD COLUMN RutaImagenPerfil varchar(255) NULL AFTER LugarNacimiento,
  ADD COLUMN RutaHojaVida varchar(255) NULL AFTER RutaImagenPerfil,
  ADD COLUMN RutaDocumentoIdentidad varchar(255) NULL AFTER RutaHojaVida;
