ALTER TABLE TB_Empleados
  ADD COLUMN NombreContactoEmergencia varchar(120) NULL AFTER NombreConyuge,
  ADD COLUMN TelefonoContactoEmergencia varchar(20) NULL AFTER NombreContactoEmergencia;
