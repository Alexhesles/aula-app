-- ============================================================
-- AULA · Migración 0004 — Datos demo para probar el pase de lista
-- Te asigna como maestro titular de un grupo con 6 alumnos.
--
-- ⚠️ ANTES DE CORRER: regístrate en la app (magic link) al menos una vez,
--    para que exista tu profile. Luego cambia el correo de abajo por el tuyo.
-- ============================================================

do $$
declare
  v_school uuid;
  v_group  uuid;
  v_me     uuid;
begin
  -- 👉 CAMBIA este correo por el que usaste para entrar a la app:
  select id into v_me from auth.users where email = 'TU-CORREO@ejemplo.com';

  if v_me is null then
    raise exception 'No encontré ese correo en auth.users. Regístrate primero en la app.';
  end if;

  -- Escuela demo
  insert into public.schools (name, type, cycle)
  values ('Escuela Piloto', 'privada', '2025-2026')
  returning id into v_school;

  -- Tu perfil: maestro de esa escuela
  update public.profiles
  set role = 'maestro', school_id = v_school,
      full_name = coalesce(full_name, 'Maestra Demo')
  where id = v_me;

  -- Grupo
  insert into public.groups (school_id, name, grade, cycle, room)
  values (v_school, '3°A', '3', '2025-2026', '12')
  returning id into v_group;

  -- Te asigna como titular
  insert into public.group_teachers (group_id, teacher_id, is_titular)
  values (v_group, v_me, true);

  -- 6 alumnos demo
  insert into public.students (school_id, group_id, full_name) values
    (v_school, v_group, 'Ana García López'),
    (v_school, v_group, 'Diego Hernández Ruiz'),
    (v_school, v_group, 'Fernanda Martínez Cruz'),
    (v_school, v_group, 'Mateo Sánchez Díaz'),
    (v_school, v_group, 'Sofía Ramírez Torres'),
    (v_school, v_group, 'Valentina Flores Mora');

  raise notice 'Demo lista. Grupo 3°A con 6 alumnos, asignado a %', v_me;
end $$;
