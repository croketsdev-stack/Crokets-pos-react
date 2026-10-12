-- Agrega el nombre completo del colaborador a public.users.
--
-- La tabla `users` solo guardaba `username` (login) y no un nombre legible para
-- mostrar en la pantalla de Usuarios y Permisos. Se agrega NULLABLE para no
-- romper las filas existentes: el render usa el nombre de usuario como respaldo
-- cuando la columna viene vacia.

ALTER TABLE "public"."users" ADD COLUMN IF NOT EXISTS "name" text;
