-- Limpia filas huerfanas en public.users cuya cuenta de auth ya no existe (incluyendo pruebas como GAEL)
delete from public.users
where id not in (select id from auth.users);

-- Funcion que propaga la eliminacion de una cuenta en auth.users hacia public.users
create or replace function public.handle_auth_user_delete()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.users where id = old.id;
  return old;
end;
$$;

-- Disparador que ejecuta la limpieza automatica al borrar cualquier usuario en auth.users
drop trigger if exists on_auth_user_deleted on auth.users;

create trigger on_auth_user_deleted
  after delete on auth.users
  for each row execute function public.handle_auth_user_delete();
